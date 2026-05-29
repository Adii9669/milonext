"use client";

import { useState } from "react";

import { Eye, EyeOff } from "lucide-react";

import { Input } from "@/src/shared/components/ui/input";

import { cn } from "@/src/lib/utils";

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
    <div className="space-y-2">
      <label
        htmlFor={name}
        className="
                    text-xl mb-2
                    font-medium
                    text-foreground
                "
      >
        {label}
      </label>

      <div
        className={cn(
          `
                    relative
              
                    transition-all
                    duration-200         
                `,
          error &&
            `
                    animate-[shake_0.25s_ease-in-out]
                    `,
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
            `
                        h-12
                    
                        
                        pr-16
                        bg-surface
                        text-foreground border border-border
                        placeholder:text-text-muted
                        transition-all
                        duration-200        
                        disabled:opacity-50
                        disabled:cursor-not-allowed
                        rounded-xl
                        focus:ring-0
                        focus:ring-ring focus:ring-offset-1

                        `,

            error
              ? `
                            border-error
                            focus-visible:border-error
                        `
              : `
                           
                        `,

            className,
          )}
          {...register(name)}
        />

        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShowPassword((prev) => !prev)}
          className="
                        absolute

                        right-4
                        top-1/2
                        -translate-y-1/2

                        flex
                        items-center
                        justify-center

                        text-text-muted
                        hover:text-foreground

                        transition-colors
                        duration-200
                    "
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff size={18} strokeWidth={2} />
          ) : (
            <Eye size={18} strokeWidth={2} />
          )}
        </button>
      </div>

      {error && (
        <p
          className="
                        text-sm
                        text-error/90
                        px-1
                    "
        >
          {error}
        </p>
      )}
    </div>
  );
}
