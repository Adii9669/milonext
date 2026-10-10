"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Users, Zap } from "lucide-react";
import { Button } from "@/src/shared/components/ui/button";

const steps = [
  { number: "01", title: "Find your people", description: "Search by username. No phone number or contact syncing needed." },
  { number: "02", title: "Send a request", description: "Add people at your pace with a friend request they can accept or decline." },
  { number: "03", title: "Get talking", description: "Start a one-to-one chat or bring your circle together in a crew." },
];

export default function BuiltDifferent() {
  return (
    <div className="font-chillax bg-background text-foreground">
      <section id="features" className="relative overflow-hidden px-5 pb-24 pt-10 sm:px-8 sm:pb-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 max-w-2xl sm:mb-16">
            <p className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-accent-brand">
              <Sparkles aria-hidden="true" className="size-4" /> Made for real life
            </p>
            <h2 className="text-4xl font-black leading-[1.02] tracking-tight sm:text-6xl">
              Less app. <span className="text-accent-brand">More connection.</span>
            </h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-3 lg:gap-5">
            <motion.article
              initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }}
              className="home-feature-card rounded-[1.6rem] border border-border bg-surface p-6 lg:col-span-2 sm:p-8"
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-text-muted">Everyday stuff</p>
              <div className="mt-4 flex items-center gap-3">
                <Zap aria-hidden="true" className="size-5 text-accent-brand" />
                <h3 className="text-2xl font-bold tracking-tight">Quick, lightweight chat</h3>
              </div>
              <p className="mt-4 max-w-2xl leading-relaxed text-text-secondary">Open a conversation and get straight to the messages. Onechat keeps the essentials and skips the noise.</p>
              <div className="mt-6 flex flex-wrap gap-2 text-sm font-semibold">
                <span className="rounded-full bg-surface-elevated px-4 py-2 text-text-secondary">omw</span>
                <span className="rounded-full bg-primary px-4 py-2 text-primary-foreground">Saving you a seat</span>
                <span className="rounded-full bg-surface-elevated px-4 py-2 text-text-secondary">Who’s bringing snacks?</span>
              </div>
            </motion.article>

            <motion.article
              initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ delay: 0.08 }}
              className="home-crew-card rounded-[1.6rem] border border-border bg-surface p-6 sm:p-8"
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] opacity-75">Crews</p>
              <div className="mt-4 flex items-center gap-3">
                <Users aria-hidden="true" className="size-5 text-accent-brand" />
                <h3 className="text-2xl font-bold tracking-tight">Bring your circle together</h3>
              </div>
              <p className="mt-4 leading-relaxed text-text-secondary">Start a one-to-one chat or gather everyone in a crew.</p>
              <div aria-label="Maya, Jules, and Alex" className="mt-6 flex -space-x-2">
                <span className="grid size-10 place-items-center rounded-full border-2 border-current bg-primary text-sm font-bold text-primary-foreground">M</span>
                <span className="grid size-10 place-items-center rounded-full border-2 border-current bg-surface text-sm font-bold">J</span>
                <span className="grid size-10 place-items-center rounded-full border-2 border-current bg-success text-sm font-bold text-text-inverse">A</span>
              </div>
            </motion.article>

          </div>
        </div>
      </section>

      <section id="how-it-works" className="relative overflow-hidden px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-accent-brand">How it works</p>
            <h2 className="text-4xl font-black leading-tight tracking-tight sm:text-6xl">Three steps to hello.</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3 md:gap-10">
            {steps.map(({ number, title, description }, index) => (
              <motion.article key={number} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ delay: index * 0.08 }} className="home-step-card border-t border-border pt-5">
                <p className="text-sm font-bold text-accent-brand">{number}</p>
                <h3 className="mt-3 text-2xl font-bold tracking-tight">{title}</h3>
                <p className="mt-3 leading-relaxed text-text-secondary">{description}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-24 sm:px-8 sm:pb-32">
        <div className="home-final-cta relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-foreground/10 bg-primary px-6 py-12 text-center text-primary-foreground sm:px-12 sm:py-16">
          <p className="text-xs font-bold uppercase tracking-[0.18em] opacity-75">Your people are already here</p>
          <h2 className="mx-auto mt-3 max-w-3xl text-3xl font-black leading-tight tracking-tight sm:text-5xl">Go find your people.</h2>
          <p className="mx-auto mt-4 max-w-lg leading-relaxed">Private by design. Free to start. No phone number needed.</p>
          <Button asChild size="lg" className="mt-8 h-14 rounded-full border-2 border-foreground bg-background px-7 text-foreground shadow-[0_5px_0_var(--foreground)] hover:bg-surface-hover">
            <Link href="/auth/register">Create account <ArrowRight aria-hidden="true" className="size-4" /></Link>
          </Button>
        </div>
      </section>

      <footer className="home-footer mx-auto flex max-w-7xl flex-col gap-4 border-t border-border px-5 py-7 text-xs text-text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <span className="font-bold tracking-[0.2em] text-foreground">ONECHAT</span>
        <nav aria-label="Footer navigation" className="flex gap-5">
          <a href="#privacy" className="transition hover:text-foreground">Privacy</a>
          <span>Terms</span>
          <span>Contact</span>
        </nav>
      </footer>
    </div>
  );
}
