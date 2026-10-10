import { apiFetch }
from "@/src/lib/api/apiClient";

export const crewsApi = {

    getCrews: () =>
        apiFetch("/api/crews/"),

    createCrew: (
        body: any
    ) =>

        apiFetch(
            "/api/crews/",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",
                },

                body:
                    JSON.stringify(body),
            }
        ),

    deleteCrew: (
        crewID: string
    ) =>

        apiFetch(
            `/api/crews/${crewID}/`,
            {
                method: "DELETE",
            }
        ),

    updateCrew: (
        crewID: string,
        body: any
    ) =>

        apiFetch(
            `/api/crews/${crewID}/`,
            {
                method: "PUT",

                headers: {
                    "Content-Type":
                        "application/json",
                },

                body:
                    JSON.stringify(body),
            }
        ),
};