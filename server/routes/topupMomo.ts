import type { Request, Response } from "express";
import { supabaseAdmin } from "../supabaseAdmin";
import { signMomo } from "../services/momo";

const APP_BASE_URL = process.env.APP_BASE_URL || "";
const PARTNER_CODE = process.env.MOMO_PARTNER_CODE || "";
const ACCESS_KEY = process.env.MOMO_ACCESS_KEY || "";
const SECRET_KEY = process.env.MOMO_SECRET_KEY || "";
const MOMO_ENDPOINT = process.env.MOMO_ENDPOINT || ""; // ví dụ: https://test-payment.momo.vn/v2/gateway/api/create

function mustEnv() {
  if (!APP_BASE_URL || !PARTNER_CODE || !SECRET_KEY || !MOMO_ENDPOINT) {
    throw new Error("Missing MoMo env (APP_BASE_URL/MOMO_PARTNER_CODE/MOMO_SECRET_KEY/MOMO_ENDPOINT)");
  }
}

// 1) user bấm “Nạp MoMo” -> server tạo order -> trả payUrl/qrData/deeplink
export async function momoCreate(req: Request, res: Response) {
  try {
    mustEnv();

    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (!token) return res.status(401).json({ message: "Missing token" });

    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr || !userData?.user) return res.status(401).json({ message: "Unauthorized" });
    const userId = userData.user.id;

    const amount = Number(req.body?.amount);
    if (!Number.isFinite(amount) || amount < 1000) {
      return res.status(400).json({ message: "Amount invalid (>= 1000)" });
    }

    const orderId = `TOPUP_${userId}_${Date.now()}`;
    const requestId = orderId;

    const ipnUrl = `${APP_BASE_URL}/api/topup/momo/ipn`;
    const redirectUrl = `${APP_BASE_URL}/topup/momo/return`;

    // Lưu pending trước
    const { data: tx, error: insErr } = await supabaseAdmin
      .from("topup_transactions")
      .insert({
        user_id: userId,
        provider: "momo",
        amount: Math.floor(amount),
        status: "pending",
        order_id: orderId,
        request_id: requestId,
      })
      .select("*")
      .single();

    if (insErr) return res.status(500).json({ message: insErr.message });

    // === Payload MoMo (tuỳ model docs, bạn chỉnh field cho đúng model bạn dùng) ===
    // Các field như payUrl/deeplink/qrCodeUrl được MoMo trả về theo docs. 1
    const orderInfo = `Nap tien MoMo: ${amount}`;
    const extraData = "";

    // rawSignature PHẢI đúng thứ tự theo docs/model MoMo của bạn.
    // Ví dụ kiểu phổ biến (bạn đối chiếu docs MoMo bạn đang dùng):
    const rawSignature =
      `accessKey=${ACCESS_KEY}` +
      `&amount=${Math.floor(amount)}` +
      `&extraData=${extraData}` +
      `&ipnUrl=${ipnUrl}` +
      `&orderId=${orderId}` +
      `&orderInfo=${orderInfo}` +
      `&partnerCode=${PARTNER_CODE}` +
      `&redirectUrl=${redirectUrl}` +
      `&requestId=${requestId}` +
      `&requestType=captureWallet`;

    const signature = signMomo(SECRET_KEY, rawSignature);

    const momoBody: any = {
      partnerCode: PARTNER_CODE,
      partnerName: "Biolink",
      storeId: "BiolinkStore",
      requestId,
      amount: Math.floor(amount),
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      lang: "vi",
      requestType: "captureWallet",
      extraData,
      signature,
    };

    const momoRes = await fetch(MOMO_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(momoBody),
    });

    const momoJson = await momoRes.json().catch(() => ({}));

    if (!momoRes.ok) {
      // update failed
      await supabaseAdmin
        .from("topup_transactions")
        .update({ status: "failed", message: momoJson?.message || "MoMo create failed", raw: momoJson })
        .eq("id", tx.id);

      return res.status(400).json({ message: momoJson?.message || "MoMo create failed", raw: momoJson });
    }

    // lưu raw
    await supabaseAdmin
      .from("topup_transactions")
      .update({ raw: momoJson })
      .eq("id", tx.id);

    return res.json({
      ok: true,
      orderId,
      requestId,
      // MoMo thường trả payUrl / deeplink / qrCodeUrl (qr data) tuỳ model. 2
      payUrl: momoJson?.payUrl,
      deeplink: momoJson?.deeplink,
      qrData: momoJson?.qrCodeUrl, // thường là dữ liệu QR (không phải ảnh)
      momo: momoJson,
    });
  } catch (e: any) {
    return res.status(500).json({ message: e?.message || "Server error" });
  }
}

// 2) MoMo gọi IPN -> verify signature -> cộng tiền + cập nhật status
export async function momoIPN(req: Request, res: Response) {
  try {
    mustEnv();

    const body = req.body || {};
    const orderId = body?.orderId;
    const resultCode = Number(body?.resultCode); // 0 = success (tuỳ docs/model)
    const amount = Number(body?.amount);
    const receivedSig = body?.signature;

    if (!orderId) return res.status(400).json({ message: "Missing orderId" });

    // TODO: verify signature theo docs/model MoMo bạn dùng (rawSignature IPN khác create).
    // Nếu bạn chưa có rawSignature IPN: tạm chấp nhận nhưng KHÔNG KHUYẾN NGHỊ.
    // -> Bạn nên đối chiếu docs để build rawSignature IPN đúng rồi signMomo() so sánh.
    // 3

    // Lấy transaction pending
    const { data: tx, error: txErr } = await supabaseAdmin
      .from("topup_transactions")
      .select("*")
      .eq("order_id", orderId)
      .single();

    if (txErr || !tx) return res.status(404).json({ message: "Transaction not found" });

    // tránh cộng tiền 2 lần
    if (tx.status === "success") return res.json({ ok: true });

    if (!Number.isFinite(amount) || amount <= 0) {
      await supabaseAdmin
        .from("topup_transactions")
        .update({ status: "failed", message: "Invalid amount", raw: body })
        .eq("id", tx.id);
      return res.json({ ok: true });
    }

    if (resultCode === 0) {
      // cộng tiền vào profiles.balance
      const { data: profile, error: pErr } = await supabaseAdmin
        .from("profiles")
        .select("id,balance")
        .eq("id", tx.user_id)
        .single();

      if (pErr || !profile) {
        await supabaseAdmin
          .from("topup_transactions")
          .update({ status: "failed", message: "Profile not found", raw: body })
          .eq("id", tx.id);
        return res.json({ ok: true });
      }

      const oldBal = Number(profile.balance ?? 0);
      const newBal = oldBal + Math.floor(amount);

      await supabaseAdmin.from("profiles").update({ balance: newBal }).eq("id", tx.user_id);

      await supabaseAdmin
        .from("topup_transactions")
        .update({ status: "success", message: "Topup success", raw: body })
        .eq("id", tx.id);

      return res.json({ ok: true });
    } else {
      await supabaseAdmin
        .from("topup_transactions")
        .update({ status: "failed", message: body?.message || "MoMo failed", raw: body })
        .eq("id", tx.id);

      return res.json({ ok: true });
    }
  } catch (e: any) {
    return res.status(500).json({ message: e?.message || "Server error" });
  }
}
