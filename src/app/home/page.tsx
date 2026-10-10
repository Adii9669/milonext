"use client";

import SmoothScrollProvider from "@/src/shared/components/smoothScrooling/SmoothScrollProvider";
import HomePage from "@/src/features/home/page/page";

export default function HOME() {
  return (
    <SmoothScrollProvider>
      <div className="font-chillax">
        <HomePage />
      </div>
    </SmoothScrollProvider>
  );
}
