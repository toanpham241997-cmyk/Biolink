import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import {
  ArrowLeft,
  CreditCard,
  ShieldCheck,
  Wallet,
  Loader2,
  Tag,
  CheckCircle2,
  XCircle,
  Copy,
  ExternalLink,
} from "lucide-react";
import ModalSwal, { SwalKind } from "../components/ModalSwal";
import { supabase } from "../lib/supabaseClient";

function cn(...cls: (string | false | undefined | null)[]) {
  return cls.filter(Boolean).join(" ");
}
function formatVND(n: number) {
  try {
    return n.toLocaleString("vi-VN") + "₫";
  } catch {
    return `${n}₫`;
  }
}

const TELCOS = [
  { key: "VIETTEL", label: "Viettel" },
  { key: "VINAPHONE", label: "VinaPhone" },
  { key: "MOBIFONE", label: "MobiFone" },
  { key: "VNMOBI", label: "Vietnamobile" },
];

const FACE_VALUES = [10000, 20000, 50000, 100000, 200000, 500000];

type Profile = {
  id: string;
  name: string | null;
  email: string | null;
  balance: number | null;
};

export default function TopupCard() {
  const [, navigate] = useLocation();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [telco, setTelco] = useState(TELCOS[0].key);
  const [amount, setAmount] = useState(FACE_VALUES[2]);
  const [serial, setSerial] = useState("");
  const [pin, setPin] = useState("");

  const [busy, setBusy] = useState(false);
  const [lastTopupId, setLastTopupId] = useState<string | null>(null);

  const callbackUrl = useMemo(() => {
    // Nếu bạn có env client VITE_APP_BASE_URL thì dùng nó.
    // Fallback: lấy từ window.location.origin
    const base = (import.meta as any)?.env?.VITE_APP_BASE_URL || window.location.origin;
    return `${base}/api/topup/card/callback`;
  }, []);

  const [swal, setSwal] = useState<{ open: boolean; variant: SwalKind; title: string; message?: string }>(
    { open: false, variant: "info", title: "" }
  );
  const openSwal = (variant: SwalKind, title: string, message?: string) => setSwal({ open: true, variant, title, message });

  useEffect(() => {
    let alive = true;

    const load = async () => {
      setLoadingProfile(true);
      const { data } = await supabase.auth.getSession();
      const uid = data.session?.user?.id || null;

      if (!uid) {
        if (!alive) return;
        setProfile(null);
        setLoadingProfile(false);
        openSwal("warning", "Chưa đăng nhập", "Vui lòng đăng nhập để nạp thẻ.");
        setTimeout(() => navigate("/auth?mode=login"), 400);
        return;
      }

      const { data: p, error } = await supabase
        .from("profiles")
        .select("id,name,email,balance")
        .eq("id", uid)
        .single();

      if (!alive) return;

      if (error) setProfile(null);
      else setProfile(p as any);

      setLoadingProfile(false);
    };

    load();
    return () => {
      alive = false;
    };
  }, [navigate]);

  const submit = async () => {
    if (!serial.trim() || !pin.trim()) {
      openSwal("error", "Thiếu thông tin", "Bạn cần nhập Serial và Mã thẻ.");
      return;
    }

    setBusy(true);
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      if (!token) {
        openSwal("warning", "Hết phiên đăng nhập", "Vui lòng đăng nhập lại.");
        setTimeout(() => navigate("/auth?mode=login"), 400);
        return;
      }

      const res = await fetch("/api/topup/card/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          telco,
          amount,
          serial: serial.trim(),
          pin: pin.trim(),
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        openSwal("error", "Gửi thẻ thất bại", json?.message || "Có lỗi xảy ra.");
        return;
      }

      setLastTopupId(json?.topupId || null);
      setSerial("");
      setPin("");

      openSwal(
        "success",
        "Đã gửi thẻ",
        "Hệ thống đang xử lý. Khi web đổi thẻ callback thành công, tiền sẽ tự cộng vào số dư."
      );
    } catch (e: any) {
      openSwal("error", "Lỗi mạng", e?.message || "Không thể kết nối server.");
    } finally {
      setBusy(false);
    }
  };

  const copyCallback = async () => {
    try {
      await navigator.clipboard.writeText(callbackUrl);
      openSwal("success", "Đã copy Callback URL");
    } catch {
      openSwal("warning", "Không copy được", "Bạn hãy bôi đen và copy thủ công.");
    }
  };

  return (
    <div className="min-h-screen bg-[#eaf6ff]">
      {/* Header */}
      <div className="sticky top-0 z-40 px-3 pt-3">
        <div className="max-w-3xl mx-auto rounded-[28px] bg-white/90 border-[3px] border-sky-500 shadow p-3">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => navigate("/shop")}
              className="px-3 py-2 rounded-2xl bg-sky-100 border-2 border-sky-300 font-extrabold inline-flex items-center gap-2"
              type="button"
            >
              <ArrowLeft className="w-4 h-4" /> Quay lại
            </button>

            <div className="text-right leading-tight">
              <p className="font-extrabold text-[14px]">Nạp thẻ cào</p>
              <p className="text-[12px] text-slate-500">Tự động đổi thẻ + cộng tiền</p>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-3xl mx-auto px-3 pt-4 pb-10 space-y-4">
        {/* Balance */}
        <div className="rounded-[30px] bg-white border-[3px] border-sky-400 shadow-[0_18px_40px_rgba(2,132,199,0.14)] p-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 border-2 border-sky-300 flex items-center justify-center">
              <Wallet className="w-7 h-7 text-sky-700" />
            </div>
            <div className="flex-1">
              <p className="font-extrabold text-[18px]">Số dư</p>
              {loadingProfile ? (
                <p className="text-sm text-slate-500 mt-1">Đang tải...</p>
              ) : (
                <p className="text-[15px] text-slate-700 mt-1">
                  {profile ? (
                    <span className="font-extrabold text-sky-700">{formatVND(Number(profile.balance ?? 0))}</span>
                  ) : (
                    <span className="text-rose-600 font-bold">Chưa đăng nhập</span>
                  )}
                </p>
              )}

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => navigate("/lich-su-nap-tien")}
                  className="h-12 rounded-2xl bg-white border-2 border-sky-300 font-extrabold text-sky-700 inline-flex items-center justify-center gap-2"
                  type="button"
                >
                  <ShieldCheck className="w-5 h-5" />
                  Lịch sử nạp tiền
                </button>

                <button
                  onClick={() => navigate("/topup/bank")}
                  className="h-12 rounded-2xl bg-sky-500 border-2 border-sky-600 text-white font-extrabold shadow inline-flex items-center justify-center gap-2"
                  type="button"
                >
                  <CreditCard className="w-5 h-5" />
                  Nạp Bank
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Callback URL box */}
        <div className="rounded-[30px] bg-white border-[3px] border-sky-300 shadow p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-sky-700" />
              <p className="font-extrabold text-[16px]">Callback URL</p>
            </div>
            <button
              onClick={copyCallback}
              className="px-3 py-2 rounded-2xl bg-sky-100 border-2 border-sky-300 font-extrabold text-[12px] inline-flex items-center gap-2"
              type="button"
            >
              <Copy className="w-4 h-4" /> Copy
            </button>
          </div>

          <div className="mt-3 rounded-2xl bg-sky-50 border-2 border-sky-200 p-3">
            <p className="text-[12px] text-slate-600 font-bold">Nhập URL này vào web đổi thẻ:</p>
            <p className="mt-1 text-[12px] font-extrabold text-slate-800 break-all">{callbackUrl}</p>
            <p className="mt-2 text-[11px] text-slate-500">
              Khi đổi thẻ xong, web đó sẽ gọi về URL này để cập nhật trạng thái và cộng tiền tự động.
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="rounded-[30px] bg-white border-[3px] border-sky-400 shadow-[0_18px_40px_rgba(2,132,199,0.12)] p-4">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-sky-700" />
            <p className="font-extrabold text-[16px]">Gửi thẻ cào</p>
          </div>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-bold text-slate-500">Nhà mạng</p>
              <select
                className="mt-2 w-full h-12 rounded-2xl bg-white border-2 border-sky-200 px-3 font-extrabold"
                value={telco}
                onChange={(e) => setTelco(e.target.value)}
                disabled={busy}
              >
                {TELCOS.map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-500">Mệnh giá</p>
              <select
                className="mt-2 w-full h-12 rounded-2xl bg-white border-2 border-sky-200 px-3 font-extrabold"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                disabled={busy}
              >
                {FACE_VALUES.map((v) => (
                  <option key={v} value={v}>
                    {formatVND(v)}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <p className="text-xs font-bold text-slate-500">Serial</p>
              <input
                className="mt-2 w-full h-12 rounded-2xl bg-white border-2 border-sky-200 px-3 font-extrabold"
                value={serial}
                onChange={(e) => setSerial(e.target.value)}
                placeholder="Nhập serial..."
                disabled={busy}
                inputMode="numeric"
              />
            </div>

            <div className="sm:col-span-2">
              <p className="text-xs font-bold text-slate-500">Mã thẻ</p>
              <input
                className="mt-2 w-full h-12 rounded-2xl bg-white border-2 border-sky-200 px-3 font-extrabold"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Nhập mã thẻ..."
                disabled={busy}
                inputMode="numeric"
              />
              <p className="mt-2 text-[11px] text-slate-500">
                Hệ thống KHÔNG lưu mã thẻ đầy đủ — chỉ lưu cuối 4 số để đối soát.
              </p>
            </div>

            <button
              onClick={submit}
              disabled={busy}
              className={cn(
                "sm:col-span-2 h-12 rounded-2xl font-extrabold shadow inline-flex items-center justify-center gap-2 border-2",
                busy
                  ? "bg-slate-200 border-slate-300 text-slate-600"
                  : "bg-sky-500 border-sky-600 text-white active:scale-[0.99] transition"
              )}
              type="button"
            >
              {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
              {busy ? "Đang gửi..." : "Gửi thẻ / Nạp ngay"}
            </button>

            {lastTopupId && (
              <div className="sm:col-span-2 rounded-2xl bg-sky-50 border-2 border-sky-200 p-3 text-[12px]">
                <p className="font-extrabold text-slate-700">Mã giao dịch:</p>
                <p className="font-extrabold text-sky-700 break-all">{lastTopupId}</p>
                <button
                  onClick={() => navigate("/lich-su-nap-tien")}
                  className="mt-2 w-full h-11 rounded-2xl bg-white border-2 border-sky-300 font-extrabold text-sky-700 inline-flex items-center justify-center gap-2"
                  type="button"
                >
                  <ExternalLink className="w-4 h-4" />
                  Xem trạng thái trong lịch sử nạp
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Note */}
        <div className="rounded-[28px] bg-white border-[3px] border-sky-300 shadow p-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-sky-700" />
            <p className="font-extrabold text-[16px]">Trạng thái</p>
          </div>
          <div className="mt-3 rounded-2xl bg-sky-50 border-2 border-sky-200 p-3 text-[13px] text-slate-700">
            <ul className="space-y-1">
              <li className="flex items-center gap-2">
                <Loader2 className="w-4 h-4" /> <b>processing</b>: web đổi thẻ đang xử lý
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> <b>success</b>: nạp thành công, tiền tự cộng
              </li>
              <li className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-600" /> <b>failed</b>: nạp thất bại (xem note)
              </li>
            </ul>
          </div>
        </div>
      </div>

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
