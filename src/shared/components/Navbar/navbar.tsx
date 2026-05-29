"use client";
import Link from "next/link";
import { Button } from "../ui/button";
import ThemeToggle from "../ToggleTheme";

export default function Navbar() {
  return (
    <nav
      className="flex font-chillax 
     top-0 z-50 items-center 
     justify-between px-10 py-5
      shadow-sm bg-background"
    >
      {/* Left Logo */}
      <div
        className="
        flex  item-center  text-3xl
        fixed top-5 left-10 gap-3 z-50"
      >
        <Link href="/" className="flex items-center gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 640 640"
            className="w-8 h-8 fill-foreground hover:scale-110 transition-all duration-200"
          >
            <path d="M399.7 160.2C410.8 149.1 515.2 83.2 538.9 107C562.6 130.7 496.8 235.1 485.7 246.2C474.6 257.3 446.3 247.1 422.6 223.3C398.8 199.6 388.5 171.3 399.7 160.2zM205.9 132.1C169.6 111.5 118 88.6 101.6 105.1C85 121.7 108.7 174.5 129.5 210.8C148 178.6 174.3 151.5 205.9 132.1zM502.7 238C506 249.3 505.4 258.7 500 264.1C479.7 284.4 412.5 237.1 390.7 194C372.7 161.7 379.6 140.6 405.6 145.3C411.3 141.7 417.9 137.7 425.2 133.7C395.4 118.2 361.6 109.4 325.7 109.4C206.6 109.4 110.1 205.9 110.1 325C110.1 444 206.6 540.6 325.7 540.6C444.8 540.6 541.3 444.1 541.3 325C541.3 286.6 531.2 250.5 513.6 219.2C509.7 226.2 506 232.5 502.7 238z" />
          </svg>

          {/* Animated CONNECT logo */}
          <div
            className="
            flex items-center gap-1px
            text-[1em] font-bold
            text-3xl tracking-[0.2em] 
            group cursor-pointer"
          >
            {"ONECHAT".split("").map((char, i) => (
              <span
                key={i}
                style={{ transitionDelay: `${i * 60}ms` }}
                className="
                    text-foreground
                    transition-all duration-100
                    group-hover:scale-110"
              >
                {char}
              </span>
            ))}
          </div>
        </Link>
      </div>

      {/* Right Buttons */}
      <div
        className="flex  items-center gap-3
        fixed top-5 right-10  z-50
      
      "
      >
        <ThemeToggle />
        <Button variant="type2">
          <Link rel="noopener noreferrer" href="/auth/login">
            Log In
          </Link>
        </Button>
      </div>
    </nav>
  );
}
