import { apiFetch } from "@/src/lib/api/apiClient";

export async function getMe() {
    return apiFetch("/api/me");
}