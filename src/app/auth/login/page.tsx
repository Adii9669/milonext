"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { useSearchParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useForm } from "react-hook-form";
import loginBg from "@/src/assets/ONE-CHAT.png";
import { useAuth } from "@/src/context/AuthContext";
import { EyeClosed } from "lucide-react";
import { useRouter } from "next/navigation";
import { size, z } from "zod";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import GuestRouter from "@/src/components/GuestRouter/page";
// import AuthModal from "@/src/components/Modals/AuthModal";
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
      <div className="min-h-screen bg-black flex items-center justify-center p-4 overflow-hidden">
        <div className="w-full max-w-5xl rounded-3xl overflow-hidden
         bg-white shadow-2xl border border-white/20 grid md:grid-cols-2">
          <div className="p-8 md:p-12 flex flex-col justify-center">
            <div className="mb-8">
              <div className="text-2xl font-bold">IYSES</div>
            </div>
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-zinc-900">Welcome Back!</h1>
              <p className="mt-2 text-sm text-zinc-500">
               Interact with your friends in a whole new way. Sign in to continue your cosmic journey through the Miloverse.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-zinc-700">Email or Username</label>
                <Input
                  {...register("username")}
                  type="text"
                  placeholder="Enter your email"
                  variant="retro"
                  className="mt-2"
                />
                {errors.username && (
                  <p className="mt-1 text-xs text-red-500">{errors.username.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-700">Password</label>
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
                    {showPassword ? <EyeClosed size={18} /> : <FontAwesomeIcon icon={faEye} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
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

              <Button type="submit" className="w-full bg-zinc-900 text-white hover:bg-zinc-800">
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <p className="mt-5 text-sm text-zinc-500">
              Don't have an account?{' '}
              <Link href="/auth/register" className="text-blue-700 font-semibold hover:underline">
                Register
              </Link>
            </p>
          </div>

          <div className="hidden md:block bg-zinc-100">
            <div
              className="h-full w-full bg-cover bg-center"
              style={{ backgroundImage: `url(${loginBg.src})` }}
            >
              <div className="h-full w-full bg-liner-to-b from-zinc-50/70 to-zinc-900/20" />
            </div>
          </div>
        </div>
      </div>
    </GuestRouter>
  );
}
