import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  LogIn,
  UserPlus,
  Menu,
  X,
  Search,
  Sparkles,
  ShieldCheck,
  Flame,
  UserCircle2,
  LogOut,
  Wallet,
} from "lucide-react";

import ModalSwal, { SwalKind } from "../components/ModalSwal";
import { supabase } from "../lib/supabaseClient";
import { parents } from "./shop.data";

function cn(...cls: (string | false | undefined | null)[]) {
  return cls.filter(Boolean).join(" ");
}

type Profile = {
  id: string;
  email: string | null;
  name: string | null;
  avatar: string | null;
  role: string | null;
  status: string | null;
  balance: number | null; // bigint -> number (demo)
};

function formatVND(n: number) {
  try {
    return n.toLocaleString("vi-VN") + "₫";
  } catch {
    return `${n}₫`;
  }
}

function clampInt(v: string, min: number, max: number) {
  const x = Number(v);
  if (!Number.isFinite(x)) return min;
  return Math.max(min, Math.min(max, Math.floor(x)));
}

export default function Shop() {
  const [, navigate] = useLocation();

  // UI state
  const [q, setQ] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  // auth state
  const [sessionLoading, setSessionLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  // swal state
  const [swal, setSwal] = useState<{
    open: boolean;
    variant: SwalKind;
    title: string;
    message?: string;
  }>({ open: false, variant: "info", title: "" });

  const openSwal = (variant: SwalKind, title: string, message?: string) =>
    setSwal({ open: true, variant, title, message });

  // purchase modal state (dùng chung cho mọi item con)
  const [buyOpen, setBuyOpen] = useState(false);
  const [buyItem, setBuyItem] = useState<{
    itemId: string;
    title: string;
    price: number; // đơn giá
    desc?: string;
  } | null>(null);
  const [qty, setQty] = useState(1);
  const [coupon, setCoupon] = useState("");
  const [buyBusy, setBuyBusy] = useState(false);
  const [couponMeta, setCouponMeta] = useState<{ discount: number; note?: string } | null>(null);

  // ====== AUTH: lấy session + profile ======
  useEffect(() => {
    let alive = true;

    const load = async () => {
      setSessionLoading(true);
      const { data } = await supabase.auth.getSession();
      if (!alive) return;

      const uid = data.session?.user?.id ?? null;
      setUserId(uid);

      if (uid) {
        const { data: p, error } = await supabase
          .from("profiles")
          .select("id,email,name,avatar,role,status,balance")
          .eq("id", uid)
          .single();

        if (!alive) return;
        if (!error && p) setProfile(p as Profile);
        else setProfile(null);
      } else {
        setProfile(null);
      }

      setSessionLoading(false);
    };

    load();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, sess) => {
      const uid = sess?.user?.id ?? null;
      setUserId(uid);

      if (uid) {
        const { data: p } = await supabase
          .from("profiles")
          .select("id,email,name,avatar,role,status,balance")
          .eq("id", uid)
          .single();
        setProfile((p as Profile) ?? null);
      } else {
        setProfile(null);
      }
    });

    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // ====== SEARCH PARENTS ======
  const filteredParents = useMemo(() => {
    const k = q.trim().toLowerCase();
    if (!k) return parents;
    return parents.filter((p) => (p.title + " " + p.subtitle).toLowerCase().includes(k));
  }, [q]);

  // ====== BUY LOGIC (for items con) ======
  const subtotal = useMemo(() => {
    if (!buyItem) return 0;
    return buyItem.price * qty;
  }, [buyItem, qty]);

  const discount = useMemo(() => {
    if (!couponMeta) return 0;
    // discount là số tiền giảm trực tiếp
    return Math.max(0, Math.min(subtotal, couponMeta.discount));
  }, [couponMeta, subtotal]);

  const total = useMemo(() => Math.max(0, subtotal - discount), [subtotal, discount]);

  const openBuy = (payload: { itemId: string; title: string; price: number; desc?: string }) => {
    setBuyItem(payload);
    setQty(1);
    setCoupon("");
    setCouponMeta(null);
    setBuyOpen(true);
  };

  const closeBuy = () => {
    if (buyBusy) return;
    setBuyOpen(false);
  };

  const applyCouponLocalPreview = () => {
    // Preview đơn giản ở UI (server vẫn là nơi quyết định)
    const code = coupon.trim().toUpperCase();
    if (!code) {
      setCouponMeta(null);
      return;
    }

    // ví dụ demo: SALE10 giảm 10k, SALE50 giảm 50k
    if (code === "SALE10") return setCouponMeta({ discount: 10000, note: "Giảm 10.000₫" });
    if (code === "SALE50") return setCouponMeta({ discount: 50000, note: "Giảm 50.000₫" });

    setCouponMeta({ discount: 0, note: "Mã sẽ được kiểm tra trên server" });
  };

  const doPurchase = async () => {
    if (!buyItem) return;

    if (!userId) {
      openSwal("error", "Chưa đăng nhập", "Bạn cần đăng nhập để mua hàng.");
      setBuyOpen(false);
      navigate("/auth?mode=login");
      return;
    }

    if (qty < 1) return openSwal("error", "Số lượng không hợp lệ", "Chọn ít nhất 1.");
    if (!Number.isFinite(qty)) return openSwal("error", "Số lượng không hợp lệ");

    setBuyBusy(true);
    try {
      // Lấy access token gửi server để server verify user
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        openSwal("error", "Phiên đăng nhập hết hạn", "Vui lòng đăng nhập lại.");
        setBuyOpen(false);
        navigate("/auth?mode=login");
        return;
      }

      const res = await fetch("/api/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          itemId: buyItem.itemId,
          quantity: qty,
          coupon: coupon.trim() || null,
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        openSwal("error", "Mua thất bại", json?.message || "Có lỗi xảy ra.");
        return;
      }

      // cập nhật lại profile/balance sau mua
      const { data: p } = await supabase
        .from("profiles")
        .select("id,email,name,avatar,role,status,balance")
        .eq("id", userId)
        .single();
      setProfile((p as Profile) ?? null);

      setBuyOpen(false);
      openSwal("success", "Mua thành công", json?.message || "Đơn hàng đã được xử lý.");
    } catch (e: any) {
      openSwal("error", "Lỗi mạng", e?.message || "Không thể kết nối server.");
    } finally {
      setBuyBusy(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setMenuOpen(false);
    openSwal("success", "Đã đăng xuất");
  };

  // ====== UI ======
  return (
    <div className="min-h-screen bg-[#eaf6ff]">
      {/* HEADER (gọn: 2 hàng tối đa) */}
      <div className="sticky top-0 z-40 px-3 pt-3">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-[26px] bg-white/85 backdrop-blur-md border-[3px] border-sky-500 shadow-[0_10px_28px_rgba(2,132,199,0.16)] p-3">
            {/* Row 1 */}
            <div className="flex items-center gap-2">
              {/* Menu */}
              <button
                onClick={() => setMenuOpen(true)}
                className="shrink-0 w-10 h-10 rounded-2xl bg-white border-[3px] border-sky-400 shadow-sm flex items-center justify-center active:scale-[0.98] transition"
                aria-label="Menu"
              >
                <Menu className="w-5 h-5 text-sky-700" />
              </button>

              {/* Brand */}
              <div className="min-w-0 flex-1 leading-tight">
                <p className="font-extrabold text-[14px] tracking-wide truncate">SHOP DEV HVH</p>
                <p className="text-[11px] text-slate-500 truncate">Shop dữ liệu & tài nguyên dev</p>
              </div>

              {/* Right actions */}
              <div className="shrink-0">
                {sessionLoading ? (
                  <div className="px-3 py-2 rounded-2xl bg-sky-50 border-2 border-sky-200 text-[12px] font-bold text-slate-600">
                    ...
                  </div>
                ) : profile ? (
                  <button
                    onClick={() => setMenuOpen(true)}
                    className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white border-2 border-sky-300 shadow-sm active:scale-[0.98] transition"
                    aria-label="Account"
                  >
                    <div className="w-8 h-8 rounded-full bg-sky-100 border-2 border-sky-300 flex items-center justify-center overflow-hidden">
                      {profile.avatar ? (
                        <img src={profile.avatar} className="w-full h-full object-cover" />
                      ) : (
                        <UserCircle2 className="w-5 h-5 text-sky-700" />
                      )}
                    </div>
                    <div className="text-left leading-tight">
                      <p className="text-[12px] font-extrabold max-w-[110px] truncate">
                        {profile.name || "Member"}
                      </p>
                      <p className="text-[11px] text-slate-500 font-bold">
                        {formatVND(Number(profile.balance ?? 0))}
                      </p>
                    </div>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate("/auth?mode=login")}
                      className="h-10 px-3 rounded-2xl bg-sky-100 text-sky-800 font-extrabold text-[12px] border-2 border-sky-300 active:scale-[0.98] transition inline-flex items-center gap-2"
                    >
                      <LogIn className="w-4 h-4" />
                      Đăng nhập
                    </button>
                    <button
                      onClick={() => navigate("/auth?mode=register")}
                      className="h-10 px-3 rounded-2xl bg-sky-500 text-white font-extrabold text-[12px] border-2 border-sky-600 shadow active:scale-[0.98] transition inline-flex items-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      Đăng ký
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Row 2: Search */}
            <div className="mt-2">
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-white border-2 border-sky-200 shadow-sm">
                <Search className="w-5 h-5 text-slate-400" />
                <input
                  className="w-full bg-transparent outline-none text-[13px]"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Tìm đơn hàng..."
                />
                {q && (
                  <button
                    onClick={() => setQ("")}
                    className="px-3 py-1 rounded-xl bg-sky-100 border border-sky-200 font-bold text-[12px]"
                    type="button"
                  >
                    Xoá
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SLIDE MENU */}
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
              className="fixed left-0 top-0 bottom-0 z-50 w-[86%] max-w-sm bg-white border-r-[3px] border-sky-400 rounded-r-[30px] p-4 shadow-[0_20px_50px_rgba(2,132,199,0.25)]"
              initial={{ x: -420 }}
              animate={{ x: 0 }}
              exit={{ x: -420 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-11 h-11 rounded-2xl bg-sky-100 border-2 border-sky-300 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-sky-700" />
                  </div>
                  <div>
                    <p className="font-extrabold">Menu</p>
                    <p className="text-xs text-slate-500">Điều hướng nhanh</p>
                  </div>
                </div>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-11 h-11 rounded-2xl bg-white border-2 border-sky-300 flex items-center justify-center"
                >
                  <X className="w-6 h-6 text-sky-700" />
                </button>
              </div>

              {/* Account card */}
              <div className="mt-4 rounded-[26px] bg-sky-50 border-[3px] border-sky-200 p-4">
                {profile ? (
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white border-2 border-sky-300 flex items-center justify-center overflow-hidden">
                      {profile.avatar ? (
                        <img src={profile.avatar} className="w-full h-full object-cover" />
                      ) : (
                        <UserCircle2 className="w-7 h-7 text-sky-700" />
                      )}
                    </div>
                    <div className="flex-1 leading-tight">
                      <p className="font-extrabold">{profile.name || "Member"}</p>
                      <p className="text-xs text-slate-600 font-bold">{profile.email || ""}</p>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-[12px]">
                        <div className="rounded-2xl bg-white border-2 border-sky-200 p-2">
                          <p className="text-slate-500 font-bold">Số dư</p>
                          <p className="font-extrabold text-sky-700">
                            {formatVND(Number(profile.balance ?? 0))}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-white border-2 border-sky-200 p-2">
                          <p className="text-slate-500 font-bold">Tài khoản</p>
                          <p className="font-extrabold text-sky-700">
                            {profile.role || "member"}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-white border-2 border-sky-200 p-2 col-span-2">
                          <p className="text-slate-500 font-bold">Trạng thái</p>
                          <p className="font-extrabold text-sky-700">
                            {profile.status || "active"}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={logout}
                        className="mt-3 w-full h-11 rounded-2xl bg-white border-2 border-sky-300 font-extrabold text-sky-700 inline-flex items-center justify-center gap-2"
                      >
                        <LogOut className="w-4 h-4" /> Đăng xuất
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="font-extrabold">Bạn chưa đăng nhập</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Đăng nhập để xem số dư & mua hàng.
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          navigate("/auth?mode=login");
                        }}
                        className="h-11 rounded-2xl bg-sky-500 text-white border-2 border-sky-600 font-extrabold inline-flex items-center justify-center gap-2"
                      >
                        <LogIn className="w-4 h-4" /> Đăng nhập
                      </button>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          navigate("/auth?mode=register");
                        }}
                        className="h-11 rounded-2xl bg-white text-sky-700 border-2 border-sky-300 font-extrabold inline-flex items-center justify-center gap-2"
                      >
                        <UserPlus className="w-4 h-4" /> Đăng ký
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Links */}
              <div className="mt-4 space-y-2">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="w-full text-left p-4 rounded-2xl bg-white border-2 border-sky-200 font-bold active:scale-[0.99] transition"
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
                  className="w-full text-left p-4 rounded-2xl bg-white border-2 border-sky-200 font-bold active:scale-[0.99] transition"
                >
                  Danh sách đơn hàng
                  <p className="text-xs text-slate-500 font-normal mt-1">Đơn hàng cha</p>
                </button>

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    openSwal("info", "Liên hệ", "Bạn thay link Zalo/FB ở phần footer nhé.");
                  }}
                  className="w-full text-left p-4 rounded-2xl bg-white border-2 border-sky-200 font-bold active:scale-[0.99] transition"
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
      <div className="max-w-3xl mx-auto px-3 pt-4">
        <div className="rounded-[30px] bg-white border-[3px] border-sky-400 shadow-[0_18px_40px_rgba(2,132,199,0.16)] p-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 border-2 border-sky-300 flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-sky-700" />
            </div>
            <div className="flex-1">
              <p className="font-extrabold text-[18px]">Giới thiệu</p>
              <p className="text-[14px] text-slate-600 mt-1">
                Bấm vào <b>đơn hàng cha</b> để mở danh sách <b>đơn hàng con</b>. Trong
                đơn hàng con có nút <b>Mua ngay</b> + nhập mã giảm giá.
              </p>

              <div className="mt-4 rounded-[26px] bg-sky-50 border-[3px] border-sky-300 p-4 shadow-sm">
                <ul className="space-y-2 text-[14px] text-slate-700">
                  <li>✅ Giao diện gọn, bấm dễ trên điện thoại.</li>
                  <li>✅ Mua hàng kiểm tra số dư + coupon qua server.</li>
                  <li>✅ Không đủ số dư sẽ không mua được.</li>
                </ul>
              </div>

              {/* Gợi ý: nút nạp tiền (chỉ UI) */}
              {profile && (
                <button
                  onClick={() =>
                    openSwal(
                      "info",
                      "Nạp tiền",
                      "Bạn có thể làm trang /wallet để nạp tiền. (Hiện tại demo UI)"
                    )
                  }
                  className="mt-4 w-full h-12 rounded-2xl bg-white border-2 border-sky-300 font-extrabold text-sky-700 inline-flex items-center justify-center gap-2 active:scale-[0.99] transition"
                >
                  <Wallet className="w-5 h-5" /> Nạp tiền (UI)
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ORDERS (CHA) */}
      <div id="orders" className="max-w-3xl mx-auto px-3 pt-5 pb-10">
        <div className="flex items-center justify-between px-1">
          <p className="font-extrabold text-[16px] text-slate-900">Đơn hàng cha</p>
          <p className="text-[12px] text-slate-500">{filteredParents.length} mục</p>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-4">
          {filteredParents.map((p) => (
            <button
              key={p.id}
              onClick={() => navigate(`/shop/p/${p.id}`)}
              className="text-left rounded-[30px] overflow-hidden bg-white border-[3px] border-sky-400 shadow-[0_16px_35px_rgba(2,132,199,0.14)] active:scale-[0.995] transition"
            >
              <div className="relative">
                <img src={p.cover} className="w-full h-[190px] object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 rounded-full bg-white/90 border-2 border-white font-extrabold text-[12px]">
                    {p.tag}
                  </span>
                </div>

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

        {/* Footer */}
        <div className="mt-6 rounded-[30px] bg-white border-[3px] border-sky-400 p-4 shadow-[0_16px_35px_rgba(2,132,199,0.12)]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-sky-100 border-2 border-sky-300 flex items-center justify-center">
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

      {/* ================= BUY MODAL (SWEETALERT STYLE) ================= */}
      <ModalSwal
        open={buyOpen}
        variant="custom"
        title={buyItem ? `Mua ngay: ${buyItem.title}` : "Mua ngay"}
        onClose={closeBuy}
      >
        {buyItem && (
          <div className="space-y-3">
            {buyItem.desc && (
              <div className="rounded-2xl bg-sky-50 border-2 border-sky-200 p-3 text-[13px] text-slate-700">
                {buyItem.desc}
              </div>
            )}

            {/* Qty */}
            <div className="rounded-2xl bg-white border-2 border-sky-200 p-3">
              <p className="text-xs font-bold text-slate-500">Số lượng</p>
              <div className="mt-2 flex items-center gap-2">
                <button
                  className="w-11 h-11 rounded-2xl bg-sky-50 border-2 border-sky-200 font-extrabold text-sky-700 active:scale-[0.98] transition"
                  onClick={() => setQty((v) => Math.max(1, v - 1))}
                  type="button"
                  disabled={buyBusy}
                >
                  -
                </button>
                <input
                  className="flex-1 h-11 rounded-2xl bg-white border-2 border-sky-200 px-3 text-center font-extrabold"
                  value={qty}
                  onChange={(e) => setQty(clampInt(e.target.value, 1, 999))}
                  inputMode="numeric"
                  disabled={buyBusy}
                />
                <button
                  className="w-11 h-11 rounded-2xl bg-sky-50 border-2 border-sky-200 font-extrabold text-sky-700 active:scale-[0.98] transition"
                  onClick={() => setQty((v) => Math.min(999, v + 1))}
                  type="button"
                  disabled={buyBusy}
                >
                  +
                </button>
              </div>
              <p className="mt-2 text-[12px] text-slate-500">
                Đơn giá: <b>{formatVND(buyItem.price)}</b>
              </p>
            </div>

            {/* Coupon */}
            <div className="rounded-2xl bg-white border-2 border-sky-200 p-3">
              <p className="text-xs font-bold text-slate-500">Mã giảm giá</p>
              <div className="mt-2 flex items-center gap-2">
                <input
                  className="flex-1 h-11 rounded-2xl bg-white border-2 border-sky-200 px-3 font-bold"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  placeholder="Nhập mã (vd: SALE10)"
                  disabled={buyBusy}
                />
                <button
                  className="h-11 px-4 rounded-2xl bg-sky-500 text-white font-extrabold border-2 border-sky-600 shadow active:scale-[0.99] transition"
                  onClick={applyCouponLocalPreview}
                  type="button"
                  disabled={buyBusy}
                >
                  Áp dụng
                </button>
              </div>
              {couponMeta?.note && <p className="mt-2 text-[12px] text-slate-600">{couponMeta.note}</p>}
            </div>

            {/* Total */}
            <div className="rounded-2xl bg-sky-50 border-2 border-sky-200 p-3 text-[13px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-bold">Tạm tính</span>
                <span className="font-extrabold">{formatVND(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-slate-600 font-bold">Giảm</span>
                <span className="font-extrabold text-emerald-700">
                  -{formatVND(discount)}
                </span>
              </div>
              <div className="h-px bg-sky-200 my-2" />
              <div className="flex items-center justify-between">
                <span className="text-slate-700 font-extrabold">Tổng</span>
                <span className="font-extrabold text-sky-700">{formatVND(total)}</span>
              </div>
              {profile && (
                <p className="mt-2 text-[12px] text-slate-600">
                  Số dư hiện tại: <b>{formatVND(Number(profile.balance ?? 0))}</b>
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2">
              <button
                className="h-12 rounded-2xl bg-white border-2 border-sky-300 font-extrabold text-sky-700"
                onClick={closeBuy}
                type="button"
                disabled={buyBusy}
              >
                Huỷ
              </button>
              <button
                className="h-12 rounded-2xl bg-sky-500 border-2 border-sky-600 text-white font-extrabold shadow active:scale-[0.99] transition"
                onClick={doPurchase}
                type="button"
                disabled={buyBusy}
              >
                {buyBusy ? "Đang xử lý..." : "Xác nhận mua"}
              </button>
            </div>

            <p className="text-[11px] text-slate-500 text-center">
              Mã giảm giá & số dư sẽ được kiểm tra lại trên server.
            </p>
          </div>
        )}
      </ModalSwal>

      {/* SWAL INFO/ERROR/SUCCESS */}
      <ModalSwal
        open={swal.open}
        variant={swal.variant}
        title={swal.title}
        message={swal.message}
        onClose={() => setSwal((s) => ({ ...s, open: false }))}
      />
    </div>
  );
}
