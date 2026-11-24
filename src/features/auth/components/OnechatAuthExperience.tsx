"use client";

import React, { useState, useId, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useWatch } from "react-hook-form";
import { GuestGuard } from "../gaurds/GeustGaurd";
import { useLogin } from "../hooks/useLogin";
import { useRegister } from "../hooks/useRegister";
import { UsernameStatus } from "./UsernameStatus";

interface Props {
  initialMode?: "login" | "signup";
}

// Directional Motion Variants for Flawless Forward & Reverse Transitions
const CUBIC_EASE = [0.22, 1, 0.36, 1] as const;

const editorialVariants: Variants = {
  initial: (dir: number) => ({
    opacity: 0,
    y: dir > 0 ? 28 : -28,
  }),
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.48, ease: CUBIC_EASE },
  },
  exit: (dir: number) => ({
    opacity: 0,
    y: dir > 0 ? -28 : 28,
    transition: { duration: 0.36, ease: CUBIC_EASE },
  }),
};

const formCardVariants: Variants = {
  initial: (dir: number) => ({
    opacity: 0,
    y: dir > 0 ? 22 : -22,
    scale: 0.985,
  }),
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: CUBIC_EASE },
  },
  exit: (dir: number) => ({
    opacity: 0,
    y: dir > 0 ? -22 : 22,
    scale: 0.985,
    transition: { duration: 0.36, ease: CUBIC_EASE },
  }),
};

