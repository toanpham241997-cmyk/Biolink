import { useMemo, useState } from "react";
import { useLocation, useRoute } from "wouter";
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
  ArrowLeft,
  ChevronRight,
  ShoppingBag,
  BadgeCheck,
  Star,
} from "lucide-react";
import { parents as rawParents } from "./shop.data";

/** ========== utils ========== */
function cn(...cls: (string | false | undefined | null)[]) {
  return cls.filter(Boolean).join(" ");
}
function formatVND(n: number) {
  const s = Math.round(n).toString();
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "₫";
}

/** ========== types ========== */
type ChildOrder = {
  id: string;
  title: string;
  desc: string;
  price: number;
  tag?: string;
  highlights?: string[];
};

type ParentOrder = {
  id: string;
  title: string;
  subtitle: string;
  cover: string;
  tag: string;
  desc?: string;
  children?: ChildOrder[];
};

/** Nếu shop.data chưa có children thì tự tạo 5 đơn con demo */
function ensureChildren(p: ParentOrder): ParentOrder {
  if (p.children && p.children.length > 0) return p;
  const base = 29000 + Math.floor(Math.random() * 50000);

  const children: ChildOrder[] = Array.from({ length: 5 }).map((_, i) => ({
    id: `c${i + 1}`,
    title: `${p.title} - Gói ${i + 1}`,
    desc:
      i === 0
        ? "Bản cơ bản, gọn nhẹ, phù hợp người mới."
        : i === 1
        ? "Bản nâng cấp, thêm nhiều mục và tài liệu."
        : i === 2
        ? "Bản PRO, tối ưu trải nghiệm, đầy đủ thành phần."
        : i === 3
        ? "Bản BUNDLE, trọn bộ + hướng dẫn + update."
        : "Bản CUSTOM theo yêu cầu, hỗ trợ riêng.",
    price: base + i * 35000,
    tag: i === 0 ? "BEST" : i === 2 ? "HOT" : i === 4 ? "VIP" : "NEW",
    highlights: [
      "Tối ưu mobile, dễ bấm",
      "Có tài liệu hướng dẫn",
      "Nhận ngay sau thanh toán",
    ],
  }));

  return { ...p, children };
}

function Pill({
  children,
  className,
}: {
  children: any;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-3 py-1 rounded-full",
        "bg-sky-50 border-2 border-sky-200 text-sky-900",
        "font-extrabold text-[12px]",
        className
      )}
    >
      {children}
    </span>
  );
}

