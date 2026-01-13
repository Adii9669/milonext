"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { EyeClosed } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";

import { useAuth } from "@/src/context/page";

import useCheckUsername from "@/src/hooks/ useCheckUsername";
// import PixelButton from "@/components/PixelButton/page";
import { useRedirectValidator } from "@/src/hooks/redirectValidator";
import { Button } from "@/components/ui/button";

// 1. We define the validation schema
const signupSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters.")
      .max(20, "Username must be 20 characters or less."),
    email: z.string().email("Please enter a valid email address."),
    password: z.string().min(8, "Password must be at least 8 characters long."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // Show error on the confirmPassword field
  });

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  useRedirectValidator();
  const { signup } = useAuth();
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch, // We use 'watch' to get the username value for the real-time check
    formState: { errors, isSubmitting, isValid }, // isSubmitting is provided by react-hook-form
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    mode: "onBlur", // Validate when a user leaves a field
  });

  // 2. We integrate our real-time username check directly into the page.
  const usernameValue = watch("username");
  const {
    isLoading: checkingUsername,
    isAvailable,
    error: usernameCheckError,
  } = useCheckUsername(usernameValue || "");

  const renderUsernameStatus = () => {
    if (checkingUsername)
      return (
        <p className="mt-1 text-sm text-gray-500">Checking availability...</p>
      );
    if (usernameCheckError)
      return (
        <p className="mt-1 text-sm text-red-500">Could not check username.</p>
      );
    if (isValid && isAvailable) {
      console.log("Username available");
      return <div>hello</div>;
    }
    if (isAvailable === true && usernameValue && usernameValue.length >= 3) {
      console.log("Username available");
      console.log("Username available");
      console.log("isAvailable:", isAvailable);
      console.log("usernameValue:", usernameValue);
      console.log("usernameValue.length:", usernameValue.length);

      return (
        <p className="mt-1 text-sm text-green-600">
          {`Username "${usernameValue}" is available!`}
        </p>
      );
    }
    if (isAvailable === false)
      return (
        <p className="mt-1 text-sm text-red-500">
          That username is already taken.
        </p>
      );
    return;
    <div className="h-10" />; // Placeholder to prevent layout shift
  };

  // 3. The final submission logic.
  const onSubmit = async (data: SignupFormValues) => {
    setApiError(null);
    try {
      // await signup(data.username, data.email, data.password);
      // router.push("/");
      const res = await signup(data.username, data.email, data.password);

      if (res.email) {
        // Use encodeURIComponent to correctly handle special characters like '+' do this later for testing only
        // const encodedEmail = encodeURIComponent(response.email);
        const encodedEmail = encodeURIComponent(res.email);

        router.push(`/auth/verifyEmail?email=${encodedEmail}`);
      } else {
        setApiError("Signup failed: No email returned from server.");
      }
    } catch (err) {
      if (err instanceof Error) {
        setApiError(err.message);
      } else {
        setApiError("An unexpected error occurred during signup.");
      }
    }
  };

  // The button should be disabled if the form is submitting, a username check is happening, or the chosen username is not available.
  const isButtonDisabled =
    isSubmitting || checkingUsername || !isAvailable || !isValid;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-4 rounded-lg bg-white p-6 shadow-md sm:p-8">
        <h1 className="text-center text-2xl font-bold text-gray-800">
          Create Your Account
        </h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Username Field */}
          <div>
            <label htmlFor="username">Username*</label>
            <input
              id="username"
              type="text"
              {...register("username")}
              autoComplete="new-username"
              placeholder="Enter the Username here."
              className={`input mt-1 w-full mt-1 w-full  overflow-hidden text-ellipsis whitespace-nowrap  rounded-md border px-3 py-2 shadow-sm focus:ring-1 focus:ring-indigo-700 focus:outline-none ${
                errors.username ? "border-blue-500" : ""
              }`}
            />
            {errors.username ? (
              <p className="mt-1 text-sm text-red-500">
                {errors.username.message}
              </p>
            ) : (
              renderUsernameStatus()
            )}
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email">Email*</label>
            <input
              id="email"
              type="email"
              {...register("email")}
              placeholder="Enter email address here."
              autoComplete="new-email"
              className={`input overflow-hidden text-ellipsis whitespace-nowrap  mt-1 w-full mt-1 w-full rounded-md border px-3 py-2 shadow-sm focus:ring-1 focus:ring-indigo-700 focus:outline-none ${
                errors.email ? "border-red-500" : ""
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              placeholder="Passoword must be at least 8 characters long."
              type={showPassword ? "text" : "password"}
              required
              className="mt-1 w-full overflow-hidden text-ellipsis whitespace-nowrap rounded-md border px-3 py-2 shadow-sm focus:ring-1 focus:ring-indigo-700 focus:outline-none"
              {...register("password")}
              autoComplete="new-password"
            />
            <div className="absolute inset-y-11 right-0 flex items-center pr-3 text-gray-500">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute cursor-pointer inset-y-0 right-0 flex items-center pr-3 text-gray-500"
              >
                {showPassword ? (
                  <EyeClosed />
                ) : (
                  <FontAwesomeIcon icon={faEye} />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="relative">
            <label htmlFor="confirmPassword">Confirm Password*</label>
            <input
              placeholder="Confirm your password"
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              {...register("confirmPassword")}
              autoComplete="new-password"
              className="mt-1 w-full rounded-md border overflow-hidden text-ellipsis whitespace-nowrap px-3 py-2 shadow-sm focus:ring-1 focus:ring-indigo-700 focus:outline-none"
              // onCopy={(e) => e.preventDefault()}
              // onPaste={(e) => e.preventDefault()}
              // className={`input mt-1 w-full ${errors.confirmPassword ? "border-red-500" : ""}`}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute top-9 right-3 text-gray-500"
              >
                {/* {showConfirmPassword ? (
                  <EyeClosed />
                ) : (
                  <FontAwesomeIcon icon={faEye} />
                )} */}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {apiError && (
            <p className="text-center text-sm text-red-500">{apiError}</p>
          )}

          <Button
            type="submit"
            className="w-full cursor-pointer"
            disabled={isButtonDisabled}
          >
            {isSubmitting ? "Registering..." : "Create Account"}
          </Button>

          {/* <PixelButton
            type="submit"
            className="w-full"
            disabled={isButtonDisabled}
          >
            {isSubmitting ? "Registering..." : "Create Account"}
          </PixelButton> */}

          <p className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-blue-600 hover:underline">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
