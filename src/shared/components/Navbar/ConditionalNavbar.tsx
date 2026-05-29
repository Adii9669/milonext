"use client";
import { usePathname } from "next/navigation";
import Navbar from "./navbar";

export default function ConditionalNavbar() {
  const pathname = usePathname() || "/";

  // Show navbar only on the root or /home path
  if (pathname === "/" || pathname === "/home") {
    return <Navbar />;
  }

  return null;
}
