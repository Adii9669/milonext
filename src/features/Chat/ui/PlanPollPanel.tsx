"use client";

import { FormEvent, useEffect, useState } from "react";
import { createPlanPoll, getPlanPoll, setPlanPollVotes } from "@/src/features/Chat/api/planApi";
import { CreatePlanPollInput, PlanPoll, PlanStatus } from "@/src/features/Chat/types/plans";

interface Props {
  planId: string;
  planStatus: PlanStatus;
  isCreator: boolean;
  refreshToken: number;
}

const canVoteInStatus = (status: PlanStatus) => status === "open" || status === "confirmed";

export function PlanPollPanel({ planId, planStatus, isCreator, refreshToken }: Props) {
  const [poll, setPoll] = useState<PlanPoll | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState("");
  const canVote = canVoteInStatus(planStatus);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getPlanPoll(planId)
      .then((result) => {
        if (!active) return;
        setPoll(result);
        setSelected(result.options.filter((option) => option.selectedByMe).map((option) => option.id));
      })
      .catch((reason: unknown) => {
        if (!active) return;
        const message = reason instanceof Error ? reason.message : "Could not load the poll.";
        if (message.toLowerCase().includes("poll not found")) setPoll(null);
        else setError(message || "Could not load the poll.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [planId, refreshToken]);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const input: CreatePlanPollInput = { question: question.trim(), options: options.map((option) => option.trim()) };
    if (!input.question || input.options.length < 2 || input.options.some((option) => !option) || new Set(input.options.map((option) => option.toLocaleLowerCase())).size !== input.options.length) {
      setError("Add a question and at least two distinct options.");
      return;
    }
    setSaving(true);
    try {
      const result = await createPlanPoll(planId, input);
      setPoll(result);
      setCreating(false);
      setQuestion("");
      setOptions(["", ""]);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not create this poll.");
    } finally {
      setSaving(false);
    }
  }

  async function saveVotes() {
    if (!poll) return;
    setError("");
    setSaving(true);
    try {
      const result = await setPlanPollVotes(planId, selected);
      setPoll(result);
      setSelected(result.options.filter((option) => option.selectedByMe).map((option) => option.id));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not save your votes.");
    } finally {
      setSaving(false);
    }
  }

  function toggleOption(optionId: string) {
    setSelected((current) => current.includes(optionId) ? current.filter((id) => id !== optionId) : [...current, optionId]);
  }

  if (loading) return <section className="grid gap-2 border-t border-border pt-3" aria-label="Plan poll"><p role="status" className="text-sm text-muted-foreground">Loading poll…</p></section>;

  if (!poll) {
    return <section className="grid gap-2 border-t border-border pt-3" aria-label="Plan poll">
      <h3 className="font-semibold">Poll</h3>
      {isCreator && canVote && !creating && <button type="button" className="w-fit rounded-md border px-3 py-2 text-sm" onClick={() => setCreating(true)}>Add a poll</button>}
      {!isCreator && <p className="text-sm text-muted-foreground">No poll has been added to this plan.</p>}
      {creating && <form onSubmit={create} className="grid gap-3">
        <label className="grid gap-1.5 text-sm font-medium">Question
          <input className="h-10 rounded-md border border-input bg-background px-3 text-sm" maxLength={240} value={question} onChange={(event) => setQuestion(event.target.value)} required />
        </label>
        {options.map((option, index) => <label key={index} className="grid gap-1.5 text-sm font-medium">Option {index + 1}
          <input className="h-10 rounded-md border border-input bg-background px-3 text-sm" maxLength={200} value={option} onChange={(event) => setOptions((current) => current.map((value, position) => position === index ? event.target.value : value))} required />
        </label>)}
        <div className="flex gap-2">
          <button type="button" className="rounded-md border px-3 py-2 text-sm disabled:opacity-50" disabled={options.length >= 10 || saving} onClick={() => setOptions((current) => [...current, ""])}>Add option</button>
          {options.length > 2 && <button type="button" className="rounded-md border px-3 py-2 text-sm" disabled={saving} onClick={() => setOptions((current) => current.slice(0, -1))}>Remove last option</button>}
        </div>
        <div className="flex gap-2">
          <button type="button" className="rounded-md border px-3 py-2 text-sm" disabled={saving} onClick={() => { setCreating(false); setError(""); }}>Back</button>
          <button type="submit" className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground disabled:opacity-60" disabled={saving}>{saving ? "Creating…" : "Create poll"}</button>
        </div>
      </form>}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    </section>;
  }

  return <section className="grid gap-3 border-t border-border pt-3" aria-label="Plan poll">
    <div><h3 className="font-semibold">Poll</h3><p className="text-sm">{poll.question}</p></div>
    <div className="grid gap-2">
      {poll.options.map((option) => <label key={option.id} className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm">
        {canVote && <input type="checkbox" checked={selected.includes(option.id)} onChange={() => toggleOption(option.id)} disabled={saving} />}
        <span className="min-w-0 flex-1">{option.text}</span><span className="text-xs text-muted-foreground">{option.voteCount} {option.voteCount === 1 ? "vote" : "votes"}</span>
      </label>)}
    </div>
    {canVote && <button type="button" className="w-fit rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground disabled:opacity-60" disabled={saving} onClick={() => void saveVotes()}>{saving ? "Saving…" : "Save my votes"}</button>}
    {!canVote && <p className="text-xs text-muted-foreground">Voting is closed for this plan.</p>}
    <p className="text-xs text-muted-foreground">You can select multiple options. Votes do not change the plan time.</p>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
  </section>;
}
