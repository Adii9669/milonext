import { apiFetch }
from "@/src/lib/api/apiClient";

export async function checkUsername(
    username: string,
    signal?: AbortSignal
) {

    return apiFetch(
        "/auth/check-availability",
        {
            method: "POST",

            signal,

            headers: {
                "Content-Type":
                    "application/json",
            },

            body: JSON.stringify({
                field: "username",
                value: username,
            }),
        }
    );
}