"use client";
import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { useAuth } from "../../context/AuthContext";

const SKILL_OPTIONS = ["React", "Node.js", "Python", "Java", "Flutter", "Swift", "AWS", "Docker", "Figma", "UX Research", "Product Management", "Marketing", "SEO", "Content", "Finance", "Strategy", "Data Science", "AI/ML", "Blockchain", "DevOps", "System Design", "Analytics", "Sales", "BD", "Operations"];
const INTEREST_OPTIONS = ["EdTech", "FinTech", "HealthTech", "AI/ML", "SaaS", "D2C", "Consumer", "Deep Tech", "Web3", "Creator Economy", "CleanTech", "Gaming", "Logistics", "AgriTech", "HRTech", "LegalTech", "PropTech"];
const DOMAIN_OPTIONS = ["Technology", "Business", "Design", "Marketing", "Finance", "Operations", "Sales", "Research"];

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: "", headline: "", bio: "", university: "",
    location: "", availability: "", commitment: "",
    goals: "", workStyle: "",
    portfolio: "", linkedIn: "", github: "",
    skills: [], interests: [], domains: [],
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        headline: user.headline || "",
        bio: user.bio || "",
        university: user.university || "",
        location: user.location || "",
        availability: user.availability || "",
        commitment: user.commitment || "",
        goals: user.goals || "",
        workStyle: user.workStyle || "",
        portfolio: user.portfolio || "",
        linkedIn: user.linkedIn || "",
        github: user.github || "",
        skills: user.skills || [],
        interests: user.interests || [],
        domains: user.domains || [],
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setSaved(false);
  };

  const toggleArrayItem = (field, item) => {
    const arr = formData[field];
    const newArr = arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item];
    setFormData({ ...formData, [field]: newArr });
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile(formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert("Failed to save profile: " + (err?.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "basic", label: "Basic Info", icon: "👤" },
    { id: "skills", label: "Skills & Interests", icon: "🎯" },
    { id: "preferences", label: "Preferences", icon: "⚙️" },
    { id: "links", label: "Social Links", icon: "🔗" },
  ];

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <div style={s.header}>
          <h1 style={s.title}>My Profile</h1>
          <button
            onClick={handleSave}
            className="btn-primary"
            disabled={saving}
            style={{ padding: "10px 28px", fontSize: 14, opacity: saving ? 0.7 : 1 }}
          >
            {saving ? "Saving..." : saved ? "✓ Saved!" : "Save Changes"}
          </button>
        </div>

        {/* Profile Preview Card */}
        <div className="glass-card" style={s.previewCard}>
          <div style={s.previewAvatar}>
            {user?.avatar ? (
              <img src={user.avatar} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
            ) : (
              <span style={{ fontSize: 32, fontWeight: 700 }}>{formData.name?.[0]?.toUpperCase() || "?"}</span>
            )}
          </div>
          <div>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700 }}>
              {formData.name || "Your Name"}
            </h2>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 4 }}>
              {formData.headline || "Add a headline to introduce yourself"}
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
              {user?.role && (
                <span style={s.roleBadge}>
                  {user.role === "founder" ? "🚀 Founder" : "🧑‍💻 Candidate"}
                </span>
              )}
              {user?.isVerified && <span style={s.verifiedBadge}>✓ Verified</span>}
              {formData.university && (
                <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                  🎓 {formData.university}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={s.tabBar}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                ...s.tab,
                ...(activeTab === tab.id ? s.tabActive : {}),
              }}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="glass-card" style={s.formCard}>
          {activeTab === "basic" && (
            <div style={s.formGrid}>
              <div style={s.field}>
                <label style={s.label}>Full Name</label>
                <input name="name" value={formData.name} onChange={handleChange} style={s.input} placeholder="Your full name" />
              </div>
              <div style={s.field}>
                <label style={s.label}>Headline</label>
                <input name="headline" value={formData.headline} onChange={handleChange} style={s.input} placeholder="e.g. Full-Stack Developer | Startup Enthusiast" maxLength={120} />
              </div>
              <div style={{ ...s.field, gridColumn: "1 / -1" }}>
                <label style={s.label}>Bio</label>
                <textarea name="bio" value={formData.bio} onChange={handleChange} style={{ ...s.input, minHeight: 100, resize: "vertical" }} placeholder="Tell us about yourself, your experience, and what you're looking for..." maxLength={500} />
                <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{formData.bio.length}/500</span>
              </div>
              <div style={s.field}>
                <label style={s.label}>University / College</label>
                <input name="university" value={formData.university} onChange={handleChange} style={s.input} placeholder="IIT Delhi" />
              </div>
              <div style={s.field}>
                <label style={s.label}>Location</label>
                <input name="location" value={formData.location} onChange={handleChange} style={s.input} placeholder="Mumbai, India" />
              </div>
            </div>
          )}

          {activeTab === "skills" && (
            <div>
              <div style={s.field}>
                <label style={s.label}>Skills (select all that apply)</label>
                <div style={s.chipGrid}>
                  {SKILL_OPTIONS.map(skill => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleArrayItem("skills", skill)}
                      style={{
                        ...s.chip,
                        ...(formData.skills.includes(skill) ? s.chipActive : {}),
                      }}
                    >
                      {formData.skills.includes(skill) && "✓ "}{skill}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ ...s.field, marginTop: 24 }}>
                <label style={s.label}>Interested Domains</label>
                <div style={s.chipGrid}>
                  {INTEREST_OPTIONS.map(interest => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleArrayItem("interests", interest)}
                      style={{
                        ...s.chip,
                        ...(formData.interests.includes(interest) ? { ...s.chipActive, background: "rgba(16,185,129,0.15)", color: "#34d399", borderColor: "rgba(16,185,129,0.3)" } : {}),
                      }}
                    >
                      {formData.interests.includes(interest) && "✓ "}{interest}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ ...s.field, marginTop: 24 }}>
                <label style={s.label}>Expertise Areas</label>
                <div style={s.chipGrid}>
                  {DOMAIN_OPTIONS.map(domain => (
                    <button
                      key={domain}
                      type="button"
                      onClick={() => toggleArrayItem("domains", domain)}
                      style={{
                        ...s.chip,
                        ...(formData.domains.includes(domain) ? { ...s.chipActive, background: "rgba(236,72,153,0.15)", color: "#f472b6", borderColor: "rgba(236,72,153,0.3)" } : {}),
                      }}
                    >
                      {formData.domains.includes(domain) && "✓ "}{domain}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "preferences" && (
            <div style={s.formGrid}>
              <div style={s.field}>
                <label style={s.label}>Availability</label>
                <select name="availability" value={formData.availability} onChange={handleChange} style={s.input}>
                  <option value="">Select availability</option>
                  <option value="immediate">Immediate</option>
                  <option value="part-time">Part-time</option>
                  <option value="weekends">Weekends</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>
              <div style={s.field}>
                <label style={s.label}>Commitment Level</label>
                <select name="commitment" value={formData.commitment} onChange={handleChange} style={s.input}>
                  <option value="">Select commitment</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="weekends">Weekends only</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>
              <div style={{ ...s.field, gridColumn: "1 / -1" }}>
                <label style={s.label}>What are your goals?</label>
                <textarea name="goals" value={formData.goals} onChange={handleChange} style={{ ...s.input, minHeight: 80, resize: "vertical" }} placeholder="What do you want to achieve? What drives you?" maxLength={300} />
              </div>
              <div style={{ ...s.field, gridColumn: "1 / -1" }}>
                <label style={s.label}>Work Style</label>
                <textarea name="workStyle" value={formData.workStyle} onChange={handleChange} style={{ ...s.input, minHeight: 80, resize: "vertical" }} placeholder="Describe your work style, how you like to collaborate..." maxLength={300} />
              </div>
            </div>
          )}

          {activeTab === "links" && (
            <div style={s.formGrid}>
              <div style={s.field}>
                <label style={s.label}>Portfolio Website</label>
                <input name="portfolio" value={formData.portfolio} onChange={handleChange} style={s.input} placeholder="https://yourportfolio.com" />
              </div>
              <div style={s.field}>
                <label style={s.label}>LinkedIn Profile</label>
                <input name="linkedIn" value={formData.linkedIn} onChange={handleChange} style={s.input} placeholder="https://linkedin.com/in/yourname" />
              </div>
              <div style={s.field}>
                <label style={s.label}>GitHub Profile</label>
                <input name="github" value={formData.github} onChange={handleChange} style={s.input} placeholder="https://github.com/yourname" />
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

const s = {
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 },
  title: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em" },
  previewCard: { display: "flex", alignItems: "center", gap: 20, padding: "24px 28px", marginBottom: 24, flexWrap: "wrap" },
  previewAvatar: {
    width: 72, height: 72, borderRadius: "50%", background: "rgba(99,102,241,0.15)",
    color: "var(--primary-300)", display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0, overflow: "hidden",
  },
  roleBadge: {
    fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
    background: "rgba(99,102,241,0.12)", color: "var(--primary-300)", border: "1px solid rgba(99,102,241,0.2)",
  },
  verifiedBadge: {
    fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
    background: "rgba(16,185,129,0.12)", color: "#34d399", border: "1px solid rgba(16,185,129,0.2)",
  },
  tabBar: {
    display: "flex", gap: 6, marginBottom: 20, overflowX: "auto",
    paddingBottom: 4,
  },
  tab: {
    padding: "10px 18px", borderRadius: 10, border: "1px solid var(--border-subtle)",
    background: "transparent", color: "var(--text-secondary)", fontSize: 13,
    fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center",
    gap: 6, whiteSpace: "nowrap", fontFamily: "inherit", transition: "all 0.2s",
  },
  tabActive: {
    background: "rgba(99,102,241,0.1)", color: "var(--primary-300)",
    borderColor: "rgba(99,102,241,0.3)",
  },
  formCard: { padding: "28px" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" },
  input: {
    width: "100%", padding: "12px 14px", borderRadius: 10,
    border: "1px solid var(--border-subtle)", background: "rgba(255,255,255,0.03)",
    color: "var(--text-primary)", fontSize: 14, outline: "none", fontFamily: "inherit",
    transition: "border-color 0.2s",
  },
  chipGrid: { display: "flex", flexWrap: "wrap", gap: 8 },
  chip: {
    padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 500,
    border: "1px solid var(--border-subtle)", background: "transparent",
    color: "var(--text-secondary)", cursor: "pointer", fontFamily: "inherit",
    transition: "all 0.2s",
  },
  chipActive: {
    background: "rgba(99,102,241,0.15)", color: "var(--primary-300)",
    borderColor: "rgba(99,102,241,0.3)",
  },
};
