import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Users, Trophy, ChevronRight } from "lucide-react";
import cortevazLogo from "@/assets/cortevaz-logo.png";
import MusicPlayer from "./MusicPlayer";

interface HomeSectionProps {
  onNavigate: (section: "Home" | "Archive" | "Fam") => void;
}

const HomeSection = ({ onNavigate }: HomeSectionProps) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (d: Date) =>
    d.toLocaleTimeString("en-US", { hour12: true, hour: "numeric", minute: "2-digit", second: "2-digit", timeZone: "Asia/Manila" });

  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "Asia/Manila" });

  return (
    <div className="relative min-h-screen">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs */}
        <motion.div 
          className="absolute top-20 left-1/4 w-96 h-96 bg-crimson/10 rounded-full blur-[120px]"
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-40 right-1/4 w-80 h-80 bg-crimson/5 rounded-full blur-[100px]"
          animate={{ 
            scale: [1, 1.3, 1],
            x: [0, -30, 0],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `linear-gradient(crimson 1px, transparent 1px), linear-gradient(90deg, crimson 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="relative z-10 space-y-8 md:space-y-10">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center"
      >
        {/* Logo with enhanced animated rings - No status indicator */}
        <div className="relative mx-auto mb-8 w-40 h-40 md:w-48 md:h-48">
          {/* Outer rotating ring with particle */}
          <motion.div
            className="absolute inset-[-16px] rounded-full border border-crimson/15"
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-crimson shadow-[0_0_15px_rgba(220,38,38,0.9)]" />
          </motion.div>
          {/* Second rotating ring */}
          <motion.div
            className="absolute inset-[-10px] rounded-full border-2 border-dashed border-crimson/25"
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          >
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-crimson/80" />
          </motion.div>
          {/* Inner solid ring with glow */}
          <div className="absolute inset-[-4px] rounded-full border-2 border-crimson/40 shadow-[0_0_40px_rgba(220,38,38,0.4)]" />
          {/* Pulsing background glow */}
          <motion.div 
            className="absolute inset-[-8px] rounded-full bg-crimson/5 blur-xl"
            animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Logo container with hover effect */}
          <motion.div 
            className="relative w-full h-full rounded-full overflow-hidden border-2 border-crimson/60 shadow-[0_0_60px_rgba(220,38,38,0.25),inset_0_0_40px_rgba(0,0,0,0.4)]"
            whileHover={{ scale: 1.08, rotate: 2 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            <img src={cortevazLogo} alt="LCS" className="w-full h-full object-cover" />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-tr from-crimson/10 via-transparent to-crimson/5" />
            {/* Shine effect on hover */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 opacity-0 hover:opacity-100 transition-opacity"
              initial={{ x: '-100%' }}
              whileHover={{ x: '100%' }}
              transition={{ duration: 0.8 }}
            />
          </motion.div>
        </div>

        {/* Title with enhanced styling */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <motion.h1 
            className="text-7xl md:text-8xl font-display font-black tracking-wider text-foreground"
            style={{ textShadow: '0 0 40px rgba(220,38,38,0.5), 0 0 80px rgba(220,38,38,0.3)' }}
            animate={{ textShadow: ['0 0 40px rgba(220,38,38,0.5), 0 0 80px rgba(220,38,38,0.3)', '0 0 60px rgba(220,38,38,0.6), 0 0 100px rgba(220,38,38,0.4)', '0 0 40px rgba(220,38,38,0.5), 0 0 80px rgba(220,38,38,0.3)'] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            LCS
          </motion.h1>
          {/* Multi-layer shadow text */}
          <div className="absolute top-1 left-1/2 -translate-x-1/2 text-7xl md:text-8xl font-display font-black tracking-wider text-crimson/10 blur-md -z-10">
            LCS
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-4 flex items-center justify-center gap-4"
        >
          <motion.div 
            className="h-px w-10 bg-gradient-to-r from-transparent to-crimson/70"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          />
          <motion.p 
            className="text-[12px] font-display uppercase text-crimson/90 tracking-[0.4em] font-bold"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            Exclusive
          </motion.p>
          <motion.div 
            className="h-px w-10 bg-gradient-to-l from-transparent to-crimson/70"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          />
        </motion.div>

        {/* Divider with shimmer */}
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "10rem", opacity: 1 }}
          transition={{ delay: 0.7, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 mx-auto h-0.5 bg-gradient-to-r from-transparent via-crimson to-transparent rounded-full relative overflow-hidden"
        >
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
          />
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="mt-8 max-w-md mx-auto"
        >
          <p className="text-sm font-body leading-relaxed text-muted-foreground text-center">
            We grind in silence, we strike with success.
          </p>
          <motion.div 
            className="mt-2 flex items-center justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <span className="w-1 h-1 rounded-full bg-crimson" />
            <span className="text-crimson font-semibold text-xs uppercase tracking-wider">Discipline over everything</span>
            <span className="w-1 h-1 rounded-full bg-crimson" />
          </motion.div>
        </motion.div>

        {/* Enhanced CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="mt-10 flex flex-col sm:flex-row justify-center gap-3"
        >
          {/* Primary Button - View Fam */}
          <motion.button
            onClick={() => onNavigate("Fam")}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="group relative px-10 py-4 rounded-xl bg-crimson text-white font-body font-bold text-[11px] tracking-widest uppercase overflow-hidden shadow-[0_8px_30px_rgba(220,38,38,0.4)] hover:shadow-[0_12px_40px_rgba(220,38,38,0.5)] transition-all duration-300 border-2 border-crimson"
          >
            {/* Shine effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
              initial={{ x: '-100%' }}
              whileHover={{ x: '100%' }}
              transition={{ duration: 0.6 }}
            />
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-white/50 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-white/50 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-white/50 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-white/50 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative z-10 flex items-center gap-2">
              <Users className="w-4 h-4" />
              View Fam
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </motion.button>
          
          {/* Secondary Button - Open Archive */}
          <motion.button
            onClick={() => onNavigate("Archive")}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="group relative px-10 py-4 rounded-xl bg-card/60 backdrop-blur-xl border-2 border-border/60 font-body font-bold text-[11px] tracking-widest uppercase text-foreground/80 hover:text-foreground hover:border-crimson/50 hover:bg-card/80 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_30px_rgba(220,38,38,0.15)]"
          >
            {/* Hover glow */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-crimson/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative z-10 flex items-center gap-2">
              <Trophy className="w-4 h-4 group-hover:text-crimson transition-colors" />
              Open Archive
            </span>
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Clock */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.6 }}
        className="flex flex-col items-center"
      >
        <div className="relative rounded-2xl border border-border/60 bg-card/30 backdrop-blur-xl px-12 py-6 text-center shadow-[0_0_40px_rgba(220,38,38,0.08)] hover:shadow-[0_0_50px_rgba(220,38,38,0.15)] transition-all duration-500 group">
          {/* Corner decorations */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-crimson/30 rounded-tl-2xl" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-crimson/30 rounded-tr-2xl" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-crimson/30 rounded-bl-2xl" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-crimson/30 rounded-br-2xl" />
          
          <div className="flex items-center justify-center gap-2 mb-3">
            <motion.div 
              className="w-2 h-2 rounded-full bg-crimson"
              animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <p className="text-[10px] font-body tracking-[0.3em] uppercase text-muted-foreground/60 font-medium">
              Philippine Standard Time
            </p>
          </div>
          
          <div className="relative">
            <p className="text-5xl md:text-6xl font-display font-bold tracking-wider text-foreground text-glow-crimson tabular-nums">
              {formatTime(time)}
            </p>
            {/* Subtle glow behind time */}
            <div className="absolute inset-0 bg-crimson/10 blur-2xl -z-10" />
          </div>
          
          <div className="mt-3 mx-auto w-16 h-px bg-gradient-to-r from-transparent via-crimson/40 to-transparent" />
          
          <p className="text-xs font-body tracking-widest uppercase text-muted-foreground/60 mt-3">
            {formatDate(time)}
          </p>
        </div>
      </motion.div>

      {/* Music Player */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
      >
        <MusicPlayer />
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.6 }}
        className="text-center pt-6 pb-4"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <motion.div 
            className="h-px w-12 bg-gradient-to-r from-transparent via-crimson/30 to-transparent"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1.6, duration: 0.8 }}
          />
          <p className="text-[10px] text-muted-foreground/40 font-body tracking-[0.3em] uppercase font-medium">
            LCS • Exclusive • La Familia
          </p>
          <motion.div 
            className="h-px w-12 bg-gradient-to-l from-transparent via-crimson/30 to-transparent"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1.6, duration: 0.8 }}
          />
        </div>
        <p className="text-[10px] text-muted-foreground/25 font-body">
          © 2024 LCS Crew. All rights reserved.
        </p>
      </motion.div>
      
      </div>
    </div>
  );
};

export default HomeSection;