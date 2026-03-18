"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const crewFeatures = [
  {
    title: "Make Your Crew Chats More Fun",
    description:
      "Your crew. Your rules. One place to talk, plan, and move together. Built for the people you actually talk to.",
    icon: "⚡",
  },
  {
    title: "Realtime Messages. Zero Lag.",
    description:
      "Ultra-fast messaging engine built with WebSockets. Every message lands instantly — no refresh, no delay.",
    icon: "💬",
  },
  {
    title: "Crew Channels Built to Scale",
    description:
      "Structured group communication with roles, spaces, and threads. Built for teams that move fast.",
    icon: "👥",
  },
  {
    title: "Private. Secure. Direct.",
    description:
      "End-to-end direct messages optimized for speed and clarity. Your conversations stay yours.",
    icon: "🔒",
  },
];

// ✅ progress dot extracted as its own component so hooks are called at top level
function ProgressDot({
  index,
  total,
  scrollYProgress,
}: {
  index: number;
  total: number;
  scrollYProgress: any;
}) {
  const bg = useTransform(
    scrollYProgress,
    [index / total, (index + 1) / total],
    ["rgba(255,255,255,0.2)", "rgba(200,155,181,1)"],
  );

  return (
    <motion.div
      className="w-2 h-2 rounded-full"
      style={{ backgroundColor: bg }}
    />
  );
}

export default function CrewSection() {
  const stickyRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: stickyRef,
    offset: ["start start", "end end"],
  });
  const totalCards = crewFeatures.length;

  // ✅ -75% moves 4 cards: each card = 100vw, so 3 slides = -300vw = -75% of 400vw total
  const x = useTransform(
    scrollYProgress,
    [0, 1],
    ["0vw", `-${(totalCards - 1) * 98}vw`],
  );
  const textOpacity = useTransform(
    scrollYProgress,
    [0, 0.1, 0.8, 1],
    [0, 1, 1, 0],
  );

  return (
    <>
      {/* ─── HORIZONTAL SCROLL SECTION ─── */}
      <div
        ref={stickyRef}
        style={{ blockSize: `${crewFeatures.length * 100}vh` }}
        className="relative bg-[#0F0F12]"
      >
        {/* sticky viewport */}
        <div className="sticky top-0 h-screen overflow-hidden flex items-center">
          {/* scroll hint */}
          <motion.p
            style={{ opacity: textOpacity }}
            className="
    absolute top-8 left-1/2
    -translate-x-1/2 text-white/30 text-xs
    uppercase tracking-widest z-10
  "
          >
            scroll to explore
          </motion.p>

          {/* ✅ progress dots — extracted component, no hooks in map */}
          <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-10">
            {crewFeatures.map((_, i) => (
              <ProgressDot
                key={i}
                index={i}
                total={crewFeatures.length}
                scrollYProgress={scrollYProgress}
              />
            ))}
          </div>

          {/* sliding track */}
          <motion.div
            style={{ x }}
            className="flex w-full will-change-transform"
          >
            {crewFeatures.map((feature, index) => (
              <div
                key={index}
                className="min-w-full h-screen flex items-center px-10 md:px-20"
              >
                <div
                  className="
                  w-full max-w-6xl mx-auto
                  bg-[#151518]
                  border border-white/10
                  rounded-3xl
                  flex items-center gap-10
                  px-10 py-10
                "
                >
                  {/* LEFT — mockup placeholder */}
                  <div className="w-1/2 flex shrink-0">
                    <div
                      className="
                      w-full aspect-video
                      bg-[#1e1f3b]
                      rounded-2xl
                      flex items-center justify-center
                    "
                    >
                      <span className="text-6xl">{feature.icon}</span>
                    </div>
                  </div>

                  {/* RIGHT — text */}
                  <div className="w-1/2 flex flex-col gap-6">
                    <p className="text-[#C89BB5] text-xs font-bold uppercase tracking-[0.2em]">
                      0{index + 1} / 0{crewFeatures.length}
                    </p>
                    <h2 className="text-4xl md:text-5xl font-black uppercase text-white leading-tight">
                      {feature.title}
                    </h2>
                    <p className="text-white/60 text-base leading-relaxed">
                      {feature.description}
                    </p>
                    <button
                      className="
                      w-fit border border-white/30
                      hover:border-white hover:bg-white hover:text-black
                      text-white text-xs font-bold uppercase tracking-widest
                      px-8 py-3 rounded-full
                      transition-all duration-200
                    "
                    >
                      Get Started
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </>
  );
}
