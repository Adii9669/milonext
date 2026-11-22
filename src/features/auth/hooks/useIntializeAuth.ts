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

                const response = await getMe();

                setUser("user" in response ? response.user : response);

            } catch {

                setUser(null);
            }
        }

        initialize();

    }, [setUser]);
}