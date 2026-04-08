"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import DashboardLayout from "../../components/DashboardLayout";
import { useAuth } from "../../context/AuthContext";

const STAGES = [
  { value: "idea", label: "💡 Idea Stage" },
  { value: "pre-seed", label: "🌱 Pre-Seed" },
  { value: "mvp", label: "🚀 MVP Ready" },
  { value: "seed", label: "💰 Seed" },
  { value: "series-a", label: "📈 Series A" },
];

export default function IdeasPage() {
  const { user, API } = useAuth();
  const [startups, setStartups] = useState([]);
  const [myStartups, setMyStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState(user?.role === "founder" ? "my" : "browse");
  const [form, setForm] = useState({ name: "", tagline: "", description: "", domain: "", stage: "idea", vision: "", requiredRoles: [] });
  const [roleForm, setRoleForm] = useState({ title: "", description: "", skills: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [allRes, myRes] = await Promise.allSettled([
        axios.get(`${API}/startup/getall`),
        axios.get(`${API}/startup/my`),
      ]);
      if (allRes.status === "fulfilled") setStartups(allRes.value.data.startups || []);
      if (myRes.status === "fulfilled") setMyStartups(myRes.value.data || []);
    } catch (err) { console.log(err); } finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await axios.post(`${API}/startup/add`, form);
      setShowForm(false);
      setForm({ name: "", tagline: "", description: "", domain: "", stage: "idea", vision: "", requiredRoles: [] });
      loadData();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to create startup");
    } finally { setSaving(false); }
  };

  const addRole = () => {
    if (!roleForm.title) return;
    setForm({
      ...form,
      requiredRoles: [...form.requiredRoles, {
        title: roleForm.title,
        description: roleForm.description,
        skills: roleForm.skills.split(",").map(s => s.trim()).filter(Boolean),
      }]
    });
    setRoleForm({ title: "", description: "", skills: "" });
  };

  const deleteStartup = async (id) => {
    if (!confirm("Delete this startup idea?")) return;
    try { await axios.delete(`${API}/startup/delete/${id}`); loadData(); } catch (err) { alert("Failed"); }
  };

  const displayStartups = tab === "my" ? myStartups : startups;

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700 }}>💡 Startup Ideas</h1>
          {user?.role === "founder" && (
            <button onClick={() => setShowForm(!showForm)} className="btn-primary" style={{ padding: "10px 24px", fontSize: 13 }}>
              {showForm ? "✕ Cancel" : "+ New Idea"}
            </button>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {user?.role === "founder" && (
            <button onClick={() => setTab("my")} style={{ padding: "8px 18px", borderRadius: 10, border: "1px solid var(--border-subtle)", background: tab === "my" ? "rgba(99,102,241,0.1)" : "transparent", color: tab === "my" ? "var(--primary-300)" : "var(--text-secondary)", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>My Ideas</button>
          )}
          <button onClick={() => setTab("browse")} style={{ padding: "8px 18px", borderRadius: 10, border: "1px solid var(--border-subtle)", background: tab === "browse" ? "rgba(99,102,241,0.1)" : "transparent", color: tab === "browse" ? "var(--primary-300)" : "var(--text-secondary)", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>Browse All</button>
        </div>

        {/* New Idea Form */}
        {showForm && (
          <div className="glass-card" style={{ padding: 28, marginBottom: 24 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>Create New Startup Idea</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={fs.field}><label style={fs.label}>Startup Name *</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={fs.input} placeholder="FinLit" /></div>
              <div style={fs.field}><label style={fs.label}>Domain *</label><input value={form.domain} onChange={e => setForm({...form, domain: e.target.value})} style={fs.input} placeholder="FinTech" /></div>
              <div style={{ ...fs.field, gridColumn: "1 / -1" }}><label style={fs.label}>Tagline *</label><input value={form.tagline} onChange={e => setForm({...form, tagline: e.target.value})} style={fs.input} placeholder="Making financial literacy fun for Gen-Z" /></div>
              <div style={{ ...fs.field, gridColumn: "1 / -1" }}><label style={fs.label}>Description *</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{ ...fs.input, minHeight: 80 }} placeholder="Describe your startup idea in detail..." /></div>
              <div style={fs.field}><label style={fs.label}>Stage</label><select value={form.stage} onChange={e => setForm({...form, stage: e.target.value})} style={fs.input}>{STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}</select></div>
              <div style={{ ...fs.field, gridColumn: "1 / -1" }}><label style={fs.label}>Vision</label><textarea value={form.vision} onChange={e => setForm({...form, vision: e.target.value})} style={{ ...fs.input, minHeight: 60 }} placeholder="What's your long-term vision?" /></div>
            </div>

            {/* Required Roles */}
            <div style={{ marginTop: 20, padding: "16px", borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-subtle)" }}>
              <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Required Co-Founder Roles</h4>
              {form.requiredRoles.map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                  <span style={{ fontWeight: 600, fontSize: 13, flex: 1 }}>{r.title}</span>
                  <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{r.skills.join(", ")}</span>
                  <button onClick={() => setForm({...form, requiredRoles: form.requiredRoles.filter((_, j) => j !== i)})} style={{ background: "none", border: "none", color: "#f43f5e", cursor: "pointer" }}>✕</button>
                </div>
              ))}
              <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                <input value={roleForm.title} onChange={e => setRoleForm({...roleForm, title: e.target.value})} style={{ ...fs.input, flex: "1 1 150px" }} placeholder="Role title (e.g. CTO)" />
                <input value={roleForm.skills} onChange={e => setRoleForm({...roleForm, skills: e.target.value})} style={{ ...fs.input, flex: "1 1 200px" }} placeholder="Skills (comma separated)" />
                <button onClick={addRole} className="btn-secondary" style={{ padding: "8px 16px", fontSize: 12 }}>+ Add Role</button>
              </div>
            </div>

            <button onClick={handleSubmit} className="btn-primary" disabled={saving || !form.name || !form.tagline || !form.description || !form.domain} style={{ marginTop: 20, padding: "12px 32px", fontSize: 14, opacity: saving ? 0.7 : 1 }}>
              {saving ? "Creating..." : "Create Startup →"}
            </button>
          </div>
        )}

        {/* Startups Grid */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "var(--text-tertiary)" }}>Loading ideas...</div>
        ) : displayStartups.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
            {displayStartups.map(s => (
              <div key={s._id} className="glass-card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700 }}>{s.name}</h3>
                    <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "rgba(99,102,241,0.1)", color: "var(--primary-300)", border: "1px solid rgba(99,102,241,0.15)" }}>{s.domain}</span>
                  </div>
                  <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: s.stage === "mvp" ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)", color: s.stage === "mvp" ? "#34d399" : "#fbbf24" }}>
                    {STAGES.find(st => st.value === s.stage)?.label || s.stage}
                  </span>
                </div>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>{s.tagline}</p>
                {s.requiredRoles?.length > 0 && (
                  <div>
                    <span style={{ fontSize: 12, color: "var(--text-tertiary)", fontWeight: 600 }}>Looking for:</span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
                      {s.requiredRoles.map((r, i) => (
                        <span key={i} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, background: "rgba(236,72,153,0.08)", color: "#f472b6", border: "1px solid rgba(236,72,153,0.15)" }}>
                          {r.title}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {s.founderId && tab === "browse" && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 8, borderTop: "1px solid var(--border-subtle)" }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(99,102,241,0.15)", color: "var(--primary-300)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
                      {s.founderId.name?.[0]?.toUpperCase()}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 500 }}>{s.founderId.name}</span>
                    <Link href={`/profile/${s.founderId._id}`} style={{ marginLeft: "auto", fontSize: 12, color: "var(--primary-400)", textDecoration: "none" }}>View Profile →</Link>
                  </div>
                )}
                {tab === "my" && (
                  <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
                    <button onClick={() => deleteStartup(s._id)} style={{ background: "none", border: "1px solid rgba(244,63,94,0.2)", color: "#f43f5e", padding: "6px 14px", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>Delete</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: 60, color: "var(--text-tertiary)" }}>
            <span style={{ fontSize: 48 }}>💡</span>
            <p style={{ marginTop: 12 }}>{tab === "my" ? "You haven't posted any ideas yet." : "No startup ideas yet."}</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

const fs = {
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" },
  input: { width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid var(--border-subtle)", background: "rgba(255,255,255,0.03)", color: "var(--text-primary)", fontSize: 14, outline: "none", fontFamily: "inherit" },
};
