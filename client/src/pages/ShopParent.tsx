import { useMemo, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { ArrowLeft, ShoppingCart, BadgeCheck, TicketPercent } from "lucide-react";

import { parents, childs, formatVND } from "./shop.data";
import ModalSwal, { SwalKind } from "../components/ModalSwal";
import { supabase } from "../lib/supabaseClient";

function cn(...cls: (string | false | undefined | null)[]) {
  return cls.filter(Boolean).join(" ");
}

type PurchaseModalState =
  | { open: false }
  | {
      open: true;
      itemId: string; // luôn string
      qty: number;
      coupon: string;
      loading: boolean;
    };

export default function ShopParent() {
  const [, navigate] = useLocation();

  // ✅ lấy match để tránh params undefined do route không khớp
  const [match, params] = useRoute("/shop/p/:parentId");
  const parentId = params?.parentId ? String(params.parentId) : "";

  // Nếu route không match thì không render (tránh UI nhảy bậy)
  if (!match) return null;

  // ✅ Fix lệch kiểu: so sánh string
  const parent = useMemo(
    () => parents.find((p) => String((p as any).id) === String(parentId)),
    [parentId]
  );

  const list = useMemo(
    () => childs.filter((c) => String((c as any).parentId) === String(parentId)),
    [parentId]
  );

  // swal notify
  const [swal, setSwal] = useState<{
    open: boolean;
    variant: SwalKind;
    title: string;
    message?: string;
  }>({ open: false, variant: "info", title: "" });

  const openSwal = (variant: SwalKind, title: string, message?: string) =>
    setSwal({ open: true, variant, title, message });

  // purchase modal
  const [buy, setBuy] = useState<PurchaseModalState>({ open: false });

  // ====== Helpers ======
  const getUser = async () => {
    const { data } = await supabase.auth.getUser();
    return data.user || null;
  };

  const openBuyModal = async (itemId: string) => {
    const user = await getUser();
    if (!user) {
      openSwal("warning", "Bạn chưa đăng nhập", "Vui lòng đăng nhập để mua hàng.");
      setTimeout(() => navigate("/auth?mode=login"), 600);
      return;
    }

    setBuy({ open: true, itemId: String(itemId), qty: 1, coupon: "", loading: false });
  };

  const closeBuyModal = () => setBuy({ open: false });

  const calcSubtotal = (price: number, qty: number) => price * qty;

  const submitPurchase = async () => {
    if (!buy.open) return;

    // ✅ Fix lệch kiểu itemId
    const item = childs.find((x) => String((x as any).id) === String(buy.itemId));
    if (!item) {
      closeBuyModal();
      return openSwal("error", "Lỗi", "Không tìm thấy sản phẩm.");
    }

    if (buy.qty < 1) return openSwal("error", "Số lượng không hợp lệ", "Tối thiểu là 1.");

    setBuy((s) => (s.open ? { ...s, loading: true } : s));

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setBuy((s) => (s.open ? { ...s, loading: false } : s));
        openSwal("warning", "Phiên đăng nhập hết hạn", "Vui lòng đăng nhập lại.");
        setTimeout(() => navigate("/auth?mode=login"), 600);
        return;
      }

      // ✅ Fix body: dùng quantity (đồng bộ với Shop.tsx + server)
      const res = await fetch("/api/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          itemId: String((item as any).id),
          quantity: buy.qty,
          coupon: buy.coupon.trim() || null,
        }),
      });

      const json = await res.json().catch(() => ({}));

      setBuy((s) => (s.open ? { ...s, loading: false } : s));

      if (!res.ok) {
        return openSwal("error", "Không mua được", json?.message || "Có lỗi xảy ra.");
      }

      closeBuyModal();
      openSwal("success", "Mua thành công", `Bạn đã mua "${(item as any).title}" x${buy.qty}.`);
    } catch (e: any) {
      setBuy((s) => (s.open ? { ...s, loading: false } : s));
      openSwal("error", "Lỗi mạng", e?.message || "Không thể kết nối server.");
    }
  };

  // ====== UI fallback ======
  if (!parent) {
    return (
      <div className="min-h-screen bg-[#eaf6ff] px-3 pt-10">
        <div className="max-w-3xl mx-auto rounded-[30px] bg-white border-[3px] border-sky-400 p-6 shadow">
          <p className="font-extrabold text-[18px]">Không tìm thấy đơn hàng</p>
          <p className="text-sm text-slate-600 mt-2">
            Lỗi thường do <b>id / parentId lệch kiểu</b> (number vs string) hoặc
            route không đúng. Hãy kiểm tra <b>shop.data.ts</b>:
            <br />- parents[].id phải khớp với URL /shop/p/:parentId
            <br />- childs[].parentId phải đúng bằng parents[].id
          </p>

          <button
            onClick={() => navigate("/shop")}
            className="mt-4 w-full py-4 rounded-[22px] bg-sky-500 text-white font-extrabold border-2 border-sky-600 shadow"
          >
            Quay lại shop
          </button>
        </div>

        <ModalSwal
          open={swal.open}
          variant={swal.variant}
          title={swal.title}
          message={swal.message}
          onClose={() => setSwal((s) => ({ ...s, open: false }))}
        />
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
              onClick={() => navigate("/shop")}
              className="px-3 py-2 rounded-2xl bg-sky-100 border-2 border-sky-300 font-extrabold inline-flex items-center gap-2 active:scale-[0.99] transition"
            >
              <ArrowLeft className="w-4 h-4" /> Quay lại
            </button>

            <div className="text-right leading-tight">
              <p className="font-extrabold text-[14px] line-clamp-1">{(parent as any).title}</p>
              <p className="text-[12px] text-slate-500">Chọn đơn con để xem chi tiết / mua</p>
            </div>
          </div>
        </div>
      </div>

      {/* Parent cover */}
      <div className="max-w-3xl mx-auto px-3 pt-4">
        <div className="rounded-[30px] overflow-hidden bg-white border-[3px] border-sky-400 shadow-[0_18px_40px_rgba(2,132,199,0.18)]">
          <div className="relative">
            <img src={(parent as any).cover} className="w-full h-[210px] object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-white font-extrabold text-[20px] drop-shadow">
                {(parent as any).title}
              </p>
              <p className="text-white/90 text-[13px] drop-shadow">{(parent as any).subtitle}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Child list */}
      <div className="max-w-3xl mx-auto px-3 pt-5 pb-10">
        <div className="flex items-center justify-between px-1">
          <p className="font-extrabold text-[16px]">Đơn hàng con</p>
          <p className="text-[12px] text-slate-500">{list.length} mục</p>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-4">
          {list.map((c: any) => (
            <div
              key={String(c.id)}
              className="text-left rounded-[30px] overflow-hidden bg-white border-[3px] border-sky-400 shadow-[0_16px_35px_rgba(2,132,199,0.14)]"
            >
              {/* ✅ bấm vào ảnh/card => chi tiết */}
              <button
                onClick={() => navigate(`/shop/i/${String(c.id)}`)}
                className="w-full text-left active:scale-[0.997] transition"
                type="button"
              >
                <div className="relative">
                  <img src={c.image} className="w-full h-[170px] object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 rounded-full bg-white/90 border-2 border-white font-extrabold text-[12px]">
                      {c.badge}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-4 right-4">
                    <p className="text-white font-extrabold text-[17px] drop-shadow">{c.title}</p>
                    <p className="text-white/90 text-[13px] drop-shadow line-clamp-2">{c.desc}</p>
                  </div>
                </div>
              </button>

              <div className="p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[12px] text-slate-500">Giá</p>
                  <p className="font-extrabold text-[18px] text-sky-700">{formatVND(c.price)}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/shop/i/${String(c.id)}`)}
                    className="px-3 py-2 rounded-2xl bg-sky-100 border-2 border-sky-300 font-extrabold text-[13px] inline-flex items-center gap-2 active:scale-[0.99] transition"
                    type="button"
                  >
                    <BadgeCheck className="w-4 h-4 text-sky-600" />
                    Chi tiết
                  </button>

                  <button
                    onClick={() => openBuyModal(String(c.id))}
                    className="px-4 py-2 rounded-2xl bg-sky-500 border-2 border-sky-600 text-white font-extrabold text-[13px] shadow inline-flex items-center gap-2 active:scale-[0.99] transition"
                    type="button"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Mua ngay
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {list.length === 0 && (
          <div className="mt-6 rounded-[30px] bg-white border-[3px] border-sky-300 p-5 shadow">
            <p className="font-extrabold text-[16px]">Chưa có đơn hàng con</p>
            <p className="text-sm text-slate-600 mt-1">
              Kiểm tra lại <b>childs</b> trong shop.data.ts phải có <b>parentId</b> đúng bằng{" "}
              <b>{parentId}</b>.
            </p>
          </div>
        )}
      </div>

      {/* ====== BUY MODAL (SWAL STYLE) ====== */}
      {buy.open && (() => {
        const item = childs.find((x: any) => String(x.id) === String(buy.itemId));
        if (!item) return null;

        const subtotal = calcSubtotal(item.price, buy.qty);

        return (
          <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={buy.loading ? undefined : closeBuyModal}
            />
            <div className="relative w-full sm:max-w-md bg-white rounded-t-[30px] sm:rounded-[30px] border-[3px] border-sky-400 shadow-[0_20px_60px_rgba(2,132,199,0.25)] p-4 m-0 sm:m-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-extrabold text-[16px]">Mua ngay</p>
                  <p className="text-xs text-slate-500 line-clamp-1">{item.title}</p>
                </div>
                <button
                  onClick={buy.loading ? undefined : closeBuyModal}
                  className="w-10 h-10 rounded-2xl bg-sky-50 border-2 border-sky-200 font-extrabold"
                  type="button"
                >
                  ✕
                </button>
              </div>

              <div className="mt-3 rounded-[22px] bg-sky-50 border-2 border-sky-200 p-3">
                <p className="text-[12px] text-slate-500">Tạm tính</p>
                <p className="font-extrabold text-[20px] text-sky-700">{formatVND(subtotal)}</p>
                <p className="text-[12px] text-slate-500 mt-1">
                  Giá: {formatVND(item.price)} × {buy.qty}
                </p>
              </div>

              {/* qty */}
              <div className="mt-3">
                <p className="text-xs font-bold text-slate-600 mb-2">Số lượng</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setBuy((s) => (s.open ? { ...s, qty: Math.max(1, s.qty - 1) } : s))
                    }
                    className="w-11 h-11 rounded-2xl bg-white border-2 border-sky-200 font-extrabold active:scale-[0.99] transition"
                    disabled={buy.loading}
                    type="button"
                  >
                    −
                  </button>
                  <div className="flex-1 h-11 rounded-2xl bg-white border-2 border-sky-200 flex items-center justify-center font-extrabold">
                    {buy.qty}
                  </div>
                  <button
                    onClick={() => setBuy((s) => (s.open ? { ...s, qty: s.qty + 1 } : s))}
                    className="w-11 h-11 rounded-2xl bg-white border-2 border-sky-200 font-extrabold active:scale-[0.99] transition"
                    disabled={buy.loading}
                    type="button"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* coupon */}
              <div className="mt-3">
                <p className="text-xs font-bold text-slate-600 mb-2">Mã giảm giá</p>
                <div className="flex items-center gap-2 px-3 h-11 rounded-2xl bg-white border-2 border-sky-200">
                  <TicketPercent className="w-4 h-4 text-slate-400" />
                  <input
                    className="w-full bg-transparent outline-none text-[13px]"
                    placeholder="Nhập mã (VD: SALE10)"
                    value={buy.coupon}
                    onChange={(e) =>
                      setBuy((s) => (s.open ? { ...s, coupon: e.target.value } : s))
                    }
                    disabled={buy.loading}
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Coupon sẽ được server kiểm tra thật.</p>
              </div>

              <button
                onClick={submitPurchase}
                disabled={buy.loading}
                className={cn(
                  "mt-4 w-full h-12 rounded-2xl font-extrabold border-2 shadow active:scale-[0.99] transition",
                  buy.loading
                    ? "bg-sky-200 text-sky-900 border-sky-300"
                    : "bg-sky-500 text-white border-sky-600"
                )}
                type="button"
              >
                {buy.loading ? "Đang xử lý..." : "Xác nhận mua"}
              </button>
            </div>
          </div>
        );
      })()}

      <ModalSwal
        open={swal.open}
        variant={swal.variant}
        title={swal.title}
        message={swal.message}
        onClose={() => setSwal((s) => ({ ...s, open: false }))}
      />
    </div>
  );
}
