export type ParentOrder = {
  id: string;
  title: string;
  subtitle: string;
  cover: string;
  tag: "FREE" | "HOT" | "SALE" | "NEW";
};

export type ChildOrder = {
  id: string;
  parentId: string;
  title: string;
  desc: string;
  price: number; // VND
  badge: "UI" | "CODE" | "TOOL" | "DOC" | "ASSET";
  image: string;
  downloadUrl?: string; // nếu muốn gắn link nhận file
};

export const parents: ParentOrder[] = [
  {
    id: "ui-premium",
    title: "Gói UI Bio Premium",
    subtitle: "Full UI + animation, tối ưu mobile",
    cover:
      "https://i.ibb.co/zYmpV1S/ban-acc-free-fire-vip.gif",
    tag: "HOT",
  },
  {
    id: "shop-template",
    title: "Shop Template Pro",
    subtitle: "Giao diện shop đẹp + nhiều trang",
    cover:
      "https://i.ibb.co/zYmpV1S/ban-acc-free-fire-vip.gif",
    tag: "SALE",
  },
  {
    id: "dev-tools",
    title: "Dev Tools Pack",
    subtitle: "Tool & snippet hỗ trợ dev nhanh",
    cover:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1400&auto=format&fit=crop",
    tag: "NEW",
  },
  {
    id: "assets",
    title: "Assets & Icon Pack",
    subtitle: "Icon/asset đẹp cho web/app",
    cover:
      "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?q=80&w=1400&auto=format&fit=crop",
    tag: "FREE",
  },
  {
    id: "docs",
    title: "Docs & Tutorial",
    subtitle: "Hướng dẫn + tài liệu dev",
    cover:
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1400&auto=format&fit=crop",
    tag: "HOT",
  },
];

