"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAuth } from "../../context/AuthContext";

/* ==================  Yup Validation Schema  ================== */
const loginSchema = Yup.object({
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  rememberMe: Yup.boolean(),
});

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    validationSchema: loginSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values, { setSubmitting, setStatus }) => {
      try {
        setStatus(null);
        await login(values.email, values.password);
        setSubmitSuccess(true);
        setTimeout(() => router.push("/dashboard"), 1000);
      } catch (err) {
        const msg = err?.response?.data?.message || "Invalid email or password. Please try again.";
        setStatus(msg);
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Helper: show error only if field was touched
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
      <div className="bg-orb animate-blob" style={{ width: 420, height: 420, background: "rgba(99,102,241,0.14)", top: "-8%", left: "-6%" }} />
      <div className="bg-orb animate-blob animation-delay-2000" style={{ width: 360, height: 360, background: "rgba(236,72,153,0.10)", bottom: "0%", right: "-4%" }} />
      <div className="bg-orb animate-blob animation-delay-4000" style={{ width: 280, height: 280, background: "rgba(139,92,246,0.09)", top: "50%", left: "60%" }} />

      <div style={styles.gridOverlay} />

      <div style={styles.container}>
        {/* Left — Branding panel */}
        <div style={styles.brandPanel} className="brand-panel">
          <Link href="/" style={styles.logoRow}>
            <div style={styles.logoIcon}>C</div>
            <span style={styles.logoText}>
              Co<span className="gradient-text">Founder</span>
            </span>
          </Link>

          <div style={{ marginTop: 48 }}>
            <h1 style={styles.brandHeading}>
              Welcome back,<br />
              <span className="gradient-text">Builder.</span>
            </h1>
            <p style={styles.brandSub}>
              Log in to continue connecting with co-founders, tracking your
              matches, and building your startup dream team.
            </p>
          </div>

          {/* Decorative floating cards */}
          <div style={styles.floatingCards}>
            <div className="glass-card animate-float" style={styles.miniCard}>
              <div style={{ fontSize: 28 }}>🤝</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>New Match!</div>
                <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
                  Vikram J. — 94% compatible
                </div>
              </div>
            </div>
            <div
              className="glass-card animate-float animation-delay-2000"
              style={{ ...styles.miniCard, marginLeft: 40, marginTop: 12 }}
            >
              <div style={{ fontSize: 28 }}>🚀</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>Startup Update</div>
                <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
                  FinLit raised pre-seed!
                </div>
              </div>
            </div>
          </div>

          <p style={styles.brandFooter}>
            Trusted by <strong style={{ color: "var(--primary-300)" }}>2,400+</strong> students
            across <strong style={{ color: "var(--primary-300)" }}>180+</strong> universities
          </p>
        </div>

        {/* Right — Login form */}
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

          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Log In</h2>
            <p style={styles.formSubtitle}>
              Don&apos;t have an account?{" "}
              <Link href="/signup" style={styles.link}>
                Sign up free →
              </Link>
            </p>
          </div>

          {/* Social login row */}
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

          {/* Divider */}
          <div style={styles.divider}>
            <div style={styles.dividerLine} />
            <span style={styles.dividerText}>or continue with email</span>
            <div style={styles.dividerLine} />
          </div>

          {/* Success message */}
          {submitSuccess && (
            <div style={styles.successBanner}>
              <span style={{ fontSize: 18 }}>✅</span>
              <span>Login successful! Redirecting...</span>
            </div>
          )}

          {/* Server error message */}
          {formik.status && (
            <div style={styles.errorBanner}>
              <span style={{ fontSize: 16 }}>⚠️</span>
              <span>{formik.status}</span>
            </div>
          )}

          {/* Formik Form */}
          <form onSubmit={formik.handleSubmit} style={styles.form} noValidate>
            {/* Email */}
            <div style={styles.fieldGroup}>
              <label style={styles.label} htmlFor="login-email">Email Address</label>
              <div style={{ position: "relative" }}>
                <span style={styles.inputIcon}>✉</span>
                <input
                  id="login-email"
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

            {/* Password */}
            <div style={styles.fieldGroup}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={styles.label} htmlFor="login-password">Password</label>
                <a href="#" style={{ ...styles.link, fontSize: 12 }}>Forgot password?</a>
              </div>
              <div style={{ position: "relative" }}>
                <span style={styles.inputIcon}>🔒</span>
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
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
              {fieldError("password") && (
                <span style={styles.error}>{fieldError("password")}</span>
              )}
            </div>

            {/* Remember me */}
            <div style={styles.rememberRow}>
              <label style={styles.checkbox}>
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formik.values.rememberMe}
                  onChange={formik.handleChange}
                  style={{ accentColor: "#6366f1" }}
                />
                <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Remember me</span>
              </label>
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
                <>Log In <span style={{ fontSize: 18 }}>→</span></>
              )}
            </button>
          </form>

          <p style={styles.terms}>
            By logging in you agree to our{" "}
            <a href="#" style={styles.link}>Terms</a> &{" "}
            <a href="#" style={styles.link}>Privacy Policy</a>
          </p>
        </div>
      </div>

      {/* Responsive styles */}
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
    minHeight: 640,
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
      "linear-gradient(160deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.06) 50%, rgba(236,72,153,0.06) 100%)",
    borderRight: "1px solid var(--border-subtle)",
    position: "relative",
    overflow: "hidden",
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
    fontSize: 36,
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

  floatingCards: {
    marginTop: "auto",
    paddingTop: 40,
  },

  miniCard: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "14px 18px",
    width: "fit-content",
    borderRadius: "var(--radius-md)",
  },

  brandFooter: {
    marginTop: 32,
    fontSize: 12,
    color: "var(--text-tertiary)",
  },

  formPanel: {
    flex: 1,
    padding: "48px 44px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    overflowY: "auto",
  },

  mobileLogo: {
    marginBottom: 32,
  },

  formHeader: {
    marginBottom: 28,
  },

  formTitle: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 28,
    fontWeight: 700,
    letterSpacing: "-0.02em",
  },

  formSubtitle: {
    marginTop: 8,
    fontSize: 14,
    color: "var(--text-secondary)",
  },

  link: {
    color: "var(--primary-400)",
    textDecoration: "none",
    fontWeight: 500,
    transition: "color 0.2s",
  },

  socialRow: {
    display: "flex",
    gap: 12,
    marginBottom: 24,
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
    marginBottom: 24,
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
    gap: 20,
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
    padding: "13px 14px 13px 42px",
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

  rememberRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  checkbox: {
    display: "flex",
    alignItems: "center",
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
    marginTop: 24,
    fontSize: 12,
    color: "var(--text-tertiary)",
    textAlign: "center",
  },
};
