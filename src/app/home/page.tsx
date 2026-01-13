"use client";
import Image from "next/image";
import Link from "next/link";

export default function HOME() {
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return (
    <div className="min-h-screen w-full bg-[rgb(200,176,255)] flex flex-col relative overflow-hidden">
      {/* Main Content */}
      <div className="flex-grow flex flex-col items-center justify-center relative z-10 ">
        {/* The "WALRUS" Pill Badge - Rotated & Absolute */}
        <div className="absolute top-[180px] left-[65%] md:left-[25%] -rotate-8 z-39">
          <div className="bg-[#a5f3fc] border-2 border-[#1a1a40] px-6 py-1 rounded-full shadow-[5px_5px_0px_0px_#1a1a40]">
            <span className="font-black text-xl text-[#1a1a40] uppercase tracking-tighter">
              MILO
            </span>
          </div>
        </div>

        {/* The Main "HAULOUT" Text */}
        {/* We use specific text-shadow and text-stroke CSS here */}
        <h1
          className="text-[18vw] leading-[0.8] font-black text-[#f6f5f0] tracking-tighter select-none"
          style={{
            fontFamily: '"Anton", "Impact", sans-serif',
            transform: "skewY(-1deg)",
            WebkitTextStroke: "4px #1a1a40",
          }}
        >
          CONNECT
        </h1>

        {/* The "HACKATHON" Pill Badge - Rotated the other way */}
        <div className="absolute bottom-[20%] right-[10%] rotate-6 z-20">
          <div className="bg-[#fca5a5] border-2 border-[#1a1a40] px-8 py-2 rounded-full shadow-[6px_6px_0px_0px_#1a1a40]">
            <span className="font-black text-2xl text-[#1a1a40] uppercase tracking-widest">
              Hackathon
            </span>
          </div>
        </div>

        {/* Date Text */}
        <div className="w-full max-w-4xl px-2 mt-4">
          <p
            className="text-[#1a1a40] font-black text-4xl uppercase tracking-tighter"
            style={{ fontFamily: '"Impact", sans-serif' }}
          >
            {today}
          </p>
        </div>
      </div>

      {/* Placeholder for Walruses (Bottom) */}
      {/* Since we don't have the walrus images, we use rounded shapes to mimic them */}
      <div className="absolute bottom-[-50px] w-full flex justify-center gap-4 md:gap-10 items-end pointer-events-none">
        <div className="w-32 h-32 bg-[#fca5a5] rounded-t-full border-4 border-[#1a1a40]"></div>
        <div className="w-40 h-48 bg-[#86efac] rounded-t-full border-4 border-[#1a1a40]"></div>
        <div className="w-56 h-64 bg-[#a5f3fc] rounded-t-full border-4 border-[#1a1a40] z-10 relative bottom-[-10px]"></div>
        <div className="w-40 h-48 bg-[#bef264] rounded-t-full border-4 border-[#1a1a40]"></div>
        <div className="w-32 h-32 bg-[#93c5fd] rounded-t-full border-4 border-[#1a1a40]"></div>
      </div>
    </div>
  );
}
