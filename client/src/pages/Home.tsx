import { useBio } from "@/hooks/use-bio";
import WelcomeModal from "@/components/WelcomeModal";
import ContactCard from "@/components/ContactCard";
import { ProfileHeader } from "@/components/ProfileHeader";
import { CategoryAccordion } from "@/components/CategoryAccordion";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CloudBackground } from "@/components/CloudBackground";
import { motion } from "framer-motion";
import { Loader2, MessageCircle, Facebook, Send, Phone } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

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
    <>
    <WelcomeModal />
    <div className="min-h-screen relative overflow-x-hidden">
      <CloudBackground />
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center backdrop-blur-sm bg-white/10 border-b border-white/20">
        <div className="flex items-center gap-3">
       <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold text-white shadow-lg active:scale-95 transition"
>
  DEV
</button>
          <span className="font-display font-bold text-lg hidden sm:block">My Bio</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="#footer-tabs" className="text-sm font-medium hover:text-primary transition-colors">About</a>
          <ThemeToggle />
        </div>
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

      {/* Footer with Tabs */}
      <footer id="footer-tabs" className="py-12 px-4 max-w-2xl mx-auto border-t border-primary/10">
        <Tabs defaultValue="about" className="w-full">
          <TabsList className="grid w-full grid-cols-3 game-border p-1 bg-white/50 backdrop-blur-sm">
            <TabsTrigger value="about" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white">About</TabsTrigger>
            <TabsTrigger value="contact" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white">Contact</TabsTrigger>
            <TabsTrigger value="copyright" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white">Copyright</TabsTrigger>
          </TabsList>
          
          <div className="mt-8">
            <TabsContent value="about">
              <Card className="game-border bg-white/50 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <h3 className="font-display font-bold text-xl text-primary mb-4 text-center">About Hà Văn Huấn</h3>
                  <p className="text-muted-foreground leading-relaxed text-center">
                    Chào mừng bạn đến với trang bio cá nhân của tôi! Tôi là một lập trình viên Full Stack 
                    với đam mê tạo ra những trải nghiệm web độc đáo và sáng tạo. Trang web này được thiết kế 
                    với phong cách game-like nhằm mang lại sự thú vị và khác biệt cho người xem.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contact">
              <Card className="game-border bg-white/50 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <h3 className="font-display font-bold text-xl text-primary mb-6 text-center">Liên Hệ Với Tôi</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <a href="https://zalo.me/your-zalo-id" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-2xl bg-blue-50 dark:bg-blue-900/20 hover:scale-105 transition-transform">
                      <MessageCircle className="text-blue-500" />
                      <span className="font-bold">Zalo</span>
                    </a>
                    <a href="https://facebook.com/your-profile" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 hover:scale-105 transition-transform">
                      <Facebook className="text-indigo-600" />
                      <span className="font-bold">Facebook</span>
                    </a>
                    <a href="https://t.me/your-username" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-2xl bg-sky-50 dark:bg-sky-900/20 hover:scale-105 transition-transform">
                      <Send className="text-sky-500" />
                      <span className="font-bold">Telegram</span>
                    </a>
                    <a href="tel:your-phone-number" className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 hover:scale-105 transition-transform">
                      <Phone className="text-emerald-500" />
                      <span className="font-bold">Phone</span>
                    </a>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="copyright">
              <Card className="game-border bg-white/50 backdrop-blur-sm">
                <CardContent className="pt-6 text-center">
                  <h3 className="font-display font-bold text-xl text-primary mb-4">Bản Quyền</h3>
                  <p className="text-muted-foreground">
                    © 2024 Hà Văn Huấn. Mọi quyền được bảo lưu. 
                    Trang web này được xây dựng hoàn toàn bằng tâm huyết và các công nghệ hiện đại 
                    như React, Tailwind CSS và Framer Motion.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
     <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.3 }}
>
  <ContactCard />
</motion.div>

        <div className="mt-12 pt-8 border-t border-primary/5 text-center text-muted-foreground text-sm font-medium">
          <p>Built with 💖 using React & Tailwind.</p>
        </div>
      </footer>
    </div>
  </div>
    </>
    
  );
}
