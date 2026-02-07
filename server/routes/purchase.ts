import type { Request, Response } from "express";
import { supabaseAdmin } from "../supabaseAdmin";

type Coupon = { code: string; type: "percent" | "fixed"; value: number };

const COUPONS: Coupon[] = [
  { code: "HVH10", type: "percent", value: 10 },
  { code: "GIAM5K", type: "fixed", value: 5000 },
];

function calcDiscount(total: number, couponCode?: string | null) {
  if (!couponCode) return { discount: 0, coupon: null as string | null };

  const c = COUPONS.find((x) => x.code.toLowerCase() === String(couponCode).toLowerCase());
  if (!c) return { discount: 0, coupon: null };

  const discount = c.type === "percent" ? Math.floor((total * c.value) / 100) : c.value;
  return { discount: Math.min(discount, total), coupon: c.code };
}

/**
 * Nếu bạn có downloadUrl theo itemId thì map ở đây
 * (sau này nên lấy từ DB products)
 */
const DOWNLOAD_MAP: Record<string, string> = {
  "demo-item-1": "https://example.com/download/demo-item-1.zip",
};

/**
 * Giá demo theo itemId (sau này nên lấy từ DB)
 */
const PRICE_MAP: Record<string, number> = {
  "demo-item-1": 49000,
};

export async function purchase(req: Request, res: Response) {
  try {
    // 1) Verify token
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (!token) return res.status(401).json({ message: "Missing token" });

    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr || !userData?.user) return res.status(401).json({ message: "Unauthorized" });

    const userId = userData.user.id;

    // 2) Validate body
    const { itemId, quantity, coupon } = req.body || {};
    const qty = Number(quantity);

    if (!itemId || typeof itemId !== "string" || !Number.isFinite(qty) || qty < 1 || qty > 99) {
      return res.status(400).json({ message: "Invalid payload" });
    }

    // 3) Get item price (demo)
    const price = PRICE_MAP[itemId];
    if (!price) return res.status(404).json({ message: "Item not found" });

    const itemTitle = itemId; // nếu có title thật thì thay ở đây
    const downloadUrl = DOWNLOAD_MAP[itemId] || null;

    // 4) Get profile
    const { data: profile, error: pErr } = await supabaseAdmin
      .from("profiles")
      .select("id,balance,status,role")
      .eq("id", userId)
      .single();

    if (pErr || !profile) return res.status(404).json({ message: "Profile not found" });
    if (profile.status === "locked") return res.status(403).json({ message: "Account locked" });

    const total = price * qty;
    const { discount, coupon: applied } = calcDiscount(total, coupon ?? null);
    const payable = Math.max(0, total - discount);

    const balance = Number(profile.balance ?? 0);
    if (balance < payable) {
      // trả thêm info để client show modal "không đủ số dư"
      return res.status(400).json({
        message: "Không đủ số dư",
        code: "INSUFFICIENT_BALANCE",
        balance,
        payable,
        missing: Math.max(0, payable - balance),
      });
    }

    // 5) Trừ tiền "an toàn hơn" (atomic-ish)
    // Update chỉ thành công nếu balance hiện tại >= payable (tránh race condition)
    // Nếu có 2 request cùng lúc, request thứ 2 sẽ fail điều kiện gte.
    const { data: updatedProfiles, error: uErr } = await supabaseAdmin
      .from("profiles")
      .update({ balance: balance - payable })
      .eq("id", userId)
      .gte("balance", payable) // ✅ điều kiện quan trọng
      .select("balance");

    if (uErr) return res.status(500).json({ message: "Update balance failed" });

    // Nếu không update được dòng nào => balance vừa bị thay đổi / không đủ tiền (race)
    const newBalance = Number(updatedProfiles?.[0]?.balance ?? NaN);
    if (!Number.isFinite(newBalance)) {
      return res.status(400).json({
        message: "Không đủ số dư",
        code: "INSUFFICIENT_BALANCE",
        balance,
        payable,
      });
    }

    // 6) Ghi lịch sử mua hàng vào purchases
    const { data: purchaseRow, error: insErr } = await supabaseAdmin
      .from("purchases")
      .insert({
        user_id: userId,
        item_id: itemId,
        item_title: itemTitle,
        quantity: qty,
        unit_price: price,
        total: payable,
        coupon: applied,
        status: "paid",
        download_url: downloadUrl,
      })
      .select("id,created_at")
      .single();

    // Nếu insert purchases lỗi: nên hoàn tiền lại để không bị trừ tiền mất
    if (insErr) {
      // rollback balance (best effort)
      await supabaseAdmin
        .from("profiles")
        .update({ balance: newBalance + payable })
        .eq("id", userId);

      return res.status(500).json({
        message: "Create purchase history failed",
        detail: insErr.message,
      });
    }

    // 7) Done
    return res.json({
      ok: true,
      purchaseId: purchaseRow?.id,
      createdAt: purchaseRow?.created_at,

      itemId,
      itemTitle,
      quantity: qty,

      unitPrice: price,
      total,
      discount,
      coupon: applied,
      paid: payable,

      balanceBefore: balance,
      newBalance,

      downloadUrl,
    });
  } catch (e: any) {
    return res.status(500).json({ message: e?.message || "Server error" });
  }
}
