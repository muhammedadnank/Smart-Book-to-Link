import React, { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import { Users, ShieldCheck, FileText, Cpu, HardDrive, Play, ChevronRight, Activity, Terminal } from "lucide-react";

export default function AdminDashboardPage({ navigate }) {
  const [stats, setStats] = useState({
    total_users: 0,
    authorized_users: 0,
    total_files: 0,
    cpu: 0,
    ram: 0,
    uptime: "0h 0m",
    active_clients: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      if (response.status === 401) {
        navigate("/admin/login");
        return;
      }
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Poll stats every 5 seconds
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AdminLayout currentPath="/admin" navigate={navigate}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>
        <div className="page-header">
          <h1>System Overview</h1>
          <p>Monitor your web server status, files and active user database.</p>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)" }}>
            Loading system overview...
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="admin-stats-grid">
              <div className="stat-card">
                <span className="stat-label">Total Registered Users</span>
                <span className="stat-value">{stats.total_users}</span>
                <Users size={32} className="stat-card-icon" />
              </div>

              <div className="stat-card">
                <span className="stat-label">Authorized Users</span>
                <span className="stat-value">{stats.authorized_users}</span>
                <ShieldCheck size={32} className="stat-card-icon" />
              </div>

              <div className="stat-card">
                <span className="stat-label">Total Files Saved</span>
                <span className="stat-value">{stats.total_files}</span>
                <FileText size={32} className="stat-card-icon" />
              </div>

              <div className="stat-card">
                <span className="stat-label">CPU Usage</span>
                <span className="stat-value">{stats.cpu}%</span>
                <div className="metric-progress">
                  <div
                    className="metric-bar"
                    style={{
                      width: `${stats.cpu}%`,
                      background: "linear-gradient(90deg, var(--accent-blue), var(--accent-purple))",
                    }}
                  ></div>
                </div>
                <Cpu size={32} className="stat-card-icon" />
              </div>

              <div className="stat-card">
                <span className="stat-label">RAM Usage</span>
                <span className="stat-value">{stats.ram}%</span>
                <div className="metric-progress">
                  <div
                    className="metric-bar"
                    style={{
                      width: `${stats.ram}%`,
                      background: "linear-gradient(90deg, #34d399, #059669)",
                    }}
                  ></div>
                </div>
                <HardDrive size={32} className="stat-card-icon" />
              </div>
            </div>

            {/* Dashboard Sections */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: "2rem",
              }}
            >
              {/* Quick Actions Card */}
              <div className="glass-card" style={{ padding: "2rem" }}>
                <h2 style={{ display: "flex", alignItems: "center", gap: "10px", paddingBottom: "0.75rem", borderBottom: "1px solid rgba(255, 255, 255, 0.05)", marginBottom: "1.25rem", fontSize: "1.35rem" }}>
                  <Play size={20} style={{ color: "var(--accent-purple)" }} />
                  Quick Actions
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <button onClick={() => navigate("/admin/files")} className="action-link">
                    <div className="action-info">
                      <span className="action-icon" style={{ background: "rgba(168, 85, 247, 0.1)", color: "var(--accent-purple)" }}>
                        <FileText size={18} />
                      </span>
                      <span>Manage Files</span>
                    </div>
                    <ChevronRight size={16} />
                  </button>

                  <button onClick={() => navigate("/admin/users")} className="action-link">
                    <div className="action-info">
                      <span className="action-icon" style={{ background: "rgba(99, 102, 241, 0.1)", color: "var(--accent-blue)" }}>
                        <Users size={18} />
                      </span>
                      <span>Manage Users</span>
                    </div>
                    <ChevronRight size={16} />
                  </button>

                  <button onClick={() => navigate("/admin/logs")} className="action-link">
                    <div className="action-info">
                      <span className="action-icon" style={{ background: "rgba(52, 211, 153, 0.1)", color: "#34d399" }}>
                        <Terminal size={18} />
                      </span>
                      <span>View Live Logs</span>
                    </div>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Health Stats Card */}
              <div className="glass-card" style={{ padding: "2rem" }}>
                <h2 style={{ display: "flex", alignItems: "center", gap: "10px", paddingBottom: "0.75rem", borderBottom: "1px solid rgba(255, 255, 255, 0.05)", marginBottom: "1.25rem", fontSize: "1.35rem" }}>
                  <Activity size={20} style={{ color: "var(--accent-purple)" }} />
                  Recent System Health
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div className="activity-item" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 0", borderBottom: "1px solid rgba(255, 255, 255, 0.03)" }}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: "0.92rem", fontWeight: 600 }}>Uptime</span>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{stats.uptime}</span>
                    </div>
                    <span className="badge badge-active">Active</span>
                  </div>

                  <div className="activity-item" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 0", borderBottom: "1px solid rgba(255, 255, 255, 0.03)" }}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: "0.92rem", fontWeight: 600 }}>Telegram Clients</span>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Active sessions</span>
                    </div>
                    <span className="badge badge-auth">{stats.active_clients}</span>
                  </div>

                  <div className="activity-item" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 0" }}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: "0.92rem", fontWeight: 600 }}>Files in Database</span>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Total indexed</span>
                    </div>
                    <span className="badge badge-owner">{stats.total_files}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
