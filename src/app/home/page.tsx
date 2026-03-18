"use client";

import SmoothScrollProvider from "@/src/components/smoothScrooling/SmoothScrollProvider";
import Button from "@/src/components/ui/RetroButton";
import Link from "next/link";
import FeaturesSection from "@/src/components/Features/FeaturesSection";
import ScrollSection from "@/src/components/Features/ScrollSection";
import { useEffect, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  stagger,
  animate,
} from "framer-motion";
import { useRef } from "react";
import SolarSystemBg from "@/src/components/SolarSystem/SolarSystem";
import PlanetScrollBg from "@/src/components/SolarSystem/PlanetScroll";

export default function HOME() {
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const [scrolled, setScrolled] = useState(false);
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  // const y = useTransform(scrollYProgress, [0, 1], [200, -200]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 0.1]);
  const y = useTransform(scrollYProgress, [0, 1], [300, -300]);
  const titleY = useTransform(scrollYProgress, [0, 1], [100, -50]);
  // const titleY = useTransform(scrollYProgress, [1, 0], [100, -90]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.3], [0, 14]);
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
        <section className="relative min-h-screen bg-[#0F0F12] overflow-hidden text-white">
          <div
            className="absolute inset-0 
          "
          />
          {/* bg-[#0F0F12] */}
          <div className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-6">
            {/* Top Micro Label */}
            <p className="text-xs tracking-[0.6em] uppercase text-[#00E5FF] mb-6">
              Built For Hackers
            </p>
            <div className="relative  group cursor-pointer">
              {/* Main Text */}
              <h1
                className="
                        text-[13vw] font-black leading-none text-[#C89BB5]
                        relative z-10 transition-all duration-300 
                        group-hover:translate-y-6
                        group-hover:scale-[0.99]
                        group-hover:[text-shadow:0_0_10px_rgba(200,155,181,0.4)]
    "
                style={{
                  fontFamily: "var(--font-sigmar)",
                  fontWeight: "300",
                }}
              >
                ONECHAT
              </h1>

              {/* Layer 1 */}
              <h1
                className="
                      absolute inset-0 text-[13vw] font-black leading-none
                      text-black opacity-50 
                      translate-x--10px translate-y-6px
                      transition-all duration-300
                      group-hover:translate-x-0
                      group-hover:translate-y-0
                      group-hover:opacity-0"
                style={{
                  WebkitTextStroke: "2px #C89BB5",
                  fontFamily: "var(--font-sigmar)",
                  fontWeight: "300",
                }}
              >
                ONECHAT
              </h1>

              {/* Layer 2 */}
              <h1
                className="
                          absolute inset-0 text-[13vw] font-black leading-none
                          text-transparent opacity-20
                          --tw-translate-x: 10px; --tw-translate-y: -6px;
                          transition-all duration-300
                          group-hover:translate-x-0
                          group-hover:translate-y-0
                          group-hover:opacity-0"
                style={{
                  WebkitTextStroke: "2px #C89BB5",
                  fontFamily: "var(--font-sigmar)",
                  fontWeight: "300",
                }}
              >
                ONECHAT
              </h1>
            </div>

            {/* Subtitle */}
            <p className="mt-8 max-w-2xl text-white/60 text-[1vw]">
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
          </div>
        </section>

        {/* // Change this section in your HOME component: */}
        <section ref={ref} className="bg-[#0F0F12]  overflow-hidden relative">
          {/* ADD THIS — solar system sits behind everything */}
          <SolarSystemBg />

          <div className="relative flex items-center justify-center">
            {/* Background Word */}
            <motion.h2
              className="text-[24vw] font-black text-transparent select-none"
              style={{
                y,
                opacity,
                WebkitTextStroke: "2px #C89BB5",
              }}
            >
              BUILT
            </motion.h2>

            {/* Foreground Word */}
            <motion.h2
              style={{
                y: titleY,
                opacity: titleOpacity,
                fontFamily: "var(--font-sigmar)",
                fontWeight: "300",
              }}
              className="absolute text-[5vw] font-black text-[#C89BB5] tracking-widest"
            >
              Built Different
            </motion.h2>
          </div>
        </section>
        <section className="bg-[#0F0F12] py-30 overflow-hidden ">
          <FeaturesSection />
        </section>

        <section className="bg-[#0F0F12]">
          <PlanetScrollBg />
        </section>
        {/* FEATURES SECTION */}

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
            <Button variant="type2">
              <Link href="/auth/register">create account</Link>
            </Button>
          </div>
        </section>
        {/* TECH STACK STRIP */}
        <section className="bg-[#0A0A0C] py-16 overflow-hidden border-t border-b border-white/10">
          <div className="whitespace-nowrap animate-marquee text-[6vw] font-black uppercase tracking-widest text-[#00E5FF]">
            <span className="mx-12">GO</span>
            <span className="mx-12">WEBSOCKET</span>
            <span className="mx-12">NEXTJS</span>
            <span className="mx-12">GORM</span>
            <span className="mx-12">NEONDB</span>

            {/* duplicate for seamless loop */}
            <span className="mx-12">GO</span>
            <span className="mx-12">WEBSOCKET</span>
            <span className="mx-12">NEXTJS</span>
            <span className="mx-12">NEONDB</span>
          </div>
        </section>
      </div>
    </SmoothScrollProvider>
  );
}
