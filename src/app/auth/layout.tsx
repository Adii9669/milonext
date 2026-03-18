import Navbar from "@/src/components/Navbar/navbar";
import StarfieldBg from "@/src/components/SolarSystem/StarsFeild";

// no navbar here — auth pages are standalone
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <StarfieldBg />

      <Navbar />

      {children}
    </>
  );
}
