import { apiFetch }
    from "@/src/lib/api/apiClient";

interface RegisterPayload {
    username: string;
    email: string;
    password: string;
}

export async function registerUser(
    payload: RegisterPayload
) {

    return apiFetch(
        "/auth/register",
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json",
            },

            body:
                JSON.stringify(payload),
        }
    );
}