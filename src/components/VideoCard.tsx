import { useState } from "react";
import { motion } from "framer-motion";
import { Video, getYouTubeThumbnail } from "../data/videos";
import { useTheme } from "../App";

interface VideoCardProps {
  video: Video;
  index: number;
  onClick: (video: Video) => void;
}

function AnimatedTitle({ title, isDark }: { title: string; isDark: boolean }) {
  const displayTitle = title.length > 60 ? title.slice(0, 57) + "..." : title;
  const words = displayTitle.split(" ");
  return (
    <div className="flex flex-wrap gap-x-1.5 gap-y-0.5">
      {words.map((word, wi) => (
        <span key={wi} className="inline-flex">
          {word.split("").map((char, ci) => (
            <motion.span
              key={`${wi}-${ci}`}
              className="inline-block font-semibold text-sm sm:text-base transition-colors duration-300"
              style={{ color: isDark ? '#ffffff' : '#1f2937' }}
              initial={{ opacity: 0, y: 12, rotateX: 90, scale: 0.5 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
              viewport={{ once: true, margin: "-20px" }}
              transition={{ delay: 0.1 + wi * 0.05 + ci * 0.02, type: "spring", stiffness: 200, damping: 15 }}
              whileHover={{ scale: 1.25, color: "#f97316", y: -3, transition: { duration: 0.1 } }}
            >
              {char}
            </motion.span>
          ))}
        </span>
      ))}
    </div>
  );
}

export function VideoCard({ video, index, onClick }: VideoCardProps) {
  const { isDark } = useTheme();
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const thumbnail = getYouTubeThumbnail(video.youtubeId);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 60, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, y: -30, transition: { duration: 0.4 } }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(video)}
      className="group relative cursor-pointer"
    >
      {/* Glow */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-orange-500 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-50 blur-lg transition-all duration-500" />

      <div
        className="relative rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-500"
        style={{
          background: isDark ? '#1a2030' : '#ffffff',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)',
          boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.35)' : '0 2px 16px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden" style={{ background: isDark ? '#151c2a' : '#f0f1f5' }}>
          {!imgLoaded && !imgError && (
            <div className="absolute inset-0 animate-pulse" style={{ background: isDark ? '#1e2838' : '#e8eaf0' }}>
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" style={{ animation: "shimmer 1.5s ease-in-out infinite" }} />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-10 h-10" style={{ color: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }} viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
              </div>
            </div>
          )}
          <img
            src={imgError ? `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg` : thumbnail}
            alt={video.title}
            className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            onError={() => { if (!imgError) { setImgError(true); setImgLoaded(false); } else setImgLoaded(true); }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <motion.div initial={false} whileHover={{ scale: 1.15 }}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-red-600/80 backdrop-blur-sm flex items-center justify-center shadow-xl shadow-red-500/30">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
            </motion.div>
          </div>
        </div>

        {/* Title */}
        <div className="p-3 sm:p-4">
          <AnimatedTitle title={video.title} isDark={isDark} />
        </div>

        {/* Bottom accent */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-600 to-orange-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
      </div>
    </motion.div>
  );
}
