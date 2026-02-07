import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Eye, EyeOff, Lock, Mail, User, ArrowLeft, ShieldCheck } from "lucide-react";
import ModalSwal, { SwalKind } from "../components/ModalSwal";
import { supabase } from "../lib/supabaseClient";

function cn(...cls: (string | false | undefined | null)[]) {
  return cls.filter(Boolean).join(" ");
}

function scorePassword(pw: string) {
  let s = 0;
  if (pw.length >= 8) s += 25;
  if (/[A-Z]/.test(pw)) s += 20;
  if (/[a-z]/.test(pw)) s += 15;
  if (/\d/.test(pw)) s += 20;
  if (/[^A-Za-z0-9]/.test(pw)) s += 20;
  if (!pw) s = 0;
  return Math.min(100, s);
}

function strengthLabel(score: number) {
  if (score >= 80) return { text: "Mạnh", className: "text-emerald-600" };
  if (score >= 55) return { text: "Vừa", className: "text-amber-600" };
  return { text: "Yếu", className: "text-rose-600" };
}

export default function Auth() {
  const [loc, navigate] = useLocation();

  // mode từ URL
  const mode = useMemo(() => {
    const m = new URLSearchParams(window.location.search).get("mode");
    return m === "register" ? "register" : "login";
  }, [loc]);

  const [tab, setTab] = useState<"login" | "register">(mode);

  useEffect(() => {
    setTab(mode);
  }, [mode]);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [loading, setLoading] = useState(false);

  const pwScore = useMemo(() => scorePassword(pw), [pw]);
  const pwMeta = useMemo(() => strengthLabel(pwScore), [pwScore]);

  const [swal, setSwal] = useState<{
    open: boolean;
    variant: SwalKind;
    title: string;
    message?: string;
  }>({ open: false, variant: "info", title: "" });

  const openSwal = (variant: SwalKind, title: string, message?: string) =>
    setSwal({ open: true, variant, title, message });

  const closeSwal = () => setSwal((s) => ({ ...s, open: false }));

  const goTab = (t: "login" | "register") => {
    setTab(t);
    navigate(`/auth?mode=${t}`);
  };

  const submit = async () => {
    if (loading) return;

    try {
      setLoading(true);

      if (tab === "register") {
        if (!name.trim()) return openSwal("error", "Thiếu tên", "Vui lòng nhập tên.");
        if (!email.trim()) return openSwal("error", "Thiếu email", "Vui lòng nhập email.");
        if (pw.length < 6) return openSwal("error", "Mật khẩu quá ngắn", "Ít nhất 6 ký tự.");
        if (pw !== pw2) return openSwal("error", "Không khớp", "Mật khẩu xác nhận không đúng.");

        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: pw,
          options: {
            data: { name: name.trim() }, // để trigger profile lấy name
          },
        });

        if (error) return openSwal("error", "Đăng ký thất bại", error.message);

        // Nếu project bật confirm email -> chưa có session
        const hasSession = !!data.session;
        if (!hasSession) {
          openSwal(
            "success",
            "Đăng ký thành công",
            "Vui lòng kiểm tra email để xác minh tài khoản rồi quay lại đăng nhập."
          );
          return;
        }

        openSwal("success", "Đăng ký thành công", "Đang chuyển về Shop…");
        setTimeout(() => navigate("/shop"), 600);
        return;
      }

      // login
      if (!email.trim()) return openSwal("error", "Thiếu email", "Vui lòng nhập email.");
      if (!pw) return openSwal("error", "Thiếu mật khẩu", "Vui lòng nhập mật khẩu.");

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: pw,
      });

      if (error) return openSwal("error", "Đăng nhập thất bại", error.message);

      openSwal("success", "Đăng nhập thành công", "Đang chuyển về Shop…");
      setTimeout(() => navigate("/shop"), 600);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#eaf6ff] px-3 py-4">
      <div className="max-w-md mx-auto">
        {/* top */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/shop")}
            className="w-11 h-11 rounded-2xl bg-white border-2 border-sky-300 shadow-sm flex items-center justify-center active:scale-[0.98] transition"
            type="button"
          >
            <ArrowLeft className="w-5 h-5 text-sky-700" />
          </button>
          <div className="flex-1">
            <p className="font-extrabold text-[16px]">Tài khoản</p>
            <p className="text-xs text-slate-500">Đăng nhập / Đăng ký</p>
          </div>
        </div>

        {/* card */}
        <div className="mt-3 rounded-[30px] bg-white/90 backdrop-blur border-[3px] border-sky-500 shadow-[0_14px_35px_rgba(2,132,199,0.18)] p-4">
          {/* tabs */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => goTab("login")}
              className={cn(
                "h-11 rounded-2xl font-extrabold border-2 transition",
                tab === "login"
                  ? "bg-sky-500 text-white border-sky-600 shadow"
                  : "bg-white text-sky-700 border-sky-300"
              )}
              type="button"
            >
              Đăng nhập
            </button>
            <button
              onClick={() => goTab("register")}
              className={cn(
                "h-11 rounded-2xl font-extrabold border-2 transition",
                tab === "register"
                  ? "bg-sky-500 text-white border-sky-600 shadow"
                  : "bg-white text-sky-700 border-sky-300"
              )}
              type="button"
            >
              Đăng ký
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {tab === "register" && (
              <Field
                icon={<User className="w-4 h-4 text-slate-400" />}
                value={name}
                onChange={setName}
                placeholder="Tên tài khoản"
              />
            )}

            <Field
              icon={<Mail className="w-4 h-4 text-slate-400" />}
              value={email}
              onChange={setEmail}
              placeholder="Email"
              type="email"
            />

            <PasswordField
              icon={<Lock className="w-4 h-4 text-slate-400" />}
              value={pw}
              onChange={setPw}
              placeholder="Mật khẩu"
              show={showPw}
              toggle={() => setShowPw((v) => !v)}
            />

            {tab === "register" && (
              <>
                {/* strength */}
                <div className="rounded-2xl bg-sky-50 border-2 border-sky-200 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-600 font-bold">Độ mạnh mật khẩu</p>
                    <p className={cn("text-xs font-extrabold", pwMeta.className)}>
                      {pwMeta.text}
                    </p>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-white border border-sky-200 overflow-hidden">
                    <div className="h-full bg-sky-500" style={{ width: `${pwScore}%` }} />
                  </div>
                  <p className="mt-2 text-[11px] text-slate-500">
                    Gợi ý: 8+ ký tự, chữ hoa, số, ký tự đặc biệt.
                  </p>
                </div>

                <PasswordField
                  icon={<ShieldCheck className="w-4 h-4 text-slate-400" />}
                  value={pw2}
                  onChange={setPw2}
                  placeholder="Xác nhận mật khẩu"
                  show={showPw2}
                  toggle={() => setShowPw2((v) => !v)}
                />
              </>
            )}

            <button
              onClick={submit}
              disabled={loading}
              className={cn(
                "w-full h-12 rounded-2xl font-extrabold border-2 shadow transition",
                loading
                  ? "bg-slate-200 border-slate-200 text-slate-500 cursor-not-allowed"
                  : "bg-sky-500 text-white border-sky-600 active:scale-[0.99]"
              )}
              type="button"
            >
              {loading ? "Đang xử lý..." : tab === "login" ? "Đăng nhập" : "Tạo tài khoản"}
            </button>

            <p className="text-[11px] text-slate-500 text-center">
              Auth thật bằng Supabase (email/password).
            </p>
          </div>
        </div>
      </div>

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

function Field(props: {
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div className="flex items-center gap-2 px-3 h-11 rounded-2xl bg-white border-2 border-sky-200 shadow-sm">
      {props.icon}
      <input
        type={props.type || "text"}
        className="w-full bg-transparent outline-none text-[13px]"
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder}
        autoComplete={props.type === "email" ? "email" : "on"}
      />
    </div>
  );
}

function PasswordField(props: {
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  show: boolean;
  toggle: () => void;
}) {
  return (
    <div className="flex items-center gap-2 px-3 h-11 rounded-2xl bg-white border-2 border-sky-200 shadow-sm">
      {props.icon}
      <input
        type={props.show ? "text" : "password"}
        className="w-full bg-transparent outline-none text-[13px]"
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder}
        autoComplete="current-password"
      />
      <button
        onClick={props.toggle}
        className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center"
        type="button"
        aria-label="toggle password"
      >
        {props.show ? (
          <EyeOff className="w-4 h-4 text-slate-600" />
        ) : (
          <Eye className="w-4 h-4 text-slate-600" />
        )}
      </button>
    </div>
  );
                                                              }
