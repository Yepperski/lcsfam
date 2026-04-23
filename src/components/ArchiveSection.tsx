import { motion, AnimatePresence } from "framer-motion";
import { 
  Film, 
  RefreshCw, 
  ExternalLink, 
  Play, 
  User, 
  X, 
  Maximize2, 
  ChevronLeft, 
  ChevronRight,
  Youtube,
  Radio,
  Clock,
  TrendingUp,
  Zap,
  Eye,
  Hash,
  Calendar,
  Sparkles
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";

const archives = [
  {
    title: "LCS Archive 1",
    description: "LCS #1",
    fallbackVideoId: "9cbRWcvXy_A",
    videoId: "9cbRWcvXy_A",
    channelHandle: "KUYAfatss6267",
    channelUrl: "https://www.youtube.com/@KUYAfatss6267",
    accentColor: "#dc2626",
  },
  {
    title: "LCS Archive 2",
    description: "LCS #2",
    fallbackVideoId: "SB1XthXoTX4",
    videoId: "SB1XthXoTX4",
    channelHandle: "andreicuaton",
    channelUrl: "https://www.youtube.com/@andreicuaton",
    accentColor: "#7c3aed",
  },
  {
    title: "LCS Archive 3",
    description: "LCS #3",
    fallbackVideoId: "gs-PM4y8YnM",
    videoId: "gs-PM4y8YnM",
    channelHandle: "roitante",
    channelUrl: "https://www.youtube.com/@roitante4413",
    accentColor: "#0891b2",
  },
  {
    title: "LCS Archive 4",
    description: "LCS #4",
    fallbackVideoId: "DQnBgMdqbG8",
    videoId: "DQnBgMdqbG8",
    channelHandle: "JuanOntop1",
    channelUrl: "https://www.youtube.com/@JuanOntop1",
    accentColor: "#ea580c",
  },
];

// Helper function to format time ago
const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const ArchiveSection = () => {
  const [videos, setVideos] = useState(archives.map(archive => ({
    ...archive,
    videoId: archive.videoId
  })));
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [refreshStatus, setRefreshStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [canRefresh, setCanRefresh] = useState(true);
  const [timeAgo, setTimeAgo] = useState<string>('');
  const [loadedVideos, setLoadedVideos] = useState<Record<string, boolean>>({});
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<{ videoId: string; title: string; index: number } | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'focus'>('grid');
  const [progress, setProgress] = useState(0);
  const REFRESH_COOLDOWN = 5000; // 5 seconds

  // Update time ago display every minute
  useEffect(() => {
    if (!lastUpdate) return;
    
    const updateTimeAgo = () => {
      setTimeAgo(formatTimeAgo(lastUpdate));
    };
    
    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [lastUpdate]);

  // Simulate progress bar during fetch
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setProgress(prev => (prev >= 90 ? prev : prev + Math.random() * 15));
      }, 200);
      return () => clearInterval(interval);
    } else {
      setProgress(0);
    }
  }, [isLoading]);

  const fetchLatestVideos = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    setProgress(10);

    // Note: Direct YouTube fetching from browser is blocked by CORS
    // This function attempts fetch but will gracefully fall back to default video IDs
    const updatedVideos = [...videos];
    const updates: Record<string, string> = {};
    let corsBlocked = false;

    for (let i = 0; i < archives.length; i++) {
      const archive = archives[i];
      setProgress(20 + (i / archives.length) * 60);
      
      try {
        const searchUrl = `https://www.youtube.com/@${archive.channelHandle}`;
        const response = await fetch(searchUrl, { mode: 'no-cors' });
        
        // With no-cors, response is opaque - we can't read the HTML
        // This will fail silently, and we use fallback IDs
        if (response.type === 'opaque') {
          corsBlocked = true;
          continue;
        }
        
        const html = await response.text();
        
        const channelIdMatch = html.match(/channelId":"([^"]+)"/);
        if (channelIdMatch) {
          const channelId = channelIdMatch[1];
          const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
          
          const rssResponse = await fetch(rssUrl, { mode: 'no-cors' });
          if (rssResponse.type === 'opaque') {
            corsBlocked = true;
            continue;
          }
          
          const rssText = await rssResponse.text();
          
          let videoIdMatch = rssText.match(/<link[^>]*youtube\.com\/watch\?v=([^&]+)/);
          if (!videoIdMatch) {
            videoIdMatch = rssText.match(/youtube\.com\/watch\?v=([^&]+)/);
          }
          if (!videoIdMatch) {
            videoIdMatch = rssText.match(/youtu\.be\/([^?&]+)/);
          }
          if (videoIdMatch) {
            updates[archive.title] = videoIdMatch[1];
          }
        }
      } catch (error) {
        // Silently fail - fallback IDs will be used
        console.log(`Fetch attempt for ${archive.title}: Using fallback video ID`);
      }
    }

    const finalVideos = updatedVideos.map(archive => ({
      ...archive,
      videoId: updates[archive.title] || archive.fallbackVideoId
    }));

    setVideos(finalVideos);
    setLastUpdate(new Date());
    setProgress(100);
    setRefreshStatus('success');
    setCanRefresh(false);
    
    // Show informational message if CORS blocked
    if (corsBlocked) {
      console.info('YouTube fetch blocked by CORS - using default video IDs. This is expected in browser environments.');
    }
    
    // Reset success status after 2 seconds
    setTimeout(() => {
      setRefreshStatus('idle');
    }, 2000);
    
    // Re-enable refresh after cooldown
    setTimeout(() => {
      setCanRefresh(true);
    }, REFRESH_COOLDOWN);
    
    setTimeout(() => {
      setIsLoading(false);
      setProgress(0);
    }, 500);
  }, [videos]);

  // Initial fetch on mount only - no auto-refresh interval
  useEffect(() => {
    // Run once on mount, ignore dependency warning for intentional one-time fetch
    // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchLatestVideos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveModal(null);
      if (activeModal) {
        if (e.key === 'ArrowLeft' && activeModal.index > 0) {
          const newIndex = activeModal.index - 1;
          const newArchive = archives[newIndex];
          setActiveModal({ 
            videoId: videos.find(v => v.title === newArchive.title)?.videoId || newArchive.videoId, 
            title: newArchive.title,
            index: newIndex 
          });
        }
        if (e.key === 'ArrowRight' && activeModal.index < archives.length - 1) {
          const newIndex = activeModal.index + 1;
          const newArchive = archives[newIndex];
          setActiveModal({ 
            videoId: videos.find(v => v.title === newArchive.title)?.videoId || newArchive.videoId, 
            title: newArchive.title,
            index: newIndex 
          });
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModal, videos]);

  return (
    <div id="archive-section" className="relative min-h-screen bg-transparent overflow-hidden">
      {/* Subtle Grain Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-50" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat'
      }} />
      
      {/* Subtle Circuit Pattern Background */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23dc2626' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12"
        >
          {/* Top Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <div className="flex items-center gap-5">
              {/* Dramatic Header Glow */}
              <motion.div 
                className="absolute -left-20 top-0 w-96 h-96 bg-[crimson]/5 rounded-full blur-[150px] pointer-events-none"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div 
                className="relative p-4 bg-transparent border-2 border-crimson"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                <Film className="w-9 h-9 text-crimson" />
                {/* Corner accents - double line style */}
                <div className="absolute -top-1 -left-1 w-4 h-4">
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-crimson" />
                  <div className="absolute top-0 left-0 w-0.5 h-full bg-crimson" />
                  <div className="absolute top-1 left-1 w-2 h-0.5 bg-crimson/50" />
                  <div className="absolute top-1 left-1 w-0.5 h-2 bg-crimson/50" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4">
                  <div className="absolute top-0 right-0 w-full h-0.5 bg-crimson" />
                  <div className="absolute top-0 right-0 w-0.5 h-full bg-crimson" />
                  <div className="absolute top-1 right-1 w-2 h-0.5 bg-crimson/50" />
                  <div className="absolute top-1 right-1 w-0.5 h-2 bg-crimson/50" />
                </div>
                <div className="absolute -bottom-1 -left-1 w-4 h-4">
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-crimson" />
                  <div className="absolute bottom-0 left-0 w-0.5 h-full bg-crimson" />
                  <div className="absolute bottom-1 left-1 w-2 h-0.5 bg-crimson/50" />
                  <div className="absolute bottom-1 left-1 w-0.5 h-2 bg-crimson/50" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4">
                  <div className="absolute bottom-0 right-0 w-full h-0.5 bg-crimson" />
                  <div className="absolute bottom-0 right-0 w-0.5 h-full bg-crimson" />
                  <div className="absolute bottom-1 right-1 w-2 h-0.5 bg-crimson/50" />
                  <div className="absolute bottom-1 right-1 w-0.5 h-2 bg-crimson/50" />
                </div>
              </motion.div>
              
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-[10px] font-mono text-[#666] uppercase tracking-[0.3em]">Case File</span>
                  <div className="h-px w-8 bg-[crimson]/30" />
                  <span className="text-[10px] font-mono text-[crimson] uppercase tracking-wider">#2024-001</span>
                </div>
                <motion.h1 
                  className="text-4xl font-bold tracking-wider uppercase"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                >
                  <span className="text-[#f5f5f5] drop-shadow-[0_2px_10px_rgba(220,38,38,0.5)]">
                    The Archive
                  </span>
                </motion.h1>
                <div className="flex items-center gap-3 mt-2">
                  <motion.div
                    className="flex items-center gap-1.5 px-3 py-1"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <span className="w-1.5 h-1.5 bg-[crimson] animate-pulse" />
                    <span className="text-xs text-[crimson] font-medium uppercase tracking-[0.2em]">
                      {videos.length} Collections
                    </span>
                  </motion.div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* View Toggle - Mafia Style */}
              <div className="flex items-center border border-[#333]">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 text-sm font-medium transition-all duration-300 uppercase tracking-wider ${
                    viewMode === 'grid' 
                      ? 'bg-[crimson] text-[#0a0a0a]' 
                      : 'text-[#888] hover:text-[crimson]'
                  }`}
                >
                  Grid
                </button>
                <div className="w-px h-8 bg-[#333]" />
                <button
                  onClick={() => setViewMode('focus')}
                  className={`px-4 py-2 text-sm font-medium transition-all duration-300 uppercase tracking-wider ${
                    viewMode === 'focus' 
                      ? 'bg-[crimson] text-[#0a0a0a]' 
                      : 'text-[#888] hover:text-[crimson]'
                  }`}
                >
                  Focus
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  {/* Cooldown Ring */}
                  {!canRefresh && !isLoading && (
                    <svg className="absolute -inset-1 w-[calc(100%+8px)] h-[calc(100%+8px)] rotate-[-90deg]" viewBox="0 0 36 36">
                      <circle
                        cx="18"
                        cy="18"
                        r="16"
                        fill="none"
                        stroke="hsl(var(--crimson) / 0.3)"
                        strokeWidth="2"
                      />
                      <motion.circle
                        cx="18"
                        cy="18"
                        r="16"
                        fill="none"
                        stroke="hsl(var(--crimson))"
                        strokeWidth="2"
                        strokeLinecap="round"
                        initial={{ pathLength: 1 }}
                        animate={{ pathLength: 0 }}
                        transition={{ duration: REFRESH_COOLDOWN / 1000, ease: "linear" }}
                        style={{ strokeDasharray: "100", strokeDashoffset: "0" }}
                      />
                    </svg>
                  )}
                  
                  <motion.button
                    onClick={fetchLatestVideos}
                    disabled={isLoading || !canRefresh}
                    whileHover={{ scale: canRefresh ? 1.03 : 1, y: canRefresh ? -2 : 0 }}
                    whileTap={{ scale: canRefresh ? 0.97 : 1 }}
                    className={`group relative flex items-center gap-2 px-5 py-2.5 font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-sm overflow-hidden ${
                      refreshStatus === 'success' 
                        ? 'text-[#4ade80] border border-[#4ade80]/50 hover:border-[#4ade80] hover:shadow-[0_0_20px_rgba(74,222,128,0.3)]'
                        : refreshStatus === 'error'
                        ? 'text-[#f87171] border border-[#f87171]/50 hover:border-[#f87171] hover:shadow-[0_0_20px_rgba(248,113,113,0.3)]'
                        : 'text-[crimson] border border-[crimson]/50 hover:border-[crimson] hover:bg-[crimson] hover:text-[#0a0a0a] hover:shadow-[0_0_25px_rgba(220,38,38,0.4)]'
                    }`}
                  >
                    {/* Button glow effect */}
                    <motion.div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                      style={{
                        background: refreshStatus === 'success'
                          ? 'radial-gradient(circle at center, rgba(74,222,128,0.2) 0%, transparent 70%)'
                          : refreshStatus === 'error'
                          ? 'radial-gradient(circle at center, rgba(248,113,113,0.2) 0%, transparent 70%)'
                          : 'radial-gradient(circle at center, rgba(220,38,38,0.3) 0%, transparent 70%)'
                      }}
                    />
                    {/* Corner accents on hover */}
                    <div className="absolute top-0 left-0 w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className={`absolute top-0 left-0 w-full h-px ${refreshStatus === 'success' ? 'bg-[#4ade80]' : refreshStatus === 'error' ? 'bg-[#f87171]' : 'bg-[crimson]'}`} />
                      <div className={`absolute top-0 left-0 w-px h-full ${refreshStatus === 'success' ? 'bg-[#4ade80]' : refreshStatus === 'error' ? 'bg-[#f87171]' : 'bg-[crimson]'}`} />
                    </div>
                    <div className="absolute top-0 right-0 w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className={`absolute top-0 right-0 w-full h-px ${refreshStatus === 'success' ? 'bg-[#4ade80]' : refreshStatus === 'error' ? 'bg-[#f87171]' : 'bg-[crimson]'}`} />
                      <div className={`absolute top-0 right-0 w-px h-full ${refreshStatus === 'success' ? 'bg-[#4ade80]' : refreshStatus === 'error' ? 'bg-[#f87171]' : 'bg-[crimson]'}`} />
                    </div>
                    <div className="absolute bottom-0 left-0 w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className={`absolute bottom-0 left-0 w-full h-px ${refreshStatus === 'success' ? 'bg-[#4ade80]' : refreshStatus === 'error' ? 'bg-[#f87171]' : 'bg-[crimson]'}`} />
                      <div className={`absolute bottom-0 left-0 w-px h-full ${refreshStatus === 'success' ? 'bg-[#4ade80]' : refreshStatus === 'error' ? 'bg-[#f87171]' : 'bg-[crimson]'}`} />
                    </div>
                    <div className="absolute bottom-0 right-0 w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className={`absolute bottom-0 right-0 w-full h-px ${refreshStatus === 'success' ? 'bg-[#4ade80]' : refreshStatus === 'error' ? 'bg-[#f87171]' : 'bg-[crimson]'}`} />
                      <div className={`absolute bottom-0 right-0 w-px h-full ${refreshStatus === 'success' ? 'bg-[#4ade80]' : refreshStatus === 'error' ? 'bg-[#f87171]' : 'bg-[crimson]'}`} />
                    </div>
                    <RefreshCw className={`w-4 h-4 relative z-10 ${isLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                    <span className="hidden sm:inline relative z-10">
                      {isLoading ? 'Loading...' : refreshStatus === 'success' ? 'Done' : refreshStatus === 'error' ? 'Error' : 'Update'}
                    </span>
                  </motion.button>
                </div>
                
                {/* Last Refresh */}
                {lastUpdate && timeAgo && (
                  <motion.div 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="hidden lg:flex flex-col items-end text-xs font-mono"
                  >
                    <span className="text-[#666]">Last Update</span>
                    <span className="text-[crimson]">
                      {timeAgo}
                    </span>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Progress Bar - Mafia Style */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6"
              >
                <div className="h-0.5 w-full bg-[#1a1a1a] overflow-hidden">
                  <motion.div 
                    className="h-full bg-[crimson]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-xs text-[#666] mt-2 flex items-center gap-2 font-mono uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-[crimson] animate-pulse" />
                  Retrieving Intelligence...
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Message - Mafia Style */}
          <AnimatePresence>
            {fetchError && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 p-4 bg-[#1a0a0a] border border-[#5a2a2a]"
              >
                <p className="text-sm text-[#c95858] flex items-center gap-2 font-mono">
                  <span className="w-2 h-2 rounded-full bg-[#c95858] animate-pulse" />
                  [ERROR] {fetchError}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Video Grid */}
        <motion.div 
          layout
          className={`grid gap-4 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' 
              : 'grid-cols-1 max-w-3xl mx-auto'
          }`}
        >
          <AnimatePresence mode="popLayout">
            {videos.map((archive, index) => {
              const isLoaded = loadedVideos[archive.title];
              const isHovered = hoveredCard === archive.title;
              
              return (
                <motion.div
                  key={archive.title}
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -20 }}
                  transition={{ 
                    delay: index * 0.15, 
                    duration: 0.6, 
                    ease: [0.16, 1, 0.3, 1],
                    layout: { duration: 0.4 }
                  }}
                  onMouseEnter={() => setHoveredCard(archive.title)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className="group relative"
                  style={{
                    transform: isHovered ? 'translateY(-6px)' : 'translateY(0)',
                    transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                  }}
                >
                  <div 
                    className="relative overflow-hidden bg-[#0f0f0f] border border-[#222] transition-all duration-300 group"
                    style={{
                      boxShadow: isHovered 
                        ? `0 30px 60px -15px rgba(220,38,38,0.3), 0 0 0 1px crimson, 0 0 40px rgba(220,38,38,0.15)` 
                        : '0 4px 6px -1px rgba(0,0,0,0.5)',
                    }}
                  >
                    {/* Gold top accent on hover */}
                    <div 
                      className="absolute inset-x-0 top-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[crimson]"
                    />
                    {/* Shine sweep effect on hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-30 pointer-events-none overflow-hidden">
                      <motion.div 
                        className="absolute inset-0"
                        style={{
                          background: 'linear-gradient(105deg, transparent 40%, rgba(220,38,38,0.1) 45%, rgba(255,255,255,0.03) 50%, rgba(220,38,38,0.1) 55%, transparent 60%)',
                        }}
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '100%' }}
                        transition={{ duration: 0.8, ease: 'easeInOut' }}
                      />
                    </div>
                    {/* Corner accents - Double line style */}
                    <div className="absolute top-0 left-0 w-3 h-3">
                      <div className="absolute top-0 left-0 w-full h-px bg-[#333] group-hover:bg-[crimson]/50 transition-colors" />
                      <div className="absolute top-0 left-0 w-px h-full bg-[#333] group-hover:bg-[crimson]/50 transition-colors" />
                      <div className="absolute top-1 left-1 w-1.5 h-px bg-[#222] group-hover:bg-[crimson]/30 transition-colors" />
                      <div className="absolute top-1 left-1 w-px h-1.5 bg-[#222] group-hover:bg-[crimson]/30 transition-colors" />
                    </div>
                    <div className="absolute top-0 right-0 w-3 h-3">
                      <div className="absolute top-0 right-0 w-full h-px bg-[#333] group-hover:bg-[crimson]/50 transition-colors" />
                      <div className="absolute top-0 right-0 w-px h-full bg-[#333] group-hover:bg-[crimson]/50 transition-colors" />
                      <div className="absolute top-1 right-1 w-1.5 h-px bg-[#222] group-hover:bg-[crimson]/30 transition-colors" />
                      <div className="absolute top-1 right-1 w-px h-1.5 bg-[#222] group-hover:bg-[crimson]/30 transition-colors" />
                    </div>
                    <div className="absolute bottom-0 left-0 w-3 h-3">
                      <div className="absolute bottom-0 left-0 w-full h-px bg-[#333] group-hover:bg-[crimson]/50 transition-colors" />
                      <div className="absolute bottom-0 left-0 w-px h-full bg-[#333] group-hover:bg-[crimson]/50 transition-colors" />
                      <div className="absolute bottom-1 left-1 w-1.5 h-px bg-[#222] group-hover:bg-[crimson]/30 transition-colors" />
                      <div className="absolute bottom-1 left-1 w-px h-1.5 bg-[#222] group-hover:bg-[crimson]/30 transition-colors" />
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3">
                      <div className="absolute bottom-0 right-0 w-full h-px bg-[#333] group-hover:bg-[crimson]/50 transition-colors" />
                      <div className="absolute bottom-0 right-0 w-px h-full bg-[#333] group-hover:bg-[crimson]/50 transition-colors" />
                      <div className="absolute bottom-1 right-1 w-1.5 h-px bg-[#222] group-hover:bg-[crimson]/30 transition-colors" />
                      <div className="absolute bottom-1 right-1 w-px h-1.5 bg-[#222] group-hover:bg-[crimson]/30 transition-colors" />
                    </div>

                    {/* Video Container */}
                    <div className="relative aspect-video overflow-hidden">
                      {/* Clean Episode Number Badge */}
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.3 }}
                        className="absolute top-3 left-3 z-20 flex items-center gap-2"
                      >
                        <span className="px-2 py-1 bg-[crimson] text-[#0a0a0a] text-xs font-black uppercase tracking-wider">
                          #{index + 52}
                        </span>
                        {index === 0 && (
                          <span className="px-2 py-1 bg-white text-[#0a0a0a] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                            <span className="w-1 h-1 bg-[crimson] rounded-full animate-pulse" />
                            New
                          </span>
                        )}
                      </motion.div>
                      
                      {/* Scanning Line Effect */}
                      <motion.div
                        initial={{ top: 0 }}
                        animate={{ top: ["0%", "100%", "0%"] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-[crimson]/30 to-transparent z-10 pointer-events-none"
                      />

                      {/* Loading Skeleton - Mafia Style */}
                      <AnimatePresence>
                        {!isLoaded && (
                          <motion.div 
                            initial={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="absolute inset-0 bg-[#0f0f0f] overflow-hidden"
                          >
                            <div className="absolute inset-0 bg-[#0f0f0f]" />
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[crimson]/5 to-transparent animate-shimmer" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <motion.div
                                animate={{ opacity: [0.3, 0.6, 0.3] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="text-[crimson] font-mono text-xs uppercase tracking-[0.3em]"
                              >
                                Loading...
                              </motion.div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Iframe */}
                      <iframe
                        src={`https://www.youtube.com/embed/${archive.videoId}?rel=0&modestbranding=1`}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={archive.title}
                        loading="lazy"
                        onLoad={() => setLoadedVideos(prev => ({ ...prev, [archive.title]: true }))}
                      />

                      {/* Clean Dark Overlay */}
                      <motion.div 
                        initial={false}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none"
                      />

                      {/* Creator Name Only - Below Badge */}
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 + 0.2 }}
                        className="absolute top-11 left-3 z-20 pointer-events-none"
                      >
                        <p className="text-white/90 text-sm font-medium drop-shadow-md"
                           style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>
                          {archive.channelHandle.replace('@', '') === 'KUYAfatss6267' ? 'KUYA Fatss' : 
                           archive.channelHandle.replace('@', '') === 'andreicuaton' ? 'Yui Cortevaz' :
                           archive.channelHandle.replace('@', '') === 'roitante4413' ? 'Clark Joestar' :
                           archive.channelHandle.replace('@', '') === 'JuanOntop1' ? 'Juan H.' : archive.channelHandle.replace('@', '')}
                        </p>
                      </motion.div>

                      {/* Large Centered Play Button - Clean Style */}
                      <motion.button
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: index * 0.1 + 0.3, type: "spring", stiffness: 200 }}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveModal({ videoId: archive.videoId, title: archive.title, index })}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 group"
                      >
                        {/* Outer glow ring */}
                        <motion.div 
                          className="absolute inset-[-6px] rounded-xl bg-white/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        {/* Main play button container */}
                        <div className="relative w-16 h-12 bg-white rounded-lg flex items-center justify-center shadow-2xl overflow-hidden group-hover:bg-[crimson] transition-colors duration-300">
                          {/* Shine effect */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12"
                            initial={{ x: '-100%' }}
                            whileHover={{ x: '100%' }}
                            transition={{ duration: 0.5 }}
                          />
                          {/* Play icon */}
                          <Play className="w-6 h-6 text-[#0a0a0a] fill-[#0a0a0a] group-hover:text-white group-hover:fill-white relative z-10 ml-0.5 transition-colors duration-300" />
                        </div>
                      </motion.button>

                      {/* Expand button - bottom right */}
                      <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isHovered ? 1 : 0.6 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setActiveModal({ videoId: archive.videoId, title: archive.title, index })}
                        className="absolute bottom-3 right-3 z-20 p-1.5 bg-black/50 backdrop-blur-sm rounded text-white/70 hover:bg-[crimson] hover:text-white transition-all duration-300"
                        title="Expand"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </motion.button>
                    </div>

                    {/* Content - Clean Style */}
                    <div className="p-3 relative bg-[#0a0a0a]">
                      {/* Top border */}
                      <div className="absolute top-0 left-0 right-0 h-px bg-[#222]" />
                      
                      {/* Episode Info */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-mono text-[#555] uppercase tracking-wider">FILE NO.</span>
                        <span className="text-[10px] font-mono text-[crimson] uppercase tracking-wider">2024-{String(index + 1).padStart(3, '0')}</span>
                      </div>
                      
                      {/* Title */}
                      <h3 className="text-sm font-bold text-[#e5e5e5] truncate group-hover:text-[crimson] transition-colors duration-300 uppercase tracking-wide mb-2">
                        {archive.title}
                      </h3>

                      {/* Channel Link - Compact */}
                      <a 
                        href={archive.channelUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 py-1.5 px-2 -mx-2 rounded border border-[#222] hover:border-[crimson]/40 bg-[#111] hover:bg-[#161616] transition-all duration-300 group/link"
                      >
                        <div className="w-6 h-6 flex items-center justify-center bg-[#1a1a1a] text-[crimson] rounded">
                          <User className="w-3 h-3" />
                        </div>
                        <p className="text-[11px] text-[#888] font-medium truncate group-hover/link:text-[crimson] transition-colors uppercase flex-1">
                          @{archive.channelHandle}
                        </p>
                        <ExternalLink className="w-3 h-3 text-[#444] group-hover/link:text-[crimson] transition-colors" />
                      </a>
                    </div>

                    {/* Bottom Gold Line on Hover */}
                    <motion.div 
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[crimson]"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: isHovered ? 1 : 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

      </div>

      {/* Modal - Mafia Style */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95"
            onClick={() => setActiveModal(null)}
          >
            {/* Modal Ambient Glow */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <motion.div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full bg-[crimson]/10 blur-[200px]"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.6 }}
              />
            </div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-6xl aspect-video bg-[#0f0f0f] overflow-hidden border-2 border-[#333] shadow-[0_0_100px_rgba(220,38,38,0.3)]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-[#0a0a0a] border-b border-[#333]">
                <div className="flex items-center gap-4">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-2 px-3 py-1 border border-[crimson]/50"
                  >
                    <span className="text-[crimson] text-sm font-mono font-bold">
                      {String(activeModal.index + 1).padStart(2, '0')}
                    </span>
                    <span className="text-[#444]">/</span>
                    <span className="text-[#666] text-sm font-mono">
                      {String(archives.length).padStart(2, '0')}
                    </span>
                  </motion.div>
                  <motion.h3 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-[#e5e5e5] font-semibold text-lg uppercase tracking-wide"
                    style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                  >
                    {activeModal.title}
                  </motion.h3>
                </div>
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ scale: 1.15, rotate: 90 }}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setActiveModal(null)}
                  className="group relative p-2 border border-[crimson]/50 text-[crimson] hover:border-[crimson] hover:bg-[crimson] hover:text-[#0a0a0a] transition-all duration-300 shadow-[0_0_0_rgba(220,38,38,0)] hover:shadow-[0_0_15px_rgba(220,38,38,0.4)] overflow-hidden"
                >
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-[crimson]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <X className="w-5 h-5 relative z-10" />
                </motion.button>
              </div>

              {/* Navigation */}
              {activeModal.index > 0 && (
                <motion.button
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ scale: 1.1, x: -3 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    const newIndex = activeModal.index - 1;
                    const newArchive = archives[newIndex];
                    setActiveModal({ 
                      videoId: videos.find(v => v.title === newArchive.title)?.videoId || newArchive.videoId, 
                      title: newArchive.title,
                      index: newIndex 
                    });
                  }}
                  className="group absolute left-3 top-1/2 -translate-y-1/2 z-10 p-3 border border-[crimson]/50 text-[crimson] hover:border-[crimson] hover:bg-[crimson] hover:text-[#0a0a0a] transition-all duration-300 shadow-[0_0_0_rgba(220,38,38,0)] hover:shadow-[0_0_25px_rgba(220,38,38,0.4)] bg-[#0a0a0a]/50 backdrop-blur-sm overflow-hidden"
                >
                  {/* Glow ring */}
                  <motion.div
                    className="absolute inset-0 rounded-sm bg-[crimson]/20 opacity-0 group-hover:opacity-100"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <ChevronLeft className="w-6 h-6 relative z-10 group-hover:-translate-x-0.5 transition-transform" />
                </motion.button>
              )}
              
              {activeModal.index < archives.length - 1 && (
                <motion.button
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ scale: 1.1, x: 3 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    const newIndex = activeModal.index + 1;
                    const newArchive = archives[newIndex];
                    setActiveModal({ 
                      videoId: videos.find(v => v.title === newArchive.title)?.videoId || newArchive.videoId, 
                      title: newArchive.title,
                      index: newIndex 
                    });
                  }}
                  className="group absolute right-3 top-1/2 -translate-y-1/2 z-10 p-3 border border-[crimson]/50 text-[crimson] hover:border-[crimson] hover:bg-[crimson] hover:text-[#0a0a0a] transition-all duration-300 shadow-[0_0_0_rgba(220,38,38,0)] hover:shadow-[0_0_25px_rgba(220,38,38,0.4)] bg-[#0a0a0a]/50 backdrop-blur-sm overflow-hidden"
                >
                  {/* Glow ring */}
                  <motion.div
                    className="absolute inset-0 rounded-sm bg-[crimson]/20 opacity-0 group-hover:opacity-100"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <ChevronRight className="w-6 h-6 relative z-10 group-hover:translate-x-0.5 transition-transform" />
                </motion.button>
              )}

              {/* Video */}
              <div className="w-full h-full pt-16">
                <iframe
                  src={`https://www.youtube.com/embed/${activeModal.videoId}?rel=0&modestbranding=1&autoplay=1`}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                  title={activeModal.title}
                />
              </div>
            </motion.div>

            {/* Keyboard Hints - Mafia Style */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-6 text-xs font-mono uppercase tracking-wider text-[#666]">
              <span className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-[#1a1a1a] border border-[#333] text-[#888]">←</kbd>
                <kbd className="px-2 py-1 bg-[#1a1a1a] border border-[#333] text-[#888]">→</kbd>
                <span>Prev / Next</span>
              </span>
              <span className="text-[#333]">|</span>
              <span className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-[#1a1a1a] border border-[#333] text-[#888]">ESC</kbd>
                <span>Close</span>
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ArchiveSection;