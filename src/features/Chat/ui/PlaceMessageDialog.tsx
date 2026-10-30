"use client";

import { FormEvent, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/src/shared/components/ui/dialog";
import { PlaceInput } from "@/src/features/Chat/ui/PlaceInput";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (place: string) => void;
}

export function PlaceMessageDialog({ open, onOpenChange, onSubmit }: Props) {
  const [place, setPlace] = useState("");
  const [error, setError] = useState("");

  function close(nextOpen: boolean) {
    if (!nextOpen) {
      setPlace("");
      setError("");
    }
    onOpenChange(nextOpen);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = place.trim();
    if (!value) {
      setError("Enter a place to share.");
      return;
    }
    onSubmit(value);
    close(false);
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share a place</DialogTitle>
          <DialogDescription>Enter a place name or address to share in this conversation.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4">
          <PlaceInput value={place} onChange={setPlace} label="Place name or address" placeholder="Cafe, venue, or address" />
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <button type="button" className="rounded-md border px-4 py-2 text-sm" onClick={() => close(false)}>Cancel</button>
            <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">Share place</button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
