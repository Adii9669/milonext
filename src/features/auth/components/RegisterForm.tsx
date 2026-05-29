"use client";

import Link from "next/link";

import AuthModal from "@/src/shared/components/Modals/AuthModal";
import { Input } from "@/src/shared/components/ui/input";
import { Button } from "@/src/shared/components/ui/button";
import { GuestGuard } from "../gaurds/GeustGaurd";
import { PasswordInput } from "./PasswordInput";
import { UsernameStatus } from "./UsernameStatus";
import { useRegister } from "../hooks/useRegister";
import Navbar from "@/src/shared/components/Navbar/navbar";
import { LOGO } from "@/src/shared/components/logo";
export function RegisterForm() {
  const {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    onSubmit,

    isChecking,
    isAvailable,
  } = useRegister();

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
        <AuthModal
          title="Create Account"
          subtitle="Join ONECHAT"
          variant="plane"
          size="md"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2 text-2xl">
              <label
                className="block mb-2 text-xl font-medium text-foreground/80"
                htmlFor="username"
              >
                Username
              </label>
              <Input
                className="bg-surface text-2xl text-foreground placeholder:text-text-muted"
                {...register("username")}
              />

              {errors.username ? (
                <p>{errors.username.message}</p>
              ) : (
                <UsernameStatus
                  isChecking={isChecking}
                  isAvailable={isAvailable}
                />
              )}
            </div>

            <div>
              <label
                className="block mb-2 text-xl font-medium text-foreground/80"
                htmlFor="email"
              >
                Email
              </label>
              <Input
                className="bg-surface text-2xl text-foreground placeholder:text-text-muted border border-border"
                type="email"
                {...register("email")}
              />

              {errors.email && <p>{errors.email.message}</p>}
            </div>

            <PasswordInput
              label="Password"
              className="text-2xl"
              register={register}
              name="password"
              error={errors.password?.message}
            />

            <PasswordInput
              label="Confirm Password"
              className="text-2xl"
              register={register}
              name="confirmPassword"
              error={errors.confirmPassword?.message}
            />

            {errors.root && <p>{errors.root.message}</p>}

            <Button
              variant="brutal"
              className="w-full text-2xl h-14"
              type="submit"
            >
              {isSubmitting ? "Creating..." : "Create Account"}
            </Button>

            <p className="text-center text-xl text-foreground/80">
              Already have account?
              <Link
                className="text-primary font-semibold  hover:underline pl-2"
                href="/auth/login"
              >
                Login
              </Link>
            </p>
          </form>
        </AuthModal>
      </div>
    </GuestGuard>
  );
}
