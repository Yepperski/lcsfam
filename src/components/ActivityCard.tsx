import { motion } from "framer-motion";
import { Activity } from "lucide-react";

const ActivityCard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6 }}
      className="w-full rounded-lg border border-border bg-card/80 backdrop-blur-sm p-4"
    >
      <div className="flex items-center gap-2 mb-3 text-muted-foreground">
        <Activity className="w-4 h-4 text-gold" />
        <span className="text-xs font-body tracking-widest uppercase">Activity</span>
      </div>

      <div className="flex items-center justify-center py-4">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full bg-muted mx-auto mb-2 flex items-center justify-center">
            <Activity className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground font-body">No active activity</p>
          <p className="text-[10px] text-muted-foreground/60 font-body mt-0.5">Waiting for presence</p>
        </div>
      </div>
    </motion.div>
  );
};

export default ActivityCard;
