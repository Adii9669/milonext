"use client";

import SmoothScrollProvider from "@/src/shared/components/smoothScrooling/SmoothScrollProvider";

import ThemeCustomizer from "@/src/shared/components/ThemeCustomizer";

import HeroSection from "@/src/features/home/ui/section/HeroSection";
import HomePage from "@/src/features/home/page/page";

// import BuiltDifferentSection
// from "@/src/features/home/ui/BuiltDifferentSection";

export default function HOME() {
  return (
    <SmoothScrollProvider>
      <div className="font-chillax">
        <ThemeCustomizer />
        <HomePage />

       
      </div>
    </SmoothScrollProvider>
  );
}
