"use client";

import AlwaysBuildingLanding from "../ui/AlwaysBuildingLanding";
import SmoothScrollProvider from "@/src/shared/components/smoothScrooling/SmoothScrollProvider";

export default function HomePage() {
  return (
    <SmoothScrollProvider>
      <AlwaysBuildingLanding />
    </SmoothScrollProvider>
  );
}
