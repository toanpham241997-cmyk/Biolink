import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useRoute } from "wouter";
import {
  ArrowLeft,
  ShoppingCart,
  Tag,
  XCircle,
  X,
  Loader2,
  Info,
  CheckCircle2,
  AlertTriangle,
  Wallet,
} from "lucide-react";

import { parents, childs, formatVND } from "./shop.data";
import { supabase } from "../lib/supabaseClient";

/** helpers */
function cn(...cls: (string | false | undefined | null)[]) {
  return cls.filter(Boolean).join(" ");
}

function clampInt(v: string, min: number, max: number) {
  const x = Number(v);
  if (!Number.isFinite(x)) return min;
  return Math.max(min, Math.min(max, Math.floor(x)));
}

type SwalKind = "info" | "success" | "error" | "warning" | "custom";

type SwalState =
  | { open: false }
  | {
      open: true;
      variant: SwalKind;
      title: string;
      message?: string;
      children?: React.ReactNode;
      hideOk?: boolean;
      /** prevent close while busy */
      lockClose?: boolean;
    };

function SwalModal(props: { state: SwalState; onClose: () => void }) {
  const { state, onClose } = props;

  useEffect(() => {
    if (!state.open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.open, onClose]);

  if (!state.open) return null;

  const icon = (() => {
    switch (state.variant) {
      case "success":
        return <CheckCircle2 className="w-10 h-10 text-emerald-600" />;
      case "error":
        return <XCircle className="w-10 h-10 text-rose-600" />;
      case "warning":
        return <AlertTriangle className="w-10 h-10 text-amber-600" />;
      case "custom":
      default:
        return <Info className="w-10 h-10 text-sky-600" />;
    }
  })();

  const canClose = !(state.open && state.lockClose);

  return (
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center">
      <div
        className={cn("absolute inset-0 bg-black/45 transition-opacity", canClose ? "cursor-pointer" : "cursor-not-allowed")}
        onClick={canClose ? onClose : undefined}
        aria-hidden
      />
      <div className="relative w-full sm:max-w-md bg-white rounded-t-[28px] sm:rounded-[28px] border-[3px] border-sky-400 shadow-[0_20px_60px_rgba(2,132,199,0.25)] p-4 m-0 sm:m-3">
        <button
          onClick={canClose ? onClose : undefined}
          className={cn(
            "absolute right-3 top-3 w-10 h-10 rounded-2xl bg-sky-50 border-2 border-sky-200 flex items-center justify-center transition",
            canClose ? "hover:bg-sky-100" : "opacity-50"
          )}
          aria-label="Close"
          type="button"
          disabled={!canClose}
        >
          <X className="w-5 h-5 text-slate-700" />
        </button>

        <div className="flex flex-col items-center text-center gap-2 pt-1">
          {icon}
          <p className="font-extrabold text-[18px] text-slate-900">{state.title}</p>
          {state.message && (
            <p className="text-[13px] text-slate-600 leading-relaxed">{state.message}</p>
          )}
        </div>

        {state.variant === "custom" && state.children && (
          <div className="mt-4">{state.children}</div>
        )}

        {!(state.variant === "custom" && state.hideOk) && (
          <button
            onClick={onClose}
            className="mt-4 w-full h-12 rounded-2xl bg-sky-500 border-2 border-sky-600 text-white font-extrabold shadow active:scale-[0.99] transition"
            type="button"
          >
            OK
          </button>
        )}
      </div>
    </div>
  );
}

type BalanceState =
  | { status: "idle"; value: number }
  | { status: "loading"; value: number }
  | { status: "ready"; value: number }
  | { status: "error"; value: number };

export default function ShopItem() {
  const [, navigate] = useLocation();
  const [, params] = useRoute("/shop/i/:itemId");
  const itemId = params?.itemId || "";

  const item = useMemo(() => childs.find((c) => c.id === itemId) || null, [itemId]);
  const parent = useMemo(() => {
    if (!item) return null;
    return parents.find((p) => p.id === item.parentId) || null;
  }, [item]);

  // swal
  const [swal, setSwal] = useState<SwalState>({ open: false });
  const closeSwal = () => setSwal({ open: false });

  // buy modal state
  const [buyOpen, setBuyOpen] = useState(false);
  const [buyBusy, setBuyBusy] = useState(false);
  const [qty, setQty] = useState(1);
  const [coupon, setCoupon] = useState("");

  // balance
  const [balance, setBalance] = useState<BalanceState>({ status: "idle", value: 0 });

  const subtotal = useMemo(() => {
    if (!item) return 0;
    return item.price * qty;
  }, [item, qty]);

  const openSwal = (variant: SwalKind, title: string, message?: string) =>
    setSwal({ open: true, variant, title, message });

  const fetchBalance = async () => {
    setBalance((s) => ({ status: "loading", value: s.value }));
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setBalance({ status: "ready", value: 0 });
        return 0;
      }

      // ✅ profiles.balance
      const { data, error } = await supabase
        .from("profiles")
        .select("balance")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      const v = Number(data?.balance ?? 0);
      setBalance({ status: "ready", value: Number.isFinite(v) ? v : 0 });
      return Number.isFinite(v) ? v : 0;
    } catch {
      setBalance((s) => ({ status: "error", value: s.value ?? 0 }));
      return balance.value;
    }
  };

  const openBuy = async () => {
    if (!item) return;

    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) {
      openSwal("warning", "Chưa đăng nhập", "Bạn cần đăng nhập để mua hàng.");
      setTimeout(() => navigate("/auth?mode=login"), 450);
      return;
    }

    setQty(1);
    setCoupon("");
    setBuyBusy(false);
    setBuyOpen(true);

    // load balance
    await fetchBalance();
  };

  const closeBuy = () => {
    if (buyBusy) return;
    setBuyOpen(false);
  };

  const showNoMoney = (need: number, have: number) => {
    setSwal({
      open: true,
      variant: "warning",
      title: "Không đủ số dư",
      message: `Bạn cần ${formatVND(need)} nhưng số dư hiện có là ${formatVND(have)}.`,
    });
  };

  const purchase = async () => {
    if (!item) return;

    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) {
      closeBuy();
      openSwal("warning", "Phiên đăng nhập hết hạn", "Vui lòng đăng nhập lại.");
      setTimeout(() => navigate("/auth?mode=login"), 450);
      return;
    }

    const q = Math.max(1, qty);

    // ✅ check balance before call server (still server should re-check)
    const have = await fetchBalance();
    const need = item.price * q;

    if (have < need) {
      closeBuy();
      return showNoMoney(need, have);
    }

    setBuyBusy(true);

    // lock modal close while busy
    setSwal({ open: false });

    try {
      const res = await fetch("/api/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          itemId: item.id,
          quantity: q,
          coupon: coupon.trim() || null,
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        // server might return "NOT_ENOUGH_BALANCE"
        closeBuy();
        openSwal("error", "Mua thất bại", json?.message || "Có lỗi xảy ra.");
        return;
      }

      // success
      closeBuy();
      setSwal({
        open: true,
        variant: "success",
        title: "Mua thành công",
        message: json?.message || "Đơn hàng đã được xử lý.",
      });

      // refresh balance
      await fetchBalance();

      // open downloadUrl
      const dl = json?.downloadUrl || item.downloadUrl;
      if (dl) setTimeout(() => window.open(dl, "_blank", "noopener,noreferrer"), 350);
    } catch (e: any) {
      closeBuy();
      openSwal("error", "Lỗi mạng", e?.message || "Không thể kết nối server.");
    } finally {
      setBuyBusy(false);
    }
  };

  // fallback: not found
  if (!item) {
    return (
      <div className="min-h-screen bg-[#eaf6ff] px-3 pt-10">
        <div className="max-w-3xl mx-auto rounded-[30px] bg-white border-[3px] border-sky-400 p-6 shadow">
          <p className="font-extrabold text-[18px]">Không tìm thấy sản phẩm</p>
          <p className="text-sm text-slate-600 mt-2">
            Kiểm tra route <b>/shop/i/:itemId</b> và dữ liệu <b>childs</b> trong shop.data.ts có đúng <b>id</b>.
          </p>

          <button
            onClick={() => navigate("/shop")}
            className="mt-4 w-full py-4 rounded-[22px] bg-sky-500 text-white font-extrabold border-2 border-sky-600 shadow"
            type="button"
          >
            Quay lại shop
          </button>
        </div>

        <SwalModal state={swal} onClose={closeSwal} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eaf6ff]">
      {/* Header */}
      <div className="sticky top-0 z-40 px-3 pt-3">
        <div className="max-w-3xl mx-auto rounded-[28px] bg-white/90 border-[3px] border-sky-500 shadow p-3">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => navigate(`/shop/p/${item.parentId}`)}
              className="px-3 py-2 rounded-2xl bg-sky-100 border-2 border-sky-300 font-extrabold inline-flex items-center gap-2 active:scale-[0.99] transition"
              type="button"
            >
              <ArrowLeft className="w-4 h-4" /> Quay lại
            </button>

            <div className="text-right leading-tight">
              <p className="font-extrabold text-[14px] line-clamp-1">{item.title}</p>
              <p className="text-[12px] text-slate-500">
                {parent ? `Thuộc: ${parent.title}` : "Chi tiết sản phẩm"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cover */}
      <div className="max-w-3xl mx-auto px-3 pt-4">
        <div className="rounded-[30px] overflow-hidden bg-white border-[3px] border-sky-400 shadow-[0_18px_40px_rgba(2,132,199,0.18)]">
          <div className="relative">
            <img src={item.image} className="w-full h-[240px] object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

            <div className="absolute top-3 left-3">
              <span className="px-3 py-1 rounded-full bg-white/90 border-2 border-white font-extrabold text-[12px]">
                {item.badge}
              </span>
            </div>

            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-white font-extrabold text-[20px] drop-shadow">{item.title}</p>
              <p className="text-white/90 text-[13px] drop-shadow line-clamp-2">{item.desc}</p>
            </div>
          </div>

          {/* action bar: ✅ chỉ còn MUA NGAY */}
          <div className="p-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[12px] text-slate-500">Giá</p>
              <p className="font-extrabold text-[20px] text-sky-700">{formatVND(item.price)}</p>
            </div>

            <button
              onClick={openBuy}
              className="px-4 py-3 rounded-2xl bg-sky-500 border-2 border-sky-600 text-white font-extrabold text-[13px] shadow inline-flex items-center gap-2 active:scale-[0.99] transition"
              type="button"
            >
              <ShoppingCart className="w-4 h-4" />
              Mua ngay
            </button>
          </div>
        </div>
      </div>

      {/* Info sections */}
      <div className="max-w-3xl mx-auto px-3 pt-4 pb-10 space-y-4">
        <div className="rounded-[28px] bg-white border-[3px] border-sky-300 shadow p-4">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-sky-700" />
            <p className="font-extrabold text-[16px]">Chi tiết</p>
          </div>
          <div className="mt-3 rounded-2xl bg-sky-50 border-2 border-sky-200 p-3 text-[13px] text-slate-700">
            {item.desc || "Chưa có mô tả."}
          </div>
        </div>

        <div className="rounded-[28px] bg-white border-[3px] border-sky-300 shadow p-4">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-sky-700" />
            <p className="font-extrabold text-[16px]">Đơn hàng cha</p>
          </div>
          <div className="mt-3 rounded-2xl bg-sky-50 border-2 border-sky-200 p-3 text-[13px] text-slate-700">
            {parent ? parent.title : "Không tìm thấy đơn hàng cha."}
          </div>
        </div>
      </div>

      {/* ===== BUY MODAL: nhỏ gọn, không dài quá, có số dư ===== */}
      {buyOpen && (
        <SwalModal
          state={{
            open: true,
            variant: "custom",
            title: `Mua ngay: ${item.title}`,
            message: "Chọn số lượng + mã giảm giá (nếu có).",
            hideOk: true,
            lockClose: buyBusy,
            children: (
              <div className="space-y-3">
                {/* balance card */}
                <div className="rounded-2xl bg-white border-2 border-sky-200 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-sky-700" />
                      <p className="text-xs font-extrabold text-slate-600">Số dư hiện có</p>
                    </div>
                    <p className="font-extrabold text-sky-700">
                      {balance.status === "loading" ? "Đang tải..." : formatVND(balance.value)}
                    </p>
                  </div>
                </div>

                {/* compact product card */}
                <div className="rounded-2xl bg-sky-50 border-2 border-sky-200 p-3 text-[13px] text-slate-700">
                  <p className="font-extrabold text-sky-700 line-clamp-1">{item.title}</p>
                  <p className="text-slate-600 mt-1 line-clamp-2">{item.desc}</p>
                  <p className="mt-2 text-slate-600">
                    Đơn giá: <b>{formatVND(item.price)}</b>
                  </p>
                </div>

                {/* qty + coupon in 2 blocks */}
                <div className="grid grid-cols-1 gap-3">
                  {/* qty */}
                  <div className="rounded-2xl bg-white border-2 border-sky-200 p-3">
                    <p className="text-xs font-bold text-slate-500">Số lượng</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        className="w-11 h-11 rounded-2xl bg-sky-50 border-2 border-sky-200 font-extrabold text-sky-700 active:scale-[0.98] transition"
                        onClick={() => setQty((v) => Math.max(1, v - 1))}
                        type="button"
                        disabled={buyBusy}
                      >
                        -
                      </button>
                      <input
                        className="flex-1 h-11 rounded-2xl bg-white border-2 border-sky-200 px-3 text-center font-extrabold"
                        value={qty}
                        onChange={(e) => setQty(clampInt(e.target.value, 1, 999))}
                        inputMode="numeric"
                        disabled={buyBusy}
                      />
                      <button
                        className="w-11 h-11 rounded-2xl bg-sky-50 border-2 border-sky-200 font-extrabold text-sky-700 active:scale-[0.98] transition"
                        onClick={() => setQty((v) => Math.min(999, v + 1))}
                        type="button"
                        disabled={buyBusy}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* coupon */}
                  <div className="rounded-2xl bg-white border-2 border-sky-200 p-3">
                    <p className="text-xs font-bold text-slate-500">Mã giảm giá</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-11 rounded-2xl bg-white border-2 border-sky-200 px-3 flex items-center gap-2">
                        <Tag className="w-4 h-4 text-slate-400" />
                        <input
                          className="w-full bg-transparent outline-none font-bold text-[13px]"
                          value={coupon}
                          onChange={(e) => setCoupon(e.target.value)}
                          placeholder="Nhập mã giảm giá..."
                          disabled={buyBusy}
                        />
                      </div>
                      {coupon && (
                        <button
                          onClick={() => setCoupon("")}
                          className="h-11 px-3 rounded-2xl bg-sky-50 border-2 border-sky-200 font-extrabold text-slate-700 inline-flex items-center gap-2"
                          type="button"
                          disabled={buyBusy}
                        >
                          <XCircle className="w-4 h-4" /> Xoá
                        </button>
                      )}
                    </div>
                    <p className="mt-2 text-[11px] text-slate-500">
                      Coupon sẽ được kiểm tra trên server khi bấm “Xác nhận mua”.
                    </p>
                  </div>
                </div>

                {/* total + validate balance */}
                <div
                  className={cn(
                    "rounded-2xl border-2 p-3 text-[13px]",
                    balance.value < subtotal
                      ? "bg-rose-50 border-rose-200"
                      : "bg-sky-50 border-sky-200"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-bold">Tạm tính</span>
                    <span className="font-extrabold">{formatVND(subtotal)}</span>
                  </div>
                  <p className="mt-2 text-[11px] text-slate-500">
                    Tổng tiền cuối cùng (sau giảm) sẽ do server trả về.
                  </p>

                  {balance.value < subtotal && (
                    <p className="mt-2 text-[12px] font-extrabold text-rose-600">
                      Không đủ số dư. Vui lòng nạp thêm hoặc giảm số lượng.
                    </p>
                  )}
                </div>

                {/* actions */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    className="h-12 rounded-2xl bg-white border-2 border-sky-300 font-extrabold text-sky-700"
                    onClick={closeBuy}
                    type="button"
                    disabled={buyBusy}
                  >
                    Huỷ
                  </button>
                  <button
                    className={cn(
                      "h-12 rounded-2xl border-2 text-white font-extrabold shadow active:scale-[0.99] transition inline-flex items-center justify-center gap-2",
                      balance.value < subtotal || buyBusy
                        ? "bg-slate-300 border-slate-400 cursor-not-allowed"
                        : "bg-sky-500 border-sky-600"
                    )}
                    onClick={() => {
                      if (balance.value < subtotal) {
                        closeBuy();
                        showNoMoney(subtotal, balance.value);
                        return;
                      }
                      purchase();
                    }}
                    type="button"
                    disabled={buyBusy || balance.value < subtotal}
                  >
                    {buyBusy && <Loader2 className="w-4 h-4 animate-spin" />}
                    {buyBusy ? "Đang xử lý..." : "Xác nhận mua"}
                  </button>
                </div>
              </div>
            ),
          }}
          onClose={closeBuy}
        />
      )}

      {/* normal swal */}
      <SwalModal state={swal} onClose={closeSwal} />
    </div>
  );
}
