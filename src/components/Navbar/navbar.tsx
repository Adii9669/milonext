"use client";
import Link from "next/link";
import RetroButton from "../ui/RetroButton";

export default function Navbar() {
  return (
    <nav className="flex  top-0 z-50 items-center justify-between px-10 py-5 shadow-sm bg-[#0F0F12]">
      {/* Left Logo */}
      <div
        className="
        flex  items-center  text-2xl font-bold
        fixed top-5 left-10 flex items-center gap-3 z-50"
      >
        <Link href="/" className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 640 640"
            className="w-8 h-8 fill-[#F8F8FF] hover:scale-110 transition-all duration-200"
          >
            <path d="M399.7 160.2C410.8 149.1 515.2 83.2 538.9 107C562.6 130.7 496.8 235.1 485.7 246.2C474.6 257.3 446.3 247.1 422.6 223.3C398.8 199.6 388.5 171.3 399.7 160.2zM205.9 132.1C169.6 111.5 118 88.6 101.6 105.1C85 121.7 108.7 174.5 129.5 210.8C148 178.6 174.3 151.5 205.9 132.1zM502.7 238C506 249.3 505.4 258.7 500 264.1C479.7 284.4 412.5 237.1 390.7 194C372.7 161.7 379.6 140.6 405.6 145.3C411.3 141.7 417.9 137.7 425.2 133.7C395.4 118.2 361.6 109.4 325.7 109.4C206.6 109.4 110.1 205.9 110.1 325C110.1 444 206.6 540.6 325.7 540.6C444.8 540.6 541.3 444.1 541.3 325C541.3 286.6 531.2 250.5 513.6 219.2C509.7 226.2 506 232.5 502.7 238z" />
          </svg>
          <span className="text-2xl font-bold text-[#F8F8FF]"> CONNECT</span>
        </Link>
      </div>

      {/* Right Buttons */}
      <div
        className="flex  items-center gap-3
        fixed top-5 right-10 flex items-center gap-3 z-50
      
      "
      >
        <RetroButton variant="type1">
          <Link
            // target="_blank"
            rel="noopener noreferrer"
            href="/auth/login"
            className="text-2xl font-bold  
          inline-block 
          hover:scale-110
          transition-all duration-200"
          >
            Log In
          </Link>
        </RetroButton>

        {/* <div className="flex gap-3 items-center">
          <button className="border-2 upercase font-bold border-[#1a1a40] px-6 py-1 rounded-full bg-[#f6f5f0] shadow-[4px_4px_0px_0px_#1a1a40] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#1a1a40] transition-all">
            <Link
              // target="_blank"
              rel="noopener noreferrer"
              href="/auth/register"
            >
              Register
            </Link>
          </button> */}
        {/* </div> */}
      </div>
    </nav>
  );
}
