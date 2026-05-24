import React, { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import { Users, Search, Ban, CheckCircle, ShieldAlert, XCircle, ShieldCheck } from "lucide-react";

export default function AdminUsersPage({ navigate }) {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (response.status === 401) {
        navigate("/admin/login");
        return;
      }
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleBanToggle = async (user) => {
    setActionLoading(user.id);
    const endpoint = user.is_banned ? "/api/admin/users/unban" : "/api/admin/users/ban";
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id }),
      });
      if (response.ok) {
        await fetchUsers();
      }
    } catch (err) {
      console.error("Failed to update ban status:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAuthToggle = async (user) => {
    setActionLoading(user.id);
    const endpoint = user.is_authorized ? "/api/admin/users/unauthorize" : "/api/admin/users/authorize";
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id }),
      });
      if (response.ok) {
        await fetchUsers();
      }
    } catch (err) {
      console.error("Failed to update authorization status:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.id.toString().toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout currentPath="/admin/users" navigate={navigate}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>
        <div className="page-header" style={{ flexDirection: "row", justifyContent: "between", alignItems: "center" }}>
          <div>
            <h1>Manage Users</h1>
            <p>{users.length} total registered users</p>
          </div>

          <div style={{ position: "relative", width: "100%", maxWidth: "320px", marginLeft: "auto" }}>
            <span style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)", display: "flex", alignItems: "center" }}>
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search by User ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: "2.75rem" }}
            />
          </div>
        </div>

        <div className="glass-card">
          {loading ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)" }}>
              Loading users database...
            </div>
          ) : (
            <div className="table-responsive">
              <table aria-label="Users list">
                <thead>
                  <tr>
                    <th scope="col">User ID</th>
                    <th scope="col">Role</th>
                    <th scope="col">Status</th>
                    <th scope="col">Joined At</th>
                    <th scope="col" style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td>
                          <code style={{ fontSize: "0.85rem", marginRight: "0.5rem" }}>{user.id}</code>
                          {user.is_owner && <span className="badge badge-owner">Owner</span>}
                          {user.is_authorized && !user.is_owner && <span className="badge badge-auth">Authorized</span>}
                        </td>
                        <td>
                          {user.is_owner ? (
                            <span style={{ color: "#fcd34d", fontSize: "0.85rem", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              <ShieldCheck size={14} /> Owner
                            </span>
                          ) : user.is_authorized ? (
                            <span style={{ color: "#d8b4fe", fontSize: "0.85rem" }}>Authorized</span>
                          ) : (
                            <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>Regular</span>
                          )}
                        </td>
                        <td>
                          {user.is_banned ? (
                            <span className="badge badge-banned">Banned</span>
                          ) : (
                            <span className="badge badge-active">Active</span>
                          )}
                        </td>
                        <td style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                          {user.join_date ? new Date(user.join_date).toLocaleDateString() : "Unknown"}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          {!user.is_owner && (
                            <div style={{ display: "inline-flex", gap: "0.5rem" }}>
                              <button
                                onClick={() => handleAuthToggle(user)}
                                disabled={actionLoading === user.id}
                                className={`btn ${user.is_authorized ? "btn-secondary" : "btn-primary"}`}
                                style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem", borderRadius: "8px" }}
                              >
                                {user.is_authorized ? <XCircle size={14} /> : <CheckCircle size={14} />}
                                {user.is_authorized ? "Deauth" : "Authorize"}
                              </button>
                              <button
                                onClick={() => handleBanToggle(user)}
                                disabled={actionLoading === user.id}
                                className="btn btn-danger"
                                style={{
                                  padding: "0.35rem 0.75rem",
                                  fontSize: "0.8rem",
                                  borderRadius: "8px",
                                  background: user.is_banned ? "rgba(52,211,153,0.1)" : undefined,
                                  borderColor: user.is_banned ? "rgba(52,211,153,0.2)" : undefined,
                                  color: user.is_banned ? "#6ee7b7" : undefined,
                                }}
                              >
                                <Ban size={14} />
                                {user.is_banned ? "Unban" : "Ban"}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: "center", color: "var(--text-secondary)", padding: "3rem 1rem" }}>
                        No users found matching search query.
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
