"use client";

import { useEffect, useState } from "react";
import { getPlanParticipants, setPlanResponse } from "@/src/features/Chat/api/planApi";
import { PlanParticipationSummary, PlanResponseStatus } from "@/src/features/Chat/types/plans";

interface PlanParticipationPanelProps {
  planId: string;
  currentUserId?: string;
  responseAllowed: boolean;
  refreshToken: number;
}

const responseOptions: Array<{ value: PlanResponseStatus; label: string }> = [
  { value: "in", label: "In" },
  { value: "maybe", label: "Maybe" },
  { value: "cant_make_it", label: "Can't make it" },
];

function responseLabel(response: PlanResponseStatus | null): string {
  switch (response) {
    case "in": return "In";
    case "maybe": return "Maybe";
    case "cant_make_it": return "Can't make it";
    default: return "No response";
  }
}

export function PlanParticipationPanel({ planId, currentUserId, responseAllowed, refreshToken }: PlanParticipationPanelProps) {
  const [summary, setSummary] = useState<PlanParticipationSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setSummary(null);
    setError("");
    getPlanParticipants(planId)
      .then((result) => { if (active) setSummary(result); })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : "Could not load participants."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [planId, refreshToken]);

  const ownResponse = summary?.participants.find((participant) => participant.userId === currentUserId)?.response ?? null;

  const submitResponse = async (response: PlanResponseStatus) => {
    if (saving || response === ownResponse) return;
    setSaving(true);
    setError("");
    try {
      setSummary(await setPlanResponse(planId, response));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not update your response.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-3 border-t border-white/10 pt-3" aria-label="Plan participants">
      {loading && !summary && <p className="text-xs text-white/60">Loading participants…</p>}
      {error && <p role="alert" className="mb-2 text-xs text-red-400">{error}</p>}
      {summary && <>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-white/70" aria-live="polite">
          <span>In: {summary.inCount}</span>
          <span>Maybe: {summary.maybeCount}</span>
          <span>Can't make it: {summary.cantMakeItCount}</span>
          <span>Pending: {summary.pendingResponseCount}</span>
        </div>
        {responseAllowed && currentUserId && summary.participants.some((participant) => participant.userId === currentUserId) && <div className="mt-2 flex flex-wrap gap-2" aria-label="Your response">
          {responseOptions.map((option) => <button
            key={option.value}
            type="button"
            disabled={saving || ownResponse === option.value}
            aria-pressed={ownResponse === option.value}
            onClick={() => void submitResponse(option.value)}
            className="rounded-full border border-white/20 px-2.5 py-1 text-xs text-white disabled:cursor-not-allowed disabled:opacity-50"
          >{option.label}</button>)}
        </div>}
        <ul className="mt-3 space-y-1 text-xs text-white/80">
          {summary.participants.map((participant) => <li key={participant.userId} className="flex justify-between gap-3">
            <span>{participant.name}{participant.userId === currentUserId ? " (you)" : ""}</span>
            <span>{responseLabel(participant.response)}</span>
          </li>)}
        </ul>
      </>}
    </div>
  );
}
