// lib/api.js


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
    console.log(data?.message || data || "Request failed");
  }
  
  return data;

}

/**
 * Calls the login endpoint.
 */
export async function login(username: string, password: string) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
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
  const res = await fetch(`${API_URL}/api/auth/register`, {
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
  await fetch(`${API_URL}/logout`, {
    method: "POST",
    credentials: "include",
  });
}

/**
 * Fetches the current user's data if they are logged in.
 */
export async function getMe() {
  const res = await fetch(`${API_URL}/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  return handleResponse(res);
}


/**
 * Request OTP
 */
export async function verifyOTP(email: string, otp: number) {
  const res = await fetch(`${API_URL}/api/auth/verify-otp`, {
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
  const res = await fetch(`${API_URL}/crews`, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    credentials: "include",
    body: JSON.stringify({ name }),
  });
  return handleResponse(res);
}

export async function getCrews() {
  const res = await fetch(`${API_URL}/crews`, {
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
  const res = await fetch(`${API_URL}/crews/${crewId}`, {
    headers: {
      "Content-Type": "application/json"
    },
    method: "DELETE",
    credentials: "include",
  });
  return handleResponse(res);
}