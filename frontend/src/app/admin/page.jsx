"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import DashboardLayout from "../../components/DashboardLayout";
import { useAuth } from "../../context/AuthContext";

export default function AdminPage() {
  const { API, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState("");

  useEffect(() => { loadAdmin(); }, []);

  const loadAdmin = async () => {
    try {
      const [statsRes, usersRes, reportsRes] = await Promise.allSettled([
        axios.get(`${API}/admin/stats`),
        axios.get(`${API}/admin/users`),
        axios.get(`${API}/admin/reports`),
      ]);
      if (statsRes.status === "fulfilled") setStats(statsRes.value.data);
      if (usersRes.status === "fulfilled") setUsers(usersRes.value.data.users || []);
      if (reportsRes.status === "fulfilled") setReports(reportsRes.value.data || []);
    } catch (err) { console.log(err); } finally { setLoading(false); }
  };

  const verifyUser = async (id) => {
    try { await axios.put(`${API}/admin/users/${id}/verify`); loadAdmin(); } catch (err) { alert("Failed"); }
  };

  const banUser = async (id, ban) => {
    const reason = ban ? prompt("Ban reason:") : "";
    if (ban && !reason) return;
    try { await axios.put(`${API}/admin/users/${id}/ban`, { ban, reason }); loadAdmin(); } catch (err) { alert("Failed"); }
  };

  const handleReport = async (id, status) => {
    try { await axios.put(`${API}/admin/reports/${id}`, { status, adminNote: "Reviewed by admin" }); loadAdmin(); } catch (err) { alert("Failed"); }
  };

  const searchUsers = async () => {
    try {
      const res = await axios.get(`${API}/admin/users?search=${userSearch}`);
      setUsers(res.data.users || []);
    } catch (err) { console.log(err); }
  };

  if (!isAdmin) return <DashboardLayout><div style={{ textAlign: "center", padding: 80, color: "var(--text-tertiary)" }}><span style={{ fontSize: 48 }}>🔒</span><h3 style={{ marginTop: 16 }}>Admin access required</h3></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700, marginBottom: 24 }}>⚙️ Admin Panel</h1>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {[
            { id: "overview", label: "📊 Overview" },
            { id: "users", label: "👥 Users" },
            { id: "reports", label: "🚨 Reports" },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "10px 20px", borderRadius: 10, border: "1px solid var(--border-subtle)", background: tab === t.id ? "rgba(99,102,241,0.1)" : "transparent", color: tab === t.id ? "var(--primary-300)" : "var(--text-secondary)", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "var(--text-tertiary)" }}>Loading admin data...</div>
        ) : (
          <>
            {/* Overview Tab */}
            {tab === "overview" && stats && (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
                  {[
                    { icon: "👥", label: "Total Users", value: stats.totalUsers, color: "#6366f1" },
                    { icon: "💡", label: "Total Startups", value: stats.totalStartups, color: "#10b981" },
                    { icon: "🤝", label: "Collaborations", value: stats.totalCollabs, color: "#f59e0b" },
                    { icon: "🚨", label: "Pending Reports", value: stats.pendingReports, color: "#f43f5e" },
                  ].map(s => (
                    <div key={s.label} className="glass-card" style={{ padding: "24px 20px", textAlign: "center" }}>
                      <span style={{ fontSize: 28 }}>{s.icon}</span>
                      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 32, fontWeight: 800, color: s.color, marginTop: 8 }}>{s.value}</div>
                      <div style={{ fontSize: 13, color: "var(--text-tertiary)", marginTop: 4 }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 600, marginBottom: 14 }}>Recent Users</h3>
                <div className="glass-card" style={{ overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                        <th style={th}>Name</th><th style={th}>Email</th><th style={th}>Role</th><th style={th}>Verified</th><th style={th}>Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentUsers?.map(u => (
                        <tr key={u._id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                          <td style={td}>{u.name}</td>
                          <td style={td}>{u.email}</td>
                          <td style={td}><span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 8, background: u.role === "founder" ? "rgba(99,102,241,0.1)" : "rgba(16,185,129,0.1)", color: u.role === "founder" ? "var(--primary-300)" : "#34d399" }}>{u.role}</span></td>
                          <td style={td}>{u.isVerified ? "✅" : "❌"}</td>
                          <td style={td}>{new Date(u.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {tab === "users" && (
              <div>
                <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                  <input value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="Search users..." style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: "1px solid var(--border-subtle)", background: "rgba(255,255,255,0.03)", color: "var(--text-primary)", fontSize: 14, outline: "none" }} />
                  <button onClick={searchUsers} className="btn-primary" style={{ padding: "10px 24px", fontSize: 13 }}>Search</button>
                </div>
                <div className="glass-card" style={{ overflow: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                        <th style={th}>Name</th><th style={th}>Email</th><th style={th}>Role</th><th style={th}>Verified</th><th style={th}>Status</th><th style={th}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u._id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                          <td style={td}><Link href={`/profile/${u._id}`} style={{ color: "var(--primary-400)", textDecoration: "none" }}>{u.name}</Link></td>
                          <td style={td}>{u.email}</td>
                          <td style={td}>{u.role}</td>
                          <td style={td}>{u.isVerified ? "✅" : "❌"}</td>
                          <td style={td}>{u.isBanned ? <span style={{ color: "#f43f5e" }}>Banned</span> : <span style={{ color: "#34d399" }}>Active</span>}</td>
                          <td style={td}>
                            <div style={{ display: "flex", gap: 6 }}>
                              {!u.isVerified && <button onClick={() => verifyUser(u._id)} style={actionBtn}>Verify</button>}
                              {u.isBanned ? (
                                <button onClick={() => banUser(u._id, false)} style={{ ...actionBtn, color: "#34d399", borderColor: "rgba(16,185,129,0.3)" }}>Unban</button>
                              ) : (
                                <button onClick={() => banUser(u._id, true)} style={{ ...actionBtn, color: "#f43f5e", borderColor: "rgba(244,63,94,0.3)" }}>Ban</button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Reports Tab */}
            {tab === "reports" && (
              <div>
                {reports.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {reports.map(r => (
                      <div key={r._id} className="glass-card" style={{ padding: 20 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                          <div>
                            <span style={{ fontWeight: 600 }}>{r.reporterId?.name}</span>
                            <span style={{ color: "var(--text-tertiary)", margin: "0 8px" }}>reported</span>
                            <span style={{ fontWeight: 600, color: "#f43f5e" }}>{r.reportedUserId?.name}</span>
                          </div>
                          <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: r.status === "pending" ? "rgba(245,158,11,0.1)" : "rgba(16,185,129,0.1)", color: r.status === "pending" ? "#fbbf24" : "#34d399", textTransform: "capitalize" }}>{r.status}</span>
                        </div>
                        <div style={{ fontSize: 12, color: "var(--primary-300)", marginBottom: 6, padding: "3px 10px", borderRadius: 8, background: "rgba(99,102,241,0.08)", display: "inline-block" }}>Reason: {r.reason}</div>
                        <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 12 }}>{r.description}</p>
                        {r.status === "pending" && (
                          <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={() => handleReport(r._id, "resolved")} className="btn-primary" style={{ padding: "6px 16px", fontSize: 12 }}>Resolve</button>
                            <button onClick={() => handleReport(r._id, "dismissed")} className="btn-secondary" style={{ padding: "6px 16px", fontSize: 12 }}>Dismiss</button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: 60, color: "var(--text-tertiary)" }}>
                    <span style={{ fontSize: 48 }}>✅</span>
                    <p style={{ marginTop: 12 }}>No reports to review.</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

const th = { padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" };
const td = { padding: "12px 16px", fontSize: 13, color: "var(--text-secondary)" };
const actionBtn = { padding: "4px 12px", borderRadius: 6, fontSize: 11, border: "1px solid rgba(99,102,241,0.3)", background: "transparent", color: "var(--primary-300)", cursor: "pointer", fontFamily: "inherit" };
