"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Search, X, Check, CheckCircle2, UserPlus, RefreshCw, Users } from "lucide-react";
import { friendApi } from "@/src/lib/api";
import { Friends } from "@/src/types/friends";

interface PlanParticipantsStepProps {
  selectedParticipantIds: string[];
  onSelectParticipantIds: React.Dispatch<React.SetStateAction<string[]>>;
  isStep3Completed?: boolean;
}

export function PlanParticipantsStep({
  selectedParticipantIds,
  onSelectParticipantIds,
  isStep3Completed,
}: PlanParticipantsStepProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Retrieve friends via React Query using the existing cached query
  const {
    data: friends = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery<Friends[]>({
    queryKey: ["friends"],
    queryFn: friendApi.getFriends,
    staleTime: 60_000,
  });

  // Filter only accepted connections (exclude pending or blocked)
  const acceptedFriends = useMemo(() => {
    if (!Array.isArray(friends)) return [];
    return friends.filter((f) => !f.status || f.status === "accepted");
  }, [friends]);

  // Filter by search query (display name, username, or email)
  const filteredFriends = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return acceptedFriends;
    return acceptedFriends.filter((f) => {
      const nameMatch = f.name?.toLowerCase().includes(q);
      const userMatch = f.username?.toLowerCase().includes(q);
      const emailMatch = f.email?.toLowerCase().includes(q);
      return Boolean(nameMatch || userMatch || emailMatch);
    });
  }, [acceptedFriends, searchQuery]);

  // Resolve selected participant objects for the preview
  const selectedFriends = useMemo(() => {
    return acceptedFriends.filter((f) => selectedParticipantIds.includes(f.id));
  }, [acceptedFriends, selectedParticipantIds]);

  // Selection toggle
  const toggleParticipant = (friendId: string) => {
    onSelectParticipantIds((prev) => {
      if (prev.includes(friendId)) {
        return prev.filter((id) => id !== friendId);
      }
      return [...prev, friendId];
    });
  };

  const removeParticipant = (friendId: string) => {
    onSelectParticipantIds((prev) => prev.filter((id) => id !== friendId));
  };

  return (
    <div className="flex-1 p-5 sm:p-6 overflow-y-auto scrollbar-none space-y-4">
      {/* Header Info */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-[#f4f4f5]">
          Participants
        </h2>
        <p className="text-xs text-[#a1a1aa] mt-0.5 leading-relaxed">
          Choose who you want to invite to this plan.
        </p>
      </div>

      {/* Inline Completion Banner if user validated Step 3 */}
      {isStep3Completed && (
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[rgba(110,83,204,0.18)] border border-[#6E53CC]/40 text-xs text-[#A78BFA] animate-in fade-in-50 duration-200">
          <CheckCircle2 size={16} className="shrink-0 text-[#6E53CC]" />
          <span>
            <strong>Step 3 Participants saved!</strong> Proceed to Step 4 (Review) to confirm and create your plan.
          </span>
        </div>
      )}

      {/* ── Section A: Participant Summary ────────────────────────── */}
      <div className="p-3.5 rounded-xl bg-[#17171b] border border-[#25252b] flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#f4f4f5]">
              {selectedParticipantIds.length === 0
                ? "0 participants selected"
                : selectedParticipantIds.length === 1
                ? "1 participant selected"
                : `${selectedParticipantIds.length} participants selected`}
            </span>
            {selectedParticipantIds.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[rgba(110,83,204,0.18)] text-[#6E53CC] text-[10px] font-bold border border-[#6E53CC]/30">
                {selectedParticipantIds.length}
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#71717a] mt-0.5">
            People invited to this plan
          </p>
        </div>

        {/* Selected Avatars Stack Preview */}
        <div className="flex items-center">
          {selectedFriends.length > 0 ? (
            <div className="flex items-center -space-x-2 overflow-hidden">
              {selectedFriends.slice(0, 5).map((f) => (
                <div
                  key={f.id}
                  title={f.name}
                  className="w-7 h-7 rounded-full bg-[#202026] border-2 border-[#17171b] flex items-center justify-center text-[10px] font-bold text-[#f4f4f5] ring-1 ring-[#25252b]"
                >
                  {f.name.slice(0, 1).toUpperCase()}
                </div>
              ))}
              {selectedFriends.length > 5 && (
                <div className="w-7 h-7 rounded-full bg-[rgba(110,83,204,0.18)] border-2 border-[#17171b] flex items-center justify-center text-[10px] font-bold text-[#6E53CC] ring-1 ring-[#6E53CC]/40">
                  +{selectedFriends.length - 5}
                </div>
              )}
            </div>
          ) : (
            <span className="text-[11px] text-[#71717a] italic">
              No participants selected yet.
            </span>
          )}
        </div>
      </div>

      {/* ── Section B: Search Connections ─────────────────────────── */}
      <div className="relative">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717a] pointer-events-none"
        />
        <input
          id="search-participants-input"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search friends by name or username..."
          className="w-full h-10 pl-9 pr-9 rounded-xl bg-[#18181c] border border-[#25252b] text-xs text-[#f4f4f5] placeholder:text-[#71717a] focus:outline-none focus:border-[#6E53CC] focus:ring-1 focus:ring-[#6E53CC] transition-colors"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#71717a] hover:text-[#f4f4f5] rounded-md transition-colors"
            title="Clear search"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* ── Section D: Selected Participants Preview Chips ────────── */}
      {selectedFriends.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#a1a1aa] uppercase tracking-wider">
              Invited ({selectedFriends.length})
            </span>
            <button
              type="button"
              onClick={() => onSelectParticipantIds([])}
              className="text-[11px] text-[#71717a] hover:text-red-400 transition-colors cursor-pointer"
            >
              Clear all
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-[85px] overflow-y-auto scrollbar-none p-0.5">
            {selectedFriends.map((f) => (
              <div
                key={f.id}
                className="inline-flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-lg bg-[rgba(110,83,204,0.18)] border border-[#6E53CC]/40 text-xs text-[#f4f4f5] animate-in fade-in-50 duration-150"
              >
                <div className="w-5 h-5 rounded-full bg-[#18181c] border border-[#6E53CC]/50 flex items-center justify-center text-[9px] font-bold text-[#6E53CC]">
                  {f.name.slice(0, 1).toUpperCase()}
                </div>
                <span className="font-medium text-[11px] max-w-[120px] truncate">
                  {f.name}
                </span>
                <button
                  type="button"
                  onClick={() => removeParticipant(f.id)}
                  className="p-0.5 rounded hover:bg-[#202026] text-[#71717a] hover:text-[#f4f4f5] transition-colors cursor-pointer"
                  title={`Remove ${f.name}`}
                  aria-label={`Remove ${f.name}`}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Section C: Available Connections List ─────────────────── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-[#a1a1aa] uppercase tracking-wider">
            Connections ({acceptedFriends.length})
          </span>
          {isFetching && (
            <span className="text-[10px] text-[#71717a] flex items-center gap-1">
              <RefreshCw size={10} className="animate-spin" /> Updating…
            </span>
          )}
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="space-y-2 py-2">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="w-full h-12 rounded-xl bg-[#17171b] border border-[#25252b] animate-pulse flex items-center justify-between p-2.5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#202026]" />
                  <div className="space-y-1.5">
                    <div className="w-24 h-3 bg-[#202026] rounded" />
                    <div className="w-16 h-2.5 bg-[#202026] rounded" />
                  </div>
                </div>
                <div className="w-5 h-5 rounded-md bg-[#202026]" />
              </div>
            ))}
          </div>
        ) : isError ? (
          /* Error State */
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center justify-between gap-3">
            <span>
              {error instanceof Error ? error.message : "Failed to load connections."}
            </span>
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-500/20 hover:bg-red-500/30 text-white font-semibold transition-colors"
            >
              <RefreshCw size={12} />
              <span>Retry</span>
            </button>
          </div>
        ) : acceptedFriends.length === 0 ? (
          /* Empty Connections State */
          <div className="p-6 rounded-xl bg-[#17171b] border border-[#25252b] text-center space-y-2">
            <Users size={28} className="mx-auto text-[#71717a]" />
            <h3 className="text-sm font-semibold text-[#f4f4f5]">
              You haven&apos;t connected with anyone yet.
            </h3>
            <p className="text-xs text-[#71717a] max-w-xs mx-auto">
              Add friends in Connect to invite them to shared plans and events.
            </p>
            <div className="pt-2">
              <Link
                href="/friend-requests"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#202026] hover:bg-[#282830] text-[#f4f4f5] text-xs font-semibold border border-[#25252b] transition-colors"
              >
                <UserPlus size={13} className="text-[#6E53CC]" />
                <span>Find friends</span>
              </Link>
            </div>
          </div>
        ) : filteredFriends.length === 0 ? (
          /* No Search Results State */
          <div className="p-6 rounded-xl bg-[#17171b] border border-[#25252b] text-center space-y-1">
            <p className="text-xs font-semibold text-[#f4f4f5]">No connections found.</p>
            <p className="text-[11px] text-[#71717a]">
              Try searching with a different name or username.
            </p>
          </div>
        ) : (
          /* Available Connections Scrollable List */
          <div className="max-h-[240px] overflow-y-auto scrollbar-none space-y-1.5 pr-0.5">
            {filteredFriends.map((f) => {
              const isSelected = selectedParticipantIds.includes(f.id);
              const username =
                f.username || f.name.toLowerCase().replace(/\s+/g, "");

              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => toggleParticipant(f.id)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? "bg-[rgba(110,83,204,0.18)]/75 border-[#6E53CC] shadow-xs"
                      : "bg-[#17171b]/60 border-[#25252b] hover:bg-[#202026] hover:border-[#6E53CC]/30"
                  }`}
                  aria-pressed={isSelected}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-9 h-9 rounded-full bg-[#202026] border border-[#25252b] flex items-center justify-center font-bold text-xs text-[#f4f4f5] shrink-0">
                      {f.name.slice(0, 1).toUpperCase()}
                      {f.online && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#22c55e] ring-2 ring-[#101012]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="block text-xs font-semibold text-[#f4f4f5] truncate">
                        {f.name}
                      </span>
                      <span className="block text-[11px] text-[#71717a] truncate">
                        @{username}
                      </span>
                    </div>
                  </div>

                  {/* Selection Checkbox */}
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? "bg-[#6E53CC] border-[#6E53CC] text-white"
                        : "bg-[#18181c] border-[#3f3f46]"
                    }`}
                  >
                    {isSelected && <Check size={13} strokeWidth={3} />}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
