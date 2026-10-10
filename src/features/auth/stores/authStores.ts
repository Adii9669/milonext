import { create } from "zustand";

import type { User } from "@/src/types/user";

interface AuthStore {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    setUser: (user: User | null) => void;
    logout: () => void;
}

export const useAuthStore =
    create<AuthStore>((set) => ({

        user: null,

        isAuthenticated: false,

        isLoading: true,

        setUser: (user) =>
            set({
                user,
                isAuthenticated: !!user,
                isLoading: false,
            }),

        logout: () =>
            set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
            }),
    }));