function AuthExperienceInner({ initialMode = "login" }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const uid = useId();

  // Mode state: 'login' | 'signup'
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const isSignup = mode === "signup";

  // Direction: 1 = forward (login -> signup), -1 = reverse (signup -> login)
  const [direction, setDirection] = useState<1 | -1>(initialMode === "signup" ? 1 : -1);

  // Check if user was redirected immediately after registering
  const isRegisteredSuccess = searchParams.get("registered") === "true";

  // Synchronize mode when browser back/forward buttons are pressed
  useEffect(() => {
    const targetMode =
      pathname === "/signup" || pathname === "/auth/register" ? "signup" : "login";
    if (targetMode !== mode) {
      setDirection(targetMode === "signup" ? 1 : -1);
      setMode(targetMode);
    }
  }, [pathname, mode]);

  // Password visibility states
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [showRegPw, setShowRegPw] = useState(false);
  const [showRegConfirmPw, setShowRegConfirmPw] = useState(false);

  // Field focus states
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Remember me checkbox
  const [rememberMe, setRememberMe] = useState(true);

  // Real auth engines
  const login = useLogin();
  const { setValue: setLoginValue } = login;
  const registerAuth = useRegister();

  // Watch register password for live strength calculation
  const regPassword = useWatch({
    control: registerAuth.control,
    name: "password",
    defaultValue: "",
  });

  // Auto-fill demo credentials if ?demo=... query param is present
  useEffect(() => {
    const demoParam = searchParams.get("demo");
    if (demoParam) {
      const demoUser = demoParam === "true" ? "adii" : demoParam;
      setLoginValue("username", demoUser);
      setLoginValue("password", "password123");
    }
  }, [searchParams, setLoginValue]);

  // Calculate live password strength
  const strength = useMemo(() => {
    const pw = regPassword || "";
    if (!pw) return { score: 0, label: "" };
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;

    const labels = ["", "Weak", "Fair", "Good", "Strong"];
    const classes = ["", "active-weak", "active-fair", "active-good", "active-strong"];

    return {
      score,
      label: labels[score] || "Weak",
      colorClass: classes[score] || "active-weak",
    };
  }, [regPassword]);

  // Smooth cinematic mode switch handler with explicit direction
  const handleSwitchMode = (target: "login" | "signup") => {
    if (target === mode) return;
    const newDir = target === "signup" ? 1 : -1;
    setDirection(newDir);
    setMode(target);
    const targetUrl = target === "signup" ? "/signup" : "/login";
    router.push(targetUrl, { scroll: false });
  };

  return (
    <div
      className={`oa-cinematic-root ${
        isSignup ? "oa-cinematic-root--signup" : "oa-cinematic-root--login"
      }`}
    >
      {/* ── Base Dark Backdrop ──────────────────────────────── */}
      <div className="oa-backdrop-dark" aria-hidden="true" />

      {/* ── Cream Backdrop with Smooth Cross-Fade in Both Directions ── */}
      <motion.div
        className="oa-backdrop-cream"
        aria-hidden="true"
        animate={{ opacity: isSignup ? 1 : 0 }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Subtle Grain Texture Overlay */}
      <div className="oa-cinematic-noise" aria-hidden="true" />

      {/* ── Planetary Background Stage with Symmetrical Motion in Both Directions ── */}
      <div className="oa-planetary-stage" aria-hidden="true">
        {/* Animated planetary sphere anchor with seamless transform interpolation */}
        <motion.div
          className="oa-planetary-sphere-anchor"
          animate={{
            y: isSignup ? -140 : 150,
            x: isSignup ? "-3vw" : "3vw",
            scale: isSignup ? 1.08 : 1,
            rotate: isSignup ? -10 : 0,
          }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Dark Amber Glow Sphere Shader */}
          <motion.div
            className="oa-sphere-layer oa-sphere-dark"
            animate={{ opacity: isSignup ? 0 : 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* Warm Cream Earth-Toned Sphere Shader */}
          <motion.div
            className="oa-sphere-layer oa-sphere-cream"
            animate={{ opacity: isSignup ? 1 : 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          />
        </motion.div>

        {/* Orbital curved SVG tracks */}
        <svg
          className="oa-orbit-rings-svg"
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
        >
          <ellipse
            cx="1120"
            cy="700"
            rx="540"
            ry="240"
            fill="none"
            className="oa-orbit-ring"
            strokeWidth="1.2"
            transform="rotate(-18 1120 700)"
          />
          <ellipse
            cx="1120"
            cy="700"
            rx="720"
            ry="340"
            fill="none"
            className="oa-orbit-ring"
            strokeWidth="1"
            transform="rotate(-18 1120 700)"
          />
          <ellipse
            cx="1120"
            cy="700"
            rx="920"
            ry="450"
            fill="none"
            className="oa-orbit-ring"
            strokeWidth="0.8"
            transform="rotate(-18 1120 700)"
          />
        </svg>
      </div>

      {/* Minimal Top Header */}
      <header className="oa-topbar">
        <Link href="/home" className="oa-topbar-brand">
          <span className="oa-topbar-logo">Onechat</span>
          <span className="oa-topbar-badge">Always Building</span>
        </Link>

        <nav className="oa-topbar-nav" aria-label="Quick Navigation">
          <Link href="/home" className="oa-topbar-link">
            ← Explore Portfolio (/home)
          </Link>
        </nav>
      </header>

      {/* Main Content Stage */}
      <main className="oa-main-stage">
        {/* ── Left Column: Editorial Headline & Narrative ──── */}
        <div className="oa-editorial-col">
          <AnimatePresence mode="wait" custom={direction}>
            {isSignup ? (
              <motion.div
                key="signup-editorial"
                custom={direction}
                variants={editorialVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <div className="oa-editorial-tag">01 / The Next Chapter</div>
                <h1 className="oa-editorial-h1">
                  Your next chapter
                  <br />
                  <span className="oa-amber-highlight">starts here.</span>
                </h1>
                <p className="oa-editorial-sub">
                  Create your account and be part of what&apos;s next. Direct, real-time
                  conversational intimacy built with intent.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="login-editorial"
                custom={direction}
                variants={editorialVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <div className="oa-editorial-tag">01 / Welcome Back</div>
                <h1 className="oa-editorial-h1">
                  Good to have
                  <br />
                  you <span className="oa-amber-highlight">back.</span>
                </h1>
                <p className="oa-editorial-sub">
                  Continue building, connecting and creating. Pick up your active channels right
                  where you left off.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Right Column: Translucent Form Container ──────── */}
        <div className="oa-form-card">
          <AnimatePresence mode="wait" custom={direction}>
            {/* SIGN IN FORM VIEW */}
            {!isSignup && (
              <motion.div
                key="form-login"
                custom={direction}
                variants={formCardVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                {/* Registration success confirmation */}
                {isRegisteredSuccess && (
                  <div className="oa-alert-success" role="status">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    <span>Account created successfully! Please sign in below.</span>
                  </div>
                )}

                {/* Root server error alert */}
                {login.errors.root && (
                  <div className="oa-alert-error" role="alert">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span>{login.errors.root.message}</span>
                  </div>
                )}

                <form
                  className="oa-form"
                  noValidate
                  onSubmit={login.handleSubmit(login.onSubmit)}
                >
                  {/* Field: Username or Email */}
                  <div className="oa-field-wrap">
                    <label className="oa-field-label" htmlFor={`${uid}-login-id`}>
                      Username or Email
                    </label>
                    <div
                      className={`oa-input-shell ${
                        focusedField === "login-id" ? "focused" : ""
                      } ${login.errors.username ? "error" : ""}`}
                    >
                      <span className="oa-input-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="2" y="4" width="20" height="16" rx="2" />
                          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                        </svg>
                      </span>
                      <input
                        id={`${uid}-login-id`}
                        type="text"
                        autoComplete="username"
                        placeholder="you@example.com or username"
                        className="oa-input"
                        {...login.register("username")}
                        onFocus={() => setFocusedField("login-id")}
                        onBlur={() => setFocusedField(null)}
                      />
                    </div>
                    {login.errors.username && (
                      <span className="oa-err-text" role="alert">
                        {login.errors.username.message}
                      </span>
                    )}
                  </div>

                  {/* Field: Password */}
                  <div className="oa-field-wrap">
                    <div className="oa-field-header">
                      <label className="oa-field-label" htmlFor={`${uid}-login-pw`}>
                        Password
                      </label>
                      <button
                        type="button"
                        className="oa-forgot-btn"
                        onClick={() =>
                          alert("Password reset is managed through your system administrator.")
                        }
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div
                      className={`oa-input-shell ${
                        focusedField === "login-pw" ? "focused" : ""
                      } ${login.errors.password ? "error" : ""}`}
                    >
                      <span className="oa-input-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      </span>
                      <input
                        id={`${uid}-login-pw`}
                        type={showLoginPw ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        className="oa-input"
                        {...login.register("password")}
                        onFocus={() => setFocusedField("login-pw")}
                        onBlur={() => setFocusedField(null)}
                      />
                      <button
                        type="button"
                        className="oa-eye-btn"
                        aria-label={showLoginPw ? "Hide password" : "Show password"}
                        onClick={() => setShowLoginPw(!showLoginPw)}
                      >
                        {showLoginPw ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {login.errors.password && (
                      <span className="oa-err-text" role="alert">
                        {login.errors.password.message}
                      </span>
                    )}
                  </div>

                  {/* Keep Signed In Checkbox */}
                  <div className="oa-checkbox-row">
                    <input
                      id={`${uid}-remember`}
                      type="checkbox"
                      className="oa-checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <label htmlFor={`${uid}-remember`} className="oa-checkbox-label">
                      Keep me signed in on this device
                    </label>
                  </div>

                  {/* Quick Test Credentials Box */}
                  <div className="my-3 p-2.5 rounded-xl bg-[#1C1C24] border border-[#2C2C36] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
                      <span className="text-[#A1A1AA]">
                        Demo: <strong className="text-white font-mono">adii</strong> / <span className="font-mono text-[#A1A1AA]">password123</span>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        login.setValue("username", "adii");
                        login.setValue("password", "password123");
                      }}
                      className="text-[11px] font-semibold text-[#A78BFA] hover:text-white px-2 py-1 rounded-md bg-[#6E53CC]/15 hover:bg-[#6E53CC]/30 transition-all active:scale-95 cursor-pointer"
                    >
                      Fill Demo
                    </button>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="oa-submit-btn"
                    disabled={login.isSubmitting}
                  >
                    {login.isSubmitting ? (
                      <>
                        <span className="oa-spinner" />
                        <span>Signing In…</span>
                      </>
                    ) : (
                      "Log In →"
                    )}
                  </button>
                </form>

                {/* Footer Switcher */}
                <p className="oa-switch-footer">
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    className="oa-switch-link-btn"
                    onClick={() => handleSwitchMode("signup")}
                  >
                    Sign up
                  </button>
                </p>
              </motion.div>
            )}

            {/* SIGN UP FORM VIEW */}
            {isSignup && (
              <motion.div
                key="form-signup"
                custom={direction}
                variants={formCardVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <>
                    {/* Root server error alert */}
                    {registerAuth.errors.root && (
                      <div className="oa-alert-error" role="alert">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <span>{registerAuth.errors.root.message}</span>
                      </div>
                    )}

                    <form
                      className="oa-form"
                      noValidate
                      onSubmit={registerAuth.handleSubmit(registerAuth.onSubmit)}
                    >
                      {/* Field: Username */}
                      <div className="oa-field-wrap">
                        <label className="oa-field-label" htmlFor={`${uid}-reg-username`}>
                          Username
                        </label>
                        <div
                          className={`oa-input-shell ${
                            focusedField === "reg-username" ? "focused" : ""
                          } ${registerAuth.errors.username ? "error" : ""}`}
                        >
                          <span className="oa-input-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                          </span>
                          <input
                            id={`${uid}-reg-username`}
                            type="text"
                            autoComplete="username"
                            placeholder="choose_a_handle"
                            className="oa-input"
                            {...registerAuth.register("username")}
                            onFocus={() => setFocusedField("reg-username")}
                            onBlur={() => setFocusedField(null)}
                          />
                        </div>
                        {registerAuth.errors.username ? (
                          <span className="oa-err-text" role="alert">
                            {registerAuth.errors.username.message}
                          </span>
                        ) : (
                          <UsernameStatus
                            isChecking={registerAuth.isChecking}
                            isAvailable={registerAuth.isAvailable}
                          />
                        )}
                      </div>

                      {/* Field: Email */}
                      <div className="oa-field-wrap">
                        <label className="oa-field-label" htmlFor={`${uid}-reg-email`}>
                          Email Address
                        </label>
                        <div
                          className={`oa-input-shell ${
                            focusedField === "reg-email" ? "focused" : ""
                          } ${registerAuth.errors.email ? "error" : ""}`}
                        >
                          <span className="oa-input-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="2" y="4" width="20" height="16" rx="2" />
                              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                            </svg>
                          </span>
                          <input
                            id={`${uid}-reg-email`}
                            type="email"
                            autoComplete="email"
                            inputMode="email"
                            placeholder="you@example.com"
                            className="oa-input"
                            {...registerAuth.register("email")}
                            onFocus={() => setFocusedField("reg-email")}
                            onBlur={() => setFocusedField(null)}
                          />
                        </div>
                        {registerAuth.errors.email && (
                          <span className="oa-err-text" role="alert">
                            {registerAuth.errors.email.message}
                          </span>
                        )}
                      </div>

                      {/* Field: Password */}
                      <div className="oa-field-wrap">
                        <label className="oa-field-label" htmlFor={`${uid}-reg-pw`}>
                          Password
                        </label>
                        <div
                          className={`oa-input-shell ${
                            focusedField === "reg-pw" ? "focused" : ""
                          } ${registerAuth.errors.password ? "error" : ""}`}
                        >
                          <span className="oa-input-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                          </span>
                          <input
                            id={`${uid}-reg-pw`}
                            type={showRegPw ? "text" : "password"}
                            autoComplete="new-password"
                            placeholder="At least 8 characters"
                            className="oa-input"
                            {...registerAuth.register("password")}
                            onFocus={() => setFocusedField("reg-pw")}
                            onBlur={() => setFocusedField(null)}
                          />
                          <button
                            type="button"
                            className="oa-eye-btn"
                            aria-label={showRegPw ? "Hide password" : "Show password"}
                            onClick={() => setShowRegPw(!showRegPw)}
                          >
                            {showRegPw ? (
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                <line x1="1" y1="1" x2="23" y2="23" />
                              </svg>
                            ) : (
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            )}
                          </button>
                        </div>

                        {/* Live Strength Meter */}
                        {regPassword && regPassword.length > 0 && (
                          <div className="zen-strength">
                            <div className={`zen-strength-bar ${strength.score >= 1 ? strength.colorClass : ""}`} />
                            <div className={`zen-strength-bar ${strength.score >= 2 ? strength.colorClass : ""}`} />
                            <div className={`zen-strength-bar ${strength.score >= 3 ? strength.colorClass : ""}`} />
                            <div className={`zen-strength-bar ${strength.score >= 4 ? strength.colorClass : ""}`} />
                            <span className="zen-strength-label">{strength.label}</span>
                          </div>
                        )}

                        {registerAuth.errors.password && (
                          <span className="oa-err-text" role="alert">
                            {registerAuth.errors.password.message}
                          </span>
                        )}
                      </div>

                      {/* Field: Confirm Password */}
                      <div className="oa-field-wrap">
                        <label className="oa-field-label" htmlFor={`${uid}-reg-confirm-pw`}>
                          Confirm Password
                        </label>
                        <div
                          className={`oa-input-shell ${
                            focusedField === "reg-confirm-pw" ? "focused" : ""
                          } ${registerAuth.errors.confirmPassword ? "error" : ""}`}
                        >
                          <span className="oa-input-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                          </span>
                          <input
                            id={`${uid}-reg-confirm-pw`}
                            type={showRegConfirmPw ? "text" : "password"}
                            autoComplete="new-password"
                            placeholder="Repeat your password"
                            className="oa-input"
                            {...registerAuth.register("confirmPassword")}
                            onFocus={() => setFocusedField("reg-confirm-pw")}
                            onBlur={() => setFocusedField(null)}
                          />
                          <button
                            type="button"
                            className="oa-eye-btn"
                            aria-label={showRegConfirmPw ? "Hide password" : "Show password"}
                            onClick={() => setShowRegConfirmPw(!showRegConfirmPw)}
                          >
                            {showRegConfirmPw ? (
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                <line x1="1" y1="1" x2="23" y2="23" />
                              </svg>
                            ) : (
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            )}
                          </button>
                        </div>
                        {registerAuth.errors.confirmPassword && (
                          <span className="oa-err-text" role="alert">
                            {registerAuth.errors.confirmPassword.message}
                          </span>
                        )}
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        className="oa-submit-btn"
                        disabled={registerAuth.isSubmitting}
                      >
                        {registerAuth.isSubmitting ? (
                          <>
                            <span className="oa-spinner" />
                            <span>Creating Account…</span>
                          </>
                        ) : (
                          "Create Account →"
                        )}
                      </button>
                    </form>

                    {/* Footer Switcher */}
                    <p className="oa-switch-footer">
                      Already have an account?{" "}
                      <button
                        type="button"
                        className="oa-switch-link-btn"
                        onClick={() => handleSwitchMode("login")}
                      >
                        Log in
                      </button>
                    </p>
                </>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Minimal Bottom Footer */}
      <footer className="oa-footer-bar">
        <div>© 2026 ONECHAT · ALL RIGHTS RESERVED</div>
        <div>DESIGNED WITH INTENT · ENGINEERED FOR RESILIENCE</div>
      </footer>
    </div>
  );
}

export default function OnechatAuthExperience({ initialMode = "login" }: Props) {
  return (
    <GuestGuard>
      <Suspense
        fallback={
          <div className="oa-cinematic-root oa-cinematic-root--login" style={{ display: "grid", placeItems: "center" }}>
            <span className="oa-spinner" />
          </div>
        }
      >
        <AuthExperienceInner initialMode={initialMode} />
      </Suspense>
    </GuestGuard>
  );
}
