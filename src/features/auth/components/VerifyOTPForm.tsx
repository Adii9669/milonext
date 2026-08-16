"use client";

import { useSearchParams }
from "next/navigation";

import {
    useVerifyOTP,
} from "../hooks/useVerifyOTP";

import {
    OTPInput,
} from "./OtpInput";

export function VerifyOTPForm() {

    const searchParams =
        useSearchParams();

    const email =
        searchParams.get("email");

    if (!email) {
        return <div>Invalid email</div>;
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

    return (

        <form
            onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
            }}
        >

            <OTPInput
                otp={otp}

                setOtp={setOtp}

                inputRefs={inputRefs}
            />

            {error && (
                <p>{error}</p>
            )}

            <button
                type="submit"
            >

                {isLoading
                    ? "Verifying..."
                    : "Verify"}

            </button>

            <button
                type="button"

                onClick={handleResend}
            >

                {resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : "Resend OTP"}

            </button>

        </form>
    );
}