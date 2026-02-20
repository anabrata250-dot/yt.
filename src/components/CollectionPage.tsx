import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, FolderOpen, Play } from "lucide-react";
import { Video, Collection } from "../data/videos";
import { VideoCard } from "./VideoCard";
import { useTheme } from "../App";

interface CollectionPageProps {
  collection: Collection;
  videos: Video[];
  onBack: () => void;
  onVideoClick: (video: Video) => void;
}

export function CollectionPage({ collection, videos, onBack, onVideoClick }: CollectionPageProps) {
  const { isDark } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
      className="min-h-screen pb-20"
    >
      {/* Header */}
      <div className="relative pt-24 sm:pt-28 pb-8 sm:pb-12 px-4 sm:px-6">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-20"
            style={{
              background: "radial-gradient(ellipse, rgba(168,85,247,0.4) 0%, transparent 70%)",
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto relative">
          {/* Back button */}
          <motion.button
            onClick={onBack}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="group flex items-center gap-2 mb-6 sm:mb-8 px-4 py-2.5 rounded-xl transition-all duration-300"
            style={{
              background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
              border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}`,
              color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)",
            }}
          >
            <motion.div whileHover={{ x: -3 }} transition={{ type: "spring" }}>
              <ArrowLeft className="w-4 h-4" />
            </motion.div>
            <span className="text-sm font-medium">Back to Home</span>
          </motion.button>

          {/* Collection header */}
          <div className="flex items-start gap-4 sm:gap-5">
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
              className="w-14 h-14 sm:w-18 sm:h-18 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, rgba(168,85,247,0.2), rgba(236,72,153,0.2))",
                border: `1px solid ${isDark ? "rgba(168,85,247,0.3)" : "rgba(168,85,247,0.2)"}`,
              }}
            >
              <FolderOpen className="w-7 h-7 sm:w-8 sm:h-8 text-purple-400" />
            </motion.div>

            <div className="flex-1 min-w-0">
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-2xl sm:text-3xl md:text-4xl font-black"
                style={{ color: isDark ? "#ffffff" : "#1a1a2e" }}
              >
                {collection.name.split("").map((char, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 30, rotateX: 90 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ delay: 0.25 + i * 0.03, type: "spring", stiffness: 150 }}
                    className="inline-block"
                    style={{ display: char === " " ? "inline" : "inline-block" }}
                  >
                    {char === " " ? "\u00A0" : char}
                  </motion.span>
                ))}
              </motion.h1>

              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="flex items-center gap-3 mt-2"
              >
                <div className="flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-sm" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>
                    {videos.length} video{videos.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="w-1 h-1 rounded-full" style={{ background: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)" }} />
                <span className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.35)" }}>
                  Collection
                </span>
              </motion.div>
            </div>
          </div>

          {/* Decorative line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-6 sm:mt-8 h-px origin-left"
            style={{
              background: `linear-gradient(to right, rgba(168,85,247,0.3), rgba(236,72,153,0.2), transparent)`,
            }}
          />
        </div>
      </div>

      {/* Videos grid */}
      <div className="px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {videos.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <FolderOpen className="w-16 h-16 mx-auto mb-4" style={{ color: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }} />
              <p style={{ color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)" }}>This collection is empty</p>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {videos.map((video, index) => (
                  <VideoCard key={video.id} video={video} index={index} onClick={onVideoClick} />
                ))}
              </div>
            </AnimatePresence>
          )}

          {/* Bottom stats */}
          {videos.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 + videos.length * 0.08 }}
              className="mt-12 sm:mt-16 text-center"
            >
              <div className="inline-flex items-center gap-3 text-xs sm:text-sm" style={{ color: isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.3)" }}>
                <div className="w-8 sm:w-12 h-px" style={{ background: isDark ? "rgba(168,85,247,0.2)" : "rgba(168,85,247,0.15)" }} />
                <span>{videos.length} video{videos.length !== 1 ? "s" : ""} in {collection.name}</span>
                <div className="w-8 sm:w-12 h-px" style={{ background: isDark ? "rgba(168,85,247,0.2)" : "rgba(168,85,247,0.15)" }} />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
