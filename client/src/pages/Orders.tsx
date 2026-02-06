import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export type OrderItem = {
  id: string;
  title: string;
  desc: string;
  image: string;
  downloadUrl: string; // ✅ mỗi đơn 1 link khác nhau
  detail: string;
};

export const ORDERS: OrderItem[] = [
  {
    id: "UEU1543362",
    title: "Nick Free Fire tự chọn",
    desc: "Tặng pack miễn phí • Full ảnh • Tải nhanh.",
    detail:
      "✅ Gồm: ảnh minh hoạ + hướng dẫn nhận.\n✅ Giá: 0₫.\n📌 Bấm “Nhận ngay” để mở link tải.",
    image:
      "https://images.unsplash.com/photo-1542751110-97427bbecf20?q=80&w=1200&auto=format&fit=crop",
    downloadUrl: "https://example.com/free-1", // 🔥 đổi link thật của bạn
  },
  {
    id: "UEU1502891",
    title: "Nick Free Fire tự chọn",
    desc: "Kho đồ đẹp • Nhiều skin • Free download.",
    detail:
      "✅ Full ảnh + mô tả.\n✅ Giá: 0₫.\n📌 Link riêng theo đơn hàng.",
    image:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200&auto=format&fit=crop",
    downloadUrl: "https://example.com/free-2",
  },
  {
    id: "UEU1455786",
    title: "Nick Free Fire tự chọn",
    desc: "Full ảnh minh hoạ • Có hướng dẫn nhận.",
    detail: "✅ Giá: 0₫.\n✅ Có mô tả chi tiết.\n👉 Nhận ngay để tải.",
    image:
      "https://images.unsplash.com/photo-1526401485004-2fda9f6b2f09?q=80&w=1200&auto=format&fit=crop",
    downloadUrl: "https://example.com/free-3",
  },
  {
    id: "UEU1486001",
    title: "Nick Free Fire tự chọn",
    desc: "Bonus pack • Nhận nhanh • Free.",
    detail: "✅ 0₫.\n✅ Có bonus.\n👉 Bấm nhận ngay để mở link.",
    image:
      "https://images.unsplash.com/photo-1507238691740-187a5b1d37b?q=80&w=1200&auto=format&fit=crop",
    downloadUrl: "https://example.com/free-4",
  },

  // ✅ tạo thêm 8 đơn, mỗi đơn 1 link khác nhau
  ...Array.from({ length: 8 }).map((_, i) => {
    const idx = i + 5;
    const id = `UEU${(1200000 + idx * 777).toString()}`;
    return {
      id,
      title: "Nick Free Fire tự chọn",
      desc: "Miễn phí 0₫ • Bấm vào để xem chi tiết & nhận link riêng.",
      detail:
        "✅ Đơn hàng miễn phí.\n✅ Có ảnh + nội dung.\n📌 Nhận ngay để mở link tải riêng.",
      image:
        "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200&auto=format&fit=crop",
      downloadUrl: `https://example.com/free-${idx}`, // ✅ khác nhau
    };
  }),
];

/** ✅ Chọn style viền: "round" bo cong hoặc "sharp" nhọn hơn */
const BORDER_STYLE: "round" | "sharp" = "round";

const clsCard =
  BORDER_STYLE === "round"
    ? "rounded-[26px]"
    : "rounded-[14px]"; // góc nhọn hơn

const clsImg =
  BORDER_STYLE === "round"
    ? "rounded-[22px]"
    : "rounded-[12px]";

export default function OrdersPage() {
  return (
    <div className="min-h-screen px-4 pt-24 pb-16 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/70 dark:bg-card/60 game-border hover:scale-[1.02] active:scale-[0.99] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-bold">Về Home</span>
        </Link>

        <div className="text-right leading-tight">
          <p className="font-extrabold text-lg inline-flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Coder free
          </p>
          <p className="text-xs text-muted-foreground">
            12 đơn hàng • Free Download • 0₫
          </p>
        </div>
      </div>

      {/* Grid: mobile 2 cột, tablet 3, desktop 4 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {ORDERS.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.02 * idx }}
          >
            {/* ✅ bấm cả card -> qua chi tiết */}
            <Link href={`/orders/${item.id}`} className="block">
              <Card
                className={[
                  "game-border bg-white/70 dark:bg-card/60 backdrop-blur-sm overflow-hidden",
                  "hover:scale-[1.015] active:scale-[0.99] transition",
                  clsCard,
                ].join(" ")}
              >
                <CardContent className="p-3">
                  {/* Ảnh + Ribbon */}
                  <div className={["relative overflow-hidden", clsImg].join(" ")}>
                    <div className="aspect-[16/10] w-full">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>

                    {/* ✅ Ribbon vàng chói */}
                    <div className="absolute top-3 left-[-52px] rotate-[-35deg]">
                      <div
                        className="px-14 py-2 text-[11px] font-extrabold tracking-wide text-black shadow-xl"
                        style={{
                          background:
                            "linear-gradient(90deg,#FFD700,#FFB000,#FFD700)",
                          borderRadius: 999,
                          border: "2px solid rgba(0,0,0,0.14)",
                          textShadow: "0 1px 0 rgba(255,255,255,0.35)",
                        }}
                      >
                        FREE DOWNLOAD
                      </div>
                    </div>

                    {/* overlay nhẹ */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                  </div>

                  {/* Nội dung */}
                  <div className="pt-3 space-y-1">
                    <p className="font-extrabold text-[15px] leading-snug line-clamp-2">
                      {item.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ID: <span className="font-semibold">#{item.id}</span>
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {item.desc}
                    </p>

                    {/* Giá */}
                    <div className="pt-2 flex items-end gap-2">
                      <p className="text-primary font-extrabold text-lg leading-none">
                        0₫
                      </p>
                      <p className="text-xs text-muted-foreground line-through">
                        250.000₫
                      </p>
                      <span className="ml-auto px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-primary/15 text-primary game-border">
                        100%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
    }
