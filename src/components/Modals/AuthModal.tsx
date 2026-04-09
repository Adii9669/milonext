"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface AuthModalProps {
  title: string;
  children: ReactNode;
  header?: ReactNode;
  subtitle?: ReactNode;
  className?: string;
  variant?: "retro" | "dark" ;
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
    retro: `
    bg-[#FAF9F6] border-2 border-[#1a1a40] 
    rounded-2xl p-8 text-black 
    shadow-[6px_6px_0px_0px_#1a1a40] space-y-6`,
    
    dark:  `bg-[#241e1e] rounded-xl text-white p-10 shadow-xl space-y-6`,
    // new one matching home page
   
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
          <div className="mb-6">{header}</div>
        ) : (
          (title || subtitle) && (
            <div className="text-center mb-6 space-y-2">

             

              {title && (
                <h1
                  className={`text-2xl font-black uppercase tracking-widest leading-none ${
                    variant === "retro"
                      ? "text-[#11050c] [text-shadow:0_0_40px_rgba(200,155,181,0.3)]"
                      : variant === "dark"
                      ? "text-[#F8F8FF] [text-shadow:0_0_20px_rgba(248,248,255,0.5)]"
                      : "text-white"
                  }`}
                >
                  {title}
                </h1>
              )}

              {subtitle && (
                <p
                  className={`text-xs tracking-[0.15em] ${
                    variant === "retro"
                      ? "text-white/30"
                      : variant === "dark"
                      ? "text-[#1a1a40]/70"
                      : "text-white/50"
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