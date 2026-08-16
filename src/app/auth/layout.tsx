import Navbar from "@/src/shared/components/Navbar/navbar";

// no navbar here — auth pages are standalone
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
