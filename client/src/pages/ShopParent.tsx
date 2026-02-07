import { useMemo, useState } from "react";
import { useLocation, useRoute } from "wouter";
import {
  ArrowLeft,
  ShoppingCart,
  BadgeCheck,
  Search,
  Tag,
  Percent,
} from "lucide-react";
import ModalSwal, { SwalKind } from "../components/ModalSwal";
import { parents, childs, formatVND } from "./shop.data";
import { getSessionUser } from "../lib/authClient"; // bạn chỉnh đúng path theo project
import { purchaseItem } from "../lib/purchaseClient"; // gọi /api/purchase

function cn(...cls: (string | false | undefined | null)[]) {
  return cls.filter(Boolean).join(" ");
}

type BuyState = {
  open: boolean;
  itemId?: string;
  qty: number;
  coupon: string;
  loading: boolean;
};

export default function ShopParent() {
  const [, navigate] = useLocation();
  const [, params] = useRoute("/shop/p/:parentId");
  const parentId = params?.parentId || "";

  const parent = useMemo(
    () => parents.find((p) => String(p.id) === String(parentId)),
    [parentId]
  );

  const list = useMemo(
    () => childs.filter((c) => String(c.parentId) === String(parentId)),
    [parentId]
  );

  // search/filter
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();
    if (!k) return list;
    return list.filter((c) =>
      `${c.title} ${c.desc} ${c.badge}`.toLowerCase().includes(k)
    );
  }, [q, list]);

  // swal
  const [swal, setSwal] = useState<{
    open: boolean;
    variant: SwalKind;
    title: string;
    message?: string;
  }>({ open: false, variant: "info", title: "" });

  const openSwal = (variant: SwalKind, title: string, message?: string) =>
    setSwal({ open: true, variant, title, message });

  // buy modal state
  const [buy, setBuy] = useState<BuyState>({
    open: false,
    itemId: undefined,
    qty: 1,
    coupon: "",
    loading: false,
  });

  const currentItem = useMemo(() => {
    if (!buy.itemId) return undefined;
    return childs.find((c) => String(c.id) === String(buy.itemId));
  }, [buy.itemId]);

  const subtotal = useMemo(() => {
    if (!currentItem) return 0;
    return currentItem.price * (buy.qty || 1);
  }, [currentItem, buy.qty]);

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
      </div>
    );
  }

  const openBuy = (itemId: string) => {
    setBuy({ open: true, itemId, qty: 1, coupon: "", loading: false });
  };

  const closeBuy = () => {
    setBuy((s) => ({ ...s, open: false, loading: false }));
  };

  const confirmBuy = async () => {
    if (!currentItem) return;
    const user = await getSessionUser(); // { user, profile } hoặc null
    if (!user?.user) {
      openSwal("warning", "Bạn chưa đăng nhập", "Vui lòng đăng nhập để mua.");
      closeBuy();
      navigate("/auth?mode=login");
      return;
    }
    if (buy.qty < 1) {
      openSwal("error", "Số lượng không hợp lệ", "Vui lòng chọn số lượng >= 1.");
      return;
    }

    try {
      setBuy((s) => ({ ...s, loading: true }));

      const res = await purchaseItem({
        itemId: String(currentItem.id),
        qty: buy.qty,
        coupon: buy.coupon.trim() || null,
      });

      if (!res.ok) {
        openSwal("error", "Mua thất bại", res.message || "Vui lòng thử lại.");
        setBuy((s) => ({ ...s, loading: false }));
        return;
      }

      openSwal(
        "success",
        "Mua thành công",
        `Đã trừ ${formatVND(res.charged)}. Số dư còn lại: ${formatVND(
          res.balance_after
        )}`
      );
      closeBuy();
    } catch (e: any) {
      openSwal("error", "Lỗi server", e?.message || "Không thể mua lúc này.");
      setBuy((s) => ({ ...s, loading: false }));
    }
  };

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
              <p className="font-extrabold text-[14px]">{parent.title}</p>
              <p className="text-[12px] text-slate-500">
                Chọn đơn con để xem chi tiết / mua
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="mt-3">
            <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white border-2 border-sky-200 shadow-sm">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                className="w-full bg-transparent outline-none text-[14px]"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm đơn hàng con..."
              />
              {q && (
                <button
                  onClick={() => setQ("")}
                  className="px-3 py-1 rounded-xl bg-sky-100 border border-sky-200 font-bold text-[12px]"
                >
                  Xoá
                </button>
              )}
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
              <p className="text-white font-extrabold text-[20px] drop-shadow">
                {parent.title}
              </p>
              <p className="text-white/90 text-[13px] drop-shadow">
                {parent.subtitle}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Child list */}
      <div className="max-w-3xl mx-auto px-3 pt-5 pb-10">
        <div className="flex items-center justify-between px-1">
          <p className="font-extrabold text-[16px]">Đơn hàng con</p>
          <p className="text-[12px] text-slate-500">{filtered.length} mục</p>
        </div>

        {filtered.length === 0 ? (
          <div className="mt-4 rounded-[30px] bg-white border-[3px] border-sky-200 p-5 text-center shadow-sm">
            <p className="font-extrabold text-slate-800">Không có kết quả</p>
            <p className="text-sm text-slate-500 mt-1">
              Thử từ khóa khác nhé.
            </p>
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-1 gap-4">
            {filtered.map((c) => (
              <div
                key={String(c.id)}
                className="text-left rounded-[30px] overflow-hidden bg-white border-[3px] border-sky-400 shadow-[0_16px_35px_rgba(2,132,199,0.14)]"
              >
                {/* click area -> detail */}
                <button
                  onClick={() => navigate(`/shop/i/${String(c.id)}`)}
                  className="w-full text-left active:opacity-[0.98] transition"
                >
                  <div className="relative">
                    <img src={c.image} className="w-full h-[170px] object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 rounded-full bg-white/90 border-2 border-white font-extrabold text-[12px] inline-flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5" />
                        {c.badge}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-4 right-4">
                      <p className="text-white font-extrabold text-[17px] drop-shadow">
                        {c.title}
                      </p>
                      <p className="text-white/90 text-[13px] drop-shadow line-clamp-2">
                        {c.desc}
                      </p>
                    </div>
                  </div>
                </button>

                {/* footer actions */}
                <div className="p-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[12px] text-slate-500">Giá</p>
                    <p className="font-extrabold text-[18px] text-sky-700">
                      {formatVND(c.price)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/shop/i/${String(c.id)}`)}
                      className="px-3 py-2 rounded-2xl bg-sky-100 border-2 border-sky-300 font-extrabold text-[13px] inline-flex items-center gap-2 active:scale-[0.99] transition"
                    >
                      <BadgeCheck className="w-4 h-4 text-sky-600" />
                      Chi tiết
                    </button>

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        openBuy(String(c.id));
                      }}
                      className="px-4 py-2 rounded-2xl bg-sky-500 border-2 border-sky-600 text-white font-extrabold text-[13px] shadow inline-flex items-center gap-2 active:scale-[0.99] transition"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Mua ngay
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BUY MODAL */}
      {buy.open && currentItem && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeBuy}
          />
          <div className="relative w-full sm:max-w-md mx-auto bg-white rounded-t-[28px] sm:rounded-[28px] border-[3px] border-sky-400 shadow-[0_20px_60px_rgba(2,132,199,0.25)] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-extrabold text-[16px]">Mua ngay</p>
                <p className="text-[12px] text-slate-500 line-clamp-1">
                  {currentItem.title}
                </p>
              </div>
              <button
                onClick={closeBuy}
                className="px-3 py-2 rounded-2xl bg-sky-100 border-2 border-sky-300 font-extrabold text-[13px]"
              >
                Đóng
              </button>
            </div>

            <div className="mt-3 rounded-2xl bg-sky-50 border-2 border-sky-200 p-3">
              <p className="text-xs text-slate-500">Đơn giá</p>
              <p className="font-extrabold text-sky-700 text-[18px]">
                {formatVND(currentItem.price)}
              </p>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white border-2 border-sky-200 p-3">
                <p className="text-xs text-slate-500">Số lượng</p>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={() =>
                      setBuy((s) => ({ ...s, qty: Math.max(1, s.qty - 1) }))
                    }
                    className="w-10 h-10 rounded-2xl bg-sky-100 border-2 border-sky-200 font-extrabold"
                  >
                    -
                  </button>
                  <input
                    value={buy.qty}
                    onChange={(e) =>
                      setBuy((s) => ({
                        ...s,
                        qty: Math.max(1, Number(e.target.value || 1)),
                      }))
                    }
                    inputMode="numeric"
                    className="w-full h-10 rounded-2xl bg-white border-2 border-sky-200 text-center font-extrabold outline-none"
                  />
                  <button
                    onClick={() => setBuy((s) => ({ ...s, qty: s.qty + 1 }))}
                    className="w-10 h-10 rounded-2xl bg-sky-100 border-2 border-sky-200 font-extrabold"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="rounded-2xl bg-white border-2 border-sky-200 p-3">
                <p className="text-xs text-slate-500 inline-flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5" /> Mã giảm giá
                </p>
                <input
                  value={buy.coupon}
                  onChange={(e) => setBuy((s) => ({ ...s, coupon: e.target.value }))}
                  placeholder="VD: SALE10"
                  className="mt-2 w-full h-10 rounded-2xl bg-white border-2 border-sky-200 px-3 font-bold outline-none"
                />
              </div>
            </div>

            <div className="mt-3 rounded-2xl bg-white border-2 border-sky-200 p-3">
              <p className="text-xs text-slate-500">Tạm tính</p>
              <p className="font-extrabold text-[18px] text-slate-900">
                {formatVND(subtotal)}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                * Server sẽ kiểm tra số dư + coupon và trừ tiền thật.
              </p>
            </div>

            <button
              onClick={confirmBuy}
              disabled={buy.loading}
              className={cn(
                "mt-3 w-full h-12 rounded-2xl font-extrabold border-2 shadow active:scale-[0.99] transition inline-flex items-center justify-center gap-2",
                buy.loading
                  ? "bg-slate-200 text-slate-600 border-slate-300"
                  : "bg-sky-500 text-white border-sky-600"
              )}
            >
              <ShoppingCart className="w-5 h-5" />
              {buy.loading ? "Đang xử lý..." : "Xác nhận mua"}
            </button>
          </div>
        </div>
      )}

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
