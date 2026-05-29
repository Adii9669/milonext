import { env } from "../env";

const API_BASE_URL =
    env.NEXT_PUBLIC_API_URL;
    
let isRefreshing = false;

export async function refreshToken() {
    if (isRefreshing) return;

    isRefreshing = true;

    try {
        const response = await fetch(
            `${API_BASE_URL}/auth/refresh`,
            {
                method: "POST",
                credentials: "include",
            }
        );

        if (!response.ok) {
            throw new Error("Refresh failed");
        }
    } finally {
        isRefreshing = false;
    }
}