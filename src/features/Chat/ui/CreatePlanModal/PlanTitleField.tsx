"use client";

import React from "react";
import { AlertCircle } from "lucide-react";

interface PlanTitleFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  maxLength?: number;
}

export function PlanTitleField({
  value,
  onChange,
  error,
  maxLength = 100,
}: PlanTitleFieldProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label
          htmlFor="plan-title-input"
          className="text-xs font-semibold text-[#f4f4f5] flex items-center gap-1"
        >
          <span>Title</span>
          <span className="text-red-400" aria-hidden="true">*</span>
        </label>
        <span
          className={`text-xs tabular-nums ${
            value.length >= maxLength ? "text-red-400" : "text-[#71717a]"
          }`}
          aria-live="polite"
        >
          {value.length}/{maxLength}
        </span>
      </div>

      <input
        id="plan-title-input"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
        placeholder="e.g. Team Meeting, Movie Night, Project Discussion..."
        maxLength={maxLength}
        aria-required="true"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? "plan-title-error" : undefined}
        className={`w-full h-10 px-3.5 rounded-lg bg-[#18181c] text-sm text-[#f4f4f5] placeholder-[#71717a] border transition-colors focus:outline-none focus:ring-1 ${
          error
            ? "border-red-500/60 focus:border-red-500 focus:ring-red-500"
            : "border-[#25252b] focus:border-[#6E53CC] focus:ring-[#6E53CC]"
        }`}
      />

      {error && (
        <p
          id="plan-title-error"
          role="alert"
          className="text-xs text-red-400 flex items-center gap-1.5 mt-1 animate-in fade-in-50 duration-150"
        >
          <AlertCircle size={13} className="shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
