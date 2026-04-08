"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import DashboardLayout from "../../components/DashboardLayout";
import { useAuth } from "../../context/AuthContext";

export default function RequestsPage() {
  const { API } = useAuth();
  const [tab, setTab] = useState("incoming");
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadRequests(); }, []);

  const loadRequests = async () => {
    try {
      const [incRes, outRes] = await Promise.allSettled([
        axios.get(`${API}/collab/incoming`),
        axios.get(`${API}/collab/outgoing`),
      ]);
      if (incRes.status === "fulfilled") setIncoming(incRes.value.data || []);
      if (outRes.status === "fulfilled") setOutgoing(outRes.value.data || []);
    } catch (err) { console.log(err); } finally { setLoading(false); }
  };

  const respond = async (id, status) => {
    try {
      await axios.put(`${API}/collab/respond/${id}`, { status });
      loadRequests();
    } catch (err) { alert(err?.response?.data?.message || "Failed"); }
  };

  const withdraw = async (id) => {
    try {
      await axios.put(`${API}/collab/withdraw/${id}`);
      loadRequests();
    } catch (err) { alert("Failed to withdraw"); }
  };

  const statusBadge = (status) => {
    const colors = { pending: { bg: "rgba(245,158,11,0.1)", color: "#fbbf24" }, accepted: { bg: "rgba(16,185,129,0.1)", color: "#34d399" }, rejected: { bg: "rgba(244,63,94,0.1)", color: "#f43f5e" }, withdrawn: { bg: "rgba(107,114,128,0.1)", color: "#9ca3af" } };
    const c = colors[status] || colors.pending;
    return <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: c.bg, color: c.color, textTransform: "capitalize" }}>{status}</span>;
  };

  const requests = tab === "incoming" ? incoming : outgoing;
  const pendingIncoming = incoming.filter(r => r.status === "pending").length;

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700, marginBottom: 24 }}>🤝 Collaboration Requests</h1>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          <button onClick={() => setTab("incoming")} style={{ padding: "10px 20px", borderRadius: 10, border: "1px solid var(--border-subtle)", background: tab === "incoming" ? "rgba(99,102,241,0.1)" : "transparent", color: tab === "incoming" ? "var(--primary-300)" : "var(--text-secondary)", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 8 }}>
            📥 Incoming {pendingIncoming > 0 && <span style={{ background: "#f43f5e", color: "#fff", borderRadius: 10, padding: "1px 7px", fontSize: 11, fontWeight: 700 }}>{pendingIncoming}</span>}
          </button>
          <button onClick={() => setTab("outgoing")} style={{ padding: "10px 20px", borderRadius: 10, border: "1px solid var(--border-subtle)", background: tab === "outgoing" ? "rgba(99,102,241,0.1)" : "transparent", color: tab === "outgoing" ? "var(--primary-300)" : "var(--text-secondary)", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
            📤 Outgoing
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "var(--text-tertiary)" }}>Loading requests...</div>
        ) : requests.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {requests.map(r => {
              const otherUser = tab === "incoming" ? r.senderId : r.receiverId;
              return (
                <div key={r._id} className="glass-card" style={{ padding: 20, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(99,102,241,0.15)", color: "var(--primary-300)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 18, flexShrink: 0, overflow: "hidden" }}>
                    {otherUser?.avatar ? <img src={otherUser.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : otherUser?.name?.[0]?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontWeight: 600, fontSize: 15 }}>{otherUser?.name}</span>
                      {statusBadge(r.status)}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 2 }}>{otherUser?.headline || otherUser?.university}</div>
                    {r.message && <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 6, padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-subtle)" }}>"{r.message}"</p>}
                    {r.startupId && <span style={{ fontSize: 12, color: "var(--primary-300)", marginTop: 4, display: "inline-block" }}>💡 {r.startupId.name}</span>}
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <Link href={`/profile/${otherUser?._id}`} className="btn-secondary" style={{ padding: "7px 16px", fontSize: 12 }}>View Profile</Link>
                    {tab === "incoming" && r.status === "pending" && (
                      <>
                        <button onClick={() => respond(r._id, "accepted")} className="btn-primary" style={{ padding: "7px 16px", fontSize: 12 }}>✓ Accept</button>
                        <button onClick={() => respond(r._id, "rejected")} style={{ padding: "7px 16px", fontSize: 12, borderRadius: 10, border: "1px solid rgba(244,63,94,0.3)", background: "transparent", color: "#f43f5e", cursor: "pointer", fontFamily: "inherit" }}>✕ Decline</button>
                      </>
                    )}
                    {tab === "outgoing" && r.status === "pending" && (
                      <button onClick={() => withdraw(r._id)} style={{ padding: "7px 16px", fontSize: 12, borderRadius: 10, border: "1px solid var(--border-subtle)", background: "transparent", color: "var(--text-secondary)", cursor: "pointer", fontFamily: "inherit" }}>Withdraw</button>
                    )}
                    {r.status === "accepted" && (
                      <Link href={`/chat?user=${otherUser?._id}`} className="btn-primary" style={{ padding: "7px 16px", fontSize: 12 }}>💬 Chat</Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: 60, color: "var(--text-tertiary)" }}>
            <span style={{ fontSize: 48 }}>{tab === "incoming" ? "📬" : "📤"}</span>
            <p style={{ marginTop: 12 }}>No {tab} requests yet.</p>
            {tab === "outgoing" && <Link href="/search" className="btn-primary" style={{ marginTop: 16, display: "inline-flex", padding: "10px 24px", fontSize: 13 }}>Find Co-Founders →</Link>}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
