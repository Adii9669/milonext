"use client";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex sticky top-0  items-center justify-between px-10 py-5 shadow-sm bg-[rgb(200,176,255)]">
      {/* Left Logo */}
      <div
        className="text-2xl font-bold inline-block 
                hover:scale-102 
                transition-all duration-200"
      >
        <Link href="/">CONNECT</Link>
      </div>

      {/* Right Buttons */}
      <div className="flex  items-center gap-3">
        <Link
          // target="_blank"
          rel="noopener noreferrer"
          href="/auth/login"
          className="text-2xl font-bold inline-block 
                hover:scale-102 
                transition-all duration-200 underline"
        >
          LOGIN
        </Link>

        <div className="flex gap-3 items-center">
          <button className="border-2 upercase font-bold border-[#1a1a40] px-6 py-1 rounded-full bg-[#f6f5f0] shadow-[4px_4px_0px_0px_#1a1a40] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#1a1a40] transition-all">
            <Link
              // target="_blank"
              rel="noopener noreferrer"
              href="/auth/register"
            >
              Register
            </Link>
          </button>
        </div>
      </div>
    </nav>
  );
}
