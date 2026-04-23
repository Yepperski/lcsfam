import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Skull, Crown, Shield, Calendar, Tag } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useRef, RefObject } from "react";
import DiscordStatusIcon from "./DiscordStatusIcon";

interface MemberProfileProps {
  member: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    banner?: string;
    bannerColor?: string;
    role: string;
    discordRole?: string;
    roleColor: number;
    joinedAt?: string;
    isOnline: boolean;
    status?: string;
    socials?: {
      kick?: string;
      tiktok?: string;
    };
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mainAudioRef?: RefObject<HTMLAudioElement | null>;
}

const MEMBER_THEMES: Record<string, string> = {
  osaka: "/audio/osaka_theme.mp3",
  khajo: "/audio/khajo_ost.mp3",
  lone: "/audio/lone_theme.mp3",
  clark: "/audio/clark_theme.mp3",
  kendrick: "/audio/kendrick_theme.mp3",
  fatss: "/audio/fatss_theme.mp3",
  larongosnub: "/audio/osbun_theme.mp3",
  zen: "/audio/Zen_theme.mp3",
  redwine: "/audio/redwine_theme.mp3",
  bonbon: "/audio/bonbon_theme.mp3",
  awie: "/audio/awie_theme.mp3",
  dante: "/audio/dante_theme.mp3",
  karl: "/audio/karl_theme.mp3",
  dawn: "/audio/dawn_theme.mp3",
  siri: "/audio/siri_theme.mp3",
  jha: "/audio/jha_theme.mp3",
  moi: "/audio/moi_theme.mp3",
  kyle: "/audio/kyle_theme.mp3",
  nico: "/audio/nico_theme.mp3",
  dade: "/audio/dade_theme.mp3",
};

const MEMBER_BANNERS: Record<string, string> = {
  siri: "https://medal.tv/games/gta-v/clips/1RjNyzCm0m28O8?invite=cr-MSxKV2IsMTkzMjgyMDQ0&v=26",
};

const MEMBER_SOCIALS: Record<string, { tiktok?: string; kick?: string }> = {
  dawn: {
    tiktok: "https://www.tiktok.com/@_frshxnxgxng",
    kick: "https://kick.com/dawn-cortevaz",
  },
};

const mapRoleLabel = (role: string) => {
  const r = role.toLowerCase();
  if (r.includes("ama")) return "GODFATHER";
  if (r.includes("OG")) return "OG";
  return "KOSA";
};

const roleColorToHex = (color: number) => {
  if (!color) return undefined;
  return `#${color.toString(16).padStart(6, "0")}`;
};

const formatJoinDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
};

const normalizeThemeLookup = (value?: string) =>
  (value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\$/g, "s")
    .replace(/[^a-z0-9]+/gi, "")
    .toLowerCase();

const getMemberThemeSrc = (member: NonNullable<MemberProfileProps["member"]>) => {
  const normalizedName = normalizeThemeLookup(member.name);
  const normalizedUsername = normalizeThemeLookup(member.username);

  const entries = Object.entries(MEMBER_THEMES);

  // First: look for exact matches
  const exactMatch = entries.find(([key]) => {
    const normalizedKey = normalizeThemeLookup(key);
    return normalizedName === normalizedKey || normalizedUsername === normalizedKey;
  });
  if (exactMatch) return exactMatch[1];

  // Second: look for partial matches, prefer longer keys first
  const sortedEntries = entries.sort((a, b) => b[0].length - a[0].length);
  const partialMatch = sortedEntries.find(([key]) => {
    const normalizedKey = normalizeThemeLookup(key);
    return normalizedName.includes(normalizedKey) || normalizedUsername.includes(normalizedKey);
  });
  return partialMatch?.[1];
};

const getMemberBanner = (member: NonNullable<MemberProfileProps["member"]>) => {
  const normalizedName = normalizeThemeLookup(member.name);
  const normalizedUsername = normalizeThemeLookup(member.username);

  // Sort by key length descending to prioritize longer/more specific matches
  const sortedEntries = Object.entries(MEMBER_BANNERS).sort((a, b) => b[0].length - a[0].length);

  return sortedEntries.find(([key]) => {
    const normalizedKey = normalizeThemeLookup(key);
    return normalizedName.includes(normalizedKey) || normalizedUsername.includes(normalizedKey);
  })?.[1];
};

const getMemberSocials = (member: NonNullable<MemberProfileProps["member"]>) => {
  const normalizedName = normalizeThemeLookup(member.name);
  const normalizedUsername = normalizeThemeLookup(member.username);

  // Sort by key length descending to prioritize longer/more specific matches
  const sortedEntries = Object.entries(MEMBER_SOCIALS).sort((a, b) => b[0].length - a[0].length);

  return sortedEntries.find(([key]) => {
    const normalizedKey = normalizeThemeLookup(key);
    return normalizedName.includes(normalizedKey) || normalizedUsername.includes(normalizedKey);
  })?.[1];
};

