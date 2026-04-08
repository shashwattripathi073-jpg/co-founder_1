"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import DashboardLayout from "../../../components/DashboardLayout";
import { useAuth } from "../../../context/AuthContext";

export default function PublicProfilePage() {
  const { id } = useParams();
  const { user: currentUser, API } = useAuth();
  const [profile, setProfile] = useState(null);
  const [compatibility, setCompatibility] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestSent, setRequestSent] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");

  useEffect(() => {
    loadProfile();
  }, [id]);

  const loadProfile = async () => {
    try {
      const [profileRes, compatRes, feedbackRes] = await Promise.allSettled([
        axios.get(`${API}/user/profile/${id}`),
        axios.get(`${API}/match/compatibility/${id}`),
        axios.get(`${API}/feedback/user/${id}`),
      ]);
      if (profileRes.status === "fulfilled") setProfile(profileRes.value.data);
      if (compatRes.status === "fulfilled") setCompatibility(compatRes.value.data.breakdown);
      if (feedbackRes.status === "fulfilled") setFeedback(feedbackRes.value.data);
    } catch (err) { console.log(err); } finally { setLoading(false); }
  };

  const sendRequest = async () => {
    setSendingRequest(true);
    try {
      await axios.post(`${API}/collab/send`, {
        receiverId: id,
        message: requestMessage || `Hi! I'd love to connect and explore collaboration.`,
      });
      setRequestSent(true);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to send request");
    } finally { setSendingRequest(false); }
  };

  if (loading) return <DashboardLayout><div style={{ textAlign: "center", padding: 60, color: "var(--text-tertiary)" }}>Loading profile...</div></DashboardLayout>;
  if (!profile) return <DashboardLayout><div style={{ textAlign: "center", padding: 60 }}>Profile not found.</div></DashboardLayout>;

  const cats = compatibility?.categories || {};

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        {/* Profile Header */}
        <div className="glass-card" style={{ padding: "32px", marginBottom: 20, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, right: 0, width: 200, height: 200, background: "rgba(99,102,241,0.08)", borderRadius: "50%", filter: "blur(60px)" }} />
          <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap", position: "relative", zIndex: 2 }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(99,102,241,0.15)", color: "var(--primary-300)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 700, overflow: "hidden", flexShrink: 0 }}>
              {profile.avatar ? <img src={profile.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : profile.name?.[0]?.toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700 }}>
                {profile.name}
                {profile.isVerified && <span style={{ fontSize: 14, color: "#34d399", marginLeft: 8 }}>✓</span>}
              </h1>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 4 }}>{profile.headline || profile.university}</p>
              <div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "rgba(99,102,241,0.12)", color: "var(--primary-300)", border: "1px solid rgba(99,102,241,0.2)" }}>
                  {profile.role === "founder" ? "🚀 Founder" : "🧑‍💻 Candidate"}
                </span>
                {profile.availability && <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "rgba(16,185,129,0.12)", color: "#34d399", border: "1px solid rgba(16,185,129,0.2)" }}>{profile.availability}</span>}
                {profile.location && <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>📍 {profile.location}</span>}
              </div>
            </div>
            {compatibility && (
              <div style={{ textAlign: "center", padding: "16px", borderRadius: 16, background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)" }}>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 32, fontWeight: 800, color: "#34d399" }}>{compatibility.overall}%</div>
                <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>Match Score</div>
              </div>
            )}
          </div>
        </div>

        {/* Connect Button */}
        {currentUser?._id !== id && (
          <div className="glass-card" style={{ padding: "16px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <input value={requestMessage} onChange={e => setRequestMessage(e.target.value)} placeholder="Add a message..." style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: "1px solid var(--border-subtle)", background: "rgba(255,255,255,0.03)", color: "var(--text-primary)", fontSize: 13, outline: "none", minWidth: 200 }} />
            <button onClick={sendRequest} className="btn-primary" disabled={requestSent || sendingRequest} style={{ padding: "10px 24px", fontSize: 13, opacity: requestSent ? 0.7 : 1 }}>
              {requestSent ? "✓ Request Sent" : sendingRequest ? "Sending..." : "🤝 Connect"}
            </button>
            <Link href={`/chat?user=${id}`} className="btn-secondary" style={{ padding: "10px 20px", fontSize: 13 }}>💬 Message</Link>
          </div>
        )}

        {/* Bio */}
        {profile.bio && (
          <div className="glass-card" style={{ padding: "24px", marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>About</h3>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>{profile.bio}</p>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
          {/* Skills */}
          {profile.skills?.length > 0 && (
            <div className="glass-card" style={{ padding: "24px" }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Skills</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {profile.skills.map(s => <span key={s} className="tag-pill">{s}</span>)}
              </div>
            </div>
          )}

          {/* Interests */}
          {profile.interests?.length > 0 && (
            <div className="glass-card" style={{ padding: "24px" }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Interests</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {profile.interests.map(i => <span key={i} style={{ display: "inline-block", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 500, background: "rgba(16,185,129,0.08)", color: "#34d399", border: "1px solid rgba(16,185,129,0.15)" }}>{i}</span>)}
              </div>
            </div>
          )}
        </div>

        {/* Compatibility Breakdown */}
        {compatibility && (
          <div className="glass-card" style={{ padding: "24px", marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>🧠 Compatibility Analysis</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {Object.keys(cats).map(key => (
                <div key={key}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{cats[key].label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: cats[key].score >= 70 ? "#34d399" : cats[key].score >= 40 ? "#fbbf24" : "#f43f5e" }}>{cats[key].score}%</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: "var(--border-subtle)", overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 3, width: `${cats[key].score}%`, background: cats[key].score >= 70 ? "#34d399" : cats[key].score >= 40 ? "#fbbf24" : "#f43f5e", transition: "width 0.5s" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ratings */}
        {profile.totalRatings > 0 && (
          <div className="glass-card" style={{ padding: "24px", marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>⭐ Ratings & Feedback</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 36, fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif" }}>{profile.averageRating?.toFixed(1)}</div>
              <div>
                <div style={{ color: "#fbbf24", fontSize: 20 }}>{"★".repeat(Math.round(profile.averageRating))}{"☆".repeat(5 - Math.round(profile.averageRating))}</div>
                <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{profile.totalRatings} reviews</div>
              </div>
            </div>
            {feedback.slice(0, 3).map(f => (
              <div key={f._id} style={{ padding: "12px 0", borderTop: "1px solid var(--border-subtle)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{f.fromUserId?.name}</span>
                  <span style={{ color: "#fbbf24", fontSize: 13 }}>{"★".repeat(f.rating)}</span>
                </div>
                {f.comment && <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>{f.comment}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Links */}
        {(profile.linkedIn || profile.github || profile.portfolio) && (
          <div className="glass-card" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Links</h3>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {profile.linkedIn && <a href={profile.linkedIn} target="_blank" rel="noopener" className="btn-secondary" style={{ padding: "8px 16px", fontSize: 13 }}>LinkedIn ↗</a>}
              {profile.github && <a href={profile.github} target="_blank" rel="noopener" className="btn-secondary" style={{ padding: "8px 16px", fontSize: 13 }}>GitHub ↗</a>}
              {profile.portfolio && <a href={profile.portfolio} target="_blank" rel="noopener" className="btn-secondary" style={{ padding: "8px 16px", fontSize: 13 }}>Portfolio ↗</a>}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
