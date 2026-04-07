"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

/* ──────────────────  MOCK DATA  ────────────────── */

const FOUNDERS_WITH_STARTUPS = [
  {
    id: 1,
    name: "Arjun Mehta",
    initials: "AM",
    color: "#6366f1",
    role: "Founder & CEO",
    university: "IIT Delhi",
    startup: "FinLit",
    tagline: "Making financial literacy fun for Gen‑Z",
    stage: "Pre‑Seed",
    looking: "Tech Co‑Founder",
    skills: ["Product", "Strategy", "Finance"],
    match: 94,
  },
  {
    id: 2,
    name: "Priya Sharma",
    initials: "PS",
    color: "#ec4899",
    role: "Founder",
    university: "BITS Pilani",
    startup: "GreenRoute",
    tagline: "AI‑powered sustainable supply chain for D2C brands",
    stage: "Idea Stage",
    looking: "Full‑Stack Dev",
    skills: ["Logistics", "Sustainability", "MBA"],
    match: 89,
  },
  {
    id: 3,
    name: "Rohan K.",
    initials: "RK",
    color: "#10b981",
    role: "Founder & CTO",
    university: "NIT Trichy",
    startup: "CampusHire",
    tagline: "Hyper‑local hiring for college campuses",
    stage: "MVP Ready",
    looking: "Growth / Marketing",
    skills: ["React", "Node.js", "System Design"],
    match: 91,
  },
  {
    id: 4,
    name: "Sneha Desai",
    initials: "SD",
    color: "#f59e0b",
    role: "Founder",
    university: "ISB Hyderabad",
    startup: "MedBridge",
    tagline: "Connecting rural clinics with specialist doctors via telemedicine",
    stage: "Seed",
    looking: "Mobile Dev Co‑Founder",
    skills: ["HealthTech", "Operations", "BD"],
    match: 87,
  },
];

const CANDIDATES = [
  {
    id: 5,
    name: "Vikram Joshi",
    initials: "VJ",
    color: "#8b5cf6",
    role: "Full‑Stack Developer",
    university: "VIT Vellore",
    bio: "2 yrs open‑source · built 3 side projects · hackathon winner",
    interests: ["EdTech", "FinTech", "AI/ML"],
    skills: ["React", "Python", "AWS"],
    availability: "Immediate",
  },
  {
    id: 6,
    name: "Ananya Gupta",
    initials: "AG",
    color: "#06b6d4",
    role: "Product Designer",
    university: "NID Ahmedabad",
    bio: "Design‑thinking enthusiast · interned at a YC startup",
    interests: ["HealthTech", "SaaS", "Consumer"],
    skills: ["Figma", "UX Research", "Prototyping"],
    availability: "Part-time",
  },
  {
    id: 7,
    name: "Karthik R.",
    initials: "KR",
    color: "#f43f5e",
    role: "ML Engineer",
    university: "IIIT Hyderabad",
    bio: "Published NLP paper · Kaggle expert · loves solving hard problems",
    interests: ["AI/ML", "Deep Tech", "Automation"],
    skills: ["PyTorch", "NLP", "MLOps"],
    availability: "Immediate",
  },
  {
    id: 8,
    name: "Meera P.",
    initials: "MP",
    color: "#14b8a6",
    role: "Growth & Marketing",
    university: "XLRI Jamshedpur",
    bio: "Scaled college fest to 10K footfall · social‑media wizardry",
    interests: ["D2C", "EdTech", "Creator Economy"],
    skills: ["SEO", "Content", "Analytics"],
    availability: "Weekends",
  },
];

const STATS = [
  { label: "Active Founders", value: "2,400+", icon: "🚀" },
  { label: "Co-Founders Matched", value: "1,100+", icon: "🤝" },
  { label: "Universities", value: "180+", icon: "🎓" },
  { label: "Startups Launched", value: "340+", icon: "⚡" },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Create Your Profile",
    desc: "Tell us about your skills, interests, and whether you're bringing a startup idea or looking to join one.",
    icon: "✍️",
  },
  {
    step: "02",
    title: "Get Smart Matches",
    desc: "Our algorithm finds your ideal co-founder based on complementary skills, shared vision, and compatibility.",
    icon: "🧠",
  },
  {
    step: "03",
    title: "Connect & Chat",
    desc: "Break the ice, discuss ideas, and see if you vibe. No awkward cold emails — just genuine conversations.",
    icon: "💬",
  },
  {
    step: "04",
    title: "Build Together",
    desc: "Found your match? Start building. Access resources, mentorship, and community support to launch your startup.",
    icon: "🏗️",
  },
];

