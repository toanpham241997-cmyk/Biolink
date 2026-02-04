import { Profile } from "@/hooks/use-bio";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface ProfileHeaderProps {
  profile: Profile;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  return (
    <div className="flex flex-col items-center text-center space-y-6 py-8">
      <motion.div 
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="relative group"
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary to-accent blur-lg opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
        <img
          src={profile.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop"} 
          /* default avatar if missing */
          alt={profile.name}
          className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-xl object-cover"
        />
        <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-full border-4 border-white" />
      </motion.div>

      <div className="space-y-3 max-w-md px-4">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-5xl font-bold text-foreground drop-shadow-sm"
        >
          {profile.name}
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-lg md:text-xl text-muted-foreground font-medium"
        >
          {profile.bio}
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-2 mt-4"
        >
          {profile.skills.map((skill, index) => (
            <Badge 
              key={index} 
              variant="secondary"
              className="px-3 py-1 text-sm font-bold shadow-sm hover:scale-105 transition-transform cursor-default"
            >
              {skill}
            </Badge>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
