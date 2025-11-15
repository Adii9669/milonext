"use client";

import React, { useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyOTP } from "@/src/lib/api";
import { useAuth } from "@/src/context/page";
import { number, string } from "zod";

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithToken, login } = useAuth();

  // Get the email from the URL to show the user
  const email = searchParams.get("email");
  if (!email) {
    return <div>Email parameter missing.</div>;
    // throw new Error("Email is missing in query params");
  }

  // State to manage the 6 input boxes
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Refs to manage focus between input boxes
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Handle changes and auto-focus to the next input
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const { value } = e.target;
    // Only allow numbers
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Take only the last character
    setOtp(newOtp);

    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
    if (index === 5 && value) {
      // Since you are in a form, the button click will handle submission,
      // but adding a programmatic submit call here can be a nice touch if not using a form.
    }
  };

  // Handle backspace to move to the previous input
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && index > 0) {
      if (!otp[index]) {
        const newOtp = [...otp];
        newOtp[index - 1] = ""; // Clear the previous digit
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    if (!/^\d{6}$/.test(pastedData)) return; // Only paste if it's 6 digits

    const newOtp = pastedData.split("");
    setOtp(newOtp);
    inputRefs.current[5]?.focus(); // Focus the last input after paste
  };

  // Handle the form submission
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
      // --- Replace with your actual API call ---
      const response = await verifyOTP(email, Number(otpCode));
      loginWithToken(response.user, response.token);

      if (response.user && response.token) {
        login(response.user, response.token);
      }
      console.log("Verifying code:", otpCode);
      // ---

      router.push("/auth/login");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred."
      );
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
                // ref={(el) => (inputRefs.current[index] = el)}
                type="text"
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

        <div className="mt-6 text-center">
          <button className="text-sm text-blue-600 hover:underline">
            {`Didn't receive a code? Resend`}
          </button>
        </div>
      </div>
    </div>
  );
}
