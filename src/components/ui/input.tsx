"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "dark" | "retro";
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant = "dark", error, ...props }, ref) => {
    const variants = {
      dark: `
        bg-[#111113]
        text-white
        border-[#1a1a40]
        focus:ring-[#C89BB5]
      `,
      retro: `
        bg-[#FAF9F6]
        text-[#1a1a40]
        border-[#1a1a40]
        focus:ring-[#1a1a40]
      `,
    };

    return (
      <input
        ref={ref}
        className={cn(
          `
          w-full
          border-2
          rounded-lg
          px-4 py-3
          transition
          focus:outline-none
          focus:ring-2
          disabled:opacity-50
        `,
          variants[variant],
          error && "border-red-500 focus:ring-red-500",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
