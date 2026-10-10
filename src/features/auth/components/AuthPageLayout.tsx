"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { LOGO } from "@/src/shared/components/logo";
import ThemeToggle from "@/src/shared/components/ToggleTheme";

interface AuthPageLayoutProps {
  children: ReactNode;
  /**  Optional panel shown on the decorative left/right side */
  side?: ReactNode;
  /** Which side the form sits on — default "right" keeps the deco on left */
  formSide?: "left" | "right";
}

export function AuthPageLayout({
  children,
  side,
  formSide = "right",
}: AuthPageLayoutProps) {
  const formOnRight = formSide === "right";

  return (
    <main className="relative font-chillax min-h-[100dvh] flex flex-col lg:flex-row bg-background text-foreground transition-colors duration-200">
      {/* ── Theme toggle top-right ────────────────────────────────── */}
      <div className="absolute right-5 top-5 z-50 sm:right-8 sm:top-7">
        <ThemeToggle />
      </div>

      {/* ── Decorative panel — themed for both Dark and Light ───────── */}
      <div
        className={`relative hidden lg:flex lg:w-[46%] xl:w-[43%] flex-col justify-between p-12 overflow-hidden border-border bg-gradient-to-br from-surface via-surface-elevated/40 to-background text-foreground ${
          formOnRight ? "order-first border-r" : "order-last border-l"
        }`}
      >
        {/* Radial dot grid matching home page orbit grid */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.12] dark:opacity-[0.08]"
          style={{
            backgroundImage: "radial-gradient(var(--text-muted) 0.9px, transparent 0.9px)",
            backgroundSize: "24px 24px",
            maskImage: "linear-gradient(to bottom, black 65%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 65%, transparent 100%)",
          }}
        />

        {/* Ambient theme glow blurs */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-primary/15 blur-3xl dark:bg-primary/20"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -left-24 size-80 rounded-full bg-accent-brand/10 blur-3xl dark:bg-accent-brand/15"
        />

        {/* Logo */}
        <div className="relative z-10">
          <LOGO
            href="/"
            text="ONECHAT"
            className="w-fit"
            textClassName="text-xl sm:text-2xl font-black tracking-[0.2em]"
            iconClassName="size-7 sm:size-8"
          />
        </div>

        {/* Main decorative copy */}
        <div className="relative z-10 space-y-7">
          {side ?? (
            <>
              {/* Badge pill */}
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-accent-brand shadow-sm">
                <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                Real-time messaging
              </div>

              {/* Hero copy */}
              <h2 className="text-4xl sm:text-5xl xl:text-6xl font-black uppercase leading-[1.02] tracking-tight text-foreground">
                Connect.<br />
                Chat.<br />
                <span className="text-accent-brand">Belong.</span>
              </h2>

              <p className="text-sm sm:text-base max-w-sm leading-relaxed text-text-secondary">
                Instant conversations with the people who matter. No noise — just
                clear, fast, and secure communication.
              </p>

              {/* Miniature interactive preview card matching home page */}
              <div className="rounded-2xl border border-border bg-surface p-4 shadow-[var(--shadow-soft)] max-w-sm">
                <div className="mb-3 flex items-center justify-between font-mono text-[10px] text-text-muted">
                  <span className="inline-flex items-center gap-1.5 font-bold text-accent-brand">
                    <span className="size-1.5 rounded-full bg-success" />
                    The usual crew
                  </span>
                  <span>4 members</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="grid size-6 place-items-center rounded-full bg-primary/20 font-bold text-[10px] text-primary shrink-0">
                      M
                    </span>
                    <div className="rounded-2xl rounded-tl-sm bg-surface-elevated px-3 py-1.5 text-xs text-foreground">
                      I found a tiny café with the best cake 🍰
                    </div>
                  </div>
                  <div className="flex items-start justify-end gap-2">
                    <div className="rounded-2xl rounded-tr-sm bg-message-sent px-3 py-1.5 text-xs font-semibold text-white">
                      See you Saturday! ✨
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Feature badge row */}
        <div className="relative z-10 flex flex-wrap gap-2.5">
          {["Privacy first", "No phone numbers", "Open source"].map((label) => (
            <span
              key={label}
              className="rounded-full border border-border bg-surface px-3 py-1.5 text-[11px] font-semibold text-text-secondary shadow-sm"
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Mobile header bar ─────────────────────────────────────── */}
      <div className="lg:hidden flex items-center justify-between px-5 pt-5 pb-2">
        <LOGO
          href="/"
          text="ONECHAT"
          textClassName="text-lg font-black tracking-[0.2em]"
          iconClassName="size-6"
        />
      </div>

      {/* ── Form panel — follows active theme flawlessly ──────────── */}
      <div
        className={`flex-1 flex items-center justify-center px-4 py-10 sm:px-8 sm:py-14
          ${formOnRight ? "order-last" : "order-first"}`}
      >
        <div className="w-full max-w-md">{children}</div>
      </div>
    </main>
  );
}
