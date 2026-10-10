import { apiFetch }
from "@/src/lib/api/apiClient";

export async function verifyOTP(
    email: string,
    otp: string
) {

    return apiFetch(
        "/auth/verify-otp",
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json",
            },

            body: JSON.stringify({
                email,
                otp,
            }),
        }
    );
}

export async function resendOTP(
    email: string
) {

    return apiFetch(
        "/auth/resend-otp",
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json",
            },

            body: JSON.stringify({
                email,
            }),
        }
    );
}