/** ========== main ========== */
export default function Shop() {
  const [, navigate] = useLocation();

  // /shop
  // /shop/p/:parentId
  // /shop/p/:parentId/:childId
  const [isParentRoute, parentParams] = useRoute("/shop/p/:parentId");
  const [isChildRoute, childParams] = useRoute("/shop/p/:parentId/:childId");

  const parentId = isChildRoute
    ? (childParams as any)?.parentId
    : isParentRoute
    ? (parentParams as any)?.parentId
    : null;

  const childId = isChildRoute ? (childParams as any)?.childId : null;

  const [q, setQ] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const parents = useMemo(() => {
    const list: ParentOrder[] = (rawParents as any[]).map((p) => ({
      id: p.id,
      title: p.title,
      subtitle: p.subtitle,
      cover: p.cover,
      tag: p.tag || "HOT",
      desc: p.desc || "",
      children: p.children,
    }));
    return list.map(ensureChildren);
  }, []);

  const currentParent = useMemo(() => {
    if (!parentId) return null;
    return parents.find((p) => p.id === parentId) || null;
  }, [parents, parentId]);

  const currentChild = useMemo(() => {
    if (!currentParent || !childId) return null;
    return currentParent.children?.find((c) => c.id === childId) || null;
  }, [currentParent, childId]);

  // Search theo context
  const filteredParents = useMemo(() => {
    const k = q.trim().toLowerCase();
    if (currentParent) return parents; // trang cha/con không dùng list cha
    if (!k) return parents;
    return parents.filter((p) =>
      `${p.title} ${p.subtitle} ${p.tag}`.toLowerCase().includes(k)
    );
  }, [q, parents, currentParent]);

  const filteredChildren = useMemo(() => {
    if (!currentParent) return [];
    const list = currentParent.children || [];
    const k = q.trim().toLowerCase();
    if (!k) return list;
    return list.filter((c) =>
      `${c.title} ${c.desc} ${c.tag}`.toLowerCase().includes(k)
    );
  }, [q, currentParent]);

  const goHome = () => navigate("/shop");
  const goParent = (id: string) => navigate(`/shop/p/${id}`);
  const goChild = (pid: string, cid: string) => navigate(`/shop/p/${pid}/${cid}`);

  const buyNow = (label: string) => {
    alert(`Mua ngay: ${label}\n(Demo — bạn thay bằng thanh toán thật)`);
  };

  /** ===========================
   *  HEADER (CẢI TIẾN: GỌN, KHÔNG CAO)
   *  - Chỉ 2 hàng: top bar + search
   *  - Top bar không wrap: nút nhỏ, chữ gọn
   =========================== */
  return (
    <div className="min-h-screen bg-[#eaf6ff]">
      <div className="sticky top-0 z-40 px-3 pt-3">
        <div className="max-w-3xl mx-auto">
          <div
            className={cn(
              "rounded-[24px] bg-white/90 backdrop-blur-md",
              "border-[3px] border-sky-500",
              "shadow-[0_10px_25px_rgba(2,132,199,0.16)]",
              "px-3 py-2"
            )}
          >
            {/* TOP BAR */}
            <div className="flex items-center gap-2">
              {/* Menu */}
              <button
                onClick={() => setMenuOpen(true)}
                className={cn(
                  "w-10 h-10 rounded-2xl bg-white",
                  "border-[2px] border-sky-300 shadow-sm",
                  "flex items-center justify-center active:scale-[0.98] transition"
                )}
                aria-label="Menu"
              >
                <Menu className="w-5 h-5 text-sky-600" />
              </button>

              {/* Back (khi đang ở trang cha/con) */}
              {(currentParent || currentChild) && (
                <button
                  onClick={() => {
                    if (currentChild && currentParent) goParent(currentParent.id);
                    else goHome();
                  }}
                  className={cn(
                    "w-10 h-10 rounded-2xl bg-sky-100",
                    "border-[2px] border-sky-200",
                    "flex items-center justify-center active:scale-[0.98] transition"
                  )}
                  aria-label="Back"
                >
                  <ArrowLeft className="w-5 h-5 text-sky-700" />
                </button>
              )}

              {/* Brand */}
              <div className="flex-1 min-w-0 leading-tight">
                <p className="font-extrabold text-[14px] tracking-wide truncate">
                  SHOP DEV HVH
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  Shop dữ liệu & tài nguyên dev
                </p>
              </div>

              {/* Auth (nhỏ gọn, không bị xuống dòng) */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => alert("Đăng nhập (demo)")}
                  className={cn(
                    "h-10 px-3 rounded-2xl bg-sky-100 text-sky-900",
                    "font-extrabold text-[12px] border-2 border-sky-300",
                    "active:scale-[0.98] transition inline-flex items-center gap-2"
                  )}
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">Đăng nhập</span>
                </button>

                <button
                  onClick={() => alert("Đăng ký (demo)")}
                  className={cn(
                    "h-10 px-3 rounded-2xl bg-sky-500 text-white",
                    "font-extrabold text-[12px] border-2 border-sky-600 shadow",
                    "active:scale-[0.98] transition inline-flex items-center gap-2"
                  )}
                >
                  <UserPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">Đăng ký</span>
                </button>
              </div>
            </div>

            {/* SEARCH (gọn) */}
            <div className="mt-2">
              <div className="flex items-center gap-2 px-3 h-11 rounded-2xl bg-white border-2 border-sky-200 shadow-sm">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  className="w-full bg-transparent outline-none text-[13px]"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={
                    currentChild
                      ? "Tìm trong chi tiết..."
                      : currentParent
                      ? "Tìm đơn hàng con..."
                      : "Tìm đơn hàng cha..."
                  }
                />
                {!!q && (
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
                  <div className="w-10 h-10 rounded-2xl bg-sky-100 border-2 border-sky-300 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-sky-600" />
                  </div>
                  <div>
                    <p className="font-extrabold">Menu</p>
                    <p className="text-xs text-slate-500">Điều hướng nhanh</p>
                  </div>
                </div>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-10 h-10 rounded-2xl bg-white border-2 border-sky-300 flex items-center justify-center"
                >
                  <X className="w-5 h-5 text-sky-600" />
                </button>
              </div>

              <div className="mt-4 space-y-2">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/shop");
                  }}
                  className="w-full text-left p-4 rounded-2xl bg-sky-50 border-2 border-sky-200 font-extrabold active:scale-[0.99] transition"
                >
                  Trang Shop
                  <p className="text-xs text-slate-500 font-normal mt-1">
                    Danh sách đơn hàng cha
                  </p>
                </button>

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    const el = document.getElementById("orders");
                    el?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="w-full text-left p-4 rounded-2xl bg-sky-50 border-2 border-sky-200 font-extrabold active:scale-[0.99] transition"
                >
                  Danh sách đơn hàng
                  <p className="text-xs text-slate-500 font-normal mt-1">
                    Bấm để xem cha/con
                  </p>
                </button>

                <button
                  onClick={() => alert("Liên hệ (demo)")}
                  className="w-full text-left p-4 rounded-2xl bg-sky-50 border-2 border-sky-200 font-extrabold active:scale-[0.99] transition"
                >
                  Liên hệ / Hỗ trợ
                  <p className="text-xs text-slate-500 font-normal mt-1">
                    Zalo / Email / Hotline
                  </p>
                </button>

                <div className="p-4 rounded-2xl bg-white border-2 border-sky-200">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-5 h-5 text-sky-600 mt-0.5" />
                    <div>
                      <p className="font-extrabold text-sm">Tip</p>
                      <p className="text-xs text-slate-500">
                        Bấm đơn cha để mở 5 đơn con. Bấm đơn con để xem chi tiết + mua ngay.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* MAIN */}
      <div className="max-w-3xl mx-auto px-3 pt-4 pb-10">
        {/* ========== CHILD DETAIL ========== */}
        {currentParent && currentChild && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="rounded-[30px] bg-white border-[3px] border-sky-400 shadow-[0_18px_40px_rgba(2,132,199,0.18)] p-4">
              <p className="text-xs text-slate-500">
                <button
                  onClick={() => navigate("/shop")}
                  className="font-bold text-sky-700 hover:underline"
                >
                  Shop
                </button>{" "}
                <ChevronRight className="inline w-4 h-4" />{" "}
                <button
                  onClick={() => goParent(currentParent.id)}
                  className="font-bold text-sky-700 hover:underline"
                >
                  {currentParent.title}
                </button>
              </p>

              <p className="mt-2 font-extrabold text-[20px] text-slate-900">
                {currentChild.title}
              </p>
              <p className="mt-1 text-[14px] text-slate-600">{currentChild.desc}</p>

              <div className="mt-3 flex flex-wrap gap-2">
                <Pill>🏷 {currentChild.tag || "NEW"}</Pill>
                <Pill>💸 {formatVND(currentChild.price)}</Pill>
              </div>

              <div className="mt-4 rounded-[26px] bg-sky-50 border-[3px] border-sky-300 p-4">
                <p className="font-extrabold text-[14px]">Điểm nổi bật</p>
                <ul className="mt-2 space-y-2 text-[13px] text-slate-700">
                  {(currentChild.highlights || []).map((h, i) => (
                    <li key={i}>✅ {h}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => buyNow(`${currentParent.title} → ${currentChild.title}`)}
                  className="flex-1 px-4 py-3 rounded-2xl bg-sky-500 text-white font-extrabold text-[14px] border-2 border-sky-600 shadow active:scale-[0.99] transition inline-flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Mua ngay
                </button>
                <button
                  onClick={() => alert("Demo: Nhận link sau thanh toán")}
                  className="px-4 py-3 rounded-2xl bg-white border-2 border-sky-300 font-extrabold text-[14px] text-sky-700 shadow-sm active:scale-[0.99] transition"
                >
                  Nhận link
                </button>
              </div>
            </div>

            <button
              onClick={() => goParent(currentParent.id)}
              className="mt-4 w-full px-4 py-3 rounded-2xl bg-white border-[3px] border-sky-300 font-extrabold text-sky-700 shadow active:scale-[0.99] transition"
            >
              Quay lại đơn cha
            </button>

            <Footer />
          </motion.div>
        )}

          {/* ========== PARENT DETAIL (SHOW CHILDREN) ========== */}
        {currentParent && !currentChild && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="rounded-[30px] overflow-hidden bg-white border-[3px] border-sky-400 shadow-[0_18px_40px_rgba(2,132,199,0.18)]">
              <div className="relative">
                <img src={currentParent.cover} className="w-full h-[190px] object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 rounded-full bg-white/90 border-2 border-white font-extrabold text-[12px]">
                    {currentParent.tag}
                  </span>
                </div>

                <div className="absolute bottom-3 left-4 right-4">
                  <p className="text-white font-extrabold text-[18px] drop-shadow">
                    {currentParent.title}
                  </p>
                  <p className="text-white/90 text-[13px] drop-shadow">
                    {currentParent.subtitle}
                  </p>
                </div>
              </div>

              <div className="p-4">
                <div className="rounded-[26px] bg-sky-50 border-[3px] border-sky-300 p-4">
                  <p className="font-extrabold text-[14px]">Mô tả</p>
                  <p className="mt-1 text-[13px] text-slate-700">
                    {currentParent.desc ||
                      "Bấm vào đơn con để xem chi tiết & mua ngay."}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between px-1">
                  <p className="font-extrabold text-[16px] text-slate-900">Đơn hàng con</p>
                  <p className="text-[12px] text-slate-500">
                    {filteredChildren.length} mục
                  </p>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3">
                  {filteredChildren.map((c) => (
                    <div
                      key={c.id}
                      className="rounded-[28px] bg-white border-[3px] border-sky-300 shadow-sm p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-extrabold text-[15px] text-slate-900 truncate">
                            {c.title}
                          </p>
                          <p className="text-[13px] text-slate-600 mt-1">
                            {c.desc}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <Pill>🏷 {c.tag || "NEW"}</Pill>
                            <Pill>💸 {formatVND(c.price)}</Pill>
                          </div>
                        </div>

                        <button
                          onClick={() => goChild(currentParent.id, c.id)}
                          className="shrink-0 px-4 py-2 rounded-2xl bg-sky-500 text-white font-extrabold text-[13px] border-2 border-sky-600 shadow active:scale-[0.99] transition inline-flex items-center gap-2"
                        >
                          Xem <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => buyNow(`${currentParent.title} → ${c.title}`)}
                          className="flex-1 px-4 py-3 rounded-2xl bg-sky-100 text-sky-900 font-extrabold text-[13px] border-2 border-sky-300 active:scale-[0.99] transition inline-flex items-center justify-center gap-2"
                        >
                          <ShoppingBag className="w-5 h-5 text-sky-700" />
                          Mua ngay
                        </button>
                        <button
                          onClick={() => goChild(currentParent.id, c.id)}
                          className="px-4 py-3 rounded-2xl bg-white text-sky-700 font-extrabold text-[13px] border-2 border-sky-300 active:scale-[0.99] transition"
                        >
                          Chi tiết
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => goHome()}
              className="mt-4 w-full px-4 py-3 rounded-2xl bg-white border-[3px] border-sky-300 font-extrabold text-sky-700 shadow active:scale-[0.99] transition"
            >
              Quay lại shop
            </button>

            <Footer />
          </motion.div>
        )}

        {/* ========== HOME LIST (PARENTS) ========== */}
        {!currentParent && (
          <>
            {/* INTRO */}
            <div className="pt-1">
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
                      <div className="flex flex-wrap gap-2">
                        <Pill>
                          <BadgeCheck className="w-4 h-4 text-sky-700" />
                          Mobile gọn đẹp
                        </Pill>
                        <Pill>
                          <Star className="w-4 h-4 text-sky-700" />
                          Giá & mô tả khác nhau
                        </Pill>
                        <Pill>
                          <ShoppingBag className="w-4 h-4 text-sky-700" />
                          Có mua ngay
                        </Pill>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ORDERS (CHA) */}
            <div id="orders" className="pt-5 pb-10">
              <div className="flex items-center justify-between px-1">
                <p className="font-extrabold text-[16px] text-slate-900">Đơn hàng cha</p>
                <p className="text-[12px] text-slate-500">{filteredParents.length} mục</p>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-4">
                {filteredParents.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => goParent(p.id)}
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
                        <p className="text-white/90 text-[13px] drop-shadow">
                          {p.subtitle}
                        </p>
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

              <Footer />
            </div>
          </>
        )}

        {/* ========== NOT FOUND (fallback) ========== */}
        {parentId && !currentParent && (
          <div className="pt-6">
            <div className="rounded-[30px] bg-white border-[3px] border-sky-400 shadow-[0_18px_40px_rgba(2,132,199,0.18)] p-6 text-center">
              <p className="font-extrabold text-[18px]">Không tìm thấy đơn hàng</p>
              <button
                onClick={() => goHome()}
                className="mt-4 w-full px-4 py-3 rounded-2xl bg-sky-500 text-white font-extrabold border-2 border-sky-600 shadow active:scale-[0.99] transition"
              >
                Quay lại shop
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** ========== Footer ========== */
function Footer() {
  return (
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
  );
        }
