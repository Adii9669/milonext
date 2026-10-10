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



/**
 * Get all registered users
 */
export const getUsers = async () => {
    return apiFetch(`/api/users`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
}