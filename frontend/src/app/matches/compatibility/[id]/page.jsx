"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import DashboardLayout from "../../../../components/DashboardLayout";
import { useAuth } from "../../../../context/AuthContext";

export default function DeepCompatibilityPage() {
  const { id } = useParams();
  const { API } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/match/compatibility/${id}`)
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <DashboardLayout><div style={{ padding: 60, textAlign: "center" }}>Analyzing compatibility...</div></DashboardLayout>;
  if (!data) return <DashboardLayout><div style={{ padding: 60, textAlign: "center" }}>Data not found.</div></DashboardLayout>;

  const { user, breakdown } = data;
  const cats = breakdown.categories;

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <div style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
          <Link href={`/profile/${id}`} style={{ textDecoration: "none", fontSize: 20 }}>←</Link>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700 }}>🧠 Deep Match Analysis</h1>
        </div>

        <div className="glass-card" style={{ padding: 32, marginBottom: 24, textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -50, right: -50, width: 200, height: 200, background: "rgba(16,185,129,0.1)", borderRadius: "50%", filter: "blur(60px)" }} />
          
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 40, marginBottom: 24 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--gradient-brand)", padding: 2, marginBottom: 8 }}>
                <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>You</div>
              </div>
            </div>
            <div style={{ fontSize: 24, opacity: 0.5 }}>⚡</div>
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--gradient-brand)", padding: 2, marginBottom: 8 }}>
                <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, overflow: "hidden" }}>
                  {user.avatar ? <img src={user.avatar} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : user.name[0]}
                </div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{user.name}</div>
            </div>
          </div>

          <div style={{ position: "relative", display: "inline-block" }}>
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
              <circle cx="60" cy="60" r="54" fill="none" stroke="#34d399" strokeWidth="8" strokeDasharray={`${breakdown.overall * 3.39} 339`} transform="rotate(-90 60 60)" strokeLinecap="round" style={{ transition: "stroke-dasharray 1s ease-out" }} />
            </svg>
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#34d399" }}>{breakdown.overall}%</div>
              <div style={{ fontSize: 10, fontWeight: 600, opacity: 0.5, textTransform: "uppercase" }}>Match</div>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
          {Object.entries(cats).map(([key, cat]) => (
            <div key={key} className="glass-card" style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600 }}>{cat.label}</h3>
                <span style={{ fontSize: 13, fontWeight: 700, color: cat.score >= 70 ? "#34d399" : "#fbbf24" }}>{cat.score}%</span>
              </div>
              
              <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.05)", marginBottom: 16 }}>
                <div style={{ height: "100%", borderRadius: 3, width: `${cat.score}%`, background: cat.score >= 70 ? "#34d399" : "#fbbf24" }} />
              </div>

              {cat.common?.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 6 }}>Common {key}:</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {cat.common.map(item => <span key={item} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-subtle)" }}>{item}</span>)}
                  </div>
                </div>
              )}
              
              {key === "role" && (
                <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  {cat.score >= 80 ? "Perfect role complementarity! One of you is a founder and the other is a candidate." : "You both share similar roles, which can be great for technical teams but may require more role definition."}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="glass-card" style={{ marginTop: 24, padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>🤖 AI Insight</h3>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>
            {breakdown.overall >= 80 
              ? `You and ${user.name} have exceptional synergy. Your skills complement each other well, and your shared interests in ${cats.interests.common.join(", ")} provide a strong foundation for a partnership. We highly recommend connecting!`
              : breakdown.overall >= 60
                ? `There's good potential here. While there are some differences in ${cats.availability.score < 70 ? "availability" : "work style"}, your shared passion for ${cats.interests.common[0] || "startups"} makes this worth a conversation.`
                : `This match might be challenging due to differing ${cats.skills.score < 50 ? "skill sets" : "goals"}. However, a quick chat could reveal hidden synergies not captured by our current algorithm.`
            }
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
            <Link href={`/chat?user=${id}`} className="btn-primary" style={{ flex: 1, justifyContent: "center" }}>Start Conversation</Link>
            <Link href={`/profile/${id}`} className="btn-secondary" style={{ flex: 1, justifyContent: "center" }}>Back to Profile</Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
