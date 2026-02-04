import { useBio } from "@/hooks/use-bio";
import { ProfileHeader } from "@/components/ProfileHeader";
import { CategoryAccordion } from "@/components/CategoryAccordion";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CloudBackground } from "@/components/CloudBackground";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { data, isLoading, error } = useBio();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-destructive text-xl font-bold">
        Failed to load profile data.
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <CloudBackground />
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center backdrop-blur-sm bg-white/10 border-b border-white/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl shadow-lg border-2 border-white">
            H
          </div>
          <span className="font-display font-bold text-lg hidden sm:block">My Bio</span>
        </div>
        <ThemeToggle />
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-16 px-4 sm:px-6 max-w-2xl mx-auto flex flex-col items-center gap-8">
        
        <ProfileHeader profile={data.profile} />

        <motion.div 
          className="w-full space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {data.categories.map((category, index) => (
            <CategoryAccordion 
              key={category.id} 
              category={category} 
              index={index} 
            />
          ))}
        </motion.div>

      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-muted-foreground text-sm font-medium">
        <p>© 2024 Hà Văn Huấn. Built with 💖 and React.</p>
      </footer>
    </div>
  );
}
