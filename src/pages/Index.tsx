import { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import IntroScreen from "@/components/IntroScreen";
import Navbar from "@/components/Navbar";
import HomeSection from "@/components/HomeSection";
import ArchiveSection from "@/components/ArchiveSection";
import MembersSection from "@/components/MembersSection";
import SmokeBackground from "@/components/SmokeBackground";
import SectionSkeleton from "@/components/SectionSkeleton";

const Index = () => {
  const [entered, setEntered] = useState(false);
  const [activeSection, setActiveSection] = useState("Home");
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleEnter = () => {
    setEntered(true);
    if (!audioRef.current) {
      audioRef.current = new Audio("/audio/moolah.mp3");
      audioRef.current.loop = true;
      audioRef.current.volume = volume;
    }
    audioRef.current.play().catch(() => {});
  };

  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      audioRef.current.muted = newVolume === 0;
    }
  }, []);

  const renderSection = () => {
    switch (activeSection) {
      case "Archive":
        return <ArchiveSection />;
      case "Fam":
        return <MembersSection mainAudioRef={audioRef} />;
      default:
        return <HomeSection onNavigate={(section) => {
          if (section !== activeSection) {
            setIsLoading(true);
            setActiveSection(section);
            setTimeout(() => setIsLoading(false), 400);
          }
        }} />;
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Smoke particles */}
      <SmokeBackground />

      {/* Background texture */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(0_70%_40%/0.06)_0%,_transparent_70%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,_hsl(0_70%_40%/0.04)_0%,_transparent_60%)]" />
      </div>

      <AnimatePresence>
        {!entered && <IntroScreen onEnter={handleEnter} />}
      </AnimatePresence>

      {entered && (
        <>
          <Navbar
            activeSection={activeSection}
            onSectionChange={(section) => {
              if (section !== activeSection) {
                setIsLoading(true);
                setActiveSection(section);
                setTimeout(() => setIsLoading(false), 400);
              }
            }}
            volume={volume}
            onVolumeChange={handleVolumeChange}
            onLogoClick={() => setEntered(false)}
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative z-10 flex justify-center px-4 py-12 pt-24"
          >
            <div className="w-full max-w-2xl">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="skeleton"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <SectionSkeleton />
                  </motion.div>
                ) : (
                  <motion.div
                    key={activeSection}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                  >
                    {renderSection()}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default Index;