const TESTIMONIALS = [
  {
    name: "Aditya & Neha",
    startup: "ByteLearn",
    quote:
      "We met on CoFounder as strangers—6 months later we raised our pre‑seed. This platform genuinely changed our trajectory.",
    avatarColors: ["#6366f1", "#ec4899"],
  },
  {
    name: "Sahil & Riya",
    startup: "PackTrack",
    quote:
      "I had the tech skills but zero business sense. Found Riya here and she brought the hustle I was missing. Perfect match!",
    avatarColors: ["#10b981", "#f59e0b"],
  },
  {
    name: "Ishaan & Kavya",
    startup: "ClearFund",
    quote:
      "The matching algorithm is scarily accurate. We were paired based on complementary skills and it just clicked from day one.",
    avatarColors: ["#8b5cf6", "#06b6d4"],
  },
];

/* ──────────────────  HELPER COMPONENTS  ────────────────── */

function MatchBadge({ score }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "4px 10px",
        borderRadius: "var(--radius-full)",
        fontSize: 12,
        fontWeight: 600,
        background: "rgba(16,185,129,0.12)",
        color: "#34d399",
        border: "1px solid rgba(16,185,129,0.2)",
      }}
    >
      <span style={{ fontSize: 10 }}>●</span> {score}% match
    </span>
  );
}

function StageBadge({ stage }) {
  const colors = {
    "Pre‑Seed": { bg: "rgba(99,102,241,0.1)", text: "#a5b4fc", border: "rgba(99,102,241,0.2)" },
    "Idea Stage": { bg: "rgba(245,158,11,0.1)", text: "#fbbf24", border: "rgba(245,158,11,0.2)" },
    "MVP Ready": { bg: "rgba(16,185,129,0.1)", text: "#34d399", border: "rgba(16,185,129,0.2)" },
    Seed: { bg: "rgba(236,72,153,0.1)", text: "#f472b6", border: "rgba(236,72,153,0.2)" },
  };
  const c = colors[stage] || colors["Pre‑Seed"];
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: "var(--radius-full)",
        fontSize: 11,
        fontWeight: 600,
        background: c.bg,
        color: c.text,
        border: `1px solid ${c.border}`,
        letterSpacing: "0.02em",
      }}
    >
      {stage}
    </span>
  );
}

/* ──────────────────  SECTION:  NAVBAR  ────────────────── */

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      id="nav-main"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: "0 24px",
        transition: "all 0.35s ease",
        background: scrolled ? "rgba(10,10,18,0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid var(--border-subtle)" : "1px solid transparent",
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 72,
        }}
      >
        {/* Logo */}
        <a href="#" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: "var(--gradient-brand)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 18,
              color: "#fff",
            }}
          >
            C
          </div>
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: 22,
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
            }}
          >
            Co<span className="gradient-text">Founder</span>
          </span>
        </a>

        {/* Desktop Links */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 36,
          }}
          className="nav-desktop"
        >
          {["How It Works", "Founders", "Candidates", "Testimonials"].map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase().replace(/ /g, "-")}`}
              style={{
                color: "var(--text-secondary)",
                fontSize: 14,
                fontWeight: 500,
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.color = "var(--text-primary)")}
              onMouseLeave={(e) => (e.target.style.color = "var(--text-secondary)")}
            >
              {l}
            </a>
          ))}
        </div>

        {/* CTA Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }} className="nav-desktop">
          <Link
            href="/login"
            style={{
              color: "var(--text-secondary)",
              fontSize: 14,
              fontWeight: 500,
              textDecoration: "none",
              padding: "8px 18px",
              borderRadius: "var(--radius-full)",
              transition: "all 0.2s",
              border: "1px solid transparent",
            }}
            onMouseEnter={(e) => {
              e.target.style.color = "var(--text-primary)";
              e.target.style.borderColor = "var(--border-subtle)";
            }}
            onMouseLeave={(e) => {
              e.target.style.color = "var(--text-secondary)";
              e.target.style.borderColor = "transparent";
            }}
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="btn-primary"
            style={{ padding: "10px 24px", fontSize: 14 }}
          >
            Sign Up Free
          </Link>
        </div>

        {/* Mobile burger */}
        <button
          className="nav-mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            display: "none",
            background: "none",
            border: "none",
            color: "var(--text-primary)",
            fontSize: 28,
            cursor: "pointer",
          }}
          aria-label="Toggle menu"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          style={{
            padding: "16px 0 24px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {["How It Works", "Founders", "Candidates", "Testimonials"].map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase().replace(/ /g, "-")}`}
              onClick={() => setMobileOpen(false)}
              style={{
                color: "var(--text-secondary)",
                fontSize: 16,
                fontWeight: 500,
                textDecoration: "none",
                padding: "8px 0",
              }}
            >
              {l}
            </a>
          ))}
          <Link href="/signup" className="btn-primary" style={{ marginTop: 8, justifyContent: "center" }}>
            Sign Up Free
          </Link>
        </div>
      )}

      <style jsx>{`
        @media (max-width: 768px) {
          .nav-desktop {
            display: none !important;
          }
          .nav-mobile-toggle {
            display: block !important;
          }
        }
      `}</style>
    </nav>
  );
}

