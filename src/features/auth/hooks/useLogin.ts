"use client";

import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  LoginSchema,
  LoginFormValues,
} from "../schemas/auth.schema";

import { loginUser } from "../api/authApi";

import { useAuthStore }
  from "../stores/authStores";

export function useLogin() {

  const router = useRouter();

  const searchParams =
    useSearchParams();

  const callbackUrl =
    searchParams.get("callbackUrl")
    || "/connect";

  const setUser =
    useAuthStore(
      (state) => state.setUser
    );

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
    setError,
  } = useForm<LoginFormValues>({
    resolver:
      zodResolver(LoginSchema),
  });

  async function onSubmit(
    data: LoginFormValues
  ) {

    try {

      const response =
        await loginUser(data);

      setUser(response.user);

      console.log("Login successful, redirecting to:", callbackUrl);  
      console.log("Response user:", response.user);

      //redirect 
      router.push(callbackUrl);

    } catch (error) {

      const message =
        error instanceof Error
          ? error.message
          : "Login failed";

      setError("username", {
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
  };
}