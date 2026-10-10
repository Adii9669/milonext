"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CalendarDays, Check, MapPin, Users } from "lucide-react";

export default function PlanTogetherSection() {
  const [vote, setVote] = useState<"in" | "maybe" | null>(null);

  return (
    <section id="plans" className="home-story-section bg-background px-5 py-20 text-foreground sm:px-8 sm:py-28">
      <div className="mx-auto grid min-h-[68vh] max-w-7xl items-center gap-12 lg:grid-cols-[.9fr_1.1fr] lg:gap-20">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.65 }}>
          <p className="mb-5 text-[10px] font-bold uppercase tracking-[.22em] text-text-muted">For the little plans</p>
          <h2 className="max-w-xl text-4xl font-semibold leading-[1.02] tracking-[-.055em] sm:text-6xl">Make the group chat <span className="text-text-muted">a plan.</span></h2>
          <p className="mt-6 max-w-lg text-base leading-7 text-text-secondary sm:text-lg sm:leading-8">Pick a time, share a place, and see who’s in. The good bits stay right there with your conversation.</p>
          <a href="#conversation-preview" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-foreground transition hover:gap-3">See how chat feels <ArrowRight className="size-4" /></a>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 42, scale: .97 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: .7 }} className="home-story-card mx-auto w-full max-w-xl rounded-[2rem] border border-border bg-surface p-5 shadow-[var(--shadow-soft)] sm:p-8">
          <div className="flex items-center justify-between border-b border-border pb-5">
            <div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-surface-elevated text-foreground"><CalendarDays className="size-5" /></span><div><p className="text-xs font-bold uppercase tracking-[.16em] text-text-muted">A plan with your people</p><p className="mt-1 font-semibold">Saturday catch-up</p></div></div>
            <span className="rounded-full border border-border px-3 py-1 text-[10px] font-semibold text-text-secondary">Crew plan</span>
          </div>
          <div className="py-6">
            <p className="text-2xl font-semibold tracking-tight sm:text-3xl">Coffee & a long catch-up</p>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-text-secondary"><span className="inline-flex items-center gap-2"><CalendarDays className="size-4" />Saturday · 7 PM</span><span className="inline-flex items-center gap-2"><MapPin className="size-4" />Little Fern Café</span></div>
          </div>
          <div className="rounded-2xl bg-background p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between text-sm"><span className="inline-flex items-center gap-2 font-semibold"><Users className="size-4 text-text-muted" />Who’s coming?</span><span className="text-text-muted">{vote === "in" ? "4" : "3"} going</span></div>
            <div className="mb-4 flex -space-x-2"><span className="grid size-9 place-items-center rounded-full border-2 border-background bg-avatar-coral text-xs font-bold text-slate-800">M</span><span className="grid size-9 place-items-center rounded-full border-2 border-background bg-avatar-sand text-xs font-bold text-slate-800">J</span><span className="grid size-9 place-items-center rounded-full border-2 border-background bg-avatar-lilac text-xs font-bold text-slate-800">A</span><span className="grid size-9 place-items-center rounded-full border-2 border-background bg-surface-elevated text-xs font-bold text-text-secondary">+2</span></div>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setVote("in")} aria-pressed={vote === "in"} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-foreground px-4 text-sm font-semibold text-background transition hover:-translate-y-0.5 active:translate-y-0"><Check className="size-4" />{vote === "in" ? "You’re in" : "I’m in"}</button>
              <button type="button" onClick={() => setVote("maybe")} aria-pressed={vote === "maybe"} className={`min-h-11 rounded-xl border border-border px-4 text-sm font-semibold transition hover:bg-surface-hover ${vote === "maybe" ? "bg-surface-active text-foreground" : "text-text-secondary"}`}>{vote === "maybe" ? "Maybe — saved" : "Maybe"}</button>
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-text-muted">Made together, right in the chat.</p>
        </motion.div>
      </div>
    </section>
  );
}
