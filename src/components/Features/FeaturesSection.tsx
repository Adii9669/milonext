"use client";

import { motion } from "framer-motion";

const features = [
  {
    title: "Crew Chat",
    description: "Create crews and chat with your team in realtime.",
    hoverText:
      "Group conversations, roles, and shared spaces — built for teams that move fast.",
    icon: "⚡",
    href: "/auth/register",
  },
  {
    title: "Direct Messages",
    description: "Private conversations with blazing fast delivery.",
    hoverText:
      "End-to-end messaging with read receipts, media sharing, and zero lag.",
    icon: "💬",
    href: "/auth/register",
  },
  {
    title: "Friends & Network",
    description: "Add friends, manage requests, and build your network.",
    hoverText:
      "Send requests, accept connections, and grow your circle all in one place.",
    icon: "🌐",
    href: "/auth/register",
  },
];

// parent controls stagger timing
const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.2, // each card fires 0.2s after previous
      delayChildren: 0.1,
    },
  },
};

// each card's animation states
const cardVariant = {
  hidden: { opacity: 0, y: 80 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export default function FeaturesSection() {
  return (
    <section className="bg-[#0F0F12] text-white py-40 px-2">
      <div className="max-w-7xl mx-auto text-center">
        <h2
          className="text-6xl font-black mb-20 uppercase tracking-widest"
          style={{
            fontFamily: "var(--font-sigmar)",
            fontWeight: "300",
          }}
        >
          Features
        </h2>

        {/* parent — owns the stagger, re-triggers every scroll */}
        <motion.div
          className="grid md:grid-cols-3 h-120 gap-10"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.2 }} // re-animates every scroll
          style={{
            fontFamily: "var(--font-gasoek)",
            fontWeight: "100",
          }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              // variants={cardVariant} // no delay needed — parent handles it
              whileHover={{
                x: -8,
                y: -4,
                boxShadow: "6px 6px 1px 1px white",
                transition: { duration: 0.12, ease: "easeOut" },
              }}
              transition={{ duration: 0.12, ease: "easeOut" }} // hover exit speed
              className="
                group
                border border-white
                rounded-xl
                bg-[#151518]
                cursor-default
                flex flex-col
                min-h-[300px]
                overflow-hidden
              "
            >
              {/* content area — swaps on hover */}
              <div className="relative flex-1">
                {/* default state */}
                <div
                  className="
                  absolute inset-0
                  flex flex-col items-center justify-center p-8
                  transition-opacity duration-150
                  group-hover:opacity-0
                "
                >
                  <span className="text-3xl mb-5">{feature.icon}</span>
                  <h3 className="text-2xl font-black text-[#C89BB5] uppercase mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-white/60 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* hover state */}
                <div
                  className="
                  absolute inset-0
                  flex items-center justify-center p-8
                  opacity-0 group-hover:opacity-100
                  transition-opacity duration-150
                "
                >
                  <p
                    className="
                    text-[#C89BB5] font-bold text-base leading-relaxed text-center
                    translate-y-3 group-hover:translate-y-0
                    transition-transform duration-150
                  "
                  >
                    {feature.hoverText}
                  </p>
                </div>
              </div>

              {/* view button — always visible at bottom */}
              <div className="p-5 pt-0">
                <button
                  onClick={() => (window.location.href = feature.href)}
                  className="
                    w-full cursor-pointer
                    border border-white/20 group-hover:border-white
                    text-white/50 group-hover:text-white
                    text-xs font-bold uppercase tracking-[0.2em]
                    py-3 rounded-lg
                    transition-colors duration-150
                  "
                >
                  VIEW
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
