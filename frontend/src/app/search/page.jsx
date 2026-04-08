"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import DashboardLayout from "../../components/DashboardLayout";
import { useAuth } from "../../context/AuthContext";

const SKILL_FILTERS = ["React", "Node.js", "Python", "AI/ML", "Figma", "Marketing", "Finance", "Strategy", "Product Management", "Data Science"];
const DOMAIN_FILTERS = ["EdTech", "FinTech", "HealthTech", "SaaS", "D2C", "AI/ML", "Web3", "CleanTech"];

export default function SearchPage() {
  const { API } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ skills: "", domain: "", availability: "", role: "", location: "" });
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { searchUsers(); }, []);

  const searchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (filters.skills) params.set("skills", filters.skills);
      if (filters.domain) params.set("domain", filters.domain);
      if (filters.availability) params.set("availability", filters.availability);
      if (filters.role) params.set("role", filters.role);
      if (filters.location) params.set("location", filters.location);
      const res = await axios.get(`${API}/user/search?${params.toString()}`);
      setResults(res.data.users || []);
      setTotal(res.data.total || 0);
    } catch (err) { console.log(err); } finally { setLoading(false); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchUsers();
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700, marginBottom: 24 }}>🔍 Search Co-Founders</h1>

        {/* Search Bar */}
        <form onSubmit={handleSearch} style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by name, skills, university..." style={{ width: "100%", padding: "14px 16px 14px 44px", borderRadius: 14, border: "1px solid var(--border-subtle)", background: "rgba(255,255,255,0.03)", color: "var(--text-primary)", fontSize: 15, outline: "none" }} />
            <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 18, opacity: 0.4 }}>🔍</span>
          </div>
          <button type="submit" className="btn-primary" style={{ padding: "12px 28px", fontSize: 14 }}>Search</button>
          <button type="button" onClick={() => setShowFilters(!showFilters)} className="btn-secondary" style={{ padding: "12px 20px", fontSize: 14 }}>
            ⚙️ Filters
          </button>
        </form>

        {/* Filters */}
        {showFilters && (
          <div className="glass-card" style={{ padding: 20, marginBottom: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Role</label>
                <select value={filters.role} onChange={e => setFilters({...filters, role: e.target.value})} style={filterInput}>
                  <option value="">All Roles</option>
                  <option value="founder">Founders</option>
                  <option value="candidate">Candidates</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Availability</label>
                <select value={filters.availability} onChange={e => setFilters({...filters, availability: e.target.value})} style={filterInput}>
                  <option value="">Any</option>
                  <option value="immediate">Immediate</option>
                  <option value="part-time">Part-time</option>
                  <option value="weekends">Weekends</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Location</label>
                <input value={filters.location} onChange={e => setFilters({...filters, location: e.target.value})} style={filterInput} placeholder="e.g. Mumbai" />
              </div>
            </div>
            <div style={{ marginTop: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Filter by Skills</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {SKILL_FILTERS.map(skill => (
                  <button key={skill} onClick={() => { setFilters({...filters, skills: filters.skills === skill ? "" : skill}); }} style={{ padding: "5px 12px", borderRadius: 20, fontSize: 12, border: "1px solid var(--border-subtle)", background: filters.skills === skill ? "rgba(99,102,241,0.15)" : "transparent", color: filters.skills === skill ? "var(--primary-300)" : "var(--text-secondary)", cursor: "pointer", fontFamily: "inherit" }}>
                    {skill}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginTop: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Filter by Domain</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {DOMAIN_FILTERS.map(d => (
                  <button key={d} onClick={() => { setFilters({...filters, domain: filters.domain === d ? "" : d}); }} style={{ padding: "5px 12px", borderRadius: 20, fontSize: 12, border: "1px solid var(--border-subtle)", background: filters.domain === d ? "rgba(16,185,129,0.15)" : "transparent", color: filters.domain === d ? "#34d399" : "var(--text-secondary)", cursor: "pointer", fontFamily: "inherit" }}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={searchUsers} className="btn-primary" style={{ marginTop: 14, padding: "8px 24px", fontSize: 13 }}>Apply Filters</button>
          </div>
        )}

        <p style={{ fontSize: 13, color: "var(--text-tertiary)", marginBottom: 16 }}>{total} results found</p>

        {/* Results Grid */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "var(--text-tertiary)" }}>Searching...</div>
        ) : results.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {results.map(u => (
              <div key={u._id} className="glass-card" style={{ padding: 22, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(99,102,241,0.15)", color: "var(--primary-300)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 18, flexShrink: 0, overflow: "hidden" }}>
                    {u.avatar ? <img src={u.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : u.name?.[0]?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{u.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{u.headline || u.university}</div>
                  </div>
                  <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: u.role === "founder" ? "rgba(99,102,241,0.1)" : "rgba(16,185,129,0.1)", color: u.role === "founder" ? "var(--primary-300)" : "#34d399" }}>
                    {u.role === "founder" ? "🚀" : "🧑‍💻"} {u.role}
                  </span>
                </div>
                {u.bio && <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{u.bio.substring(0, 100)}{u.bio.length > 100 ? "..." : ""}</p>}
                {u.skills?.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {u.skills.slice(0, 4).map(s => <span key={s} className="tag-pill">{s}</span>)}
                    {u.skills.length > 4 && <span style={{ fontSize: 11, color: "var(--text-tertiary)", padding: "4px 6px" }}>+{u.skills.length - 4}</span>}
                  </div>
                )}
                <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
                  <Link href={`/profile/${u._id}`} className="btn-primary" style={{ flex: 1, justifyContent: "center", padding: "8px 0", fontSize: 13 }}>View Profile</Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: 60, color: "var(--text-tertiary)" }}>
            <span style={{ fontSize: 48 }}>🔍</span>
            <p style={{ marginTop: 12 }}>No users found. Try adjusting your search.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

const filterInput = { width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border-subtle)", background: "rgba(255,255,255,0.03)", color: "var(--text-primary)", fontSize: 13, outline: "none", fontFamily: "inherit" };
