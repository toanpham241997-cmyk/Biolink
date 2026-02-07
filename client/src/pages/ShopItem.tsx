import { useMemo } from "react";
import { useLocation, useRoute } from "wouter";
import { ArrowLeft, ShoppingCart, Download, ShieldCheck } from "lucide-react";
import { childs, parents, formatVND } from "./shop.data";

export default function ShopItem() {
  const [, navigate] = useLocation();
  const [, params] = useRoute("/shop/i/:itemId");
  const itemId = params?.itemId || "";

  const item = useMemo(() => childs.find((c) => c.id === itemId), [itemId]);
  const parent = useMemo(
    () => (item ? parents.find((p) => p.id === item.parentId) : undefined),
    [item]
  );

  if (!item) {
    return (
      <div className="min-h-screen bg-[#eaf6ff] px-3 pt-10">
        <div className="max-w-3xl mx-auto rounded-[30px] bg-white border-[3px] border-sky-400 p-6 shadow">
          <p className="font-extrabold text-[18px]">Không tìm thấy đơn hàng con</p>
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

  return (
    <div className="min-h-screen bg-[#eaf6ff]">
      {/* Header */}
      <div className="sticky top-0 z-40 px-3 pt-3">
        <div className="max-w-3xl mx-auto rounded-[28px] bg-white/90 border-[3px] border-sky-500 shadow p-3">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => navigate(`/shop/p/${item.parentId}`)}
              className="px-3 py-2 rounded-2xl bg-sky-100 border-2 border-sky-300 font-extrabold inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Quay lại
            </button>
            <div className="text-right leading-tight">
              <p className="font-extrabold text-[14px]">{parent?.title || "Đơn hàng"}</p>
              <p className="text-[12px] text-slate-500">Chi tiết + mua ngay</p>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-3xl mx-auto px-3 pt-4 pb-10">
        <div className="rounded-[30px] overflow-hidden bg-white border-[3px] border-sky-400 shadow-[0_18px_40px_rgba(2,132,199,0.18)]">
          <div className="relative">
            <img src={item.image} className="w-full h-[240px] object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute top-3 left-3">
              <span className="px-3 py-1 rounded-full bg-white/90 border-2 border-white font-extrabold text-[12px]">
                {item.badge}
              </span>
            </div>
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-white font-extrabold text-[20px] drop-shadow">
                {item.title}
              </p>
              <p className="text-white/90 text-[13px] drop-shadow line-clamp-2">
                {item.desc}
              </p>
            </div>
          </div>

          <div className="p-4 space-y-4">
            <div className="rounded-[26px] bg-sky-50 border-[3px] border-sky-300 p-4">
              <p className="text-[12px] text-slate-500">Giá</p>
              <p className="font-extrabold text-[26px] text-sky-700">
                {formatVND(item.price)}
              </p>
              <p className="text-[13px] text-slate-600 mt-2">
                Mô tả chi tiết: {item.desc}
              </p>
            </div>

            <div className="rounded-[26px] bg-white border-[3px] border-sky-200 p-4">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-sky-100 border-2 border-sky-300 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-sky-600" />
                </div>
                <div>
                  <p className="font-extrabold">Cam kết</p>
                  <p className="text-[13px] text-slate-600 mt-1">
                    Demo: hỗ trợ nhanh, giao dịch rõ ràng. (Bạn thay nội dung thật)
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => alert(`Mua ngay: ${item.title} (demo)`)}
                className="py-4 rounded-[22px] bg-sky-500 text-white font-extrabold border-2 border-sky-600 shadow inline-flex items-center justify-center gap-2 active:scale-[0.99] transition"
              >
                <ShoppingCart className="w-5 h-5" />
                Mua ngay
              </button>

              <button
                onClick={() => {
                  if (item.downloadUrl) window.open(item.downloadUrl, "_blank");
                  else alert("Chưa có link nhận (demo).");
                }}
                className="py-4 rounded-[22px] bg-sky-100 text-sky-800 font-extrabold border-2 border-sky-300 inline-flex items-center justify-center gap-2 active:scale-[0.99] transition"
              >
                <Download className="w-5 h-5" />
                Nhận ngay
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
