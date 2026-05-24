import React, { useState, useEffect } from "react";
import { Info, ShieldAlert, Send, ArrowDown, BookOpen, Headphones, Zap, CircleCheck, HelpCircle } from "lucide-react";

const Github = ({ size = 24, style = {} }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export default function HomePage({ navigate }) {
  const [botUsername, setBotUsername] = useState("FileToLinkBot");
  const [typedText, setTypedText] = useState("");
  const [activeWordIndex, setActiveWordIndex] = useState(0);
  const typewriterWords = ["Instantly", "Bypass Limits", "Read Online", "Listen Direct"];

  // Fetch bot info
  useEffect(() => {
    fetch("/api/bot/info")
      .then((res) => res.json())
      .then((data) => {
        if (data.username) {
          setBotUsername(data.username);
        }
      })
      .catch((err) => console.error("Error fetching bot info:", err));
  }, []);

  // Typewriter effect
  useEffect(() => {
    let timer;
    const currentWord = typewriterWords[activeWordIndex];
    let isDeleting = false;
    let charIndex = 0;

    const tick = () => {
      if (!isDeleting) {
        setTypedText(currentWord.slice(0, charIndex + 1));
        charIndex++;
        if (charIndex === currentWord.length) {
          isDeleting = true;
          timer = setTimeout(tick, 2000); // Wait 2s before deleting
        } else {
          timer = setTimeout(tick, 100);
        }
      } else {
        setTypedText(currentWord.slice(0, charIndex - 1));
        charIndex--;
        if (charIndex === 0) {
          isDeleting = false;
          setActiveWordIndex((prev) => (prev + 1) % typewriterWords.length);
          timer = setTimeout(tick, 500); // Pause before next word
        } else {
          timer = setTimeout(tick, 50);
        }
      }
    };

    timer = setTimeout(tick, 500);
    return () => clearTimeout(timer);
  }, [activeWordIndex]);

  return (
    <div style={{ position: "relative", overflowX: "hidden" }}>
      {/* Ambient background glows */}
      <div className="ambient-glow glow-1"></div>
      <div className="ambient-glow glow-2"></div>
      <div
        className="ambient-glow"
        style={{
          width: "400px",
          height: "400px",
          top: "40%",
          left: "30%",
          background: "radial-gradient(circle, rgba(16,185,129,0.04) 0%, transparent 70%)",
        }}
      ></div>

      {/* Hero Section */}
      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "7rem 1.5rem 5rem",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          zIndex: 10,
          position: "relative",
        }}
      >
        <div
          className="hero-badge"
          style={{
            background: "rgba(168,85,247,0.07)",
            border: "1px solid rgba(168,85,247,0.2)",
            color: "#d8b4fe",
            padding: "0.5rem 1.2rem",
            borderRadius: "100px",
            fontSize: "0.8rem",
            fontWeight: 600,
            marginBottom: "2rem",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            backdropFilter: "blur(10px)",
          }}
        >
          <span className="badge-dot"></span>
          High-Speed Literature Streamer
        </div>

        <h1
          style={{
            fontSize: "clamp(2.5rem, 6.8vw, 4.8rem)",
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: "-2px",
            marginBottom: "1.5rem",
            maxWidth: "980px",
          }}
        >
          Stream Books &amp; Audiobooks<br />
          <span className="gradient-text">{typedText || "\u00A0"}</span>
          <span className="typewriter-cursor"></span>
        </h1>

        <p
          style={{
            fontSize: "clamp(1.05rem, 2.5vw, 1.25rem)",
            color: "var(--text-secondary)",
            maxWidth: "650px",
            marginBottom: "3.5rem",
            lineHeight: 1.8,
          }}
        >
          The ultimate premium Telegram bot for literature lovers. Convert eBooks, audiobooks, documents, and archives into blazing-fast streamable and downloadable web links.
        </p>

        <div className="cta-group">
          <a
            href={`https://t.me/${botUsername}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ padding: "1rem 2rem", fontSize: "1rem", borderRadius: "14px" }}
          >
            <Send size={18} />
            Get Started on Telegram
          </a>
          <a
            href="#how-it-works"
            className="btn btn-secondary"
            style={{ padding: "1rem 2rem", fontSize: "1rem", borderRadius: "14px" }}
          >
            <ArrowDown size={18} />
            See how it works
          </a>
          <button
            onClick={() => navigate("/admin")}
            className="btn btn-secondary"
            style={{ padding: "1rem 2rem", fontSize: "1rem", borderRadius: "14px" }}
          >
            <ShieldAlert size={18} />
            Admin Dashboard
          </button>
        </div>

        <div className="stats-row">
          <div className="stat-item">
            <span className="stat-num">6</span>
            <span className="stat-label">Format types</span>
          </div>
          <div className="stat-item">
            <span className="stat-num">13</span>
            <span className="stat-label">File formats</span>
          </div>
          <div className="stat-item">
            <span className="stat-num">100%</span>
            <span className="stat-label">browser native</span>
          </div>
          <div className="stat-item">
            <span className="stat-num">10x</span>
            <span className="stat-label">Faster than Telegram</span>
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="how-section" id="how-it-works">
        <p className="section-label">Simple 3-step process</p>
        <h2 className="section-title">How PageStream Works</h2>
        <div className="steps-grid">
          <div className="step">
            <div className="step-number">
              1
              <span className="step-icon">
                <Send size={12} style={{ color: "var(--accent-teal)" }} />
              </span>
            </div>
            <div className="step-title">Send to Bot</div>
            <div className="step-desc">
              Send any supported file to the PageStream Telegram bot — eBook, audiobook, document, or archive.
            </div>
          </div>

          <div className="step-connector">
            <div className="connector-line"></div>
          </div>

          <div className="step">
            <div
              className="step-number"
              style={{ background: "linear-gradient(135deg, var(--accent-purple), var(--accent-teal))" }}
            >
              2
              <span className="step-icon">
                <Zap size={12} style={{ color: "var(--accent-teal)" }} />
              </span>
            </div>
            <div className="step-title">Get Stream Link</div>
            <div className="step-desc">
              Bot instantly generates a high-speed web link, bypassing Telegram's speed limits completely.
            </div>
          </div>

          <div className="step-connector">
            <div
              className="connector-line"
              style={{ background: "linear-gradient(90deg, var(--accent-purple), var(--accent-teal))" }}
            ></div>
          </div>

          <div className="step">
            <div
              className="step-number"
              style={{ background: "linear-gradient(135deg, var(--accent-teal), #0ea5e9)" }}
            >
              3
              <span className="step-icon">
                <BookOpen size={12} style={{ color: "var(--accent-teal)" }} />
              </span>
            </div>
            <div className="step-title">Read or Listen</div>
            <div className="step-desc">
              Open the link in any browser. Read EPUBs, stream audio, view PDFs — no app needed.
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <p className="section-label">What you get</p>
        <h2 className="section-title">Premium Advanced Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="card-shimmer"></div>
            <div className="card-icon icon-blue">
              <BookOpen size={24} />
            </div>
            <h3 className="card-title">Ultimate Ebook Reader</h3>
            <p className="card-desc">
              Paginated EPUBs, hardware-accelerated PDF canvas views, and a client-side CBZ comic reader — all directly in your browser with themes and font control.
            </p>
            <span className="card-tag">
              <CircleCheck size={14} style={{ color: "var(--accent-teal)" }} />
              EPUB · PDF · CBZ · FB2 · DjVu · TXT
            </span>
          </div>

          <div className="feature-card">
            <div className="card-shimmer"></div>
            <div className="card-icon icon-purple">
              <Headphones size={24} />
            </div>
            <h3 className="card-title">Atmospheric Audio Streamer</h3>
            <p className="card-desc">
              High-fidelity audiobook streaming with metadata display, spinning vinyl UI, real-time controls, and fully responsive playback — powered by Vidstack.
            </p>
            <span className="card-tag">
              <CircleCheck size={14} style={{ color: "var(--accent-teal)" }} />
              MP3 · M4B · M4A · OPUS · FLAC
            </span>
          </div>

          <div className="feature-card">
            <div className="card-shimmer"></div>
            <div className="card-icon icon-teal">
              <Zap size={24} />
            </div>
            <h3 className="card-title">Blazing-Fast Delivery</h3>
            <p className="card-desc">
              Ultra-high-speed download and streaming links that bypass typical Telegram API bottlenecks. Share links with anyone — no Telegram account needed to view.
            </p>
            <span className="card-tag">
              <CircleCheck size={14} style={{ color: "var(--accent-teal)" }} />
              No account needed to view
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ marginTop: "4rem", borderTop: "1px solid var(--glass-border)", padding: "3rem 1.5rem", background: "#030305" }}>
        <div className="footer-inner">
          <div className="footer-brand" style={{ fontSize: "1.2rem", display: "flex", alignItems: "center", gap: "8px", fontWeight: "bold" }}>
            <BookOpen size={20} style={{ color: "var(--accent-purple)" }} />
            PageStream
          </div>
          <p>© {new Date().getFullYear()} PageStream. All rights reserved.</p>
          <div style={{ display: "flex", gap: "1.5rem", marginTop: "0.5rem" }}>
            <a href="https://github.com/muhammedadnank/Smart-Book-to-Link" target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-secondary)" }}>
              <Github size={18} style={{ verticalAlign: "middle", marginRight: "4px" }} />
              GitHub
            </a>
            <a href={`https://t.me/${botUsername}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-secondary)" }}>
              Launch Bot
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
