"use client";

import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarDays,
  Clock,
  MapPin,
  Pencil,
  AlertTriangle,
  Users,
} from "lucide-react";
import { friendApi } from "@/src/lib/api";
import { Friends } from "@/src/types/friends";
import { PLAN_CATEGORIES } from "./PlanCategorySelector";

interface PlanReviewStepProps {
  title: string;
  description: string;
  category: string | null;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  selectedParticipantIds: string[];
  conversationName?: string;
  onEdit: (stepNumber: number) => void;
  submitError?: string | null;
}

export function PlanReviewStep({
  title,
  description,
  category,
  date,
  startTime,
  endTime,
  location,
  selectedParticipantIds,
  conversationName,
  onEdit,
  submitError,
}: PlanReviewStepProps) {
  // Retrieve friends to display selected participant cards
  const { data: friends = [] } = useQuery<Friends[]>({
    queryKey: ["friends"],
    queryFn: friendApi.getFriends,
    staleTime: 60_000,
  });

  const selectedFriends = useMemo(() => {
    if (!Array.isArray(friends)) return [];
    return friends.filter((f) => selectedParticipantIds.includes(f.id));
  }, [friends, selectedParticipantIds]);

  const selectedCategoryObj = useMemo(() => {
    if (!category) return null;
    return PLAN_CATEGORIES.find((c) => c.id === category) || null;
  }, [category]);

  const formattedDate = useMemo(() => {
    if (!date) return "Not specified";
    try {
      const [y, m, d] = date.split("-").map(Number);
      const dateObj = new Date(y, m - 1, d);
      return dateObj.toLocaleDateString([], {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return date;
    }
  }, [date]);

  const formattedTime = useMemo(() => {
    if (!startTime) return "Not specified";

    const format12h = (t: string) => {
      const [h, m] = t.split(":").map(Number);
      const period = h >= 12 ? "PM" : "AM";
      const h12 = h % 12 || 12;
      return `${h12}:${String(m).padStart(2, "0")} ${period}`;
    };

    const start12 = format12h(startTime);
    if (!endTime) return start12;
    const end12 = format12h(endTime);
    return `${start12} – ${end12}`;
  }, [startTime, endTime]);

  return (
    <div className="flex-1 p-5 sm:p-6 overflow-y-auto scrollbar-none space-y-4">
      {/* Header Info */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-[#f4f4f5]">
          Review Your Plan
        </h2>
        <p className="text-xs text-[#a1a1aa] mt-0.5 leading-relaxed">
          Check the details below before creating your plan.
        </p>
      </div>

      {/* Submission Error Banner */}
      {submitError && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-start gap-2.5 animate-in fade-in-50 duration-150">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="font-semibold">Creation failed</p>
            <p className="mt-0.5 leading-relaxed">{submitError}</p>
          </div>
        </div>
      )}

      {/* ── Card A: Plan Details ──────────────────────────────────── */}
      <div className="p-4 rounded-xl bg-[#17171b] border border-[#25252b] space-y-2.5 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#71717a]">
            Plan Details
          </span>
          <button
            type="button"
            onClick={() => onEdit(1)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6E53CC] hover:text-[#A78BFA] transition-colors cursor-pointer"
            title="Edit Details"
            aria-label="Edit Details"
          >
            <Pencil size={13} />
            <span>Edit</span>
          </button>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-[#f4f4f5] break-words">
            {title || "Untitled Plan"}
          </h3>
          <p className="text-xs text-[#a1a1aa] leading-relaxed mt-1 whitespace-pre-wrap break-words">
            {description.trim() ? description : "No description provided."}
          </p>
        </div>

        {selectedCategoryObj && (
          <div className="pt-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[rgba(110,83,204,0.18)] border border-[#6E53CC]/30 text-[11px] font-medium text-[#A78BFA]">
              <selectedCategoryObj.icon size={13} />
              <span>{selectedCategoryObj.label}</span>
            </span>
          </div>
        )}
      </div>

      {/* ── Card B: Time & Place ─────────────────────────────────── */}
      <div className="p-4 rounded-xl bg-[#17171b] border border-[#25252b] space-y-3 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#71717a]">
            Time & Place
          </span>
          <button
            type="button"
            onClick={() => onEdit(2)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6E53CC] hover:text-[#A78BFA] transition-colors cursor-pointer"
            title="Edit Time & Place"
            aria-label="Edit Time & Place"
          >
            <Pencil size={13} />
            <span>Edit</span>
          </button>
        </div>

        <div className="space-y-2">
          {/* Date */}
          <div className="flex items-center gap-2.5 text-xs">
            <div className="w-6 h-6 rounded-md bg-[#18181c] border border-[#25252b] flex items-center justify-center shrink-0 text-[#6E53CC]">
              <CalendarDays size={14} />
            </div>
            <div className="min-w-0">
              <span className="text-[#a1a1aa] mr-1.5 font-normal">Date:</span>
              <span className="font-semibold text-[#f4f4f5]">{formattedDate}</span>
            </div>
          </div>

          {/* Time */}
          <div className="flex items-center gap-2.5 text-xs">
            <div className="w-6 h-6 rounded-md bg-[#18181c] border border-[#25252b] flex items-center justify-center shrink-0 text-[#6E53CC]">
              <Clock size={14} />
            </div>
            <div className="min-w-0">
              <span className="text-[#a1a1aa] mr-1.5 font-normal">Time:</span>
              <span className="font-semibold text-[#f4f4f5]">{formattedTime}</span>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2.5 text-xs">
            <div className="w-6 h-6 rounded-md bg-[#18181c] border border-[#25252b] flex items-center justify-center shrink-0 text-[#6E53CC]">
              <MapPin size={14} />
            </div>
            <div className="min-w-0 truncate">
              <span className="text-[#a1a1aa] mr-1.5 font-normal">Location:</span>
              <span className={`font-semibold ${location.trim() ? "text-[#f4f4f5]" : "text-[#71717a] italic"}`}>
                {location.trim() ? location : "No location specified"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Card C: Participants ──────────────────────────────────── */}
      <div className="p-4 rounded-xl bg-[#17171b] border border-[#25252b] space-y-3 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#71717a]">
              Participants
            </span>
            <span className="px-1.5 py-0.2 rounded-full bg-[#18181c] text-[#a1a1aa] text-[10px] font-bold border border-[#25252b]">
              {selectedParticipantIds.length}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onEdit(3)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6E53CC] hover:text-[#A78BFA] transition-colors cursor-pointer"
            title="Edit Participants"
            aria-label="Edit Participants"
          >
            <Pencil size={13} />
            <span>Edit</span>
          </button>
        </div>

        {selectedFriends.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {selectedFriends.map((f) => {
              const username = f.username || f.name.toLowerCase().replace(/\s+/g, "");
              return (
                <div
                  key={f.id}
                  className="flex items-center gap-2.5 p-2 rounded-lg bg-[#18181c] border border-[#25252b]"
                >
                  <div className="w-7 h-7 rounded-full bg-[#202026] border border-[#25252b] text-[10px] font-bold text-[#f4f4f5] flex items-center justify-center shrink-0">
                    {f.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-[#f4f4f5] truncate">{f.name}</p>
                    <p className="text-[10px] text-[#71717a] truncate">@{username}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-[#71717a] italic py-1">
            <Users size={14} className="shrink-0" />
            <span>
              {conversationName
                ? `All members of ${conversationName} can view and participate.`
                : "No specific connections invited. All conversation members can participate."}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
