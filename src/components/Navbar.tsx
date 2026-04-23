import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, Volume1 } from "lucide-react";
import cortevazLogo from "@/assets/cortevaz-logo.png";

const useScrollPosition = () => {
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const updatePosition = () => {
      setScrollPosition(window.scrollY);
    };
    window.addEventListener("scroll", updatePosition);
    updatePosition();
    return () => window.removeEventListener("scroll", updatePosition);
  }, []);

  return scrollPosition;
};

interface NavbarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
  onLogoClick: () => void;
}

const navItems = ["Home", "Archive", "Fam"];

const Navbar = ({ activeSection, onSectionChange, volume, onVolumeChange, onLogoClick }: NavbarProps) => {
  const [showSlider, setShowSlider] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const prevVolume = useRef(volume);
  const scrollPosition = useScrollPosition();
  const isScrolled = scrollPosition > 10;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sliderRef.current && !sliderRef.current.contains(e.target as Node)) {
        setShowSlider(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggleMute = () => {
    if (volume > 0) {
      prevVolume.current = volume;
      onVolumeChange(0);
    } else {
      onVolumeChange(prevVolume.current || 0.5);
    }
  };

  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
        isScrolled 
          ? "bg-background/95 backdrop-blur-lg shadow-[0_4px_20px_rgba(0,0,0,0.3)] border-b border-border/50" 
          : "bg-background/80 backdrop-blur-md border-b border-border"
      }`}
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
        <button onClick={onLogoClick} className="flex items-center gap-3 cursor-pointer">
          <img src={cortevazLogo} alt="LCS" className="w-10 h-10 rounded-full glow-crimson object-cover" />
          <span className="font-display text-sm md:text-base font-bold tracking-[0.2em] uppercase text-foreground text-glow-crimson">
            LCS
          </span>
        </button>

        <div className="flex items-center gap-1 rounded-full border border-border bg-card/60 px-1 py-1">
          {navItems.map((item) => (
            <button
              key={item}
              onClick={() => onSectionChange(item)}
              className={`relative px-4 py-1.5 text-xs font-body font-semibold tracking-wider uppercase rounded-full transition-all duration-300 ${
                activeSection === item
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {activeSection === item && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 rounded-full bg-crimson/80 border border-crimson"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10">{item}</span>
            </button>
          ))}
        </div>

        <div className="relative" ref={sliderRef}>
          <button
            onClick={toggleMute}
            onMouseEnter={() => setShowSlider(true)}
            className="w-9 h-9 rounded-full border border-border bg-card/60 flex items-center justify-center text-muted-foreground hover:text-crimson hover:border-crimson/40 transition-all"
          >
            <VolumeIcon className="w-4 h-4" />
          </button>

          <AnimatePresence>
            {showSlider && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 p-3 rounded-lg border border-border bg-card/95 backdrop-blur-md shadow-lg"
                onMouseLeave={() => setShowSlider(false)}
              >
                <div className="flex items-center gap-2 w-32">
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={volume}
                    onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                    className="w-full h-1 appearance-none rounded-full bg-muted cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-crimson [&::-webkit-slider-thumb]:shadow-[0_0_8px_2px_hsl(0_70%_40%/0.6)]
                      [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-crimson [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-[0_0_8px_2px_hsl(0_70%_40%/0.6)]
                      [&::-webkit-slider-runnable-track]:rounded-full [&::-moz-range-track]:rounded-full"
                  />
                  <span className="text-[10px] font-body text-muted-foreground w-7 text-right">
                    {Math.round(volume * 100)}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
