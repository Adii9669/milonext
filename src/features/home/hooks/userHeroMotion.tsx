"use client";

import { useScroll, useTransform } from "framer-motion";

import { useRef } from "react";

export function useHeroMotion() {
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const titleY = useTransform(scrollYProgress, [0, 0.7], [170, -100]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.7], [0, 12]);
  const mainTitleY = useTransform(scrollYProgress, [0, 0.2], [90, -100]);
  const mainTitleOpacity = useTransform(scrollYProgress, [0.1, 0], [0, 10]);

  return {
    ref,
    titleY,
    titleOpacity,
    mainTitleY,
    mainTitleOpacity,
  };
}
