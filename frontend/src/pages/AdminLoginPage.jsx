import React, { useState } from "react";
import { Lock, Eye, EyeOff, ShieldCheck, AlertCircle } from "lucide-react";

export default function AdminLoginPage({ navigate }) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        sessionStorage.setItem("admin_authenticated", "true");
        sessionStorage.setItem("admin_last_check", Date.now().toString());
        navigate("/admin");
      } else {
        setError(data.error || "Authentication failed");
      }
    } catch (err) {
      console.error("Login request error:", err);
      setError("Unable to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        position: "relative",
      }}
    >
      <div className="ambient-glow glow-1"></div>
      <div className="ambient-glow glow-2"></div>

      <div
        className="glass-card"
        style={{
          width: "100%",
          maxWidth: "420px",
          textAlign: "center",
          zIndex: 10,
          position: "relative",
          animation: "fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <div
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "18px",
            background: "rgba(168, 85, 247, 0.1)",
            color: "var(--accent-purple)",
            border: "1px solid rgba(168, 85, 247, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.5rem",
          }}
        >
          <ShieldCheck size={28} />
        </div>

        <h1 style={{ fontSize: "1.8rem", marginBottom: "0.5rem", fontWeight: "800" }}>Admin Access</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "2rem" }}>
          Please enter the administrator password to manage PageStream.
        </p>

        {error && (
          <div
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              borderRadius: "10px",
              padding: "0.75rem 1rem",
              color: "#fca5a5",
              fontSize: "0.85rem",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "1.5rem",
              textAlign: "left",
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div style={{ position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: "1rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-secondary)",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Lock size={18} />
            </span>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ paddingLeft: "2.75rem", paddingRight: "2.75rem" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "1rem",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: "var(--text-secondary)",
                cursor: "pointer",
                padding: 0,
                display: "flex",
                alignItems: "center",
              }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button type="submit" className="btn btn-primary" style={{ padding: "0.85rem" }} disabled={loading}>
            {loading ? "Authenticating..." : "Unlock Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}
