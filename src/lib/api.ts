import { PaginatedMessages } from "../types/messages";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getAuthToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("token") ?? "";
}

function getAuthHeaders() {
  const token = getAuthToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

//hepler function for fetch error and throw them
async function handleResponse(res: Response) {

  const contentType = res.headers.get("content-type");

  // Safely parse JSON only when available
  let data;
  if (contentType && contentType.includes("application/json")) {
    data = await res.json();
  } else {
    data = await res.text(); // fallback for plain-text or HTML errors
  }

  if (!res.ok) {
    const backendMessage =
      typeof data === "string"
        ? data
        : data?.message || data?.error || JSON.stringify(data);
    const errorMessage = backendMessage || "Request failed";
    const error = new Error(errorMessage) as Error & { status?: number };
    error.status = res.status;

    throw error;
  }

  return data;

}

/**
 * Calls the login endpoint.
 */
export async function login(username: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ username, password }),
  });
  const data = await handleResponse(res);
  if (typeof window !== "undefined" && data?.token) {
    localStorage.setItem("token", data.token);
  }
  return data;
}

/**
 * singup
 */
export async function signup(username: string, email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });
  return handleResponse(res);
}

/**
 * Calls the logout endpoint.
 */
export async function logout() {
  await fetch(`${API_URL}/api/logout`, {
    method: "POST",
    credentials: "include",
  });
}

/**
 * Fetches the current user's data if they are logged in.
 */
export async function getMe() {
  const res = await fetch(`${API_URL}/api/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",

    },
    credentials: "include",
  });

  const data = await handleResponse(res);
  return data;
}


/**
 * Request OTP
 */
export async function verifyOTP(email: string, otp: string) {
  const res = await fetch(`${API_URL}/auth/verify-otp`, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    credentials: "include",
    body: JSON.stringify({ email, otp }),
  });
  return handleResponse(res);
}



//-----------------------------------------Friends----------------------------//

/**
 * Get Friends
 */
export async function getFriends() {
  const res = await fetch(`${API_URL}/api/friends`, {
    headers: {
      "Content-Type": "application/json",

    },
    method: "GET",
    credentials: "include",
  });
  return handleResponse(res);
}

/**
 * Send Friend Request
 */
export async function sendFriendRequest(userId: string) {
  const res = await fetch(`${API_URL}/api/friend-requests`, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    credentials: "include",
    body: JSON.stringify({ userId }),
  });
  return handleResponse(res);
}

/**
 * Get Friend Requests (incoming by default)
 */
export async function getFriendRequests(type = "incoming") {
  const res = await fetch(`${API_URL}/api/friend-requests?type=${type}`, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "GET",
    credentials: "include",
  });
  return handleResponse(res);
}

/**
 * Accept Friend Request
 */
export async function acceptFriendRequest(friendID: string) {
  const res = await fetch(`${API_URL}/api/friend-requests/${friendID}/accept`, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "PUT",
    credentials: "include",
    body: JSON.stringify({ userId: friendID }),
  });
  return handleResponse(res);
}

/**
 * Reject Friend Request
 */
export async function rejectFriendRequest(friendID: string) {
  const res = await fetch(`${API_URL}/api/friend-requests/${friendID}`, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "DELETE",
    credentials: "include",
  });
  return handleResponse(res);
}

/**
 * Get all registered users
 */
export async function getUsers() {
  const res = await fetch(`${API_URL}/api/users`, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "GET",
    credentials: "include",
  });
  return handleResponse(res);
}

/**
 * Remove Friend
 */
export async function removeFriend(friendId: string) {
  const res = await fetch(`${API_URL}/api/friends/${friendId}`, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "DELETE",
    credentials: "include",
    body: JSON.stringify({ friendId }),
  });
  return handleResponse(res);
}




//-----------------------------------------Crews----------------------------//

/**
 * Create Crew
 */
export async function createCrew(name: string) {
  const res = await fetch(`${API_URL}/api/crew/create`, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    credentials: "include",
    body: JSON.stringify({ name }),
  });
  return handleResponse(res);
}

/**
 * Get Crews
 */

export async function getCrews() {
  const res = await fetch(`${API_URL}/api/crews`, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "GET",
    credentials: "include",
  });
  const data = await handleResponse(res);
  return data.crews ?? [];

}




/** 
 * Delet Crews
 */
export async function deleteCrew(crewId: string) {
  const res = await fetch(`${API_URL}/api/crew/${crewId}`, {
    headers: {
      "Content-Type": "application/json"
    },
    method: "DELETE",
    credentials: "include",
  });
  return handleResponse(res);
}


//-----------------------------------------Crews Members----------------------------//

export async function getCrewMembers(crewId: string) {
  const res = await fetch(`${API_URL}/api/crews/${crewId}/members`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  const data = await handleResponse(res);
  return data.members ?? [];
}

export async function addCrewMember(crewId: string, userId: string) {
  const res = await fetch(`${API_URL}/api/crews/${crewId}/members/${userId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  return handleResponse(res);
}

export async function removeCrewMember(crewId: string, userId: string) {
  const res = await fetch(`${API_URL}/api/crews/${crewId}/members/${userId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  return handleResponse(res);
}

export async function updateCrewMemberRole(crewId: string, userId: string, role: string) {
  const res = await fetch(`${API_URL}/api/crews/${crewId}/members/${userId}/role`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ role }),
  });
  return handleResponse(res);
}






//-----------------------------------------History----------------------------//
/**
 * Get Crews History
 */
export async function getCrewHistory(
  crewId: string,
  limit = 50,
  cursor?: string
): Promise<PaginatedMessages> {
  let url = `${API_URL}/api/chats/crew/${crewId}?limit=${limit}`;

  if (cursor) {
    url += `&cursor=${encodeURIComponent(cursor)}`;
  }

  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  return handleResponse(res);
}

export async function getDmHistory(
  userID: string,
  limit = 50,
  cursor?: string
): Promise<PaginatedMessages> {
  let url = `${API_URL}/api/chats/dm/${userID}?limit=${limit}`;

  if (cursor) {
    url += `&cursor=${encodeURIComponent(cursor)}`;
  }

  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  return handleResponse(res);
}



