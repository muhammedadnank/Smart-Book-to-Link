import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminFilesPage from './pages/AdminFilesPage';
import AdminLogsPage from './pages/AdminLogsPage';
import AudioPlayerPage from './pages/AudioPlayerPage';
import EbookReaderPage from './pages/EbookReaderPage';
import DownloadPage from './pages/DownloadPage';

function PageWrapper({ Component }) {
  const navigate = useNavigate();
  return <Component navigate={navigate} />;
}

function ProtectedAdminRoute({ element }) {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [authenticated, setAuthenticated] = React.useState(false);

  React.useEffect(() => {
    const lastCheck = sessionStorage.getItem("admin_last_check");
    const isAuth = sessionStorage.getItem("admin_authenticated") === "true";
    const now = Date.now();

    if (isAuth && lastCheck && now - parseInt(lastCheck) < 300000) {
      setAuthenticated(true);
      setLoading(false);
      return;
    }

    const checkAuth = async () => {
      try {
        const response = await fetch("/api/admin/stats");
        if (response.ok) {
          setAuthenticated(true);
          sessionStorage.setItem("admin_authenticated", "true");
          sessionStorage.setItem("admin_last_check", now.toString());
        } else {
          setAuthenticated(false);
          sessionStorage.removeItem("admin_authenticated");
          sessionStorage.removeItem("admin_last_check");
          navigate("/admin/login");
        }
      } catch (err) {
        setAuthenticated(false);
        sessionStorage.removeItem("admin_authenticated");
        sessionStorage.removeItem("admin_last_check");
        navigate("/admin/login");
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", color: "var(--text-secondary)", background: "#0a0a16", fontFamily: "system-ui" }}>
        <div className="ambient-glow glow-1"></div>
        <div className="ambient-glow glow-2"></div>
        <div style={{ zIndex: 10 }}>Verifying credentials...</div>
      </div>
    );
  }

  return authenticated ? element : null;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PageWrapper Component={HomePage} />} />
        <Route path="/admin/login" element={<PageWrapper Component={AdminLoginPage} />} />
        <Route path="/admin" element={<ProtectedAdminRoute element={<PageWrapper Component={AdminDashboardPage} />} />} />
        <Route path="/admin/users" element={<ProtectedAdminRoute element={<PageWrapper Component={AdminUsersPage} />} />} />
        <Route path="/admin/files" element={<ProtectedAdminRoute element={<PageWrapper Component={AdminFilesPage} />} />} />
        <Route path="/admin/logs" element={<ProtectedAdminRoute element={<PageWrapper Component={AdminLogsPage} />} />} />
        <Route path="/watch/audio" element={<PageWrapper Component={AudioPlayerPage} />} />
        <Route path="/watch/ebook" element={<PageWrapper Component={EbookReaderPage} />} />
        <Route path="/watch/download" element={<PageWrapper Component={DownloadPage} />} />
      </Routes>
    </BrowserRouter>
  );
}

