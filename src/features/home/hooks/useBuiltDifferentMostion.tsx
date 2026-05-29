import { useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export function useBuiltDifferentMotion() {
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 0.3]);
  const y = useTransform(scrollYProgress, [0, 1], [300, -300]);
  const titleY = useTransform(scrollYProgress, [0, 0.7], [170, -100]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.7], [0, 12]);


  return {
    ref,
    opacity,
    y,
    titleY,
    titleOpacity,
  }
}
