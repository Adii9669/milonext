import { apiFetch } from "../api/apiClient";


/**
 * Fetches the current user's data if they are logged in.
 */
export const getMe = async () => {
    return apiFetch(`/api/me`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",

        },

    });
}



/** Search registered accounts by username. */
export const searchUsers = async (username: string) => {
    const query = new URLSearchParams({ username });
    return apiFetch(`/api/users?${query.toString()}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
}
