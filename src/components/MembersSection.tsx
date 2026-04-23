import { motion, AnimatePresence } from "framer-motion";
import { Users, Crown, Shield, Swords, Loader2, ChevronDown } from "lucide-react";
import { useEffect, useState, RefObject } from "react";
import { supabase } from "@/integrations/supabase/client";
import MemberProfileDialog from "./MemberProfileDialog";
import DiscordStatusIcon from "./DiscordStatusIcon";

interface DiscordMember {
  id: string;
  name: string;
  username: string;
  avatar: string;
  banner?: string | null;
  bannerColor?: string | null;
  role: string;
  discordRole?: string;
  roleColor: number;
  joinedAt: string;
  isOnline: boolean;
  status?: string;
}

const mapRoleLabel = (role: string) => {
  const r = role.toLowerCase();
  if (r.includes("ama")) return "GODFATHER";
  if (r.includes("kuya")) return "OG";
  return "KOSA";
};

const getRoleIcon = (role: string) => {
  const mapped = mapRoleLabel(role);
  if (mapped === "GODFATHER") return <Crown className="w-3 h-3 text-gold" />;
  if (mapped === "OG") return <Shield className="w-3 h-3 text-crimson" />;
  return null;
};      

const roleColorToHex = (color: number) => {
  if (!color) return undefined;
  return `#${color.toString(16).padStart(6, '0')}`;
};

