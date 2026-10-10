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

            router.push("/auth/login");

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
        errors,
        isSubmitting,
        onSubmit,

        isChecking,
        isAvailable,
    };
}
