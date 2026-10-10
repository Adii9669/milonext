import { Suspense } from "react";
import { VerifyOTPForm } from "@/src/features/auth/components/VerifyOTPForm";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <VerifyOTPForm />
    </Suspense>
  );
}