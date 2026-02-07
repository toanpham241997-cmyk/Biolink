import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  ShoppingBag,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  User,
  LogIn,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Globe,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

type ShopItem = {
  id: string;
  title: string;
  desc: string;
  detail: string;
  image: string;
  price: string;
  badge: string; // tem
  category: string;
};

export default function ShopPage() {
  const [, navigate] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const items: ShopItem[] = useMemo(
    () => [
      {
        id: "order-001",
        title: "Gói UI Bio Premium",
        desc: "Full UI + animation, tối ưu mobile.",
        detail:
          "✅ Gồm: UI bio + hiệu ứng + responsive.\n✅ Hỗ trợ: React/Vite.\n✅ Nhận link tải riêng trong trang chi tiết.",
        image:
          "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop",
        price: "0₫",
        badge: "FREE DOWNLOAD",
        category: "UI",
      },
      {
        id: "order-002",
        title: "Icon Pack Neon",
        desc: "Icon đẹp cho menu, header, button.",
        detail:
          "✅ 300+ icon.\n✅ PNG/SVG.\n✅ Nhận link tải riêng trong trang chi tiết.",
        image:
          "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1200&auto=format&fit=crop",
        price: "0₫",
        badge: "FREE DOWNLOAD",
        category: "ICON",
      },
      {
        id: "order-003",
        title: "Landing Sections Pack",
        desc: "Section sẵn, chuẩn responsive.",
        detail:
          "✅ Hero, Feature, Pricing, FAQ.\n✅ Tailwind ready.\n✅ Link tải riêng trong chi tiết.",
        image:
          "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1200&auto=format&fit=crop",
        price: "0₫",
        badge: "FREE DOWNLOAD",
        category: "WEB",
      },
      {
        id: "order-004",
        title: "Motion FX Kit",
        desc: "Hiệu ứng mượt, gắn vào UI.",
        detail:
          "✅ Framer Motion presets.\n✅ Hiệu ứng hover/click.\n✅ Link tải riêng trong chi tiết.",
        image:
          "https://images.unsplash.com/photo-1526948128573-703ee1aeb6fa?q=80&w=1200&auto=format&fit=crop",
        price: "0₫",
        badge: "FREE DOWNLOAD",
        category: "FX",
      },
      {
        id: "order-005",
        title: "Template Bio Game",
        desc: "Phong cách game-like + đẹp mắt.",
        detail:
          "✅ Theme game.\n✅ Button + card đẹp.\n✅ Link tải riêng trong chi tiết.",
        image:
          "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200&auto=format&fit=crop",
        price: "0₫",
        badge: "FREE DOWNLOAD",
        category: "BIO",
      },
      {
        id: "order-006",
        title: "Header Pack Pro",
        desc: "10 kiểu header xịn cho web.",
        detail:
          "✅ Desktop + Mobile.\n✅ Có menu trượt.\n✅ Link tải riêng trong chi tiết.",
        image:
          "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200&auto=format&fit=crop",
        price: "0₫",
        badge: "FREE DOWNLOAD",
        category: "HEADER",
      },
      {
        id: "order-007",
        title: "Footer Pack",
        desc: "Footer liên hệ + social đẹp.",
        detail:
          "✅ 8 mẫu footer.\n✅ Chuẩn responsive.\n✅ Link tải riêng trong chi tiết.",
        image:
          "https://images.unsplash.com/photo-1556761175-4b46a572b786?q=80&w=1200&auto=format&fit=crop",
        price: "0₫",
        badge: "FREE DOWNLOAD",
        category: "FOOTER",
      },
      {
        id: "order-008",
        title: "Card Product Kit",
        desc: "Card sản phẩm kiểu shop đẹp.",
        detail:
          "✅ Card giá, giảm giá, badge.\n✅ Dễ tái sử dụng.\n✅ Link tải riêng trong chi tiết.",
        image:
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop",
        price: "0₫",
        badge: "FREE DOWNLOAD",
        category: "CARD",
      },
      {
        id: "order-009",
        title: "Profile Components",
        desc: "Component hồ sơ + stats.",
        detail:
          "✅ Avatar + stats + badge.\n✅ Gắn vào bio.\n✅ Link tải riêng trong chi tiết.",
        image:
          "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop",
        price: "0₫",
        badge: "FREE DOWNLOAD",
        category: "PROFILE",
      },
      {
        id: "order-010",
        title: "Mega UI Bundle",
        desc: "Combo UI dùng nhanh cho dự án.",
        detail:
          "✅ Tổng hợp pack UI.\n✅ Update thường xuyên.\n✅ Link tải riêng trong chi tiết.",
        image:
          "https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=1200&auto=format&fit=crop",
        price: "0₫",
        badge: "FREE DOWNLOAD",
        category: "BUNDLE",
      },
    ],
    []
  );

  return (
    <div className="min-h-screen px-4 pt-20 pb-14 max-w-6xl mx-auto">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-40">
        <div className="max-w-6xl mx-auto px-4 pt-4">
          <div className="rounded-2xl bg-white/70 dark:bg-card/60 backdrop-blur-sm game-border px-3 py-3 flex items-center justify-between">
            {/* Left: menu + title */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMenuOpen(true)}
                className="w-10 h-10 rounded-xl bg-primary/10 game-border flex items-center justify-center active:scale-[0.98] transition"
                aria-label="Menu"
              >
                <Menu className="w-5 h-5 text-primary" />
              </button>

              <div className="leading-tight">
                <p className="font-extrabold text-sm tracking-wide uppercase">
                  SHOP DEV HVH
                </p>
                <p className="text-xs text-muted-foreground">
                  Shop dữ liệu & tài nguyên dev
                </p>
              </div>
            </div>

            {/* Right: auth */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => alert("Bạn chưa gắn trang login.")}
                className="px-3 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 font-bold transition flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                Đăng nhập
              </button>
              <button
                onClick={() => alert("Bạn chưa gắn trang register.")}
                className="px-3 py-2 rounded-xl bg-primary text-white hover:opacity-95 font-extrabold transition flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                Đăng ký
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Menu */}
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
                    <ShoppingBag className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-extrabold">Menu</p>
                    <p className="text-xs text-muted-foreground">Điều hướng nhanh</p>
                  </div>
                </div>

                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-10 h-10 rounded-xl bg-white/70 dark:bg-card/60 game-border flex items-center justify-center"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
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
                  <p className="font-bold">Danh sách đơn hàng</p>
                  <p className="text-xs text-muted-foreground">Xem 10 đơn hàng</p>
                </button>

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    const el = document.getElementById("contact");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="w-full text-left p-4 rounded-2xl bg-white/70 dark:bg-card/60 game-border hover:scale-[1.01] transition"
                >
                  <p className="font-bold">Liên hệ</p>
                  <p className="text-xs text-muted-foreground">Thông tin liên hệ</p>
                </button>
              </div>

              <div className="mt-4 p-4 rounded-2xl bg-primary/10 game-border">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-extrabold">Gợi ý</p>
                    <p className="text-sm text-muted-foreground">
                      Bạn nên để bucket <b>PUBLIC</b> để link tải hoạt động ngay.
                    </p>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Intro box */}
      <motion.div
        className="mt-8"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="game-border bg-white/70 dark:bg-card/60 backdrop-blur-sm">
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 game-border flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-extrabold text-lg">Giới thiệu</p>
                <p className="text-sm text-muted-foreground">
                  Đây là trang shop demo. Mỗi đơn hàng đều có trang chi tiết riêng,
                  trong đó có nút <b>Nhận ngay</b> để mở link tải.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/70 dark:bg-card/60 game-border">
              <p className="text-sm">
                ✅ Giao diện đẹp, gọn, dễ bấm trên điện thoại. <br />
                ✅ 10 đơn hàng demo (giá <b>0₫</b>). <br />
                ✅ Bấm vào đơn hàng để xem chi tiết.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Orders grid */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item, idx) => (
          <motion.button
            key={item.id}
            onClick={() => navigate(`/shop/${item.id}`)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03 }}
            className="text-left"
          >
            <div className="relative rounded-3xl overflow-hidden bg-white/70 dark:bg-card/60 game-border hover:scale-[1.01] active:scale-[0.99] transition shadow-sm">
              {/* Image */}
              <div className="relative">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-[160px] object-cover"
                  loading="lazy"
                />

                {/* Badge corner (tem vàng cong) */}
                <div className="absolute top-3 left-3">
                  <div className="px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wide text-black bg-yellow-300 shadow">
                    {item.badge}
                  </div>
                </div>

                {/* Category */}
                <div className="absolute top-3 right-3">
                  <div className="px-3 py-1 rounded-full text-[11px] font-bold bg-white/80 dark:bg-card/80 game-border">
                    {item.category}
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 space-y-2">
                <p className="font-extrabold text-base line-clamp-1">
                  {item.title}
                </p>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {item.desc}
                </p>

                <div className="flex items-center justify-between pt-2">
                  <p className="text-primary font-extrabold text-lg">{item.price}</p>
                  <div className="inline-flex items-center gap-1 text-sm font-bold">
                    Xem chi tiết <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Footer / Contact */}
      <div id="contact" className="mt-10">
        <Card className="game-border bg-white/70 dark:bg-card/60 backdrop-blur-sm">
          <CardContent className="pt-6 space-y-4">
            <p className="font-extrabold text-lg">Liên hệ & Thông tin</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-white/70 dark:bg-card/60 game-border">
                <div className="flex items-center gap-2 font-bold">
                  <Mail className="w-4 h-4 text-primary" />
                  Email
                </div>
                <p className="text-sm text-muted-foreground break-all">
                  support@yourdomain.com
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/70 dark:bg-card/60 game-border">
                <div className="flex items-center gap-2 font-bold">
                  <Phone className="w-4 h-4 text-primary" />
                  Hotline
                </div>
                <p className="text-sm text-muted-foreground">0123 456 789</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/70 dark:bg-card/60 game-border">
                <div className="flex items-center gap-2 font-bold">
                  <MapPin className="w-4 h-4 text-primary" />
                  Địa chỉ
                </div>
                <p className="text-sm text-muted-foreground">
                  Việt Nam (Online)
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-primary/10 game-border">
              <p className="font-extrabold">Mô tả website</p>
              <p className="text-sm text-muted-foreground mt-1">
                Đây là shop demo cho giao diện đẹp mắt trên mobile. Bạn có thể thay
                link tải thật trong trang chi tiết từng đơn hàng.
              </p>

              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => alert("Chưa gắn link Facebook")}
                  className="px-3 py-2 rounded-xl bg-white/70 dark:bg-card/60 game-border font-bold flex items-center gap-2"
                >
                  <Facebook className="w-4 h-4 text-primary" />
                  Facebook
                </button>

                <button
                  onClick={() => alert("Chưa gắn website")}
                  className="px-3 py-2 rounded-xl bg-white/70 dark:bg-card/60 game-border font-bold flex items-center gap-2"
                >
                  <Globe className="w-4 h-4 text-primary" />
                  Website
                </button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              © {new Date().getFullYear()} SHOP DEV HVH • All rights reserved.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
