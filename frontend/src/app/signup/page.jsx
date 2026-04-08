"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAuth } from "../../context/AuthContext";

/* ==================  Constants  ================== */

const ROLE_OPTIONS = [
  {
    id: "founder",
    icon: "🚀",
    title: "I have a startup idea",
    desc: "I'm looking for a co-founder to build with me",
    color: "#6366f1",
  },
  {
    id: "candidate",
    icon: "🧑‍💻",
    title: "I want to join a startup",
    desc: "I have skills and want to co-found something",
    color: "#10b981",
  },
];

/* ==================  Yup Validation Schema  ================== */

const signupSchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(60, "Name must be 60 characters or less")
    .matches(/^[a-zA-Z\s.'-]+$/, "Name can only contain letters, spaces, dots and hyphens")
    .required("Full name is required"),

  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email is required"),

  university: Yup.string()
    .trim()
    .min(2, "University name must be at least 2 characters")
    .max(100, "University name is too long")
    .required("University / College is required"),

  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Must contain at least one uppercase letter")
    .matches(/[0-9]/, "Must contain at least one number")
    .matches(/[^A-Za-z0-9]/, "Must contain at least one special character (!@#$%...)")
    .required("Password is required"),

  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords do not match")
    .required("Please confirm your password"),

  agreed: Yup.boolean()
    .oneOf([true], "You must agree to the Terms & Privacy Policy"),
});

/* ==================  Password Strength  ================== */