const getRoleIcon = (role: string) => {
  const mapped = mapRoleLabel(role);
  if (mapped === "GODFATHER") return <Crown className="w-3 h-3 text-gold" />;
  if (mapped === "OG") return <Shield className="w-3 h-3 text-crimson" />;
  return null;
};

const MemberProfileDialog = ({ member, open, onOpenChange, mainAudioRef }: MemberProfileProps) => {
  const fallbackProfileAudioRef = useRef<HTMLAudioElement | null>(null);
  const wasMainPlayingRef = useRef(false);
  const mainAudioSnapshotRef = useRef<{
    src: string;
    currentTime: number;
    loop: boolean;
  } | null>(null);
  const usingMainAudioThemeRef = useRef(false);

  useEffect(() => {
    const stopFallbackProfileAudio = () => {
      if (!fallbackProfileAudioRef.current) return;
      fallbackProfileAudioRef.current.pause();
      fallbackProfileAudioRef.current.currentTime = 0;
      fallbackProfileAudioRef.current.src = "";
      fallbackProfileAudioRef.current = null;
    };

    if (!open || !member) {
      // Dialog closed - restore main audio and stop profile audio
      stopFallbackProfileAudio();
      
      if (usingMainAudioThemeRef.current && mainAudioRef?.current && mainAudioSnapshotRef.current) {
        const snapshot = mainAudioSnapshotRef.current;
        mainAudioRef.current.src = snapshot.src;
        mainAudioRef.current.loop = snapshot.loop;
        mainAudioRef.current.currentTime = snapshot.currentTime;
        if (wasMainPlayingRef.current) {
          mainAudioRef.current.play().catch(() => {});
        }
        usingMainAudioThemeRef.current = false;
      }
      return;
    }

    // Dialog opened - play member theme
    const themeSrc = getMemberThemeSrc(member);
    if (!themeSrc) return;

    if (mainAudioRef?.current) {
      // Save current main audio state
      wasMainPlayingRef.current = !mainAudioRef.current.paused;
      mainAudioSnapshotRef.current = {
        src: mainAudioRef.current.src,
        currentTime: mainAudioRef.current.currentTime,
        loop: mainAudioRef.current.loop,
      };
      
      // Use main audio for theme
      usingMainAudioThemeRef.current = true;
      mainAudioRef.current.src = themeSrc;
      mainAudioRef.current.loop = false;
      mainAudioRef.current.volume = 0.5;
      mainAudioRef.current.play().catch(() => {});
      
      // When theme ends, restore main audio
      const audio = mainAudioRef.current;
      const handleEnded = () => {
        if (mainAudioSnapshotRef.current && mainAudioRef?.current) {
          const snapshot = mainAudioSnapshotRef.current;
          mainAudioRef.current.src = snapshot.src;
          mainAudioRef.current.loop = snapshot.loop;
          mainAudioRef.current.currentTime = snapshot.currentTime;
          if (wasMainPlayingRef.current) {
            mainAudioRef.current.play().catch(() => {});
          }
          usingMainAudioThemeRef.current = false;
        }
      };
      
      audio.addEventListener('ended', handleEnded);
      return () => audio.removeEventListener('ended', handleEnded);
    } else {
      // Use fallback audio
      usingMainAudioThemeRef.current = false;
      fallbackProfileAudioRef.current = new Audio(themeSrc);
      fallbackProfileAudioRef.current.volume = 0.5;
      fallbackProfileAudioRef.current.play().catch(() => {});
    }
  }, [open, member, mainAudioRef]);

  if (!member) return null;

  const mapped = mapRoleLabel(member.role);
  const roleHex = roleColorToHex(member.roleColor);
  const statusLabel =
    member.status === "online"
      ? "Online"
      : member.status === "idle"
        ? "Idle"
        : member.status === "dnd"
          ? "Do Not Disturb"
          : "Offline";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-border/50 p-0 overflow-hidden">
        <DialogTitle className="sr-only">{member.name} profile</DialogTitle>
        <DialogDescription className="sr-only">
          Discord profile details for {member.name}, including status, role, and join date.
        </DialogDescription>

        <div
          className="h-32 relative bg-gradient-to-b from-crimson/20 to-transparent"
          style={
            (() => {
              const customBanner = getMemberBanner(member);
              if (customBanner) {
                return { backgroundImage: `url(${customBanner})`, backgroundSize: "cover", backgroundPosition: "center" };
              }
              if (member.banner) {
                // Server already sends full banner URL
                return { backgroundImage: `url(${member.banner})`, backgroundSize: "cover", backgroundPosition: "center" };
              }
              if (member.bannerColor) {
                return { background: `linear-gradient(to bottom, ${member.bannerColor}, transparent)` };
              }
              return undefined;
            })()
          }
        >
          <div className="absolute top-3 right-3 flex items-center gap-2 rounded-full border border-border/50 bg-background/80 px-3 py-1">
            <span className="text-[10px] font-display tracking-widest uppercase text-muted-foreground">
              Advisory
            </span>
            <span className="text-[10px] font-body tracking-wide text-muted-foreground/60">
              Exclusive Content
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center -mt-16 pb-8 px-6">
          {/* Enhanced Profile Picture with Rings */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 150 }}
            className="relative mb-5"
          >
            {/* Outer rotating ring */}
            <motion.div
              className="absolute inset-[-8px] rounded-full border-2 border-crimson/15"
              animate={{ rotate: 360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-crimson/50 shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
            </motion.div>
            
            {/* Middle rotating ring */}
            <motion.div
              className="absolute inset-[-4px] rounded-full border border-crimson/25"
              animate={{ rotate: -360 }}
              transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            >
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-crimson/60 shadow-[0_0_6px_rgba(220,38,38,0.6)]" />
            </motion.div>
            
            {/* Inner solid ring (like reference image) */}
            <div className="absolute inset-[-1px] rounded-full border-2 border-crimson/40 shadow-[0_0_20px_rgba(220,38,38,0.2)]" />
            
            {/* Glow effect with pulse */}
            <motion.div
              className="absolute inset-[-2px] rounded-full bg-crimson/5"
              animate={{ scale: [1, 1.03, 1], opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            />
            
            {/* Main avatar container */}
            <div className="w-28 h-28 rounded-full overflow-hidden border-[3px] border-crimson/50 shadow-[0_0_50px_rgba(220,38,38,0.4),inset_0_0_20px_rgba(0,0,0,0.5)] relative z-10">
              <img 
                src={member.avatar} 
                alt={member.name} 
                className="w-full h-full object-cover"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-tr from-crimson/10 via-transparent to-transparent" />
              {/* Inner glow ring overlay */}
              <div className="absolute inset-0 rounded-full shadow-[inset_0_0_30px_rgba(220,38,38,0.15)]" />
            </div>
            
            {/* Status indicator with enhanced pulse */}
            <motion.div 
              className="absolute bottom-1 right-1 z-20"
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-7 h-7 rounded-full bg-card border-2 border-card flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                <DiscordStatusIcon status={member.status} size={16} />
              </div>
            </motion.div>
            
            {/* Role badge with glow */}
            <div className="absolute -top-1 -right-1 z-20 w-7 h-7 rounded-full bg-background border-2 border-border flex items-center justify-center shadow-[0_0_15px_rgba(220,38,38,0.3)]">
              {getRoleIcon(member.role)}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.3 }}
            className="flex items-center gap-2 mb-1"
          >
            <Skull className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-2xl font-display font-bold tracking-wider text-foreground text-glow-crimson">
              {member.name}
            </h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.3 }}
            className="text-xs font-body text-muted-foreground/50 mb-3"
          >
            @{member.username}
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className={`flex items-center gap-1.5 text-sm font-body italic mb-4 ${
              member.status === "online"
                ? "text-emerald-400"
                : member.status === "idle"
                  ? "text-yellow-400"
                  : member.status === "dnd"
                    ? "text-red-400"
                    : "text-muted-foreground/60"
            }`}
          >
            <DiscordStatusIcon status={member.status} size={12} />
            {statusLabel}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35, duration: 0.3, type: "spring" }}
            className="flex items-center gap-2 rounded-full border border-border/50 bg-background/50 px-4 py-1.5 mb-5"
          >
            {mapped === "GODFATHER" && <Crown className="w-3.5 h-3.5 text-gold" />}
            {mapped === "OG" && <Shield className="w-3.5 h-3.5 text-crimson" />}
            <span
              className="text-xs font-body font-semibold tracking-[0.2em] uppercase"
              style={roleHex ? { color: roleHex } : undefined}
            >
              {mapped}
            </span>
          </motion.div>

          <div className="w-full space-y-2">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.35 }}
              className="flex items-center gap-3 rounded-lg border border-border/30 bg-background/30 px-4 py-2.5"
            >
              <div className="flex flex-col gap-1">
                <p className="text-[10px] font-body uppercase tracking-widest text-muted-foreground/50">Socials</p>
                {(() => {
                  const socials = getMemberSocials(member);
                  if (!socials) return null;
                  return (
                    <div className="flex gap-5 items-center">
                      {socials.kick && (
                        <a href={socials.kick} target="_blank" rel="noopener noreferrer" title="Kick">
                          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="28" height="28" rx="6" fill="#53FC18"/>
                            <path d="M8 8v12h2.5v-4.5l5 4.5h3.5l-5.5-5 5.5-5H15.5l-5 4.5V8H8z" fill="#000"/>
                          </svg>
                        </a>
                      )}
                      {socials.tiktok && (
                        <a href={socials.tiktok} target="_blank" rel="noopener noreferrer" title="TikTok">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" fill="#fff"/>
                          </svg>
                        </a>
                      )}
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MemberProfileDialog;
