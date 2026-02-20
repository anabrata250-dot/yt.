import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Link, Type, Sparkles, Check, AlertCircle, X, Radio, FolderPlus, Trash2 } from "lucide-react";
import { extractYouTubeId } from "../data/videos";
import { useTheme } from "../App";

interface VideoEntry { url: string; title: string; }

interface AddVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddVideo: (youtubeId: string, title: string, collectionId?: string) => void;
  onCreateCollection: (name: string, videos: { youtubeId: string; title: string }[]) => void;
  collections: { id: string; name: string }[];
}

export function AddVideoModal({ isOpen, onClose, onAddVideo, onCreateCollection, collections }: AddVideoModalProps) {
  const { isDark } = useTheme();
  const [mode, setMode] = useState<"single" | "collection">("single");

  // Single mode
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [selectedCollection, setSelectedCollection] = useState<string>("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Collection mode
  const [collectionName, setCollectionName] = useState("");
  const [collectionVideos, setCollectionVideos] = useState<VideoEntry[]>([{ url: "", title: "" }, { url: "", title: "" }]);
  const [collError, setCollError] = useState("");
  const [collSuccess, setCollSuccess] = useState(false);

  const handleSubmitSingle = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!url.trim()) { setError("Please enter a YouTube URL"); return; }
    if (!title.trim()) { setError("Please enter a title"); return; }
    const youtubeId = extractYouTubeId(url.trim());
    if (!youtubeId) { setError("Invalid URL. Supports: youtube.com, youtu.be, shorts & live links"); return; }
    onAddVideo(youtubeId, title.trim(), selectedCollection || undefined);
    setUrl(""); setTitle(""); setSelectedCollection(""); setSuccess(true);
    setTimeout(() => { setSuccess(false); onClose(); }, 800);
  };

  const handleSubmitCollection = (e: React.FormEvent) => {
    e.preventDefault();
    setCollError("");
    if (!collectionName.trim()) { setCollError("Please enter a collection name"); return; }
    const validVideos: { youtubeId: string; title: string }[] = [];
    for (const v of collectionVideos) {
      if (!v.url.trim() && !v.title.trim()) continue;
      if (!v.url.trim()) { setCollError("Please fill in all video URLs"); return; }
      if (!v.title.trim()) { setCollError("Please fill in all video titles"); return; }
      const id = extractYouTubeId(v.url.trim());
      if (!id) { setCollError(`Invalid URL: ${v.url.slice(0, 40)}...`); return; }
      validVideos.push({ youtubeId: id, title: v.title.trim() });
    }
    if (validVideos.length === 0) { setCollError("Add at least one video"); return; }
    onCreateCollection(collectionName.trim(), validVideos);
    setCollectionName(""); setCollectionVideos([{ url: "", title: "" }, { url: "", title: "" }]);
    setCollSuccess(true);
    setTimeout(() => { setCollSuccess(false); onClose(); }, 800);
  };

  const addVideoSlot = () => setCollectionVideos(prev => [...prev, { url: "", title: "" }]);
  const removeVideoSlot = (i: number) => setCollectionVideos(prev => prev.filter((_, idx) => idx !== i));
  const updateVideoSlot = (i: number, field: "url" | "title", val: string) => {
    setCollectionVideos(prev => prev.map((v, idx) => idx === i ? { ...v, [field]: val } : v));
    setCollError("");
  };

  const handleBackdropClick = () => {
    setUrl(""); setTitle(""); setError(""); setSuccess(false);
    setCollectionName(""); setCollectionVideos([{ url: "", title: "" }, { url: "", title: "" }]);
    setCollError(""); setCollSuccess(false); setMode("single"); setSelectedCollection("");
    onClose();
  };

  const modalBg = isDark ? "rgba(22,27,38,0.97)" : "rgba(255,255,255,0.98)";
  const inputBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
  const inputBorder = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
  const textColor = isDark ? "#ffffff" : "#1a1a2e";
  const subTextColor = isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.45)";
  const labelColor = isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={handleBackdropClick}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-xl" />
          <motion.div initial={{ opacity: 0, y: 100, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }} onClick={e => e.stopPropagation()} className="relative w-full sm:max-w-lg z-10 max-h-[90vh] sm:max-h-[85vh] overflow-hidden">
            <div className="relative backdrop-blur-2xl rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col" style={{ background: modalBg, border: `1px solid ${inputBorder}`, maxHeight: "90vh" }}>
              <div className="h-1 bg-gradient-to-r from-red-600 via-orange-500 to-red-600 flex-shrink-0" />
              <div className="sm:hidden flex justify-center pt-3 flex-shrink-0"><div className="w-10 h-1 rounded-full" style={{ background: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)" }} /></div>

              {/* Header */}
              <div className="relative px-5 sm:px-8 pt-4 sm:pt-6 pb-3 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <motion.div initial={{ rotate: -180, scale: 0 }} animate={{ rotate: 0, scale: 1 }} transition={{ delay: 0.2, type: "spring" }}
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/30">
                    <Plus className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold font-display" style={{ color: textColor }}>Add Video</h2>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Radio className="w-3 h-3 text-green-400" />
                      <span className="text-[10px] sm:text-xs" style={{ color: subTextColor }}>Supports live & regular videos</span>
                    </div>
                  </div>
                </div>
                <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} onClick={handleBackdropClick}
                  className="p-2 rounded-xl transition-all" style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: subTextColor }}>
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Mode Toggle */}
              <div className="px-5 sm:px-8 pb-3 flex-shrink-0">
                <div className="flex rounded-xl overflow-hidden" style={{ background: inputBg, border: `1px solid ${inputBorder}` }}>
                  <button onClick={() => setMode("single")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-all ${mode === "single" ? "bg-gradient-to-r from-red-600 to-orange-500 text-white" : ""}`}
                    style={mode !== "single" ? { color: subTextColor } : {}}>
                    <Plus className="w-4 h-4" />Single Video
                  </button>
                  <button onClick={() => setMode("collection")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-all ${mode === "collection" ? "bg-gradient-to-r from-red-600 to-orange-500 text-white" : ""}`}
                    style={mode !== "collection" ? { color: subTextColor } : {}}>
                    <FolderPlus className="w-4 h-4" />Collection
                  </button>
                </div>
              </div>

              {/* Scrollable content */}
              <div className="overflow-y-auto flex-1 px-5 sm:px-8 pb-6 sm:pb-8" style={{ scrollbarWidth: "none" }}>
                <AnimatePresence mode="wait">
                  {mode === "single" ? (
                    <motion.form key="single" onSubmit={handleSubmitSingle} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }} className="space-y-4">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium mb-2" style={{ color: labelColor }}>
                          <Link className="w-4 h-4 text-red-400" />YouTube URL
                        </label>
                        <input type="text" value={url} onChange={e => { setUrl(e.target.value); setError(""); }}
                          placeholder="youtube.com/watch?v=... or /live/..."
                          className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all"
                          style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: textColor }} autoFocus />
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium mb-2" style={{ color: labelColor }}>
                          <Type className="w-4 h-4 text-orange-400" />Title
                        </label>
                        <input type="text" value={title} onChange={e => { setTitle(e.target.value); setError(""); }}
                          placeholder="Enter video title..."
                          className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all"
                          style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: textColor }} />
                      </div>

                      {/* Collection selector */}
                      {collections.length > 0 && (
                        <div>
                          <label className="flex items-center gap-2 text-sm font-medium mb-2" style={{ color: labelColor }}>
                            <FolderPlus className="w-4 h-4 text-purple-400" />Add to Collection (optional)
                          </label>
                          <select value={selectedCollection} onChange={e => setSelectedCollection(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all appearance-none"
                            style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: textColor }}>
                            <option value="">No collection (General)</option>
                            {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        </div>
                      )}

                      <AnimatePresence>
                        {error && (
                          <motion.div initial={{ opacity: 0, y: -10, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0, y: -10, height: 0 }}
                            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
                          </motion.div>
                        )}
                        {success && (
                          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                            <Check className="w-4 h-4" />Added!
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <motion.button type="submit" whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
                        className="w-full relative group flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-500 to-orange-500 text-white font-bold text-base shadow-xl shadow-red-500/20 hover:shadow-red-500/40 transition-all overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-rose-500 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <Sparkles className="w-5 h-5 relative" /><span className="relative">Add to ANAty</span>
                      </motion.button>
                    </motion.form>
                  ) : (
                    <motion.form key="collection" onSubmit={handleSubmitCollection} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.2 }} className="space-y-4">
                      {/* Collection Name */}
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium mb-2" style={{ color: labelColor }}>
                          <FolderPlus className="w-4 h-4 text-purple-400" />Collection Name
                        </label>
                        <input type="text" value={collectionName} onChange={e => { setCollectionName(e.target.value); setCollError(""); }}
                          placeholder="e.g. Music Playlist, Tutorials..."
                          className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all"
                          style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: textColor }} autoFocus />
                      </div>

                      {/* Video Slots */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium" style={{ color: labelColor }}>Videos ({collectionVideos.length})</label>
                          <motion.button type="button" onClick={addVideoSlot} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-sm">
                            <Plus className="w-3.5 h-3.5" />Add More
                          </motion.button>
                        </div>

                        <AnimatePresence>
                          {collectionVideos.map((v, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, x: -50, scale: 0.8 }} transition={{ duration: 0.25, delay: i * 0.05 }}
                              className="relative rounded-xl p-3 space-y-2" style={{ background: inputBg, border: `1px solid ${inputBorder}` }}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-red-600/20 to-orange-500/20" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>
                                  Video {i + 1}
                                </span>
                                {collectionVideos.length > 1 && (
                                  <motion.button type="button" onClick={() => removeVideoSlot(i)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.85 }}
                                    className="w-6 h-6 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 transition-colors">
                                    <Trash2 className="w-3 h-3" />
                                  </motion.button>
                                )}
                              </div>
                              <input type="text" value={v.url} onChange={e => updateVideoSlot(i, "url", e.target.value)}
                                placeholder="YouTube URL..."
                                className="w-full px-3 py-2 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-red-500/30 transition-all"
                                style={{ background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`, color: textColor }} />
                              <input type="text" value={v.title} onChange={e => updateVideoSlot(i, "title", e.target.value)}
                                placeholder="Video title..."
                                className="w-full px-3 py-2 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-orange-500/30 transition-all"
                                style={{ background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`, color: textColor }} />
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>

                      <AnimatePresence>
                        {collError && (
                          <motion.div initial={{ opacity: 0, y: -10, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0, y: -10, height: 0 }}
                            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />{collError}
                          </motion.div>
                        )}
                        {collSuccess && (
                          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                            <Check className="w-4 h-4" />Collection Created!
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <motion.button type="submit" whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
                        className="w-full relative group flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-red-500 to-orange-500 text-white font-bold text-base shadow-xl shadow-purple-500/20 hover:shadow-purple-500/40 transition-all overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-red-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <FolderPlus className="w-5 h-5 relative" /><span className="relative">Create Collection</span>
                      </motion.button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
