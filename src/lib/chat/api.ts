import { apiFetch } from "../api/apiClient";
import { PaginatedMessages } from "@/src/features/Chat/types/messages";


export const getChannelHistory = async (
    channelId: string,
    limit = 50,
    cursor?: string
) => {
    let url = `/api/chats/channel/${channelId}?limit=${limit}`;

    if (cursor) {
        url += `&cursor=${encodeURIComponent(cursor)}`;
    }

    return apiFetch(url);
}

export const getDmHistory = async (
  userID: string,
  limit = 50,
  cursor?: string
): Promise<PaginatedMessages> => {
  let url = `/api/chats/dm/${userID}?limit=${limit}`;

  if (cursor) {
    url += `&cursor=${encodeURIComponent(cursor)}`;
  }

  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  return apiFetch(url);
}



