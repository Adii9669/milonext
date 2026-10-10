"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { Input } from "@/src/shared/components/ui/input";
import { GuestGuard } from "../gaurds/GeustGaurd";
import { useRegister } from "../hooks/useRegister";
import { AuthPageLayout } from "./AuthPageLayout";
import { PasswordInput } from "./PasswordInput";
import { UsernameStatus } from "./UsernameStatus";

export function CleanRegisterForm() {
  const { register, handleSubmit, errors, isSubmitting, onSubmit, isChecking, isAvailable } =
    useRegister();

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
              Get started
            </p>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-foreground leading-[1.05]">
              Create account.
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              Join Onechat and start connecting with your circle.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Username */}
            <div className="space-y-1.5">
              <label
                htmlFor="username"
                className="block font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-text-secondary"
              >
                Username
              </label>
              <Input
                id="username"
                autoComplete="username"
                error={Boolean(errors.username)}
                placeholder="choose_a_handle"
                className="h-12 rounded-xl border border-border bg-surface-elevated/40 px-4 text-foreground placeholder:text-text-muted focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                {...register("username")}
              />
              {errors.username ? (
                <p className="px-1 text-xs text-error font-medium" role="alert">
                  {errors.username.message}
                </p>
              ) : (
                <UsernameStatus isChecking={isChecking} isAvailable={isAvailable} />
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-text-secondary"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                error={Boolean(errors.email)}
                placeholder="you@example.com"
                className="h-12 rounded-xl border border-border bg-surface-elevated/40 px-4 text-foreground placeholder:text-text-muted focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                {...register("email")}
              />
              {errors.email && (
                <p className="px-1 text-xs text-error font-medium" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password pair */}
            <PasswordInput
              label="Password"
              register={register}
              name="password"
              error={errors.password?.message}
            />
            <PasswordInput
              label="Confirm password"
              register={register}
              name="confirmPassword"
              error={errors.confirmPassword?.message}
            />

            {/* Root / server error */}
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

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full h-12 rounded-full bg-foreground text-background font-mono text-xs font-bold uppercase tracking-[0.12em] hover:opacity-90 active:scale-[0.98] transition-all duration-150 shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin size-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account…
                </span>
              ) : (
                <>
                  Create account <ArrowRight className="size-3.5" />
                </>
              )}
            </button>

            {/* Terms note */}
            <p className="text-center text-xs text-text-muted leading-relaxed pt-1">
              By creating an account you agree to our{" "}
              <span className="underline underline-offset-2 cursor-pointer hover:text-foreground transition-colors">
                Terms
              </span>{" "}
              &amp;{" "}
              <span className="underline underline-offset-2 cursor-pointer hover:text-foreground transition-colors">
                Privacy Policy
              </span>
              .
            </p>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="font-mono text-[10px] text-text-muted font-bold tracking-widest uppercase">
              or
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Sign in link */}
          <p className="text-center text-sm text-text-secondary">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-bold text-foreground hover:text-accent-brand underline underline-offset-4 transition-colors duration-150"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </AuthPageLayout>
    </GuestGuard>
  );
}
