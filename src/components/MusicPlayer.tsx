import { motion } from "framer-motion";
import { Music, Disc3 } from "lucide-react";

const MusicPlayer = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.6 }}
      className="w-full rounded-lg border border-border bg-card/80 backdrop-blur-sm p-4"
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <Disc3 className="w-10 h-10 text-crimson animate-spin" style={{ animationDuration: "3s" }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <Music className="w-3 h-3 text-crimson" />
            <span className="text-[10px] font-body tracking-widest uppercase text-muted-foreground">Now Playing</span>
          </div>
          <p className="text-sm font-display font-semibold text-foreground truncate">Moolah</p>
          <p className="text-xs text-muted-foreground font-body">Scoop Dogg & Daarth</p>
        </div>
        {/* Equalizer bars */}
        <div className="flex items-end gap-0.5 h-6">
          {[1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="w-1 bg-crimson rounded-full"
              animate={{ height: ["4px", `${8 + Math.random() * 16}px`, "4px"] }}
              transition={{ duration: 0.6 + i * 0.15, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default MusicPlayer;