function getStrength(pw) {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
const strengthColors = ["", "#f43f5e", "#f59e0b", "#10b981", "#6366f1"];

/* ==================  Component  ================== */

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      university: "",
      password: "",
      confirmPassword: "",
      agreed: false,
    },
    validationSchema: signupSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values, { setSubmitting, setStatus }) => {
      try {
        setStatus(null);
        await register({
          name: values.name,
          email: values.email,
          password: values.password,
          university: values.university,
          role,
        });
        setSubmitSuccess(true);
        setTimeout(() => router.push("/profile"), 1200);
      } catch (err) {
        const msg = err?.response?.data?.message || "Something went wrong. Please try again.";
        setStatus(msg);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const strength = getStrength(formik.values.password);

  // Helper: show error only when touched
  const fieldError = (name) =>
    formik.touched[name] && formik.errors[name] ? formik.errors[name] : null;

  const fieldStyle = (name) => ({
    ...styles.input,
    borderColor: fieldError(name)
      ? "#f43f5e"
      : formik.touched[name] && !formik.errors[name]
      ? "rgba(16,185,129,0.4)"
      : "var(--border-subtle)",
    boxShadow: fieldError(name)
      ? "0 0 0 3px rgba(244,63,94,0.08)"
      : formik.touched[name] && !formik.errors[name]
      ? "0 0 0 3px rgba(16,185,129,0.08)"
      : "none",
  });

  return (
    <div style={styles.page}>
      {/* Background effects */}
      <div className="bg-orb animate-blob" style={{ width: 440, height: 440, background: "rgba(16,185,129,0.12)", top: "-10%", right: "-5%" }} />
      <div className="bg-orb animate-blob animation-delay-2000" style={{ width: 380, height: 380, background: "rgba(99,102,241,0.12)", bottom: "-5%", left: "-5%" }} />
      <div className="bg-orb animate-blob animation-delay-4000" style={{ width: 260, height: 260, background: "rgba(236,72,153,0.08)", top: "35%", left: "45%" }} />

      <div style={styles.gridOverlay} />

      <div style={styles.container}>
        {/* Left — Brand panel */}
        <div style={styles.brandPanel} className="brand-panel">
          <Link href="/" style={styles.logoRow}>
            <div style={styles.logoIcon}>C</div>
            <span style={styles.logoText}>
              Co<span className="gradient-text">Founder</span>
            </span>
          </Link>

          <div style={{ marginTop: 48 }}>
            <h1 style={styles.brandHeading}>
              Start your<br />
              <span className="gradient-text">Founder Journey.</span>
            </h1>
            <p style={styles.brandSub}>
              Create your profile, get matched with the perfect co-founder, and
              start building something the world needs.
            </p>
          </div>

          {/* Feature bullets */}
          <div style={styles.featureList}>
            {[
              { icon: "🎯", text: "AI-powered compatibility matching" },
              { icon: "💬", text: "Built-in chat & video calls" },
              { icon: "📚", text: "Startup resources & mentorship" },
              { icon: "🔒", text: "Verified university profiles" },
            ].map((f) => (
              <div key={f.text} style={styles.featureItem}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{f.icon}</span>
                <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{f.text}</span>
              </div>
            ))}
          </div>

          <p style={styles.brandFooter}>
            Join <strong style={{ color: "var(--emerald-400)" }}>2,400+</strong> students
            already on CoFounder
          </p>
        </div>

        {/* Right — Multi-step form */}
        <div style={styles.formPanel}>
          {/* Mobile logo */}
          <div className="mobile-logo" style={styles.mobileLogo}>
            <Link href="/" style={styles.logoRow}>
              <div style={styles.logoIcon}>C</div>
              <span style={styles.logoText}>
                Co<span className="gradient-text">Founder</span>
              </span>
            </Link>
          </div>

          {/* Step indicator */}
          <div style={styles.stepBar}>
            <div style={{ ...styles.stepDot, background: "var(--gradient-brand)" }}>1</div>
            <div style={{ ...styles.stepLine, background: step >= 2 ? "var(--primary-500)" : "var(--border-subtle)" }} />
            <div
              style={{
                ...styles.stepDot,
                background: step >= 2 ? "var(--gradient-brand)" : "var(--bg-card)",
                border: step >= 2 ? "none" : "1px solid var(--border-subtle)",
                color: step >= 2 ? "#fff" : "var(--text-tertiary)",
              }}
            >
              2
            </div>
          </div>

          {step === 1 ? (
            /* ==================  STEP 1 — Role selection  ================== */
            <div className="animate-fade-in" style={{ animationDuration: "0.4s" }}>
              <div style={styles.formHeader}>
                <h2 style={styles.formTitle}>Create Your Account</h2>
                <p style={styles.formSubtitle}>
                  Already have an account?{" "}
                  <Link href="/login" style={styles.link}>Log in →</Link>
                </p>
              </div>

              <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 20 }}>
                How do you want to use CoFounder?
              </p>

              <div style={styles.roleGrid}>
                {ROLE_OPTIONS.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    style={{
                      ...styles.roleCard,
                      borderColor: role === r.id ? r.color : "var(--border-subtle)",
                      background:
                        role === r.id
                          ? `${r.color}0d`
                          : "rgba(255,255,255,0.02)",
                      boxShadow:
                        role === r.id ? `0 0 24px ${r.color}20` : "none",
                    }}
                  >
                    <div style={{ fontSize: 40, marginBottom: 12 }}>{r.icon}</div>
                    <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 6, color: role === r.id ? r.color : "var(--text-primary)" }}>
                      {r.title}
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text-tertiary)", lineHeight: 1.5 }}>
                      {r.desc}
                    </div>
                    {/* Radio indicator */}
                    <div
                      style={{
                        position: "absolute",
                        top: 16,
                        right: 16,
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        border: `2px solid ${role === r.id ? r.color : "var(--border-subtle)"}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {role === r.id && (
                        <div
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            background: r.color,
                          }}
                        />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Social signup */}
              <div style={{ marginTop: 28 }}>
                <div style={styles.divider}>
                  <div style={styles.dividerLine} />
                  <span style={styles.dividerText}>or sign up with</span>
                  <div style={styles.dividerLine} />
                </div>
                <div style={styles.socialRow}>
                  <button style={styles.socialBtn} type="button">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    <span>Google</span>
                  </button>
                  <button style={styles.socialBtn} type="button">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                    </svg>
                    <span>GitHub</span>
                  </button>
                </div>
              </div>

              <button
                type="button"
                className="btn-primary"
                disabled={!role}
                onClick={() => role && setStep(2)}
                style={{
                  width: "100%",
                  justifyContent: "center",
                  padding: "15px 0",
                  fontSize: 15,
                  marginTop: 24,
                  opacity: role ? 1 : 0.5,
                  cursor: role ? "pointer" : "not-allowed",
                }}
              >
                Continue <span style={{ fontSize: 18 }}>→</span>
              </button>
            </div>
          ) : (
            /* ==================  STEP 2 — Details form (Formik)  ================== */
            <div className="animate-fade-in" style={{ animationDuration: "0.4s" }}>
              <div style={styles.formHeader}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={styles.backBtn}
                >
                  ← Back
                </button>
                <h2 style={{ ...styles.formTitle, marginTop: 8 }}>Your Details</h2>
                <p style={styles.formSubtitle}>
                  Signing up as{" "}
                  <span
                    style={{
                      fontWeight: 600,
                      color: role === "founder" ? "#6366f1" : "#10b981",
                    }}
                  >
                    {role === "founder" ? "🚀 Founder" : "🧑‍💻 Candidate"}
                  </span>
                </p>
              </div>

              {/* Success message */}
              {submitSuccess && (
                <div style={styles.successBanner}>
                  <span style={{ fontSize: 18 }}>🎉</span>
                  <span>Account created successfully! Welcome to CoFounder.</span>
                </div>
              )}

              {/* Server error */}
              {formik.status && (
                <div style={styles.errorBanner}>
                  <span style={{ fontSize: 16 }}>⚠️</span>
                  <span>{formik.status}</span>
                </div>
              )}

              <form onSubmit={formik.handleSubmit} style={styles.form} noValidate>
                {/* Full name */}
                <div style={styles.fieldGroup}>
                  <label style={styles.label} htmlFor="signup-name">Full Name</label>
                  <div style={{ position: "relative" }}>
                    <span style={styles.inputIcon}>👤</span>
                    <input
                      id="signup-name"
                      name="name"
                      type="text"
                      placeholder="Arjun Mehta"
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      style={fieldStyle("name")}
                    />
                    {formik.touched.name && !formik.errors.name && (
                      <span style={styles.validIcon}>✓</span>
                    )}
                  </div>
                  {fieldError("name") && (
                    <span style={styles.error}>{fieldError("name")}</span>
                  )}
                </div>

                {/* Email */}
                <div style={styles.fieldGroup}>
                  <label style={styles.label} htmlFor="signup-email">Email Address</label>
                  <div style={{ position: "relative" }}>
                    <span style={styles.inputIcon}>✉</span>
                    <input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="you@university.edu"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      style={fieldStyle("email")}
                    />
                    {formik.touched.email && !formik.errors.email && (
                      <span style={styles.validIcon}>✓</span>
                    )}
                  </div>
                  {fieldError("email") && (
                    <span style={styles.error}>{fieldError("email")}</span>
                  )}
                </div>

                {/* University */}
                <div style={styles.fieldGroup}>
                  <label style={styles.label} htmlFor="signup-university">University / College</label>
                  <div style={{ position: "relative" }}>
                    <span style={styles.inputIcon}>🎓</span>
                    <input
                      id="signup-university"
                      name="university"
                      type="text"
                      placeholder="IIT Delhi"
                      value={formik.values.university}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      style={fieldStyle("university")}
                    />
                    {formik.touched.university && !formik.errors.university && (
                      <span style={styles.validIcon}>✓</span>
                    )}
                  </div>
                  {fieldError("university") && (
                    <span style={styles.error}>{fieldError("university")}</span>
                  )}
                </div>

                {/* Password */}
                <div style={styles.fieldGroup}>
                  <label style={styles.label} htmlFor="signup-password">Password</label>
                  <div style={{ position: "relative" }}>
                    <span style={styles.inputIcon}>🔒</span>
                    <input
                      id="signup-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min 8 characters"
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      style={fieldStyle("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={styles.eyeBtn}
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? "🙈" : "👁"}
                    </button>
                  </div>

                  {/* Strength meter */}
                  {formik.values.password && (
                    <div style={{ marginTop: 6 }}>
                      <div style={styles.strengthTrack}>
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            style={{
                              flex: 1,
                              height: 4,
                              borderRadius: 2,
                              background:
                                i <= strength
                                  ? strengthColors[strength]
                                  : "var(--border-subtle)",
                              transition: "background 0.3s",
                            }}
                          />
                        ))}
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 11, color: strengthColors[strength], fontWeight: 500 }}>
                          {strengthLabels[strength]}
                        </span>
                        {/* Password requirement checklist */}
                        <div style={{ display: "flex", gap: 6 }}>
                          {[
                            { test: formik.values.password.length >= 8, label: "8+" },
                            { test: /[A-Z]/.test(formik.values.password), label: "A-Z" },
                            { test: /[0-9]/.test(formik.values.password), label: "0-9" },
                            { test: /[^A-Za-z0-9]/.test(formik.values.password), label: "!@#" },
                          ].map((req) => (
                            <span
                              key={req.label}
                              style={{
                                fontSize: 10,
                                fontWeight: 600,
                                padding: "1px 5px",
                                borderRadius: 4,
                                background: req.test ? "rgba(16,185,129,0.12)" : "rgba(255,255,255,0.04)",
                                color: req.test ? "#34d399" : "var(--text-tertiary)",
                                border: `1px solid ${req.test ? "rgba(16,185,129,0.25)" : "var(--border-subtle)"}`,
                                transition: "all 0.2s",
                              }}
                            >
                              {req.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {fieldError("password") && (
                    <span style={styles.error}>{fieldError("password")}</span>
                  )}
                </div>

                {/* Confirm password */}
                <div style={styles.fieldGroup}>
                  <label style={styles.label} htmlFor="signup-confirm">Confirm Password</label>
                  <div style={{ position: "relative" }}>
                    <span style={styles.inputIcon}>🔒</span>
                    <input
                      id="signup-confirm"
                      name="confirmPassword"
                      type="password"
                      placeholder="Re-enter password"
                      value={formik.values.confirmPassword}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      style={fieldStyle("confirmPassword")}
                    />
                    {formik.touched.confirmPassword &&
                      !formik.errors.confirmPassword &&
                      formik.values.confirmPassword && (
                        <span style={styles.validIcon}>✓</span>
                      )}
                  </div>
                  {fieldError("confirmPassword") && (
                    <span style={styles.error}>{fieldError("confirmPassword")}</span>
                  )}
                </div>

                {/* Agree to terms */}
                <div style={styles.fieldGroup}>
                  <label style={styles.checkbox}>
                    <input
                      type="checkbox"
                      name="agreed"
                      checked={formik.values.agreed}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      style={{ accentColor: "#6366f1" }}
                    />
                    <span style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                      I agree to the{" "}
                      <a href="#" style={styles.link}>Terms of Service</a> and{" "}
                      <a href="#" style={styles.link}>Privacy Policy</a>
                    </span>
                  </label>
                  {fieldError("agreed") && (
                    <span style={styles.error}>{fieldError("agreed")}</span>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={formik.isSubmitting}
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    padding: "15px 0",
                    fontSize: 15,
                    opacity: formik.isSubmitting ? 0.7 : 1,
                    cursor: formik.isSubmitting ? "wait" : "pointer",
                  }}
                >
                  {formik.isSubmitting ? (
                    <span style={styles.spinner} />
                  ) : (
                    <>Create Account <span style={{ fontSize: 18 }}>→</span></>
                  )}
                </button>
              </form>
            </div>
          )}

          <p style={styles.terms}>
            Already have an account?{" "}
            <Link href="/login" style={styles.link}>Log in</Link>
          </p>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 960px) {
          .brand-panel {
            display: none !important;
          }
        }
        @media (min-width: 961px) {
          .mobile-logo {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

/* ======================== STYLES ======================== */

const styles = {
  page: {
    position: "relative",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    padding: "40px 24px",
  },

  gridOverlay: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
    backgroundSize: "60px 60px",
    pointerEvents: "none",
  },

  container: {
    position: "relative",
    zIndex: 2,
    display: "flex",
    width: "100%",
    maxWidth: 1060,
    minHeight: 660,
    borderRadius: "var(--radius-xl)",
    overflow: "hidden",
    border: "1px solid var(--border-subtle)",
    background: "rgba(255,255,255,0.02)",
    backdropFilter: "blur(24px)",
    boxShadow: "0 25px 60px rgba(0,0,0,0.4)",
  },

  brandPanel: {
    flex: "0 0 44%",
    padding: "48px 40px",
    display: "flex",
    flexDirection: "column",
    background:
      "linear-gradient(160deg, rgba(16,185,129,0.06) 0%, rgba(99,102,241,0.08) 50%, rgba(139,92,246,0.06) 100%)",
    borderRight: "1px solid var(--border-subtle)",
    position: "relative",
  },

  logoRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    textDecoration: "none",
  },

  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 9,
    background: "var(--gradient-brand)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: 17,
    color: "#fff",
  },

  logoText: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 700,
    fontSize: 20,
    color: "var(--text-primary)",
    letterSpacing: "-0.02em",
  },

  brandHeading: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 34,
    fontWeight: 800,
    lineHeight: 1.15,
    letterSpacing: "-0.02em",
  },

  brandSub: {
    marginTop: 16,
    fontSize: 14,
    color: "var(--text-secondary)",
    lineHeight: 1.7,
    maxWidth: 340,
  },

  featureList: {
    marginTop: "auto",
    paddingTop: 32,
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },

  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 14px",
    borderRadius: "var(--radius-md)",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid var(--border-subtle)",
  },

  brandFooter: {
    marginTop: 28,
    fontSize: 12,
    color: "var(--text-tertiary)",
  },

  formPanel: {
    flex: 1,
    padding: "40px 44px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    overflowY: "auto",
  },

  mobileLogo: {
    marginBottom: 24,
  },

  stepBar: {
    display: "flex",
    alignItems: "center",
    gap: 0,
    marginBottom: 28,
  },

  stepDot: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 700,
    color: "#fff",
    flexShrink: 0,
  },

  stepLine: {
    flex: 1,
    height: 2,
    maxWidth: 80,
    borderRadius: 1,
    transition: "background 0.3s",
  },

  formHeader: {
    marginBottom: 20,
  },

  formTitle: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 26,
    fontWeight: 700,
    letterSpacing: "-0.02em",
  },

  formSubtitle: {
    marginTop: 6,
    fontSize: 14,
    color: "var(--text-secondary)",
  },

  link: {
    color: "var(--primary-400)",
    textDecoration: "none",
    fontWeight: 500,
  },

  backBtn: {
    background: "none",
    border: "none",
    color: "var(--text-tertiary)",
    fontSize: 13,
    cursor: "pointer",
    padding: 0,
    fontWeight: 500,
    transition: "color 0.2s",
  },

  roleGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
  },

  roleCard: {
    position: "relative",
    padding: "28px 22px",
    borderRadius: "var(--radius-lg)",
    border: "1.5px solid var(--border-subtle)",
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.3s ease",
    fontFamily: "inherit",
  },

  socialRow: {
    display: "flex",
    gap: 12,
    marginBottom: 8,
  },

  socialBtn: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: "12px 0",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--border-subtle)",
    background: "rgba(255,255,255,0.03)",
    color: "var(--text-secondary)",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.25s",
  },

  divider: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    marginBottom: 16,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    background: "var(--border-subtle)",
  },

  dividerText: {
    fontSize: 12,
    color: "var(--text-tertiary)",
    whiteSpace: "nowrap",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },

  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },

  label: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--text-secondary)",
  },

  input: {
    width: "100%",
    padding: "12px 14px 12px 42px",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--border-subtle)",
    background: "rgba(255,255,255,0.03)",
    color: "var(--text-primary)",
    fontSize: 14,
    outline: "none",
    transition: "border-color 0.25s, box-shadow 0.25s",
    fontFamily: "inherit",
  },

  inputIcon: {
    position: "absolute",
    left: 14,
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: 15,
    pointerEvents: "none",
    opacity: 0.5,
  },

  validIcon: {
    position: "absolute",
    right: 14,
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: 14,
    color: "#34d399",
    fontWeight: 700,
    pointerEvents: "none",
  },

  eyeBtn: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 16,
    padding: 4,
    opacity: 0.6,
  },

  error: {
    fontSize: 12,
    color: "#f43f5e",
    marginTop: 2,
    display: "flex",
    alignItems: "center",
    gap: 4,
  },

  successBanner: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 16px",
    borderRadius: "var(--radius-md)",
    background: "rgba(16,185,129,0.1)",
    border: "1px solid rgba(16,185,129,0.25)",
    color: "#34d399",
    fontSize: 14,
    fontWeight: 500,
    marginBottom: 16,
  },

  errorBanner: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 16px",
    borderRadius: "var(--radius-md)",
    background: "rgba(244,63,94,0.08)",
    border: "1px solid rgba(244,63,94,0.2)",
    color: "#f43f5e",
    fontSize: 14,
    fontWeight: 500,
    marginBottom: 16,
  },

  strengthTrack: {
    display: "flex",
    gap: 4,
    marginBottom: 4,
  },

  checkbox: {
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    cursor: "pointer",
  },

  spinner: {
    display: "inline-block",
    width: 20,
    height: 20,
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    animation: "spin-slow 0.6s linear infinite",
  },

  terms: {
    marginTop: 20,
    fontSize: 12,
    color: "var(--text-tertiary)",
    textAlign: "center",
  },
};
