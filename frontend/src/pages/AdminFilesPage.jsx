import React, { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import { FolderOpen, Search, Trash2, ExternalLink, Brush, Key, Check } from "lucide-react";

export default function AdminFilesPage({ navigate }) {
  const [files, setFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [maintenanceMsg, setMaintenanceMsg] = useState("");

  const fetchFiles = async (query = "") => {
    try {
      const response = await fetch(`/api/admin/files?q=${encodeURIComponent(query)}`);
      if (response.status === 401) {
        navigate("/admin/login");
        return;
      }
      if (response.ok) {
        const data = await response.json();
        setFiles(data);
      }
    } catch (err) {
      console.error("Failed to fetch files:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles(searchQuery);
  }, [searchQuery]);

  const handleDeleteFile = async (hash, fileName) => {
    if (!confirm(`Are you sure you want to delete file "${fileName}"?`)) return;
    setActionLoading(true);
    try {
      const response = await fetch(`/admin/files/delete/${hash}`, { method: "POST" });
      if (response.ok) {
        await fetchFiles(searchQuery);
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete file");
      }
    } catch (err) {
      console.error("Delete file error:", err);
      alert("Error connecting to server");
    } finally {
      setActionLoading(false);
    }
  };

  const handleClearUnusedFiles = async () => {
    if (!confirm("Delete all files not viewed in over 5 days?")) return;
    setActionLoading(true);
    setMaintenanceMsg("");
    try {
      const response = await fetch("/admin/maintenance/clear_unused_files", { method: "POST" });
      const data = await response.json();
      if (response.ok) {
        setMaintenanceMsg(`Success! Deleted ${data.deleted_count} unused files.`);
        await fetchFiles(searchQuery);
      } else {
        setMaintenanceMsg(`Failed: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      setMaintenanceMsg("Error clearing unused files");
    } finally {
      setActionLoading(false);
    }
  };

  const handleClearTokens = async () => {
    if (!confirm("Delete all expired user tokens?")) return;
    setActionLoading(true);
    setMaintenanceMsg("");
    try {
      const response = await fetch("/admin/maintenance/clear_tokens", { method: "POST" });
      const data = await response.json();
      if (response.ok) {
        setMaintenanceMsg(`Success! Cleared ${data.deleted_count} expired tokens.`);
      } else {
        setMaintenanceMsg(`Failed: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      setMaintenanceMsg("Error clearing expired tokens");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AdminLayout currentPath="/admin/files" navigate={navigate}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>
        {/* Maintenance Card */}
        <div className="glass-card" style={{ marginBottom: "2.5rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "10px" }}>
            <Brush size={22} style={{ color: "var(--accent-purple)" }} />
            Smart Maintenance
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: "1.5rem" }}>
            Free up server space and database capacity by clearing out unused files and expired tokens.
          </p>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
            <button
              onClick={handleClearUnusedFiles}
              disabled={actionLoading}
              className="btn"
              style={{
                background: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
                color: "white",
              }}
            >
              <Trash2 size={16} /> Delete Unused Files (&gt;5 days)
            </button>
            <button
              onClick={handleClearTokens}
              disabled={actionLoading}
              className="btn btn-primary"
            >
              <Key size={16} /> Clear Expired Tokens
            </button>

            {maintenanceMsg && (
              <span style={{ fontSize: "0.9rem", color: "var(--accent-teal)", display: "flex", alignItems: "center", gap: "6px" }}>
                <Check size={16} /> {maintenanceMsg}
              </span>
            )}
          </div>
        </div>

        {/* Page Header */}
        <div className="page-header" style={{ flexDirection: "row", justifyContent: "between", alignItems: "center" }}>
          <div>
            <h1>Manage Files</h1>
            <p>{files.length} files currently indexed</p>
          </div>

          <div style={{ position: "relative", width: "100%", maxWidth: "320px", marginLeft: "auto" }}>
            <span style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)", display: "flex", alignItems: "center" }}>
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search by name or hash..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: "2.75rem" }}
            />
          </div>
        </div>

        {/* Files Card */}
        <div className="glass-card">
          {loading ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)" }}>
              Loading files list...
            </div>
          ) : (
            <div className="table-responsive">
              <table aria-label="Files list">
                <thead>
                  <tr>
                    <th scope="col">Filename</th>
                    <th scope="col">Size</th>
                    <th scope="col">Views</th>
                    <th scope="col">Created At</th>
                    <th scope="col" style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {files.length > 0 ? (
                    files.map((file) => (
                      <tr key={file.public_hash}>
                        <td>
                          <div
                            style={{
                              fontWeight: 500,
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              maxWidth: "400px",
                            }}
                            title={file.file_name}
                          >
                            {file.file_name}
                          </div>
                        </td>
                        <td style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                          {(file.file_size / (1024 * 1024)).toFixed(2)} MB
                        </td>
                        <td>{file.seen_count || 0}</td>
                        <td style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                          {file.created_at ? new Date(file.created_at).toLocaleString() : "Unknown"}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: "0.5rem" }}>
                            <a
                              href={`/watch/f/${file.public_hash}/${encodeURIComponent(file.file_name)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-secondary"
                              style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem", borderRadius: "8px" }}
                            >
                              <ExternalLink size={14} /> Stream
                            </a>
                            <button
                              onClick={() => handleDeleteFile(file.public_hash, file.file_name)}
                              disabled={actionLoading}
                              className="btn btn-danger"
                              style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem", borderRadius: "8px" }}
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: "center", color: "var(--text-secondary)", padding: "3rem 1rem" }}>
                        No files found matching search query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
