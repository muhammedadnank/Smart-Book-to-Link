import React, { useState, useEffect, useRef } from "react";
import AdminLayout from "../components/AdminLayout";
import { Terminal, RefreshCw, ArrowDown, Search } from "lucide-react";

export default function AdminLogsPage({ navigate }) {
  const [logs, setLogs] = useState("");
  const [logPath, setLogPath] = useState("Unknown");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const logContainerRef = useRef(null);

  const fetchLogs = async () => {
    setRefreshing(true);
    try {
      const response = await fetch("/api/admin/logs");
      if (response.status === 401) {
        navigate("/admin/login");
        return;
      }
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs);
        setLogPath(data.log_path);
      }
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const scrollToBottom = () => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  };

  // Auto scroll to bottom on first load
  useEffect(() => {
    if (logs && logContainerRef.current) {
      scrollToBottom();
    }
  }, [logs]);

  const getFilteredLogs = () => {
    if (!searchQuery) return logs;
    const lines = logs.split("\n");
    return lines
      .filter((line) => line.toLowerCase().includes(searchQuery.toLowerCase()))
      .join("\n");
  };

  return (
    <AdminLayout currentPath="/admin/logs" navigate={navigate}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>
        <div className="page-header" style={{ flexDirection: "row", justifyContent: "between", alignItems: "center" }}>
          <div>
            <h1>Live Logs</h1>
            <p>File: <code style={{ fontSize: "0.85rem", background: "rgba(255,255,255,0.05)", padding: "0.2rem 0.5rem", borderRadius: "6px" }}>{logPath}</code></p>
          </div>

          <div style={{ display: "flex", gap: "1rem", marginLeft: "auto", width: "100%", maxWidth: "500px" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <span style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)", display: "flex", alignItems: "center" }}>
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder="Filter logs by keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: "2.75rem" }}
              />
            </div>
            <button
              onClick={fetchLogs}
              disabled={refreshing}
              className="btn btn-secondary"
              style={{ flexShrink: 0 }}
            >
              <RefreshCw size={16} className={refreshing ? "spin" : ""} />
              Refresh
            </button>
            <button
              onClick={scrollToBottom}
              className="btn btn-secondary"
              style={{ flexShrink: 0 }}
              title="Scroll to bottom"
            >
              <ArrowDown size={16} />
            </button>
          </div>
        </div>

        <div className="glass-card" style={{ padding: "1.5rem", background: "#050508", border: "1px solid var(--glass-border)" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)" }}>
              Loading server logs...
            </div>
          ) : (
            <div
              ref={logContainerRef}
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.85rem",
                color: "#e2e8f0",
                lineHeight: "1.5",
                whiteSpace: "pre-wrap",
                maxHeight: "60vh",
                overflowY: "auto",
                textAlign: "left",
                padding: "1rem",
                background: "rgba(0,0,0,0.3)",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.02)",
              }}
            >
              {getFilteredLogs() || "No logs matching filter criteria or log file is empty."}
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </AdminLayout>
  );
}
