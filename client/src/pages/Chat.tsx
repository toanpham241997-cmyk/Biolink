import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Send,
  Paperclip,
  Image as ImageIcon,
  FileText,
  Bot,
  User,
  Loader2,
  Copy,
  Trash2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type Role = "user" | "assistant";

type Attachment = {
  id: string;
  name: string;
  type: string;
  size: number;
  previewUrl?: string; // ảnh sẽ có previewUrl
};

type ChatMessage = {
  id: string;
  role: Role;
  text: string;
  createdAt: number;
  attachments?: Attachment[];
};

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(i ? 1 : 0)} ${sizes[i]}`;
}

async function safeCopy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: uid("m"),
      role: "assistant",
      text: "Xin chào! Mình là Bot AI 😄\nBạn có thể nhắn tin, gửi ảnh/file (để hiển thị trong chat).",
      createdAt: Date.now(),
    },
  ]);

  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [pickedFiles, setPickedFiles] = useState<File[]>([]);
  const [pickedAttachments, setPickedAttachments] = useState<Attachment[]>([]);
  const [error, setError] = useState<string>("");

  const listRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // auto scroll bottom
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages.length, isSending]);

  // convert selected files to attachments (with image previews)
  useEffect(() => {
    let alive = true;

    const run = async () => {
      const atts: Attachment[] = [];

      for (const f of pickedFiles) {
        const att: Attachment = {
          id: uid("att"),
          name: f.name,
          type: f.type || "application/octet-stream",
          size: f.size,
        };

        if (f.type.startsWith("image/")) {
          const url = URL.createObjectURL(f);
          att.previewUrl = url;
        }

        atts.push(att);
      }

      if (alive) setPickedAttachments(atts);
    };

    run();

    return () => {
      alive = false;
      // revoke previews
      pickedAttachments.forEach((a) => {
        if (a.previewUrl) URL.revokeObjectURL(a.previewUrl);
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    };
  }, [pickedFiles.length]);

  const canSend = useMemo(() => {
    return (input.trim().length > 0 || pickedFiles.length > 0) && !isSending;
  }, [input, pickedFiles.length, isSending]);

  const clearPicked = () => {
    // revoke previews
    pickedAttachments.forEach((a) => {
      if (a.previewUrl) URL.revokeObjectURL(a.previewUrl);
    });
    setPickedFiles([]);
    setPickedAttachments([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onPickFiles = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files);

    // giới hạn an toàn để khỏi crash mobile
    const MAX_FILES = 6;
    const MAX_EACH_MB = 8;

    const limited = arr.slice(0, MAX_FILES).filter((f) => f.size <= MAX_EACH_MB * 1024 * 1024);

    setPickedFiles(limited);
  };

  const sendMessage = async () => {
    setError("");
    if (!canSend) return;

    const userMsg: ChatMessage = {
      id: uid("m"),
      role: "user",
      text: input.trim(),
      createdAt: Date.now(),
      attachments: pickedAttachments.length ? pickedAttachments : undefined,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    clearPicked();

    // typing bubble
    const typingId = uid("typing");
    setIsSending(true);
    setMessages((prev) => [
      ...prev,
      {
        id: typingId,
        role: "assistant",
        text: "…",
        createdAt: Date.now(),
      },
    ]);

    try {
      /**
       * GỌI API SERVER:
       * - Bạn tạo route: POST /api/chat
       * - Nhận { message: string } trả về { reply: string }
       *
       * Nếu bạn muốn gửi file lên server: dùng FormData + multer (server).
       * Hiện tại client sẽ chỉ gửi TEXT để tránh lỗi server.
       */
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.text }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(json?.error || "Chat API lỗi (server chưa tạo /api/chat?)");
      }

      const replyText = String(json?.reply ?? "Mình chưa nhận được reply từ server.");

      setMessages((prev) =>
        prev
          .filter((m) => m.id !== typingId)
          .concat({
            id: uid("m"),
            role: "assistant",
            text: replyText,
            createdAt: Date.now(),
          }),
      );
    } catch (e: any) {
      const msg = e?.message || "Lỗi gửi tin nhắn";
      setError(msg);
      setMessages((prev) =>
        prev
          .filter((m) => m.id !== typingId)
          .concat({
            id: uid("m"),
            role: "assistant",
            text: `⚠️ ${msg}\n\nGợi ý: Bạn cần tạo server route POST /api/chat.`,
            createdAt: Date.now(),
          }),
      );
    } finally {
      setIsSending(false);
    }
  };

  const copyMessage = async (text: string) => {
    const ok = await safeCopy(text);
    if (!ok) alert("Copy thất bại (trình duyệt chặn).");
  };

  const clearChat = () => {
    setMessages([
      {
        id: uid("m"),
        role: "assistant",
        text: "Đã xoá lịch sử chat. Bạn muốn mình giúp gì?",
        createdAt: Date.now(),
      },
    ]);
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-4 flex justify-between items-center backdrop-blur-sm bg-white/10 border-b border-white/20">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/70 dark:bg-card/60 game-border hover:scale-[1.02] active:scale-[0.99] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-semibold">Về Home</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-primary/15 flex items-center justify-center game-border">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div className="leading-tight">
              <p className="font-bold">Bot AI</p>
              <p className="text-xs text-muted-foreground">Chat • gửi ảnh/file</p>
            </div>
          </div>
        </div>

        <button
          onClick={clearChat}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/70 dark:bg-card/60 game-border hover:scale-[1.02] active:scale-[0.99] transition"
          title="Xoá chat"
        >
          <Trash2 className="w-4 h-4" />
          <span className="hidden sm:inline font-semibold">Xoá</span>
        </button>
      </header>

      {/* Body */}
      <div className="pt-24 pb-28 px-4 sm:px-6 max-w-3xl mx-auto">
        <Card className="game-border bg-white/60 dark:bg-card/60 backdrop-blur-sm">
          <CardContent className="pt-6">
            {/* error */}
            {!!error && (
              <div className="mb-4 p-3 rounded-2xl bg-white/70 dark:bg-card/60 game-border text-destructive font-semibold text-sm">
                {error}
              </div>
            )}

            {/* messages */}
            <div
              ref={listRef}
              className="h-[58vh] sm:h-[62vh] overflow-y-auto pr-1 space-y-3"
            >
              <AnimatePresence initial={false}>
                {messages.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ type: "spring", stiffness: 200, damping: 22 }}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[88%] sm:max-w-[80%]`}>
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center game-border ${
                            m.role === "user" ? "bg-primary text-white" : "bg-white/80 dark:bg-card/60 text-primary"
                          }`}
                        >
                          {m.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {m.role === "user" ? "Bạn" : "Bot"} •{" "}
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>

                        {m.text && m.text !== "…" && (
                          <button
                            onClick={() => copyMessage(m.text)}
                            className="ml-auto inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-white/60 dark:bg-card/50 game-border hover:scale-[1.02] active:scale-[0.99] transition"
                            title="Copy"
                          >
                            <Copy className="w-3 h-3" />
                            <span className="hidden sm:inline">Copy</span>
                          </button>
                        )}
                      </div>

                      <div
                        className={`rounded-2xl game-border px-4 py-3 whitespace-pre-wrap break-words ${
                          m.role === "user"
                            ? "bg-primary text-white"
                            : "bg-white/80 dark:bg-card/60 text-foreground"
                        }`}
                      >
                        {m.text === "…" ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm font-semibold">Đang trả lời…</span>
                          </div>
                        ) : (
                          <p className="text-sm leading-relaxed">{m.text}</p>
                        )}

                        {!!m.attachments?.length && (
                          <div className="mt-3 space-y-2">
                            {m.attachments.map((a) => (
                              <div
                                key={a.id}
                                className={`p-2 rounded-xl border border-white/30 bg-white/30 ${
                                  m.role === "user" ? "text-white" : "text-foreground"
                                }`}
                              >
                                {a.previewUrl ? (
                                  <div className="rounded-xl overflow-hidden bg-white/40">
                                    <img
                                      src={a.previewUrl}
                                      alt={a.name}
                                      className="w-full max-h-[240px] object-contain"
                                    />
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    <p className="text-xs font-semibold">{a.name}</p>
                                  </div>
                                )}

                                <div className="mt-1 flex items-center gap-2 text-xs opacity-90">
                                  <span className="inline-flex items-center gap-1">
                                    {a.previewUrl ? <ImageIcon className="w-3 h-3" /> : <Paperclip className="w-3 h-3" />}
                                    {a.type || "file"}
                                  </span>
                                  <span>•</span>
                                  <span>{formatBytes(a.size)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Composer */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-4">
          <div className="p-3 rounded-3xl game-border bg-white/70 dark:bg-card/60 backdrop-blur-sm">
            {/* attachments preview before send */}
            {!!pickedAttachments.length && (
              <div className="mb-2 p-2 rounded-2xl bg-white/60 dark:bg-card/50 game-border">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-muted-foreground">
                    Đính kèm ({pickedAttachments.length})
                  </p>
                  <button
                    onClick={clearPicked}
                    className="text-xs font-bold px-2 py-1 rounded-lg bg-white/70 dark:bg-card/60 game-border hover:scale-[1.02] active:scale-[0.99] transition"
                  >
                    Xoá
                  </button>
                </div>

                <div className="mt-2 grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {pickedAttachments.map((a) => (
                    <div key={a.id} className="rounded-xl overflow-hidden bg-white/60 game-border">
                      {a.previewUrl ? (
                        <img src={a.previewUrl} alt={a.name} className="w-full h-20 object-cover" />
                      ) : (
                        <div className="h-20 flex flex-col items-center justify-center gap-1 p-2">
                          <FileText className="w-5 h-5 text-primary" />
                          <p className="text-[10px] text-center font-semibold line-clamp-2">{a.name}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-end gap-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.txt,.doc,.docx"
                className="hidden"
                onChange={(e) => onPickFiles(e.target.files)}
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-11 h-11 rounded-2xl bg-primary/10 hover:bg-primary/20 game-border flex items-center justify-center transition active:scale-[0.98]"
                title="Đính kèm"
              >
                <Paperclip className="w-5 h-5 text-primary" />
              </button>

              <div className="flex-1">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Nhập tin nhắn… (Enter để gửi, Shift+Enter để xuống dòng)"
                  className="w-full min-h-[44px] max-h-[120px] resize-none rounded-2xl px-4 py-3 bg-white/80 dark:bg-card/60 game-border outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
              </div>

              <button
                onClick={sendMessage}
                disabled={!canSend}
                className="w-11 h-11 rounded-2xl bg-primary text-white game-border flex items-center justify-center transition active:scale-[0.98] disabled:opacity-60"
                title="Gửi"
              >
                {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>

            <p className="mt-2 text-[11px] text-muted-foreground">
              Lưu ý: Client hiện chỉ gửi <b>text</b> lên <b>/api/chat</b>. Ảnh/file đang hiển thị trong UI; muốn bot đọc file/ảnh thì cần server xử lý thêm.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
  }
