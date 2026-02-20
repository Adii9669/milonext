import { PaginatedMessages } from "../types/messages";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

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
    const message =
      typeof data === "string"
        ? data
        : data?.message || "Request failed";

    // if (res.status === 401) {
    //   if (typeof window !== "undefined") {
    //     window.location.href = "/";
    //   }
    // }

    const error = new Error(message) as Error & { status?: number };
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
  return handleResponse(res);
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

/**
 * Create Crew
 */
export async function createCrew(name: string) {
  const res = await fetch(`${API_URL}/api/crews`, {
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
 * Delet Crews
 */
export async function deleteCrew(crewId: string) {
  const res = await fetch(`${API_URL}/api/crews/${crewId}`, {
    headers: {
      "Content-Type": "application/json"
    },
    method: "DELETE",
    credentials: "include",
  });
  return handleResponse(res);
}


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

// export async function getCrewHistory(crewId: string) {
//   const res = await fetch(`${API_URL}/api/chats/crew/${crewId}`, {
//     headers: {
//       "Content-Type": "application/json",
//     },
//     method: "GET",
//     credentials: "include",
//   });
//   return handleResponse(res);
// }

export async function getDmHistory(id: string) {
  const res = await fetch(`${API_URL}/api/chats/dm/${id}`, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "GET",
    credentials: "include",
  });
  return handleResponse(res);
}