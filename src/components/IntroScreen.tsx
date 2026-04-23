import { motion } from "framer-motion";
import cortevazLogo from "@/assets/cortevaz-logo.png";

interface IntroScreenProps {
  onEnter: () => void;
}

const IntroScreen = ({ onEnter }: IntroScreenProps) => {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background cursor-pointer"
      onClick={onEnter}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Subtle smoke particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-crimson/10 animate-smoke"
            style={{
              width: `${60 + i * 20}px`,
              height: `${60 + i * 20}px`,
              left: `${15 + i * 18}%`,
              bottom: '20%',
              animationDelay: `${i * 0.8}s`,
            }}
          />
        ))}
      </div>

      {/* Logo with white background circle + crimson glow */}
      <motion.img
        src={cortevazLogo}
        alt="LCS"
        className="w-40 h-40 rounded-full glow-crimson object-cover"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Title */}
      <motion.h1
        className="mt-6 text-3xl font-display font-bold tracking-[0.3em] uppercase text-foreground text-glow-crimson"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        LCS
      </motion.h1>

      <motion.p
        className="mt-4 text-sm tracking-[0.4em] uppercase text-muted-foreground font-body"
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      >
        ▼ Tap to Enter ▼
      </motion.p>

      {/* Decorative line */}
      <div className="absolute bottom-16 w-24 h-px bg-gradient-to-r from-transparent via-crimson/40 to-transparent" />
    </motion.div>
  );
};

export default IntroScreen;
