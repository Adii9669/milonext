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

export function useRegister(onSuccess?: (email: string) => void) {

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

            if (onSuccess) {
                onSuccess(data.email);
            } else {
                router.push(`/auth/verifyEmail?email=${encodeURIComponent(data.email)}`);
            }

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
