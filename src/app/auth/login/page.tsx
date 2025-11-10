"use client";

import { useState } from "react";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useForm } from "react-hook-form";
// import PixelButton from "@/components/PixelButton/page";
import loginBg from "@/src/assets/login-bg.jpg";
import { useAuth } from "@/src/context/page";
import { EyeClosed } from "lucide-react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import GuestRouter from "@/src/components/GuestRouter/page";

const loginSchema = z.object({
  username: z.string().min(1, "Please enter your username or email."),
  password: z.string().min(1, "Password cannot be empty."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function SignInPage() {
  // const router = useRouter();
  //
  const router = useRouter();
  const { login } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/connect";
  const status = searchParams.get("status");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    console.log("Form Payload:", data);
    setApiError(null);
    try {
      await login(data.username, data.password);

      router.push(callbackUrl);
    } catch (err) {
      if (err instanceof Error) {
        setApiError(err.message);
      } else {
        setApiError("An unexpected error occurred during login.");
      }
    }
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GuestRouter>
        <div
          style={{
            backgroundImage: `url(${loginBg.src})`, // .src is required for imported images
            backgroundSize: "cover", // cover the whole area
            backgroundPosition: "center",
            minHeight: "100vh", // full screen height
          }}
          className="bg-beige flex min-h-screen flex-col items-center justify-center px-4 pt-23"
        >
          {/* Card Box */}
          <div className="w-full max-w-md space-y-6 rounded-md bg-white p-8 shadow-md">
            {/* Heading */}
            <h2 className="item-centre pr-6 text-center text-4xl font-bold text-gray-900">
              Sign In
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Username/Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  id="username"
                  type="text"
                  autoComplete="username email"
                  {...register("username")}
                  placeholder="Username or Email address..."
                  className="mt-1 w-full rounded-md border px-3 py-2 shadow-sm focus:ring-1 focus:ring-indigo-700 focus:outline-none"
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="mt-1 w-full rounded-md border px-3 py-2 shadow-sm focus:ring-1 focus:ring-indigo-700 focus:outline-none"
                  {...register("password")}
                />
                <div className="absolute inset-y-11 right-0 flex items-center pr-3 text-gray-500">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    // className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
                    className="absolute inset-y-0 top-0 right-0 flex items-center pr-3 text-gray-500"
                  >
                    {showPassword ? (
                      <EyeClosed />
                    ) : (
                      <FontAwesomeIcon icon={faEye} />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {status === "registered" && (
                <div
                  style={{
                    padding: "1rem",
                    backgroundColor: "#d4edda",
                    color: "#155724",
                    border: "1px solid #c3e6cb",
                    borderRadius: "0.25rem",
                  }}
                >
                  Registration successful! Please check your email to verify
                  your account before logging in.
                </div>
              )}
              {apiError && (
                <p className="text-center text-sm text-red-500">{apiError}</p>
              )}

              {/* Sign In Button */}
              <Button
                type="submit"
                className="hover:pointer w-full cursor-pointer"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Logging..." : "Login"}
              </Button>
              {/*<PixelButton
            //   type="submit"
            //   className="hover:pointer w-full"
            //   disabled={isSubmitting}
            // >
                // 
              {isSubmitting ? "Signing In..." : "Sign in"}
            </PixelButton>
              */}
            </form>
            {/* Divider 
            <div className="my-6 flex items-center">
             <div className="flex-grow border-t border-gray-300" />
             <span className="mx-4 text-sm text-gray-500">Or continue with</span>
             <div className="flex-grow border-t border-gray-300" />

          </div>
           */}
            <p className=" pl-1 text-sm text-gray-600">
              Not a member?{" "}
              <Link
                href="/auth/signUp"
                className="text-indigo-600 hover:underline"
              >
                {" "}
                Register Now!!!
              </Link>
            </p>
          </div>
        </div>
      </GuestRouter>
    </Suspense>
  );
}
