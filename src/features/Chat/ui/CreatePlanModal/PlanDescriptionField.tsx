"use client";

import React from "react";

interface PlanDescriptionFieldProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}

export function PlanDescriptionField({
  value,
  onChange,
  maxLength = 500,
}: PlanDescriptionFieldProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label
          htmlFor="plan-description-input"
          className="text-xs font-semibold text-[#f4f4f5] flex items-center gap-1.5"
        >
          <span>Description</span>
          <span className="text-xs font-normal text-[#71717a]">(optional)</span>
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

      <textarea
        id="plan-description-input"
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
        placeholder="Add more details about this plan..."
        maxLength={maxLength}
        className="w-full p-2.5 rounded-lg bg-[#18181c] text-sm text-[#f4f4f5] placeholder-[#71717a] border border-[#25252b] transition-colors focus:outline-none focus:border-[#6E53CC] focus:ring-1 focus:ring-[#6E53CC] resize-none leading-relaxed"
      />
    </div>
  );
}
