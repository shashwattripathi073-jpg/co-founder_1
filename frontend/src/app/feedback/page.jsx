"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import DashboardLayout from "../../components/DashboardLayout";
import { useAuth } from "../../context/AuthContext";

export default function FeedbackPage() {
  const { API } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const targetId = searchParams.get("user");
  const startupId = searchParams.get("startup");

  const [targetUser, setTargetUser] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [categories, setCategories] = useState({ communication: 5, skills: 5, reliability: 5, teamwork: 5 });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (targetId) {
      axios.get(`${API}/user/profile/${targetId}`).then(res => setTargetUser(res.data)).catch(console.error);
    }
  }, [targetId]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await axios.post(`${API}/feedback/add`, {
        toUserId: targetId,
        startupId,
        rating,
        comment,
        categories
      });
      setSubmitted(true);
      setTimeout(() => router.push(`/profile/${targetId}`), 2000);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to submit feedback");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <DashboardLayout>
        <div style={{ maxWidth: 600, margin: "100px auto", textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🙏</div>
          <h2 style={{ fontSize: 24, fontWeight: 700 }}>Thank you for your feedback!</h2>
          <p style={{ color: "var(--text-secondary)", marginTop: 8 }}>Your rating helps build a reliable community of co-founders.</p>
          <p style={{ marginTop: 24, fontSize: 13, color: "var(--text-tertiary)" }}>Redirecting you back to profile...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700, marginBottom: 24 }}>⭐ Feedback & Rating</h1>

        <div className="glass-card" style={{ padding: 32 }}>
          {targetUser ? (
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32, paddingBottom: 24, borderBottom: "1px solid var(--border-subtle)" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(99,102,241,0.15)", color: "var(--primary-300)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700, overflow: "hidden" }}>
                {targetUser.avatar ? <img src={targetUser.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : targetUser.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 13, color: "var(--text-tertiary)" }}>Rating your collaboration with</div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{targetUser.name}</div>
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: 32, color: "var(--text-secondary)" }}>Loading user info...</div>
          )}

          <div style={{ marginBottom: 32 }}>
            <label style={{ fontSize: 15, fontWeight: 600, display: "block", marginBottom: 12 }}>Overall Rating</label>
            <div style={{ display: "flex", gap: 12 }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  style={{
                    fontSize: 32, background: "none", border: "none", cursor: "pointer",
                    color: star <= rating ? "#fbbf24" : "var(--gray-700)",
                    transition: "transform 0.1s"
                  }}
                  onMouseEnter={(e) => e.target.style.transform = "scale(1.2)"}
                  onMouseLeave={(e) => e.target.style.transform = "scale(1.0)"}
                >
                  {star <= rating ? "★" : "☆"}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
            {Object.keys(categories).map(cat => (
              <div key={cat}>
                <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", textTransform: "capitalize", display: "block", marginBottom: 8 }}>{cat}</label>
                <div style={{ display: "flex", gap: 6 }}>
                  {[1, 2, 3, 4, 5].map(val => (
                    <button
                      key={val}
                      onClick={() => setCategories({ ...categories, [cat]: val })}
                      style={{
                        flex: 1, padding: "6px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                        background: categories[cat] === val ? "var(--primary-500)" : "rgba(255,255,255,0.03)",
                        border: "1px solid var(--border-subtle)",
                        color: categories[cat] === val ? "#fff" : "var(--text-secondary)",
                        cursor: "pointer", fontFamily: "inherit"
                      }}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 32 }}>
            <label style={{ fontSize: 15, fontWeight: 600, display: "block", marginBottom: 12 }}>Share your experience</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What was it like working together? (optional)"
              style={{
                width: "100%", padding: "14px", borderRadius: 12, border: "1px solid var(--border-subtle)",
                background: "rgba(255,255,255,0.03)", color: "var(--text-primary)", fontSize: 14,
                outline: "none", minHeight: 120, fontFamily: "inherit"
              }}
            />
          </div>

          <button
            onClick={handleSubmit}
            className="btn-primary"
            disabled={loading || !targetId}
            style={{ width: "100%", justifyContent: "center", padding: "14px", fontSize: 15 }}
          >
            {loading ? "Submitting..." : "Submit Feedback"}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
