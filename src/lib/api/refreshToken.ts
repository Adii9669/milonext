import { env } from "../env";

const API_BASE_URL =
    env.NEXT_PUBLIC_API_URL;

// Share one in-flight refresh between concurrent 401 responses so they all
// retry with the same new access-token cookie instead of racing each other.
let refreshPromise: Promise<void> | null = null;

export async function refreshToken() {
    if (!refreshPromise) {
        refreshPromise = (async () => {
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
        })().finally(() => {
            refreshPromise = null;
        });
    }

    return refreshPromise;
}
