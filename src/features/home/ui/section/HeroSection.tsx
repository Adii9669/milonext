"use client";

import Link from "next/link";
import { ArrowDown } from "lucide-react";
import laptopBackdrop from "../../../../../design/laptopimage.webp";
import catLightBackdrop from "../../../../../design/404.png";

export default function HeroSection() {
  return (
    <section id="top" className="home-orbit-hero relative isolate min-h-[100svh] overflow-hidden bg-background px-5 pb-8 pt-24 text-foreground sm:px-8 sm:pt-28">
      <div className="home-cinematic-backdrop home-cinematic-backdrop--dark pointer-events-none absolute inset-0" style={{ backgroundImage: `url("${laptopBackdrop.src}")` }} aria-hidden="true" />
      <div className="home-cinematic-backdrop home-cinematic-backdrop--light pointer-events-none absolute inset-0" style={{ backgroundImage: `url("${catLightBackdrop.src}")` }} aria-hidden="true" />

      <div className="home-cinematic-copy relative z-10 mx-auto flex min-h-[calc(100svh-8.5rem)] max-w-[1280px] flex-col items-center text-center">
        <div className="mt-[18vh] sm:mt-[16vh]">
          <h1 className="max-w-5xl text-[clamp(3.2rem,7vw,6.5rem)] font-semibold leading-[.96] tracking-[-.06em]">
            Your people.<br /><span className="text-text-muted">Your place.</span>
          </h1>
        </div>

        <Link
          className="home-scroll-invite mt-auto mb-1 flex flex-col items-center gap-3"
          href="#conversation-preview"
          onClick={(event) => {
            event.preventDefault();
            document.getElementById("conversation-preview")?.scrollIntoView({
              behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
              block: "start",
            });
            window.history.replaceState(null, "", "#conversation-preview");
          }}
        >
          <span>SCROLL TO ENTER</span>
          <ArrowDown aria-hidden="true" className="size-4 animate-bounce" />
        </Link>
      </div>
    </section>
  );
}
