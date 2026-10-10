"use client";

import { useEffect } from "react";

import { getMe } from "../api/getMeApi";

import { useAuthStore } from "../stores/authStores";

export function useInitializeAuth() {

    const setUser =
        useAuthStore((state) => state.setUser);

    useEffect(() => {

        async function initialize() {

            try {

                const user = await getMe();

                setUser(user);

            } catch {

                setUser(null);
            }
        }

        initialize();

    }, [setUser]);
}