/* ──────────────────  SECTION:  HERO  ────────────────── */

function HeroSection() {
  return (
    <section
      id="hero"
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        padding: "120px 24px 80px",
      }}
    >
      {/* Background orbs */}
      <div className="bg-orb animate-blob" style={{ width: 500, height: 500, background: "rgba(99,102,241,0.15)", top: "-10%", left: "-5%" }} />
      <div className="bg-orb animate-blob animation-delay-2000" style={{ width: 400, height: 400, background: "rgba(236,72,153,0.12)", bottom: "5%", right: "-5%" }} />
      <div className="bg-orb animate-blob animation-delay-4000" style={{ width: 350, height: 350, background: "rgba(139,92,246,0.1)", top: "40%", left: "50%" }} />

      {/* Grid pattern overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", zIndex: 2, textAlign: "center", maxWidth: 860 }}>
        {/* Tagline badge */}
        <div className="animate-fade-in" style={{ marginBottom: 24, animationDelay: "0.1s", opacity: 0 }}>
          <span className="badge badge-primary" style={{ fontSize: 14, padding: "8px 20px" }}>
            🚀 Built for Student Founders
          </span>
        </div>

        {/* Main heading */}
        <h1
          className="animate-fade-in-up"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "clamp(40px, 6vw, 78px)",
            fontWeight: 800,
            lineHeight: 1.08,
            letterSpacing: "-0.03em",
            marginBottom: 24,
            animationDelay: "0.25s",
            opacity: 0,
          }}
        >
          Find Your Perfect{" "}
          <span className="gradient-text">Co‑Founder</span>
        </h1>

        {/* Sub heading */}
        <p
          className="animate-fade-in-up"
          style={{
            fontSize: "clamp(17px, 2vw, 20px)",
            color: "var(--text-secondary)",
            maxWidth: 620,
            margin: "0 auto 40px",
            lineHeight: 1.65,
            animationDelay: "0.45s",
            opacity: 0,
          }}
        >
          The platform where student founders meet their match. Whether you
          have a startup idea or the skills to build one — we connect the dots
          so you can launch{" "}
          <span style={{ color: "var(--primary-400)", fontWeight: 600 }}>
            together
          </span>
          .
        </p>

        {/* CTA Buttons */}
        <div
          className="animate-fade-in-up"
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 16,
            flexWrap: "wrap",
            animationDelay: "0.6s",
            opacity: 0,
          }}
        >
          <Link href="/signup" className="btn-primary" style={{ fontSize: 16, padding: "16px 36px" }}>
            I Have a Startup Idea
            <span style={{ fontSize: 18 }}>→</span>
          </Link>
          <Link href="/signup" className="btn-secondary" style={{ fontSize: 16, padding: "16px 36px" }}>
            I Want to Join One
          </Link>
        </div>

        {/* Trust line */}
        <p
          className="animate-fade-in"
          style={{
            marginTop: 40,
            fontSize: 13,
            color: "var(--text-tertiary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            animationDelay: "0.85s",
            opacity: 0,
          }}
        >
          <span style={{ color: "#34d399" }}>✓</span> Free to join &nbsp;
          <span style={{ color: "#34d399" }}>✓</span> 2,400+ students &nbsp;
          <span style={{ color: "#34d399" }}>✓</span> 180+ colleges
        </p>
      </div>
    </section>
  );
}

/* ──────────────────  SECTION:  STATS  ────────────────── */

