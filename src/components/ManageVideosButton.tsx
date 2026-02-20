import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, X, Trash2, FolderOpen } from "lucide-react";
import { Video, Collection, getYouTubeThumbnail } from "../data/videos";
import { useTheme } from "../App";

interface ManageVideosButtonProps {
  videos: Video[];
  collections: Collection[];
  onRemoveVideo: (videoId: string) => void;
  onRemoveCollection: (collectionId: string) => void;
}

export function ManageVideosButton({ videos, collections, onRemoveVideo, onRemoveCollection }: ManageVideosButtonProps) {
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  if (videos.length === 0 && collections.length === 0) return null;

  const modalBg = isDark ? "rgba(22,27,38,0.97)" : "rgba(255,255,255,0.98)";
  const itemBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)";
  const itemBorder = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)";
  const textColor = isDark ? "#ffffff" : "#1a1a2e";
  const subText = isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.45)";

  const generalVideos = videos.filter(v => !v.collectionId);
  const collectionMap = new Map<string, Video[]>();
  for (const v of videos) {
    if (v.collectionId) {
      const arr = collectionMap.get(v.collectionId) || [];
      arr.push(v);
      collectionMap.set(v.collectionId, arr);
    }
  }

  return (
    <>
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 0.4, scale: 1 }}
        whileHover={{ opacity: 1, scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        transition={{ delay: 3, type: "spring" }}
        onClick={() => { setIsOpen(true); document.body.style.overflow = "hidden"; }}
        className="fixed bottom-6 left-6 sm:bottom-8 sm:left-8 z-40 w-9 h-9 sm:w-10 sm:h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-300"
        style={{
          background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
          border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}`,
          color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)",
        }}
      >
        <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => { setIsOpen(false); document.body.style.overflow = ""; }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-xl" />
            <motion.div initial={{ opacity: 0, y: 100, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 100, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }} onClick={e => e.stopPropagation()}
              className="relative w-full sm:max-w-md z-10 max-h-[80vh] sm:max-h-[70vh]">
              <div className="backdrop-blur-2xl rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col" style={{ background: modalBg, border: `1px solid ${itemBorder}`, maxHeight: "80vh" }}>
                <div className="h-1 bg-gradient-to-r from-red-600 via-orange-500 to-red-600 flex-shrink-0" />
                <div className="sm:hidden flex justify-center pt-3 flex-shrink-0"><div className="w-10 h-1 rounded-full" style={{ background: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)" }} /></div>
                <div className="px-5 sm:px-6 pt-4 sm:pt-6 pb-3 flex items-center justify-between flex-shrink-0">
                  <div>
                    <h3 className="text-lg font-bold font-display" style={{ color: textColor }}>Manage Videos</h3>
                    <p className="text-xs mt-0.5" style={{ color: subText }}>
                      {videos.length} video{videos.length !== 1 ? "s" : ""}
                      {collections.length > 0 ? ` • ${collections.length} collection${collections.length !== 1 ? "s" : ""}` : ""}
                    </p>
                  </div>
                  <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}
                    onClick={() => { setIsOpen(false); document.body.style.overflow = ""; }}
                    className="p-2 rounded-xl transition-all" style={{ background: itemBg, border: `1px solid ${itemBorder}`, color: subText }}>
                    <X className="w-4 h-4" />
                  </motion.button>
                </div>
                <div className="px-3 sm:px-4 pb-6 space-y-2 overflow-y-auto flex-1" style={{ scrollbarWidth: "none" }}>
                  {/* Collections */}
                  {collections.map((coll, i) => {
                    const collVideos = collectionMap.get(coll.id) || [];
                    return (
                      <motion.div key={coll.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50, scale: 0.8 }} transition={{ delay: i * 0.05 }}
                        className="rounded-xl overflow-hidden" style={{ border: `1px solid ${isDark ? "rgba(168,85,247,0.15)" : "rgba(168,85,247,0.12)"}` }}>
                        <div className="flex items-center gap-3 p-2.5 sm:p-3" style={{ background: isDark ? "rgba(168,85,247,0.08)" : "rgba(168,85,247,0.05)" }}>
                          <FolderOpen className="w-4 h-4 text-purple-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate" style={{ color: textColor }}>{coll.name}</p>
                            <p className="text-[10px]" style={{ color: subText }}>{collVideos.length} videos</p>
                          </div>
                          <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.85 }}
                            onClick={() => onRemoveCollection(coll.id)}
                            className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/25 transition-all">
                            <Trash2 className="w-3.5 h-3.5" />
                          </motion.button>
                        </div>
                        {collVideos.map(video => (
                          <div key={video.id} className="flex items-center gap-3 p-2 pl-10" style={{ background: itemBg, borderTop: `1px solid ${itemBorder}` }}>
                            <div className="w-12 h-8 rounded overflow-hidden flex-shrink-0 bg-black">
                              <img src={getYouTubeThumbnail(video.youtubeId)} alt={video.title} className="w-full h-full object-cover"
                                onError={e => { const t = e.target as HTMLImageElement; if (t.src.includes("maxresdefault")) t.src = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`; }} />
                            </div>
                            <p className="text-xs truncate flex-1" style={{ color: textColor }}>{video.title}</p>
                            <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.85 }}
                              onClick={() => onRemoveVideo(video.id)}
                              className="flex-shrink-0 w-6 h-6 rounded bg-red-500/10 flex items-center justify-center text-red-400 hover:bg-red-500/25 transition-all">
                              <Trash2 className="w-3 h-3" />
                            </motion.button>
                          </div>
                        ))}
                      </motion.div>
                    );
                  })}

                  {/* General Videos */}
                  <AnimatePresence>
                    {generalVideos.map((video, i) => (
                      <motion.div key={video.id} layout
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50, scale: 0.8, transition: { duration: 0.3 } }}
                        transition={{ delay: (collections.length + i) * 0.05 }}
                        className="group flex items-center gap-3 p-2.5 sm:p-3 rounded-xl transition-all duration-300"
                        style={{ background: itemBg, border: `1px solid ${itemBorder}` }}>
                        <div className="w-16 h-10 sm:w-20 sm:h-12 rounded-lg overflow-hidden flex-shrink-0 bg-black">
                          <img src={getYouTubeThumbnail(video.youtubeId)} alt={video.title} className="w-full h-full object-cover"
                            onError={e => { const t = e.target as HTMLImageElement; if (t.src.includes("maxresdefault")) t.src = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`; }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: textColor }}>{video.title}</p>
                        </div>
                        <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.85 }}
                          onClick={() => onRemoveVideo(video.id)}
                          className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/25 hover:text-red-300 transition-all duration-200">
                          <Trash2 className="w-3.5 h-3.5" />
                        </motion.button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
