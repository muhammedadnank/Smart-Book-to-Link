import React, { useState, useEffect, useRef } from "react";
import { 
  Play, Pause, Volume2, VolumeX, Copy, Download, 
  HelpCircle, ExternalLink, RefreshCw, Check, Sun, Moon,
  SkipForward, SkipBack, Share2
} from "lucide-react";

export default function AudioPlayerPage({ navigate }) {
  const params = new URLSearchParams(window.location.search);
  const file_name = params.get("file_name") || "Audiobook";
  const src = params.get("src") || "";

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [theme, setTheme] = useState("dark");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const audioRef = useRef(null);

  // Sync theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Accent color palettes
  const PALETTE = [
    { a: '#e8633a', b: '#c94fc7', ga: 'rgba(232,99,58,0.25)',  gb: 'rgba(201,79,199,0.15)' },
    { a: '#3b82f6', b: '#8b5cf6', ga: 'rgba(59,130,246,0.25)', gb: 'rgba(139,92,246,0.15)' },
    { a: '#10b981', b: '#06b6d4', ga: 'rgba(16,185,129,0.25)', gb: 'rgba(6,182,212,0.15)'  },
    { a: '#f59e0b', b: '#ef4444', ga: 'rgba(245,158,11,0.25)', gb: 'rgba(239,68,68,0.15)'  },
    { a: '#ec4899', b: '#a855f7', ga: 'rgba(236,72,153,0.25)', gb: 'rgba(168,85,247,0.15)' },
  ];

  const [paletteIdx, setPaletteIdx] = useState(0);

  // Cycle palette when playing
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setPaletteIdx((prev) => (prev + 1) % PALETTE.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const activePalette = PALETTE[paletteIdx];

  // Hotkeys handling
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        skip(-10);
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        skip(10);
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setVolume(prev => Math.min(1, prev + 0.05));
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setVolume(prev => Math.max(0, prev - 0.05));
      }
      if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        setIsMuted(prev => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Update volume and mute state
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  // Update playback speed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => console.error("Play failed:", err));
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    if (audioRef.current) {
      const newTime = parseFloat(e.target.value);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const skip = (seconds) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds));
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "00:00";
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => console.error("Copy failed:", err));
  };

  return (
    <div style={{
      fontFamily: "'Inter', sans-serif",
      background: theme === "light" ? "#f5f3f0" : "#080810",
      color: theme === "light" ? "#1a1825" : "#f0eef8",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "space-between",
      overflowX: "hidden",
      padding: "1.5rem",
      position: "relative",
    }}>
      {/* Background Orbs */}
      <div style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}>
        <div style={{
          position: "absolute",
          borderRadius: "50%",
          filter: "blur(100px)",
          opacity: 0.55,
          width: "70vw",
          height: "70vw",
          top: "-20%",
          left: "-20%",
          background: activePalette.ga,
          transition: "background 3s ease",
        }} />
        <div style={{
          position: "absolute",
          borderRadius: "50%",
          filter: "blur(100px)",
          opacity: 0.55,
          width: "60vw",
          height: "60vw",
          bottom: "-15%",
          right: "-15%",
          background: activePalette.gb,
          transition: "background 3s ease",
        }} />
        <div style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
          opacity: 1,
        }} />
      </div>

      {/* Audio Element */}
      <audio
        ref={audioRef}
        src={src}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
      />

      {/* Header */}
      <header style={{
        width: "100%",
        maxWidth: "680px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "32px",
            height: "32px",
            borderRadius: "10px",
            background: `linear-gradient(135deg, ${activePalette.a}, ${activePalette.b})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            🎧
          </div>
          <span style={{ fontWeight: 700, fontSize: "15px" }}>PageStream</span>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button 
            onClick={() => setShowHelp(!showHelp)}
            className="icon-btn"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.04)",
              color: "inherit",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <HelpCircle size={16} />
          </button>
          <button 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="icon-btn"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.04)",
              color: "inherit",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{
        width: "100%",
        maxWidth: "520px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "28px",
        zIndex: 10,
        margin: "2rem 0",
      }}>
        {/* Spinning Vinyl Orb */}
        <div style={{ position: "relative", width: "220px", height: "220px" }}>
          {/* Animated breath rings */}
          <div style={{
            position: "absolute",
            inset: "-16px",
            borderRadius: "50%",
            border: `1px solid ${theme === "light" ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)"}`,
            animation: "ring-breathe 4s ease-in-out infinite",
          }} />
          <div style={{
            position: "absolute",
            inset: "-32px",
            borderRadius: "50%",
            border: `1px solid ${theme === "light" ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.03)"}`,
            animation: "ring-breathe 4s ease-in-out infinite",
            animationDelay: "-2s",
          }} />

          {/* Ambient Glow */}
          <div style={{
            position: "absolute",
            inset: "-24px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${activePalette.ga} 0%, transparent 65%)`,
            filter: "blur(20px)",
            opacity: isPlaying ? 1 : 0,
            transition: "opacity 1.2s ease",
          }} />

          {/* Record */}
          <div style={{
            width: "220px",
            height: "220px",
            borderRadius: "50%",
            position: "relative",
            overflow: "hidden",
            background: "conic-gradient(from 0deg, #1a0a2e, #2d0a1e, #0a1a2e, #0a2e1a, #2e1a0a, #2e0a1a, #1a0a2e)",
            boxShadow: "0 24px 64px -16px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)",
            animation: "spin 20s linear infinite",
            animationPlayState: isPlaying ? "running" : "paused",
          }}>
            <div style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              background: theme === "light" ? "#f5f3f0" : "#080810",
              border: `1px solid ${theme === "light" ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 0 8px rgba(0,0,0,0.3)",
            }}>
              <div style={{
                width: "18px",
                height: "18px",
                borderRadius: "50%",
                background: activePalette.a,
                boxShadow: `0 0 12px ${activePalette.a}`,
                transition: "all 0.5s ease",
              }} />
            </div>
          </div>
        </div>

        {/* Track Title */}
        <div style={{ textAlign: "center", padding: "0 1rem" }}>
          <h1 style={{
            fontSize: "1.35rem",
            fontWeight: 800,
            marginBottom: "8px",
            lineHeight: 1.3,
            wordBreak: "break-word",
          }}>
            {file_name}
          </h1>
          <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "4px 10px",
              borderRadius: "99px",
              background: theme === "light" ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.06)",
              fontSize: "11px",
              fontWeight: 500,
            }}>
              ⏱️ {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Player Card Container */}
        <div style={{
          width: "100%",
          background: theme === "light" ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.03)",
          border: `1px solid ${theme === "light" ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)"}`,
          borderRadius: "24px",
          padding: "20px 24px",
          backdropFilter: "blur(32px)",
          boxShadow: isPlaying ? `0 40px 80px -24px rgba(0,0,0,0.6), 0 0 60px -20px ${activePalette.a}` : "0 40px 80px -24px rgba(0,0,0,0.5)",
          transition: "all 0.4s ease",
        }}>
          {/* Animated Waveform Visualizer */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px",
            height: "32px",
            marginBottom: "16px",
          }}>
            {[8, 16, 24, 20, 28, 32, 24, 18, 28, 22, 14, 26, 18, 10, 20].map((h, i) => (
              <div 
                key={i} 
                style={{
                  width: "3px",
                  borderRadius: "99px",
                  background: activePalette.a,
                  height: `${h}px`,
                  opacity: isPlaying ? 1 : 0.3,
                  animation: isPlaying ? "wave 1.2s ease-in-out infinite alternate" : "none",
                  animationDelay: `${i * 0.08}s`,
                }} 
              />
            ))}
          </div>

          {/* Time slider */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
            <span style={{ fontSize: "12px", opacity: 0.7, minWidth: "40px" }}>{formatTime(currentTime)}</span>
            <input 
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              style={{
                flex: 1,
                accentColor: activePalette.a,
                height: "5px",
                borderRadius: "3px",
                cursor: "pointer",
              }}
            />
            <span style={{ fontSize: "12px", opacity: 0.7, minWidth: "40px" }}>{formatTime(duration)}</span>
          </div>

          {/* Controls Row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {/* Speed Selector */}
            <select
              value={playbackRate}
              onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
              style={{
                background: "transparent",
                border: "none",
                color: "inherit",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <option value="0.5">0.5x</option>
              <option value="0.75">0.75x</option>
              <option value="1">1.0x</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
              <option value="2">2.0x</option>
            </select>

            {/* Skip Back / Play / Skip Fwd */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <button 
                onClick={() => skip(-10)} 
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "inherit" }}
                title="Rewind 10s"
              >
                <SkipBack size={20} />
              </button>
              <button 
                onClick={togglePlay}
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "50%",
                  background: activePalette.a,
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 8px 20px ${activePalette.ga}`,
                }}
              >
                {isPlaying ? <Pause size={24} fill="white" /> : <Play size={24} fill="white" style={{ marginLeft: "4px" }} />}
              </button>
              <button 
                onClick={() => skip(10)} 
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "inherit" }}
                title="Forward 10s"
              >
                <SkipForward size={20} />
              </button>
            </div>

            {/* Mute Button */}
            <button 
              onClick={() => setIsMuted(!isMuted)}
              style={{ background: "transparent", border: "none", cursor: "pointer", color: "inherit" }}
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "8px", width: "100%", flexWrap: "wrap" }}>
          <a
            href={src}
            download={file_name}
            style={{
              flex: 1,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              background: `linear-gradient(135deg, ${activePalette.a}, ${activePalette.b})`,
              color: "white",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "0.85rem",
              padding: "0.75rem",
              borderRadius: "14px",
              border: "none",
            }}
          >
            <Download size={16} />
            Download
          </a>

          <button
            onClick={handleCopyLink}
            style={{
              flex: 1,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              background: theme === "light" ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.06)",
              border: `1px solid ${theme === "light" ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)"}`,
              color: "inherit",
              fontWeight: 500,
              fontSize: "0.85rem",
              padding: "0.75rem",
              borderRadius: "14px",
              cursor: "pointer",
            }}
          >
            {copied ? <Check size={16} style={{ color: "#10b981" }} /> : <Copy size={16} />}
            {copied ? "Copied!" : "Copy Link"}
          </button>

          <button
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            style={{
              flex: 1,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              background: theme === "light" ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.06)",
              border: `1px solid ${theme === "light" ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)"}`,
              color: "inherit",
              fontWeight: 500,
              fontSize: "0.85rem",
              padding: "0.75rem",
              borderRadius: "14px",
              cursor: "pointer",
            }}
          >
            <ExternalLink size={16} />
            Open In
          </button>
        </div>

        {/* Drawer Panel */}
        {isDrawerOpen && (
          <div style={{
            width: "100%",
            background: theme === "light" ? "rgba(0,0,0,0.02)" : "rgba(255,255,255,0.03)",
            border: `1px solid ${theme === "light" ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)"}`,
            borderRadius: "22px",
            padding: "20px",
            marginTop: "8px",
          }}>
            {/* Android */}
            <div style={{ marginBottom: "1.2rem" }}>
              <div style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", opacity: 0.6, marginBottom: "8px" }}>
                Android Players
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                <a href={`intent:${src}#Intent;action=android.intent.action.VIEW;type=audio/*;package=org.videolan.vlc;end`} style={playerLinkStyle(theme)}>VLC</a>
                <a href={`intent:${src}#Intent;action=android.intent.action.VIEW;type=audio/*;package=com.mxtech.videoplayer.ad;S.title=${encodeURIComponent(file_name)};end`} style={playerLinkStyle(theme)}>MX Player</a>
                <a href={`intent:${src}#Intent;action=android.intent.action.VIEW;type=audio/*;package=is.xyz.mpv;S.title=${encodeURIComponent(file_name)};end`} style={playerLinkStyle(theme)}>MPV</a>
              </div>
            </div>

            {/* iOS */}
            <div style={{ marginBottom: "1.2rem" }}>
              <div style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", opacity: 0.6, marginBottom: "8px" }}>
                iOS Players
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                <a href={`vlc-x-callback://x-callback-url/stream?url=${src}`} style={playerLinkStyle(theme)}>VLC</a>
                <a href={`infuse://x-callback-url/play?url=${src}`} style={playerLinkStyle(theme)}>Infuse</a>
                <a href={`nplayer://weblink?url=${src}`} style={playerLinkStyle(theme)}>nPlayer</a>
              </div>
            </div>

            {/* Desktop */}
            <div>
              <div style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", opacity: 0.6, marginBottom: "8px" }}>
                Desktop Players
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                <a href={`vlc://${src}`} style={playerLinkStyle(theme)}>VLC</a>
                <a href={`potplayer://${src}`} style={playerLinkStyle(theme)}>PotPlayer</a>
                <a href={`mpv://${src}`} style={playerLinkStyle(theme)}>MPV</a>
              </div>
            </div>
          </div>
        )}

        {/* Keyboard Shortcut Hints */}
        {showHelp && (
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            background: "rgba(0,0,0,0.85)",
            color: "white",
            padding: "16px",
            borderRadius: "16px",
            width: "100%",
            fontSize: "12px",
            border: "1px solid rgba(255,255,255,0.1)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}><strong>Space</strong> <span>Play / Pause</span></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><strong>← / → Arrows</strong> <span>Seek 10s</span></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><strong>↑ / ↓ Arrows</strong> <span>Volume</span></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><strong>M key</strong> <span>Mute / Unmute</span></div>
          </div>
        )}
      </main>

      <footer style={{ fontSize: "11px", opacity: 0.5, zIndex: 10 }}>
        © {new Date().getFullYear()} PageStream
      </footer>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes ring-breathe {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.04); opacity: 1; }
        }
        @keyframes wave {
          0% { transform: scaleY(1); }
          100% { transform: scaleY(0.4); }
        }
      `}</style>
    </div>
  );
}

function playerLinkStyle(theme) {
  return {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 12px",
    borderRadius: "8px",
    background: theme === "light" ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.06)",
    border: `1px solid ${theme === "light" ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)"}`,
    color: "inherit",
    fontSize: "12px",
    fontWeight: 500,
    textDecoration: "none",
  };
}
