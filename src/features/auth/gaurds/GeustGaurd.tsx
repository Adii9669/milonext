"use client";

import { ReactNode } from "react";

import { useAuth } from "../hooks/useAuth";

interface Props {
  children: ReactNode;
}

export function GuestGuard({ children }: Props) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
