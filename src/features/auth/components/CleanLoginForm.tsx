"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { Input } from "@/src/shared/components/ui/input";
import { GuestGuard } from "../gaurds/GeustGaurd";
import { useLogin } from "../hooks/useLogin";
import { AuthPageLayout } from "./AuthPageLayout";
import { PasswordInput } from "./PasswordInput";

export function CleanLoginForm() {
  const { register, handleSubmit, errors, isSubmitting, onSubmit } = useLogin();

  return (
    <GuestGuard>
      <AuthPageLayout>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="space-y-7 rounded-[2rem] border border-border bg-surface p-7 sm:p-10 shadow-[var(--shadow-soft)]"
        >
          {/* Header */}
          <div className="space-y-2">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-accent-brand">
              Welcome back
            </p>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-foreground leading-[1.05]">
              Sign in.
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              Continue your conversations with your people.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Username / Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="username"
                className="block font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-text-secondary"
              >
                Email or username
              </label>
              <Input
                id="username"
                autoComplete="username"
                error={Boolean(errors.username)}
                placeholder="you@example.com"
                className="h-12 rounded-xl border border-border bg-surface-elevated/40 px-4 text-foreground placeholder:text-text-muted focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                {...register("username")}
              />
              {errors.username && (
                <p className="px-1 text-xs text-error font-medium" role="alert">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Password */}
            <PasswordInput
              label="Password"
              name="password"
              register={register}
              error={errors.password?.message}
            />

            {/* Root error */}
            {errors.root && (
              <motion.p
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-xl bg-error/10 border border-error/20 px-4 py-3 text-sm text-error font-medium"
                role="alert"
              >
                {errors.root.message}
              </motion.p>
            )}

            {/* Submit button — matches home page CTA button styling */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-full bg-foreground text-background font-mono text-xs font-bold uppercase tracking-[0.12em] hover:opacity-90 active:scale-[0.98] transition-all duration-150 shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin size-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in…
                </span>
              ) : (
                <>
                  Sign in <ArrowRight className="size-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="font-mono text-[10px] text-text-muted font-bold tracking-widest uppercase">
              or
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Sign up link */}
          <p className="text-center text-sm text-text-secondary">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/register"
              className="font-bold text-foreground hover:text-accent-brand underline underline-offset-4 transition-colors duration-150"
            >
              Create one
            </Link>
          </p>
        </motion.div>
      </AuthPageLayout>
    </GuestGuard>
  );
}
