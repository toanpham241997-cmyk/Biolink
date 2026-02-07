import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import {
  ArrowLeft,
  Search,
  RefreshCcw,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  CreditCard,
  Landmark,
  Hash,
  CalendarClock,
} from "lucide-react";

import ModalSwal, { SwalKind } from "../components/ModalSwal";
import { supabase } from "../lib/supabaseClient";

type TopupRow = {
  id: string;
  user_id: string;
  method: "card" | "bank";
  amount: number | null;
  status: "pending" | "success" | "failed" | string | null;
  ref: string | null;
  provider: string | null;
  note: string | null;
  created_at: string;
};

function formatVND(n: number) {
  try {
    return n.toLocaleString("vi-VN") + "₫";
  } catch {
    return `${n}₫`;
  }
}

function fmtTime(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString("vi-VN");
  } catch {
    return iso;
  }
}

function badgeStatus(st?: string | null) {
  const v = (st || "").toLowerCase();
  if (v === "success")
    return {
      text: "Thành công",
      cls: "bg-emerald-50 border-emerald-200 text-emerald-700",
      icon: <CheckCircle2 className="w-4 h-4" />,
    };
  if (v === "failed")
    return {
      text: "Thất bại",
      cls: "bg-rose-50 border-rose-200 text-rose-700",
      icon: <XCircle className="w-4 h-4" />,
    };
  return {
    text: "Đang xử lý",
    cls: "bg-amber-50 border-amber-200 text-amber-700",
    icon: <Clock className="w-4 h-4" />,
  };
}

function badgeMethod(m?: string | null) {
  const v = (m || "").toLowerCase();
  if (v === "bank")
    return {
      text: "Bank",
      cls: "bg-sky-50 border-sky-200 text-sky-700",
      icon: <Landmark className="w-4 h-4" />,
    };
  return {
    text: "Thẻ cào",
    cls: "bg-indigo-50 border-indigo-200 text-indigo-700",
    icon: <CreditCard className="w-4 h-4" />,
  };
}

