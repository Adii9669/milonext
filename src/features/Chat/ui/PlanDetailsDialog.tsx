"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
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
import { PlanDeleteDialog } from "@/src/features/Chat/ui/PlanDeleteDialog";
import { PlanTimePicker } from "@/src/features/Chat/ui/PlanTimePicker";
import { CalendarDays, Clock3, MapPin, Trash2, UserRound } from "lucide-react";

interface Props {
  plan: Plan;
  currentUserId?: string;
  onPlanChanged: (plan: Plan) => void;
  onPlanDeleted?: (planId: string) => void;
  onClose?: () => void;
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

export function PlanDetailsDialog({ plan, currentUserId, onPlanChanged, onPlanDeleted, onClose, refreshToken = 0 }: Props) {
  const [open, setOpen] = useState(true);
  const [detail, setDetail] = useState(plan);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [title, setTitle] = useState(plan.title);
  const [description, setDescription] = useState(plan.description ?? "");
  const [startAt, setStartAt] = useState(toLocalInput(plan.startAt));
  const [endAt, setEndAt] = useState(toLocalInput(plan.endAt));
  const [location, setLocation] = useState(plan.location ?? "");
  const [error, setError] = useState("");
  const isCreator = Boolean(currentUserId && currentUserId === detail.creatorId);
  const onPlanChangedRef = useRef(onPlanChanged);

  useEffect(() => {
    onPlanChangedRef.current = onPlanChanged;
  }, [onPlanChanged]);

  function replacePlan(next: Plan) {
    setDetail(next);
    onPlanChangedRef.current(next);
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

  function updateStartDate(date: string) {
    if (date) setStartAt(`${date}T${startAt.slice(11, 16) || "12:00"}`);
  }

  function updateEndDate(date: string) {
    if (!date) {
      setEndAt("");
      return;
    }
    setEndAt(`${date}T${endAt.slice(11, 16) || startAt.slice(11, 16)}`);
  }

  function updateEndTime(time: string) {
    if (!time) {
      setEndAt("");
      return;
    }
    const date = endAt.slice(0, 10) || startAt.slice(0, 10);
    setEndAt(`${date}T${time}`);
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
        onPlanChangedRef.current(fresh);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "Could not load plan details.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [open, plan.id, refreshToken]);

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
      <Dialog open={open} onOpenChange={(next) => {
        if (!saving) {
          setOpen(next);
          if (!next) {
            setEditing(false);
            onClose?.();
          }
        }
      }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-[#25252b] bg-[#101012] p-0 text-[#f4f4f5] sm:max-w-xl">
          <DialogHeader className="border-b border-[#25252b] px-6 pb-5 pt-6 pr-12">
            <div className="mb-3 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-300">
                <CalendarDays size={13} aria-hidden="true" />
                Plan
              </span>
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                detail.status === "cancelled"
                  ? "bg-red-500/10 text-red-300"
                  : detail.status === "completed"
                    ? "bg-zinc-500/15 text-zinc-300"
                    : detail.status === "confirmed"
                      ? "bg-emerald-500/10 text-emerald-300"
                      : "bg-blue-500/10 text-blue-300"
              }`}>
                {toStatusLabel(detail.status)}
              </span>
            </div>
            <DialogTitle className="text-xl font-semibold leading-tight">
              {editing ? "Edit plan" : detail.title}
            </DialogTitle>
            <DialogDescription className="text-[#a1a1aa]">
              {editing ? "Update the details everyone sees in this conversation." : "Review the schedule, location, and participation for this plan."}
            </DialogDescription>
          </DialogHeader>
          {loading && <p role="status" className="px-6 py-8 text-sm text-[#a1a1aa]">Loading plan details…</p>}
          {!loading && editing ? <form id={`edit-plan-${detail.id}`} onSubmit={submitEdit} className="grid gap-4 py-5">
            <label className="grid gap-1.5 px-6 text-sm font-medium">Title
              <input className="h-10 rounded-md border border-[#3f3f46] bg-[#17171b] px-3 text-sm text-[#f4f4f5]" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={200} required />
            </label>
            <label className="grid gap-1.5 px-6 text-sm font-medium">Description
              <textarea className="min-h-20 rounded-md border border-[#3f3f46] bg-[#17171b] px-3 py-2 text-sm text-[#f4f4f5]" value={description} onChange={(event) => setDescription(event.target.value)} />
            </label>
            <div className="grid grid-cols-1 gap-4 px-6 sm:grid-cols-2">
              <label className="grid min-w-0 gap-1.5 text-sm font-medium">Start date
                <input type="date" className="h-11 min-w-0 rounded-lg border border-[#2a2a32] bg-[#18181c] px-3 text-sm text-[#f4f4f5] focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30" value={startAt.slice(0, 10)} onChange={(event) => updateStartDate(event.target.value)} required />
              </label>
              <PlanTimePicker id={`edit-start-time-${detail.id}`} label="Start time" value={startAt.slice(11, 16)} onChange={(time) => setStartAt(`${startAt.slice(0, 10)}T${time}`)} required />
              <label className="grid min-w-0 gap-1.5 text-sm font-medium">End date <span className="font-normal text-[#a1a1aa]">(optional)</span>
                <input type="date" className="h-11 min-w-0 rounded-lg border border-[#2a2a32] bg-[#18181c] px-3 text-sm text-[#f4f4f5] focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30" value={endAt.slice(0, 10)} onChange={(event) => updateEndDate(event.target.value)} />
              </label>
              <PlanTimePicker id={`edit-end-time-${detail.id}`} label="End time" value={endAt.slice(11, 16)} onChange={updateEndTime} optional />
            </div>
            <div className="px-6"><PlaceInput value={location} onChange={setLocation} label="Location" placeholder="Place name or address" /></div>
            {error && <p role="alert" className="px-6 text-sm text-red-400">{error}</p>}
          </form> : !loading && <div className="grid gap-5 px-6 py-5 text-sm">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-xl border border-[#25252b] bg-[#17171b] p-3.5">
                <CalendarDays size={17} className="mt-0.5 shrink-0 text-blue-400" aria-hidden="true" />
                <div>
                  <p className="text-xs text-[#a1a1aa]">Date &amp; time</p>
                  <p className="mt-1 font-medium text-[#f4f4f5]">{new Date(detail.startAt).toLocaleString([], { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p>
                  <p className="mt-0.5 text-xs text-[#a1a1aa]">
                    {new Date(detail.startAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                    {detail.endAt && ` – ${new Date(detail.endAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-[#25252b] bg-[#17171b] p-3.5">
                <MapPin size={17} className="mt-0.5 shrink-0 text-blue-400" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-xs text-[#a1a1aa]">Location</p>
                  <p className="mt-1 break-words font-medium text-[#f4f4f5]">{detail.location || "No location added"}</p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#a1a1aa]">
              <UserRound size={14} aria-hidden="true" />
              <span>Created by {detail.creatorName || (currentUserId === detail.creatorId ? "you" : "a conversation member")}</span>
              <span aria-hidden="true">·</span>
              <Clock3 size={13} aria-hidden="true" />
              <span>Updated {new Date(detail.updatedAt).toLocaleDateString()}</span>
            </div>
            {detail.description && (
              <section className="border-t border-[#25252b] pt-4">
                <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[#a1a1aa]">About this plan</h3>
                <p className="whitespace-pre-wrap leading-relaxed text-[#e4e4e7]">{detail.description}</p>
              </section>
            )}
            {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
            <section className="border-t border-[#25252b] pt-4">
              <h3 className="mb-3 text-sm font-semibold">Participation &amp; poll</h3>
              <PlanPollPanel planId={detail.id} planStatus={detail.status} isCreator={isCreator} refreshToken={refreshToken} />
            </section>
          </div>}
          <DialogFooter className="border-t border-[#25252b] px-6 py-4">
            {isCreator && !editing && <>
              {detail.status !== "cancelled" && <>
                <button type="button" className="rounded-md border border-[#3f3f46] px-4 py-2 text-sm hover:bg-[#27272a]" disabled={saving || loading} onClick={() => beginEdit(detail)}>Edit details</button>
                <label className="flex items-center gap-2 text-sm text-[#a1a1aa]">Status
                  <select aria-label="Plan status" className="h-10 rounded-md border border-[#3f3f46] bg-[#17171b] px-2 text-sm text-[#f4f4f5]" value={detail.status} disabled={saving || loading} onChange={(event) => void changeStatus(event.target.value as PlanStatus)}>
                    <option value="open">Open</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                  </select>
                </label>
                <button type="button" className="rounded-md border border-[#3f3f46] px-4 py-2 text-sm text-[#fca5a5] hover:bg-red-500/10" disabled={saving || loading} onClick={() => setCancelConfirmOpen(true)}>Cancel plan</button>
              </>}
              <button type="button" className="inline-flex items-center gap-2 rounded-md border border-red-500/30 px-4 py-2 text-sm text-red-300 hover:bg-red-500/10" disabled={saving || loading} onClick={() => setDeleteConfirmOpen(true)}><Trash2 size={14} aria-hidden="true" />Delete</button>
            </>}
            {editing && <>
              <button type="button" className="rounded-md border border-[#3f3f46] px-4 py-2 text-sm hover:bg-[#27272a]" disabled={saving} onClick={() => setEditing(false)}>Back</button>
              <button type="submit" form={`edit-plan-${detail.id}`} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-60" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
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
      <PlanDeleteDialog
        plan={detail}
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onDeleted={(planId) => {
          setOpen(false);
          onClose?.();
          onPlanDeleted?.(planId);
        }}
      />
    </>
  );
}
