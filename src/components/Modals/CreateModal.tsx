"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ReactNode, useState } from "react";

interface CreateModalProps {
  title: string;
  description?: string;
  placeholder?: string;
  confirmText?: string;
  onConfirm: (value: string) => Promise<void> | void;
  children: ReactNode;
}

export default function CreateModal({
  title,
  description,
  placeholder = "",
  confirmText = "Create",
  onConfirm,
  children,
}: CreateModalProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!value.trim()) return;
    setLoading(true);
    try {
      await onConfirm(value.trim());
      setValue("");
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
        />
        <DialogFooter className="mt-4">
          <Button
            disabled={loading}
            onClick={handleConfirm}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? "Creating..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
