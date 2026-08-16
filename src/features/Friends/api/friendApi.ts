import { apiFetch }
from "@/src/lib/api/apiClient";

export const friendsApi = {

    getFriends: () =>
        apiFetch("/api/friends"),

    removeFriend: (
        friendID: string
    ) =>

        apiFetch(
            `/api/friends/${friendID}`,
            {
                method: "DELETE",
            }
        ),

    getRequests: () =>
        apiFetch(
            "/api/friend-requests/"
        ),

    sendRequest: (
        receiverID: string
    ) =>

        apiFetch(
            "/api/friend-requests/",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",
                },

                body:
                    JSON.stringify({
                        receiverID,
                    }),
            }
        ),

    acceptRequest: (
        requestID: string
    ) =>

        apiFetch(
            `/api/friend-requests/${requestID}/accept`,
            {
                method: "PUT",
            }
        ),

    deleteRequest: (
        requestID: string
    ) =>

        apiFetch(
            `/api/friend-requests/${requestID}/`,
            {
                method: "DELETE",
            }
        ),
};