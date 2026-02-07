import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Menu,
  Bell,
  User,
  ChevronLeft,
  ChevronRight,
  Flame,
  ShieldCheck,
  Gamepad2,
  CreditCard,
  Gift,
  Sparkles,
  ArrowRight,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

type Category = {
  id: string;
  title: string;
  icon: any;
};

type ParentOrder = {
  id: string;
  title: string;
  subtitle: string;
  tag: string; // e.g. "HOT", "SALE"
  priceFrom: string;
  stock: number;
  thumb: string;
  banner?: string;
};

type TopRechargeItem = {
  nameMasked: string;
  amount: string;
};

function cn(...cls: (string | false | undefined | null)[]) {
  return cls.filter(Boolean).join(" ");
}

export default function ShopPage() {
  const [, navigate] = useLocation();

  const [q, setQ] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const banners = useMemo(
    () => [
      {
        id: "b1",
        img: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1600&auto=format&fit=crop",
        title: "SHOP DEV HVH",
        subtitle: "Kho đơn hàng đẹp — tối ưu mobile",
      },
      {
        id: "b2",
        img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1600&auto=format&fit=crop",
        title: "Flash Sale",
        subtitle: "Giảm mạnh hôm nay",
      },
      {
        id: "b3",
        img: "https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=1600&auto=format&fit=crop",
        title: "Mua nhanh",
        subtitle: "Bố cục gọn – nút không bị lùn",
      },
    ],
    []
  );

  const [bannerIndex, setBannerIndex] = useState(0);

  const topRecharge: TopRechargeItem[] = useMemo(
    () => [
      { nameMasked: "***02780969...", amount: "3.300.000đ" },
      { nameMasked: "***43650211...", amount: "3.000.000đ" },
      { nameMasked: "***93237345...", amount: "2.300.000đ" },
      { nameMasked: "***42641173...", amount: "2.000.000đ" },
      { nameMasked: "****kuto1234", amount: "2.000.000đ" },
    ],
    []
  );

  const categories: Category[] = useMemo(
    () => [
      { id: "cat-1", title: "ACC Game", icon: Gamepad2 },
      { id: "cat-2", title: "Nạp tiền", icon: CreditCard },
      { id: "cat-3", title: "Mini game", icon: Gift },
      { id: "cat-4", title: "VIP", icon: Sparkles },
    ],
    []
  );

  const parents: ParentOrder[] = useMemo(
    () => [
      {
        id: "p1",
        title: "Kho Nick Liên Quân",
        subtitle: "Nhiều loại nick • giao dịch nhanh",
        tag: "HOT",
        priceFrom: "29.000đ",
        stock: 811,
        thumb:
          "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1400&auto=format&fit=crop",
      },
      {
        id: "p2",
        title: "Acc Free Fire",
        subtitle: "Nick VIP • giá rẻ • uy tín",
        tag: "SALE",
        priceFrom: "19.000đ",
        stock: 527,
        thumb:
          "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=1400&auto=format&fit=crop",
      },
      {
        id: "p3",
        title: "Acc Roblox / Grow a Garden",
        subtitle: "Acc ngon • nhiều lựa chọn",
        tag: "NEW",
        priceFrom: "15.000đ",
        stock: 233,
        thumb:
          "https://images.unsplash.com/photo-1535223289827-42f1e9919769?q=80&w=1400&auto=format&fit=crop",
      },
      {
        id: "p4",
        title: "Acc Liên Minh / TFT",
        subtitle: "Rank cao • skin xịn",
        tag: "HOT",
        priceFrom: "35.000đ",
        stock: 98,
        thumb:
          "https://images.unsplash.com/photo-1511882150382-421056c89033?q=80&w=1400&auto=format&fit=crop",
      },
      {
        id: "p5",
        title: "Dịch vụ Shop",
        subtitle: "Cày thuê • nạp hộ • hỗ trợ nhanh",
        tag: "PRO",
        priceFrom: "10.000đ",
        stock: 999,
        thumb:
          "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1400&auto=format&fit=crop",
      },
    ],
    []
  );

  const filteredParents = useMemo(() => {
    const keyword = q.trim().toLowerCase();
    if (!keyword) return parents;
    return parents.filter((p) => (p.title + " " + p.subtitle).toLowerCase().includes(keyword));
  }, [q, parents]);

  const goNext = () => setBannerIndex((i) => (i + 1) % banners.length);
  const goPrev = () => setBannerIndex((i) => (i - 1 + banners.length) % banners.length);

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER giống kiểu web trong ảnh */}
      <div className="sticky top-0 z-40 bg-white/70 dark:bg-card/60 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 pt-3 pb-3">
          <div className="flex items-center gap-3">
            {/* Menu */}
            <button
              onClick={() => setMenuOpen(true)}
              className="w-10 h-10 rounded-2xl bg-white/70 dark:bg-card/60 game-border flex items-center justify-center active:scale-[0.98] transition"
              aria-label="Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Logo / Brand */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-primary/10 game-border flex items-center justify-center">
                  <Flame className="w-5 h-5 text-primary" />
                </div>
                <div className="leading-tight">
                  <p className="font-extrabold text-sm tracking-wide uppercase">
                    SHOP DEV HVH
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Giao diện gọn — tối ưu mobile
                  </p>
                </div>
              </div>
            </div>

            {/* Right icons */}
            <button
              onClick={() => alert("Thông báo (demo)")}
              className="w-10 h-10 rounded-2xl bg-white/70 dark:bg-card/60 game-border flex items-center justify-center active:scale-[0.98] transition"
              aria-label="Notify"
            >
              <Bell className="w-5 h-5" />
            </button>

            <button
              onClick={() => alert("Tài khoản (demo)")}
              className="w-10 h-10 rounded-2xl bg-white/70 dark:bg-card/60 game-border flex items-center justify-center active:scale-[0.98] transition"
              aria-label="Account"
            >
              <User className="w-5 h-5" />
            </button>
          </div>

          {/* Search bar */}
          <div className="mt-3">
            <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/70 dark:bg-card/60 game-border">
              <Search className="w-5 h-5 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm kiếm..."
                className="w-full bg-transparent outline-none text-sm"
              />
              {q?.length > 0 && (
                <button
                  onClick={() => setQ("")}
                  className="px-3 py-1 rounded-xl bg-primary/10 hover:bg-primary/20 font-bold text-xs"
                >
                  Xoá
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SLIDE MENU (trái -> phải) */}
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
              className="fixed left-0 top-0 bottom-0 z-50 w-[82%] max-w-sm bg-white/90 dark:bg-card/90 backdrop-blur-lg game-border rounded-r-3xl p-4"
              initial={{ x: -420 }}
              animate={{ x: 0 }}
              exit={{ x: -420 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 game-border flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-extrabold">Menu</p>
                    <p className="text-xs text-muted-foreground">Điều hướng nhanh</p>
                  </div>
                </div>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-10 h-10 rounded-2xl bg-white/70 dark:bg-card/60 game-border flex items-center justify-center"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/");
                  }}
                  className="w-full text-left p-4 rounded-2xl bg-white/70 dark:bg-card/60 game-border hover:scale-[1.01] transition"
                >
                  <p className="font-bold">Về Home</p>
                  <p className="text-xs text-muted-foreground">Trang chính</p>
                </button>

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="w-full text-left p-4 rounded-2xl bg-white/70 dark:bg-card/60 game-border hover:scale-[1.01] transition"
                >
                  <p className="font-bold">Kho đơn hàng</p>
                  <p className="text-xs text-muted-foreground">Xem danh sách</p>
                </button>

                <button
                  onClick={() => alert("Trang hỗ trợ (demo)")}
                  className="w-full text-left p-4 rounded-2xl bg-white/70 dark:bg-card/60 game-border hover:scale-[1.01] transition"
                >
                  <p className="font-bold">Hỗ trợ</p>
                  <p className="text-xs text-muted-foreground">Liên hệ admin</p>
                </button>
              </div>

              <div className="mt-4 p-4 rounded-2xl bg-primary/10 game-border">
                <p className="font-extrabold">Tip UI</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Nút “không bị lùn” → dùng <b>py-3</b> / <b>rounded-2xl</b> / font <b>bold</b>.
                </p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* BODY */}
      <div className="max-w-6xl mx-auto px-4 pt-4 pb-28">
        {/* Banner Slider giống ảnh */}
        <div className="rounded-3xl overflow-hidden game-border bg-white/60 dark:bg-card/60">
          <div className="relative h-[190px] sm:h-[240px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={banners[bannerIndex].id}
                className="absolute inset-0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <img
                  src={banners[bannerIndex].img}
                  alt="banner"
                  className="w-full h-full object-cover"
                />
                {/* overlay text */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute left-4 right-4 bottom-4">
                  <p className="text-white font-extrabold text-lg drop-shadow">
                    {banners[bannerIndex].title}
                  </p>
                  <p className="text-white/90 text-sm drop-shadow">
                    {banners[bannerIndex].subtitle}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Controls */}
            <button
              onClick={goPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-2xl bg-white/80 game-border flex items-center justify-center active:scale-[0.98] transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-2xl bg-white/80 game-border flex items-center justify-center active:scale-[0.98] transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-2">
              {banners.map((b, i) => (
                <button
                  key={b.id}
                  onClick={() => setBannerIndex(i)}
                  className={cn(
                    "w-2.5 h-2.5 rounded-full transition",
                    i === bannerIndex ? "bg-white" : "bg-white/50"
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Top Recharge box */}
        <div className="mt-4">
          <Card className="game-border bg-white/70 dark:bg-card/60">
            <CardContent className="pt-5 space-y-3">
              <div className="flex items-center justify-center gap-2">
                <span className="text-yellow-500 text-base">★</span>
                <p className="font-extrabold text-sm uppercase tracking-wide">
                  TOP NẠP THẺ THÁNG 2
                </p>
              </div>

              <div className="space-y-2">
                {topRecharge.map((t, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-3 py-2 rounded-2xl bg-white/70 dark:bg-card/60 game-border"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-500">★</span>
                      <p className="font-bold text-sm">{t.nameMasked}</p>
                    </div>
                    <p className="font-extrabold text-sm">{t.amount}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => alert("Nạp thẻ ngay (demo)")}
                className="w-full py-3 rounded-2xl bg-primary text-white font-extrabold shadow hover:opacity-95 active:scale-[0.99] transition"
              >
                Nạp thẻ ngay
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Categories row (nhỏ gọn đẹp) */}
        <div className="mt-4 grid grid-cols-4 gap-3">
          {categories.map((c) => {
            const Icon = c.icon;
            return (
              <button
                key={c.id}
                onClick={() => alert(`Mở danh mục: ${c.title} (demo)`)}
                className="rounded-2xl bg-white/70 dark:bg-card/60 game-border p-3 flex flex-col items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition"
              >
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center game-border">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <p className="text-[11px] font-extrabold text-center leading-tight">
                  {c.title}
                </p>
              </button>
            );
          })}
        </div>

        {/* Section title + view all */}
        <div className="mt-6 flex items-center justify-between">
          <div>
            <p className="font-extrabold text-base">KHO ĐƠN HÀNG</p>
            <p className="text-xs text-muted-foreground">
              Bấm vào để xem chi tiết & đơn hàng con
            </p>
          </div>
          <button
            onClick={() => alert("Xem tất cả (demo)")}
            className="px-3 py-2 rounded-2xl bg-white/70 dark:bg-card/60 game-border font-bold text-sm hover:scale-[1.02] active:scale-[0.99] transition"
          >
            Xem tất cả <ArrowRight className="w-4 h-4 inline ml-1" />
          </button>
        </div>

        {/* Parent orders list (đẹp giống ảnh) */}
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredParents.map((p) => (
            <motion.button
              key={p.id}
              whileTap={{ scale: 0.99 }}
              onClick={() => navigate(`/shop/${p.id}`)}
              className="text-left rounded-3xl bg-white/70 dark:bg-card/60 game-border overflow-hidden shadow-sm hover:shadow-md transition"
            >
              {/* image */}
              <div className="relative">
                <img src={p.thumb} alt={p.title} className="w-full h-[150px] object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                {/* tag */}
                <div className="absolute top-3 left-3">
                  <div
                    className={cn(
                      "px-3 py-1 rounded-full text-[11px] font-extrabold shadow",
                      p.tag === "HOT" && "bg-red-500 text-white",
                      p.tag === "SALE" && "bg-yellow-300 text-black",
                      p.tag === "NEW" && "bg-emerald-500 text-white",
                      p.tag === "PRO" && "bg-indigo-500 text-white"
                    )}
                  >
                    {p.tag}
                  </div>
                </div>

                {/* stock */}
                <div className="absolute top-3 right-3">
                  <div className="px-3 py-1 rounded-full bg-white/80 dark:bg-card/80 game-border text-[11px] font-bold">
                    Còn: {p.stock}
                  </div>
                </div>

                {/* title overlay */}
                <div className="absolute left-4 right-4 bottom-3">
                  <p className="text-white font-extrabold text-base drop-shadow line-clamp-1">
                    {p.title}
                  </p>
                  <p className="text-white/90 text-xs drop-shadow line-clamp-1">
                    {p.subtitle}
                  </p>
                </div>
              </div>

              {/* body */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Giá từ</p>
                    <p className="font-extrabold text-primary text-lg">{p.priceFrom}</p>
                  </div>
                  <div className="px-3 py-2 rounded-2xl bg-primary text-white font-extrabold text-sm shadow hover:opacity-95 transition">
                    Xem ngay
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  Bấm để mở tab chi tiết và hiển thị 5 đơn hàng con.
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Footer info */}
        <div className="mt-8 rounded-3xl bg-white/70 dark:bg-card/60 game-border p-4">
          <p className="font-extrabold">Liên hệ</p>
          <p className="text-sm text-muted-foreground mt-1">
            Zalo/FB: (bạn thay link) • Hỗ trợ 24/7 • Giao dịch nhanh.
          </p>
        </div>
      </div>

      {/* Bottom Tab Bar giống ảnh */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        <div className="max-w-6xl mx-auto px-4 pb-3">
          <div className="rounded-3xl bg-white/80 dark:bg-card/70 backdrop-blur-md game-border px-3 py-2 flex items-center justify-between">
            <TabItem label="Home" active onClick={() => navigate("/shop")} icon={Flame} />
            <TabItem label="Dịch vụ" onClick={() => alert("Dịch vụ (demo)")} icon={Sparkles} />
            <TabItem label="Nạp tiền" onClick={() => alert("Nạp tiền (demo)")} icon={CreditCard} />
            <TabItem label="Mini Game" onClick={() => alert("Mini game (demo)")} icon={Gift} />
            <TabItem label="Tài khoản" onClick={() => alert("Tài khoản (demo)")} icon={User} />
          </div>
        </div>
      </div>
    </div>
  );
}

function TabItem({
  label,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  icon: any;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-2xl transition",
        active
          ? "bg-primary/15 text-primary font-extrabold"
          : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
      )}
    >
      <Icon className="w-5 h-5" />
      <span className="text-[11px] leading-none">{label}</span>
    </button>
  );
}
