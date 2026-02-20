"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { useSearchParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useForm } from "react-hook-form";
import loginBg from "@/src/assets/space.png";
import { useAuth } from "@/src/context/AuthContext";
import { EyeClosed } from "lucide-react";
import { useRouter } from "next/navigation";
import { size, z } from "zod";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import GuestRouter from "@/src/components/GuestRouter/page";
import AuthModal from "@/src/components/Modals/AuthModal";
import { Input } from "@/src/components/ui/input";

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
    setError,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    // console.log("Form Payload:", data);
    setApiError(null);
    try {
      await login(data.username, data.password);
      console.log("Login successful, redirecting to:", callbackUrl);
      router.push(callbackUrl);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";

      // Example: if backend says invalid credentials
      setError("username", {
        type: "server",
        message: message,
      });
    }
  };
  return (
    <GuestRouter>
      <div
        className="min-h-screen flex items-center justify-center px-6 bg-cover bg-center"
        style={{ backgroundImage: `url(${loginBg.src})` }}
      >
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
          title="Welcome Back"
          subtitle="Sign in to continue to ONECHAT"
          variant="retro"
          size="md"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-sm  mb-2">Email or Username *</label>

              <Input
                {...register("username")}
                type="text"
                placeholder="you@example.com"
                variant="retro"
                error={!!errors.username}
              />
              {errors.username && (
                <p className="mt-2 text-sm text-red-500">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="relative">
              <label className="block text-sm  mb-2">Password *</label>

              <Input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                variant="retro"
                autoComplete="current-password"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-11 text-gray-600 hover:text-black transition"
              >
                {showPassword ? (
                  <EyeClosed size={20} />
                ) : (
                  <FontAwesomeIcon icon={faEye} />
                )}
              </button>
            </div>

            <Button type="submit" variant="brutal" size="full">
              <p className="text-bold text-1xl">
                {isSubmitting ? "Signing in..." : "Sign In"}
              </p>
            </Button>
          </form>

          <p className="text-start flex  text-sm  mt-8">
            Need an account?{" "}
            <Link
              href="/auth/register"
              className="text-blue-700 hover:underline font-semibold ml-1"
            >
              Register
            </Link>
          </p>
        </AuthModal>
      </div>
    </GuestRouter>
  );
}
