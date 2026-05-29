import { env } from "../env";

import { handleResponse } from "./handleResponse";

const API_BASE_URL =
    env.NEXT_PUBLIC_API_URL;

export async function apiFetch(
    path: string,
    options: RequestInit = {}
) {

    const url = `${API_BASE_URL}${path}`;

    const request = () =>
        fetch(url, {
            ...options,
            credentials: "include",
        });

    const response = await request();

    return handleResponse(
        response,
        request
    );
}