export default function LichSuNapTien() {
  const [, navigate] = useLocation();

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<TopupRow[]>([]);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | "success" | "pending" | "failed">("all");
  const [method, setMethod] = useState<"all" | "card" | "bank">("all");

  const [swal, setSwal] = useState<{
    open: boolean;
    variant: SwalKind;
    title: string;
    message?: string;
  }>({ open: false, variant: "info", title: "" });

  const openSwal = (variant: SwalKind, title: string, message?: string) =>
    setSwal({ open: true, variant, title, message });

  const load = async () => {
    setLoading(true);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user?.id;

      if (!uid) {
        openSwal("warning", "Chưa đăng nhập", "Vui lòng đăng nhập để xem lịch sử nạp tiền.");
        navigate("/auth?mode=login");
        return;
      }

      // ✅ query bảng topups
      const { data, error } = await supabase
        .from("topups")
        .select("id,user_id,method,amount,status,ref,provider,note,created_at")
        .eq("user_id", uid)
        .order("created_at", { ascending: false });

      if (error) {
        openSwal("error", "Không tải được lịch sử nạp", error.message);
        setRows([]);
        return;
      }

      setRows((data as TopupRow[]) || []);
    } catch (e: any) {
      openSwal("error", "Lỗi mạng", e?.message || "Không thể kết nối server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const key = q.trim().toLowerCase();
    return rows.filter((r) => {
      const st = (r.status || "").toLowerCase();
      const mt = (r.method || "").toLowerCase();

      const okStatus = status === "all" || st === status;
      const okMethod = method === "all" || mt === method;

      const hay = [
        r.id,
        r.ref || "",
        r.provider || "",
        r.note || "",
        r.method || "",
        r.status || "",
      ]
        .join(" ")
        .toLowerCase();

      const okQ = !key || hay.includes(key);
      return okStatus && okMethod && okQ;
    });
  }, [rows, q, status, method]);

  const stats = useMemo(() => {
    const total = rows.length;
    const ok = rows.filter((r) => (r.status || "").toLowerCase() === "success").length;
    const pending = rows.filter((r) => (r.status || "").toLowerCase() === "pending").length;
    const failed = rows.filter((r) => (r.status || "").toLowerCase() === "failed").length;
    return { total, ok, pending, failed };
  }, [rows]);

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

      {/* Summary */}
      <div className="max-w-3xl mx-auto px-3 pt-4">
        <div className="rounded-[28px] bg-white border-[3px] border-sky-300 shadow p-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 border-2 border-sky-300 flex items-center justify-center">
              <Filter className="w-7 h-7 text-sky-700" />
            </div>
            <div className="flex-1">
              <p className="font-extrabold text-[18px]">Giao dịch nạp tiền</p>
              <p className="text-[13px] text-slate-600 mt-1">
                Tìm theo mã giao dịch / nội dung. Lọc theo trạng thái & phương thức.
              </p>

              <div className="mt-3 grid grid-cols-4 gap-2 text-[12px]">
                <div className="rounded-2xl bg-sky-50 border-2 border-sky-200 p-2">
                  <p className="text-slate-500 font-bold">Tổng</p>
                  <p className="font-extrabold text-sky-700">{stats.total}</p>
                </div>
                <div className="rounded-2xl bg-emerald-50 border-2 border-emerald-200 p-2">
                  <p className="text-slate-500 font-bold">OK</p>
                  <p className="font-extrabold text-emerald-700">{stats.ok}</p>
                </div>
                <div className="rounded-2xl bg-amber-50 border-2 border-amber-200 p-2">
                  <p className="text-slate-500 font-bold">Chờ</p>
                  <p className="font-extrabold text-amber-700">{stats.pending}</p>
                </div>
                <div className="rounded-2xl bg-rose-50 border-2 border-rose-200 p-2">
                  <p className="text-slate-500 font-bold">Fail</p>
                  <p className="font-extrabold text-rose-700">{stats.failed}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-3xl mx-auto px-3 pt-4">
        <div className="rounded-[28px] bg-white border-[3px] border-sky-300 shadow p-4">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-white border-2 border-sky-200">
            <Search className="w-5 h-5 text-slate-400" />
            <input
              className="w-full bg-transparent outline-none text-[13px]"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm giao dịch nạp..."
            />
            {q && (
              <button
                onClick={() => setQ("")}
                className="px-3 py-1 rounded-xl bg-sky-100 border border-sky-200 font-extrabold text-[12px]"
                type="button"
              >
                Xoá
              </button>
            )}
          </div>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="h-11 rounded-2xl bg-white border-2 border-sky-200 px-3 font-extrabold"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="success">Thành công</option>
              <option value="pending">Đang xử lý</option>
              <option value="failed">Thất bại</option>
            </select>

            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as any)}
              className="h-11 rounded-2xl bg-white border-2 border-sky-200 px-3 font-extrabold"
            >
              <option value="all">Tất cả phương thức</option>
              <option value="card">Thẻ cào</option>
              <option value="bank">Bank</option>
            </select>

            <button
              onClick={load}
              className="h-11 rounded-2xl bg-sky-500 border-2 border-sky-600 text-white font-extrabold inline-flex items-center justify-center gap-2"
              type="button"
              disabled={loading}
            >
              <RefreshCcw className={loading ? "w-4 h-4 animate-spin" : "w-4 h-4"} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="max-w-3xl mx-auto px-3 pt-4 pb-10">
        {filtered.length === 0 ? (
          <div className="rounded-[28px] bg-white border-[3px] border-sky-300 shadow p-5">
            <p className="font-extrabold text-[18px]">Chưa có giao dịch nạp</p>
            <p className="text-[13px] text-slate-600 mt-1">
              Khi bạn nạp thẻ hoặc nạp bank, lịch sử sẽ hiển thị tại đây.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => navigate("/topup/card")}
                className="h-12 rounded-2xl bg-sky-500 border-2 border-sky-600 text-white font-extrabold inline-flex items-center justify-center gap-2"
                type="button"
              >
                <CreditCard className="w-5 h-5" /> Nạp thẻ
              </button>
              <button
                onClick={() => navigate("/topup/bank")}
                className="h-12 rounded-2xl bg-white border-2 border-sky-300 text-sky-700 font-extrabold inline-flex items-center justify-center gap-2"
                type="button"
              >
                <Landmark className="w-5 h-5" /> Nạp Bank
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filtered.map((r) => {
              const st = badgeStatus(r.status);
              const mt = badgeMethod(r.method);
              const amount = Number(r.amount ?? 0);

              return (
                <div
                  key={r.id}
                  className="rounded-[28px] bg-white border-[3px] border-sky-300 shadow p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-extrabold text-[15px] truncate">
                        {mt.text} • {formatVND(amount)}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-2">
                        <div
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border-2 text-[12px] font-extrabold ${mt.cls}`}
                        >
                          {mt.icon}
                          {mt.text}
                        </div>

                        <div
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border-2 text-[12px] font-extrabold ${st.cls}`}
                        >
                          {st.icon}
                          {st.text}
                        </div>
                      </div>

                      <div className="mt-3 space-y-1 text-[12px] text-slate-600">
                        <p className="inline-flex items-center gap-2">
                          <Hash className="w-4 h-4 text-slate-400" />
                          Mã: <b className="text-slate-800">{r.ref || r.id}</b>
                        </p>

                        <p className="inline-flex items-center gap-2">
                          <CalendarClock className="w-4 h-4 text-slate-400" />
                          {fmtTime(r.created_at)}
                        </p>

                        {(r.method === "card" && r.provider) && (
                          <p className="text-slate-600">
                            Nhà mạng: <b className="text-slate-800">{r.provider}</b>
                          </p>
                        )}

                        {(r.method === "bank" && r.note) && (
                          <p className="text-slate-600">
                            Nội dung: <b className="text-slate-800">{r.note}</b>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-extrabold text-sky-700">{formatVND(amount)}</p>
                      <p className="text-[12px] text-slate-500 mt-1">
                        {r.method === "bank" ? "Chuyển khoản" : "Thẻ cào"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
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
