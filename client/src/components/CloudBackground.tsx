import { motion } from "framer-motion";

export function CloudBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      {/* Sun */}
      <motion.div 
        className="absolute top-10 right-10 w-24 h-24 md:w-32 md:h-32 bg-yellow-400 rounded-full blur-sm opacity-80"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <div className="absolute top-10 right-10 w-24 h-24 md:w-32 md:h-32 bg-yellow-300 rounded-full shadow-[0_0_60px_rgba(253,224,71,0.6)]" />

      {/* Clouds */}
      <Cloud top="10%" left="10%" scale={1.5} delay={0} />
      <Cloud top="25%" right="15%" scale={1.2} delay={2} />
      <Cloud top="60%" left="5%" scale={0.8} delay={4} />
      <Cloud top="80%" right="20%" scale={1.8} delay={1} />
      
      {/* Decorative shapes */}
      <div className="absolute top-1/2 left-1/4 w-4 h-4 rounded-full bg-accent/20 animate-pulse" />
      <div className="absolute bottom-1/3 right-1/3 w-6 h-6 rounded-full bg-primary/20 animate-pulse delay-700" />
    </div>
  );
}

function Cloud({ top, left, right, scale, delay }: { top: string, left?: string, right?: string, scale: number, delay: number }) {
  return (
    <motion.div
      className="absolute opacity-80 dark:opacity-20 text-white"
      style={{ top, left, right }}
      initial={{ x: 0 }}
      animate={{ x: [0, 20, 0] }}
      transition={{ duration: 10 + delay, repeat: Infinity, ease: "easeInOut" }}
    >
      <motion.div 
        style={{ scale }}
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 6, delay, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg width="200" height="100" viewBox="0 0 200 100" fill="currentColor">
          <path d="M160 80c22.1 0 40-17.9 40-40s-17.9-40-40-40c-3.8 0-7.4 0.5-10.8 1.5C142.4 15.6 122.9 0 100 0c-27.6 0-51.1 19.3-57.5 45C38.7 43.6 34.5 43 30 43 13.4 43 0 56.4 0 73s13.4 30 30 30h130z" />
        </svg>
      </motion.div>
    </motion.div>
  );
}
