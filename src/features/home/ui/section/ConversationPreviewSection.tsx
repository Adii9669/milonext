"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUp, CalendarDays, Check, Info, MessageCircle, Mic, Plus, Search, ShieldCheck, Users } from "lucide-react";

const replies = [
  "Perfect. I’ll bring the good stories ✨",
  "Saved it — see you Saturday! ☕",
  "Already looking forward to it 🙌",
];

export default function ConversationPreviewSection() {
  const [replyIndex, setReplyIndex] = useState(-1);
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "start 55%"],
  });
  const previewY = useTransform(scrollYProgress, [0, 1], [160, 0]);
  const previewOpacity = useTransform(scrollYProgress, [0, 0.7, 1], [0.45, 0.8, 1]);
  const latestReply = replyIndex >= 0 ? replies[replyIndex % replies.length] : null;

  return (
    <section
      id="conversation-preview"
      ref={sectionRef}
      className="home-preview-section relative"
    >
      <motion.div
        style={{ y: previewY, opacity: previewOpacity }}
        className="relative overflow-hidden bg-surface px-5 py-20 text-foreground sm:px-8 sm:py-28"
      >
        <div className="relative mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.35 }} className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
          <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.2em] text-accent-brand">A little look inside</p>
          <h2 className="text-4xl font-black leading-[0.98] tracking-[-0.055em] sm:text-6xl">The good stuff, <span className="text-text-muted">without the noise.</span></h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-text-secondary sm:text-lg">Quick, lightweight conversations that keep your favorite people close.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 24, scale: 0.985 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.6 }} className="home-preview-frame mx-auto max-w-6xl overflow-hidden rounded-[1.5rem] border border-border bg-background shadow-[var(--shadow-soft)] sm:rounded-[2rem]">
          <div className="home-preview-window flex min-h-[510px] sm:min-h-[620px]">
            <aside className="home-preview-sidebar hidden w-[245px] shrink-0 flex-col border-r border-border p-4 sm:flex lg:w-[285px] lg:p-5">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-bold">Chats</h3>
                <button type="button" aria-label="New chat" className="grid size-8 place-items-center rounded-full bg-surface-elevated text-text-secondary"><Plus className="size-4" /></button>
              </div>
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-xs text-text-muted"><Search className="size-3.5" />Find by username</div>
              <div className="mb-4 flex gap-1.5 text-[10px] font-semibold"><span className="rounded-full bg-foreground px-3 py-1 text-background">All</span><span className="rounded-full border border-border px-3 py-1 text-text-secondary">Unread 2</span><span className="rounded-full border border-border px-3 py-1 text-text-secondary">Channels</span></div>
              <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.18em] text-text-muted">Pinned</p>
              <div className="flex items-center gap-2 rounded-xl bg-surface-elevated p-2.5">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-avatar-blue text-[10px] font-bold text-slate-700">UC</span>
                <span className="min-w-0 flex-1"><b className="block truncate text-[11px]">The usual channel</b><small className="block truncate text-[9px] text-text-muted">Jules: Saved it in the channel</small></span>
                <small className="text-[9px] text-text-muted">9:41</small>
              </div>
              <div className="mt-3 flex items-center gap-2 rounded-xl p-2.5">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-avatar-sand text-[10px] font-bold text-slate-700">FD</span>
                <span className="min-w-0 flex-1"><b className="block truncate text-[11px]">Family dinner</b><small className="block truncate text-[9px] text-text-muted">Mum: Sunday at 6?</small></span>
              </div>
              <p className="mb-2 mt-5 text-[9px] font-bold uppercase tracking-[0.18em] text-text-muted">Recent</p>
              {[['M','Maya','Sent a photo','bg-avatar-coral'],['A','Alex','You: See you there','bg-avatar-lilac'],['S','Sam','Thanks for the lift!','bg-avatar-mint']].map(([initial,name,description,color]) => <div key={name} className="flex items-center gap-2 rounded-xl p-2.5"><span className={`grid size-8 shrink-0 place-items-center rounded-full ${color} text-[10px] font-bold text-slate-700`}>{initial}</span><span className="min-w-0 flex-1"><b className="block truncate text-[11px]">{name}</b><small className="block truncate text-[9px] text-text-muted">{description}</small></span></div>)}
              <div className="mt-auto flex items-center gap-2 rounded-xl bg-surface p-3 text-[10px]"><Users className="size-4 text-accent-brand" /><span className="flex-1"><b className="block">2 friend requests</b><small className="text-text-muted">Ready when you are</small></span><span className="rounded-full bg-message-sent px-2.5 py-1 font-bold text-white">Review</span></div>
            </aside>

            <div className="flex min-w-0 flex-1 flex-col">
              <header className="flex h-[64px] shrink-0 items-center justify-between border-b border-border bg-surface px-4 sm:px-6">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex -space-x-2"><span className="grid size-8 place-items-center rounded-full border-2 border-surface bg-avatar-blue text-[10px] font-bold text-slate-700">M</span><span className="grid size-8 place-items-center rounded-full border-2 border-surface bg-avatar-sand text-[10px] font-bold text-slate-700">J</span><span className="grid size-8 place-items-center rounded-full border-2 border-surface bg-avatar-mint text-[10px] font-bold text-slate-700">A</span></div>
                  <div className="min-w-0"><p className="truncate text-sm font-bold">The usual channel</p><p className="truncate text-[10px] text-text-muted">3 online · Maya, Jules, Alex, you</p></div>
                </div>
                <div className="flex items-center gap-2 text-text-muted"><Search className="size-4" /><span className="mx-1 h-5 w-px bg-border" /><Info className="size-4" /></div>
              </header>
              <div className="mx-3 mt-3 flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-[10px] sm:mx-5"><CalendarDays className="size-3.5 shrink-0 text-accent-brand" /><span className="flex-1 truncate"><b>Pinned:</b> Saturday 7pm at the café</span><b className="shrink-0 text-text-secondary">3 going</b></div>

              <div className="flex flex-1 flex-col justify-end gap-4 overflow-hidden px-4 py-5 sm:px-6 sm:py-6">
                <p className="text-center text-[9px] font-semibold text-text-muted">Today 9:38 AM</p>
                <div className="max-w-[82%]"><p className="mb-1 ml-2 text-[9px] font-bold uppercase tracking-wide text-text-muted">Maya</p><p className="rounded-2xl rounded-bl-md bg-surface-elevated px-3.5 py-2.5 text-xs sm:text-sm">I found a tiny café with the best cake 🍰</p><div className="mt-1 flex items-center gap-1 rounded-full bg-surface-elevated px-2 py-1 text-[9px] text-text-secondary"><span>▶</span><span className="tracking-[0.22em]">▂▅▇▃▆▂</span><span>0:14</span></div></div>
                <div className="ml-auto max-w-[82%] text-right"><p className="mb-1 rounded-full bg-surface px-3 py-1 text-[9px] text-text-muted">Maya: I found a tiny café with the best cake</p><p className="rounded-2xl rounded-br-md bg-message-sent px-3.5 py-2.5 text-left text-xs text-white sm:text-sm">Send the address! I’m bringing the good stories ✨</p><p className="mt-1 text-[9px] text-text-muted">Seen 9:40</p></div>
                <div className="max-w-[72%]"><p className="mb-1 ml-2 text-[9px] font-bold uppercase tracking-wide text-text-muted">Jules</p><p className="rounded-2xl rounded-bl-md bg-surface-elevated px-3.5 py-2.5 text-xs sm:text-sm">Already saved it in the channel</p><span className="ml-2 mt-1 inline-flex rounded-full bg-surface-elevated px-2 py-0.5 text-[9px] text-text-secondary">♡ 3</span></div>

                <div className="home-preview-plan max-w-[270px] rounded-2xl border border-border bg-surface p-3 sm:p-4"><p className="text-[8px] font-bold uppercase tracking-[0.18em] text-text-muted">Plan · Saturday</p><p className="mt-1 text-xs font-bold sm:text-sm">7pm, café with the best cake</p><p className="mt-1 text-[10px] text-text-muted">Added by Jules · 3 going</p><div className="mt-3 flex gap-2"><button type="button" onClick={() => setReplyIndex((v) => v + 1)} className="flex-1 rounded-lg bg-message-sent py-2 text-[10px] font-bold text-white transition hover:brightness-110">I’m in</button><button type="button" onClick={() => setReplyIndex((v) => v + 1)} className="flex-1 rounded-lg border border-border py-2 text-[10px] font-semibold text-text-secondary transition hover:bg-surface-hover">Maybe</button></div></div>

                {latestReply && <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="ml-auto max-w-[75%] rounded-2xl rounded-br-md bg-message-sent px-3.5 py-2.5 text-xs text-white">{latestReply}</motion.p>}
                <p className="inline-flex w-fit items-center gap-2 rounded-full bg-surface-elevated px-3 py-1.5 text-[9px] text-text-muted"><span className="flex gap-0.5 text-accent-brand">•••</span>Maya is typing</p>
              </div>

              <div className="border-t border-border bg-surface p-3 sm:px-5 sm:py-4">
                <div className="mb-2 flex gap-1.5 sm:gap-2"><span className="rounded-full border border-border px-2.5 py-1 text-[9px] text-text-secondary">Plan</span><span className="rounded-full border border-border px-2.5 py-1 text-[9px] text-text-secondary">Poll</span><span className="rounded-full border border-border px-2.5 py-1 text-[9px] text-text-secondary">Photo</span><span className="rounded-full border border-border px-2.5 py-1 text-[9px] text-text-secondary">Place</span></div>
                <div className="flex items-center gap-2"><button type="button" aria-label="Add attachment" className="grid size-9 shrink-0 place-items-center rounded-full bg-surface-elevated text-text-secondary"><Plus className="size-4" /></button><div className="flex h-10 min-w-0 flex-1 items-center rounded-full border border-border bg-background px-3 text-[10px] text-text-muted sm:px-4 sm:text-xs">Message The usual channel<span className="ml-auto flex items-center gap-3"><Mic className="size-3.5" /><button type="button" aria-label="Send preview message" onClick={() => setReplyIndex((v) => v + 1)} className="grid size-7 place-items-center rounded-full bg-message-sent text-white transition hover:scale-105"><ArrowUp className="size-3.5" /></button></span></div></div>
              </div>
            </div>

            <aside className="hidden w-[205px] shrink-0 flex-col border-l border-border bg-surface p-4 lg:flex">
              <div className="mx-auto grid size-14 place-items-center rounded-full bg-avatar-blue text-sm font-bold text-slate-700">UC</div>
              <h3 className="mt-3 text-center text-xs font-bold">The usual channel</h3><p className="text-center text-[9px] text-text-muted">4 members · created by you</p>
              <div className="mt-3 grid grid-cols-2 gap-2"><button type="button" className="rounded-lg bg-surface-elevated py-2 text-[9px] font-semibold">Mute</button><button type="button" className="rounded-lg bg-message-sent py-2 text-[9px] font-bold text-white">Invite</button></div>
              <p className="mb-2 mt-5 text-[8px] font-bold uppercase tracking-[0.16em] text-text-muted">Members</p>
              {[['Y','You','Admin','bg-avatar-mint'],['M','Maya','Online','bg-avatar-coral'],['J','Jules','Online','bg-avatar-sand'],['A','Alex','2h ago','bg-avatar-lilac']].map(([initial,name,status,color]) => <div key={name} className="flex items-center gap-2 py-1"><span className={`grid size-6 place-items-center rounded-full ${color} text-[8px] font-bold text-slate-700`}>{initial}</span><span className="flex-1 text-[9px]">{name}</span><small className="text-[8px] text-text-muted">{status}</small></div>)}
              <p className="mb-2 mt-4 flex items-center justify-between text-[8px] font-bold uppercase tracking-[0.16em] text-text-muted"><span>Shared media</span><span>See all</span></p><div className="grid grid-cols-3 gap-1"><span className="aspect-square rounded-lg bg-surface-elevated" /><span className="aspect-square rounded-lg bg-surface-active" /><span className="aspect-square rounded-lg bg-surface-elevated" /></div>
              <button type="button" className="mt-auto rounded-lg border border-border py-2 text-[9px] text-text-muted">Leave channel</button>
            </aside>
          </div>
        </motion.div>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-text-muted">
          <span className="inline-flex items-center gap-1.5"><ShieldCheck className="size-3.5 text-accent-brand" />Private by design</span>
          <span className="inline-flex items-center gap-1.5"><Check className="size-3.5 text-accent-brand" />Made for your circle</span>
          <span className="inline-flex items-center gap-1.5"><MessageCircle className="size-3.5 text-accent-brand" />Just the essentials</span>
        </div>
        </div>
      </motion.div>
    </section>
  );
}