function StatsBar() {
  return (
    <section
      style={{
        position: "relative",
        padding: "0 24px",
        marginTop: -40,
        zIndex: 10,
      }}
    >
      <div
        className="glass-card"
        style={{
          maxWidth: 1040,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          padding: "32px 24px",
        }}
      >
        {STATS.map((s, i) => (
          <div
            key={s.label}
            style={{
              textAlign: "center",
              padding: "12px 0",
              borderRight: i < STATS.length - 1 ? "1px solid var(--border-subtle)" : "none",
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 4 }}>{s.icon}</div>
            <div
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 30,
                fontWeight: 700,
                letterSpacing: "-0.02em",
              }}
              className="gradient-text"
            >
              {s.value}
            </div>
            <div style={{ fontSize: 13, color: "var(--text-tertiary)", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ──────────────────  SECTION:  HOW IT WORKS  ────────────────── */

function HowItWorks() {
  return (
    <section id="how-it-works" style={{ padding: "120px 24px", position: "relative" }}>
      <div className="section-container">
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 72 }}>
          <span className="badge badge-primary" style={{ marginBottom: 16, display: "inline-flex" }}>
            How It Works
          </span>
          <h2
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(30px, 4vw, 48px)",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              marginTop: 12,
            }}
          >
            From Zero to <span className="gradient-text">Co‑Founder</span> in 4 Steps
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 17, marginTop: 16, maxWidth: 540, margin: "16px auto 0" }}>
            We've made it ridiculously simple to find your startup partner.
          </p>
        </div>

        {/* Steps grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 24,
          }}
        >
          {HOW_IT_WORKS.map((item, i) => (
            <div
              key={item.step}
              className="glass-card"
              style={{
                padding: 32,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Step number */}
              <div
                style={{
                  position: "absolute",
                  top: 16,
                  right: 20,
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 64,
                  fontWeight: 800,
                  opacity: 0.04,
                  lineHeight: 1,
                }}
              >
                {item.step}
              </div>

              <div style={{ fontSize: 40, marginBottom: 20 }}>{item.icon}</div>
              <h3
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 20,
                  fontWeight: 700,
                  marginBottom: 12,
                }}
              >
                {item.title}
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.7 }}>{item.desc}</p>

              {/* Connector dot */}
              {i < HOW_IT_WORKS.length - 1 && (
                <div
                  className="step-connector"
                  style={{
                    position: "absolute",
                    right: -14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "var(--bg-primary)",
                    border: "2px solid var(--primary-500)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    color: "var(--primary-400)",
                    zIndex: 2,
                  }}
                >
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .step-connector {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
}

/* ──────────────────  SECTION:  FOUNDER CARDS  ────────────────── */

function FoundersSection() {
  return (
    <section id="founders" style={{ padding: "100px 24px 120px", position: "relative" }}>
      {/* Background accent */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "var(--gradient-mesh)",
          pointerEvents: "none",
        }}
      />

      <div className="section-container" style={{ position: "relative", zIndex: 2 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <span className="badge badge-accent" style={{ marginBottom: 16, display: "inline-flex" }}>
            🚀 Startups Looking for Co-Founders
          </span>
          <h2
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              marginTop: 12,
            }}
          >
            Founders Ready to <span className="gradient-text">Build</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 16, marginTop: 14, maxWidth: 500, margin: "14px auto 0" }}>
            These founders have ideas, traction, and passion — they just need <strong style={{ color: "var(--text-primary)" }}>you</strong>.
          </p>
        </div>

        {/* Cards grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 24,
          }}
        >
          {FOUNDERS_WITH_STARTUPS.map((f) => (
            <div
              key={f.id}
              className="glass-card"
              style={{ padding: 28, display: "flex", flexDirection: "column", gap: 16 }}
            >
              {/* Top row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div className="avatar" style={{ background: `${f.color}22`, color: f.color }}>
                    {f.initials}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{f.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{f.university}</div>
                  </div>
                </div>
                <MatchBadge score={f.match} />
              </div>

              {/* Startup info */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 700,
                      fontSize: 18,
                    }}
                  >
                    {f.startup}
                  </span>
                  <StageBadge stage={f.stage} />
                </div>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{f.tagline}</p>
              </div>

              {/* Looking for */}
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "var(--radius-md)",
                  background: "rgba(99,102,241,0.06)",
                  border: "1px solid rgba(99,102,241,0.12)",
                  fontSize: 13,
                }}
              >
                <span style={{ color: "var(--text-tertiary)" }}>Looking for:</span>{" "}
                <span style={{ color: "var(--primary-300)", fontWeight: 600 }}>{f.looking}</span>
              </div>

              {/* Skills */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {f.skills.map((s) => (
                  <span key={s} className="tag-pill">
                    {s}
                  </span>
                ))}
              </div>

              {/* Action */}
              <button
                className="btn-primary"
                style={{
                  width: "100%",
                  justifyContent: "center",
                  padding: "12px 0",
                  marginTop: "auto",
                  fontSize: 14,
                }}
              >
                Connect with {f.name.split(" ")[0]}
              </button>
            </div>
          ))}
        </div>

        {/* View all link */}
        <div style={{ textAlign: "center", marginTop: 48 }}>
          <a href="#" className="btn-secondary">
            View All Founders →
          </a>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────  SECTION:  CANDIDATE CARDS  ────────────────── */

