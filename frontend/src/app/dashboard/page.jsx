"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import DashboardLayout from "../../components/DashboardLayout";
import { useAuth } from "../../context/AuthContext";

export default function DashboardPage() {
  const { user, API } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [myStartups, setMyStartups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [recsRes, reqsRes, startupsRes] = await Promise.allSettled([
        axios.get(`${API}/match/recommendations`),
        axios.get(`${API}/collab/incoming`),
        axios.get(`${API}/startup/my`),
      ]);
      if (recsRes.status === "fulfilled") setRecommendations(recsRes.value.data.slice(0, 4));
      if (reqsRes.status === "fulfilled") setIncomingRequests(reqsRes.value.data.filter(r => r.status === 'pending').slice(0, 3));
      if (startupsRes.status === "fulfilled") setMyStartups(startupsRes.value.data.slice(0, 3));
    } catch (err) {
      console.log("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const completeness = user?.profileCompleteness || 0;

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Welcome Header */}
        <div style={styles.welcomeCard}>
          <div style={styles.welcomeOrb1} />
          <div style={styles.welcomeOrb2} />
          <div style={{ position: "relative", zIndex: 2 }}>
            <h1 style={styles.welcomeTitle}>
              Welcome back, <span className="gradient-text">{user?.name?.split(" ")[0] || "Builder"}</span> 👋
            </h1>
            <p style={styles.welcomeSub}>
              {user?.role === "founder"
                ? "Manage your startup ideas and find the perfect co-founder."
                : "Discover startup opportunities and connect with founders."}
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>👤</div>
            <div>
              <div style={styles.statValue}>{completeness}%</div>
              <div style={styles.statLabel}>Profile Complete</div>
            </div>
            <div style={styles.progressBar}>
              <div style={{ ...styles.progressFill, width: `${completeness}%` }} />
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>🎯</div>
            <div>
              <div style={styles.statValue}>{recommendations.length}</div>
              <div style={styles.statLabel}>Matches Found</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>🤝</div>
            <div>
              <div style={styles.statValue}>{incomingRequests.length}</div>
              <div style={styles.statLabel}>Pending Requests</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>💡</div>
            <div>
              <div style={styles.statValue}>{myStartups.length}</div>
              <div style={styles.statLabel}>My Ideas</div>
            </div>
          </div>
        </div>

        {/* Profile Completeness CTA */}
        {completeness < 70 && (
          <div style={styles.ctaBanner}>
            <span style={{ fontSize: 24 }}>✨</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 15 }}>Complete your profile to get better matches</div>
              <div style={{ fontSize: 13, color: "var(--text-tertiary)", marginTop: 2 }}>
                Add your skills, interests, and bio to improve your match score.
              </div>
            </div>
            <Link href="/profile" className="btn-primary" style={{ padding: "10px 24px", fontSize: 13 }}>
              Complete Profile →
            </Link>
          </div>
        )}

        {/* Two Column Layout */}
        <div style={styles.twoCol}>
          {/* Top Matches */}
          <div>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>🎯 Top Matches</h2>
              <Link href="/matches" style={styles.viewAll}>View All →</Link>
            </div>
            {loading ? (
              <div style={styles.emptyCard}>Loading recommendations...</div>
            ) : recommendations.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {recommendations.map((rec) => (
                  <div key={rec.user._id} className="glass-card" style={styles.matchCard}>
                    <div style={styles.matchAvatar}>
                      {rec.user.avatar ? (
                        <img src={rec.user.avatar} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                      ) : (
                        rec.user.name?.[0]?.toUpperCase()
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{rec.user.name}</div>
                      <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                        {rec.user.headline || rec.user.university || rec.user.role}
                      </div>
                    </div>
                    <span style={styles.matchScore}>{rec.matchScore}%</span>
                    <Link href={`/profile/${rec.user._id}`} style={styles.viewBtn}>View</Link>
                  </div>
                ))}
              </div>
            ) : (
              <div style={styles.emptyCard}>
                <span style={{ fontSize: 32 }}>🔍</span>
                <p>Complete your profile to see co-founder recommendations!</p>
              </div>
            )}
          </div>

          {/* Incoming Requests */}
          <div>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>🤝 Incoming Requests</h2>
              <Link href="/requests" style={styles.viewAll}>View All →</Link>
            </div>
            {loading ? (
              <div style={styles.emptyCard}>Loading requests...</div>
            ) : incomingRequests.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {incomingRequests.map((req) => (
                  <div key={req._id} className="glass-card" style={styles.matchCard}>
                    <div style={styles.matchAvatar}>
                      {req.senderId?.name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{req.senderId?.name}</div>
                      <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                        {req.message?.substring(0, 50) || "Wants to connect"}
                      </div>
                    </div>
                    <Link href="/requests" className="btn-primary" style={{ padding: "6px 16px", fontSize: 12 }}>
                      Respond
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div style={styles.emptyCard}>
                <span style={{ fontSize: 32 }}>📬</span>
                <p>No pending requests yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>⚡ Quick Actions</h2>
        </div>
        <div style={styles.actionsGrid}>
          <Link href="/search" className="glass-card" style={styles.actionCard}>
            <span style={{ fontSize: 32 }}>🔍</span>
            <div style={{ fontWeight: 600, fontSize: 15 }}>Search Co-Founders</div>
            <div style={{ fontSize: 13, color: "var(--text-tertiary)" }}>Browse by skills, domain & location</div>
          </Link>
          <Link href="/ideas" className="glass-card" style={styles.actionCard}>
            <span style={{ fontSize: 32 }}>💡</span>
            <div style={{ fontWeight: 600, fontSize: 15 }}>
              {user?.role === "founder" ? "Post Startup Idea" : "Browse Ideas"}
            </div>
            <div style={{ fontSize: 13, color: "var(--text-tertiary)" }}>
              {user?.role === "founder" ? "Share your vision & find co-founders" : "Find startups looking for you"}
            </div>
          </Link>
          <Link href="/chat" className="glass-card" style={styles.actionCard}>
            <span style={{ fontSize: 32 }}>💬</span>
            <div style={{ fontWeight: 600, fontSize: 15 }}>Messages</div>
            <div style={{ fontSize: 13, color: "var(--text-tertiary)" }}>Chat with your connections</div>
          </Link>
          <Link href="/matches" className="glass-card" style={styles.actionCard}>
            <span style={{ fontSize: 32 }}>🧠</span>
            <div style={{ fontWeight: 600, fontSize: 15 }}>AI Matches</div>
            <div style={{ fontSize: 13, color: "var(--text-tertiary)" }}>See your top compatibility scores</div>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}

const styles = {
  welcomeCard: {
    position: "relative",
    padding: "36px 32px",
    borderRadius: 20,
    background: "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08), rgba(236,72,153,0.08))",
    border: "1px solid rgba(99,102,241,0.15)",
    marginBottom: 24,
    overflow: "hidden",
  },
  welcomeOrb1: {
    position: "absolute", width: 200, height: 200, borderRadius: "50%",
    background: "rgba(99,102,241,0.15)", filter: "blur(60px)", top: -40, right: -20,
  },
  welcomeOrb2: {
    position: "absolute", width: 150, height: 150, borderRadius: "50%",
    background: "rgba(236,72,153,0.1)", filter: "blur(60px)", bottom: -30, left: "30%",
  },
  welcomeTitle: {
    fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700,
    letterSpacing: "-0.02em", marginBottom: 8,
  },
  welcomeSub: { fontSize: 15, color: "var(--text-secondary)", maxWidth: 500 },
  statsGrid: {
    display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 16, marginBottom: 24,
  },
  statCard: {
    background: "var(--bg-card)", border: "1px solid var(--border-subtle)",
    borderRadius: 14, padding: "20px 18px", display: "flex", flexDirection: "column", gap: 10,
  },
  statIcon: { fontSize: 24 },
  statValue: {
    fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700,
    letterSpacing: "-0.02em",
  },
  statLabel: { fontSize: 12, color: "var(--text-tertiary)" },
  progressBar: {
    height: 4, borderRadius: 2, background: "var(--border-subtle)", overflow: "hidden",
  },
  progressFill: {
    height: "100%", borderRadius: 2,
    background: "var(--gradient-brand)", transition: "width 0.3s",
  },
  ctaBanner: {
    display: "flex", alignItems: "center", gap: 16, padding: "16px 20px",
    borderRadius: 14, background: "rgba(99,102,241,0.06)",
    border: "1px solid rgba(99,102,241,0.15)", marginBottom: 24, flexWrap: "wrap",
  },
  twoCol: {
    display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
    gap: 24, marginBottom: 32,
  },
  sectionHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700,
  },
  viewAll: {
    fontSize: 13, color: "var(--primary-400)", textDecoration: "none", fontWeight: 500,
  },
  matchCard: {
    display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
  },
  matchAvatar: {
    width: 40, height: 40, borderRadius: "50%",
    background: "rgba(99,102,241,0.15)", color: "var(--primary-300)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 700, fontSize: 16, flexShrink: 0, overflow: "hidden",
  },
  matchScore: {
    fontSize: 13, fontWeight: 700, color: "#34d399",
    padding: "3px 10px", borderRadius: 20,
    background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.2)",
  },
  viewBtn: {
    fontSize: 12, fontWeight: 500, color: "var(--primary-300)",
    textDecoration: "none", padding: "5px 12px", borderRadius: 8,
    border: "1px solid rgba(99,102,241,0.2)",
  },
  emptyCard: {
    padding: "40px 20px", textAlign: "center", borderRadius: 14,
    background: "var(--bg-card)", border: "1px solid var(--border-subtle)",
    color: "var(--text-tertiary)", fontSize: 14, display: "flex",
    flexDirection: "column", alignItems: "center", gap: 10,
  },
  actionsGrid: {
    display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 16, marginBottom: 32,
  },
  actionCard: {
    padding: "24px 20px", display: "flex", flexDirection: "column",
    gap: 8, textDecoration: "none", cursor: "pointer",
  },
};
