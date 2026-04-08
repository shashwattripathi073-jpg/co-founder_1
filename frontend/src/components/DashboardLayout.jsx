"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { href: "/dashboard", icon: "📊", label: "Dashboard" },
  { href: "/profile", icon: "👤", label: "My Profile" },
  { href: "/ideas", icon: "💡", label: "Startup Ideas" },
  { href: "/search", icon: "🔍", label: "Search" },
  { href: "/matches", icon: "🎯", label: "Matches" },
  { href: "/requests", icon: "🤝", label: "Requests" },
  { href: "/chat", icon: "💬", label: "Chat" },
];

const ADMIN_ITEMS = [
  { href: "/admin", icon: "⚙️", label: "Admin Panel" },
];

export default function DashboardLayout({ children }) {
  const { user, logout, isLoggedIn, loading, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push("/login");
    }
  }, [loading, isLoggedIn, router]);

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loadingSpinner} />
        <p style={{ color: "var(--text-secondary)", marginTop: 16 }}>Loading...</p>
      </div>
    );
  }

  if (!isLoggedIn) return null;

  const allNavItems = [...NAV_ITEMS, ...(isAdmin ? ADMIN_ITEMS : [])];

  return (
    <div style={styles.layout}>
      {/* Sidebar */}
      <aside
        style={{
          ...styles.sidebar,
          ...(sidebarOpen ? styles.sidebarOpen : {}),
        }}
        className="dashboard-sidebar"
      >
        {/* Logo */}
        <div style={styles.sidebarHeader}>
          <Link href="/dashboard" style={styles.logoRow}>
            <div style={styles.logoIcon}>C</div>
            <span style={styles.logoText}>
              Co<span className="gradient-text">Founder</span>
            </span>
          </Link>
          <button
            style={styles.closeSidebar}
            className="sidebar-close-btn"
            onClick={() => setSidebarOpen(false)}
          >
            ✕
          </button>
        </div>

        {/* Nav links */}
        <nav style={styles.nav}>
          {allNavItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                style={{
                  ...styles.navLink,
                  ...(isActive ? styles.navLinkActive : {}),
                }}
              >
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <span>{item.label}</span>
                {isActive && <div style={styles.activeDot} />}
              </Link>
            );
          })}
        </nav>

        {/* User card at bottom */}
        <div style={styles.userCard}>
          <div style={styles.userAvatar}>
            {user?.avatar ? (
              <img src={user.avatar} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
            ) : (
              user?.name?.[0]?.toUpperCase() || "U"
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user?.name || "User"}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
              {user?.role === "founder" ? "🚀 Founder" : "🧑‍💻 Candidate"}
            </div>
          </div>
          <button onClick={logout} style={styles.logoutBtn} title="Logout">
            🚪
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && <div style={styles.overlay} onClick={() => setSidebarOpen(false)} />}

      {/* Main Content */}
      <main style={styles.main}>
        {/* Top bar */}
        <header style={styles.topBar}>
          <button
            style={styles.menuBtn}
            className="mobile-menu-btn"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>
          <div style={{ flex: 1 }} />
          <div style={styles.topRight}>
            {user?.isVerified && (
              <span style={styles.verifiedBadge} title="Verified">✓ Verified</span>
            )}
            <Link href="/profile" style={styles.topAvatar}>
              {user?.avatar ? (
                <img src={user.avatar} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
              ) : (
                <span style={{ fontSize: 14, fontWeight: 600 }}>{user?.name?.[0]?.toUpperCase()}</span>
              )}
            </Link>
          </div>
        </header>

        {/* Page content */}
        <div style={styles.content}>
          {children}
        </div>
      </main>

      <style jsx global>{`
        @media (max-width: 860px) {
          .dashboard-sidebar {
            position: fixed !important;
            transform: translateX(-100%);
            z-index: 200;
          }
          .dashboard-sidebar.open {
            transform: translateX(0) !important;
          }
          .sidebar-close-btn { display: block !important; }
          .mobile-menu-btn { display: flex !important; }
        }
        @media (min-width: 861px) {
          .sidebar-close-btn { display: none !important; }
          .mobile-menu-btn { display: none !important; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  layout: {
    display: "flex",
    minHeight: "100vh",
    background: "var(--bg-primary)",
  },
  sidebar: {
    width: 260,
    background: "var(--bg-secondary)",
    borderRight: "1px solid var(--border-subtle)",
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
    position: "sticky",
    top: 0,
    height: "100vh",
    overflow: "hidden",
    transition: "transform 0.3s ease",
  },
  sidebarOpen: {
    transform: "translateX(0) !important",
  },
  sidebarHeader: {
    padding: "20px 20px 16px",
    borderBottom: "1px solid var(--border-subtle)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  closeSidebar: {
    background: "none",
    border: "none",
    color: "var(--text-secondary)",
    fontSize: 20,
    cursor: "pointer",
    display: "none",
  },
  logoRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    textDecoration: "none",
  },
  logoIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    background: "var(--gradient-brand)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: 16,
    color: "#fff",
  },
  logoText: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 700,
    fontSize: 19,
    color: "var(--text-primary)",
    letterSpacing: "-0.02em",
  },
  nav: {
    flex: 1,
    padding: "16px 12px",
    display: "flex",
    flexDirection: "column",
    gap: 4,
    overflowY: "auto",
  },
  navLink: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 14px",
    borderRadius: 10,
    textDecoration: "none",
    color: "var(--text-secondary)",
    fontSize: 14,
    fontWeight: 500,
    transition: "all 0.2s",
    position: "relative",
  },
  navLinkActive: {
    background: "rgba(99,102,241,0.1)",
    color: "var(--primary-300)",
    fontWeight: 600,
  },
  activeDot: {
    position: "absolute",
    right: 12,
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "var(--primary-400)",
  },
  userCard: {
    padding: "16px 16px",
    borderTop: "1px solid var(--border-subtle)",
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "rgba(99,102,241,0.15)",
    color: "var(--primary-300)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 16,
    flexShrink: 0,
    overflow: "hidden",
  },
  logoutBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 18,
    opacity: 0.6,
    transition: "opacity 0.2s",
    padding: 4,
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    zIndex: 199,
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  topBar: {
    height: 60,
    borderBottom: "1px solid var(--border-subtle)",
    display: "flex",
    alignItems: "center",
    padding: "0 24px",
    background: "rgba(10,10,18,0.8)",
    backdropFilter: "blur(10px)",
    position: "sticky",
    top: 0,
    zIndex: 50,
  },
  menuBtn: {
    background: "none",
    border: "none",
    color: "var(--text-primary)",
    fontSize: 24,
    cursor: "pointer",
    display: "none",
    alignItems: "center",
    justifyContent: "center",
  },
  topRight: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  verifiedBadge: {
    fontSize: 11,
    fontWeight: 600,
    padding: "3px 10px",
    borderRadius: 20,
    background: "rgba(16,185,129,0.12)",
    color: "#34d399",
    border: "1px solid rgba(16,185,129,0.2)",
  },
  topAvatar: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    background: "rgba(99,102,241,0.15)",
    color: "var(--primary-300)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    textDecoration: "none",
  },
  content: {
    flex: 1,
    padding: "24px",
    overflowY: "auto",
  },
  loadingPage: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--bg-primary)",
  },
  loadingSpinner: {
    width: 40,
    height: 40,
    border: "3px solid rgba(99,102,241,0.2)",
    borderTopColor: "var(--primary-400)",
    borderRadius: "50%",
    animation: "spin-slow 0.8s linear infinite",
  },
};