function CandidatesSection() {
  return (
    <section id="candidates" style={{ padding: "100px 24px 120px", position: "relative" }}>
      <div className="section-container">
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <span className="badge badge-emerald" style={{ marginBottom: 16, display: "inline-flex" }}>
            🧑‍💻 Candidates Ready to Co‑Found
          </span>
          <h2
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              marginTop: 12,
            }}
          >
            Talent Waiting to <span className="gradient-text">Join</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 16, marginTop: 14, maxWidth: 520, margin: "14px auto 0" }}>
            Developers, designers, marketers — skilled students eager to jump into a startup as a co-founder.
          </p>
        </div>

        {/* Cards grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 24,
          }}
        >
          {CANDIDATES.map((c) => (
            <div
              key={c.id}
              className="glass-card"
              style={{ padding: 28, display: "flex", flexDirection: "column", gap: 16 }}
            >
              {/* Top row */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div className="avatar" style={{ background: `${c.color}22`, color: c.color }}>
                  {c.initials}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{c.university}</div>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "4px 10px",
                    borderRadius: "var(--radius-full)",
                    background:
                      c.availability === "Immediate"
                        ? "rgba(16,185,129,0.12)"
                        : "rgba(245,158,11,0.12)",
                    color: c.availability === "Immediate" ? "#34d399" : "#fbbf24",
                    border: `1px solid ${c.availability === "Immediate" ? "rgba(16,185,129,0.2)" : "rgba(245,158,11,0.2)"}`,
                  }}
                >
                  {c.availability}
                </span>
              </div>

              {/* Role */}
              <div
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: 16,
                  color: c.color,
                }}
              >
                {c.role}
              </div>

              {/* Bio */}
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.65 }}>{c.bio}</p>

              {/* Skills */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {c.skills.map((s) => (
                  <span key={s} className="tag-pill">
                    {s}
                  </span>
                ))}
              </div>

              {/* Interests */}
              <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                <span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>Interested in:</span>{" "}
                {c.interests.join(" · ")}
              </div>

              {/* Action */}
              <button
                className="btn-secondary"
                style={{
                  width: "100%",
                  justifyContent: "center",
                  padding: "12px 0",
                  marginTop: "auto",
                  fontSize: 14,
                }}
              >
                View Profile
              </button>
            </div>
          ))}
        </div>

        {/* View all */}
        <div style={{ textAlign: "center", marginTop: 48 }}>
          <a href="#" className="btn-secondary">
            Browse All Candidates →
          </a>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────  SECTION: TESTIMONIALS  ────────────────── */

