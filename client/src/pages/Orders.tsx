import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export type OrderItem = {
  id: string;
  title: string;
  desc: string;
  image: string;
  claimUrl: string; // link “Nhận ngay”
  detailTitle?: string;
  detailText?: string;
  guide?: string[];
};

export const ORDERS: OrderItem[] = [
  {
    id: "o1",
    title: "Bio UI Kit",
    desc: "UI bio phong cách game-like + animation.",
    image:
      "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?q=80&w=1200&auto=format&fit=crop",
    claimUrl: "https://render.com/",
    detailTitle: "Bio UI Kit – Chi tiết",
    detailText:
      "Gói UI mẫu gồm layout header, card, menu slide, hiệu ứng framer-motion và các component bio hiện đại.",
    guide: ["Copy component vào project", "Tuỳ biến màu primary", "Deploy lên Render"],
  },
  {
    id: "o2",
    title: "Icon Pack",
    desc: "Icon đẹp cho menu & header.",
    image:
      "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1200&auto=format&fit=crop",
    claimUrl: "https://lucide.dev/",
    detailTitle: "Icon Pack – Chi tiết",
    detailText:
      "Gợi ý dùng Lucide icons (nhẹ, đẹp, dễ dùng). Bạn có thể thay icon theo nhu cầu.",
    guide: ["npm i lucide-react", "import icon", "gắn vào button/menu"],
  },
  {
    id: "o3",
    title: "Landing Sections",
    desc: "Section sẵn, responsive.",
    image:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1200&auto=format&fit=crop",
    claimUrl: "https://tailwindcss.com/",
  },
  {
    id: "o4",
    title: "Motion FX",
    desc: "Hiệu ứng mượt, dễ gắn vào UI.",
    image:
      "https://images.unsplash.com/photo-1523966211575-eb4a3d7aa3d5?q=80&w=1200&auto=format&fit=crop",
    claimUrl: "https://www.framer.com/motion/",
  },
  {
    id: "o5",
    title: "Card Templates",
    desc: "Card gọn, đẹp, đồng bộ.",
    image:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=1200&auto=format&fit=crop",
    claimUrl: "https://ui.shadcn.com/",
  },
  {
    id: "o6",
    title: "Button System",
    desc: "Nút chuẩn, không co xấu.",
    image:
      "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?q=80&w=1200&auto=format&fit=crop",
    claimUrl: "https://tailwindcss.com/",
  },
  {
    id: "o7",
    title: "Form UI",
    desc: "Input/textarea/select đẹp.",
    image:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop",
    claimUrl: "https://ui.shadcn.com/docs/components",
  },
  {
    id: "o8",
    title: "Profile Pack",
    desc: "Trang profile mẫu.",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop",
    claimUrl: "https://render.com/",
  },
  {
    id: "o9",
    title: "Menu Slide",
    desc: "Menu trượt mượt + overlay.",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop",
    claimUrl: "https://www.framer.com/motion/",
  },
  {
    id: "o10",
    title: "Chat UI",
    desc: "Giao diện chat đẹp.",
    image:
      "https://images.unsplash.com/photo-1526378722484-bd91ca387e72?q=80&w=1200&auto=format&fit=crop",
    claimUrl: "/chat",
    detailText: "Dẫn về trang chat trong app của bạn.",
  },
  {
    id: "o11",
    title: "Upload ImgBB",
    desc: "Upload ảnh & copy link.",
    image:
      "https://images.unsplash.com/photo-1526498460520-4c246339dccb?q=80&w=1200&auto=format&fit=crop",
    claimUrl: "/upload",
    detailText: "Dẫn về trang upload ảnh trong app của bạn.",
  },
  {
    id: "o12",
    title: "Deploy Render",
    desc: "Tối ưu deploy nhanh.",
    image:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200&auto=format&fit=crop",
    claimUrl: "https://render.com/",
  },
];

function openLink(url: string) {
  if (!url) return;
  if (url.startsWith("/")) {
    window.location.href = url; // nội bộ
  } else {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

export default function OrdersPage() {
  return (
    <div className="min-h-screen px-4 pt-24 pb-16 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/70 dark:bg-card/60 game-border hover:scale-[1.02] active:scale-[0.99] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-bold">Về Home</span>
        </Link>

        <div className="leading-tight">
          <p className="font-extrabold text-lg">Coder free</p>
          <p className="text-xs text-muted-foreground">12 đơn hàng • Free Download</p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {ORDERS.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.03 * idx }}
          >
            <Card className="game-border bg-white/60 dark:bg-card/60 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-0">
                {/* Image */}
                <div className="relative">
                  <div className="aspect-[4/3] w-full overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  {/* ✅ Tem cong dán vào ảnh */}
                  <div className="absolute top-2 left-2">
                    <div className="relative">
                      <div
                        className="px-3 py-1 text-[11px] font-extrabold text-white rounded-full shadow-lg
                                   bg-primary/90 backdrop-blur-sm"
                        style={{
                          transform: "rotate(-12deg)",
                        }}
                      >
                        FREE DOWNLOAD
                      </div>
                      <div
                        className="absolute -bottom-1 left-2 w-2 h-2 bg-primary/90"
                        style={{
                          transform: "rotate(20deg)",
                          borderRadius: "2px",
                          filter: "brightness(0.9)",
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="p-3">
                  <p className="font-extrabold text-[15px] leading-snug line-clamp-1">
                    {item.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {item.desc}
                  </p>

                  {/* Buttons: không co xấu */}
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {/* ✅ Chi tiết: qua trang khác */}
                    <Link
                      href={`/orders/${item.id}`}
                      className="w-full inline-flex items-center justify-center gap-2 px-3 py-2
                                 rounded-2xl bg-white/80 dark:bg-card/70 game-border
                                 font-bold text-sm hover:scale-[1.02] active:scale-[0.99] transition"
                    >
                      <Eye className="w-4 h-4" />
                      Chi tiết
                    </Link>

                    {/* ✅ Nhận ngay */}
                    <button
                      type="button"
                      onClick={() => openLink(item.claimUrl)}
                      className="w-full inline-flex items-center justify-center gap-2 px-3 py-2
                                 rounded-2xl bg-primary text-white game-border shadow
                                 font-extrabold text-sm hover:opacity-95 active:scale-[0.99] transition"
                    >
                      <Download className="w-4 h-4" />
                      Nhận ngay
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
  }
