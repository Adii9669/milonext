"use client";

import {
    useEffect,
    useState,
} from "react";

import {
    useDebounce,
} from "@/src/hooks/useDebounce";

import {
    checkUsername,
} from "../api/checkUsernameApi";

export function useCheckUsername(
    username: string
) {

    const debouncedUsername =
        useDebounce(username, 500);

    const [isLoading,
        setIsLoading] =
        useState(false);

    const [isAvailable,
        setIsAvailable] =
        useState<boolean | null>(
            null
        );

    const [error,
        setError] =
        useState<string | null>(
            null
        );

    useEffect(() => {

        if (
            !debouncedUsername ||
            debouncedUsername.length < 3
        ) {

            setIsAvailable(null);

            return;
        }

        const controller =
            new AbortController();

        async function validate() {

            try {

                setIsLoading(true);

                setError(null);

                const response =
                    await checkUsername(
                        debouncedUsername,
                        controller.signal
                    );

                setIsAvailable(
                    response.available
                );

            } catch (error) {

                if (
                    error instanceof DOMException &&
                    error.name ===
                    "AbortError"
                ) {
                    return;
                }

                setError(
                    error instanceof Error
                        ? error.message
                        : "Validation failed"
                );

            } finally {

                setIsLoading(false);
            }
        }

        validate();

        return () => {
            controller.abort();
        };

    }, [debouncedUsername]);

    return {
        isLoading,
        isAvailable,
        error,
    };
}