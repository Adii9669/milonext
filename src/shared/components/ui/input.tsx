"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "default" | "chat" | "soft" | "retro";
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant = "default", error, ...props }, ref) => {
    const variants = {
      default: `
         bg-surface text-foreground
        rounded-xl
        focus:ring-0 focus:ring-ring focus:ring-offset-1
        disabled:cursor-not-allowed disabled:opacity-20
      `,
      chat: `  
        bg-background/80 backdrop-blur
        rounded-sm w-full
        focus:ring-0 focus:ring-ring focus:ring-offset-1
      `,
      soft: `
        border border-border/50
        bg-background/60
        rounded-xl
      `,
      retro: `
        border border-foreground
        bg-surface text-foreground
        rounded-none
        shadow-[4px_4px_0px_0px_var(--foreground)]
        placeholder:text-text-muted
        focus:ring-0 focus:outline-none
        focus:shadow-[2px_2px_0px_0px_var(--foreground)]
        focus:translate-y-[2px] focus:translate-x-[2px]
        transition-all duration-100
        disabled:cursor-not-allowed disabled:opacity-50
      `,
    };

    return (
      <input
        ref={ref}
        className={cn(
          `
            w-full
            px-4 py-3
            text-foreground
            placeholder:text-foreground/50
            transition-all duration-200
            focus:outline-none
            focus:ring-2 focus:ring-ring
            disabled:opacity-50
          `,
          variants[variant],
          error && variant === "retro"
            ? "border-error shadow-[4px_4px_0px_0px_var(--error)]"
            : error && "border-error focus:ring-error",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
