"use client";

import {
    useState,
    useRef,
    useCallback,
} from "react";

import { useRouter }
from "next/navigation";

import {
    resendOTP,
    verifyOTP,
} from "../api/otpApi";

export function useVerifyOTP(
    email: string
) {

    const router = useRouter();

    const [otp,
        setOtp] =
        useState<string[]>(
            new Array(6).fill("")
        );

    const [error,
        setError] =
        useState<string | null>(
            null
        );

    const [isLoading,
        setIsLoading] =
        useState(false);

    const [resendCooldown,
        setResendCooldown] =
        useState(0);

    const inputRefs =
        useRef<
            (HTMLInputElement | null)[]
        >([]);

    const handleResend =
        useCallback(async () => {

            if (resendCooldown > 0)
                return;

            try {

                await resendOTP(email);

                setOtp(
                    new Array(6).fill("")
                );

                inputRefs.current[0]
                    ?.focus();

                setResendCooldown(30);

                const interval =
                    setInterval(() => {

                        setResendCooldown(
                            prev => {

                                if (prev <= 1) {

                                    clearInterval(
                                        interval
                                    );

                                    return 0;
                                }

                                return prev - 1;
                            }
                        );

                    }, 1000);

            } catch {

                setError(
                    "Failed to resend OTP"
                );
            }

        }, [email, resendCooldown]);

    async function handleSubmit() {

        try {

            setIsLoading(true);

            setError(null);

            const otpCode =
                otp.join("");

            if (
                otpCode.length !== 6
            ) {

                setError(
                    "OTP must be 6 digits"
                );

                return;
            }

            await verifyOTP(
                email,
                otpCode
            );

            router.push("/connect");

        } catch (error) {

            setError(
                error instanceof Error
                    ? error.message
                    : "Verification failed"
            );

        } finally {

            setIsLoading(false);
        }
    }

    return {
        otp,
        setOtp,

        error,

        isLoading,

        resendCooldown,

        inputRefs,

        handleResend,

        handleSubmit,
    };
}