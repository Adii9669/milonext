import { apiFetch }
from "@/src/lib/api/apiClient";

export const messagingApi = {

    getDMChat: (
        userID: string
    ) =>

        apiFetch(
            `/api/chats/dm/${userID}`
        ),
};

export const deleteChatMessage = (messageID: string, scope: "me" | "everyone") =>
    apiFetch(`/api/messages/${messageID}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope }),
    });
