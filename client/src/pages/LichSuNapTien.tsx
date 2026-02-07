import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, RefreshCw, Search, Filter, CheckCircle2, XCircle, Loader2, Wallet } from "lucide-react";
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

type TopupRow = {
  id: string;
  provider: string;
  method: string;
  status: "pending" | "processing" | "success" | "failed";
  amount: number;
  fee: number;
  telco: string | null;
  face_value: number | null;
  serial_masked: string | null;
  pin_last4: string | null;
  provider_ref: string | null;
  note: string | null;
  created_at: string;
};

type Profile = { id: string; balance: number | null };

export default function LichSuNapTien() {
  const [, navigate] = useLocation();

  const [profile, setProfile] = useState<Profile | null>(null);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>(""); // "" = all
  const [items, setItems] = useState<TopupRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [swal, setSwal] = useState<{ open: boolean; variant: SwalKind; title: string; message?: string }>(
    { open: false, variant: "info", title: "" }
  );
  const openSwal = (variant: SwalKind, title: string, message?: string) => setSwal({ open: true, variant, title, message });

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      const uid = data.session?.user?.id;

      if (!token || !uid) {
        openSwal("warning", "Chưa đăng nhập", "Vui lòng đăng nhập để xem lịch sử nạp.");
        setTimeout(() => navigate("/auth?mode=login"), 300);
        return;
      }

      // lấy balance
      const { data: p } = await supabase.from("profiles").select("id,balance").eq("id", uid).single();
      setProfile((p as any) ?? null);

      const url = new URL(window.location.origin + "/api/topup/history");
      if (status) url.searchParams.set("status", status);
      url.searchParams.set("limit", "100");

      const res = await fetch(url.toString().replace(window.location.origin, ""), {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        openSwal("error", "Không tải được lịch sử", json?.message || "Có lỗi xảy ra.");
        setItems([]);
        return;
      }

      setItems((json?.items || []) as TopupRow[]);
    } catch (e: any) {
      openSwal("error", "Lỗi mạng", e?.message || "Không thể kết nối server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();
    if (!k) return items;
    return items.filter((x) => {
      const s = `${x.id} ${x.telco || ""} ${x.serial_masked || ""} ${x.provider_ref || ""} ${x.note || ""}`.toLowerCase();
      return s.includes(k);
    });
  }, [items, q]);

  const badge = (s: TopupRow["status"]) => {
    if (s === "success")
      return <span className="px-3 py-1 rounded-full bg-emerald-50 border-2 border-emerald-200 text-emerald-700 font-extrabold text-[12px] inline-flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/> Thành công</span>;
    if (s === "failed")
      return <span className="px-3 py-1 rounded-full bg-rose-50 border-2 border-rose-200 text-rose-700 font-extrabold text-[12px] inline-flex items-center gap-2"><XCircle className="w-4 h-4"/> Thất bại</span>;
    return <span className="px-3 py-1 rounded-full bg-sky-50 border-2 border-sky-200 text-sky-700 font-extrabold text-[12px] inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin"/> Đang xử lý</span>;
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
              <p className="font-extrabold text-[14px]">Lịch sử nạp tiền</p>
              <p className="text-[12px] text-slate-500">{filtered.length} giao dịch</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-3 pt-4 pb-10 space-y-4">
        {/* Card info */}
        <div className="rounded-[30px] bg-white border-[3px] border-sky-400 shadow p-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 border-2 border-sky-300 flex items-center justify-center">
              <Wallet className="w-7 h-7 text-sky-700" />
            </div>
            <div className="flex-1">
              <p className="font-extrabold text-[18px]">Giao dịch của bạn</p>
              <p className="text-[14px] text-slate-600 mt-1">
                Tìm theo mã giao dịch / serial / ref. Có lọc trạng thái.
              </p>

              <div className="mt-3 rounded-2xl bg-sky-50 border-2 border-sky-200 p-3 flex items-center justify-between">
                <p className="text-[13px] font-extrabold text-slate-700">Số dư</p>
                <p className="text-[13px] font-extrabold text-sky-700">{formatVND(Number(profile?.balance ?? 0))}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-[30px] bg-white border-[3px] border-sky-300 shadow p-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-white border-2 border-sky-200 shadow-sm">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                className="w-full bg-transparent outline-none text-[13px]"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm giao dịch..."
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

            <div className="flex items-center gap-2">
              <div className="flex-1 inline-flex items-center gap-2">
                <Filter className="w-5 h-5 text-slate-500" />
                <select
                  className="w-full h-12 rounded-2xl bg-white border-2 border-sky-200 px-3 font-extrabold"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Tất cả</option>
                  <option value="processing">Đang xử lý</option>
                  <option value="success">Thành công</option>
                  <option value="failed">Thất bại</option>
                </select>
              </div>

              <button
                onClick={load}
                className="h-12 px-4 rounded-2xl bg-sky-500 border-2 border-sky-600 text-white font-extrabold shadow inline-flex items-center justify-center gap-2 active:scale-[0.99] transition"
                type="button"
              >
                <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="rounded-[30px] bg-white border-[3px] border-sky-300 shadow p-6 text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto" />
            <p className="mt-2 font-extrabold">Đang tải...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-[30px] bg-white border-[3px] border-sky-300 shadow p-6">
            <p className="font-extrabold text-[18px]">Chưa có giao dịch</p>
            <p className="text-sm text-slate-600 mt-1">Bạn hãy nạp thẻ hoặc nạp bank để thấy lịch sử ở đây.</p>
            <button
              onClick={() => navigate("/topup/card")}
              className="mt-4 w-full h-12 rounded-2xl bg-sky-500 border-2 border-sky-600 text-white font-extrabold shadow"
              type="button"
            >
              Nạp thẻ ngay
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((x) => (
              <div
                key={x.id}
                className="rounded-[30px] bg-white border-[3px] border-sky-300 shadow p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-extrabold text-[14px] break-all">{x.id}</p>
                    <p className="text-[12px] text-slate-500 mt-1">
                      {new Date(x.created_at).toLocaleString("vi-VN")}
                    </p>
                  </div>
                  {badge(x.status)}
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-[13px]">
                  <div className="rounded-2xl bg-sky-50 border-2 border-sky-200 p-3">
                    <p className="text-slate-500 font-bold">Hình thức</p>
                    <p className="font-extrabold text-sky-700">{x.method.toUpperCase()}</p>
                  </div>
                  <div className="rounded-2xl bg-sky-50 border-2 border-sky-200 p-3">
                    <p className="text-slate-500 font-bold">Tiền cộng</p>
                    <p className="font-extrabold text-sky-700">{formatVND(Number(x.amount || 0))}</p>
                  </div>

                  <div className="rounded-2xl bg-white border-2 border-sky-200 p-3 col-span-2">
                    <p className="text-slate-500 font-bold">Chi tiết</p>
                    <p className="mt-1 font-bold text-slate-700">
                      {x.telco ? `Nhà mạng: ${x.telco}` : "—"} {x.face_value ? `• Mệnh giá: ${formatVND(x.face_value)}` : ""}
                    </p>
                    <p className="text-[12px] text-slate-600 mt-1">
                      Serial: <b>{x.serial_masked || "—"}</b> • PIN cuối: <b>{x.pin_last4 || "—"}</b>
                    </p>
                    {x.provider_ref && (
                      <p className="text-[12px] text-slate-600 mt-1">
                        Ref: <b className="break-all">{x.provider_ref}</b>
                      </p>
                    )}
                    {x.note && (
                      <p className="text-[12px] text-slate-500 mt-2">
                        Ghi chú: <b>{x.note}</b>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
