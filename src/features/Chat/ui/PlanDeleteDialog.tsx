"use client";

import { useState } from "react";
import { LoaderCircle, Trash2 } from "lucide-react";
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
import { deletePlan } from "@/src/features/Chat/api/planApi";
import { Plan } from "@/src/features/Chat/types/plans";

interface Props {
  plan: Plan;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: (planId: string) => void;
}

export function PlanDeleteDialog({ plan, open, onOpenChange, onDeleted }: Props) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function confirmDelete() {
    setDeleting(true);
    setError("");
    try {
      await deletePlan(plan.id);
      onOpenChange(false);
      onDeleted(plan.id);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not delete this plan.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!deleting) {
          setError("");
          onOpenChange(next);
        }
      }}
    >
      <AlertDialogContent className="border-[#25252b] bg-[#101012] text-[#f4f4f5]">
        <AlertDialogHeader>
          <div className="mb-1 flex size-11 items-center justify-center rounded-full bg-red-500/10 text-red-400">
            <Trash2 size={19} aria-hidden="true" />
          </div>
          <AlertDialogTitle className="text-left">Delete this plan?</AlertDialogTitle>
          <AlertDialogDescription className="text-left text-[#a1a1aa]">
            <span className="font-medium text-[#f4f4f5]">{plan.title}</span> will be permanently removed for everyone in this conversation.
            Participant responses and its poll will also be deleted. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={deleting}
            className="border-[#3f3f46] bg-transparent text-[#f4f4f5] hover:bg-[#27272a] hover:text-[#f4f4f5]"
          >
            Keep plan
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={deleting}
            onClick={(event) => {
              event.preventDefault();
              void confirmDelete();
            }}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {deleting ? (
              <>
                <LoaderCircle size={15} className="mr-2 animate-spin" aria-hidden="true" />
                Deleting…
              </>
            ) : (
              "Delete plan"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
