
import { apiFetch } from "../api/apiClient";

/**
 * Get Friends
 */
export const getFriends = async () => {
    return apiFetch(`/api/friends`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",

        },
    });

}

/**
 * Send Friend Request
 */
export const sendFriendRequest = async (userId: string) => {
    return apiFetch(`/api/friend-requests`, {
        method: "POST",

        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
    });

}

/**
 * Get Friend Requests (incoming by default)
 */
export const getFriendRequests = async (type = "incoming") => {
    return apiFetch(`/api/friend-requests?type=${type}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
};

/**
 * Accept Friend Request
 */
export const acceptFriendRequest = async (friendID: string) => {
    return apiFetch(`/api/friend-requests/${friendID}/accept`, {
        headers: {
            "Content-Type": "application/json",
        },
        method: "PUT",

        body: JSON.stringify({ userId: friendID }),
    });

}

/**
 * Reject Friend Request
 */
export const rejectFriendRequest = async (friendID: string) => {
    return apiFetch(`/api/friend-requests/${friendID}`, {
        headers: {
            "Content-Type": "application/json",
        },
        method: "DELETE",
        body: JSON.stringify({ userId: friendID }),
    });

}




/**
 * Remove Friend
 */
export const removeFriend = async (friendId: string) => {
    return apiFetch(`/api/friends/${friendId}`, {
        headers: {
            "Content-Type": "application/json",
        },
        method: "DELETE",
        body: JSON.stringify({ friendId }),
    });

}

