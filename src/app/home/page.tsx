"use client";

import SmoothScrollProvider from "@/src/components/smoothScrooling/SmoothScrollProvider";
import Button from "@/src/components/ui/RetroButton";
import Link from "next/link";

import { useEffect, useState } from "react";

export default function HOME() {
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <SmoothScrollProvider>
      <div>
        <section className="min-h-screen bg-[#0F0F12] text-[#F5F5F5] flex flex-col items-center justify-center text-center px-6">
          {/* Top Micro Label */}
          <p className="text-xs tracking-[0.6em] uppercase text-[#00E5FF] mb-6">
            Built For Hackers
          </p>

          {/* Massive Typography Container */}
          <div className="relative">
            {/* Main Text */}
            <h1 className="text-[18vw] font-black leading-none text-[#C89BB5]">
              ONECHAT
            </h1>

            {/* Outline Offset Layer */}
            <h1
              className="absolute top-3 left-3 text-[18vw] font-black leading-none text-transparent opacity-25"
              style={{ WebkitTextStroke: "2px #C89BB5" }}
            >
              ONECHAT
            </h1>
          </div>

          {/* Subtitle */}
          <p className="mt-8 max-w-2xl text-white/60 text-lg">
            Developer-first realtime communication platform engineered for
            performance and scale.
          </p>

          {/* CTA Buttons */}
          <div className="mt-12 flex gap-6">
            <Button variant="type2">
              <Link href="/auth/register">Sign Up</Link>
            </Button>

            <button className="px-10 py-3 border border-white/30 uppercase tracking-widest">
              Learn More
            </button>
          </div>
        </section>
        {/* MASSIVE DIVIDER */}
        <section className="bg-[#0F0F12] py-40 overflow-hidden">
          <div className="relative">
            {/* Huge Faded Background Word */}

            <h2
              className="
            text-[30vw] font-black 
            text-transparent translate-y-[-10px]
            text-center opacity-10 select-none"
              style={{ WebkitTextStroke: "2px #C89BB5" }}
            >
              BUILT
            </h2>

            {/* Foreground Word */}
            <h2
              className="absolute inset-0 flex items-center justify-center 
      text-6xl md:text-8xl font-black text-[#C89BB5] uppercase tracking-widest"
            >
              Built Different
            </h2>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section className="bg-[#0F0F12] text-[#F5F5F5] px-10 py-32">
          {/* Section Title */}
          <h2 className="text-5xl font-black uppercase tracking-widest mb-20 text-center">
            What You Get
          </h2>

          {/* Grid */}
          <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <div
              className="border-2 border-white p-8 
      shadow-[8px_8px_0px_0px_white]"
            >
              <h3 className="text-2xl font-black uppercase text-[#C89BB5]">
                Realtime Core
              </h3>

              <p className="mt-4 text-white/60">
                Ultra-fast messaging engine built with WebSockets and Go backend
                performance.
              </p>
            </div>

            {/* Feature 2 */}
            <div
              className="border-2 border-white p-8 
      shadow-[8px_8px_0px_0px_white]"
            >
              <h3 className="text-2xl font-black uppercase text-[#C89BB5]">
                Crew Channels
              </h3>

              <p className="mt-4 text-white/60">
                Structured group communication with scalable architecture.
              </p>
            </div>

            {/* Feature 3 */}
            <div
              className="border-2 border-white p-8 
      shadow-[8px_8px_0px_0px_white]"
            >
              <h3 className="text-2xl font-black uppercase text-[#C89BB5]">
                Direct Messages
              </h3>

              <p className="mt-4 text-white/60">
                Secure private messaging optimized for speed and clarity.
              </p>
            </div>
          </div>
        </section>
        {/* TECH STACK STRIP */}
        <section className="bg-[#0A0A0C] py-16 overflow-hidden border-t border-b border-white/10">
          <div className="whitespace-nowrap animate-marquee text-[6vw] font-black uppercase tracking-widest text-[#00E5FF]">
            <span className="mx-12">GO</span>
            <span className="mx-12">WEBSOCKET</span>
            <span className="mx-12">NEXTJS</span>
            <span className="mx-12">PRISMA</span>
            <span className="mx-12">NEONDB</span>

            {/* duplicate for seamless loop */}
            <span className="mx-12">GO</span>
            <span className="mx-12">WEBSOCKET</span>
            <span className="mx-12">NEXTJS</span>
            <span className="mx-12">NEONDB</span>
          </div>
        </section>
        {/* FINAL CTA */}
        <section className="bg-[#0F0F12] py-40 px-6 text-center">
          <div className="relative inline-block">
            {/* Giant Background Word */}
            <h2
              className="text-[22vw] font-black text-transparent opacity-10 select-none"
              style={{ WebkitTextStroke: "2px #C89BB5" }}
            >
              START
            </h2>

            {/* Foreground Text */}
            <h2
              className="absolute inset-0 flex items-center justify-center 
      text-6xl md:text-8xl font-black text-[#C89BB5] uppercase tracking-widest"
            >
              Start Building
            </h2>
          </div>

          {/* Button */}
          <div className="mt-16">
            <button
              className="px-12 py-4 border-2 border-white
      shadow-[10px_10px_0px_0px_white]
      hover:translate-x-[4px] hover:translate-y-[4px]
      hover:shadow-[5px_5px_0px_0px_white]
      transition-all uppercase tracking-[0.3em]"
            >
              Create Account
            </button>
          </div>
        </section>
      </div>
    </SmoothScrollProvider>
  );
}
