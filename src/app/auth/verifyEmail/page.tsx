import { redirect } from "next/navigation";

// OTP verification is temporarily disabled. The old verification route now
// sends users to login; restore this page when verification is re-enabled.
export default function VerifyEmailPage() {
  redirect("/login");
}
