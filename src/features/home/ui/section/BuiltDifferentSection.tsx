import { motion } from "framer-motion";
import { builtDifferentAnimation } from "@/src/features/home/animations/built.animation";
import { useBuiltDifferentMotion } from "../../hooks/useBuiltDifferentMostion";

export default function BuiltDifferent() {
  const { ref, titleY, titleOpacity } = useBuiltDifferentMotion();
  return (
    <section className="relative  min-h-screen overflow-hidden bg-background text-foreground">
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
        <motion.h2 className="text-[24vw] font-black text-transparent select-none home-hero-stroke-bg">
          BUILT
        </motion.h2>

        <motion.h2
          initial={builtDifferentAnimation.initial}
          animate={builtDifferentAnimation.animate}
          className="absolute text-[5vw] font-black home-hero-accent tracking-widest"
          style={{
            y: titleY,
            opacity: titleOpacity,
            fontWeight: "600",
          }}
        >
          Built Different
        </motion.h2>
      </div>
    </section>
  );
}
