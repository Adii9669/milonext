import { apiFetch } from "../api/apiClient";


/**
 * singup
 */
export const signup = async (
    username: string,
    email: string,
    password: string) => {
    return apiFetch("/auth/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
    })
}



/**
 * Calls the login endpoint.
 */
export const login = async (username: string, password: string) => {
    return apiFetch("/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
    })
}


/**
 * Refresh access token using refresh token cookie
 */
export const refreshToken = async () => {
    return apiFetch("/auth/refresh", {
        method: "POST",
    })
}



/**
 * Logout — fix endpoint and method
 */
export const logout = async () => {
    return apiFetch("/api/logout", {
        method: "POST",
    })
}