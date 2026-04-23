import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

const links = [
  { name: "TikTok", url: "#", icon: "🎵" },
  { name: "Discord", url: "#", icon: "💬" },
  { name: "Instagram", url: "#", icon: "📸" },
];

const SocialLinks = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.6 }}
      className="w-full flex gap-3"
    >
      {links.map((link) => (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-border bg-card/80 backdrop-blur-sm p-3 hover:border-crimson/40 hover:bg-crimson/5 transition-all group"
        >
          <span className="text-base">{link.icon}</span>
          <span className="text-xs font-body text-muted-foreground group-hover:text-foreground transition-colors">
            {link.name}
          </span>
          <ExternalLink className="w-3 h-3 text-muted-foreground/40 group-hover:text-crimson transition-colors" />
        </a>
      ))}
    </motion.div>
  );
};

export default SocialLinks;
