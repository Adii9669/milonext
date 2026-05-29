import { apiFetch } from "../api/apiClient";
import { PaginatedMessages } from "@/src/features/Chat/types/messages";


export const getCrewHistory = async (
    crewId: string,
    limit = 50,
    cursor?: string
) => {
    let url = `/api/chats/crew/${crewId}?limit=${limit}`;

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



