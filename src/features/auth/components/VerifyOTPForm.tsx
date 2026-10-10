"use client";

import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Mail } from "lucide-react";

import { useVerifyOTP } from "../hooks/useVerifyOTP";
import { OTPInput } from "./OtpInput";
import { AuthPageLayout } from "./AuthPageLayout";

export function VerifyOTPForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  if (!email) {
    return (
      <AuthPageLayout>
        <div className="rounded-[2rem] border border-border bg-surface p-8 text-center shadow-[var(--shadow-soft)]">
          <p className="text-sm font-semibold text-error">Invalid or missing email address.</p>
        </div>
      </AuthPageLayout>
    );
  }

  const {
    otp,
    setOtp,
    error,
    isLoading,
    resendCooldown,
    inputRefs,
    handleResend,
    handleSubmit,
  } = useVerifyOTP(email);

  const isFilled = otp.every((d) => d !== "");

  return (
    <AuthPageLayout
      side={
        <div className="space-y-6">
          <div className="size-14 rounded-2xl bg-surface border border-border flex items-center justify-center shadow-sm">
            <Mail className="size-6 text-accent-brand" />
          </div>
          <h2 className="text-4xl sm:text-5xl xl:text-6xl font-black uppercase leading-[1.02] tracking-tight text-foreground">
            Check<br />your<br />
            <span className="text-accent-brand">inbox.</span>
          </h2>
          <p className="text-text-secondary text-sm sm:text-base max-w-sm leading-relaxed">
            We sent a 6-digit code to your email. It expires in 10 minutes.
          </p>
        </div>
      }
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="space-y-7 rounded-[2rem] border border-border bg-surface p-7 sm:p-10 shadow-[var(--shadow-soft)]"
      >
        {/* Header */}
        <div className="space-y-2">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-accent-brand">
            Verification
          </p>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-foreground leading-[1.05]">
            Verify email.
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary tracking-wide">
            Enter the 6-digit code sent to{" "}
            <span className="font-semibold text-foreground">{email}</span>
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-6"
        >
          {/* OTP boxes */}
          <OTPInput
            otp={otp}
            setOtp={setOtp}
            inputRefs={inputRefs}
            error={!!error}
          />

          {/* Error */}
          {error && (
            <motion.p
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center rounded-xl bg-error/10 border border-error/20 px-4 py-3 text-xs sm:text-sm text-error font-medium"
              role="alert"
            >
              {error}
            </motion.p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading || !isFilled}
            className="w-full h-12 rounded-full bg-foreground text-background font-mono text-xs font-bold uppercase tracking-[0.12em] hover:opacity-90 active:scale-[0.98] transition-all duration-150 shadow-md disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin size-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Verifying…
              </>
            ) : (
              <>
                Verify <ArrowRight className="size-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Resend */}
        <div className="text-center pt-1">
          <p className="text-sm text-text-secondary">
            Didn&apos;t get the code?{" "}
            {resendCooldown > 0 ? (
              <span className="text-text-muted font-medium font-mono text-xs">
                Resend in {resendCooldown}s
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="font-bold text-foreground hover:text-accent-brand underline underline-offset-4 transition-colors duration-150"
              >
                Resend code
              </button>
            )}
          </p>
        </div>
      </motion.div>
    </AuthPageLayout>
  );
}