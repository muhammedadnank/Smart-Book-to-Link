import React, { useState, useEffect } from "react";
import { Download, RefreshCw, Check } from "lucide-react";

export default function DownloadPage({ navigate }) {
  // Extract file_name and src from URL query params
  const params = new URLSearchParams(window.location.search);
  const file_name = params.get("file_name") || "unknown_file";
  const src = params.get("src") || "";

  const [countdown, setCountdown] = useState(3);
  const [downloadStarted, setDownloadStarted] = useState(false);

  useEffect(() => {
    if (!src) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setDownloadStarted(true);
          // Trigger the download by updating window.location.href
          window.location.href = src;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [src]);

  const handleManualDownload = () => {
    setDownloadStarted(true);
    setCountdown(0);
  };

  return (
    <div style={{
      fontFamily: "'Inter', sans-serif",
      textAlign: "center",
      background: "var(--bg-primary, #0a0a0f)",
      color: "var(--text-primary, #f3f4f6)",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      padding: "1rem",
      position: "relative",
    }}>
      {/* Ambient Glow */}
      <div style={{
        position: "absolute",
        width: "500px",
        height: "500px",
        background: "radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)",
        borderRadius: "50%",
        pointerEvents: "none",
        zIndex: 0,
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }} />

      <div style={{
        position: "relative",
        zIndex: 10,
        width: "100%",
        maxWidth: "480px",
      }}>
        <div className="glass-card" style={{
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          padding: "2.5rem 2rem",
          borderRadius: "24px",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
          textAlign: "center",
        }}>
          <div style={{
            fontSize: "2.5rem",
            marginBottom: "1rem",
            display: "inline-block",
            animation: "bounce 1.5s ease-in-out infinite",
          }}>
            📥
          </div>

          <h2 style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 600,
            marginBottom: "0.75rem",
            fontSize: "1.4rem",
          }}>
            Preparing Download
          </h2>

          <p style={{
            marginBottom: "1.75rem",
            fontSize: "0.92rem",
            color: "var(--text-secondary, #9ca3af)",
            lineHeight: "1.65",
            wordBreak: "break-word",
          }}>
            {downloadStarted ? (
              <span>Download started — if it didn't, click the button below.</span>
            ) : (
              <span>
                Your download for<br />
                <strong style={{ color: "var(--text-primary, #f3f4f6)" }}>{file_name}</strong><br />
                will start in {countdown} second{countdown === 1 ? "" : "s"}.
              </span>
            )}
          </p>

          <a
            className="btn btn-primary"
            href={src}
            download={file_name}
            onClick={handleManualDownload}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              width: "100%",
              background: "linear-gradient(135deg, var(--accent-blue, #6366f1) 0%, var(--accent-purple, #a855f7) 100%)",
              color: "white",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "0.95rem",
              padding: "0.85rem 1.5rem",
              borderRadius: "14px",
              boxShadow: "0 4px 15px rgba(168, 85, 247, 0.3)",
              border: "none",
            }}
          >
            <Download size={18} />
            <span>{downloadStarted ? "Download Again" : "Download Now"}</span>
          </a>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
