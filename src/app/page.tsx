"use client";

import Navbar from "@/src/shared/components/Navbar/navbar";
import HOME from "./home/page";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
// import { useAuth } from "../context/AuthContext";
import { useAuth } from "../features/auth/hooks/useAuth";


export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (user) {
      router.replace("/connect");
    }
  }, [user, loading, router]);

  if (loading) return null;

  return (
    <div>
      <Navbar />
      <HOME />
    </div>
  );
}
