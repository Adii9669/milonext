"use client";

import React, { useState, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
// import { useAuth } from "@/src/context/AuthContext";
import { verifyOTP, resendOTP } from "@/src/lib/api";

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email");

  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0); // ✅ cooldown timer

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  if (!email || email === "undefined") {
    return <div>Email parameter missing or invalid.</div>;
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const { value } = e.target;
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // ✅ auto focus next
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    if (!/^\d{6}$/.test(pastedData)) return;

    const newOtp = pastedData.split("");
    setOtp(newOtp);
    inputRefs.current[5]?.focus();
  };

  // ✅ Resend OTP handler with 30s cooldown
  const handleResend = useCallback(async () => {
    if (resendCooldown > 0) return;

    try {
      await resendOTP(email);

      setOtp(new Array(6).fill(""));
      inputRefs.current[0]?.focus();
      setError(null);

      setResendCooldown(30);

      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError("Failed to resend OTP. Please try again.");
    }
  }, [email, resendCooldown]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      setError("The verification code must be 6 digits.");
      setIsLoading(false);
      return;
    }

    try {
      await verifyOTP(email, otpCode);
      router.push("/connect");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h2 className="mb-2 text-center text-2xl font-bold text-gray-800">
          Verify Your Account
        </h2>
        <p className="mb-6 text-center text-gray-600">
          Enter the 6-digit code sent to{" "}
          <strong>{email || "your email"}</strong>.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-6 flex justify-center gap-2 md:gap-4">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }} 
                type="text"
                inputMode="numeric" // ✅ shows number keyboard on mobile
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={handlePaste}
                className="h-14 w-12 rounded-lg border-2 border-gray-300 text-center text-3xl font-semibold transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500 md:h-16 md:w-14"
              />
            ))}
          </div>

          {error && <p className="mb-4 text-center text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg cursor-pointer bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? "Verifying..." : "Verify"}
          </button>
        </form>

        {/* ✅ Resend button with cooldown */}
        <div className="mt-6 text-center">
          <button
            onClick={handleResend}
            disabled={resendCooldown > 0}
            className="text-sm text-blue-600 hover:underline disabled:text-gray-400 disabled:no-underline"
          >
            {resendCooldown > 0
              ? `Resend code in ${resendCooldown}s`
              : `Didn't receive a code? Resend`}
          </button>
        </div>
      </div>
    </div>
  );
}
