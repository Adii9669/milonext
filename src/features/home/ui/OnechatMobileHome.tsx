"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  Radio,
  Calendar,
  ArrowRight,
  Sparkles,
  KeyRound,
  CheckCircle2,
  Copy,
} from "lucide-react";

export default function OnechatMobileHome() {
  const router = useRouter();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const demoAccounts = [
    {
      role: "Primary Account",
      username: "adii",
      password: "password123",
      note: "Primary test user with active conversations & Jam channels",
    },
    {
      role: "Secondary Account",
      username: "demo",
      password: "password123",
      note: "Secondary test user to test 2-way real-time messaging",
    },
  ];

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleQuickLogin = (username: string) => {
    router.push(`/login?demo=${encodeURIComponent(username)}`);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0D] text-[#F4F4F5] flex flex-col pt-safe pb-safe selection:bg-[#6E53CC]/30">
      {/* ── Mobile Topbar ────────────────────────────────────────────── */}
      <header className="px-5 py-4 flex items-center justify-between border-b border-[#1E1E26] bg-[#0E0E12]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#201C30] border border-[#6E53CC]/40 flex items-center justify-center text-[#A78BFA] shadow-[0_2px_12px_rgba(110,83,204,0.25)]">
            <span className="font-bold text-lg leading-none">#</span>
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white leading-tight">
              Onechat
            </h1>
            <p className="text-[10px] font-semibold text-[#6E53CC] tracking-wider uppercase">
              Mobile Edition
            </p>
          </div>
        </div>

        <Link
          href="/login"
          className="px-3.5 py-1.5 rounded-lg bg-[#1C1C24] hover:bg-[#252530] text-xs font-semibold text-[#A78BFA] border border-[#6E53CC]/30 transition-all active:scale-95"
        >
          Sign in
        </Link>
      </header>

      {/* ── Main Content Container ───────────────────────────────────── */}
      <main className="flex-1 px-5 py-6 flex flex-col max-w-md mx-auto w-full">
        {/* Hero Section */}
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#6E53CC]/15 border border-[#6E53CC]/30 text-[#A78BFA] text-xs font-medium mb-4">
            <Sparkles size={13} className="text-[#A78BFA]" />
            <span>Fast, Private & Jam-Powered</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight mb-3">
            Pure conversations, zero friction.
          </h2>
          <p className="text-sm text-[#A1A1AA] leading-relaxed">
            Real-time messaging with full-duplex relays, synchronized background radio streaming, and collaborative group plans.
          </p>
        </div>

        {/* Primary Call to Action Buttons */}
        <div className="flex flex-col gap-2.5 my-5">
          <Link
            href="/login"
            className="w-full py-3.5 px-4 rounded-xl bg-[#6E53CC] hover:bg-[#7E64E0] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-[0_4px_18px_rgba(110,83,204,0.35)] active:scale-[0.98] transition-all"
          >
            <span>Sign In to Onechat</span>
            <ArrowRight size={16} />
          </Link>

          <Link
            href="/signup"
            className="w-full py-3.5 px-4 rounded-xl bg-[#141418] hover:bg-[#1A1A22] text-[#F4F4F5] border border-[#2A2A34] font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          >
            <span>Create New Account</span>
          </Link>
        </div>

        {/* ── Ready-to-Use Test Credentials Card ────────────────────── */}
        <div className="p-4 rounded-2xl bg-[#141418] border border-[#2C2C38] shadow-md my-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#6E53CC]/20 flex items-center justify-center text-[#A78BFA]">
                <KeyRound size={15} />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#A78BFA]">
                Test Credentials
              </h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#22C55E]/15 text-[#22C55E] font-semibold border border-[#22C55E]/20">
              Ready to test
            </span>
          </div>

          <p className="text-xs text-[#A1A1AA] mb-3 leading-normal">
            Use these pre-configured accounts to sign in immediately without signing up:
          </p>

          <div className="space-y-2.5">
            {demoAccounts.map((account, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-[#1C1C24] border border-[#262632] flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#F4F4F5]">
                    {account.role}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin(account.username)}
                    className="text-[11px] font-semibold text-[#A78BFA] hover:text-white flex items-center gap-1 active:scale-95 transition-all"
                  >
                    <span>1-Tap Sign In</span>
                    <ArrowRight size={12} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#121216] border border-[#22222A]">
                    <span className="text-[11px] text-[#71717A]">User:</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(account.username, `${account.username}-user`)}
                      className="font-mono text-[11px] text-[#E4E4E7] flex items-center gap-1 hover:text-white"
                      title="Copy username"
                    >
                      <span>{account.username}</span>
                      {copiedField === `${account.username}-user` ? (
                        <CheckCircle2 size={11} className="text-[#22C55E]" />
                      ) : (
                        <Copy size={11} className="text-[#71717A]" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#121216] border border-[#22222A]">
                    <span className="text-[11px] text-[#71717A]">Pass:</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(account.password, `${account.username}-pw`)}
                      className="font-mono text-[11px] text-[#E4E4E7] flex items-center gap-1 hover:text-white"
                      title="Copy password"
                    >
                      <span>{account.password}</span>
                      {copiedField === `${account.username}-pw` ? (
                        <CheckCircle2 size={11} className="text-[#22C55E]" />
                      ) : (
                        <Copy size={11} className="text-[#71717A]" />
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-[10px] text-[#71717A] leading-tight">
                  {account.note}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Feature Highlights ────────────────────────────────────── */}
        <div className="space-y-2.5 my-4">
          <div className="p-3.5 rounded-xl bg-[#121216] border border-[#202028] flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#6E53CC]/15 text-[#A78BFA] flex items-center justify-center shrink-0 mt-0.5">
              <MessageSquare size={16} />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white mb-0.5">
                Full-Duplex Messaging
              </h4>
              <p className="text-[11px] text-[#A1A1AA] leading-normal">
                Sub-50ms message relays, delivery receipts, and rich media sharing.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#121216] border border-[#202028] flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#6E53CC]/15 text-[#A78BFA] flex items-center justify-center shrink-0 mt-0.5">
              <Radio size={16} />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white mb-0.5">
                Onechat Jam Radio
              </h4>
              <p className="text-[11px] text-[#A1A1AA] leading-normal">
                Curated lo-fi, synthwave, and chillout radio streaming live in the background.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#121216] border border-[#202028] flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#6E53CC]/15 text-[#A78BFA] flex items-center justify-center shrink-0 mt-0.5">
              <Calendar size={16} />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white mb-0.5">
                Group Plans & Calendar
              </h4>
              <p className="text-[11px] text-[#A1A1AA] leading-normal">
                Schedule outings, track RSVPs, and collaborate directly inside conversation threads.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* ── Mobile Footer ────────────────────────────────────────────── */}
      <footer className="px-5 py-4 border-t border-[#1E1E26] text-center text-xs text-[#71717A] bg-[#0E0E12]">
        <div className="flex items-center justify-center gap-4 text-xs font-medium text-[#A1A1AA] mb-2">
          <Link href="/login" className="hover:text-white transition-colors">
            Log in
          </Link>
          <span>·</span>
          <Link href="/signup" className="hover:text-white transition-colors">
            Sign up
          </Link>
          <span>·</span>
          <Link href="/connect" className="hover:text-white transition-colors">
            Open Chat
          </Link>
        </div>
        <p className="text-[11px] text-[#52525B]">
          Onechat Platform · Designed for high performance
        </p>
      </footer>
    </div>
  );
}
