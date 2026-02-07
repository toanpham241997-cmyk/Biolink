import { useMemo } from "react";
import { useLocation, useRoute } from "wouter";
import { ArrowLeft, ShoppingCart, BadgeCheck } from "lucide-react";
import { parents, childs, formatVND } from "./shop.data";

function cn(...cls: (string | false | undefined | null)[]) {
  return cls.filter(Boolean).join(" ");
}

export default function ShopParent() {
  const [, navigate] = useLocation();
  const [, params] = useRoute("/shop/p/:parentId");
  const parentId = params?.parentId || "";

  const parent = useMemo(() => parents.find((p) => p.id === parentId), [parentId]);
  const list = useMemo(() => childs.filter((c) => c.parentId === parentId), [parentId]);

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
              <p className="text-white font-extrabold text-[20px] drop-shadow">
                {parent.title}
              </p>
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
            <button
              key={c.id}
              onClick={() => navigate(`/shop/i/${c.id}`)}
              className="text-left rounded-[30px] overflow-hidden bg-white border-[3px] border-sky-400 shadow-[0_16px_35px_rgba(2,132,199,0.14)] active:scale-[0.995] transition"
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
                  <p className="text-white font-extrabold text-[17px] drop-shadow">
                    {c.title}
                  </p>
                  <p className="text-white/90 text-[13px] drop-shadow line-clamp-2">
                    {c.desc}
                  </p>
                </div>
              </div>

              <div className="p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[12px] text-slate-500">Giá</p>
                  <p className="font-extrabold text-[18px] text-sky-700">
                    {formatVND(c.price)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="px-3 py-2 rounded-2xl bg-sky-100 border-2 border-sky-300 font-extrabold text-[13px] inline-flex items-center gap-2">
                    <BadgeCheck className="w-4 h-4 text-sky-600" />
                    Chi tiết
                  </div>
                  <div className="px-4 py-2 rounded-2xl bg-sky-500 border-2 border-sky-600 text-white font-extrabold text-[13px] shadow inline-flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    Mua ngay
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
