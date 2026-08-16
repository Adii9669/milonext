"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface SingINProps {
  title: string;
  children: ReactNode;
  header?: ReactNode;
  subtitle?: ReactNode;
  className?: string;
  variant?: "retro" | "dark" | "plane";
  size?: "sm" | "md" | "lg";
}

export default function SIGNIN({
  title,
  children,
  header,
  subtitle,
  className = "",
  variant = "plane",
  size = "md",
}: SingINProps) {
  const sizes = {
    sm: "max-w-md",
    md: "max-w-xl ",
    lg: "max-w-4xl",
  };

  const variants = {
    retro: `
    bg-surface border-2 border-foreground
    rounded-2xl p-8 text-foreground
    shadow-[6px_6px_0px_0px_var(--foreground)] space-y-6`,
    plane: "h-150 text-foreground rounded-2xl p-8 shadow-lg space-y-6 bg-surface/80",

    dark: "bg-surface rounded-xl text-foreground p-10 shadow-xl space-y-6",
  };

  return (
    <div className="w-full min-h-screen flex relative items-center justify-center px-6">
      

      <motion.div
        key={title}
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 1, scale: 1 }}
        exit={{ opacity: 1, y: 10, scale: 0.98 }}
        transition={{ duration: 0.35 }}
        className={`w-full ${sizes[size]} ${variants[variant]} ${className}`}
      >
        {/* ── Header ── */}
        {header ? (
          <div className="mb-9">{header}</div>
        ) : (
          (title || subtitle) && (
            <div className="text-center mb-8 space-y-6">
              {title && (
                <h1
                  className={`text-5xl font-black uppercase tracking-widest leading-none text-foreground ${
                    variant === "retro"
                      ? "[text-shadow:0_0_40px_var(--accent-glow)]"
                      : variant === "dark"
                        ? "[text-shadow:0_0_20px_var(--shadow-glow)]"
                        : ""
                  }`}
                >
                  {title}
                </h1>
              )}

              {subtitle && (
                <p
                  className={`text-sm tracking-[0.20em] ${
                    variant === "retro"
                      ? "text-foreground/50"
                      : variant === "dark"
                        ? "text-foreground/50"
                        : variant === "plane"
                          ? "text-foreground/80 "
                          : "text-foreground/50"
                  }`}
                >
                  {subtitle}
                </p>
              )}
            </div>
          )
        )}

        {children}
      </motion.div>
    </div>
  );
}
