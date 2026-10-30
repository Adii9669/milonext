import { apiFetch }
from "@/src/lib/api/apiClient";

export const channelsApi = {

    getChannels: () =>
        apiFetch("/api/channels/"),

    createChannel: (
        body: any
    ) =>

        apiFetch(
            "/api/channels/",
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

    deleteChannel: (
        channelID: string
    ) =>

        apiFetch(
            `/api/channels/${channelID}/`,
            {
                method: "DELETE",
            }
        ),

    updateChannel: (
        channelID: string,
        body: any
    ) =>

        apiFetch(
            `/api/channels/${channelID}/`,
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