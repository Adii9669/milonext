"use client";

import { motion } from "framer-motion";

import { useHeroMotion } from "../animations/hero.motion";

export default function AnimatedHeroTitle() {
  const { ref, opacity, y, blur } = useHeroMotion();
  return (
    <div className="relative inline-block">
      {/* Main Title Layer */}

      <motion.h1
        ref={ref}
        className="
        relative
        font-chillax
        text-[16rem] 
        font-bold
        z-10  home-hero-title 
      "
      >
        ONECHAT
      </motion.h1>

      {/* Shadow Layer */}
      {/* <motion.h1
        initial={TitleAnimation.initial}
        // transition={TitleAnimation.transition}
        className="
           absolute
            top-0 
            left-0 z-0
            translate-x-2
            translate-y-2
            blur-[1px]
            opacity-10
            pointer-events-none
            font-chillax
            text-[16rem]
            font-black 
            home-hero-title-shadow"
      >
        ONECHAT
      </motion.h1> */}
    </div>
  );
}
