"use client";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex  sticky top-0 z-50  items-center justify-between px-10 py-5 bg-white shadow-sm"> 
    {/* Left Logo */}

      <div className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-yellow-400 text-transparent bg-clip-text">
        <Link href="/">CONNECT</Link>
      </div>

      {/* Center Navigation Links */}
      <ul className="hidden md:flex gap-10 text-gray-800 font-medium">
        {["App", "About", "Blog", "Pages", "Contact"].map((item) => (
          <li key={item}>
            <Link
              href={`/${item.toLowerCase()}`}
              className="hover:text-orange-500 transition-colors"
            >
              {item}
            </Link>
          </li>
        ))}
      </ul>

      {/* Right Buttons */}
      <div className="flex items-center gap-6">
        <Link
          href="/auth/login"
          className="text-gray-800 font-medium hover:text-orange-500 transition-colors"
        >
          Login
        </Link>

        <Link
          href="/get-started"
          className="bg-gradient-to-r from-orange-500 to-yellow-400 text-white font-medium px-5 py-2 rounded-full shadow hover:opacity-90 transition"
        >
          Get Started
        </Link>
      </div>
    </nav>
  );
}
