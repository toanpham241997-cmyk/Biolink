import { useMemo, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { ArrowLeft, ShoppingCart, BadgeCheck, Tag, XCircle } from "lucide-react";
import { parents, childs, formatVND } from "./shop.data";
import ModalSwal, { SwalKind } from "../components/ModalSwal";
import { supabase } from "../lib/supabaseClient";

function cn(...cls: (string | false | undefined | null)[]) {
  return cls.filter(Boolean).join(" ");
}

function clampInt(v: string, min: number, max: number) {
  const x = Number(v);
  if (!Number.isFinite(x)) return min;
  return Math.max(min, Math.min(max, Math.floor(x)));
}

export default function ShopParent() {
  const [, navigate] = useLocation();
  const [, params] = useRoute("/shop/p/:parentId");
  const parentId = params?.parentId || "";

  const parent = useMemo(() => parents.find((p) => p.id === parentId), [parentId]);
  const list = useMemo(() => childs.filter((c) => c.parentId === parentId), [parentId]);

  // swal notify
  const [swal, setSwal] = useState<{
    open: boolean;
    variant: SwalKind;
    title: string;
    message?: string;
  }>({ open: false, variant: "info", title: "" });

  const openSwal = (variant: SwalKind, title: string, message?: string) =>
    setSwal({ open: true, variant, title, message });

  // buy modal
  const [buyOpen, setBuyOpen] = useState(false);
  const [buyBusy, setBuyBusy] = useState(false);
  const [buyItem, setBuyItem] = useState<null | {
    id: string;
    title: string;
    price: number;
    desc?: string;
    downloadUrl?: string;
  }>(null);

  const [qty, setQty] = useState(1);
  const [coupon, setCoupon] = useState("");

  const subtotal = useMemo(() => (buyItem ? buyItem.price * qty : 0), [buyItem, qty]);

  const openBuy = (c: any) => {
    setBuyItem({
      id: c.id,
      title: c.title,
      price: c.price,
      desc: c.desc,
      downloadUrl: c.downloadUrl,
    });
    setQty(1);
    setCoupon("");
    setBuyOpen(true);
  };

  const closeBuy = () => {
    if (buyBusy) return;
    setBuyOpen(false);
  };

  const purchase = async () => {
    if (!buyItem) return;

    // must login
    const { data: sess } = await supabase.auth.getSession();
    const token = sess.session?.access_token;
    if (!token) {
      setBuyOpen(false);
      openSwal("error", "Chưa đăng nhập", "Bạn cần đăng nhập để mua hàng.");
      navigate("/auth?mode=login");
      return;
    }

    if (qty < 1) return openSwal("error", "Số lượng không hợp lệ", "Chọn ít nhất 1.");

    setBuyBusy(true);
    try {
      const res = await fetch("/api/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          itemId: buyItem.id,
          quantity: qty,
          coupon: coupon.trim() || null,
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        openSwal("error", "Mua thất bại", json?.message || "Có lỗi xảy ra.");
        return;
      }

      setBuyOpen(false);
      openSwal("success", "Mua thành công", json?.message || "Đã trừ số dư và tạo đơn.");

      // nếu có link nhận ngay thì mở
      if (buyItem.downloadUrl) {
        setTimeout(() => window.open(buyItem.downloadUrl!, "_blank"), 400);
      }
    } catch (e: any) {
      openSwal("error", "Lỗi mạng", e?.message || "Không thể kết nối server.");
    } finally {
      setBuyBusy(false);
    }
  };

  if (!parent) {
    return (
      <div className="min-h-screen bg-[#eaf6ff] px-3 pt-10">
        <div className="max-w-3xl mx-auto rounded-[30px] bg-white border-[3px] border-sky-400 p-6 shadow">
          <p className="font-extrabold text-[18px]">Không tìm thấy đơn hàng</p>
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
              className="px-3 py-2 rounded-2xl bg-sky-100 border-2 border-sky-300 font-extrabold inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Quay lại
            </button>
            <div className="text-right leading-tight">
              <p className="font-extrabold text-[14px]">{parent.title}</p>
              <p className="text-[12px] text-slate-500">Chọn đơn con để xem chi tiết</p>
            </div>
          </div>
        </div>
      </div>

      {/* Parent cover */}
      <div className="max-w-3xl mx-auto px-3 pt-4">
        <div className="rounded-[30px] overflow-hidden bg-white border-[3px] border-sky-400 shadow-[0_18px_40px_rgba(2,132,199,0.18)]">
          <div className="relative">
            <img src={parent.cover} className="w-full h-[210px] object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-white font-extrabold text-[20px] drop-shadow">{parent.title}</p>
              <p className="text-white/90 text-[13px] drop-shadow">{parent.subtitle}</p>
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
          {list.map((c) => (
            <div
              key={c.id}
              className="text-left rounded-[30px] overflow-hidden bg-white border-[3px] border-sky-400 shadow-[0_16px_35px_rgba(2,132,199,0.14)]"
            >
              <button
                onClick={() => navigate(`/shop/i/${c.id}`)}
                className="w-full text-left active:scale-[0.995] transition"
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
                    onClick={() => navigate(`/shop/i/${c.id}`)}
                    className="px-3 py-2 rounded-2xl bg-sky-100 border-2 border-sky-300 font-extrabold text-[13px] inline-flex items-center gap-2 active:scale-[0.99] transition"
                    type="button"
                  >
                    <BadgeCheck className="w-4 h-4 text-sky-600" />
                    Chi tiết
                  </button>

                  <button
                    onClick={() => openBuy(c)}
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
      </div>

      {/* BUY MODAL */}
      <ModalSwal open={buyOpen} variant="custom" title={buyItem ? `Mua ngay: ${buyItem.title}` : "Mua ngay"} onClose={closeBuy}>
        {buyItem && (
          <div className="space-y-3">
            <div className="rounded-2xl bg-sky-50 border-2 border-sky-200 p-3 text-[13px] text-slate-700">
              <p className="font-extrabold text-sky-700">{buyItem.title}</p>
              <p className="text-slate-600 mt-1 line-clamp-2">{buyItem.desc}</p>
              <p className="mt-2 text-slate-600">
                Đơn giá: <b>{formatVND(buyItem.price)}</b>
              </p>
            </div>

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

            <div className="rounded-2xl bg-sky-50 border-2 border-sky-200 p-3 text-[13px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-bold">Tạm tính</span>
                <span className="font-extrabold">{formatVND(subtotal)}</span>
              </div>
              <p className="mt-2 text-[11px] text-slate-500">
                Tổng tiền cuối cùng (sau giảm) sẽ trả về từ server.
              </p>
            </div>

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
                className="h-12 rounded-2xl bg-sky-500 border-2 border-sky-600 text-white font-extrabold shadow active:scale-[0.99] transition"
                onClick={purchase}
                type="button"
                disabled={buyBusy}
              >
                {buyBusy ? "Đang xử lý..." : "Xác nhận mua"}
              </button>
            </div>
          </div>
        )}
      </ModalSwal>

      {/* SWAL notify */}
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
