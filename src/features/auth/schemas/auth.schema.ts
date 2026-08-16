import { z } from "zod";

export const LoginSchema = z.object({
    username: z
        .string()
        .min(1, "Username required"),

    password: z
        .string()
        .min(1, "Password required"),
});

export type LoginFormValues =
    z.infer<typeof LoginSchema>;



export const RegisterSchema = z
    .object({

        username:
            z.string()
                .min(3,
                    "Username too short"),

        email:
            z.email(
                "Invalid email"
            ),

        password:
            z.string()
                .min(
                    8,
                    "Password must be at least 8 characters"
                ),

        confirmPassword:
            z.string(),
    })

    .refine(
        (data) =>
            data.password ===
            data.confirmPassword,

        {
            path: ["confirmPassword"],

            message:
                "Passwords do not match",
        }
    );

export type RegisterFormValues =
    z.infer<typeof RegisterSchema>;