"use client";

import { FormEvent, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/shared/components/ui/dialog";
import { CreatePlanInput } from "@/src/features/Chat/types/plans";
import { PlaceInput } from "@/src/features/Chat/ui/PlaceInput";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: CreatePlanInput) => Promise<void>;
}

function todayLocalDate() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${today.getFullYear()}-${month}-${day}`;
}

export function PlanComposerDialog({ open, onOpenChange, onSubmit }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function close(nextOpen: boolean) {
    if (!nextOpen && saving) return;
    if (!nextOpen) {
      setError("");
      setTitle("");
      setDescription("");
      setDate("");
      setStartTime("");
      setEndTime("");
      setLocation("");
    }
    onOpenChange(nextOpen);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!title.trim() || !date || !startTime) {
      setError("Add a title, date, and start time.");
      return;
    }

    const start = new Date(`${date}T${startTime}`);
    const end = endTime ? new Date(`${date}T${endTime}`) : undefined;
    if (Number.isNaN(start.getTime()) || start <= new Date() || (end && (Number.isNaN(end.getTime()) || end <= start))) {
      setError("Choose a future start time and an end time after it.");
      return;
    }

    const payload: CreatePlanInput = {
      title: title.trim(),
      startAt: start.toISOString(),
      ...(description.trim() && { description: description.trim() }),
      ...(end && { endAt: end.toISOString() }),
      ...(location.trim() && { location: location.trim() }),
    };
    setSaving(true);
    try {
      await onSubmit(payload);
      setTitle("");
      setDescription("");
      setDate("");
      setStartTime("");
      setEndTime("");
      setLocation("");
      onOpenChange(false);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not create this plan.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Make a plan</DialogTitle>
          <DialogDescription>Share a time and place with everyone in this chat.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4">
          <label className="grid gap-1.5 text-sm font-medium">Title
            <input className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={200} required />
          </label>
          <label className="grid gap-1.5 text-sm font-medium">Description <span className="font-normal text-muted-foreground">Optional</span>
            <textarea className="min-h-20 rounded-md border border-input bg-background px-3 py-2 text-sm" value={description} onChange={(event) => setDescription(event.target.value)} />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1.5 text-sm font-medium">Date
              <input type="date" min={todayLocalDate()} className="h-10 min-w-0 rounded-md border border-input bg-background px-3 text-sm" value={date} onChange={(event) => setDate(event.target.value)} required />
            </label>
            <label className="grid gap-1.5 text-sm font-medium">Start time
              <input type="time" className="h-10 min-w-0 rounded-md border border-input bg-background px-3 text-sm" value={startTime} onChange={(event) => setStartTime(event.target.value)} required />
            </label>
          </div>
          <label className="grid gap-1.5 text-sm font-medium">End time <span className="font-normal text-muted-foreground">Optional, same date</span>
            <input type="time" className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={endTime} onChange={(event) => setEndTime(event.target.value)} />
          </label>
          <PlaceInput value={location} onChange={setLocation} label="Location" placeholder="Place name or address" />
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <button type="button" className="rounded-md border px-4 py-2 text-sm" disabled={saving} onClick={() => close(false)}>Cancel</button>
            <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-60" disabled={saving}>{saving ? "Saving…" : "Create plan"}</button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
