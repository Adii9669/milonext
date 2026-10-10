import { Suspense } from "react";
import { CleanLoginForm } from "@/src/features/auth/components/CleanLoginForm";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <CleanLoginForm />
    </Suspense>
  );
}
