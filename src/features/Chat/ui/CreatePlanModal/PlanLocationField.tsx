"use client";

import React from "react";
import { MapPin, X } from "lucide-react";

interface PlanLocationFieldProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}

export function PlanLocationField({
  value,
  onChange,
  maxLength = 255,
}: PlanLocationFieldProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label
          htmlFor="plan-location-input"
          className="text-xs font-semibold text-[#f4f4f5] flex items-center gap-1.5"
        >
          <span>Location</span>
          <span className="text-xs font-normal text-[#71717a]">(optional)</span>
        </label>
      </div>

      <div className="relative">
        <MapPin
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6E53CC] pointer-events-none"
        />

        <input
          id="plan-location-input"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
          placeholder="Enter a location or place name..."
          maxLength={maxLength}
          className="w-full h-10 pl-9 pr-9 rounded-lg bg-[#18181c] text-sm text-[#f4f4f5] placeholder-[#71717a] border border-[#25252b] transition-colors focus:outline-none focus:border-[#6E53CC] focus:ring-1 focus:ring-[#6E53CC]"
        />

        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-[#71717a] hover:text-[#f4f4f5] hover:bg-[#202026] transition-colors"
            title="Clear location"
            aria-label="Clear location"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
