"use client";

import React from "react";

interface Props {
  otp: string[];
  setOtp: React.Dispatch<React.SetStateAction<string[]>>;
  inputRefs: React.RefObject<(HTMLInputElement | null)[]>;
  error?: boolean;
}

export function OTPInput({ otp, setOtp, inputRefs, error }: Props) {
  function handleChange(value: string, index: number) {
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>, index: number) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const newOtp = [...otp];
    pasted.split("").forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);
    // focus last filled or next
    const lastIndex = Math.min(pasted.length, 5);
    inputRefs.current[lastIndex]?.focus();
  }

  return (
    <div className="flex items-center justify-center gap-3">
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          maxLength={1}
          value={digit}
          inputMode="numeric"
          autoComplete="one-time-code"
          onChange={(e) => handleChange(e.target.value, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={index === 0 ? handlePaste : undefined}
          className={`
            w-12 h-14 sm:w-14 sm:h-16
            text-center text-xl font-bold
            rounded-xl border-2 bg-surface/80 text-foreground
            outline-none
            transition-all duration-150
            caret-primary
            ${
              digit
                ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                : error
                  ? "border-error ring-2 ring-error/20"
                  : "border-border hover:border-border-strong focus:border-primary focus:ring-2 focus:ring-primary/20"
            }
          `}
        />
      ))}
    </div>
  );
}