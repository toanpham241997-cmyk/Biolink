import { useEffect, useMemo, useState, useCallback } from "react";
import { useLocation, Link } from "wouter";
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
  UserCircle2,
  LogOut,
  Wallet,
  ChevronDown,
  CreditCard,
  Landmark,
  History,
  Settings,
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
  balance: number | null;
};

function formatVND(n: number) {
  const val = Number(n || 0);
  try {
    return val.toLocaleString("vi-VN") + "₫";
  } catch {
    return `${val}₫`;
  }
}

export default function Shop() {
  const [, navigate] = useLocation();

  // UI state
  const [q, setQ] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [topupOpen, setTopupOpen] = useState(false);

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

  const openSwal = useCallback(
    (variant: SwalKind, title: string, message?: string) =>
      setSwal({ open: true, variant, title, message }),
    []
  );

  const closeSwal = () => setSwal((s) => ({ ...s, open: false }));

  const closeMenu = () => {
    setMenuOpen(false);
    setTopupOpen(false);
  };

  // ====== AUTH: session + profile ======
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

  const requireLogin = (action: () => void) => {
    if (!profile) {
      openSwal("warning", "Chưa đăng nhập", "Vui lòng đăng nhập để sử dụng tính năng này.");
      return;
    }
    action();
  };

  const logout = async () => {
    await supabase.auth.signOut();
    closeMenu();
    openSwal("success", "Đã đăng xuất");
  };

  // ====== NAV HELPERS (NO 404) ======
  // ✅ Tất cả chuyển trang dùng navigate hoặc <Link>, tuyệt đối không dùng <a href>
  const goAccount = () => requireLogin(() => (closeMenu(), navigate("/account")));
  const goTopupCard = () => requireLogin(() => (closeMenu(), navigate("/topup/card")));
  const goTopupBank = () => requireLogin(() => (closeMenu(), navigate("/topup/bank")));
  const goHistory = () => requireLogin(() => (closeMenu(), navigate("/lich-su-mua-hang")));
  const goTopupHistory = () => {
  setMenuOpen(false);
  setTopupOpen(false);
  navigate("/lich-su-nap-tien");
    const goTopupHistory = () => {
  setMenuOpen(false);
  setTopupOpen(false);
  navigate("/topup/momo");
};

  // ====== UI ======
  return (
    <div className="min-h-screen bg-[#eaf6ff]">
      {/* HEADER */}
      <div className="sticky top-0 z-40 px-3 pt-3">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-[26px] bg-white/85 backdrop-blur-md border-[3px] border-sky-500 shadow-[0_10px_28px_rgba(2,132,199,0.16)] p-3">
            {/* Row 1 */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMenuOpen(true)}
                className="shrink-0 w-10 h-10 rounded-2xl bg-white border-[3px] border-sky-400 shadow-sm flex items-center justify-center active:scale-[0.98] transition"
                aria-label="Menu"
                type="button"
              >
                <Menu className="w-5 h-5 text-sky-700" />
              </button>

              <div className="min-w-0 flex-1 leading-tight">
                <p className="font-extrabold text-[14px] tracking-wide truncate">SHOP DEV HVH</p>
                <p className="text-[11px] text-slate-500 truncate">Shop dữ liệu & tài nguyên dev</p>
              </div>

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
                    type="button"
                  >
                    <div className="w-8 h-8 rounded-full bg-sky-100 border-2 border-sky-300 flex items-center justify-center overflow-hidden">
                      {profile.avatar ? (
                        <img src={profile.avatar} className="w-full h-full object-cover" alt="avatar" />
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
                      type="button"
                    >
                      <LogIn className="w-4 h-4" />
                      Đăng nhập
                    </button>
                    <button
                      onClick={() => navigate("/auth?mode=register")}
                      className="h-10 px-3 rounded-2xl bg-sky-500 text-white font-extrabold text-[12px] border-2 border-sky-600 shadow active:scale-[0.98] transition inline-flex items-center gap-2"
                      type="button"
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
              onClick={closeMenu}
            />

            <motion.aside
              className="fixed left-0 top-0 bottom-0 z-50 w-[86%] max-w-sm bg-white border-r-[3px] border-sky-400 rounded-r-[30px] p-4 shadow-[0_20px_50px_rgba(2,132,199,0.25)] overflow-y-auto"
              initial={{ x: -420 }}
              animate={{ x: 0 }}
              exit={{ x: -420 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-11 h-11 rounded-2xl bg-sky-100 border-2 border-sky-300 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-sky-700" />
                  </div>
                  <div>
                    <p className="font-extrabold">Menu</p>
                    <p className="text-xs text-slate-500">Tài khoản / nạp tiền / lịch sử</p>
                  </div>
                </div>
                <button
                  onClick={closeMenu}
                  className="w-11 h-11 rounded-2xl bg-white border-2 border-sky-300 flex items-center justify-center"
                  type="button"
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
                        <img src={profile.avatar} className="w-full h-full object-cover" alt="avatar" />
                      ) : (
                        <UserCircle2 className="w-7 h-7 text-sky-700" />
                      )}
                    </div>
                    <div className="flex-1 leading-tight">
                      <p className="font-extrabold">{profile.name || "Member"}</p>
                      <p className="text-xs text-slate-600 font-bold truncate">{profile.email || ""}</p>

                      <div className="mt-2 rounded-2xl bg-white border-2 border-sky-200 p-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Wallet className="w-4 h-4 text-sky-700" />
                          <p className="text-xs font-bold text-slate-600">Số dư</p>
                        </div>
                        <p className="font-extrabold text-sky-700">
                          {formatVND(Number(profile.balance ?? 0))}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="font-extrabold">Bạn chưa đăng nhập</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Đăng nhập để xem số dư, nạp tiền & mua hàng.
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          closeMenu();
                          navigate("/auth?mode=login");
                        }}
                        className="h-11 rounded-2xl bg-sky-500 text-white border-2 border-sky-600 font-extrabold inline-flex items-center justify-center gap-2"
                        type="button"
                      >
                        <LogIn className="w-4 h-4" /> Đăng nhập
                      </button>
                      <button
                        onClick={() => {
                          closeMenu();
                          navigate("/auth?mode=register");
                        }}
                        className="h-11 rounded-2xl bg-white text-sky-700 border-2 border-sky-300 font-extrabold inline-flex items-center justify-center gap-2"
                        type="button"
                      >
                        <UserPlus className="w-4 h-4" /> Đăng ký
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* MENU ACTIONS */}
              <div className="mt-4 space-y-2">
                {/* Account */}
                <button
                  onClick={goAccount}
                  className="w-full text-left p-4 rounded-2xl bg-white border-2 border-sky-200 font-extrabold active:scale-[0.99] transition flex items-center justify-between"
                  type="button"
                >
                  <span className="inline-flex items-center gap-2">
                    <Settings className="w-5 h-5 text-sky-700" />
                    Tài khoản
                  </span>
                  <ArrowRight className="w-5 h-5 text-slate-400" />
                </button>

                {/* Topup dropdown */}
                <button
                  onClick={() => setTopupOpen((v) => !v)}
                  className="w-full text-left p-4 rounded-2xl bg-white border-2 border-sky-200 font-extrabold active:scale-[0.99] transition flex items-center justify-between"
                  type="button"
                >
                  <span className="inline-flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-sky-700" />
                    Nạp tiền
                  </span>
                  <ChevronDown
                    className={cn("w-5 h-5 text-slate-500 transition", topupOpen && "rotate-180")}
                  />
                </button>

                <AnimatePresence>
                  {topupOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 space-y-2 pl-2">
                        <button
                          onClick={goTopupCard}
                          className="w-full text-left p-4 rounded-2xl bg-sky-50 border-2 border-sky-200 font-extrabold active:scale-[0.99] transition flex items-center justify-between"
                          type="button"
                        >
                          <span className="inline-flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-sky-700" />
                            Nạp thẻ
                          </span>
                          <ArrowRight className="w-5 h-5 text-slate-400" />
                        </button>

                        <button
                          onClick={goTopupBank}
                          className="w-full text-left p-4 rounded-2xl bg-sky-50 border-2 border-sky-200 font-extrabold active:scale-[0.99] transition flex items-center justify-between"
                          type="button"
                        >
                          <span className="inline-flex items-center gap-2">
                            <Landmark className="w-5 h-5 text-sky-700" />
                            Nạp Bank
                          </span>
                          <ArrowRight className="w-5 h-5 text-slate-400" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* History */}
                <button
                  onClick={goHistory}
                  className="w-full text-left p-4 rounded-2xl bg-white border-2 border-sky-200 font-extrabold active:scale-[0.99] transition flex items-center justify-between"
                  type="button"
                >
                  <span className="inline-flex items-center gap-2">
                    <History className="w-5 h-5 text-sky-700" />
                    Lịch sử mua hàng
                  </span>
                  <ArrowRight className="w-5 h-5 text-slate-400" />
                </button>

                <button
  onClick={() => {
    if (!profile) return openSwal("warning", "Chưa đăng nhập", "Vui lòng đăng nhập trước.");
    goTopupHistory();
  }}
  className="w-full text-left p-4 rounded-2xl bg-white border-2 border-sky-200 font-extrabold active:scale-[0.99] transition flex items-center justify-between"
  type="button"
>
  <span className="inline-flex items-center gap-2">
    <Wallet className="w-5 h-5 text-sky-700" />
    Lịch sử nạp tiền
  </span>
  <ArrowRight className="w-5 h-5 text-slate-400" />
</button>

                {/* Logout */}
                {profile && (
                  <button
                    onClick={logout}
                    className="w-full text-left p-4 rounded-2xl bg-white border-2 border-sky-200 font-extrabold active:scale-[0.99] transition flex items-center justify-between"
                    type="button"
                  >
                    <span className="inline-flex items-center gap-2 text-rose-700">
                      <LogOut className="w-5 h-5" />
                      Đăng xuất
                    </span>
                    <ArrowRight className="w-5 h-5 text-slate-400" />
                  </button>
                )}
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

              {/* ✅ NẠP TIỀN UI: chuyển tab bằng navigate() => không reload => không 404 */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() =>
                    requireLogin(() => {
                      navigate("/topup/card");
                    })
                  }
                  className="h-12 rounded-2xl bg-sky-500 text-white border-2 border-sky-600 font-extrabold shadow active:scale-[0.99] transition inline-flex items-center justify-center gap-2"
                  type="button"
                >
                  <CreditCard className="w-5 h-5" />
                  Nạp thẻ
                </button>

                <button
                  onClick={() =>
                    requireLogin(() => {
                      navigate("/topup/bank");
                    })
                  }
                  className="h-12 rounded-2xl bg-white text-sky-700 border-2 border-sky-300 font-extrabold shadow-sm active:scale-[0.99] transition inline-flex items-center justify-center gap-2"
                  type="button"
                >
                  <Landmark className="w-5 h-5" />
                  Nạp Bank
                </button>
                <button
                  onClick={() =>
                    requireLogin(() => {
                      navigate("/topup/momo");
                    })
                  }
                  className="h-12 rounded-2xl bg-white text-sky-700 border-2 border-sky-300 font-extrabold shadow-sm active:scale-[0.99] transition inline-flex items-center justify-center gap-2"
                  type="button"
                >
                  <Landmark className="w-5 h-5" />
                  Nạp momo
                </button>
              </div>

              {profile && (
                <div className="mt-3 rounded-2xl bg-sky-50 border-2 border-sky-200 p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-sky-700" />
                    <p className="text-[13px] font-extrabold text-slate-700">Số dư hiện có</p>
                  </div>
                  <p className="text-[13px] font-extrabold text-sky-700">
                    {formatVND(Number(profile.balance ?? 0))}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* LIST PARENTS */}
      <div id="orders" className="max-w-3xl mx-auto px-3 pt-4 pb-10">
        <div className="flex items-center justify-between px-1">
          <p className="font-extrabold text-[16px]">Đơn hàng cha</p>
          <p className="text-[12px] text-slate-500">{filteredParents.length} mục</p>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-4">
          {filteredParents.map((p) => (
            // ✅ dùng Link để tránh reload (không 404 do server)
            <Link key={p.id} href={`/shop/p/${p.id}`}>
              <a
                className="block text-left rounded-[30px] overflow-hidden bg-white border-[3px] border-sky-400 shadow-[0_16px_35px_rgba(2,132,199,0.14)] active:scale-[0.995] transition"
                onClick={(e) => {
                  // ✅ đảm bảo không reload nếu môi trường bọc anchor lạ
                  e.preventDefault();
                  navigate(`/shop/p/${p.id}`);
                }}
              >
                <div className="relative">
                  <img src={p.cover} className="w-full h-[190px] object-cover" alt={p.title} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white font-extrabold text-[18px] drop-shadow">{p.title}</p>
                    <p className="text-white/90 text-[13px] drop-shadow line-clamp-2">
                      {p.subtitle}
                    </p>
                  </div>
                </div>

                <div className="p-4 flex items-center justify-between">
                  <p className="text-[13px] text-slate-600 font-bold">Xem đơn con</p>
                  <span className="inline-flex items-center gap-2 text-sky-700 font-extrabold">
                    Mở <ArrowRight className="w-5 h-5" />
                  </span>
                </div>
              </a>
            </Link>
          ))}
        </div>

        {filteredParents.length === 0 && (
          <div className="mt-6 rounded-[30px] bg-white border-[3px] border-sky-300 p-5 shadow">
            <p className="font-extrabold text-[16px]">Không có kết quả</p>
            <p className="text-sm text-slate-600 mt-1">Thử từ khoá khác.</p>
          </div>
        )}
      </div>

      {/* SWAL */}
      <ModalSwal
        open={swal.open}
        variant={swal.variant}
        title={swal.title}
        message={swal.message}
        onClose={closeSwal}
      />
    </div>
  );
}
