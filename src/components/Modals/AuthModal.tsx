"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface AuthModalProps {
  title: string;
  children: ReactNode;
  header?: ReactNode;
  subtitle?: ReactNode;
  className?: string;
  variant?: "retro" | "dark" | "hacker";
  size?: "sm" | "md" | "lg";
}

export default function AuthModal({
  title,
  children,
  header,
  subtitle,
  className = "",
  variant = "retro",
  size = "md",
}: AuthModalProps) {
  const sizes = { sm: "max-w-md", md: "max-w-xl", lg: "max-w-4xl" };

  const variants = {
    // your old ones kept
    retro: `bg-[#FAF9F6] border-2 border-[#1a1a40] rounded-2xl p-8 text-black shadow-[6px_6px_0px_0px_#1a1a40] space-y-6`,
    dark:  `bg-[#241e1e] rounded-xl text-white p-10 shadow-xl space-y-6`,
    // new one matching home page
    hacker: `
      bg-[rgba(15,15,18,0.92)]
      border border-[rgba(200,155,181,0.25)]
      p-10 text-white space-y-6
      relative
    `,
  };

  return (
    <div className="w-full min-h-screen flex relative items-center justify-center px-6">
      <motion.div
        key={title}
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.98 }}
        transition={{ duration: 0.35 }}
        className={`w-full ${sizes[size]} ${variants[variant]} ${className}`}
      >

        {/* ── Scan line animation ── */}
        {variant === "hacker" && (
          <motion.div
            className="absolute left-0 right-0 h-[2px] pointer-events-none"
            style={{
              background: "linear-gradient(90deg,transparent,#C89BB5,transparent)",
            }}
            animate={{ top: ["0%", "100%"], opacity: [0, 0.7, 0.4, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
        )}

        {/* ── Corner brackets ── */}
        {variant === "hacker" && (
          <>
            <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#C89BB5]" />
            <span className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#C89BB5]" />
            <span className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#C89BB5]" />
            <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#C89BB5]" />
          </>
        )}

        {/* ── Header ── */}
        {header ? (
          <div className="mb-6">{header}</div>
        ) : (
          (title || subtitle) && (
            <div className="text-center mb-6 space-y-2">

              {variant === "hacker" && (
                <p className="text-[9px] tracking-[0.4em] uppercase text-[#00E5FF]">
                  Secure Access · ONECHAT
                </p>
              )}

              {title && (
                <h1
                  className={`text-3xl font-black uppercase tracking-widest leading-none ${
                    variant === "hacker"
                      ? "text-[#C89BB5] [text-shadow:0_0_40px_rgba(200,155,181,0.3)]"
                      : variant === "retro"
                      ? "text-[#1a1a40]"
                      : "text-white/90"
                  }`}
                >
                  {title}
                </h1>
              )}

              {subtitle && (
                <p
                  className={`text-xs tracking-[0.15em] ${
                    variant === "hacker"
                      ? "text-white/30"
                      : variant === "retro"
                      ? "text-[#1a1a40]/70"
                      : "text-white/50"
                  }`}
                >
                  {subtitle}
                </p>
              )}

              {/* Divider */}
              {variant === "hacker" && (
                <div className="w-full h-px bg-gradient-to-r from-transparent via-[rgba(200,155,181,0.35)] to-transparent mt-4" />
              )}
            </div>
          )
        )}

        {children}
      </motion.div>
    </div>
  );
}