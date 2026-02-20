import { useRef, useState, useCallback, useEffect, createContext, useContext } from "react";
import { AnimatePresence } from "framer-motion";
import { ParticleBackground } from "./components/ParticleBackground";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { VideoGrid } from "./components/VideoGrid";
import { VideoPlayer } from "./components/VideoPlayer";
import { CollectionPage } from "./components/CollectionPage";
import { Footer } from "./components/Footer";
import { FloatingAddButton } from "./components/FloatingAddButton";
import { AddVideoModal } from "./components/AddVideoModal";
import { ManageVideosButton } from "./components/ManageVideosButton";
import { Video, Collection } from "./data/videos";

// ==================== THEME CONTEXT ====================
type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  toggleTheme: () => {},
  isDark: true,
});

export const useTheme = () => useContext(ThemeContext);

// ==================== STORAGE ====================
const VIDEOS_KEY = "anaty_videos";
const COLLECTIONS_KEY = "anaty_collections";
const THEME_KEY = "anaty_theme";

function loadVideos(): Video[] {
  try {
    const stored = localStorage.getItem(VIDEOS_KEY);
    if (stored) { const parsed = JSON.parse(stored); if (Array.isArray(parsed)) return parsed; }
  } catch { /* ignore */ }
  return [];
}

function saveVideos(videos: Video[]) {
  try { localStorage.setItem(VIDEOS_KEY, JSON.stringify(videos)); } catch { /* */ }
}

function loadCollections(): Collection[] {
  try {
    const stored = localStorage.getItem(COLLECTIONS_KEY);
    if (stored) { const parsed = JSON.parse(stored); if (Array.isArray(parsed)) return parsed; }
  } catch { /* ignore */ }
  return [];
}

function saveCollections(collections: Collection[]) {
  try { localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections)); } catch { /* */ }
}

function loadTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch { /* ignore */ }
  return "dark";
}

function saveTheme(theme: Theme) {
  try { localStorage.setItem(THEME_KEY, theme); } catch { /* */ }
}

// ==================== APP ====================
export function App() {
  const [videos, setVideos] = useState<Video[]>(() => loadVideos());
  const [collections, setCollections] = useState<Collection[]>(() => loadCollections());
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>(() => loadTheme());
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);
  const videoSectionRef = useRef<HTMLElement>(null);

  const isDark = theme === "dark";

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === "dark" ? "light" : "dark";
      saveTheme(next);
      return next;
    });
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.querySelector('meta[name="theme-color"]')?.setAttribute(
      "content", theme === "dark" ? "#111827" : "#f5f6fa"
    );
  }, [theme]);

  useEffect(() => { saveVideos(videos); }, [videos]);
  useEffect(() => { saveCollections(collections); }, [collections]);

  const scrollToVideos = useCallback(() => {
    videoSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleVideoClick = useCallback((video: Video) => {
    setSelectedVideo(video);
    document.body.style.overflow = "hidden";
  }, []);

  const handleClosePlayer = useCallback(() => {
    setSelectedVideo(null);
    document.body.style.overflow = "";
  }, []);

  const handleAddVideo = useCallback((youtubeId: string, title: string, collectionId?: string) => {
    const newVideo: Video = { id: Date.now().toString(), youtubeId, title, collectionId };
    setVideos(prev => [newVideo, ...prev]);
  }, []);

  const handleCreateCollection = useCallback((name: string, vids: { youtubeId: string; title: string }[]) => {
    const collectionId = "coll_" + Date.now().toString();
    const newCollection: Collection = { id: collectionId, name, createdAt: Date.now() };
    setCollections(prev => [...prev, newCollection]);
    const newVideos = vids.map((v, i) => ({
      id: (Date.now() + i + 1).toString(), youtubeId: v.youtubeId, title: v.title, collectionId,
    }));
    setVideos(prev => [...newVideos, ...prev]);
  }, []);

  const handleRemoveVideo = useCallback((videoId: string) => {
    setVideos(prev => prev.filter(v => v.id !== videoId));
  }, []);

  const handleRemoveCollection = useCallback((collectionId: string) => {
    setCollections(prev => prev.filter(c => c.id !== collectionId));
    setVideos(prev => prev.filter(v => v.collectionId !== collectionId));
    if (activeCollectionId === collectionId) setActiveCollectionId(null);
  }, [activeCollectionId]);

  const handleOpenAddModal = useCallback(() => {
    setIsAddModalOpen(true);
    document.body.style.overflow = "hidden";
  }, []);

  const handleCloseAddModal = useCallback(() => {
    setIsAddModalOpen(false);
    document.body.style.overflow = "";
  }, []);

  const handleOpenCollection = useCallback((collectionId: string) => {
    setActiveCollectionId(collectionId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleBackFromCollection = useCallback(() => {
    setActiveCollectionId(null);
  }, []);

  const activeCollection = activeCollectionId
    ? collections.find(c => c.id === activeCollectionId) || null
    : null;

  const activeCollectionVideos = activeCollectionId
    ? videos.filter(v => v.collectionId === activeCollectionId)
    : [];

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark }}>
      <div className="relative min-h-screen transition-colors duration-400" style={{ background: "var(--th-bg)" }}>
        <ParticleBackground />
        <Navbar videoCount={videos.length} />

        <main className="relative z-10">
          <AnimatePresence mode="wait">
            {activeCollection ? (
              <CollectionPage
                key={activeCollectionId}
                collection={activeCollection}
                videos={activeCollectionVideos}
                onBack={handleBackFromCollection}
                onVideoClick={handleVideoClick}
              />
            ) : (
              <div key="home">
                <Hero onScrollToVideos={scrollToVideos} />
                <VideoGrid
                  ref={videoSectionRef}
                  videos={videos}
                  collections={collections}
                  onVideoClick={handleVideoClick}
                  onOpenCollection={handleOpenCollection}
                />
              </div>
            )}
          </AnimatePresence>
        </main>

        <Footer />
        <FloatingAddButton onClick={handleOpenAddModal} />
        <ManageVideosButton
          videos={videos}
          collections={collections}
          onRemoveVideo={handleRemoveVideo}
          onRemoveCollection={handleRemoveCollection}
        />

        <AddVideoModal
          isOpen={isAddModalOpen}
          onClose={handleCloseAddModal}
          onAddVideo={handleAddVideo}
          onCreateCollection={handleCreateCollection}
          collections={collections}
        />

        <AnimatePresence>
          {selectedVideo && (
            <VideoPlayer video={selectedVideo} onClose={handleClosePlayer} />
          )}
        </AnimatePresence>
      </div>
    </ThemeContext.Provider>
  );
}