export const childs: ChildOrder[] = [
  // UI Premium
  {
    id: "ui-01",
    parentId: "ui-premium",
    title: "UI Bio - Full Premium (v1)",
    desc: "Gói UI full: header, card, modal, animation. Chuẩn mobile, dễ chỉnh.",
    price: 79000,
    badge: "UI",
    image:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1400&auto=format&fit=crop",
    downloadUrl: "https://example.com/demo.zip",
  },
  {
    id: "ui-02",
    parentId: "ui-premium",
    title: "UI Bio - Clean Minimal",
    desc: "Giao diện sạch, nhẹ, phù hợp landing/bio link.",
    price: 49000,
    badge: "UI",
    image:
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1400&auto=format&fit=crop",
  },
  {
    id: "ui-03",
    parentId: "ui-premium",
    title: "UI Bio - Neon Gamer",
    desc: "Phong cách gamer: viền nổi bật, button đẹp, layout hút mắt.",
    price: 99000,
    badge: "UI",
    image:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1400&auto=format&fit=crop",
  },
  {
    id: "ui-04",
    parentId: "ui-premium",
    title: "UI Bio - Card Pro Set",
    desc: "Bộ card chuyên nghiệp: list, grid, tag, badge, price.",
    price: 59000,
    badge: "UI",
    image:
      "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?q=80&w=1400&auto=format&fit=crop",
  },
  {
    id: "ui-05",
    parentId: "ui-premium",
    title: "UI Bio - Anim Pack",
    desc: "Thêm animation mượt: menu trượt, fade, spring, hover.",
    price: 39000,
    badge: "UI",
    image:
      "https://images.unsplash.com/photo-1550439062-609e1531270e?q=80&w=1400&auto=format&fit=crop",
  },

  // Shop Template
  {
    id: "shop-01",
    parentId: "shop-template",
    title: "Shop Template - Full Page",
    desc: "Trang shop kiểu ảnh bạn gửi: banner, top, category, list, tabbar.",
    price: 129000,
    badge: "CODE",
    image:
      "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?q=80&w=1400&auto=format&fit=crop",
  },
  {
    id: "shop-02",
    parentId: "shop-template",
    title: "Shop Template - Checkout",
    desc: "Trang thanh toán + popup mua nhanh + confirm.",
    price: 89000,
    badge: "CODE",
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1400&auto=format&fit=crop",
  },
  {
    id: "shop-03",
    parentId: "shop-template",
    title: "Shop Template - Admin Lite",
    desc: "Trang quản lý đơn hàng demo: lọc, tìm, trạng thái.",
    price: 99000,
    badge: "TOOL",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1400&auto=format&fit=crop",
  },
  {
    id: "shop-04",
    parentId: "shop-template",
    title: "Shop Template - Product Cards",
    desc: "Bộ card sản phẩm đẹp + nút mua + tag + badge.",
    price: 59000,
    badge: "CODE",
    image:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1400&auto=format&fit=crop",
  },
  {
    id: "shop-05",
    parentId: "shop-template",
    title: "Shop Template - Mobile Tabbar",
    desc: "Thanh tabbar kiểu mobile như ảnh: đẹp gọn, không lùn.",
    price: 39000,
    badge: "UI",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1400&auto=format&fit=crop",
  },

  // Dev tools
  {
    id: "tool-01",
    parentId: "dev-tools",
    title: "Snippet Pack - React",
    desc: "Hook, component mẫu, form, modal, toast.",
    price: 49000,
    badge: "TOOL",
    image:
      "https://images.unsplash.com/photo-1517430816045-df4b7de1d0b5?q=80&w=1400&auto=format&fit=crop",
  },
  {
    id: "tool-02",
    parentId: "dev-tools",
    title: "Snippet Pack - Node/Express",
    desc: "Auth, upload, middleware, logger, error handler.",
    price: 59000,
    badge: "TOOL",
    image:
      "https://images.unsplash.com/photo-1555066932-6f3b38b16c86?q=80&w=1400&auto=format&fit=crop",
  },
  {
    id: "tool-03",
    parentId: "dev-tools",
    title: "Supabase Storage Helper",
    desc: "Upload/list/delete + tạo link download chuẩn.",
    price: 69000,
    badge: "TOOL",
    image:
      "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?q=80&w=1400&auto=format&fit=crop",
  },
  {
    id: "tool-04",
    parentId: "dev-tools",
    title: "Deploy Render Checklist",
    desc: "Checklist deploy + fix lỗi hay gặp (Vite/Node).",
    price: 29000,
    badge: "DOC",
    image:
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1400&auto=format&fit=crop",
  },
  {
    id: "tool-05",
    parentId: "dev-tools",
    title: "Tailwind UI Quick Set",
    desc: "Bộ class đẹp: button/card/input, tối ưu mobile.",
    price: 39000,
    badge: "UI",
    image:
      "https://images.unsplash.com/photo-1550439062-609e1531270e?q=80&w=1400&auto=format&fit=crop",
  },

  // Assets
  {
    id: "asset-01",
    parentId: "assets",
    title: "Icon Pack - Minimal",
    desc: "Icon pack tối giản, hợp web/app.",
    price: 0,
    badge: "ASSET",
    image:
      "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?q=80&w=1400&auto=format&fit=crop",
  },
  {
    id: "asset-02",
    parentId: "assets",
    title: "Background Pack",
    desc: "Background đẹp dùng cho banner/cover.",
    price: 0,
    badge: "ASSET",
    image:
      "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?q=80&w=1400&auto=format&fit=crop",
  },
  {
    id: "asset-03",
    parentId: "assets",
    title: "Avatar Pack",
    desc: "Avatar pack dùng cho UI demo.",
    price: 0,
    badge: "ASSET",
    image:
      "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?q=80&w=1400&auto=format&fit=crop",
  },
  {
    id: "asset-04",
    parentId: "assets",
    title: "Sticker Pack",
    desc: "Sticker vui, dùng cho giao diện.",
    price: 0,
    badge: "ASSET",
    image:
      "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?q=80&w=1400&auto=format&fit=crop",
  },
  {
    id: "asset-05",
    parentId: "assets",
    title: "UI Badge Pack",
    desc: "Badge/tag đẹp cho card sản phẩm.",
    price: 0,
    badge: "ASSET",
    image:
      "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?q=80&w=1400&auto=format&fit=crop",
  },

  // Docs
  {
    id: "doc-01",
    parentId: "docs",
    title: "Hướng dẫn Setup Shop",
    desc: "Cấu trúc route, data, UI mobile, fix lỗi thường gặp.",
    price: 19000,
    badge: "DOC",
    image:
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1400&auto=format&fit=crop",
  },
  {
    id: "doc-02",
    parentId: "docs",
    title: "Auth cơ bản (Login/Register)",
    desc: "Flow login/register UI + gợi ý gắn Clerk/Supabase Auth.",
    price: 39000,
    badge: "DOC",
    image:
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1400&auto=format&fit=crop",
  },
  {
    id: "doc-03",
    parentId: "docs",
    title: "Supabase Storage Policies",
    desc: "Policy SELECT/INSERT/UPDATE/DELETE + public download.",
    price: 49000,
    badge: "DOC",
    image:
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1400&auto=format&fit=crop",
  },
  {
    id: "doc-04",
    parentId: "docs",
    title: "Render Deploy Guide",
    desc: "ENV, build command, fix import, vite build ổn định.",
    price: 49000,
    badge: "DOC",
    image:
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1400&auto=format&fit=crop",
  },
  {
    id: "doc-05",
    parentId: "docs",
    title: "UI Tips Mobile",
    desc: "Nút không lùn, spacing đẹp, card không dính nhau.",
    price: 29000,
    badge: "DOC",
    image:
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1400&auto=format&fit=crop",
  },
];

export function formatVND(n: number) {
  if (n === 0) return "0đ";
  return n.toLocaleString("vi-VN") + "đ";
    }
