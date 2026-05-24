import React from "react";
import { LayoutDashboard, FolderOpen, Users, Terminal, LogOut, ShieldAlert } from "lucide-react";

export default function AdminLayout({ children, currentPath, navigate }) {
  const handleLogout = async () => {
    try {
      const response = await fetch("/api/admin/logout", { method: "POST" });
      if (response.ok) {
        sessionStorage.removeItem("admin_authenticated");
        sessionStorage.removeItem("admin_last_check");
        navigate("/admin/login");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navItems = [
    { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { label: "Files", path: "/admin/files", icon: FolderOpen },
    { label: "Users", path: "/admin/users", icon: Users },
    { label: "Logs", path: "/admin/logs", icon: Terminal },
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative" }}>
      {/* Ambient background glows */}
      <div className="ambient-glow glow-1"></div>
      <div className="ambient-glow glow-2"></div>

      <nav>
        <div className="nav-container">
          <div className="brand" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
            <ShieldAlert size={24} style={{ color: "var(--accent-purple)" }} />
            PageStream Admin
          </div>
          <div className="nav-links">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`btn ${isActive ? "btn-primary" : "btn-secondary"}`}
                  style={{
                    padding: "0.5rem 1rem",
                    fontSize: "0.85rem",
                    border: isActive ? "none" : "1px solid var(--glass-border)",
                  }}
                >
                  <Icon size={16} />
                  {item.label}
                </button>
              );
            })}
            <button
              onClick={handleLogout}
              className="btn btn-danger"
              style={{
                padding: "0.5rem 1rem",
                fontSize: "0.85rem",
              }}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main style={{ flex: 1, zIndex: 10, position: "relative" }}>
        {children}
      </main>
    </div>
  );
}
