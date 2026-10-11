"use client";

import { useRouter } from "next/navigation";
import { logoutUser } from "../api/authApi";
import { useAuthStore }
    from "../stores/authStores";

export function useAuth() {
    const router = useRouter();

    const user =
        useAuthStore((state) => state.user);

    const isAuthenticated =
        useAuthStore(
            (state) => state.isAuthenticated
        );

    const clearAuth =
        useAuthStore((state) => state.logout);

    const loading =
        useAuthStore((state) => state.isLoading);

    const logout = async () => {
        await logoutUser();
        clearAuth();
        router.replace("/auth/login");
    };

    return {
        user,
        isAuthenticated,
        loading,
        logout,
    };
}