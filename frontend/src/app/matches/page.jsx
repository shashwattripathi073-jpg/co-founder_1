"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import DashboardLayout from "../../components/DashboardLayout";
import { useAuth } from "../../context/AuthContext";

export default function MatchesPage() {
  const { API } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      const res = await axios.get(`${API}/match/recommendations`);
      setMatches(res.data || []);
    } catch (err) { console.log(err); } finally { setLoading(false); }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "#34d399";
    if (score >= 60) return "#fbbf24";
    return "#f472b6";
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700 }}>🧠 AI-Powered Matches</h1>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 6 }}>
            Smart recommendations based on skill complementarity, shared interests, and compatibility analysis.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "var(--text-tertiary)" }}>Finding your best matches...</div>
        ) : matches.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {matches.map((m, i) => (
              <div key={m.user._id} className="glass-card" style={{ padding: 24, display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
                {/* Rank */}
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: i < 3 ? "var(--gradient-brand)" : "var(--bg-card)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, color: i < 3 ? "#fff" : "var(--text-tertiary)", flexShrink: 0, border: i >= 3 ? "1px solid var(--border-subtle)" : "none" }}>
                  {i + 1}
                </div>

                {/* Avatar */}
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(99,102,241,0.15)", color: "var(--primary-300)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 20, flexShrink: 0, overflow: "hidden" }}>
                  {m.user.avatar ? <img src={m.user.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : m.user.name?.[0]?.toUpperCase()}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>{m.user.name}</div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>{m.user.headline || m.user.university}</div>
                  <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: m.user.role === "founder" ? "rgba(99,102,241,0.1)" : "rgba(16,185,129,0.1)", color: m.user.role === "founder" ? "var(--primary-300)" : "#34d399" }}>
                      {m.user.role === "founder" ? "🚀 Founder" : "🧑‍💻 Candidate"}
                    </span>
                    {m.user.availability && <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "rgba(245,158,11,0.08)", color: "#fbbf24" }}>{m.user.availability}</span>}
                  </div>
                  {m.user.skills?.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
                      {m.user.skills.slice(0, 5).map(s => <span key={s} className="tag-pill">{s}</span>)}
                    </div>
                  )}
                </div>

                {/* Match Score */}
                <div style={{ textAlign: "center", padding: "12px 16px", borderRadius: 14, background: `${getScoreColor(m.matchScore)}12`, border: `1px solid ${getScoreColor(m.matchScore)}25` }}>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 800, color: getScoreColor(m.matchScore) }}>{m.matchScore}%</div>
                  <div style={{ fontSize: 10, color: "var(--text-tertiary)", marginTop: 2 }}>Match</div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <Link href={`/profile/${m.user._id}`} className="btn-primary" style={{ padding: "8px 20px", fontSize: 12, justifyContent: "center" }}>View Profile</Link>
                  <Link href={`/profile/${m.user._id}`} className="btn-secondary" style={{ padding: "8px 20px", fontSize: 12, justifyContent: "center" }}>🤝 Connect</Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: 80, color: "var(--text-tertiary)" }}>
            <span style={{ fontSize: 64 }}>🧠</span>
            <h3 style={{ marginTop: 16, fontSize: 18, fontWeight: 600, color: "var(--text-primary)" }}>No matches yet</h3>
            <p style={{ marginTop: 8, maxWidth: 400, margin: "8px auto" }}>Complete your profile with skills, interests, and preferences to get AI-powered co-founder recommendations.</p>
            <Link href="/profile" className="btn-primary" style={{ marginTop: 20, display: "inline-flex", padding: "12px 28px", fontSize: 14 }}>Complete Profile →</Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
