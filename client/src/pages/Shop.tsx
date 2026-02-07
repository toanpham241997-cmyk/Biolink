import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Sparkles,
  Search,
  LogIn,
  UserPlus,
  ArrowRight,
  Flame,
  ShieldCheck,
} from "lucide-react";
import { parents } from "./shop.data";

function cn(...cls: (string | false | undefined | null)[]) {
  return cls.filter(Boolean).join(" ");
}

export default function Shop() {
  const [, navigate] = useLocation();
  const [q, setQ] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();
    if (!k) return parents;
    return parents.filter((p) => (p.title + " " + p.subtitle).toLowerCase().includes(k));
  }, [q]);

  return (
    <div className="min-h-screen bg-[#eaf6ff]">
      {/* HEADER */}
      <div className="sticky top-0 z-40 px-3 pt-3">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-[28px] bg-white/85 backdrop-blur-md border-[3px] border-sky-500 shadow-[0_10px_30px_rgba(2,132,199,0.18)] p-3">
            <div className="flex items-center gap-3">
              {/* Nút 3 gạch */}
              <button
                onClick={() => setMenuOpen(true)}
                className="w-11 h-11 rounded-2xl bg-white border-[3px] border-sky-400 shadow-sm flex items-center justify-center active:scale-[0.98] transition"
                aria-label="Menu"
              >
                <Menu className="w-6 h-6 text-sky-600" />
              </button>

              {/* Brand */}
              <div className="flex-1 leading-tight">
                <p className="font-extrabold text-[15px] tracking-wide">SHOP DEV HVH</p>
                <p className="text-[12px] text-slate-500">
                  Shop dữ liệu & tài nguyên dev
                </p>
              </div>

              {/* Login/Register nhỏ gọn */}
              <button
                onClick={() => alert("Đăng nhập (demo)")}
                className="px-3 py-2 rounded-2xl bg-sky-100 text-sky-800 font-extrabold text-[13px] border-2 border-sky-300 active:scale-[0.98] transition inline-flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                Đăng nhập
              </button>

              <button
                onClick={() => alert("Đăng ký (demo)")}
                className="px-3 py-2 rounded-2xl bg-sky-500 text-white font-extrabold text-[13px] border-2 border-sky-600 shadow active:scale-[0.98] transition inline-flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Đăng ký
              </button>
            </div>

            {/* Search */}
            <div className="mt-3">
              <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white border-2 border-sky-200 shadow-sm">
                <Search className="w-5 h-5 text-slate-400" />
                <input
                  className="w-full bg-transparent outline-none text-[14px]"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Tìm đơn hàng..."
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
      </div>

      {/* SLIDE MENU */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.aside
              className="fixed left-0 top-0 bottom-0 z-50 w-[85%] max-w-sm bg-white border-r-[3px] border-sky-400 rounded-r-[30px] p-4 shadow-[0_20px_50px_rgba(2,132,199,0.25)]"
              initial={{ x: -420 }}
              animate={{ x: 0 }}
              exit={{ x: -420 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-11 h-11 rounded-2xl bg-sky-100 border-2 border-sky-300 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-sky-600" />
                  </div>
                  <div>
                    <p className="font-extrabold">Menu</p>
                    <p className="text-xs text-slate-500">Điều hướng nhanh</p>
                  </div>
                </div>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-11 h-11 rounded-2xl bg-white border-2 border-sky-300 flex items-center justify-center"
                >
                  <X className="w-6 h-6 text-sky-600" />
                </button>
              </div>

              <div className="mt-4 space-y-2">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="w-full text-left p-4 rounded-2xl bg-sky-50 border-2 border-sky-200 font-bold active:scale-[0.99] transition"
                >
                  Lên đầu trang
                  <p className="text-xs text-slate-500 font-normal mt-1">Header + search</p>
                </button>

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    const el = document.getElementById("orders");
                    el?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="w-full text-left p-4 rounded-2xl bg-sky-50 border-2 border-sky-200 font-bold active:scale-[0.99] transition"
                >
                  Danh sách đơn hàng
                  <p className="text-xs text-slate-500 font-normal mt-1">Bấm để xem cha/con</p>
                </button>

                <button
                  onClick={() => alert("Liên hệ (demo)")}
                  className="w-full text-left p-4 rounded-2xl bg-sky-50 border-2 border-sky-200 font-bold active:scale-[0.99] transition"
                >
                  Liên hệ / hỗ trợ
                  <p className="text-xs text-slate-500 font-normal mt-1">Zalo / FB</p>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* INTRO */}
      <div className="max-w-3xl mx-auto px-3 pt-4">
        <div className="rounded-[30px] bg-white border-[3px] border-sky-400 shadow-[0_18px_40px_rgba(2,132,199,0.18)] p-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 border-2 border-sky-300 flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-sky-600" />
            </div>
            <div className="flex-1">
              <p className="font-extrabold text-[18px]">Giới thiệu</p>
              <p className="text-[14px] text-slate-600 mt-1">
                Đây là trang shop demo. Bấm vào <b>đơn hàng cha</b> để xem danh sách
                <b> đơn hàng con</b>. Bấm vào <b>đơn con</b> để xem chi tiết + mua ngay.
              </p>

              <div className="mt-4 rounded-[26px] bg-sky-50 border-[3px] border-sky-300 p-4 shadow-sm">
                <ul className="space-y-2 text-[14px] text-slate-700">
                  <li>✅ Giao diện đẹp, gọn, dễ bấm trên điện thoại.</li>
                  <li>✅ Mỗi đơn có giá & mô tả khác nhau.</li>
                  <li>✅ Có nút “Mua ngay” + trang chi tiết.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ORDERS (CHA) */}
      <div id="orders" className="max-w-3xl mx-auto px-3 pt-5 pb-10">
        <div className="flex items-center justify-between px-1">
          <p className="font-extrabold text-[16px] text-slate-900">Đơn hàng cha</p>
          <p className="text-[12px] text-slate-500">{filtered.length} mục</p>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-4">
          {filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => navigate(`/shop/p/${p.id}`)}
              className="text-left rounded-[30px] overflow-hidden bg-white border-[3px] border-sky-400 shadow-[0_16px_35px_rgba(2,132,199,0.16)] active:scale-[0.995] transition"
            >
              <div className="relative">
                <img src={p.cover} className="w-full h-[190px] object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 rounded-full bg-white/90 border-2 border-white font-extrabold text-[12px]">
                    {p.tag}
                  </span>
                </div>

                <div className="absolute bottom-3 left-4 right-4">
                  <p className="text-white font-extrabold text-[18px] drop-shadow">
                    {p.title}
                  </p>
                  <p className="text-white/90 text-[13px] drop-shadow">{p.subtitle}</p>
                </div>
              </div>

              <div className="p-4 flex items-center justify-between gap-3">
                <div className="text-slate-600 text-[13px]">
                  Bấm để mở đơn con (5 mục)
                </div>
                <div className="px-4 py-2 rounded-2xl bg-sky-500 text-white font-extrabold text-[13px] border-2 border-sky-600 shadow inline-flex items-center gap-2">
                  Xem đơn con <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 rounded-[30px] bg-white border-[3px] border-sky-400 p-4 shadow-[0_16px_35px_rgba(2,132,199,0.14)]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-sky-100 border-2 border-sky-300 flex items-center justify-center">
              <Flame className="w-6 h-6 text-sky-600" />
            </div>
            <div>
              <p className="font-extrabold">Liên hệ</p>
              <p className="text-[13px] text-slate-600">
                Zalo/FB: (bạn thay link) • Hỗ trợ nhanh • Uy tín
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
