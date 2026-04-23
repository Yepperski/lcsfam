import { motion } from "framer-motion";
import cortevazLogo from "@/assets/cortevaz-logo.png";

const ProfileCard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.6 }}
      className="flex flex-col items-center"
    >
      {/* Advisory badge */}
      <div className="mb-6 flex items-center gap-2 rounded-full border border-crimson/30 bg-crimson/10 px-4 py-1.5">
        <span className="text-xs font-body font-semibold tracking-widest uppercase text-crimson">
          Advisory
        </span>
        <span className="text-xs font-body tracking-wide text-muted-foreground">
          Exclusive Content
        </span>
      </div>

      {/* Avatar */}
      <div className="relative mb-5">
        <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-crimson/50 glow-crimson">
          <img
            src={cortevazLogo}
            alt="LCS"
            className="w-full h-full object-cover"
          />
        </div>
        {/* Online indicator */}
        <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-background" />
      </div>

      {/* Name */}
      <h1 className="text-2xl font-display font-bold tracking-wider text-glow-crimson text-foreground">
        LCS
      </h1>

      {/* Bio */}
      <p className="mt-2 text-sm text-muted-foreground font-body flex items-center gap-2">
        <span className="text-crimson">🔥</span>
        LCS Exclusive
      </p>
    </motion.div>
  );
};

export default ProfileCard;
