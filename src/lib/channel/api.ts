import { apiFetch } from "../api/apiClient";

//-----------------------------------------Channels CURD----------------------------//
/**
 * Create Channel
 */
export const createChannel = async (name: string) => {
    return apiFetch("/api/channels/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
    });
}

/**
 * Get Channels
 */
export const getChannels = async () => {
    return apiFetch("/api/channels/", {
        method: "GET",
    });
}


/** 
 * Delet Channels
 */
export const deleteChannel = async (channelId: string) => {
    return apiFetch(`/api/channels/${channelId}/`, {
        method: "DELETE",
    });
}



//-----------------------------------------Channels Members----------------------------//

export const getChannelMembers = async (channelId: string) => {
    const data = await apiFetch(`/api/channels/${channelId}/members`);
    return data.members ?? [];
}

export const addChannelMember = async (channelId: string, userId: string) => {
    return apiFetch(`/api/channels/${channelId}/members/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
    });
  
}

export const removeChannelMember = async (channelId: string, userId: string) => {
    return apiFetch(`/api/channels/${channelId}/members/${userId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
    });
}

export const updateChannelMemberRole = async (channelId: string, userId: string, role: string) => {
    return apiFetch(`/api/channels/${channelId}/members/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
    });

}


