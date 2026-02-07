import { useMemo } from "react";
import { Link, useLocation, useRoute } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type ShopItem = {
  id: string;
  title: string;
  desc: string;
  detail: string;
  image: string;
  price: string;
  badge: string;
  category: string;
  downloadUrl: string; // link nhận ngay riêng
};

export default function ShopDetailPage() {
  const [, navigate] = useLocation();
  const [, params] = useRoute("/shop/:id");
  const id = params?.id || "";

  const items: ShopItem[] = useMemo(
    () => [
      {
        id: "order-001",
        title: "Gói UI Bio Premium",
        desc: "Full UI + animation, tối ưu mobile.",
        detail:
          "✅ Gồm: UI bio + hiệu ứng + responsive.\n✅ Hỗ trợ: React/Vite.\n✅ File đầy đủ để chỉnh sửa.",
        image:
          "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop",
        price: "0₫",
        badge: "FREE DOWNLOAD",
        category: "UI",
        downloadUrl: "https://example.com/download/ui-bio-premium.zip",
      },
      {
        id: "order-002",
        title: "Icon Pack Neon",
        desc: "Icon đẹp cho menu, header, button.",
        detail:
          "✅ 300+ icon.\n✅ PNG/SVG.\n✅ Dùng cho web/app.",
        image:
          "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1200&auto=format&fit=crop",
        price: "0₫",
        badge: "FREE DOWNLOAD",
        category: "ICON",
        downloadUrl: "https://example.com/download/icon-pack-neon.zip",
      },
      {
        id: "order-003",
        title: "Landing Sections Pack",
        desc: "Section sẵn, chuẩn responsive.",
        detail:
          "✅ Hero, Feature, Pricing, FAQ.\n✅ Tailwind ready.\n✅ Copy dùng ngay.",
        image:
          "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1200&auto=format&fit=crop",
        price: "0₫",
        badge: "FREE DOWNLOAD",
        category: "WEB",
        downloadUrl: "https://example.com/download/landing-sections.zip",
      },
      {
        id: "order-004",
        title: "Motion FX Kit",
        desc: "Hiệu ứng mượt, gắn vào UI.",
        detail:
          "✅ Presets Framer Motion.\n✅ Hover/click.\n✅ Mobile smooth.",
        image:
          "https://images.unsplash.com/photo-1526948128573-703ee1aeb6fa?q=80&w=1200&auto=format&fit=crop",
        price: "0₫",
        badge: "FREE DOWNLOAD",
        category: "FX",
        downloadUrl: "https://example.com/download/motion-fx-kit.zip",
      },
      {
        id: "order-005",
        title: "Template Bio Game",
        desc: "Phong cách game-like + đẹp mắt.",
        detail:
          "✅ Theme game.\n✅ Button + card đẹp.\n✅ Tối ưu điện thoại.",
        image:
          "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200&auto=format&fit=crop",
        price: "0₫",
        badge: "FREE DOWNLOAD",
        category: "BIO",
        downloadUrl: "https://example.com/download/template-bio-game.zip",
      },
      {
        id: "order-006",
        title: "Header Pack Pro",
        desc: "10 kiểu header xịn cho web.",
        detail:
          "✅ Desktop + Mobile.\n✅ Có menu trượt.\n✅ Dễ thay logo.",
        image:
          "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200&auto=format&fit=crop",
        price: "0₫",
        badge: "FREE DOWNLOAD",
        category: "HEADER",
        downloadUrl: "https://example.com/download/header-pack-pro.zip",
      },
      {
        id: "order-007",
        title: "Footer Pack",
        desc: "Footer liên hệ + social đẹp.",
        detail:
          "✅ 8 mẫu footer.\n✅ Responsive.\n✅ Dùng cho shop/bio.",
        image:
          "https://images.unsplash.com/photo-1556761175-4b46a572b786?q=80&w=1200&auto=format&fit=crop",
        price: "0₫",
        badge: "FREE DOWNLOAD",
        category: "FOOTER",
        downloadUrl: "https://example.com/download/footer-pack.zip",
      },
      {
        id: "order-008",
        title: "Card Product Kit",
        desc: "Card sản phẩm kiểu shop đẹp.",
        detail:
          "✅ Card giá, giảm giá, badge.\n✅ Gọn đẹp.\n✅ Dễ chỉnh.",
        image:
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop",
        price: "0₫",
        badge: "FREE DOWNLOAD",
        category: "CARD",
        downloadUrl: "https://example.com/download/card-product-kit.zip",
      },
      {
        id: "order-009",
        title: "Profile Components",
        desc: "Component hồ sơ + stats.",
        detail:
          "✅ Avatar + stats + badge.\n✅ Dùng cho bio.\n✅ UI sạch.",
        image:
          "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop",
        price: "0₫",
        badge: "FREE DOWNLOAD",
        category: "PROFILE",
        downloadUrl: "https://example.com/download/profile-components.zip",
      },
      {
        id: "order-010",
        title: "Mega UI Bundle",
        desc: "Combo UI dùng nhanh cho dự án.",
        detail:
          "✅ Tổng hợp pack UI.\n✅ Update.\n✅ Dùng được nhiều dự án.",
        image:
          "https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=1200&auto=format&fit=crop",
        price: "0₫",
        badge: "FREE DOWNLOAD",
        category: "BUNDLE",
        downloadUrl: "https://example.com/download/mega-ui-bundle.zip",
      },
    ],
    []
  );

  const item = items.find((x) => x.id === id);

  if (!item) {
    return (
      <div className="min-h-screen px-4 pt-24 pb-16 max-w-2xl mx-auto">
        <Card className="game-border bg-white/70 dark:bg-card/60">
          <CardContent className="pt-6 space-y-3">
            <p className="font-extrabold text-lg">Không tìm thấy đơn hàng</p>
            <button
              onClick={() => navigate("/shop")}
              className="w-full p-3 rounded-2xl bg-primary text-white font-extrabold"
            >
              Quay lại Shop
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 pt-20 pb-16 max-w-3xl mx-auto">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-40">
        <div className="max-w-3xl mx-auto px-4 pt-4">
          <div className="rounded-2xl bg-white/70 dark:bg-card/60 backdrop-blur-sm game-border px-3 py-3 flex items-center justify-between">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/70 dark:bg-card/60 game-border hover:scale-[1.02] active:scale-[0.99] transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-bold">Về Shop</span>
            </Link>

            <div className="text-right leading-tight">
              <p className="font-extrabold text-sm uppercase">{item.category}</p>
              <p className="text-xs text-muted-foreground">{item.price}</p>
            </div>
          </div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="game-border bg-white/70 dark:bg-card/60 overflow-hidden">
          {/* Image + badge */}
          <div className="relative">
            <img src={item.image} className="w-full h-[220px] object-cover" alt={item.title} />
            <div className="absolute top-4 left-4">
              <div className="px-3 py-1 rounded-full text-[11px] font-extrabold text-black bg-yellow-300 shadow">
                {item.badge}
              </div>
            </div>
          </div>

          <CardContent className="pt-6 space-y-4">
            <div>
              <p className="font-extrabold text-xl">{item.title}</p>
              <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/70 dark:bg-card/60 game-border whitespace-pre-line text-sm">
              {item.detail}
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href={item.downloadUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full p-3 rounded-2xl bg-primary text-white font-extrabold flex items-center justify-center gap-2 hover:opacity-95 transition"
              >
                <Download className="w-5 h-5" />
                Nhận ngay
              </a>

              <a
                href={item.downloadUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full p-3 rounded-2xl bg-primary/10 hover:bg-primary/20 font-extrabold flex items-center justify-center gap-2 transition"
              >
                <ExternalLink className="w-5 h-5" />
                Mở link tải
              </a>
            </div>

            <p className="text-xs text-muted-foreground">
              Tip: Bạn có thể thay <b>downloadUrl</b> của từng đơn hàng để gắn link thật.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
