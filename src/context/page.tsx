"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import Cookies from "universal-cookie";
import { useRouter, useSearchParams } from "next/navigation";

import {
  getMe,
  login as apiLogin,
  logout as apiLogout,
  signup as apiSignup,
} from "../lib/api";
import { useCrewStore } from "../app/stores/crewStores";
import { useFriendStore } from "../app/stores/friendStore";

const cookies = new Cookies();

/* =======================
   Types
======================= */

interface User {
  id: string;
  name: string;
  email: string;
  status: string;
}

interface SignupResponse {
  message: string;
  email: string;
}

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
}

/* =======================
   Context
======================= */

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* =======================
   Provider
======================= */

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/connect";

  /**
   * Restore session on page refresh
   */
  useEffect(() => {
    async function bootstrapSession() {
      try {
        const res = await getMe();
        if (res?.user) {
          setUser(res.user);
          useCrewStore.getState().fetchCrews();
          useFriendStore.getState().fetchFriends();
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    bootstrapSession();
  }, []);

  /**
   * Login
   */
  const login = async (username: string, password: string) => {
    const data = await apiLogin(username, password);
    setUser(data.user);

    useCrewStore.getState().fetchCrews();
    useFriendStore.getState().fetchFriends();
    router.push(callbackUrl);
  };

  /**
   * Logout
   */
  const logout = () => {
    apiLogout();
    cookies.remove("token", { path: "/" });
    setUser(null);
    useCrewStore.getState().clearCrews();
    useFriendStore.getState().clearFriends();
    window.location.href = "/auth/login";
  };

  /**
   * Signup
   */
  const signup = async (username: string, email: string, password: string) => {
    return apiSignup(username, email, password);
  };

  /**
   * OTP / Magic link login
   */
  const loginWithToken = (user: User, token: string) => {
    cookies.set("token", token, {
      path: "/",
      expires: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      secure: true,
      sameSite: "none",
    });

    setUser(user);
    router.push("/connect");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        signup,
        loginWithToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* =======================
   Hook
======================= */

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
