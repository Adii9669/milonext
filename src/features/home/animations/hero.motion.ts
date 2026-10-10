"use client";

import {
    useScroll,
    useTransform,
} from "framer-motion";

import { useRef } from "react";

export function useHeroMotion() {

    const ref = useRef(null);

    const { scrollYProgress } = useScroll({
        target: ref,

        offset: [
            "start start",
            "end start",
        ],
    });

    /*
      OPACITY
      1 -> visible
      0 -> invisible
    */

    const opacity = useTransform(
        scrollYProgress,
        [0, 0.5],
        [1, 0]
    );

    /*
      MOVE UP
    */

    const y = useTransform(
        scrollYProgress,
        [0, 0.5],
        [0, -150]
    );

    /*
      BLUR
    */

    const blur = useTransform(
        scrollYProgress,
        [0, 0.5],
        [0, 12]
    );

    return {
        ref,
        opacity,
        y,
        blur,
    };
}