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