"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface AuthModalProps {
  title: string;
  children: ReactNode;
  header?: ReactNode;
  subtitle?: ReactNode;
  className?: string;
  variant?: "retro" | "dark";
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
  const base = "w-full space-y-6";
  const sizes = {
    sm: "max-w-md",
    md: "max-w-xl",
    lg: "max-w-4xl",
  };

  const variants = {
    retro: `
       w-full max-w-xl
        bg-[#FAF9F6]
        border-2 border-[#1a1a40]
        rounded-2xl relative z-10
        p-8
        text-black
        shadow-[6px_6px_0px_0px_#1a1a40]
        space-y-6
    `,
    dark: `
      max-w-xl
      bg-[#241e1e]
      rounded-xl 
      text-white
      p-10
      shadow-xl
    `,
  };
  return (
    <div
      className={`
        w-3xl min-h-screen
        flex
        relative
        items-center
        justify-center
        px-6
      `}
    >
      <motion.div
        key={title} // important for route change animation
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.98 }}
        transition={{ duration: 0.3 }}
        className={`w-full ${sizes[size]} ${variants[variant]} ${className}`}
      >
        {/* Custom Header Override */}
        {header ? (
          <div className="mb-6">{header}</div>
        ) : (
          (title || subtitle) && (
            <div className="text-center mb-6">
              {title && (
                <h1
                  className={`text-3xl  font-semibold ${
                    variant === "retro"
                      ? "text-[#1a1a40] uppercase tracking-wide font-bold"
                      : "text-white/90"
                  }`}
                >
                  {title}
                </h1>
              )}

              {subtitle && (
                <p
                  className={`mt-2 text-sm ${
                    variant === "retro" ? "text-[#1a1a40]/70" : "text-white/50"
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
