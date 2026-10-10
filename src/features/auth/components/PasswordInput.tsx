"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Input } from "@/src/shared/components/ui/input";

interface Props {
  label: string;
  register: any;
  name: string;
  error?: string;
  placeholder?: string;
  autoComplete?: string;
  className?: string;
}

export function PasswordInput({
  label,
  register,
  name,
  error,
  placeholder = "Enter your password",
  autoComplete = "current-password",
  className,
}: Props) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={name}
        className="block font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-text-secondary"
      >
        {label}
      </label>

      <div
        className={cn(
          "relative transition-all duration-200",
          error && "animate-[shake_0.25s_ease-in-out]"
        )}
      >
        <Input
          id={name}
          name={name}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          className={cn(
            "h-12 pr-12 rounded-xl border bg-surface-elevated/40 text-foreground placeholder:text-text-muted transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
            error
              ? "border-error focus:border-error focus:ring-2 focus:ring-error/20"
              : "border-border focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/20",
            className
          )}
          {...register(name)}
        />

        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center text-text-muted hover:text-foreground transition-colors duration-150"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff size={16} strokeWidth={2} /> : <Eye size={16} strokeWidth={2} />}
        </button>
      </div>

      {error && (
        <p className="px-1 text-xs text-error font-medium" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
