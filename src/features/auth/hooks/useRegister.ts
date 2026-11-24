"use client";

import { useRouter }
    from "next/navigation";

import {
    useForm,
    useWatch,
} from "react-hook-form";

import {
    zodResolver,
} from "@hookform/resolvers/zod";

import {
    RegisterSchema,
    RegisterFormValues,
} from "../schemas/auth.schema";

import {
    registerUser,
} from "../api/registerApi";

import {
    useCheckUsername,
} from "./useCheckUsername";

export function useRegister() {

    const router = useRouter();

    const {
        register,
        handleSubmit,
        control,
        watch,

        formState: {
            errors,
            isSubmitting,
        },

        setError,

    } = useForm<RegisterFormValues>({
        resolver:
            zodResolver(RegisterSchema),
    });

    const username =
        useWatch({
            control,
            name: "username",
        });

    const {
        isLoading: isChecking,
        isAvailable,
    } = useCheckUsername(
        username
    );

    async function onSubmit(
        data: RegisterFormValues
    ) {

        try {

            await registerUser({
                username:
                    data.username,

                email:
                    data.email,

                password:
                    data.password,
            });

            // Verification is temporarily disabled. Send the user to login so
            // they can sign in immediately; re-enable OTP verification later.
            router.push("/login?registered=true");

        } catch (error) {

            const message =
                error instanceof Error
                    ? error.message
                    : "Registration failed";

            setError("root", {
                type: "server",
                message,
            });
        }
    }

    return {
        register,
        handleSubmit,
        control,
        watch,
        errors,
        isSubmitting,
        onSubmit,

        isChecking,
        isAvailable,
    };
}
