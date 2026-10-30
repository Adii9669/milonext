"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Home-page smooth scrolling.
 *
 * Lenis replaces the native wheel scroll with interpolated momentum, which
 * gives the page that continuous "keep scrolling" feel. GSAP ScrollTrigger
 * still owns every animation on the landing page, so we drive Lenis from the
 * GSAP ticker and notify ScrollTrigger on every Lenis frame. That keeps the
 * pinned process/project scenes perfectly in sync with the smoothed scroll.
 */
export default function SmoothScrollProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (prefersReducedMotion.matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      lerp: 0.09,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.15,
      autoRaf: false,
      autoResize: true,
      // Let nav/footer anchors glide instead of jumping, leaving room for the
      // fixed 60px navbar so section headings are never hidden underneath it.
      anchors: {
        offset: 80,
        duration: 1.1,
        easing: (t) => 1 - Math.pow(1 - t, 3),
      },
    });

    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    // ScrollTrigger inserts/removes pin spacers on refresh; keep Lenis's
    // measured scroll height in sync with those layout changes.
    const onRefresh = () => lenis.resize();
    ScrollTrigger.addEventListener("refresh", onRefresh);

    // One RAF loop for both scroll and animation.
    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const refresh = () => ScrollTrigger.refresh();
    const refreshFrame = window.requestAnimationFrame(refresh);
    if (document.fonts?.ready) {
      document.fonts.ready.then(refresh).catch(() => {});
    }
    window.addEventListener("load", refresh);

    return () => {
      window.cancelAnimationFrame(refreshFrame);
      window.removeEventListener("load", refresh);
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      ScrollTrigger.removeEventListener("refresh", onRefresh);
      lenis.off("scroll", onScroll);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
