import { Category, Link as LinkType } from "@/hooks/use-bio";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import * as Icons from "lucide-react";

interface CategoryAccordionProps {
  category: Category;
  index: number;
}

/** Check icon string is a URL (http/https or data:image) */
function isIconUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const v = value.trim();
  if (!v) return false;
  return (
    v.startsWith("http://") ||
    v.startsWith("https://") ||
    v.startsWith("data:image/")
  );
}

/** Render icon from URL or lucide name */
function IconView({
  icon,
  alt,
  size = 24,
  className = "",
  fallbackLucide = "Folder",
}: {
  icon: unknown;
  alt: string;
  size?: number;
  className?: string;
  fallbackLucide?: keyof typeof Icons;
}) {
  // If URL => image
  if (isIconUrl(icon)) {
    return (
      <img
        src={icon}
        alt={alt}
        width={size}
        height={size}
        className={`object-contain ${className}`}
        loading="lazy"
        onError={(e) => {
          // Hide broken image if URL invalid
          (e.currentTarget as HTMLImageElement).style.display = "none";
        }}
      />
    );
  }

  // Else => lucide component name
  const name = (typeof icon === "string" ? icon : "") as keyof typeof Icons;
  const LucideCmp =
    (Icons as any)[name] || (Icons as any)[fallbackLucide] || Icons.Folder;

  return <LucideCmp size={size} className={className} strokeWidth={2.5} />;
}

export function CategoryAccordion({ category, index }: CategoryAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  // keep stable values (avoid re-render jitter)
  const categoryTitle = category?.title ?? "";
  const categoryIcon = category?.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="w-full"
    >
      <motion.button
        onClick={() => setIsOpen((v) => !v)}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className={`
          w-full p-4 flex items-center justify-between
          bg-white dark:bg-card
          game-border
          transition-colors duration-200
          ${isOpen ? "bg-blue-50 dark:bg-primary/10 border-accent" : "border-primary"}
        `}
      >
        <div className="flex items-center gap-4">
          <div
            className={`
              p-3 rounded-full 
              ${isOpen ? "bg-accent text-accent-foreground" : "bg-primary/10 text-primary"}
              transition-colors duration-300
            `}
          >
            {/* ✅ Category icon supports URL */}
            <IconView
              icon={categoryIcon}
              alt={categoryTitle}
              size={24}
              className="w-6 h-6"
              fallbackLucide="Folder"
            />
          </div>

          <span className="text-xl font-bold text-foreground text-left">
            {categoryTitle}
          </span>
        </div>

        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <Icons.ChevronDown className="w-6 h-6 text-muted-foreground" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="overflow-hidden"
          >
            <div className="pt-2 pb-4 px-2 space-y-2">
              {category.links?.map((link) => (
                <LinkCard key={link.id} link={link} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function LinkCard({ link }: { link: LinkType }) {
  const linkTitle = link?.title ?? "";
  const linkIcon = link?.icon;

  // avoid invalid url
  const href = useMemo(() => {
    const u = (link?.url ?? "").trim();
    return u || "#";
  }, [link?.url]);

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ x: 10, backgroundColor: "rgba(var(--primary), 0.1)" }}
      className="
        block p-3 mx-2
        bg-white/80 dark:bg-card/50
        border-2 border-transparent hover:border-accent
        rounded-xl
        flex items-center gap-3
        transition-all duration-200
        group
      "
    >
      <div className="p-2 rounded-lg bg-background shadow-sm text-primary group-hover:text-accent transition-colors">
        {/* ✅ Link icon supports URL */}
        <IconView
          icon={linkIcon}
          alt={linkTitle}
          size={18}
          className="w-[18px] h-[18px]"
          fallbackLucide="Link"
        />
      </div>

      <span className="font-semibold text-foreground/80 group-hover:text-foreground">
        {linkTitle}
      </span>

      <Icons.ArrowUpRight className="ml-auto w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-accent" />
    </motion.a>
  );
}
