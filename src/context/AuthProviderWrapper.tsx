// "use client";

import { Suspense } from "react";
import { AuthProvider } from "./page"; // adjust the path if needed

export default function AuthProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div>Loading session...</div>}>
      <AuthProvider>{children}</AuthProvider>
    </Suspense>
  );
}
