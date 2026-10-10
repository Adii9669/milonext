import { apiFetch } from "@/src/lib/api/apiClient";

interface LoginPayload {
    username: string;
    password: string;
}

export async function loginUser(
    payload: LoginPayload
) {
    return apiFetch("/auth/login", {
        method: "POST",

        headers: {
            "Content-Type": "application/json",
        },

        body: JSON.stringify(payload),
    });
}

