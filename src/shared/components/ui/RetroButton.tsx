"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type RetroButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit" | "reset";
  variant?: "type1" | "type2";
};

export default function RetroButton({
  children,
  onClick,
  className = "",
  type = "button",
  variant = "type1",
}: RetroButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(
        "uppercase tracking-widest transition-all duration-150",
        variant === "type1" && "btn-retro px-3 py-3 font-bold rounded-[15px]",
        variant === "type2" && "btn-type2 px-10 py-3",
        className,
      )}
    >
      {children}
    </button>
  );
}