function TestimonialsSection() {
  return (
    <section id="testimonials" style={{ padding: "100px 24px 120px", position: "relative" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "var(--gradient-mesh)",
          pointerEvents: "none",
        }}
      />

      <div className="section-container" style={{ position: "relative", zIndex: 2 }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <span className="badge badge-amber" style={{ marginBottom: 16, display: "inline-flex" }}>
            💬 Success Stories
          </span>
          <h2
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              marginTop: 12,
            }}
          >
            Teams Formed on <span className="gradient-text">CoFounder</span>
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 24,
          }}
        >
          {TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              className="glass-card"
              style={{ padding: 32, display: "flex", flexDirection: "column", gap: 20 }}
            >
              {/* Quote */}
              <div style={{ fontSize: 36, lineHeight: 1, opacity: 0.15 }}>"</div>
              <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.75, flex: 1 }}>
                {t.quote}
              </p>

              {/* Author */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, borderTop: "1px solid var(--border-subtle)", paddingTop: 20 }}>
                <div style={{ display: "flex" }}>
                  {t.avatarColors.map((c, j) => (
                    <div
                      key={j}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: `${c}33`,
                        border: `2px solid ${c}`,
                        marginLeft: j > 0 ? -10 : 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 14,
                      }}
                    >
                      {t.name.split(" & ")[j]?.[0]}
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                    Co-Founders, {t.startup}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────  SECTION:  CTA  ────────────────── */

function CTASection() {
  return (
    <section style={{ padding: "80px 24px 120px" }}>
      <div className="section-container">
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: "var(--radius-xl)",
            padding: "72px 40px",
            textAlign: "center",
            background:
              "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.12), rgba(236,72,153,0.12))",
            border: "1px solid rgba(99,102,241,0.15)",
          }}
        >
          {/* Orbs */}
          <div
            className="bg-orb"
            style={{
              width: 300,
              height: 300,
              background: "rgba(99,102,241,0.2)",
              top: -60,
              left: -60,
              filter: "blur(100px)",
            }}
          />
          <div
            className="bg-orb"
            style={{
              width: 250,
              height: 250,
              background: "rgba(236,72,153,0.15)",
              bottom: -40,
              right: -40,
              filter: "blur(100px)",
            }}
          />

          <div style={{ position: "relative", zIndex: 2 }}>
            <h2
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "clamp(28px, 4vw, 48px)",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                marginBottom: 16,
              }}
            >
              Your Co‑Founder is{" "}
              <span className="gradient-text">One Click Away</span>
            </h2>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: 17,
                maxWidth: 560,
                margin: "0 auto 36px",
                lineHeight: 1.65,
              }}
            >
              Join thousands of ambitious student founders. Whether you're a
              hustler with an idea or a builder looking for a mission — your
              journey starts here.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
              <Link href="/signup" className="btn-primary" style={{ fontSize: 16, padding: "16px 40px" }}>
                Get Started — It's Free
                <span style={{ fontSize: 18 }}>→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────  SECTION:  FOOTER  ────────────────── */

function Footer() {
  const columns = [
    {
      title: "Platform",
      links: ["Browse Founders", "Browse Candidates", "How It Works", "Pricing"],
    },
    {
      title: "Resources",
      links: ["Blog", "Startup Guides", "Community", "Events"],
    },
    {
      title: "Company",
      links: ["About Us", "Careers", "Contact", "Press"],
    },
    {
      title: "Legal",
      links: ["Privacy Policy", "Terms of Service", "Cookie Policy"],
    },
  ];

  return (
    <footer
      style={{
        borderTop: "1px solid var(--border-subtle)",
        padding: "64px 24px 40px",
        background: "var(--bg-secondary)",
      }}
    >
      <div className="section-container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr repeat(4, 1fr)",
            gap: 40,
          }}
          className="footer-grid"
        >
          {/* Brand column */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: "var(--gradient-brand)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: 16,
                  color: "#fff",
                }}
              >
                C
              </div>
              <span
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  fontSize: 20,
                }}
              >
                Co<span className="gradient-text">Founder</span>
              </span>
            </div>
            <p style={{ fontSize: 14, color: "var(--text-tertiary)", lineHeight: 1.7, maxWidth: 280 }}>
              Empowering the next generation of student founders to find their
              perfect co-founders and build something extraordinary.
            </p>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h4
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 16,
                }}
              >
                {col.title}
              </h4>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      style={{
                        fontSize: 14,
                        color: "var(--text-tertiary)",
                        textDecoration: "none",
                        transition: "color 0.2s",
                      }}
                      onMouseEnter={(e) => (e.target.style.color = "var(--text-primary)")}
                      onMouseLeave={(e) => (e.target.style.color = "var(--text-tertiary)")}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            marginTop: 56,
            paddingTop: 24,
            borderTop: "1px solid var(--border-subtle)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <p style={{ fontSize: 13, color: "var(--text-tertiary)" }}>
            © {new Date().getFullYear()} CoFounder. All rights reserved.
          </p>
          <div style={{ display: "flex", gap: 20 }}>
            {["Twitter", "LinkedIn", "GitHub"].map((social) => (
              <a
                key={social}
                href="#"
                style={{
                  fontSize: 13,
                  color: "var(--text-tertiary)",
                  textDecoration: "none",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.color = "var(--primary-400)")}
                onMouseLeave={(e) => (e.target.style.color = "var(--text-tertiary)")}
              >
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 480px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}

/* ──────────────────  PAGE  ────────────────── */

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <StatsBar />
        <HowItWorks />
        <FoundersSection />
        <CandidatesSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}