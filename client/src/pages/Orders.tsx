import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export type OrderItem = {
  id: string;        // ví dụ: UEU1543362
  title: string;     // tên đơn hàng
  desc: string;      // mô tả ngắn
  image: string;     // ảnh thumbnail
  downloadUrl: string; // link tải riêng
  meta?: string;     // ví dụ: "Cấp Prime: Prime 1"
  badge?: string;    // ví dụ: "FREE"
};

export const ORDERS: OrderItem[] = [
  {
    id: "UEU1543362",
    title: "Nick Free Fire tự chọn",
    desc: "Tặng pack miễn phí • Đầy đủ ảnh • Tải nhanh.",
    meta: "Cấp Prime: Prime 1",
    badge: "FREE",
    image:
      "https://images.unsplash.com/photo-1542751110-97427bbecf20?q=80&w=1200&auto=format&fit=crop",
    downloadUrl: "https://example.com/download/UEU1543362",
  },
  {
    id: "UEU1502891",
    title: "Nick Free Fire tự chọn",
    desc: "Kho đồ đẹp • Nhiều skin • Free tải.",
    meta: "Cấp Prime: Prime 2",
    badge: "FREE",
    image:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200&auto=format&fit=crop",
    downloadUrl: "https://example.com/download/UEU1502891",
  },
  {
    id: "UEU1455786",
    title: "Nick Free Fire tự chọn",
    desc: "Full ảnh minh hoạ • Có hướng dẫn nhận.",
    meta: "Cấp Prime: Prime 3",
    badge: "FREE",
    image:
      "https://images.unsplash.com/photo-1526401485004-2fda9f6b2f09?q=80&w=1200&auto=format&fit=crop",
    downloadUrl: "https://example.com/download/UEU1455786",
  },
  {
    id: "UEU1486001",
    title: "Nick Free Fire tự chọn",
    desc: "Pack sưu tầm • Tặng kèm preset UI.",
    meta: "Cấp Prime: Prime 1",
    badge: "FREE",
    image:
      "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=1200&auto=format&fit=crop",
    downloadUrl: "https://example.com/download/UEU1486001",
  },

  // Thêm 8 đơn nữa (bạn đổi ảnh/link theo ý)
  ...Array.from({ length: 8 }).map((_, i) => {
    const idx = i + 5;
    const code = `UEU10${(90000 + idx * 123).toString()}`;
    return {
      id: code,
      title: "Nick Free Fire tự chọn",
      desc: "Free download • Xem chi tiết để nhận link tải riêng.",
      meta: `Cấp Prime: Prime ${((idx % 3) + 1).toString()}`,
      badge: "FREE",
      image:
        "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200&auto=format&fit=crop",
      downloadUrl: `https://example.com/download/${code}`,
    } as OrderItem;
  }),
];

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

        <div className="leading-tight text-right">
          <p className="font-extrabold text-lg">Coder free</p>
          <p className="text-xs text-muted-foreground">12 đơn hàng • 0₫</p>
        </div>
      </div>

      {/* Grid giống ảnh (2 cột mobile, 3-4 cột desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {ORDERS.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.02 * idx }}
          >
            {/* ✅ Click toàn bộ card -> qua trang chi tiết */}
            <Link href={`/orders/${item.id}`} className="block">
              <Card className="game-border bg-white/70 dark:bg-card/60 backdrop-blur-sm overflow-hidden hover:scale-[1.01] active:scale-[0.99] transition">
                <CardContent className="p-0">
                  {/* Thumbnail */}
                  <div className="relative">
                    <div className="aspect-[16/10] w-full overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>

                    {/* ✅ Tem cong dán góc giống ảnh */}
                    <div className="absolute top-2 left-2">
                      <div
                        className="px-3 py-1 text-[11px] font-extrabold text-white rounded-full shadow-lg bg-primary/90"
                        style={{ transform: "rotate(-10deg)" }}
                      >
                        FREE DOWNLOAD
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3 space-y-1">
                    <p className="font-extrabold text-[15px] leading-snug line-clamp-2">
                      {item.title}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      ID: <span className="font-semibold">#{item.id}</span>
                    </p>

                    {item.meta && (
                      <p className="text-xs text-muted-foreground">
                        {item.meta}
                      </p>
                    )}

                    {/* Mô tả ngắn */}
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {item.desc}
                    </p>

                    {/* Giá: tất cả 0đ */}
                    <div className="pt-2 flex items-end gap-2">
                      <p className="text-primary font-extrabold text-lg leading-none">
                        0₫
                      </p>

                      {/* giá gạch (tuỳ thích) */}
                      <p className="text-xs text-muted-foreground line-through">
                        250.000₫
                      </p>

                      {/* badge giảm giá */}
                      <span className="ml-auto px-2 py-1 rounded-full text-[11px] font-extrabold bg-primary/15 text-primary game-border">
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
