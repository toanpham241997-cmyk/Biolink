import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import {
  Menu, X, Search, LogIn, UserPlus, ArrowRight, ShieldCheck, Flame, Sparkles,
  Wallet, BadgeCheck, User2, LogOut, TicketPercent, Minus, Plus
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { parents } from "./shop.data";

type ParentItem = {
  id: string;
  title: string;
  subtitle: string;
  cover: string;
  tag?: string;
};

type AuthUser = {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  role: "member" | "vip";
  status: "active" | "locked";
  balance: number; // VND
};

type BuyItem = {
  id: string;
  title: string;
  price: number;
  description: string;
  cover?: string;
};

function formatMoneyVND(v: number) {
  try {
    return v.toLocaleString("vi-VN") + "₫";
  } catch {
    return `${v}₫`;
  }
}

function cn(...cls: (string | false | undefined | null)[]) {
  return cls.filter(Boolean).join(" ");
}

/** Modal Swal-like không cần lib */
function Modal({
  open,
  variant,
  title,
  message,
  onClose,
}: {
  open: boolean;
  variant: "success" | "error" | "info";
  title: string;
  message?: string;
  onClose: () => void;
}) {
  if (!open) return null;
  const bg =
    variant === "success"
      ? "bg-emerald-500"
      : variant === "error"
      ? "bg-rose-500"
      : "bg-sky-500";

  return (
    <div className="fixed inset-0 z-[80] bg-black/45 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-sm rounded-[24px] bg-white border-2 border-sky-200 shadow-[0_18px_50px_rgba(0,0,0,0.25)] p-5"
      >
        <div className="flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-2xl text-white flex items-center justify-center", bg)}>
            <span className="font-extrabold">!</span>
          </div>
          <div>
            <p className="font-extrabold text-[16px]">{title}</p>
            {message && <p className="text-[13px] text-slate-600 mt-1">{message}</p>}
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full h-11 rounded-2xl bg-sky-500 text-white font-extrabold border-2 border-sky-600 shadow active:scale-[0.99] transition"
        >
          OK
        </button>
      </motion.div>
    </div>
  );
}

