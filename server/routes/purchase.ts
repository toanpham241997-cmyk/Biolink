import type { Request, Response } from "express";
import { supabaseAdmin } from "../supabaseAdmin";

type Coupon = { code: string; type: "percent" | "fixed"; value: number };

const COUPONS: Coupon[] = [
  { code: "HVH10", type: "percent", value: 10 },
  { code: "GIAM5K", type: "fixed", value: 5000 },
];

function calcDiscount(total: number, couponCode?: string | null) {
  if (!couponCode) return { discount: 0, coupon: null as string | null };
  const c = COUPONS.find((x) => x.code.toLowerCase() === couponCode.toLowerCase());
  if (!c) return { discount: 0, coupon: null };
  const discount = c.type === "percent" ? Math.floor((total * c.value) / 100) : c.value;
  return { discount: Math.min(discount, total), coupon: c.code };
}

export async function purchase(req: Request, res: Response) {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (!token) return res.status(401).json({ message: "Missing token" });

    // Verify JWT -> get user
    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr || !userData?.user) return res.status(401).json({ message: "Unauthorized" });

    const userId = userData.user.id;

    const { itemId, quantity, coupon } = req.body || {};
    const qty = Number(quantity);
    if (!itemId || !Number.isFinite(qty) || qty < 1 || qty > 99) {
      return res.status(400).json({ message: "Invalid payload" });
    }

    // TODO: giá item nên lấy từ DB products thật (khuyến nghị).
    // Tạm thời: map demo giá theo itemId
    const PRICE_MAP: Record<string, number> = {
      "demo-item-1": 49000,
    };
    const price = PRICE_MAP[itemId];
    if (!price) return res.status(404).json({ message: "Item not found" });

    // Lấy profile
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
      return res.status(400).json({ message: "Không đủ số dư" });
    }

    const newBalance = balance - payable;

    // Trừ tiền (atomic-ish: update theo id; nếu cần tuyệt đối atomic -> dùng RPC/transaction Postgres)
    const { error: uErr } = await supabaseAdmin
      .from("profiles")
      .update({ balance: newBalance })
      .eq("id", userId);

    if (uErr) return res.status(500).json({ message: "Update balance failed" });

    // Ghi order (khuyến nghị tạo bảng orders)
    // Ở đây demo: trả luôn kết quả
    return res.json({
      ok: true,
      paid: payable,
      total,
      discount,
      coupon: applied,
      newBalance,
      itemId,
      quantity: qty,
    });
  } catch (e: any) {
    return res.status(500).json({ message: e?.message || "Server error" });
  }
      }
