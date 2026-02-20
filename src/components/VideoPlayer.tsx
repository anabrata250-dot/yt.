/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Video, getYouTubeThumbnail } from "../data/videos";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}

interface Props {
  video: Video;
  onClose: () => void;
}

const SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
const Q_LABELS: Record<string, string> = {
  hd2160: "2160p 4K", hd1440: "1440p", hd1080: "1080p", hd720: "720p",
  large: "480p", medium: "360p", small: "240p", tiny: "144p", auto: "Auto",
};

function fmt(s: number): string {
  if (!s || isNaN(s)) return "0:00";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sc = Math.floor(s % 60);
  return h > 0
    ? `${h}:${m.toString().padStart(2, "0")}:${sc.toString().padStart(2, "0")}`
    : `${m}:${sc.toString().padStart(2, "0")}`;
}

export function VideoPlayer({ video, onClose }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const tickRef = useRef<number>(0);
  const hideRef = useRef<number>(0);
  const coverRef = useRef<number>(0);
  const firstPlay = useRef(false);
  const settingsOpenRef = useRef(false);

  const [cover, setCover] = useState(true);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [ended, setEnded] = useState(false);
  const [time, setTime] = useState(0);
  const [dur, setDur] = useState(0);
  const [buf, setBuf] = useState(0);
  const [vol, setVol] = useState(80);
  const [muted, setMuted] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [quality, setQuality] = useState("auto");
  const [qualities, setQualities] = useState<string[]>([]);
  const [controls, setControls] = useState(true);
  const [settings, setSettings] = useState(false);
  const [settingsPage, setSettingsPage] = useState<"main" | "speed" | "quality">("main");
  const [fs, setFs] = useState(false);
  const [drag, setDrag] = useState(false);
  const [hoverProg, setHoverProg] = useState<number | null>(null);
  const [volSlider, setVolSlider] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const [dtap, setDtap] = useState<{ side: "l" | "r"; k: number } | null>(null);

  const lastTap = useRef<{ t: number; s: "l" | "r" | null }>({ t: 0, s: null });
  const thumb = getYouTubeThumbnail(video.youtubeId);

  useEffect(() => { settingsOpenRef.current = settings; }, [settings]);

  const showNow = useCallback(() => {
    setControls(true);
    if (hideRef.current) clearTimeout(hideRef.current);
    hideRef.current = window.setTimeout(() => {
      if (!settingsOpenRef.current) setControls(false);
    }, 2000);
  }, []);

  /* ═══════════════════════════════════════════════════════
     YOUTUBE PLAYER — controls: 0
     
     With controls: 0, YouTube renders ZERO UI:
     - No suggestions when paused
     - No "More Videos" overlay
     - No bottom control bar
     - No top title bar
     - Nothing at all
     
     The iframe is exactly 100% size — no zoom, no crop.
     pointer-events: none ALWAYS — user never touches iframe.
     Real pauseVideo() for perfect frame freeze.
     ═══════════════════════════════════════════════════════ */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const make = () => {
      const el = document.getElementById("yt-frame");
      if (!el || playerRef.current) return;
      playerRef.current = new window.YT.Player("yt-frame", {
        host: "https://www.youtube-nocookie.com",
        videoId: video.youtubeId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          enablejsapi: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          showinfo: 0,
          cc_load_policy: 0,
          autohide: 1,
          origin: window.location.origin,
          widget_referrer: window.location.origin,
        },
        events: {
          onReady: (e: any) => {
            setReady(true);
            setDur(e.target.getDuration() || 0);
            e.target.setVolume(80);
            e.target.playVideo();
            tickRef.current = window.setInterval(() => {
              if (!playerRef.current) return;
              try {
                const t = playerRef.current.getCurrentTime() || 0;
                const d = playerRef.current.getDuration() || 0;
                setTime(t);
                setBuf(playerRef.current.getVideoLoadedFraction() || 0);
                if (d > 0) setDur(d);
                const q = playerRef.current.getAvailableQualityLevels();
                if (q?.length) setQualities(q);
              } catch { /* destroyed */ }
            }, 250);
          },
          onStateChange: (e: any) => {
            if (e.data === 1) {
              if (!firstPlay.current) {
                firstPlay.current = true;
                coverRef.current = window.setTimeout(() => setCover(false), 2000);
              }
              setPlaying(true);
              setPaused(false);
              setEnded(false);
            } else if (e.data === 2) {
              setPlaying(false);
              setPaused(true);
            } else if (e.data === 0) {
              setPlaying(false);
              setPaused(false);
              setEnded(true);
            }
          },
        },
      });
    };

    if (window.YT?.Player) setTimeout(make, 100);
    else {
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const s = document.createElement("script");
        s.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(s);
      }
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => { prev?.(); make(); };
    }

    return () => {
      document.body.style.overflow = "";
      if (tickRef.current) clearInterval(tickRef.current);
      if (hideRef.current) clearTimeout(hideRef.current);
      if (coverRef.current) clearTimeout(coverRef.current);
      try { playerRef.current?.destroy(); } catch { /* */ }
      playerRef.current = null;
    };
  }, [video.youtubeId]);

  // Fullscreen
  useEffect(() => {
    const h = () => setFs(!!(document.fullscreenElement || (document as any).webkitFullscreenElement));
    document.addEventListener("fullscreenchange", h);
    document.addEventListener("webkitfullscreenchange", h);
    return () => { document.removeEventListener("fullscreenchange", h); document.removeEventListener("webkitfullscreenchange", h); };
  }, []);

  // Keyboard
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (!playerRef.current) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      showNow();
      const k = e.key.toLowerCase();
      if (/^[0-9]$/.test(k) && dur > 0) { e.preventDefault(); seek((parseInt(k) / 10) * dur); return; }
      switch (k) {
        case " ": case "k": e.preventDefault(); toggle(); break;
        case "j": case "arrowleft": e.preventDefault(); skip(-10); break;
        case "l": case "arrowright": e.preventDefault(); skip(10); break;
        case "arrowup": e.preventDefault(); chVol(Math.min(100, vol + 5)); break;
        case "arrowdown": e.preventDefault(); chVol(Math.max(0, vol - 5)); break;
        case "m": togMute(); break;
        case "f": togFS(); break;
        case "escape":
          if (document.fullscreenElement || (document as any).webkitFullscreenElement)
            (document.exitFullscreen || (document as any).webkitExitFullscreen)?.call(document);
          else onClose();
          break;
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [vol, dur, showNow]);

  // Mouse drag
  useEffect(() => {
    if (!drag) return;
    const m = (e: MouseEvent) => {
      const b = document.getElementById("pb"); if (!b) return;
      const r = b.getBoundingClientRect();
      setTime(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * dur);
    };
    const u = (e: MouseEvent) => {
      const b = document.getElementById("pb"); if (!b) return;
      const r = b.getBoundingClientRect();
      seek(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * dur);
      setDrag(false);
    };
    window.addEventListener("mousemove", m);
    window.addEventListener("mouseup", u);
    return () => { window.removeEventListener("mousemove", m); window.removeEventListener("mouseup", u); };
  }, [drag, dur]);

  // Touch drag
  useEffect(() => {
    if (!drag) return;
    const m = (e: TouchEvent) => {
      const b = document.getElementById("pb"); if (!b || !e.touches[0]) return;
      const r = b.getBoundingClientRect();
      setTime(Math.max(0, Math.min(1, (e.touches[0].clientX - r.left) / r.width)) * dur);
    };
    const u = (e: TouchEvent) => {
      const b = document.getElementById("pb"); if (!b) return;
      const t = e.changedTouches[0]; if (!t) return;
      const r = b.getBoundingClientRect();
      seek(Math.max(0, Math.min(1, (t.clientX - r.left) / r.width)) * dur);
      setDrag(false);
    };
    window.addEventListener("touchmove", m, { passive: true });
    window.addEventListener("touchend", u);
    return () => { window.removeEventListener("touchmove", m); window.removeEventListener("touchend", u); };
  }, [drag, dur]);

  // ===== ACTIONS =====
  const seek = (t: number) => { playerRef.current?.seekTo(t, true); setTime(t); };
  const skip = (s: number) => {
    const c = playerRef.current?.getCurrentTime() || 0;
    seek(Math.max(0, Math.min(dur, c + s)));
    showNow();
  };
  const toggle = () => {
    if (!playerRef.current) return;
    if (ended) { replay(); return; }
    if (playing) {
      playerRef.current.pauseVideo();
      doFlash("pause");
    } else {
      playerRef.current.playVideo();
      doFlash("play");
    }
    showNow();
  };
  const chVol = (v: number) => {
    setVol(v); setMuted(v === 0);
    playerRef.current?.setVolume(v);
    if (v > 0) playerRef.current?.unMute();
  };
  const togMute = () => {
    if (muted) { setMuted(false); playerRef.current?.unMute(); playerRef.current?.setVolume(vol || 80); }
    else { setMuted(true); playerRef.current?.mute(); }
  };
  const chSpeed = (s: number) => { setSpeed(s); playerRef.current?.setPlaybackRate(s); setSettingsPage("main"); };
  const chQuality = (q: string) => { playerRef.current?.setPlaybackQuality(q); setQuality(q); setSettingsPage("main"); };
  const togFS = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement || (document as any).webkitFullscreenElement)
      (document.exitFullscreen || (document as any).webkitExitFullscreen)?.call(document);
    else (containerRef.current.requestFullscreen || (containerRef.current as any).webkitRequestFullscreen)?.call(containerRef.current);
  };
  const doFlash = (i: string) => { setFlash(i); setTimeout(() => setFlash(null), 600); };
  const replay = () => {
    setEnded(false);
    seek(0);
    playerRef.current?.playVideo();
    setPlaying(true);
    setPaused(false);
  };

  const onBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    seek(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * dur);
  };
  const onBarTouch = (e: React.TouchEvent<HTMLDivElement>) => {
    const t = e.touches[0]; if (!t) return;
    const r = e.currentTarget.getBoundingClientRect();
    seek(Math.max(0, Math.min(1, (t.clientX - r.left) / r.width)) * dur);
    setDrag(true);
  };

  // Tap handler for play/pause and double-tap seek
  const onTap = (e: React.MouseEvent | React.TouchEvent) => {
    const rect = containerRef.current?.getBoundingClientRect(); if (!rect) return;
    let cx: number;
    if ("touches" in e) cx = e.changedTouches?.[0]?.clientX ?? rect.width / 2;
    else cx = e.clientX;
    const side = (cx - rect.left) < rect.width / 2 ? "l" : "r";
    const now = Date.now();
    if (now - lastTap.current.t < 300 && lastTap.current.s === side) {
      e.preventDefault();
      if (side === "l") { skip(-10); setDtap({ side: "l", k: now }); }
      else { skip(10); setDtap({ side: "r", k: now }); }
      setTimeout(() => setDtap(null), 500);
      lastTap.current = { t: 0, s: null };
    } else {
      lastTap.current = { t: now, s: side };
      setTimeout(() => { if (lastTap.current.t === now) { toggle(); lastTap.current = { t: 0, s: null }; } }, 300);
    }
    showNow();
  };

  useEffect(() => { if (!controls) { setSettings(false); setSettingsPage("main"); } }, [controls]);

  const prog = dur > 0 ? time / dur : 0;

  return (
    <motion.div ref={containerRef}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black select-none"
      onMouseMove={showNow} onTouchStart={showNow}
      style={{ cursor: controls ? "default" : "none" }}>

      {/* ═══ IFRAME — exactly 100%, no zoom, no crop ═══
          pointer-events: none ALWAYS — user never touches iframe.
          With controls: 0, YouTube shows NOTHING when paused. */}
      <div className="absolute inset-0 bg-black">
        <div id="yt-frame"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* ═══ CLICK CAPTURE — full screen, always active ═══
          All clicks/taps go through our handler for play/pause/seek */}
      <div className="absolute inset-0 z-10"
        onClick={onTap}
        onTouchEnd={(e) => { e.preventDefault(); }}
      />

      {/* LOADING COVER */}
      {cover && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black"
          style={{ opacity: cover ? 1 : 0, transition: "opacity 0.8s ease" }}>
          <img src={thumb} alt="" className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: "blur(30px) brightness(0.15)", transform: "scale(1.2)" }} />
          <div className="relative z-10 flex flex-col items-center">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-white/10 border-t-red-500 rounded-full" />
            <motion.p animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }}
              className="text-white/30 text-[9px] mt-2">Loading</motion.p>
          </div>
        </div>
      )}

      {/* DOUBLE TAP INDICATOR */}
      <AnimatePresence>
        {dtap && (
          <motion.div key={dtap.k} initial={{ opacity: 0.8, scale: 0.6 }} animate={{ opacity: 0, scale: 1.4 }}
            exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
            className={`absolute top-1/2 -translate-y-1/2 z-20 pointer-events-none ${dtap.side === "l" ? "left-[20%]" : "right-[20%]"}`}>
            <div className="flex flex-col items-center gap-0.5">
              <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
                {dtap.side === "l"
                  ? <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 5V1l-5 5 5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6h-2c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" /></svg>
                  : <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12.01 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z" /></svg>}
              </div>
              <span className="text-white text-[8px] font-bold">10s</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CENTER FLASH */}
      <AnimatePresence>
        {flash && (
          <motion.div key={flash} initial={{ scale: 0.5, opacity: 0.8 }} animate={{ scale: 1.8, opacity: 0 }}
            exit={{ opacity: 0 }} transition={{ duration: 0.6 }}
            className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
            <div className="w-10 h-10 rounded-full bg-black/25 flex items-center justify-center">
              {flash === "play"
                ? <svg className="w-5 h-5 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                : <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ TOP BAR ═══ */}
      <AnimatePresence>
        {controls && ready && !cover && !ended && (
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 35 }}
            className="absolute top-0 left-0 right-0 z-30 pointer-events-none">
            <div className="flex items-center justify-between px-3 py-1.5"
              style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)" }}>
              <h2 className="text-white text-[11px] sm:text-xs font-medium truncate flex-1 mr-2">{video.title}</h2>
              <motion.button onClick={e => { e.stopPropagation(); onClose(); }}
                className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors pointer-events-auto"
                whileHover={{ rotate: 90 }} whileTap={{ scale: 0.8 }}>
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ CENTER PLAY BUTTON (when paused) ═══ */}
      <AnimatePresence>
        {paused && !ended && ready && !cover && controls && !settings && (
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.3, opacity: 0 }}
            transition={{ type: "spring", stiffness: 250, damping: 18 }}
            className="absolute inset-0 z-25 flex items-center justify-center pointer-events-none">
            <button onClick={(e) => { e.stopPropagation(); toggle(); }}
              className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center pointer-events-auto hover:bg-black/50 active:scale-90 transition-all shadow-xl">
              <svg className="w-6 h-6 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ BOTTOM CONTROLS ═══ */}
      <AnimatePresence>
        {controls && ready && !cover && !ended && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 35 }}
            className="absolute bottom-0 left-0 right-0 z-30 pointer-events-none">
            <div className="px-3 pb-2 pt-8"
              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)" }}>

              {/* Progress */}
              <div className="group relative mb-1.5 pointer-events-auto">
                {hoverProg !== null && (
                  <div className="absolute -top-5 -translate-x-1/2 bg-black/80 text-white text-[8px] px-1.5 py-0.5 rounded font-mono z-10"
                    style={{ left: `${hoverProg * 100}%` }}>{fmt(hoverProg * dur)}</div>
                )}
                <div id="pb" className="relative h-[3px] group-hover:h-[5px] transition-all cursor-pointer rounded-full bg-white/20"
                  style={{ touchAction: "none" }}
                  onClick={onBarClick}
                  onMouseDown={e => { setDrag(true); onBarClick(e); }}
                  onTouchStart={onBarTouch}
                  onMouseMove={e => { const r = e.currentTarget.getBoundingClientRect(); setHoverProg(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width))); }}
                  onMouseLeave={() => setHoverProg(null)}>
                  <div className="absolute inset-y-0 left-0 bg-white/10 rounded-full" style={{ width: `${buf * 100}%` }} />
                  <div className="absolute inset-y-0 left-0 bg-red-500 rounded-full" style={{ width: `${prog * 100}%` }} />
                  <div className="absolute top-1/2 w-[10px] h-[10px] bg-red-500 rounded-full shadow sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                    style={{ left: `${prog * 100}%`, transform: "translate(-50%,-50%)" }} />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-1">
                <motion.button onClick={e => { e.stopPropagation(); skip(-10); }} whileTap={{ scale: 0.8 }}
                  className="w-7 h-7 flex items-center justify-center text-white/70 hover:text-white rounded-full transition-colors pointer-events-auto">
                  <svg className="w-[14px] h-[14px]" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 5V1l-5 5 5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6h-2c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" /></svg>
                </motion.button>

                <motion.button onClick={e => { e.stopPropagation(); toggle(); }} whileTap={{ scale: 0.8 }}
                  className="w-8 h-8 flex items-center justify-center text-white bg-white/10 hover:bg-white/15 rounded-full transition-colors pointer-events-auto">
                  <AnimatePresence mode="wait">
                    {playing
                      ? <motion.svg key="p" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ duration: 0.1 }} className="w-[14px] h-[14px]" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></motion.svg>
                      : <motion.svg key="r" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ duration: 0.1 }} className="w-[14px] h-[14px] ml-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></motion.svg>}
                  </AnimatePresence>
                </motion.button>

                <motion.button onClick={e => { e.stopPropagation(); skip(10); }} whileTap={{ scale: 0.8 }}
                  className="w-7 h-7 flex items-center justify-center text-white/70 hover:text-white rounded-full transition-colors pointer-events-auto">
                  <svg className="w-[14px] h-[14px]" viewBox="0 0 24 24" fill="currentColor"><path d="M12.01 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z" /></svg>
                </motion.button>

                {/* Volume */}
                <div className="relative flex items-center pointer-events-auto" onMouseEnter={() => setVolSlider(true)} onMouseLeave={() => setVolSlider(false)}>
                  <motion.button whileTap={{ scale: 0.8 }}
                    onClick={e => { e.stopPropagation(); window.innerWidth < 640 ? setVolSlider(v => !v) : togMute(); }}
                    className="w-7 h-7 flex items-center justify-center text-white/70 hover:text-white rounded-full transition-colors">
                    {muted || vol === 0
                      ? <svg className="w-[14px] h-[14px]" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" /></svg>
                      : vol < 50
                        ? <svg className="w-[14px] h-[14px]" viewBox="0 0 24 24" fill="currentColor"><path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" /></svg>
                        : <svg className="w-[14px] h-[14px]" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" /></svg>}
                  </motion.button>
                  <AnimatePresence>
                    {volSlider && (
                      <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 50, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }} className="overflow-hidden flex items-center">
                        <input type="range" min={0} max={100} value={muted ? 0 : vol}
                          onChange={e => chVol(+e.target.value)}
                          onClick={e => e.stopPropagation()}
                          className="w-[46px] h-1 accent-red-500 cursor-pointer vol-slider" style={{ touchAction: "none" }} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <span className="text-white/50 text-[9px] font-mono ml-0.5 whitespace-nowrap pointer-events-none">
                  {fmt(time)}<span className="text-white/25 mx-0.5">/</span>{fmt(dur)}
                </span>

                <div className="flex-1" />

                {speed !== 1 && (
                  <span className="text-red-400 text-[8px] font-bold px-1 py-0.5 bg-red-500/10 rounded hidden sm:block pointer-events-none">{speed}x</span>
                )}

                <motion.button onClick={(e) => { e.stopPropagation(); setSettings(!settings); setSettingsPage("main"); }}
                  whileHover={{ rotate: 60 }} whileTap={{ scale: 0.8 }}
                  className="w-7 h-7 flex items-center justify-center text-white/70 hover:text-white rounded-full transition-colors pointer-events-auto">
                  <svg className="w-[13px] h-[13px]" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.488.488 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" /></svg>
                </motion.button>

                <motion.button onClick={e => { e.stopPropagation(); togFS(); }} whileTap={{ scale: 0.8 }}
                  className="w-7 h-7 flex items-center justify-center text-white/70 hover:text-white rounded-full transition-colors pointer-events-auto">
                  {fs
                    ? <svg className="w-[13px] h-[13px]" viewBox="0 0 24 24" fill="currentColor"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" /></svg>
                    : <svg className="w-[13px] h-[13px]" viewBox="0 0 24 24" fill="currentColor"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" /></svg>}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ SETTINGS PANEL ═══ */}
      <AnimatePresence>
        {settings && controls && !ended && (
          <motion.div initial={{ scale: 0.9, opacity: 0, y: 8 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 8 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="absolute bottom-14 right-3 z-40 w-[175px] sm:w-[195px] rounded-lg overflow-hidden shadow-2xl border bg-neutral-900/95 border-white/10 pointer-events-auto"
            onClick={e => e.stopPropagation()}>
            <AnimatePresence mode="wait">
              {settingsPage === "main" && (
                <motion.div key="m" initial={{ x: -15, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -15, opacity: 0 }} transition={{ duration: 0.1 }} className="p-1">
                  <button onClick={() => setSettingsPage("speed")} className="w-full flex items-center justify-between px-2.5 py-2 hover:bg-white/10 rounded-md transition-colors text-white text-[11px]">
                    <div className="flex items-center gap-2">
                      <svg className="w-3 h-3 text-white/40" viewBox="0 0 24 24" fill="currentColor"><path d="M20.38 8.57l-1.23 1.85a8 8 0 01-.22 7.58H5.07A8 8 0 0115.58 6.85l1.85-1.23A10 10 0 003.35 19a2 2 0 001.72 1h13.85a2 2 0 001.74-1 10 10 0 00-.27-10.44zm-9.79 6.84a2 2 0 002.83 0l5.66-8.49-8.49 5.66a2 2 0 000 2.83z" /></svg>
                      Speed
                    </div>
                    <span className="text-white/30 text-[9px]">{speed === 1 ? "Normal" : `${speed}x`} ›</span>
                  </button>
                  <button onClick={() => setSettingsPage("quality")} className="w-full flex items-center justify-between px-2.5 py-2 hover:bg-white/10 rounded-md transition-colors text-white text-[11px]">
                    <div className="flex items-center gap-2">
                      <svg className="w-3 h-3 text-white/40" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8 12H9.5v-2h-2v2H6V9h1.5v2.5h2V9H11v6zm7-1c0 .55-.45 1-1 1h-.75v1.5h-1.5V15H14c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v4zm-3.5-.5h2v-3h-2v3z" /></svg>
                      Quality
                    </div>
                    <span className="text-white/30 text-[9px]">{Q_LABELS[quality] || quality} ›</span>
                  </button>
                </motion.div>
              )}
              {settingsPage === "speed" && (
                <motion.div key="s" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }} transition={{ duration: 0.1 }}>
                  <button onClick={() => setSettingsPage("main")} className="w-full flex items-center gap-2 px-2.5 py-2 border-b border-white/10 text-white text-[11px] hover:bg-white/5 transition-colors">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" /></svg>
                    Speed
                  </button>
                  <div className="p-0.5 max-h-44 overflow-y-auto">
                    {SPEEDS.map(s => (
                      <button key={s} onClick={() => chSpeed(s)}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-[11px] transition-colors ${speed === s ? "bg-red-500/15 text-red-400" : "text-white hover:bg-white/10"}`}>
                        <span className="w-3 text-[9px]">{speed === s ? "✓" : ""}</span>
                        {s === 1 ? "Normal" : `${s}x`}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
              {settingsPage === "quality" && (
                <motion.div key="q" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }} transition={{ duration: 0.1 }}>
                  <button onClick={() => setSettingsPage("main")} className="w-full flex items-center gap-2 px-2.5 py-2 border-b border-white/10 text-white text-[11px] hover:bg-white/5 transition-colors">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" /></svg>
                    Quality
                  </button>
                  <div className="p-0.5 max-h-44 overflow-y-auto">
                    {(qualities.length > 0 ? qualities : ["auto"]).map(q => (
                      <button key={q} onClick={() => chQuality(q)}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-[11px] transition-colors ${quality === q ? "bg-red-500/15 text-red-400" : "text-white hover:bg-white/10"}`}>
                        <span className="w-3 text-[9px]">{quality === q ? "✓" : ""}</span>
                        {Q_LABELS[q] || q}
                        {(q === "hd1080" || q === "hd720") && <span className="text-[7px] text-blue-400 font-bold ml-auto">HD</span>}
                        {q === "hd2160" && <span className="text-[7px] text-purple-400 font-bold ml-auto">4K</span>}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ END SCREEN ═══ */}
      <AnimatePresence>
        {ended && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 flex items-center justify-center" onClick={e => e.stopPropagation()}>
            <div className="absolute inset-0 bg-black/95" />
            <img src={thumb} alt="" className="absolute inset-0 w-full h-full object-cover"
              style={{ filter: "blur(30px) brightness(0.1)", transform: "scale(1.2)" }} />
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
              className="text-center relative z-10">
              <motion.button onClick={replay}
                className="w-14 h-14 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-2xl shadow-red-500/30 mb-3 mx-auto"
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
                </svg>
              </motion.button>
              <h3 className="text-white text-xs font-medium mb-3">{video.title}</h3>
              <button onClick={onClose} className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] transition-colors">Close</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
