"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { useInitializeAuth } from "@/src/features/auth/hooks/useIntializeAuth";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  useInitializeAuth();

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
