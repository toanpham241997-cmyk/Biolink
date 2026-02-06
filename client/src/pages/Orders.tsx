import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export type OrderItem = {
  id: string;
  title: string;
  desc: string;
  detail: string;
  image: string;
  downloadUrl: string; // ✅ mỗi đơn 1 link khác nhau
};

export const ORDERS: OrderItem[] = [
  {
    id: "UEU1543362",
    title: "Coder Website 01",
    desc: "Web Bán hack , Account game , Pro",
    detail:
      "✅ Đơn hàng miễn phí (0₫).\n✅ Có ảnh minh hoạ + hướng dẫn nhận.\n✅ Link nhận riêng theo đơn.\n📌 Bấm “Nhận ngay” để mở link tải.",
    image:
      "https://i.ibb.co/9kJM5HYH/images-2.jpg",
    downloadUrl: "https://Facebook.com",
  },
  {
    id: "UEU1502891",
    title: " Coder Website 02 ",
    desc: "Giao diện đẹp mắt Nhiều hiệu ứng UI",
    detail:
      "✅ Giá 0₫.\n✅ Full ảnh minh hoạ.\n✅ Nhận nhanh.\n📌 Bấm “Nhận ngay” để mở link tải riêng.",
    image:
      "https://i.ibb.co/9kJM5HYH/images-2.jpg",
    downloadUrl: "https://Facebook.com",
  },
  {
    id: "UEU1455786",
    title: " Coder Website 02 ",
    desc: "Giao diện đẹp mắt Nhiều hiệu ứng UI",
    detail:
      "✅ Giá 0₫.\n✅ Full ảnh minh hoạ.\n✅ Nhận nhanh.\n📌 Bấm “Nhận ngay” để mở link tải riêng.",
    image:
      "https://i.ibb.co/9kJM5HYH/images-2.jpg",
    downloadUrl: "https://Facebook.com",
  },
  {
    id: "UEU1455784",
    title: " Coder Website 02 ",
    desc: "Giao diện đẹp mắt Nhiều hiệu ứng UI",
    detail:
      "✅ Giá 0₫.\n✅ Full ảnh minh hoạ.\n✅ Nhận nhanh.\n📌 Bấm “Nhận ngay” để mở link tải riêng.",
    image:
      "https://i.ibb.co/9kJM5HYH/images-2.jpg",
    downloadUrl: "https://Facebook.com",
  },
  {
    id: "UEU1204662",
    title: " Coder Website 02 ",
    desc: "Giao diện đẹp mắt Nhiều hiệu ứng UI",
    detail:
      "✅ Giá 0₫.\n✅ Full ảnh minh hoạ.\n✅ Nhận nhanh.\n📌 Bấm “Nhận ngay” để mở link tải riêng.",
    image:
      "https://i.ibb.co/9kJM5HYH/images-2.jpg",
    downloadUrl: "https://Facebook.com",
  },
  {
    id: "UEU1205449",
    title: " Coder Website 02 ",
    desc: "Giao diện đẹp mắt Nhiều hiệu ứng UI",
    detail:
      "✅ Giá 0₫.\n✅ Full ảnh minh hoạ.\n✅ Nhận nhanh.\n📌 Bấm “Nhận ngay” để mở link tải riêng.",
    image:
      "https://i.ibb.co/9kJM5HYH/images-2.jpg",
    downloadUrl: "https://Facebook.com",
  },
  {
    id: "UEU1206226",
    title: " Coder Website 02 ",
    desc: "Giao diện đẹp mắt Nhiều hiệu ứng UI",
    detail:
      "✅ Giá 0₫.\n✅ Full ảnh minh hoạ.\n✅ Nhận nhanh.\n📌 Bấm “Nhận ngay” để mở link tải riêng.",
    image:
      "https://i.ibb.co/9kJM5HYH/images-2.jpg",
    downloadUrl: "https://Facebook.com",
  },
  {
    id: "UEU1207003",
    title: " Coder Website 02 ",
    desc: "Giao diện đẹp mắt Nhiều hiệu ứng UI",
    detail:
      "✅ Giá 0₫.\n✅ Full ảnh minh hoạ.\n✅ Nhận nhanh.\n📌 Bấm “Nhận ngay” để mở link tải riêng.",
    image:
      "https://i.ibb.co/9kJM5HYH/images-2.jpg",
    downloadUrl: "https://Facebook.com",
  },
  {
    id: "UEU1207780",
    title: " Coder Website 02 ",
    desc: "Giao diện đẹp mắt Nhiều hiệu ứng UI",
    detail:
      "✅ Giá 0₫.\n✅ Full ảnh minh hoạ.\n✅ Nhận nhanh.\n📌 Bấm “Nhận ngay” để mở link tải riêng.",
    image:
      "https://i.ibb.co/9kJM5HYH/images-2.jpg",
    downloadUrl: "https://Facebook.com",
  },
  {
    id: "UEU1208557",
    title: " Coder Website 02 ",
    desc: "Giao diện đẹp mắt Nhiều hiệu ứng UI",
    detail:
      "✅ Giá 0₫.\n✅ Full ảnh minh hoạ.\n✅ Nhận nhanh.\n📌 Bấm “Nhận ngay” để mở link tải riêng.",
    image:
      "https://i.ibb.co/9kJM5HYH/images-2.jpg",
    downloadUrl: "https://Facebook.com",
  },
  {
    id: "UEU1209334",
    title: " Coder Website 02 ",
    desc: "Giao diện đẹp mắt Nhiều hiệu ứng UI",
    detail:
      "✅ Giá 0₫.\n✅ Full ảnh minh hoạ.\n✅ Nhận nhanh.\n📌 Bấm “Nhận ngay” để mở link tải riêng.",
    image:
      "https://i.ibb.co/9kJM5HYH/images-2.jpg",
    downloadUrl: "https://Facebook.com",
  },
];

/** ✅ Chọn style viền: "round" (bo cong) hoặc "sharp" (góc nhọn hơn) */
const BORDER_STYLE: "round" | "sharp" = "round";

const clsCard = BORDER_STYLE === "round" ? "rounded-[26px]" : "rounded-[14px]";
const clsImg = BORDER_STYLE === "round" ? "rounded-[22px]" : "rounded-[12px]";

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

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {ORDERS.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.02 * idx }}
          >
            {/* ✅ bấm card -> sang trang chi tiết */}
            <Link href={`/orders/${item.id}`} className="block">
              <Card
                className={[
                  "game-border bg-white/70 dark:bg-card/60 backdrop-blur-sm overflow-hidden",
                  "hover:scale-[1.015] active:scale-[0.99] transition",
                  clsCard,
                ].join(" ")}
              >
                <CardContent className="p-3">
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

                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                  </div>

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
