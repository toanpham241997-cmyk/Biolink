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
    title: "Nick Free Fire tự chọn",
    desc: "Tặng pack miễn phí • Full ảnh • Tải nhanh.",
    detail:
      "✅ Đơn hàng miễn phí (0₫).\n✅ Có ảnh minh hoạ + hướng dẫn nhận.\n✅ Link nhận riêng theo đơn.\n📌 Bấm “Nhận ngay” để mở link tải.",
    image:
      "https://images.unsplash.com/photo-1542751110-97427bbecf20?q=80&w=1400&auto=format&fit=crop",
    downloadUrl: "https://example.com/free-1",
  },
  {
    id: "UEU1502891",
    title: "Nick Free Fire tự chọn",
    desc: "Kho đồ đẹp • Nhiều skin • Free download.",
    detail:
      "✅ Giá 0₫.\n✅ Full ảnh minh hoạ.\n✅ Nhận nhanh.\n📌 Bấm “Nhận ngay” để mở link tải riêng.",
    image:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1400&auto=format&fit=crop",
    downloadUrl: "https://example.com/free-2",
  },
  {
    id: "UEU1455786",
    title: "Nick Free Fire tự chọn",
    desc: "Full ảnh minh hoạ • Có hướng dẫn nhận.",
    detail:
      "✅ Giá 0₫.\n✅ Có mô tả chi tiết.\n✅ Link riêng theo đơn.\n📌 Nhấn “Nhận ngay” để tải.",
    image:
      "https://images.unsplash.com/photo-1526401485004-2fda9f6b2f09?q=80&w=1400&auto=format&fit=crop",
    downloadUrl: "https://example.com/free-3",
  },
  {
    id: "UEU1486001",
    title: "Nick Free Fire tự chọn",
    desc: "Bonus pack • Nhận nhanh • Free.",
    detail:
      "✅ Giá 0₫.\n✅ Có bonus pack.\n✅ Link riêng theo đơn.\n📌 Nhấn “Nhận ngay” để mở link nhận.",
    image:
      "https://images.unsplash.com/photo-1507238691740-187a5b1d37b?q=80&w=1400&auto=format&fit=crop",
    downloadUrl: "https://example.com/free-4",
  },
  {
    id: "UEU1203885",
    title: "Nick Free Fire tự chọn",
    desc: "Miễn phí 0₫ • Full ảnh • Nhận ngay.",
    detail:
      "✅ Giá 0₫.\n✅ Có ảnh + mô tả.\n✅ Link tải riêng.\n📌 Bấm nhận ngay để mở link.",
    image:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1400&auto=format&fit=crop",
    downloadUrl: "https://example.com/free-5",
  },
  {
    id: "UEU1204662",
    title: "Nick Free Fire tự chọn",
    desc: "Free download • Tải nhanh • Không mất phí.",
    detail:
      "✅ Giá 0₫.\n✅ Có nội dung hướng dẫn.\n✅ Link nhận riêng.\n📌 Nhấn “Nhận ngay” để tải.",
    image:
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1400&auto=format&fit=crop",
    downloadUrl: "https://example.com/free-6",
  },
  {
    id: "UEU1205449",
    title: "Nick Free Fire tự chọn",
    desc: "Tặng pack miễn phí • Full ảnh minh hoạ.",
    detail:
      "✅ Giá 0₫.\n✅ Full ảnh.\n✅ Link riêng theo đơn.\n📌 Bấm “Nhận ngay” để mở link nhận.",
    image:
      "https://images.unsplash.com/photo-1556438064-2d7646166914?q=80&w=1400&auto=format&fit=crop",
    downloadUrl: "https://example.com/free-7",
  },
  {
    id: "UEU1206226",
    title: "Nick Free Fire tự chọn",
    desc: "Giao nhanh • Miễn phí • Dễ nhận.",
    detail:
      "✅ Giá 0₫.\n✅ Có mô tả chi tiết.\n✅ Link tải riêng.\n📌 Nhấn “Nhận ngay” để tải.",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1400&auto=format&fit=crop",
    downloadUrl: "https://example.com/free-8",
  },
  {
    id: "UEU1207003",
    title: "Nick Free Fire tự chọn",
    desc: "Free download • Không phí • Nhận liền.",
    detail:
      "✅ Giá 0₫.\n✅ Có ảnh minh hoạ.\n✅ Link riêng.\n📌 Bấm nhận ngay để mở link tải.",
    image:
      "https://images.unsplash.com/photo-1519183071298-a2962be96f1c?q=80&w=1400&auto=format&fit=crop",
    downloadUrl: "https://example.com/free-9",
  },
  {
    id: "UEU1207780",
    title: "Nick Free Fire tự chọn",
    desc: "Miễn phí 0₫ • Tải nhanh • Full ảnh.",
    detail:
      "✅ Giá 0₫.\n✅ Có mô tả.\n✅ Link nhận riêng.\n📌 Nhấn “Nhận ngay” để tải.",
    image:
      "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1400&auto=format&fit=crop",
    downloadUrl: "https://example.com/free-10",
  },
  {
    id: "UEU1208557",
    title: "Nick Free Fire tự chọn",
    desc: "Free pack • Full ảnh • Nhận nhanh.",
    detail:
      "✅ Giá 0₫.\n✅ Có hướng dẫn.\n✅ Link riêng.\n📌 Nhấn “Nhận ngay” để mở link nhận.",
    image:
      "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?q=80&w=1400&auto=format&fit=crop",
    downloadUrl: "https://example.com/free-11",
  },
  {
    id: "UEU1209334",
    title: "Nick Free Fire tự chọn",
    desc: "Miễn phí 0₫ • Nhận liền • Không mất phí.",
    detail:
      "✅ Giá 0₫.\n✅ Có ảnh + mô tả.\n✅ Link tải riêng.\n📌 Bấm “Nhận ngay” để tải về.",
    image:
      "https://images.unsplash.com/photo-1525182008055-f88b95ff7980?q=80&w=1400&auto=format&fit=crop",
    downloadUrl: "https://example.com/free-12",
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
