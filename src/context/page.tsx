"use client";


import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
// import Cookies from "js-cookie"; // Library to handle browser cookies
import Cookies from "universal-cookie";
const cookies = new Cookies();

import { Crew } from "../types";
import {
  getMe,
  login as apiLogin,
  logout as apiLogout,
  signup as apiSignup,
  createCrew as apiCreateCrew,
  getCrews,
  deleteCrew as apiDeleteCrew,
} from "../lib/api"; // Import your API functions
import { useRouter, useSearchParams } from "next/navigation";


// Define the shape of your user object, as returned by your Go backend
interface User {
  id: string;
  name: string;
  email: string;
  status: string;
  // Add any other user fields you expect from the backend, like 'image'
}
interface SignupResponse {
  message: string;
  email: string;
}

// Define the shape of the data and functions the context will provide
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (
    username: string,
    email: string,
    password: string
  ) => Promise<SignupResponse>;
  loginWithToken: (user: User, token: string) => void;
  crews: Crew[];
  createCrew: (name: string) => Promise<void>;
  fetchCrews: () => Promise<void>;
  deleteCrew: (crewId: string) => Promise<void>;
  getCrews: () => Promise<Crew[]>;
}

// 1. Create the context with a default undefined value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 2. Create the Provider component that will wrap your application
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Start as true to show a loader on initial load
  const router = useRouter();
  const [crews, setCrews] = useState<Crew[]>([]);

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/connect";

  // This effect runs once when the application first loads.
  // Its job is to check if there's an existing valid session.
  useEffect(() => {
    async function checkUserSession() {
      try {
        const response = await getMe();

        // console.log("2. getMe API response:", response);
        if (response && response.user) {
          console.log("User session found:", response.user);
          setUser(response.user);

          await fetchCrews();
        }
      } catch (e) {
        console.error("checkUserSession failed:", e);
        setUser(null);
      } finally {
        // This is the crucial step that stops the loading state.
        setLoading(false);
      }
    }
    checkUserSession();
  }, []); // The empty array [] ensures this effect runs only once on mount // The empty array [] ensures this effect runs only once on mount

  // The login function
  const login = async (username: string, password: string) => {
    try {
      const data = await apiLogin(username, password);
      debugger;
      setUser(data.user);

      await getMe();

      // Fetch crews after setting the user state
      await fetchCrews();
      router.push(callbackUrl);
    } catch (error) {
      throw error;
    }
  };

  // The logout function
  const logout = () => {
    apiLogout();
    setUser(null);
    cookies.remove("token");

    // For a clean logout, redirect the user to the login page
    window.location.href = "/auth/login";
  };

  //The signup function
  const signup = async (username: string, email: string, password: string) => {
    try {
      const data = await apiSignup(username, email, password);
      return data;
    } catch (error) {
      throw error;
    }
  };

  // The loginwithToken function to handle OTP login
  const loginWithToken = (user: User, token: string) => {
    // 1. Set the user state in your app
    setUser(user);

    // 2. Store the new token in the browser's cookies
    cookies.set("token", token, { path: "/", expires: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), secure: true, sameSite: "none" });

    // cookies.set("token", token, { expires:  , secure: true });

    // 3. Redirect to the dashboard
    router.push("/connect");
  };

  // Fetch crews function from the backend
  const fetchCrews = async () => {
    try {
      const userCrews = await getCrews();
      setCrews(userCrews);
    } catch (error) {
      console.error("Failed to fetch crews:", error);
    }
  };

  //The Create Crew function from the backend
  const createCrew = async (name: string) => {
    try {
      await apiCreateCrew(name);
      await fetchCrews();
    } catch (error) {
      console.error("Failed to create crew:", error);
      // Optionally, re-throw the error to show a message in the UI
      throw error;
    }
  };

  //DeleteCrew
  const deleteCrew = async (crewId: string) => {
    try {
      await apiDeleteCrew(crewId);
      await fetchCrews();
    } catch (error) {
      console.error("Failed to create crew:", error);
      // Optionally, re-throw the error to show a message in the UI
      throw error;
    }
  };

  // The value that will be broadcast to all consuming components
  const value = {
    user,
    loading,
    login,
    logout,
    signup,
    loginWithToken,
    createCrew,
    crews,
    fetchCrews,
    deleteCrew,
    getCrews,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 3.custom hook for consumption by other components
export function useAuth() {
  const context = useContext(AuthContext);
  // This check ensures a component is wrapped in the AuthProvider before using the hook
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