const MemberCard = ({ member, index, onClick }: { member: DiscordMember; index: number; onClick: () => void }) => {
  const roleHex = roleColorToHex(member.roleColor);
  
  // Server already sends full banner URL
  const bannerUrl = member.banner || null;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      onClick={onClick}
      className="relative flex flex-col items-center gap-2 pb-3 rounded-xl border border-border bg-card/60 hover:border-crimson/40 hover:bg-crimson/5 transition-all group cursor-pointer overflow-hidden"
    >
      {/* Banner Background */}
      <div 
        className="w-full h-16 relative"
        style={
          bannerUrl 
            ? { backgroundImage: `url(${bannerUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : member.bannerColor 
              ? { background: `linear-gradient(to bottom, ${member.bannerColor}, #1a1a1a)` }
              : { background: 'linear-gradient(to bottom, rgba(220,38,38,0.3), #1a1a1a)' }
        }
      >
        {/* Banner overlay for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-card/60" />
      </div>

      {/* Enhanced Profile Picture with Rings - positioned to overlap banner */}
      <div className="relative -mt-8">
        {/* Outer rotating ring */}
        <motion.div
          className="absolute inset-[-6px] rounded-full border border-crimson/15 opacity-0 group-hover:opacity-100 transition-opacity"
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-crimson/50 shadow-[0_0_6px_rgba(220,38,38,0.6)]" />
        </motion.div>
        
        {/* Inner rotating ring */}
        <motion.div
          className="absolute inset-[-3px] rounded-full border border-crimson/25 opacity-0 group-hover:opacity-100 transition-opacity"
          animate={{ rotate: -360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-crimson/40" />
        </motion.div>
        
        {/* Inner solid ring */}
        <div className="absolute inset-[-1px] rounded-full border border-crimson/30 opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_15px_rgba(220,38,38,0.15)]" />
        
        {/* Glow effect on hover */}
        <div className="absolute inset-[-2px] rounded-full bg-crimson/0 group-hover:bg-crimson/5 transition-all duration-300 scale-100 group-hover:scale-[1.08]" />
        
        {/* Main avatar with enhanced border */}
        <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-border group-hover:border-crimson/50 transition-all duration-300 shadow-[0_0_0_rgba(220,38,38,0)] group-hover:shadow-[0_0_20px_rgba(220,38,38,0.35)]">
          <img
            src={member.avatar}
            alt={member.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-crimson/0 via-transparent to-transparent group-hover:from-crimson/10 transition-all duration-300" />
          {/* Inner glow ring overlay */}
          <div className="absolute inset-0 rounded-full shadow-[inset_0_0_15px_rgba(220,38,38,0)] group-hover:shadow-[inset_0_0_15px_rgba(220,38,38,0.2)] transition-all duration-300" />
        </div>
        
        {/* Status indicator with pulse */}
        <motion.div 
          className="absolute bottom-0 right-0 z-10"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="rounded-full border-2 border-background bg-card shadow-[0_0_8px_rgba(0,0,0,0.3)]">
            <DiscordStatusIcon status={member.status} size={14} />
          </div>
        </motion.div>
        
        {/* Role badge with glow */}
        {getRoleIcon(member.role) && (
          <motion.div 
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-background border border-border flex items-center justify-center z-10 shadow-md shadow-[0_0_8px_rgba(220,38,38,0.2)] group-hover:border-crimson/30 transition-colors"
            whileHover={{ scale: 1.1 }}
          >
            {getRoleIcon(member.role)}
          </motion.div>
        )}
      </div>
      <p className="text-xs font-body font-semibold text-foreground tracking-wide">{member.name}</p>
      <p
        className="text-[10px] font-body tracking-widest uppercase"
        style={roleHex ? { color: roleHex } : undefined}
      >
        {mapRoleLabel(member.role)}
      </p>
    </motion.div>
  );
};

const MembersSection = ({ mainAudioRef }: { mainAudioRef?: RefObject<HTMLAudioElement | null> }) => {
  const [amaMembers, setAmaMembers] = useState<DiscordMember[]>([]);
  const [kuyaMembers, setKuyaMembers] = useState<DiscordMember[]>([]);
  const [kosaMembers, setKosaMembers] = useState<DiscordMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<DiscordMember | null>(null);
  const [expandedRoles, setExpandedRoles] = useState<Record<string, boolean>>({
    GODFATHER: true,
    OG: true,
    KOSA: true,
  });

  const toggleRole = (role: string) => {
    setExpandedRoles(prev => ({ ...prev, [role]: !prev[role] }));
  };

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const { data, error: fnError } = await supabase.functions.invoke('discord-members');
        if (fnError) throw new Error(fnError.message);
        if (data?.error) throw new Error(data.error);

        const members: DiscordMember[] = data.members || [];

        setAmaMembers(members.filter(m => mapRoleLabel(m.role) === "GODFATHER"));
        setKuyaMembers(members.filter(m => mapRoleLabel(m.role) === "OG"));
        setKosaMembers(members.filter(m => mapRoleLabel(m.role) === "KOSA"));
      } catch (err) {
        console.error('Failed to fetch Discord members:', err);
        setError(err instanceof Error ? err.message : 'Failed to load members');
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  return (
    <div id="members-section" className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-5 h-5 text-crimson" />
          <h2 className="text-2xl font-display font-bold tracking-wider text-foreground text-glow-crimson">
            Fam
          </h2>
        </div>
      </motion.div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-crimson animate-spin" />
          <span className="ml-3 text-sm text-muted-foreground font-body">Loading members...</span>
        </div>
      )}

      {error && (
        <div className="text-center py-8">
          <p className="text-sm text-crimson font-body">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Ama */}
          {amaMembers.length > 0 && (
            <div className="border border-border/50 rounded-xl overflow-hidden bg-card/20">
              <button
                onClick={() => toggleRole('GODFATHER')}
                className="w-full flex items-center justify-between gap-2 p-4 hover:bg-card/40 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-gold" />
                  <h3 className="text-xs font-body font-bold tracking-[0.3em] uppercase text-gold">
                    Godfather
                  </h3>
                  <span className="text-[10px] text-muted-foreground/60 ml-2">({amaMembers.length})</span>
                </div>
                <motion.div
                  animate={{ rotate: expandedRoles.GODFATHER ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </motion.div>
              </button>
              <AnimatePresence initial={false}>
                {expandedRoles.GODFATHER && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 pt-0 grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {amaMembers.map((member, i) => (
                        <MemberCard key={member.id} member={member} index={i} onClick={() => setSelectedMember(member)} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Kuya */}
          {kuyaMembers.length > 0 && (
            <div className="border border-border/50 rounded-xl overflow-hidden bg-card/20">
              <button
                onClick={() => toggleRole('OG')}
                className="w-full flex items-center justify-between gap-2 p-4 hover:bg-card/40 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Swords className="w-4 h-4 text-crimson" />
                  <h3 className="text-xs font-body font-bold tracking-[0.3em] uppercase text-crimson">
                    OG
                  </h3>
                  <span className="text-[10px] text-muted-foreground/60 ml-2">({kuyaMembers.length})</span>
                </div>
                <motion.div
                  animate={{ rotate: expandedRoles.OG ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </motion.div>
              </button>
              <AnimatePresence initial={false}>
                {expandedRoles.OG && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 pt-0 grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {kuyaMembers.map((member, i) => (
                        <MemberCard key={member.id} member={member} index={i + amaMembers.length} onClick={() => setSelectedMember(member)} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Kosa */}
          {kosaMembers.length > 0 && (
            <div className="border border-border/50 rounded-xl overflow-hidden bg-card/20">
              <button
                onClick={() => toggleRole('KOSA')}
                className="w-full flex items-center justify-between gap-2 p-4 hover:bg-card/40 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <h3 className="text-xs font-body font-bold tracking-[0.3em] uppercase text-muted-foreground">
                    Kosa
                  </h3>
                  <span className="text-[10px] text-muted-foreground/60 ml-2">({kosaMembers.length})</span>
                </div>
                <motion.div
                  animate={{ rotate: expandedRoles.KOSA ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </motion.div>
              </button>
              <AnimatePresence initial={false}>
                {expandedRoles.KOSA && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 pt-0 grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {kosaMembers.map((member, i) => (
                        <MemberCard key={member.id} member={member} index={i + amaMembers.length + kuyaMembers.length} onClick={() => setSelectedMember(member)} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {amaMembers.length === 0 && kuyaMembers.length === 0 && kosaMembers.length === 0 && (
            <p className="text-center text-sm text-muted-foreground font-body py-8">No members found.</p>
          )}
        </>
      )}

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center text-[10px] text-muted-foreground/40 font-body tracking-widest uppercase pt-4"
      >
        LCS • Exclusive
      </motion.p>
      <MemberProfileDialog
        member={selectedMember}
        open={!!selectedMember}
        onOpenChange={(open) => { if (!open) setSelectedMember(null); }}
        mainAudioRef={mainAudioRef}
      />
    </div>
  );
};

export default MembersSection;
