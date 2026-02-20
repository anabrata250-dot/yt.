import { forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Video, Collection } from "../data/videos";
import { VideoCard } from "./VideoCard";
import { Film, ChevronRight, FolderOpen, Play } from "lucide-react";
import { useTheme } from "../App";

interface VideoGridProps {
  videos: Video[];
  collections: Collection[];
  onVideoClick: (video: Video) => void;
  onOpenCollection: (collectionId: string) => void;
}

function CollectionFolder({
  collection,
  videoCount,
  firstThumbnails,
  onClick,
  isDark,
  index,
}: {
  collection: Collection;
  videoCount: number;
  firstThumbnails: string[];
  onClick: () => void;
  isDark: boolean;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group relative cursor-pointer"
    >
      {/* Glow */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-40 blur-lg transition-all duration-500" />

      <div
        className="relative rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-500"
        style={{
          background: isDark ? "#1a2030" : "#ffffff",
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: isDark ? "rgba(168,85,247,0.15)" : "rgba(168,85,247,0.12)",
          boxShadow: isDark
            ? "0 4px 24px rgba(0,0,0,0.35)"
            : "0 2px 16px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        {/* Thumbnail grid preview */}
        <div className="relative aspect-video overflow-hidden" style={{ background: isDark ? "#151c2a" : "#f0f1f5" }}>
          <div className="absolute inset-0 grid grid-cols-2 gap-0.5 p-0.5">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="relative overflow-hidden rounded-sm" style={{ background: isDark ? "#1e2838" : "#e8eaf0" }}>
                {firstThumbnails[i] ? (
                  <img
                    src={firstThumbnails[i]}
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                      const t = e.target as HTMLImageElement;
                      if (t.src.includes("maxresdefault")) t.src = t.src.replace("maxresdefault", "hqdefault");
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Play className="w-4 h-4" style={{ color: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" }} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-purple-600/0 group-hover:bg-purple-600/10 transition-colors duration-500" />

          {/* Folder icon center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center backdrop-blur-md border"
              style={{
                background: "rgba(168,85,247,0.2)",
                borderColor: "rgba(168,85,247,0.3)",
              }}
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <FolderOpen className="w-7 h-7 sm:w-8 sm:h-8 text-purple-300" />
            </motion.div>
          </div>

          {/* Video count badge */}
          <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10">
            <span className="text-white text-xs font-semibold">{videoCount} videos</span>
          </div>
        </div>

        {/* Title */}
        <div className="p-3 sm:p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <FolderOpen className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <span
              className="font-semibold text-sm sm:text-base truncate"
              style={{ color: isDark ? "#ffffff" : "#1f2937" }}
            >
              {collection.name}
            </span>
          </div>
          <motion.div
            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: isDark ? "rgba(168,85,247,0.1)" : "rgba(168,85,247,0.08)",
            }}
            whileHover={{ x: 3 }}
          >
            <ChevronRight className="w-4 h-4 text-purple-400" />
          </motion.div>
        </div>

        {/* Bottom accent */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
      </div>
    </motion.div>
  );
}

export const VideoGrid = forwardRef<HTMLElement, VideoGridProps>(
  ({ videos, collections, onVideoClick, onOpenCollection }, ref) => {
    const { isDark } = useTheme();

    const generalVideos = videos.filter((v) => !v.collectionId);
    const collectionMap = new Map<string, Video[]>();
    for (const v of videos) {
      if (v.collectionId) {
        const arr = collectionMap.get(v.collectionId) || [];
        arr.push(v);
        collectionMap.set(v.collectionId, arr);
      }
    }

    const hasAnyVideos = videos.length > 0;
    const hasCollections = collections.some((c) => (collectionMap.get(c.id) || []).length > 0);

    return (
      <section ref={ref} className="relative py-8 sm:py-16 px-4 sm:px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-red-600/30 to-transparent" />
        <div className="max-w-7xl mx-auto">
          {!hasAnyVideos ? (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-center py-16 sm:py-24"
            >
              <motion.div
                animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 rounded-3xl flex items-center justify-center"
                style={{
                  background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                  border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}`,
                }}
              >
                <Film
                  className="w-10 h-10 sm:w-12 sm:h-12"
                  style={{ color: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)" }}
                />
              </motion.div>
              <p className="text-base sm:text-lg mb-2" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)" }}>
                No videos yet
              </p>
              <p className="text-xs sm:text-sm" style={{ color: isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.3)" }}>
                Tap the <span className="text-red-400 font-semibold">+</span> button to add videos
              </p>
            </motion.div>
          ) : (
            <>
              {/* Collections as clickable folders */}
              {hasCollections && (
                <div className="mb-8 sm:mb-12">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-3 mb-4 sm:mb-6"
                  >
                    <FolderOpen className="w-5 h-5" style={{ color: isDark ? "rgba(168,85,247,0.6)" : "rgba(168,85,247,0.5)" }} />
                    <span className="text-sm font-semibold" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>
                      Collections
                    </span>
                    <div className="flex-1 h-px" style={{ background: isDark ? "rgba(168,85,247,0.15)" : "rgba(168,85,247,0.1)" }} />
                  </motion.div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                    {collections.map((collection, i) => {
                      const collVideos = collectionMap.get(collection.id) || [];
                      if (collVideos.length === 0) return null;
                      const thumbnails = collVideos
                        .slice(0, 4)
                        .map((v) => `https://img.youtube.com/vi/${v.youtubeId}/mqdefault.jpg`);
                      return (
                        <CollectionFolder
                          key={collection.id}
                          collection={collection}
                          videoCount={collVideos.length}
                          firstThumbnails={thumbnails}
                          onClick={() => onOpenCollection(collection.id)}
                          isDark={isDark}
                          index={i}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* General Videos */}
              {generalVideos.length > 0 && (
                <div className="mb-8 sm:mb-12">
                  {hasCollections && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="flex items-center gap-3 mb-4 sm:mb-6"
                    >
                      <Play className="w-5 h-5" style={{ color: isDark ? "rgba(239,68,68,0.6)" : "rgba(239,68,68,0.5)" }} />
                      <span className="text-sm font-semibold" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>
                        Videos
                      </span>
                      <div className="flex-1 h-px" style={{ background: isDark ? "rgba(239,68,68,0.15)" : "rgba(239,68,68,0.1)" }} />
                    </motion.div>
                  )}

                  <AnimatePresence mode="popLayout">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                      {generalVideos.map((video, index) => (
                        <VideoCard key={video.id} video={video} index={index} onClick={onVideoClick} />
                      ))}
                    </div>
                  </AnimatePresence>
                </div>
              )}

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 1 }}
                className="mt-10 sm:mt-16 text-center"
              >
                <div
                  className="inline-flex items-center gap-3 text-xs sm:text-sm"
                  style={{ color: isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.3)" }}
                >
                  <div className="w-8 sm:w-12 h-px" style={{ background: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)" }} />
                  <span>
                    {videos.length} video{videos.length !== 1 ? "s" : ""}
                    {collections.length > 0
                      ? ` • ${collections.length} collection${collections.length !== 1 ? "s" : ""}`
                      : ""}
                  </span>
                  <div className="w-8 sm:w-12 h-px" style={{ background: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)" }} />
                </div>
              </motion.div>
            </>
          )}
        </div>
      </section>
    );
  }
);
VideoGrid.displayName = "VideoGrid";
