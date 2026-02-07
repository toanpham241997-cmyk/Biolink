import type { Request, Response } from "express";
import { supabaseAdmin } from "../supabaseAdmin";
import { thegiareSubmitCard } from "../services/thegiare";

function maskSerial(serial: string) {
  const s = serial.trim();
  if (s.length <= 4) return "****";
  return "*".repeat(Math.max(0, s.length - 4)) + s.slice(-4);
}

function pinLast4(pin: string) {
  const p = pin.trim();
  return p.slice(-4);
}

function pickStr(v: any) {
  if (v === undefined || v === null) return "";
  return String(v);
}
function pickNum(v: any) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

async function getUserIdFromBearer(req: Request) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return { userId: null as string | null, token: "" };

  const { data: userData, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !userData?.user) return { userId: null, token };
  return { userId: userData.user.id, token };
}

/** POST /api/topup/card/create */
export async function topupCardCreate(req: Request, res: Response) {
  try {
    const { userId } = await getUserIdFromBearer(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { telco, amount, serial, pin } = req.body || {};
    const a = Number(amount);

    if (!telco || !Number.isFinite(a) || a < 10000) {
      return res.status(400).json({ message: "Payload không hợp lệ" });
    }
    if (!serial || !pin) return res.status(400).json({ message: "Thiếu serial/pin" });

    // lấy profile để check tồn tại
    const { data: profile, error: pErr } = await supabaseAdmin
      .from("profiles")
      .select("id,status")
      .eq("id", userId)
      .single();

    if (pErr || !profile) return res.status(404).json({ message: "Profile not found" });
    if (profile.status === "locked") return res.status(403).json({ message: "Account locked" });

    // tạo topup pending
    const { data: topup, error: tErr } = await supabaseAdmin
      .from("topups")
      .insert({
        user_id: userId,
        provider: "thegiare",
        method: "card",
        status: "processing",
        telco: String(telco),
        face_value: Math.floor(a),
        serial_masked: maskSerial(String(serial)),
        pin_last4: pinLast4(String(pin)),
        amount: 0,
        fee: 0,
      })
      .select("*")
      .single();

    if (tErr || !topup) return res.status(500).json({ message: "Create topup failed" });

    const callbackUrl = `${process.env.APP_BASE_URL}/api/topup/card/callback`;
    const requestId = topup.id; // dùng luôn topup.id làm request_id

    // gửi sang web đổi thẻ
    const submit = await thegiareSubmitCard({
      telco: String(telco),
      amount: Math.floor(a),
      serial: String(serial),
      pin: String(pin),
      request_id: requestId,
      callback_url: callbackUrl,
    });

    // lưu raw response
    await supabaseAdmin
      .from("topups")
      .update({
        request_id: requestId,
        raw: submit.json ?? null,
        note: submit.ok ? "Đã gửi sang web đổi thẻ" : "Gửi sang web đổi thẻ thất bại",
        status: submit.ok ? "processing" : "failed",
      })
      .eq("id", topup.id);

    if (!submit.ok) {
      return res.status(400).json({
        message: submit.json?.message || "Đổi thẻ thất bại (gửi đi không thành công)",
        topupId: topup.id,
      });
    }

    return res.json({
      ok: true,
      message: "Đã gửi thẻ, chờ xử lý...",
      topupId: topup.id,
      callbackUrl,
      providerResponse: submit.json,
    });
  } catch (e: any) {
    return res.status(500).json({ message: e?.message || "Server error" });
  }
}

/** GET /api/topup/card/callback */
export async function topupCardCallback(req: Request, res: Response) {
  try {
    const q = req.query || {};

    // linh hoạt nhiều field
    const requestId =
      pickStr(q.request_id) ||
      pickStr(q.requestId) ||
      pickStr(q.order_id) ||
      pickStr(q.trans_id) ||
      pickStr(q.id);

    if (!requestId) return res.status(400).send("missing_request_id");

    const statusRaw = (pickStr(q.status) || pickStr(q.state) || pickStr(q.result)).toLowerCase();
    const amount =
      pickNum(q.amount) ||
      pickNum(q.value) ||
      pickNum(q.real_amount) ||
      pickNum(q.received) ||
      0;

    const providerRef =
      pickStr(q.trans_id) || pickStr(q.transaction_id) || pickStr(q.ref) || null;

    const note = pickStr(q.message) || pickStr(q.note) || null;

    // lấy topup
    const { data: topup, error: tErr } = await supabaseAdmin
      .from("topups")
      .select("id,user_id,status")
      .eq("id", requestId)
      .single();

    if (tErr || !topup) return res.status(404).send("topup_not_found");

    // idempotent
    const current = String(topup.status || "").toLowerCase();
    if (current === "success" || current === "failed") return res.send("ok");

    const ok = statusRaw === "success" || statusRaw === "done" || statusRaw === "1";
    const failed = statusRaw === "failed" || statusRaw === "error" || statusRaw === "0";

    if (failed) {
      await supabaseAdmin
        .from("topups")
        .update({
          status: "failed",
          amount: 0,
          provider_ref: providerRef,
          note: note || "failed",
          raw: q as any,
        })
        .eq("id", requestId);

      return res.send("ok");
    }

    if (!ok) {
      await supabaseAdmin
        .from("topups")
        .update({
          status: "processing",
          provider_ref: providerRef,
          note: note || "processing",
          raw: q as any,
        })
        .eq("id", requestId);

      return res.send("ok");
    }

    const received = Math.max(0, Math.floor(amount));
    if (received <= 0) {
      await supabaseAdmin
        .from("topups")
        .update({
          status: "failed",
          amount: 0,
          provider_ref: providerRef,
          note: "invalid_amount",
          raw: q as any,
        })
        .eq("id", requestId);

      return res.send("ok");
    }

    // update topup success
    await supabaseAdmin
      .from("topups")
      .update({
        status: "success",
        amount: received,
        provider_ref: providerRef,
        note: note || "success",
        raw: q as any,
      })
      .eq("id", requestId);

    // cộng tiền
    const { error: rpcErr } = await supabaseAdmin.rpc("add_balance", {
      uid: topup.user_id,
      amount: received,
    });

    if (rpcErr) {
      await supabaseAdmin
        .from("topups")
        .update({ note: `Cộng tiền lỗi: ${rpcErr.message}` })
        .eq("id", requestId);
    }

    return res.send("ok");
  } catch (e: any) {
    return res.status(500).send(e?.message || "server_error");
  }
}

/** GET /api/topup/history */
export async function topupHistory(req: Request, res: Response) {
  try {
    const { userId } = await getUserIdFromBearer(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const limit = Math.min(200, Math.max(1, Number(req.query.limit || 50)));
    const status = String(req.query.status || "").trim();

    let q = supabaseAdmin
      .from("topups")
      .select("id,provider,method,status,amount,fee,telco,face_value,serial_masked,pin_last4,provider_ref,note,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (status) q = q.eq("status", status);

    const { data, error } = await q;
    if (error) return res.status(400).json({ message: error.message });

    return res.json({ ok: true, items: data || [] });
  } catch (e: any) {
    return res.status(500).json({ message: e?.message || "Server error" });
  }
}
