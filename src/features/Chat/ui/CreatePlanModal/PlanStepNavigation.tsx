"use client";

import React from "react";
import { Check } from "lucide-react";

export interface PlanStepItem {
  id: number;
  label: string;
  description: string;
}

export const PLAN_STEPS: PlanStepItem[] = [
  { id: 1, label: "Details", description: "Title & category" },
  { id: 2, label: "Time & Place", description: "Date, time, location" },
  { id: 3, label: "Participants", description: "Who can attend" },
  { id: 4, label: "Review", description: "Final confirmation" },
];

interface PlanStepNavigationProps {
  currentStep: number;
  completedSteps: number[];
  onSelectStep?: (step: number) => void;
}

export function PlanStepNavigation({
  currentStep,
  completedSteps,
  onSelectStep,
}: PlanStepNavigationProps) {
  return (
    <nav
      aria-label="Plan creation steps"
      className="w-full md:w-[220px] shrink-0 border-b md:border-b-0 md:border-r border-[#25252b] bg-[#101012] p-4 sm:p-5 flex flex-row md:flex-col gap-2 md:gap-3 overflow-x-auto md:overflow-y-auto scrollbar-none"
    >
      <div className="hidden md:block mb-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#71717a]">
          Steps
        </span>
      </div>

      {PLAN_STEPS.map((step) => {
        const isCurrent = currentStep === step.id;
        const isCompleted = completedSteps.includes(step.id);
        const canClick = isCompleted && step.id !== currentStep;

        return (
          <div
            key={step.id}
            onClick={() => {
              if (canClick && onSelectStep) {
                onSelectStep(step.id);
              }
            }}
            role={canClick ? "button" : undefined}
            tabIndex={canClick ? 0 : undefined}
            onKeyDown={(e) => {
              if (canClick && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                onSelectStep?.(step.id);
              }
            }}
            className={`flex items-center gap-3 p-2.5 rounded-xl transition-all select-none ${
              isCurrent
                ? "bg-[rgba(110,83,204,0.18)] border border-[#6E53CC]/40 text-[#f4f4f5]"
                : isCompleted
                ? "bg-[#17171b] border border-[#25252b] text-[#f4f4f5] hover:bg-[#202026] cursor-pointer"
                : "bg-transparent border border-transparent text-[#71717a] cursor-not-allowed"
            }`}
          >
            {/* Step Number Circle or Completed Check */}
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold transition-colors ${
                isCompleted
                  ? "bg-[#22c55e] text-black"
                  : isCurrent
                  ? "bg-[#6E53CC] text-white"
                  : "bg-[#18181c] border border-[#25252b] text-[#71717a]"
              }`}
            >
              {isCompleted ? <Check size={13} strokeWidth={3} /> : step.id}
            </div>

            {/* Step Label & Subtitle */}
            <div className="min-w-0 text-left">
              <span
                className={`block text-xs font-semibold truncate ${
                  isCurrent
                    ? "text-[#f4f4f5]"
                    : isCompleted
                    ? "text-[#f4f4f5]"
                    : "text-[#71717a]"
                }`}
              >
                {step.label}
              </span>
              <span className="hidden md:block text-[10px] text-[#71717a] truncate">
                {step.description}
              </span>
            </div>
          </div>
        );
      })}
    </nav>
  );
}
