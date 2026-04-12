"use client";
import Navbar from "../components/Navbar/navbar";
import HOME from "./home/page";
import { useEffect } from "react";
import { useRouter } from "next/dist/client/components/navigation";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (user) {
      router.replace("/connect");
    } else {
      router.replace("/auth/login");
    }
  }, [user, loading, router]);

  return null;
  return (
    <div>
      <Navbar></Navbar>
      <HOME></HOME>
    </div>
  );
}
