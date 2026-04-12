"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
  useRef,
} from "react";

import { useRouter } from "next/navigation";
import {
  getMe,
  login as apiLogin,
  logout as apiLogout,
  signup as apiSignup,
} from "../lib/api";

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
  login: (
    username: string,
    password: string,
    redirectTo?: string,
  ) => Promise<void>;

  logout: () => Promise<void>;
  signup: (
    username: string,
    email: string,
    password: string,
  ) => Promise<SignupResponse>;
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

  // Restore session on page refresh
  useEffect(() => {
    async function bootstrapSession() {
      try {
        const res = await getMe();
        setUser(res.user ?? null);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    bootstrapSession();
  }, []);

  const login = useCallback(
    async (
      username: string,
      password: string,
      redirectTo = "/connect", // default
    ) => {
      try {
        // backend sets access_token + refresh_token cookies automatically
        await apiLogin(username, password);
        const res = await getMe();
        setUser(res.user);
        router.push(redirectTo);
      } catch (err) {
        throw err;
      }
    },
    [router],
  );
  const broadcastChannel = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    broadcastChannel.current = new BroadcastChannel("auth");

    broadcastChannel.current.onmessage = (e) => {
      if (e.data === "logout") {
        // another tab logged out — clear state and redirect
        setUser(null);
        router.replace("/auth/login");
      }
    };

    return () => {
      broadcastChannel.current?.close();
    };
  }, [router]);

  // Update logout to broadcast to other tabs:
  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      // still clear local state even if request fails
    } finally {
      // tell all other tabs
      broadcastChannel.current?.postMessage("logout");
      setUser(null);
      router.push("/auth/login");
    }
  }, [router]);

  const signup = useCallback(
    async (
      username: string,
      email: string,
      password: string,
    ): Promise<SignupResponse> => {
      return apiSignup(username, email, password);
    },
    [],
  );

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
}

/* =======================
   Hook
======================= */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
// "use client";

// import {
//   createContext,
//   useContext,
//   useEffect,
//   useState,
//   ReactNode,
// } from "react";

// import Cookies from "universal-cookie";
// import { useRouter, useSearchParams } from "next/navigation";

// import {
//   getMe,
//   login as apiLogin,
//   logout as apiLogout,
//   signup as apiSignup,
// } from "../lib/api";

// const cookies = new Cookies();

// /* =======================
//    Types
// ======================= */

// interface User {
//   id: string;
//   name: string;
//   email: string;
//   status: string;
// }

// interface SignupResponse {
//   message: string;
//   email: string;
// }

// interface AuthContextType {
//   user: User | null;
//   loading: boolean;

//   login: (username: string, password: string) => Promise<void>;
//   logout: () => void;
//   signup: (
//     username: string,
//     email: string,
//     password: string,
//   ) => Promise<SignupResponse>;

//   loginWithToken: (user: User, token: string) => void;
// }

// /* =======================
//    Context
// ======================= */

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// /* =======================
//    Provider
// ======================= */

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();
//   const searchParams = useSearchParams();

//   /**
//    * Restore session on page refresh
//    */

//   useEffect(() => {
//     async function bootstrapSession() {
//       try {
//         const res = await getMe();
//         // console.log("Bootstrap session response:", res);
//         setUser(res.user ?? null);
//       } catch (err) {
//         if (!user) {
//           setUser(null);
//         }
//       } finally {
//         setLoading(false);
//       }
//     }

//     bootstrapSession();
//   }, []);

//   /**
//    * Login
//    */
//   const login = async (username: string, password: string) => {
//     // setLoading (true);
//     try {
//       await apiLogin(username, password);
//       const res = await getMe();
//       setUser(res.user);
//       return res;
//     } catch (err) {
//       console.error("Login failed:", err);
//       throw err;
//     }
//     //  finally {
//     //   setLoading(false);
//     // }
//   };

//   /**
//    * Logout
//    */
//   const logout = () => {
//     apiLogout();
//     cookies.remove("token", { path: "/" });
//     setUser(null);
//     window.location.href = "/auth/login";
//   };

//   /**
//    * Signup
//    */
//   const signup = async (username: string, email: string, password: string) => {
//     return apiSignup(username, email, password);
//   };

//   /**
//    * OTP / Magic link login
//    */
//   const loginWithToken = (user: User, token: string) => {
//     cookies.set("token", token, {
//       path: "/",
//       expires: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
//       secure: true,
//       sameSite: "none",
//     });

//     setUser(user);
//     router.push("/connect");
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         loading,
//         login,
//         logout,
//         signup,
//         loginWithToken,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }

// /* =======================
//    Hook
// ======================= */

// export function useAuth() {
//   const ctx = useContext(AuthContext);
//   if (!ctx) {
//     throw new Error("useAuth must be used inside AuthProvider");
//   }
//   return ctx;
// }
