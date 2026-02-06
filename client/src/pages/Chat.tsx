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

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/** =========================
 * OFFLINE “SMART” BOT LOGIC
 * (Intent + memory + safety)
 * ========================= */

type BotMemory = {
  turns: number;
  userName?: string;
  topic?: string; // chủ đề đang nói
  lastUserText?: string;
  mood?: "friendly" | "serious";
};

function norm(s: string) {
  return (s || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function pick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function nowText() {
  const d = new Date();
  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const date = d.toLocaleDateString();
  return `Bây giờ là ${time} • ${date}.`;
}

/** chặn chủ đề xấu: hack/cheat/phishing/malware... */
function isBadTopic(t: string) {
  const bad = [
    "hack",
    "cheat",
    "crack",
    "bypass",
    "ddos",
    "botnet",
    "keylogger",
    "phishing",
    "steal",
    "đánh cắp",
    "lừa đảo",
    "chiếm quyền",
    "free fire hack",
    "pubg hack",
    "tool hack",
    "regedit hack",
    "aimbot",
    "wallhack",
  ];
  return bad.some((k) => t.includes(k));
}

/** nhận diện ý định (intent) */
type Intent =
  | "greet"
  | "who"
  | "time"
  | "math"
  | "name_set"
  | "help"
  | "web_dev"
  | "upload"
  | "chatbot"
  | "contact"
  | "bad"
  | "unknown";

function detectIntent(t: string): Intent {
  if (!t) return "unknown";

  if (isBadTopic(t)) return "bad";

  if (/(^|\b)(hi|hello|hey|chào|xin chào|alo|hê lô|helo)(\b|$)/.test(t)) return "greet";
  if (t.includes("bạn là ai") || t.includes("mày là ai") || t.includes("ai vậy")) return "who";
  if (t.includes("mấy giờ") || t.includes("bây giờ") || t.includes("hôm nay") || t.includes("ngày")) return "time";

  // đặt tên: "tôi tên là", "mình tên", "tên tôi"
  if (t.includes("tôi tên là") || t.includes("mình tên là") || t.includes("tên tôi là")) return "name_set";

  if (t.includes("giúp") || t.includes("help") || t.includes("hướng dẫn") || t.includes("làm sao")) return "help";

  // web/dev
  const webKeys = ["react", "vite", "tsx", "tailwind", "render", "deploy", "router", "route", "404", "github"];
  if (webKeys.some((k) => t.includes(k))) return "web_dev";

  // upload / lấy link ảnh
  const upKeys = ["upload", "upanhlaylink", "imgbb", "lấy link", "up ảnh", "đăng ảnh"];
  if (upKeys.some((k) => t.includes(k))) return "upload";

  // chatbot
  const botKeys = ["chatbot", "bot", "ai", "trợ lý", "assistant"];
  if (botKeys.some((k) => t.includes(k))) return "chatbot";

  // contact/mail
  if (t.includes("liên hệ") || t.includes("email") || t.includes("gmail") || t.includes("contact")) return "contact";

  // math: có phép tính
  if (/[0-9]/.test(t) && /[+\-*/()%]/.test(t)) return "math";

  return "unknown";
}

/** cố gắng tách tên người dùng */
function extractName(raw: string): string | undefined {
  const t = raw.trim();
  const patterns = [
    /tôi tên là\s+(.+)/i,
    /mình tên là\s+(.+)/i,
    /tên tôi là\s+(.+)/i,
  ];
  for (const p of patterns) {
    const m = t.match(p);
    if (m?.[1]) {
      const name = m[1].trim().replace(/[.!?]+$/g, "");
      if (name.length >= 2 && name.length <= 30) return name;
    }
  }
  return undefined;
}

/** tính toán an toàn (chỉ toán tử cơ bản) */
function extractMathExpression(text: string) {
  const cleaned = text
    .replace(/[,]/g, ".")
    .replace(/[^\d+\-*/().%\s]/g, "")
    .trim();
  if (!/[+\-*/()%]/.test(cleaned)) return "";
  if (cleaned.length > 60) return "";
  return cleaned;
}

function safeEval(expr: string): string {
  // eslint-disable-next-line no-new-func
  const fn = new Function(`return (${expr});`);
  const v = fn();
  if (typeof v !== "number" || !Number.isFinite(v)) return "Mình không tính được biểu thức này 😅";
  const out = Math.abs(v) >= 1e10 ? v.toExponential(4) : Number(v.toFixed(8)).toString();
  return out;
}

/** trả lời thông minh hơn: dựa trên intent + memory + follow-up */
function generateOfflineReply(
  userTextRaw: string,
  hasAttachments: boolean,
  mem: BotMemory,
): { reply: string; nextMem: BotMemory } {
  const userText = (userTextRaw || "").trim();
  const t = norm(userText);

  let nextMem: BotMemory = { ...mem, turns: mem.turns + 1, lastUserText: userTextRaw };

  // Nếu người dùng chỉ gửi file/ảnh
  if (!t && hasAttachments) {
    return {
      reply:
        "Mình nhận được ảnh/file rồi 👍\nBạn muốn mình làm gì với nó? Ví dụ:\n• đặt tên/ghi chú\n• gợi ý dùng ở mục nào trong bio\n• tạo caption / mô tả ngắn",
      nextMem,
    };
  }

  const intent = detectIntent(t);

  // CHẶN
  if (intent === "bad") {
    nextMem.topic = "safe";
    return {
      reply:
        "Mình không thể hỗ trợ nội dung **hack/cheat/xâm nhập/lừa đảo**.\n\n" +
        "Nếu bạn muốn, mình giúp theo hướng **hợp pháp**:\n" +
        "• Tối ưu FPS/ping, setting\n" +
        "• Bảo mật tài khoản, chống mất nick\n" +
        "• Học lập trình web/app đúng luật\n",
      nextMem,
    };
  }

  // Greet
  if (intent === "greet") {
    const name = mem.userName ? ` ${mem.userName}` : "";
    nextMem.mood = "friendly";
    return {
      reply: pick([
        `Chào${name}! 😄 Bạn muốn hỏi gì nè?`,
        `Hello${name}! ✨ Bạn cần mình giúp phần web hay phần chat?`,
        `Chào${name} 👋 Cứ hỏi thoải mái nhé!`,
      ]),
      nextMem,
    };
  }

  // Who
  if (intent === "who") {
    nextMem.topic = "intro";
    return {
      reply:
        "Mình là **Bot Offline** chạy ngay trong web của bạn 🤖\n" +
        "Mình không dùng API nên không “biết mọi thứ”, nhưng mình hiểu **ý cơ bản** bằng logic:\n" +
        "• chào hỏi • tính toán • hướng dẫn web/react • upload ảnh • gợi ý cải tiến giao diện\n\n" +
        "Bạn muốn hỏi chủ đề nào?",
      nextMem,
    };
  }

  // Set name
  if (intent === "name_set") {
    const name = extractName(userTextRaw);
    if (name) {
      nextMem.userName = name;
      nextMem.topic = "greet";
      return {
        reply: `Ok ${name} 😄 Mình nhớ tên bạn rồi! Bạn muốn làm gì tiếp?`,
        nextMem,
      };
    }
    return {
      reply: "Bạn viết theo mẫu giúp mình nhé: **Tôi tên là ...**",
      nextMem,
    };
  }

  // Time/date
  if (intent === "time") {
    nextMem.topic = "time";
    return { reply: nowText(), nextMem };
  }

  // Math
  if (intent === "math") {
    const expr = extractMathExpression(t);
    if (!expr) return { reply: "Bạn gửi biểu thức rõ hơn giúp mình (vd: 12.5*3-7).", nextMem };
    try {
      const ans = safeEval(expr);
      nextMem.topic = "math";
      return { reply: `Kết quả: **${ans}**`, nextMem };
    } catch {
      return { reply: "Mình không tính được biểu thức này 😅", nextMem };
    }
  }

  // Help (gợi ý menu)
  if (intent === "help") {
    nextMem.topic = "help";
    return {
      reply:
        "Mình có thể giúp bạn mấy việc này 👇\n" +
        "1) **Web/React/Render/GitHub**: sửa lỗi, thêm trang, menu, icon\n" +
        "2) **Upload ảnh lấy link**: hướng dẫn / tạo page upload\n" +
        "3) **Chatbot offline**: cải tiến UI, hiệu ứng nhắn tin\n\n" +
        "Bạn chọn **1 / 2 / 3** nhé.",
      nextMem,
    };
  }

  // Web dev
  if (intent === "web_dev") {
    nextMem.topic = "web_dev";
    const name = mem.userName ? ` ${mem.userName}` : "";
    return {
      reply:
        `Ok${name} 👍 Nếu bạn đang làm web bio của bạn, đây là các lỗi hay gặp:\n` +
        "• **404 khi vào /upload hoặc /chat**: `App.tsx` phải có Route và `NotFound` để cuối.\n" +
        "• **Icon bằng link**: nơi render icon phải kiểm tra URL và dùng `<img />`.\n" +
        "• **Menu không hiện**: thiếu state `isMenuOpen` hoặc thiếu `return`/thẻ đóng.\n\n" +
        "Bạn đang kẹt ở lỗi nào? Dán 5–10 dòng quanh chỗ lỗi là mình chỉ đúng.",
      nextMem,
    };
  }

  // Upload
  if (intent === "upload") {
    nextMem.topic = "upload";
    return {
      reply:
        "Về **Upload ảnh lấy link**:\n" +
        "• Nếu không dùng API: bạn có thể mở trang up ảnh bên ngoài.\n" +
        "• Nếu muốn tích hợp vào web: tạo page `/upload` + dùng ImgBB (cần key) hoặc server upload.\n\n" +
        "Bạn muốn kiểu nào: **(A) mở trang up ảnh ngoài** hay **(B) có page upload trong web**?",
      nextMem,
    };
  }

  // Chatbot
  if (intent === "chatbot") {
    nextMem.topic = "chatbot";
    return {
      reply:
        "Chatbot offline vẫn làm được trải nghiệm đẹp:\n" +
        "• hiệu ứng typing • lưu lịch sử • trả lời theo chủ đề • chặn nội dung xấu\n\n" +
        "Bạn muốn bot tập trung chủ đề nào? Ví dụ: **web/React**, **upload ảnh**, hay **tư vấn học lập trình**.",
      nextMem,
    };
  }

  // Contact
  if (intent === "contact") {
    nextMem.topic = "contact";
    return {
      reply:
        "Nếu bạn muốn **gửi Gmail liên hệ** ở cuối web:\n" +
        "• đơn giản nhất là dùng `mailto:`\n" +
        "• hoặc làm form rồi gửi qua service (nhưng sẽ cần backend/email provider)\n\n" +
        "Bạn muốn kiểu **mailto** hay **form gửi thật**?",
      nextMem,
    };
  }

  // UNKNOWN: cố “hiểu” theo ngữ cảnh gần nhất
  const topic = mem.topic || "general";
  const name = mem.userName ? ` ${mem.userName}` : "";

  if (topic === "web_dev") {
    return {
      reply:
        `Mình hiểu rồi${name}. Bạn mô tả thêm giúp mình:\n` +
        "• Bạn đang sửa file nào? (Home.tsx / App.tsx / CategoryAccordion…)\n" +
        "• Lỗi hiện ra là gì? (ảnh/log)\n\n" +
        "Dán đoạn code lỗi, mình chỉ đúng dòng cần sửa.",
      nextMem,
    };
  }

  if (topic === "upload") {
    return {
      reply:
        `Ok${name}. Nếu bạn muốn **không cần key** thì cách nhanh nhất là:\n` +
        "• bấm nút mở trang up ảnh ngoài → up → copy link\n\n" +
        "Còn nếu muốn tích hợp trong web thì sẽ cần 1 dịch vụ host ảnh (đa số có key).",
      nextMem,
    };
  }

  return {
    reply: pick([
      `Ok${name} 👍 Bạn nói rõ hơn 1 chút: bạn muốn kết quả như thế nào?`,
      `Mình hiểu ý bạn${name}. Bạn muốn mình trả lời theo kiểu **ngắn gọn** hay **hướng dẫn từng bước**?`,
      `Bạn cho mình thêm thông tin: bạn đang làm phần nào trong web (Home/Menu/Upload/Chat)?`,
    ]),
    nextMem,
  };
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const raw = localStorage.getItem("offline_chat_messages_v1");
      if (raw) return JSON.parse(raw) as ChatMessage[];
    } catch {}
    return [
      {
        id: uid("m"),
        role: "assistant",
        text: "Xin chào! Mình là Bot Offline 😄\nBạn có thể nhắn tin, gửi ảnh/file (để hiển thị trong chat).",
        createdAt: Date.now(),
      },
    ];
  });

  const [mem, setMem] = useState<BotMemory>(() => {
    try {
      const raw = localStorage.getItem("offline_chat_memory_v1");
      if (raw) return JSON.parse(raw) as BotMemory;
    } catch {}
    return { turns: 0, topic: "general", mood: "friendly" };
  });

  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [pickedFiles, setPickedFiles] = useState<File[]>([]);
  const [pickedAttachments, setPickedAttachments] = useState<Attachment[]>([]);
  const [error, setError] = useState<string>("");

  const listRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // persist chat
  useEffect(() => {
    try {
      localStorage.setItem("offline_chat_messages_v1", JSON.stringify(messages));
    } catch {}
  }, [messages]);

  useEffect(() => {
    try {
      localStorage.setItem("offline_chat_memory_v1", JSON.stringify(mem));
    } catch {}
  }, [mem]);

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

    // giới hạn an toàn cho mobile
    const MAX_FILES = 6;
    const MAX_EACH_MB = 8;
    const limited = arr
      .slice(0, MAX_FILES)
      .filter((f) => f.size <= MAX_EACH_MB * 1024 * 1024);

    setPickedFiles(limited);
  };

  const sendMessage = async () => {
    setError("");
    if (!canSend) return;

    const userText = input.trim();

    const userMsg: ChatMessage = {
      id: uid("m"),
      role: "user",
      text: userText,
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
      // giả lập “đang suy nghĩ”
      await sleep(450 + Math.random() * 650);

      const { reply, nextMem } = generateOfflineReply(
        userText,
        !!userMsg.attachments?.length,
        mem,
      );

      setMem(nextMem);

      setMessages((prev) =>
        prev
          .filter((m) => m.id !== typingId)
          .concat({
            id: uid("m"),
            role: "assistant",
            text: reply,
            createdAt: Date.now(),
          }),
      );
    } catch (e: any) {
      const msg = e?.message || "Lỗi bot offline";
      setError(msg);
      setMessages((prev) =>
        prev
          .filter((m) => m.id !== typingId)
          .concat({
            id: uid("m"),
            role: "assistant",
            text: `⚠️ ${msg}`,
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
    const first: ChatMessage = {
      id: uid("m"),
      role: "assistant",
      text: "Đã xoá lịch sử chat. Bạn muốn mình giúp gì? 😄",
      createdAt: Date.now(),
    };
    setMessages([first]);
    setMem({ turns: 0, topic: "general", mood: "friendly" });
    try {
      localStorage.setItem("offline_chat_messages_v1", JSON.stringify([first]));
      localStorage.setItem("offline_chat_memory_v1", JSON.stringify({ turns: 0, topic: "general", mood: "friendly" }));
    } catch {}
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
              <p className="text-xs text-muted-foreground">Offline • hiểu theo logic</p>
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
            {!!error && (
              <div className="mb-4 p-3 rounded-2xl bg-white/70 dark:bg-card/60 game-border text-destructive font-semibold text-sm">
                {error}
              </div>
            )}

            <div ref={listRef} className="h-[58vh] sm:h-[62vh] overflow-y-auto pr-1 space-y-3">
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
                    <div className="max-w-[88%] sm:max-w-[80%]">
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center game-border ${
                            m.role === "user"
                              ? "bg-primary text-white"
                              : "bg-white/80 dark:bg-card/60 text-primary"
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
            {!!pickedAttachments.length && (
              <div className="mb-2 p-2 rounded-2xl bg-white/60 dark:bg-card/50 game-border">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-muted-foreground">Đính kèm ({pickedAttachments.length})</p>
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
                onChange={(e) => setPickedFiles(Array.from(e.target.files || []))}
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
              Bot đang chạy <b>offline</b> (không API). Ảnh/file chỉ hiển thị trong UI.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

                                    }
