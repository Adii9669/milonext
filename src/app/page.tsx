"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../features/auth/hooks/useAuth";
import OnechatAuthExperience from "../features/auth/components/OnechatAuthExperience";

export default function RootLandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (user) {
      router.replace("/connect");
    }
  }, [user, loading, router]);

  if (loading) return null;

  return <OnechatAuthExperience initialMode="login" />;
}
