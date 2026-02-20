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
import { useAuth } from "@/src/context/AuthContext";
import loginBg from "@/src/assets/space.png";
import useCheckUsername from "@/src/hooks/ useCheckUsername";
import { useRedirectValidator } from "@/src/hooks/redirectValidator";
import { Button } from "@/src/components/ui/button";
import AuthModal from "@/src/components/Modals/AuthModal";
import { Input } from "@/src/components/ui/input";

// 1. We define the validation schema
const signupSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters.")
      .max(20, "Username must be 20 characters or less."),
    email: z.email("Please enter a valid email address."),
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
    mode: "onChange", // Validate when a user leaves a field
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
      // console.log("Username available");
      return <div>hello</div>;
    }
    if (isAvailable === true && usernameValue && usernameValue.length >= 3) {
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
    <div className="flex relative min-h-screen items-center justify-center  p-3">
      <div
        className="min-h-screen absolute inset-0"
        style={{
          backgroundImage: `url(${loginBg.src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      ></div>
      <div
        className="
        flex  items-center  text-2xl font-bold
        fixed top-5 left-10 flex items-center gap-3 z-50"
      >
        <Link href="/" className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 640 640"
            className="w-8 h-8 fill-[#F8F8FF] hover:scale-110 transition-all duration-200"
          >
            <path d="M399.7 160.2C410.8 149.1 515.2 83.2 538.9 107C562.6 130.7 496.8 235.1 485.7 246.2C474.6 257.3 446.3 247.1 422.6 223.3C398.8 199.6 388.5 171.3 399.7 160.2zM205.9 132.1C169.6 111.5 118 88.6 101.6 105.1C85 121.7 108.7 174.5 129.5 210.8C148 178.6 174.3 151.5 205.9 132.1zM502.7 238C506 249.3 505.4 258.7 500 264.1C479.7 284.4 412.5 237.1 390.7 194C372.7 161.7 379.6 140.6 405.6 145.3C411.3 141.7 417.9 137.7 425.2 133.7C395.4 118.2 361.6 109.4 325.7 109.4C206.6 109.4 110.1 205.9 110.1 325C110.1 444 206.6 540.6 325.7 540.6C444.8 540.6 541.3 444.1 541.3 325C541.3 286.6 531.2 250.5 513.6 219.2C509.7 226.2 506 232.5 502.7 238z" />
          </svg>
          <span className="text-2xl font-bold text-[#F8F8FF]"> CONNECT</span>
        </Link>
      </div>
      <AuthModal
        title=" Create Your Account"
        subtitle="Sign in to continue to ONECHAT"
        variant="retro"
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block ">Username*</label>
            <Input
              {...register("username")}
              autoComplete="username"
              variant="retro"
            />
            {errors.username ? (
              <p className="mt-1 text-sm text-red-500">
                {errors.username.message}
              </p>
            ) : (
              renderUsernameStatus()
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block ">Email*</label>
            <Input
              type="email"
              autoComplete="email"
              {...register("email")}
              variant="retro"
            />

            {errors.email && (
              <p className="mt-1 text-sm text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="relative">
            <label className="block  ">Password*</label>
            <Input
              type={showPassword ? "text" : "password"}
              {...register("password")}
              autoComplete="new-password"
              variant="retro"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="
                 absolute right-4 top-[37px]
                 text-gray-600 hover:text-gray-300 transition
                cursor-pointer
                "
            >
              {showPassword ? <EyeClosed /> : <FontAwesomeIcon icon={faEye} />}
            </button>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block ">Confirm Password*</label>
            <Input
              type={showConfirmPassword ? "text" : "password"}
              {...register("confirmPassword")}
              variant="retro"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {apiError && (
            <p className="text-center text-sm text-red-500">{apiError}</p>
          )}

          {/* Styled Button */}
          <Button type="submit" variant="brutal" size="full">
            <p className="text-bold text-1xl">
              {isSubmitting ? "Registering..." : "Create Account"}
            </p>
          </Button>

          <p className="text-center text-sm ">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="underline  text-blue-600 font-semibold"
            >
              Sign In
            </Link>
          </p>
        </form>
      </AuthModal>
    </div>
  );
}
