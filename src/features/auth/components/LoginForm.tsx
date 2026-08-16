"use client";

import Link from "next/link";

import { Button } from "@/src/shared/components/ui/button";
import { Input } from "@/src/shared/components/ui/input";

// import { PasswordInput } from "./PasswordInput";

import { useLogin } from "../hooks/useLogin";
import { GuestGuard } from "../gaurds/GeustGaurd";
import AuthModal from "@/src/shared/components/Modals/AuthModal";
import { useState } from "react";
import { EyeClosed } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import SIGNIN from "@/src/shared/components/Modals/AuthModal";
import { PasswordInput } from "./PasswordInput";
import { LOGO } from "@/src/shared/components/logo";

export function LoginForm() {
  const { register, handleSubmit, errors, isSubmitting, onSubmit } = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <GuestGuard>
      <div className="font-chillax bg-background min-h-screen flex items-center justify-center text-foreground">
        <LOGO
          href="/"
          text="ONECHAT"
          textClassName="text-3xl"
          iconClassName="w-8 h-8"
          className="flex item-center text-3xl fixed top-5 left-10 gap-3 z-50"
        ></LOGO>
        <SIGNIN
          title="  Welcome Back!"
          subtitle="Please sign in to your account to continue. 
                           Enjoy Your Journey Again!!!"
          variant="plane"
          className="bg-background text-2xl"
          size="md"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label
                className="block mb-2 
              text-xl font-medium text-foreground/80"
                htmlFor="username"
              >
                Email or Username
              </label>
              <Input
                id="username"
                className="bg-surface text-foreground placeholder:text-text-muted"
                {...register("username")}
                placeholder="Enter your email"
              />

              {errors.username && (
                <p className="text-foreground/90 mt-2 text-sm">
                  {errors.username.message}*
                </p>
              )}
            </div>

            <PasswordInput
              label="Password "
              name="password"
              register={register}
              error={errors.password?.message}
              autoComplete="new-password"
            />
            {/* <Input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="pr-10 bg-white/90 text-black placeholder:text-black"
            /> */}
            {/* <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="
      absolute
      right-3
      top-1/2
      -translate-y-1/2

      text-zinc-500
      hover:text-zinc-900
      transition-colors
    "
            >
              {showPassword ? (
                <EyeClosed size={18} />
              ) : (
                <FontAwesomeIcon icon={faEye} />
              )}
            </button> */}

            <Button type="submit" variant="brutal" size="full">
              <p className="text-bold text-xl">
                {isSubmitting ? "Signing in..." : "Sign in"}
              </p>
            </Button>
          </form>

          <p className="text-center text-xl text-text-muted">
            Don't have an account?
            <Link
              href="/auth/register"
              className="hover:underline pl-4 text-primary font-semibold"
            >
              Register
            </Link>
          </p>
        </SIGNIN>
      </div>
    </GuestGuard>
  );
}
