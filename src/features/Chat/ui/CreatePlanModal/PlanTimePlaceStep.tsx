"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";
import { PlanDatePicker } from "./PlanDatePicker";
import { PlanTimePicker } from "./PlanTimePicker";
import { PlanLocationField } from "./PlanLocationField";

interface PlanTimePlaceStepProps {
  date: string;
  onDateChange: (date: string) => void;
  dateError?: string | null;

  startTime: string;
  onStartTimeChange: (time: string) => void;
  startTimeError?: string | null;

  endTime: string;
  onEndTimeChange: (time: string) => void;
  endTimeError?: string | null;

  location: string;
  onLocationChange: (location: string) => void;

  isStep2Completed?: boolean;
}

export function PlanTimePlaceStep({
  date,
  onDateChange,
  dateError,
  startTime,
  onStartTimeChange,
  startTimeError,
  endTime,
  onEndTimeChange,
  endTimeError,
  location,
  onLocationChange,
  isStep2Completed,
}: PlanTimePlaceStepProps) {
  return (
    <div className="flex-1 p-5 sm:p-6 overflow-y-auto scrollbar-none space-y-4">
      {/* Header Info */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-[#f4f4f5]">
          Time & Place
        </h2>
        <p className="text-xs text-[#a1a1aa] mt-0.5 leading-relaxed">
          Choose when and where this plan will take place.
        </p>
      </div>

      {/* Inline Completion Banner if user validated Step 2 */}
      {isStep2Completed && (
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[rgba(110,83,204,0.18)] border border-[#6E53CC]/40 text-xs text-[#A78BFA] animate-in fade-in-50 duration-200">
          <CheckCircle2 size={16} className="shrink-0 text-[#6E53CC]" />
          <span>
            <strong>Step 2 Time & Place saved!</strong> Proceed to Step 3 (Participants) to invite connections.
          </span>
        </div>
      )}

      {/* 1. Date (Full width) */}
      <PlanDatePicker
        value={date}
        onChange={onDateChange}
        error={dateError}
      />

      {/* 2. Start Time and End Time (Side by side) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <PlanTimePicker
          id="plan-start-time"
          label="Start Time"
          value={startTime}
          onChange={onStartTimeChange}
          required
          error={startTimeError}
        />

        <PlanTimePicker
          id="plan-end-time"
          label="End Time"
          value={endTime}
          onChange={onEndTimeChange}
          optional
          error={endTimeError}
        />
      </div>

      {/* 3. Location (Full width) */}
      <PlanLocationField
        value={location}
        onChange={onLocationChange}
        maxLength={255}
      />
    </div>
  );
}
