import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";

const CONTACT_EMAIL = "lehuanha1@gmail.com"; // đổi email của bạn ở đây

export default function ContactCard() {
  const [name, setName] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [message, setMessage] = useState("");

  const mailtoHref = useMemo(() => {
    const subject = encodeURIComponent(`Liên hệ từ BioLink: ${name || "Khách"}`);
    const body = encodeURIComponent(
      `Tên: ${name}\nEmail: ${fromEmail}\n\nNội dung:\n${message}\n`
    );
    return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  }, [name, fromEmail, message]);

  return (
    <div className="game-card p-4 mt-4">
      <div className="flex items-center gap-2">
        <Icons.Mail className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-extrabold text-glow">Gửi mail liên hệ</h2>
      </div>

      <p className="text-sm text-foreground/70 mt-1">
        Điền form và bấm “Mở app Email” để gửi nhanh.
      </p>

      <div className="mt-3 space-y-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tên của bạn"
          className="w-full px-3 py-2 rounded-xl border bg-white/90"
        />
        <input
          value={fromEmail}
          onChange={(e) => setFromEmail(e.target.value)}
          placeholder="Email của bạn"
          className="w-full px-3 py-2 rounded-xl border bg-white/90"
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Nội dung tin nhắn…"
          rows={4}
          className="w-full px-3 py-2 rounded-xl border bg-white/90"
        />
      </div>

      <div className="mt-3 flex gap-2">
        <motion.a
          whileTap={{ scale: 0.98 }}
          whileHover={{ scale: 1.01 }}
          href={mailtoHref}
          className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-primary text-primary-foreground font-bold"
        >
          <Icons.Send className="w-4 h-4" />
          Mở app Email
        </motion.a>

        <motion.button
          whileTap={{ scale: 0.98 }}
          whileHover={{ scale: 1.01 }}
          onClick={() => navigator.clipboard?.writeText(CONTACT_EMAIL)}
          className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl border bg-white font-bold"
        >
          <Icons.Copy className="w-4 h-4" />
          Copy
        </motion.button>
      </div>
    </div>
  );
}
