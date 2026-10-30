"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/shared/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/shared/components/ui/dialog";
import { getPlan, updatePlan, updatePlanStatus } from "@/src/features/Chat/api/planApi";
import { Plan, PlanStatus, UpdatePlanInput } from "@/src/features/Chat/types/plans";
import { PlaceInput } from "@/src/features/Chat/ui/PlaceInput";
import { PlanPollPanel } from "@/src/features/Chat/ui/PlanPollPanel";

interface Props {
  plan: Plan;
  currentUserId?: string;
  onPlanChanged: (plan: Plan) => void;
  refreshToken?: number;
}

function toLocalInput(value?: string): string {
  if (!value) return "";
  const date = new Date(value);
  const part = (number: number) => String(number).padStart(2, "0");
  return `${date.getFullYear()}-${part(date.getMonth() + 1)}-${part(date.getDate())}T${part(date.getHours())}:${part(date.getMinutes())}`;
}

function toStatusLabel(status: PlanStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function PlanDetailsDialog({ plan, currentUserId, onPlanChanged, refreshToken = 0 }: Props) {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState(plan);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [title, setTitle] = useState(plan.title);
  const [description, setDescription] = useState(plan.description ?? "");
  const [startAt, setStartAt] = useState(toLocalInput(plan.startAt));
  const [endAt, setEndAt] = useState(toLocalInput(plan.endAt));
  const [location, setLocation] = useState(plan.location ?? "");
  const [error, setError] = useState("");
  const isCreator = Boolean(currentUserId && currentUserId === detail.creatorId);

  function replacePlan(next: Plan) {
    setDetail(next);
    onPlanChanged(next);
  }

  function beginEdit(value: Plan) {
    setTitle(value.title);
    setDescription(value.description ?? "");
    setStartAt(toLocalInput(value.startAt));
    setEndAt(toLocalInput(value.endAt));
    setLocation(value.location ?? "");
    setEditing(true);
    setError("");
  }

  useEffect(() => {
    if (!open) return;
    let active = true;
    setLoading(true);
    setError("");
    getPlan(plan.id)
      .then((fresh) => {
        if (!active) return;
        setDetail(fresh);
        onPlanChanged(fresh);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "Could not load plan details.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [open, plan.id, onPlanChanged, refreshToken]);

  async function submitEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!title.trim() || !startAt) {
      setError("Add a title and start time.");
      return;
    }
    const startDate = new Date(startAt);
    const endDate = endAt ? new Date(endAt) : undefined;
    if (Number.isNaN(startDate.getTime()) || (endDate && (Number.isNaN(endDate.getTime()) || endDate <= startDate))) {
      setError("Choose a valid start time and an end time after it.");
      return;
    }
    const input: UpdatePlanInput = {
      title: title.trim(),
      startAt: startAt === toLocalInput(detail.startAt) ? detail.startAt : startDate.toISOString(),
      expectedUpdatedAt: detail.updatedAt,
      ...(description.trim() && { description: description.trim() }),
      ...(endDate && { endAt: endAt === toLocalInput(detail.endAt) ? detail.endAt : endDate.toISOString() }),
      ...(location.trim() && { location: location.trim() }),
    };
    setSaving(true);
    try {
      replacePlan(await updatePlan(detail.id, input));
      setEditing(false);
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "Could not update this plan.";
      if (message.toLowerCase().includes("changed")) {
        try {
          const fresh = await getPlan(detail.id);
          replacePlan(fresh);
          beginEdit(fresh);
          setError("This plan changed elsewhere. Latest details are loaded; edit again to apply your changes.");
        } catch {
          setError(message);
        }
      } else {
        setError(message);
      }
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(status: PlanStatus) {
    setSaving(true);
    setError("");
    try {
      replacePlan(await updatePlanStatus(detail.id, status, detail.updatedAt));
      if (status === "cancelled") setCancelConfirmOpen(false);
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "Could not update this plan.";
      if (message.toLowerCase().includes("changed")) {
        try { replacePlan(await getPlan(detail.id)); } catch { /* retain the conflict message */ }
      }
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button type="button" className="mt-2 text-sm underline" onClick={() => setOpen(true)}>Plan details</button>
      <Dialog open={open} onOpenChange={(next) => { if (!saving) { setOpen(next); if (!next) setEditing(false); } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit plan" : detail.title}</DialogTitle>
            <DialogDescription>{editing ? "Update the plan details." : "Plan details and status."}</DialogDescription>
          </DialogHeader>
          {loading && <p role="status">Loading plan…</p>}
          {!loading && editing ? <form id={`edit-plan-${detail.id}`} onSubmit={submitEdit} className="grid gap-4">
            <label className="grid gap-1.5 text-sm font-medium">Title
              <input className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={200} required />
            </label>
            <label className="grid gap-1.5 text-sm font-medium">Description
              <textarea className="min-h-20 rounded-md border border-input bg-background px-3 py-2 text-sm" value={description} onChange={(event) => setDescription(event.target.value)} />
            </label>
            <label className="grid gap-1.5 text-sm font-medium">Start
              <input type="datetime-local" step="1" className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={startAt} onChange={(event) => setStartAt(event.target.value)} required />
            </label>
            <label className="grid gap-1.5 text-sm font-medium">End <span className="font-normal text-muted-foreground">Optional</span>
              <input type="datetime-local" step="1" className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={endAt} onChange={(event) => setEndAt(event.target.value)} />
            </label>
            <PlaceInput value={location} onChange={setLocation} label="Location" placeholder="Place name or address" />
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          </form> : !loading && <div className="grid gap-3 text-sm">
            <p><strong>Status:</strong> {toStatusLabel(detail.status)}{detail.status === "cancelled" && " — This plan was cancelled."}</p>
            <p><strong>Created by:</strong> {detail.creatorName || (currentUserId === detail.creatorId ? "you" : detail.creatorId)}</p>
            <p><strong>Starts:</strong> {new Date(detail.startAt).toLocaleString()}</p>
            {detail.endAt && <p><strong>Ends:</strong> {new Date(detail.endAt).toLocaleString()}</p>}
            {detail.description && <p><strong>Description:</strong> {detail.description}</p>}
            {detail.location && <p><strong>Location:</strong> {detail.location}</p>}
            <p className="text-xs text-muted-foreground">Last updated {new Date(detail.updatedAt).toLocaleString()}</p>
            <PlanPollPanel planId={detail.id} planStatus={detail.status} isCreator={isCreator} refreshToken={refreshToken} />
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          </div>}
          <DialogFooter>
            {isCreator && !editing && detail.status !== "cancelled" && <>
              <button type="button" className="rounded-md border px-4 py-2 text-sm" disabled={saving || loading} onClick={() => beginEdit(detail)}>Edit</button>
              <label className="flex items-center gap-2 text-sm">Status
                <select aria-label="Plan status" className="h-10 rounded-md border border-input bg-background px-2 text-sm" value={detail.status} disabled={saving || loading} onChange={(event) => void changeStatus(event.target.value as PlanStatus)}>
                  <option value="open">Open</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                </select>
              </label>
              <button type="button" className="rounded-md border border-destructive px-4 py-2 text-sm text-destructive" disabled={saving || loading} onClick={() => setCancelConfirmOpen(true)}>Cancel plan</button>
            </>}
            {editing && <>
              <button type="button" className="rounded-md border px-4 py-2 text-sm" disabled={saving} onClick={() => setEditing(false)}>Back</button>
              <button type="submit" form={`edit-plan-${detail.id}`} className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-60" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
            </>}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={cancelConfirmOpen} onOpenChange={(next) => { if (!saving) setCancelConfirmOpen(next); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this plan?</AlertDialogTitle>
            <AlertDialogDescription>Participants’ responses will be kept, and everyone in the conversation will see that the plan was cancelled.</AlertDialogDescription>
          </AlertDialogHeader>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Keep plan</AlertDialogCancel>
            <AlertDialogAction disabled={saving} onClick={(event) => { event.preventDefault(); void changeStatus("cancelled"); }}>{saving ? "Cancelling…" : "Cancel plan"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
