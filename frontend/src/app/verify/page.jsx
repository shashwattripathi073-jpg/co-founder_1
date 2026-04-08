"use client";
import React, { useState } from "react";
import axios from "axios";
import DashboardLayout from "../../components/DashboardLayout";
import { useAuth } from "../../context/AuthContext";

export default function VerificationPage() {
  const { user, API, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [requested, setRequested] = useState(false);

  const requestVerification = async () => {
    setLoading(true);
    try {
      await axios.post(`${API}/user/request-verification`);
      setRequested(true);
      await refreshUser();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to request verification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700, marginBottom: 24 }}>🛡️ Verification & Trust</h1>

        <div className="glass-card" style={{ padding: 32, textAlign: "center" }}>
          {user?.isVerified ? (
            <div>
              <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: "#34d399" }}>You are Verified!</h2>
              <p style={{ color: "var(--text-secondary)", marginTop: 8, fontSize: 14 }}>
                Your profile has been verified. You now have a checkmark on your profile and appear higher in search results.
              </p>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 64, marginBottom: 16 }}>🔓</div>
              <h2 style={{ fontSize: 22, fontWeight: 700 }}>Get Verified</h2>
              <p style={{ color: "var(--text-secondary)", marginTop: 8, fontSize: 14, maxWidth: 500, margin: "8px auto" }}>
                Verification helps build trust within the community. Verified members are 3x more likely to find a co-founder.
              </p>

              <div style={{ marginTop: 24, textAlign: "left", background: "rgba(255,255,255,0.02)", padding: 20, borderRadius: 12, border: "1px solid var(--border-subtle)" }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>What verification means:</h3>
                <ul style={{ fontSize: 13, color: "var(--text-secondary)", paddingLeft: 18, display: "flex", flexDirection: "column", gap: 8 }}>
                  <li>Blue checkmark badge on your profile</li>
                  <li>Higher ranking in search results and matches</li>
                  <li>Increased trust from potential co-founders</li>
                  <li>Access to premium startup networking events</li>
                </ul>
              </div>

              {requested ? (
                <div style={{ marginTop: 32, padding: "12px 24px", borderRadius: 10, background: "rgba(16,185,129,0.1)", color: "#34d399", fontSize: 14, fontWeight: 500 }}>
                  ✓ Verification request sent! Our team will review your profile shortly.
                </div>
              ) : (
                <button
                  onClick={requestVerification}
                  className="btn-primary"
                  disabled={loading}
                  style={{ marginTop: 32, padding: "14px 40px", fontSize: 15 }}
                >
                  {loading ? "Processing..." : "Request Verification"}
                </button>
              )}
            </div>
          )}
        </div>

        <div style={{ marginTop: 32 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Trust Guidelines</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="glass-card" style={{ padding: 16 }}>
              <div style={{ fontSize: 20, marginBottom: 8 }}>🤝</div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Professional Conduct</div>
              <p style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 4 }}>Always be respectful and professional when communicating with others.</p>
            </div>
            <div className="glass-card" style={{ padding: 16 }}>
              <div style={{ fontSize: 20, marginBottom: 8 }}>📄</div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Authentic Data</div>
              <p style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 4 }}>Ensure your profile data and experience are accurate and truthful.</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
