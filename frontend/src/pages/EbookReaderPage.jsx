import React, { useState, useEffect, useRef } from "react";
import { 
  Menu, X, Sun, Moon, Sparkles, Download, 
  ArrowLeft, ArrowRight, Type, HelpCircle, Loader2 
} from "lucide-react";

export default function EbookReaderPage({ navigate }) {
  const params = new URLSearchParams(window.location.search);
  const file_name = params.get("file_name") || "Book";
  const src = params.get("src") || "";

  // Extract file type from filename or query param
  const getFileType = () => {
    const ext = file_name.toLowerCase().split('.').pop();
    if (['epub', 'pdf', 'txt', 'fb2', 'djvu', 'djv'].includes(ext)) {
      if (ext === 'djv') return 'djvu';
      return ext;
    }
    return 'epub'; // default fallback
  };

  const fileType = getFileType();

  const [theme, setTheme] = useState("dark");
  const [fontSize, setFontSize] = useState(100);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [toc, setToc] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [progressText, setProgressText] = useState("Loading eBook...");
  const [errorMsg, setErrorMsg] = useState("");
  const [showKbHint, setShowKbHint] = useState(true);

  const epubRenditionRef = useRef(null);
  const bookRef = useRef(null);
  const epubContainerRef = useRef(null);

  // Load scripts helper
  const loadScript = (url) => {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = url;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  };

  // Keyboard navigation & Font-size change shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        if (epubRenditionRef.current) epubRenditionRef.current.prev();
      }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        if (epubRenditionRef.current) epubRenditionRef.current.next();
      }
      if (e.key === 't' || e.key === 'T') {
        setIsSidebarOpen(prev => !prev);
      }
      if (e.key === '+' || e.key === '=') {
        setFontSize(prev => Math.min(200, prev + 10));
      }
      if (e.key === '-' || e.key === '_') {
        setFontSize(prev => Math.max(60, prev - 10));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Sync theme to document body / head
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    // Apply EPUB theme if rendered
    if (epubRenditionRef.current) {
      const colors = {
        light: { background: '#f7f4ef', color: '#1a1714' },
        sepia: { background: '#f5ecd7', color: '#3b2e1a' },
        dark:  { background: '#1c1a25', color: '#e0dde8' }
      };
      const t = colors[theme];
      epubRenditionRef.current.themes.default({
        body: { background: t.background + ' !important', color: t.color + ' !important' },
        p:    { color: t.color + ' !important' }
      });
    }
  }, [theme]);

  // Sync font size
  useEffect(() => {
    if (epubRenditionRef.current) {
      epubRenditionRef.current.themes.fontSize(`${fontSize}%`);
    }
  }, [fontSize]);

  // Load EPUB file using EPUB.js
  useEffect(() => {
    if (!src) {
      setErrorMsg("No document URL provided.");
      setLoading(false);
      return;
    }

    const initReader = async () => {
      try {
        if (fileType === 'epub') {
          // Load JSZip & EPUB.js if not already present
          if (typeof window.JSZip === "undefined") {
            await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js");
          }
          if (typeof window.ePub === "undefined") {
            await loadScript("https://cdn.jsdelivr.net/npm/epubjs@0.3.93/dist/epub.min.js");
          }

          // Fetch the file with progress tracking
          setProgressText("Downloading eBook...");
          const response = await fetch(src);
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const contentLength = response.headers.get('content-length');
          const total = contentLength ? parseInt(contentLength, 10) : 0;
          let loaded = 0;
          const reader = response.body.getReader();
          const chunks = [];

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
            loaded += value.length;
            if (total) {
              const pct = Math.round((loaded / total) * 100);
              setLoadingProgress(pct);
              setProgressText(`Downloading eBook... ${pct}%`);
            } else {
              const mb = (loaded / (1024 * 1024)).toFixed(1);
              setProgressText(`Downloading eBook... ${mb} MB`);
            }
          }

          const allChunks = new Uint8Array(loaded);
          let position = 0;
          for (const chunk of chunks) {
            allChunks.set(chunk, position);
            position += chunk.length;
          }

          setProgressText("Parsing eBook...");
          const book = window.ePub(allChunks.buffer);
          bookRef.current = book;

          const rendition = book.renderTo(epubContainerRef.current, {
            width: '100%',
            height: '100%',
            spread: 'none',
            flow: 'paginated'
          });
          epubRenditionRef.current = rendition;

          rendition.display();

          // Apply initial theme & font size
          const colors = {
            light: { background: '#f7f4ef', color: '#1a1714' },
            sepia: { background: '#f5ecd7', color: '#3b2e1a' },
            dark:  { background: '#1c1a25', color: '#e0dde8' }
          };
          const t = colors[theme];
          rendition.themes.default({
            body: { background: t.background + ' !important', color: t.color + ' !important' },
            p:    { color: t.color + ' !important' }
          });
          rendition.themes.fontSize(`${fontSize}%`);

          book.ready.then(() => {
            setLoading(false);
            return book.loaded.navigation;
          }).then(nav => {
            if (nav && nav.toc) {
              setToc(nav.toc);
            }
          }).catch(err => {
            setErrorMsg("Could not parse Table of Contents: " + err.message);
          });

          rendition.on('relocated', location => {
            const pct = Math.round((location.start.percentage || 0) * 100);
            setLoadingProgress(pct);
          });

          book.on('openFailed', err => {
            setErrorMsg("Failed to open EPUB file: " + (err?.message || "Unknown error"));
            setLoading(false);
          });
        } else {
          // Non-EPUB files (PDF, TXT etc.) - let's render an iframe or direct fallback since PDF.js has local workers and is complex in react dev server.
          setLoading(false);
        }
      } catch (err) {
        setErrorMsg("Could not render document: " + err.message);
        setLoading(false);
      }
    };

    initReader();

    // Auto-hide keyboard hint after 4s
    const hintTimer = setTimeout(() => setShowKbHint(false), 4000);

    return () => {
      clearTimeout(hintTimer);
      if (bookRef.current) {
        try {
          bookRef.current.destroy();
        } catch (e) {}
      }
    };
  }, [src, fileType]);

  // Touch Swipe for mobile page turns
  const touchStartRef = useRef({ x: 0, y: 0 });
  const handleTouchStart = (e) => {
    touchStartRef.current = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY
    };
  };

  const handleTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx < 0) {
        if (epubRenditionRef.current) epubRenditionRef.current.next();
      } else {
        if (epubRenditionRef.current) epubRenditionRef.current.prev();
      }
    }
  };

  return (
    <div style={{
      fontFamily: "'Inter', sans-serif",
      background: theme === "light" ? "#f7f4ef" : theme === "sepia" ? "#f5ecd7" : "#0f0f15",
      color: theme === "light" ? "#1a1714" : theme === "sepia" ? "#3b2e1a" : "#e0dde8",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      position: "relative",
    }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Toolbar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0.75rem 1rem",
        background: theme === "light" ? "rgba(240, 235, 225, 0.8)" : theme === "sepia" ? "rgba(235, 220, 195, 0.8)" : "rgba(20, 20, 28, 0.8)",
        backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${theme === "light" ? "#e0dbd0" : theme === "sepia" ? "#e5dac0" : "#2a2a38"}`,
        zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "inherit",
              display: "flex",
              alignItems: "center",
              padding: "6px",
              borderRadius: "8px",
            }}
            title="Table of Contents"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <span style={{
            fontWeight: 600,
            fontSize: "0.95rem",
            maxWidth: "200px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            {file_name}
          </span>
        </div>

        {/* Progress Bar (Header) */}
        {!loading && fileType === 'epub' && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, justifySelf: "center", maxWidth: "240px", margin: "0 1rem" }}>
            <div style={{
              flex: 1,
              height: "4px",
              background: theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
              borderRadius: "2px",
              overflow: "hidden",
            }}>
              <div style={{
                width: `${loadingProgress}%`,
                height: "100%",
                background: "var(--accent-purple, #a855f7)",
                transition: "width 0.3s ease",
              }} />
            </div>
            <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>{loadingProgress}%</span>
          </div>
        )}

        {/* Action Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Themes */}
          <div style={{ display: "flex", background: theme === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)", borderRadius: "8px", padding: "2px" }}>
            <button 
              onClick={() => setTheme("light")}
              style={{
                background: theme === "light" ? "white" : "transparent",
                border: "none",
                cursor: "pointer",
                padding: "4px 8px",
                borderRadius: "6px",
                color: theme === "light" ? "#1a1714" : "inherit",
                opacity: theme === "light" ? 1 : 0.6,
              }}
            >
              <Sun size={15} />
            </button>
            <button 
              onClick={() => setTheme("sepia")}
              style={{
                background: theme === "sepia" ? "#f5ecd7" : "transparent",
                border: "none",
                cursor: "pointer",
                padding: "4px 8px",
                borderRadius: "6px",
                color: theme === "sepia" ? "#3b2e1a" : "inherit",
                opacity: theme === "sepia" ? 1 : 0.6,
                fontWeight: 600,
                fontSize: "11px",
              }}
            >
              Sepia
            </button>
            <button 
              onClick={() => setTheme("dark")}
              style={{
                background: theme === "dark" ? "#1c1a25" : "transparent",
                border: "none",
                cursor: "pointer",
                padding: "4px 8px",
                borderRadius: "6px",
                color: theme === "dark" ? "#e0dde8" : "inherit",
                opacity: theme === "dark" ? 1 : 0.6,
              }}
            >
              <Moon size={15} />
            </button>
          </div>

          {/* Font Controls */}
          {fileType === 'epub' && (
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <button 
                onClick={() => setFontSize(prev => Math.max(60, prev - 10))}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "inherit",
                  fontSize: "1.1rem",
                  padding: "0 6px",
                }}
                title="Decrease font size"
              >
                A-
              </button>
              <span style={{ fontSize: "0.8rem", opacity: 0.7, minWidth: "35px", textAlign: "center" }}>{fontSize}%</span>
              <button 
                onClick={() => setFontSize(prev => Math.min(200, prev + 10))}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "inherit",
                  fontSize: "1.1rem",
                  padding: "0 6px",
                }}
                title="Increase font size"
              >
                A+
              </button>
            </div>
          )}

          {/* Download fallback */}
          <a 
            href={src} 
            download={file_name}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "6px",
              borderRadius: "8px",
              color: "inherit",
              textDecoration: "none",
            }}
            title="Download file"
          >
            <Download size={18} />
          </a>
        </div>
      </div>

      {/* Main Layout Area */}
      <div style={{ display: "flex", flex: 1, position: "relative", overflow: "hidden" }}>
        {/* Sidebar TOC */}
        <div style={{
          width: isSidebarOpen ? "280px" : "0",
          background: theme === "light" ? "#f2ede4" : theme === "sepia" ? "#eddcb8" : "#14141c",
          borderRight: isSidebarOpen ? `1px solid ${theme === "light" ? "#e0dbd0" : theme === "sepia" ? "#e5dac0" : "#2a2a38"}` : "none",
          transition: "width 0.3s ease",
          overflowY: "auto",
          height: "100%",
          zIndex: 40,
          position: "absolute",
          top: 0,
          left: 0,
          boxShadow: isSidebarOpen ? "5px 0 15px rgba(0,0,0,0.15)" : "none",
        }}>
          <div style={{ padding: "1.25rem 1rem", borderBottom: "1px solid rgba(128,128,128,0.1)" }}>
            <h4 style={{ margin: 0, fontWeight: 700, fontSize: "0.95rem" }}>Table of Contents</h4>
          </div>
          <ul style={{ listStyle: "none", padding: "0.5rem 0", margin: 0 }}>
            {toc.length === 0 ? (
              <li style={{ padding: "1rem", fontSize: "0.85rem", opacity: 0.6, fontStyle: "italic" }}>
                No table of contents available
              </li>
            ) : (
              toc.map((item, index) => (
                <li key={index} style={{ borderBottom: "1px solid rgba(128,128,128,0.04)" }}>
                  <button
                    onClick={() => {
                      if (epubRenditionRef.current) {
                        epubRenditionRef.current.display(item.href);
                      }
                      setIsSidebarOpen(false);
                    }}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      background: "transparent",
                      border: "none",
                      padding: "0.75rem 1rem",
                      cursor: "pointer",
                      color: "inherit",
                      fontSize: "0.88rem",
                      fontWeight: 500,
                      transition: "background 0.2s ease",
                    }}
                    onMouseEnter={(e) => e.target.style.background = "rgba(128,128,128,0.08)"}
                    onMouseLeave={(e) => e.target.style.background = "transparent"}
                  >
                    {item.label?.trim()}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Reader Viewer Canvas */}
        <div style={{
          flex: 1,
          position: "relative",
          marginLeft: isSidebarOpen ? "280px" : "0",
          transition: "margin-left 0.3s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          padding: "1rem",
        }}>
          {loading && (
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px",
              zIndex: 30,
            }}>
              <Loader2 className="animate-spin" size={32} style={{ color: "var(--accent-purple, #a855f7)" }} />
              <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>{progressText}</span>
            </div>
          )}

          {errorMsg ? (
            <div style={{
              textAlign: "center",
              maxWidth: "400px",
              padding: "2rem",
              background: "rgba(239, 68, 68, 0.08)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              borderRadius: "16px",
              color: "#f87171",
            }}>
              <p style={{ fontWeight: 600, marginBottom: "1rem" }}>{errorMsg}</p>
              <a 
                href={src} 
                download={file_name} 
                className="btn btn-primary"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
                  color: "white",
                  textDecoration: "none",
                  padding: "0.6rem 1.2rem",
                  borderRadius: "10px",
                  fontWeight: 600,
                  fontSize: "0.88rem",
                }}
              >
                <Download size={16} />
                Download Instead
              </a>
            </div>
          ) : (
            <>
              {fileType === 'epub' ? (
                <div 
                  ref={epubContainerRef} 
                  style={{
                    width: "100%",
                    height: "100%",
                    maxWidth: "800px",
                    background: "transparent",
                  }}
                />
              ) : (
                /* PDF and other files */
                <iframe
                  src={src}
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                    borderRadius: "12px",
                    background: "white",
                  }}
                  title={file_name}
                />
              )}
            </>
          )}

          {/* Navigation Arrows */}
          {!loading && !errorMsg && fileType === 'epub' && (
            <>
              <button 
                onClick={() => epubRenditionRef.current?.prev()}
                style={{
                  position: "absolute",
                  left: "1rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "rgba(128,128,128,0.15)",
                  border: "none",
                  color: "inherit",
                  padding: "12px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backdropFilter: "blur(4px)",
                }}
                title="Previous Page (Left Arrow)"
              >
                <ArrowLeft size={20} />
              </button>
              <button 
                onClick={() => epubRenditionRef.current?.next()}
                style={{
                  position: "absolute",
                  right: "1rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "rgba(128,128,128,0.15)",
                  border: "none",
                  color: "inherit",
                  padding: "12px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backdropFilter: "blur(4px)",
                }}
                title="Next Page (Right Arrow)"
              >
                <ArrowRight size={20} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Keyboard hints overlay */}
      {showKbHint && !loading && (
        <div style={{
          position: "absolute",
          bottom: "1rem",
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(0,0,0,0.8)",
          color: "white",
          padding: "6px 14px",
          borderRadius: "99px",
          fontSize: "0.75rem",
          backdropFilter: "blur(4px)",
          border: "1px solid rgba(255,255,255,0.1)",
          zIndex: 100,
          pointerEvents: "none",
          display: "flex",
          gap: "8px",
        }}>
          <span>← / → Arrow keys to turn pages</span>
          <span>·</span>
          <span>T to toggle Table of Contents</span>
        </div>
      )}

      <style>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
