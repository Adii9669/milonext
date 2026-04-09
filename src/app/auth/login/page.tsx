"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { useSearchParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useForm } from "react-hook-form";
import loginBg from "@/src/assets/ONE-CHAT.png";
import { useAuth } from "@/src/context/AuthContext";
import { EyeClosed, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { size, z } from "zod";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import GuestRouter from "@/src/components/GuestRouter/page";
// import AuthModal from "@/src/components/Modals/AuthModal";
import { Input } from "@/src/components/ui/input";
import AuthModal from "@/src/components/Modals/AuthModal";
import StarfieldBg from "@/src/components/SolarSystem/StarsFeild";

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
        className="
      min-h-screen
       bg-black flex p-0 
       md:flex md:items-center md:justify-center md:p-4
       overflow-hidden"
      >
            <StarfieldBg />
        <AuthModal
          title="  Welcome Back!"
          subtitle="Please sign in to your account to continue. 
              Enjoy Your Journey Again!!!"
          variant="retro"
          size="md"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-bold  text-black-100">
                Email or Username
              </label>
              <Input
                {...register("username")}
                type="text"
                placeholder="Enter your email"
                variant="retro"
                className="mt-2"
              />
              {errors.username && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-bold  text-black-100">
                Password
              </label>
              <div className="relative mt-2">
                <Input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  variant="retro"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                >
                  {showPassword ? (
                    <EyeClosed size={18} />
                  ) : (
                    <FontAwesomeIcon icon={faEye} />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between text-sm text-zinc-500">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 text-blue-600" />
                Remember me
              </label>
              <Link href="#" className="text-blue-700 hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full bg-zinc-700 text-white hover:bg-zinc-900 cursor-pointer"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="mt-5 text-sm text-zinc-500">
            Don't have an account?{" "}
            <Link
              href="/auth/register"
              className="text-blue-700 font-semibold hover:underline"
            >
              Register
            </Link>
          </p>
        </AuthModal>
      </div>
    </GuestRouter>
  );
}
