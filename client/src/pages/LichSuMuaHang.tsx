import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import {
  ArrowLeft,
  Search,
  Filter,
  ShoppingBag,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Wallet,
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

const TABLE_NAME = "purchases"; // ✅ đổi thành "orders" nếu DB bạn dùng orders

type PurchaseRow = {
  id: string;
  user_id: string;
  item_id: string | null;
  item_title: string | null;
  quantity: number | null;
  amount: number | null; // tổng tiền
  status: string | null; // success/pending/failed
  created_at: string;
};

type Profile = { id: string; balance: number | null };

export default function LichSuMuaHangPage() {
  const [, navigate] = useLocation();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  const [rows, setRows] = useState<PurchaseRow[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | "success" | "pending" | "failed">("all");

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

    const { data } = await supabase.auth.getSession();
    const uid = data.session?.user?.id ?? null;
    if (!uid) {
      setLoading(false);
      openSwal("warning", "Chưa đăng nhập", "Vui lòng đăng nhập để xem lịch sử.");
      setTimeout(() => navigate("/auth?mode=login"), 500);
      return;
    }

    const { data: p } = await supabase.from("profiles").select("id,balance").eq("id", uid).single();
    setProfile((p as Profile) ?? null);

    // lịch sử
    const { data: list, error } = await supabase
      .from(TABLE_NAME)
      .select("id,user_id,item_id,item_title,quantity,amount,status,created_at")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });

    if (error) {
      setLoading(false);
      openSwal("error", "Không tải được lịch sử", error.message);
      return;
    }

    setRows((list as PurchaseRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();
    return rows.filter((r) => {
      const okQ =
        !k ||
        (r.item_title ?? "").toLowerCase().includes(k) ||
        (r.item_id ?? "").toLowerCase().includes(k) ||
        (r.id ?? "").toLowerCase().includes(k);
      const okS = status === "all" ? true : (r.status ?? "") === status;
      return okQ && okS;
    });
  }, [rows, q, status]);

  const badge = (s: string | null) => {
    if (s === "success")
      return { text: "Thành công", cls: "bg-emerald-50 border-emerald-200 text-emerald-700", icon: <CheckCircle2 className="w-4 h-4" /> };
    if (s === "failed")
      return { text: "Thất bại", cls: "bg-rose-50 border-rose-200 text-rose-700", icon: <AlertTriangle className="w-4 h-4" /> };
    return { text: "Đang xử lý", cls: "bg-amber-50 border-amber-200 text-amber-700", icon: <Clock className="w-4 h-4" /> };
  };

  return (
    <div className="min-h-screen bg-[#eaf6ff]">
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
              <p className="font-extrabold text-[14px]">Lịch sử mua hàng</p>
              <p className="text-[12px] text-slate-500">{filtered.length} giao dịch</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-3 pt-4 pb-12 space-y-4">
        <div className="rounded-[30px] bg-white border-[3px] border-sky-400 shadow-[0_18px_40px_rgba(2,132,199,0.16)] p-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 border-2 border-sky-300 flex items-center justify-center">
              <ShoppingBag className="w-7 h-7 text-sky-700" />
            </div>
            <div className="flex-1">
              <p className="font-extrabold text-[18px]">Giao dịch của bạn</p>
              <p className="text-[13px] text-slate-600 mt-1">
                Tìm theo tên sản phẩm / mã giao dịch. Có lọc trạng thái.
              </p>

              <div className="mt-3 rounded-2xl bg-sky-50 border-2 border-sky-200 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-sky-700" />
                  <p className="text-[13px] font-extrabold text-slate-700">Số dư</p>
                </div>
                <p className="text-[13px] font-extrabold text-sky-700">
                  {loading ? "..." : formatVND(Number(profile?.balance ?? 0))}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="rounded-[30px] bg-white border-[3px] border-sky-300 shadow p-4 space-y-3">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-white border-2 border-sky-200">
            <Search className="w-5 h-5 text-slate-400" />
            <input
              className="w-full bg-transparent outline-none text-[13px] font-bold"
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
            <div className="shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-sky-50 border-2 border-sky-200 font-extrabold text-[12px] text-slate-700">
              <Filter className="w-4 h-4" /> Trạng thái
            </div>
            <select
              className="flex-1 h-11 rounded-2xl border-2 border-sky-200 px-3 font-extrabold outline-none"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
            >
              <option value="all">Tất cả</option>
              <option value="success">Thành công</option>
              <option value="pending">Đang xử lý</option>
              <option value="failed">Thất bại</option>
            </select>

            <button
              onClick={load}
              className="h-11 px-4 rounded-2xl bg-sky-500 border-2 border-sky-600 text-white font-extrabold shadow active:scale-[0.99] transition"
              type="button"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* List */}
        <div className="space-y-3">
          {loading ? (
            <div className="rounded-[30px] bg-white border-[3px] border-sky-300 p-6 shadow text-center text-slate-600 font-bold">
              Đang tải lịch sử...
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-[30px] bg-white border-[3px] border-sky-300 p-6 shadow">
              <p className="font-extrabold text-[16px]">Chưa có giao dịch</p>
              <p className="text-sm text-slate-600 mt-1">Bạn hãy mua 1 sản phẩm để thấy lịch sử ở đây.</p>
              <button
                onClick={() => navigate("/shop")}
                className="mt-3 h-11 w-full rounded-2xl bg-sky-500 border-2 border-sky-600 text-white font-extrabold shadow"
                type="button"
              >
                Về shop
              </button>
            </div>
          ) : (
            filtered.map((r) => {
              const b = badge(r.status);
              return (
                <div
                  key={r.id}
                  className="rounded-[30px] bg-white border-[3px] border-sky-300 shadow p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-extrabold text-[15px] truncate">
                        {r.item_title || `Sản phẩm: ${r.item_id || "-"}`}
                      </p>
                      <p className="text-[12px] text-slate-500 mt-1">
                        Mã GD: <b className="text-slate-700">{r.id}</b>
                      </p>
                      <p className="text-[12px] text-slate-500">
                        Thời gian:{" "}
                        <b className="text-slate-700">
                          {new Date(r.created_at).toLocaleString("vi-VN")}
                        </b>
                      </p>
                    </div>

                    <div className={cn("shrink-0 px-3 py-2 rounded-2xl border-2 font-extrabold text-[12px] inline-flex items-center gap-2", b.cls)}>
                      {b.icon}
                      {b.text}
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="rounded-2xl bg-sky-50 border-2 border-sky-200 p-3">
                      <p className="text-[11px] text-slate-500 font-bold">Số lượng</p>
                      <p className="font-extrabold text-slate-800 mt-1">
                        {r.quantity ?? 1}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-sky-50 border-2 border-sky-200 p-3">
                      <p className="text-[11px] text-slate-500 font-bold">Tổng tiền</p>
                      <p className="font-extrabold text-sky-700 mt-1">
                        {formatVND(Number(r.amount ?? 0))}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
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
