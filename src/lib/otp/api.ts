import { apiFetch } from "../api/apiClient";

/**
 * Request OTP
 */
export const verifyOTP = async (email: string, otp: string) => {
  return apiFetch(`/auth/verify-otp`, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({ email, otp }),
  });
 
}

/**
 * RESEND OTP
 */
export const resendOTP = async (email: string) => {
  return apiFetch(`/auth/resend-otp`, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({ email }),
  });

}