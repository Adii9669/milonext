"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Fingerprint, LockKeyhole, ShieldCheck } from "lucide-react";

export default function SecureChatsSection() {
  return (
    <section id="privacy" className="home-story-section bg-background px-5 py-20 text-foreground sm:px-8 sm:py-28">
      <div className="mx-auto grid min-h-[62vh] max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_.95fr] lg:gap-20">
        <motion.div initial={{ opacity: 0, y: 34 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.65 }} className="order-2 lg:order-1">
          <div className="home-security-visual mx-auto flex min-h-[300px] max-w-xl flex-col items-center justify-center rounded-[2rem] border border-border bg-surface p-8 text-center shadow-[var(--shadow-soft)] sm:min-h-[380px]">
            <div className="relative grid size-32 place-items-center rounded-full border border-border bg-background sm:size-40">
              <div className="absolute inset-3 rounded-full border border-dashed border-border-strong" />
              <LockKeyhole className="size-12 text-text-secondary sm:size-14" strokeWidth={1.35} />
              <span className="absolute -right-2 top-3 grid size-10 place-items-center rounded-full border border-border bg-surface text-text-secondary"><Fingerprint className="size-5" /></span>
              <span className="absolute -bottom-1 -left-2 grid size-10 place-items-center rounded-full border border-border bg-surface text-text-secondary"><ShieldCheck className="size-5" /></span>
            </div>
            <p className="mt-7 text-xs font-bold uppercase tracking-[.19em] text-text-muted">On the roadmap</p>
            <p className="mt-2 text-lg font-semibold">End-to-end encryption</p>
            <p className="mt-1 text-sm text-text-secondary">A future layer of protection for your conversations.</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.65, delay: .08 }} className="order-1 lg:order-2">
          <p id="up-next" className="mb-5 text-[10px] font-bold uppercase tracking-[.22em] text-text-muted">Your circle, your conversations</p>
          <h2 className="max-w-xl text-4xl font-semibold leading-[1.02] tracking-[-.055em] sm:text-6xl">Good chats feel <span className="text-text-muted">safe.</span></h2>
          <p className="mt-6 max-w-lg text-base leading-7 text-text-secondary sm:text-lg sm:leading-8">We’re building Onechat with privacy in mind. End-to-end encryption is on our roadmap, and we’ll share exactly how it works before it ships.</p>
          <a href="#conversation-preview" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-foreground transition hover:gap-3">A simpler way to connect <ArrowUpRight className="size-4" /></a>
        </motion.div>
      </div>
    </section>
  );
}
