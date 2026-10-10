"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { LOGO } from "../logo";
import ThemeToggle from "../ToggleTheme";

const links = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Privacy", href: "#privacy" },
  { label: "Roadmap", href: "#up-next" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="home-navbar fixed inset-x-0 top-0 z-50 px-5 pt-4 sm:px-8 sm:pt-5">
      <nav
        aria-label="Main navigation"
        className={`
          mx-auto grid max-w-[1400px] grid-cols-[1fr_auto_1fr] items-center gap-3
          rounded-2xl px-4 py-2.5 sm:px-6 sm:py-3
          transition-all duration-300
          ${scrolled
            ? "bg-surface/85 border border-border backdrop-blur-xl shadow-[var(--shadow-soft)]"
            : "bg-transparent border border-transparent"
          }
        `}
      >
        {/* ── Logo ──────────────────────────────────────────── */}
        <LOGO
          href="/"
          className="home-nav-logo justify-self-start"
          textClassName="text-sm sm:text-base"
          iconClassName="size-5 sm:size-6"
        />

        {/* ── Center nav links ─────────────────────────────── */}
        <div className="home-nav-links hidden items-center justify-center gap-1 md:flex lg:gap-1">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="home-nav-link"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* ── Right actions ─────────────────────────────────── */}
        <div className="flex items-center justify-self-end gap-2 sm:gap-3">
          <ThemeToggle />

          <Link className="home-nav-signin hidden sm:inline-flex" href="/auth/login">
            Sign in
          </Link>

          <Link className="home-nav-cta" href="/auth/register">
            <span className="hidden sm:inline">Create account</span>
            <span className="sm:hidden">Sign up</span>
          </Link>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="home-nav-menu-button md:hidden"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </nav>

      {/* ── Mobile menu ─────────────────────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="home-nav-mobile-panel md:hidden"
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {links.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
                {link.label}
              </a>
            ))}

            <div className="home-nav-mobile-divider" />

            <Link
              href="/auth/login"
              className="home-nav-mobile-action"
              onClick={() => setMenuOpen(false)}
            >
              Sign in
            </Link>
            <Link
              href="/auth/register"
              className="home-nav-mobile-action home-nav-mobile-action--primary"
              onClick={() => setMenuOpen(false)}
            >
              Create account
            </Link>

            <div className="home-nav-mobile-theme">
              <span>Appearance</span>
              <ThemeToggle />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
