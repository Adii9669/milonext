"use client";

import Link from "next/link";

import Button from "@/src/shared/components/ui/RetroButton";

import { motion } from "framer-motion";

import AnimatedHeroTitle from "../../components/HeroTitle";

import { useHeroMotion } from "../../hooks/userHeroMotion";
import BuiltDifferent from "./BuiltDifferentSection";

export default function HeroSection() {
  const {
    mainTitleY,

    mainTitleOpacity,
  } = useHeroMotion();

  return (
    <div>
      <section
        className="relative   flex
    justify-center
     min-h-screen overflow-hidden bg-background text-foreground"
      >
        <div
          className="
          relative
          z-10
          flex
          min-h-screen
          flex-col
          items-center
          justify-center
          px-6
          text-center
        "
        >
          <p className="mb-6 text-xs uppercase tracking-[0.6em] text-primary">
            Built For Hackers
          </p>

          <div className=" group cursor-pointer ">
            <AnimatedHeroTitle />
          </div>

          <p
            className="
            mt-8
            max-w-2xl
            text-[clamp(1rem,1.2vw,1.25rem)]
            text-text-secondary "
          >
            Developer-first realtime communication platform engineered for
            performance and scale.
          </p>

          <div className="mt-12 flex gap-6">
            <Button className="cursor-pointer" variant="type2">
              <Link href="/auth/register">Sign Up</Link>
            </Button>

            <button
              className="
              border
              border-border
              px-10
              py-3
              uppercase
              tracking-widest
              text-foreground
              transition
              hover:bg-surface-hover
            "
            >
              Learn More
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