/** Modal mua ngay */
function BuyModal({
  open,
  item,
  userBalance,
  onClose,
  onConfirm,
}: {
  open: boolean;
  item: BuyItem | null;
  userBalance: number;
  onClose: () => void;
  onConfirm: (payload: { quantity: number; coupon: string }) => void;
}) {
  const [qty, setQty] = useState(1);
  const [coupon, setCoupon] = useState("");

  useEffect(() => {
    if (open) {
      setQty(1);
      setCoupon("");
    }
  }, [open]);

  if (!open || !item) return null;

  const estTotal = item.price * qty;
  const notEnough = estTotal > userBalance;

  return (
    <div className="fixed inset-0 z-[70] bg-black/45 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-md rounded-[26px] bg-white border-2 border-sky-200 shadow-[0_18px_55px_rgba(0,0,0,0.25)] overflow-hidden"
      >
        <div className="p-4 border-b border-sky-100 flex items-center justify-between">
          <p className="font-extrabold text-[15px]">Mua ngay</p>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-white border-2 border-sky-200 flex items-center justify-center"
          >
            <X className="w-5 h-5 text-sky-700" />
          </button>
        </div>

        <div className="p-4">
          <div className="flex gap-3">
            <div className="w-20 h-20 rounded-2xl bg-sky-50 border-2 border-sky-100 overflow-hidden flex items-center justify-center">
              {item.cover ? (
                <img src={item.cover} className="w-full h-full object-cover" />
              ) : (
                <Sparkles className="w-6 h-6 text-sky-700" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-extrabold text-[15px] truncate">{item.title}</p>
              <p className="text-[12px] text-slate-600 mt-1 line-clamp-2">{item.description}</p>
              <p className="mt-2 font-extrabold text-sky-700">{formatMoneyVND(item.price)}</p>
            </div>
          </div>

          {/* Qty */}
          <div className="mt-4 rounded-[22px] bg-sky-50 border-2 border-sky-100 p-3">
            <p className="font-extrabold text-[12px] text-slate-700">Số lượng</p>
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQty((v) => Math.max(1, v - 1))}
                  className="w-10 h-10 rounded-2xl bg-white border-2 border-sky-200 flex items-center justify-center active:scale-[0.98]"
                >
                  <Minus className="w-4 h-4 text-sky-700" />
                </button>
                <div className="min-w-[52px] text-center font-extrabold text-[16px]">
                  {qty}
                </div>
                <button
                  onClick={() => setQty((v) => Math.min(99, v + 1))}
                  className="w-10 h-10 rounded-2xl bg-white border-2 border-sky-200 flex items-center justify-center active:scale-[0.98]"
                >
                  <Plus className="w-4 h-4 text-sky-700" />
                </button>
              </div>

              <div className="text-right">
                <p className="text-[11px] text-slate-500 font-bold">Tạm tính</p>
                <p className={cn("font-extrabold", notEnough ? "text-rose-600" : "text-slate-900")}>
                  {formatMoneyVND(estTotal)}
                </p>
              </div>
            </div>
          </div>

          {/* Coupon */}
          <div className="mt-3 rounded-[22px] bg-white border-2 border-sky-100 p-3">
            <p className="font-extrabold text-[12px] text-slate-700 flex items-center gap-2">
              <TicketPercent className="w-4 h-4 text-sky-700" />
              Mã giảm giá
            </p>
            <input
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              placeholder="VD: HVH10"
              className="mt-2 w-full h-11 px-4 rounded-2xl border-2 border-sky-100 outline-none focus:border-sky-300"
            />
            <p className="text-[11px] text-slate-500 mt-2">
              * Mã sẽ được server kiểm tra khi thanh toán.
            </p>
          </div>

          {/* Balance */}
          <div className="mt-3 flex items-center justify-between rounded-[22px] bg-white border-2 border-sky-100 p-3">
            <p className="text-[12px] font-extrabold text-slate-700 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-sky-700" /> Số dư của bạn
            </p>
            <p className="font-extrabold text-sky-700">{formatMoneyVND(userBalance)}</p>
          </div>

          {notEnough && (
            <div className="mt-3 rounded-[22px] bg-rose-50 border-2 border-rose-200 p-3 text-rose-700 text-[12px] font-bold">
              Không đủ số dư để mua (tạm tính vượt quá số dư).
            </div>
          )}

          <button
            disabled={notEnough}
            onClick={() => onConfirm({ quantity: qty, coupon })}
            className={cn(
              "mt-4 w-full h-12 rounded-2xl font-extrabold border-2 shadow active:scale-[0.99] transition",
              notEnough
                ? "bg-slate-200 border-slate-200 text-slate-500 cursor-not-allowed"
                : "bg-sky-500 border-sky-600 text-white"
            )}
          >
            Thanh toán
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function Shop() {
  const [, navigate] = useLocation();

  const [q, setQ] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  const [buyOpen, setBuyOpen] = useState(false);
  const [buyItem, setBuyItem] = useState<BuyItem | null>(null);

  const [swal, setSwal] = useState<{
    open: boolean;
    variant: "success" | "error" | "info";
    title: string;
    message?: string;
  }>({ open: false, variant: "info", title: "" });

  const closeSwal = () => setSwal((s) => ({ ...s, open: false }));

  // Load session + profile
  const loadMe = async () => {
    const { data } = await supabase.auth.getSession();
    const session = data.session;
    if (!session?.user?.id) {
      setUser(null);
      return;
    }

    const uid = session.user.id;
    const email = session.user.email ?? "";
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id,email,name,avatar,role,status,balance")
      .eq("id", uid)
      .single();

    if (error || !profile) {
      setUser({
        id: uid,
        email,
        name: email ? email.split("@")[0] : "User",
        avatar: null,
        role: "member",
        status: "active",
        balance: 0,
      });
      return;
    }

    setUser({
      id: profile.id,
      email: profile.email ?? email,
      name: profile.name ?? (email ? email.split("@")[0] : "User"),
      avatar: profile.avatar ?? null,
      role: (profile.role ?? "member") as any,
      status: (profile.status ?? "active") as any,
      balance: Number(profile.balance ?? 0),
    });
  };

  useEffect(() => {
    loadMe();
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      loadMe();
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();
    const list = parents as ParentItem[];
    if (!k) return list;
    return list.filter((p) =>
      (p.title + " " + p.subtitle).toLowerCase().includes(k)
    );
  }, [q]);

  const goAuth = (mode: "login" | "register") => navigate(`/auth?mode=${mode}`);

  const logout = async () => {
    await supabase.auth.signOut();
    setMenuOpen(false);
    setUser(null);
    setSwal({
      open: true,
      variant: "success",
      title: "Đã đăng xuất",
      message: "Bạn đã thoát tài khoản.",
    });
  };

  // Khi bấm mua ngay (ở trang con / hoặc bạn gắn vào nơi nào cũng được)
  const openBuy = (item: BuyItem) => {
    if (!user) {
      setSwal({
        open: true,
        variant: "info",
        title: "Bạn chưa đăng nhập",
        message: "Vui lòng đăng nhập để mua hàng.",
      });
      goAuth("login");
      return;
    }
    if (user.status === "locked") {
      setSwal({
        open: true,
        variant: "error",
        title: "Tài khoản bị khoá",
        message: "Không thể mua hàng. Vui lòng liên hệ hỗ trợ.",
      });
      return;
    }
    setBuyItem(item);
    setBuyOpen(true);
  };

  // Gọi backend purchase (100% kiểm tra ở server)
  const confirmBuy = async (payload: { quantity: number; coupon: string }) => {
    if (!user || !buyItem) return;

    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        setBuyOpen(false);
        setSwal({
          open: true,
          variant: "error",
          title: "Phiên đăng nhập hết hạn",
          message: "Vui lòng đăng nhập lại.",
        });
        goAuth("login");
        return;
      }

      const res = await fetch("/api/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          itemId: buyItem.id,
          quantity: payload.quantity,
          coupon: payload.coupon?.trim() || null,
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setBuyOpen(false);
        setSwal({
          open: true,
          variant: "error",
          title: "Mua thất bại",
          message: json?.message || "Có lỗi xảy ra khi thanh toán.",
        });
        return;
      }

      // Server trả balance mới
      const newBalance = typeof json?.newBalance === "number" ? json.newBalance : user.balance;
      setUser({ ...user, balance: newBalance });

      setBuyOpen(false);
      setSwal({
        open: true,
        variant: "success",
        title: "Mua thành công",
        message: `Đã thanh toán ${formatMoneyVND(json?.paid ?? 0)}. Số dư còn: ${formatMoneyVND(newBalance)}.`,
      });
    } catch (e: any) {
      setBuyOpen(false);
      setSwal({
        open: true,
        variant: "error",
        title: "Lỗi mạng",
        message: e?.message || "Không thể kết nối máy chủ.",
      });
    }
  };

  // Demo nhanh 1 item mua (bạn sẽ gọi openBuy ở trang ShopItem.tsx thật)
  const demoBuyItem: BuyItem = {
    id: "demo-item-1",
    title: "Gói UI Bio Premium",
    price: 49000,
    description: "Full UI + animation, tối ưu mobile, kèm source & hướng dẫn.",
  };

  return (
    <div className="min-h-screen bg-[#eaf6ff]">
      {/* HEADER compact */}
      <div className="sticky top-0 z-40">
        <div className="px-3 pt-3 pb-2">
          <div className="max-w-3xl mx-auto">
            <div className="rounded-[22px] bg-white/80 backdrop-blur-md border-2 border-sky-400 shadow-[0_10px_26px_rgba(2,132,199,0.16)]">
              <div className="px-3 py-3 flex items-center gap-2">
                <button
                  onClick={() => setMenuOpen(true)}
                  className="w-10 h-10 rounded-2xl bg-white border-2 border-sky-200 shadow-sm flex items-center justify-center active:scale-[0.98] transition"
                >
                  <Menu className="w-5 h-5 text-sky-700" />
                </button>

                <div className="flex-1 min-w-0 leading-tight">
                  <p className="font-extrabold text-[14px] tracking-wide truncate">SHOP DEV HVH</p>
                  <p className="text-[11px] text-slate-500 truncate">Shop dữ liệu & tài nguyên dev</p>
                </div>

                {!user ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => goAuth("login")}
                      className="h-10 px-3 rounded-2xl bg-sky-50 text-sky-800 font-extrabold text-[12px] border-2 border-sky-200 active:scale-[0.98] transition inline-flex items-center gap-2"
                    >
                      <LogIn className="w-4 h-4" />
                      Đăng nhập
                    </button>
                    <button
                      onClick={() => goAuth("register")}
                      className="h-10 px-3 rounded-2xl bg-sky-500 text-white font-extrabold text-[12px] border-2 border-sky-600 shadow active:scale-[0.98] transition inline-flex items-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      Đăng ký
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setMenuOpen(true)}
                    className="h-10 px-2 pr-3 rounded-2xl bg-white border-2 border-sky-200 shadow-sm active:scale-[0.99] transition inline-flex items-center gap-2"
                  >
                    <div className="w-8 h-8 rounded-full bg-sky-50 border-2 border-sky-200 overflow-hidden flex items-center justify-center">
                      {user.avatar ? (
                        <img src={user.avatar} className="w-full h-full object-cover" />
                      ) : (
                        <User2 className="w-4 h-4 text-sky-700" />
                      )}
                    </div>
                    <div className="text-left leading-tight">
                      <p className="font-extrabold text-[12px] max-w-[120px] truncate">{user.name}</p>
                      <p className="text-[10px] text-slate-500">{formatMoneyVND(user.balance)}</p>
                    </div>
                  </button>
                )}
              </div>

              <div className="px-3 pb-3">
                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border-2 border-sky-200 shadow-sm">
                  <Search className="w-5 h-5 text-slate-400" />
                  <input
                    className="w-full bg-transparent outline-none text-[13px]"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Tìm đơn hàng..."
                  />
                  {!!q && (
                    <button
                      onClick={() => setQ("")}
                      className="px-3 py-1 rounded-xl bg-sky-50 border border-sky-200 font-extrabold text-[11px] text-sky-800"
                    >
                      Xoá
                    </button>
                  )}
                </div>
              </div>
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
              className="fixed left-0 top-0 bottom-0 z-50 w-[86%] max-w-sm bg-white border-r-2 border-sky-200 rounded-r-[26px] p-4 shadow-[0_22px_55px_rgba(2,132,199,0.22)]"
              initial={{ x: -420 }}
              animate={{ x: 0 }}
              exit={{ x: -420 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-11 h-11 rounded-2xl bg-sky-50 border-2 border-sky-200 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-sky-700" />
                  </div>
                  <div>
                    <p className="font-extrabold">Menu</p>
                    <p className="text-xs text-slate-500">Điều hướng nhanh</p>
                  </div>
                </div>

                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-11 h-11 rounded-2xl bg-white border-2 border-sky-200 flex items-center justify-center"
                >
                  <X className="w-6 h-6 text-sky-700" />
                </button>
              </div>

              <div className="mt-4 rounded-[22px] bg-sky-50 border-2 border-sky-200 p-4">
                {!user ? (
                  <>
                    <p className="font-extrabold">Chưa đăng nhập</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Đăng nhập để xem số dư/trạng thái.
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          goAuth("login");
                        }}
                        className="h-11 rounded-2xl bg-white border-2 border-sky-200 font-extrabold text-[12px] text-sky-800 inline-flex items-center justify-center gap-2"
                      >
                        <LogIn className="w-4 h-4" /> Đăng nhập
                      </button>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          goAuth("register");
                        }}
                        className="h-11 rounded-2xl bg-sky-500 border-2 border-sky-600 text-white font-extrabold text-[12px] inline-flex items-center justify-center gap-2 shadow"
                      >
                        <UserPlus className="w-4 h-4" /> Đăng ký
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="font-extrabold">Tài khoản</p>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <div className="rounded-2xl bg-white border-2 border-sky-200 p-3">
                        <p className="text-[11px] text-slate-500 font-bold flex items-center gap-2">
                          <Wallet className="w-4 h-4 text-sky-700" /> Số dư
                        </p>
                        <p className="font-extrabold text-sky-800 mt-1">
                          {formatMoneyVND(user.balance)}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-white border-2 border-sky-200 p-3">
                        <p className="text-[11px] text-slate-500 font-bold flex items-center gap-2">
                          <BadgeCheck className="w-4 h-4 text-sky-700" /> Loại
                        </p>
                        <p className="font-extrabold text-slate-800 mt-1">{user.role}</p>
                      </div>
                    </div>

                    <div className="mt-2 rounded-2xl bg-white border-2 border-sky-200 p-3">
                      <p className="text-[11px] text-slate-500 font-bold">Trạng thái</p>
                      <p className="font-extrabold text-slate-800 mt-1">
                        {user.status === "locked" ? "Bị khoá" : "Hoạt động"}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Tên: <b>{user.name}</b>
                      </p>
                    </div>

                    <button
                      onClick={logout}
                      className="mt-3 w-full h-11 rounded-2xl bg-white border-2 border-sky-200 font-extrabold text-[12px] text-rose-600 inline-flex items-center justify-center gap-2"
                    >
                      <LogOut className="w-4 h-4" /> Đăng xuất
                    </button>
                  </>
                )}
              </div>

              <div className="mt-4 space-y-2">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="w-full text-left p-4 rounded-2xl bg-white border-2 border-sky-200 font-extrabold active:scale-[0.99] transition"
                >
                  Lên đầu trang
                  <p className="text-xs text-slate-500 font-normal mt-1">Header + search</p>
                </button>

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    const el = document.getElementById("orders");
                    el?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="w-full text-left p-4 rounded-2xl bg-white border-2 border-sky-200 font-extrabold active:scale-[0.99] transition"
                >
                  Danh sách đơn hàng
                  <p className="text-xs text-slate-500 font-normal mt-1">Bấm để xem cha/con</p>
                </button>

                <button
                  onClick={() => alert("Liên hệ: bạn gắn link Zalo/FB")}
                  className="w-full text-left p-4 rounded-2xl bg-white border-2 border-sky-200 font-extrabold active:scale-[0.99] transition"
                >
                  Liên hệ / hỗ trợ
                  <p className="text-xs text-slate-500 font-normal mt-1">Zalo / FB</p>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* INTRO */}
      <div className="max-w-3xl mx-auto px-3 pt-3">
        <div className="rounded-[26px] bg-white border-2 border-sky-300 shadow-[0_16px_34px_rgba(2,132,199,0.14)] p-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 border-2 border-sky-200 flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-sky-700" />
            </div>
            <div className="flex-1">
              <p className="font-extrabold text-[16px]">Giới thiệu</p>
              <p className="text-[13px] text-slate-600 mt-1">
                Auth thật bằng Supabase. Thanh toán thật qua server (kiểm tra số dư + coupon).
              </p>

              {/* Demo nút mua ngay để bạn test */}
              <button
                onClick={() => openBuy(demoBuyItem)}
                className="mt-3 w-full h-12 rounded-2xl bg-sky-500 border-2 border-sky-600 text-white font-extrabold shadow active:scale-[0.99] transition"
              >
                Test Mua ngay (demo item)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ORDERS (CHA) */}
      <div id="orders" className="max-w-3xl mx-auto px-3 pt-5 pb-10">
        <div className="flex items-center justify-between px-1">
          <p className="font-extrabold text-[15px] text-slate-900">Đơn hàng cha</p>
          <p className="text-[12px] text-slate-500">{filtered.length} mục</p>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-4">
          {filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => navigate(`/shop/p/${p.id}`)}
              className="text-left rounded-[26px] overflow-hidden bg-white border-2 border-sky-300 shadow-[0_14px_30px_rgba(2,132,199,0.14)] active:scale-[0.995] transition"
            >
              <div className="relative">
                <img src={p.cover} className="w-full h-[180px] object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                {p.tag && (
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 rounded-full bg-white/90 border border-white font-extrabold text-[11px]">
                      {p.tag}
                    </span>
                  </div>
                )}

                <div className="absolute bottom-3 left-4 right-4">
                  <p className="text-white font-extrabold text-[18px] drop-shadow">
                    {p.title}
                  </p>
                  <p className="text-white/90 text-[13px] drop-shadow">{p.subtitle}</p>
                </div>
              </div>

              <div className="p-4 flex items-center justify-between gap-3">
                <div className="text-slate-600 text-[13px]">Bấm để mở đơn con</div>
                <div className="px-4 py-2 rounded-2xl bg-sky-500 text-white font-extrabold text-[13px] border-2 border-sky-600 shadow inline-flex items-center gap-2">
                  Xem đơn <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-6 rounded-[26px] bg-white border-2 border-sky-300 p-4 shadow-[0_14px_30px_rgba(2,132,199,0.12)]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-sky-50 border-2 border-sky-200 flex items-center justify-center">
              <Flame className="w-6 h-6 text-sky-700" />
            </div>
            <div>
              <p className="font-extrabold">Liên hệ</p>
              <p className="text-[13px] text-slate-600">
                Zalo/FB: (bạn thay link) • Hỗ trợ nhanh • Uy tín
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Buy modal */}
      <BuyModal
        open={buyOpen}
        item={buyItem}
        userBalance={user?.balance ?? 0}
        onClose={() => setBuyOpen(false)}
        onConfirm={confirmBuy}
      />

      {/* Swal modal */}
      <Modal
        open={swal.open}
        variant={swal.variant}
        title={swal.title}
        message={swal.message}
        onClose={closeSwal}
      />
    </div>
  );
}
