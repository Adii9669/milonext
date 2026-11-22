"use client";

import React from "react";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

interface PlanModalFooterProps {
  currentStep: number;
  onCancel: () => void;
  onBack: () => void;
  onNext: () => void;
  isNextDisabled?: boolean;
  isSubmitting?: boolean;
}

export function PlanModalFooter({
  currentStep,
  onCancel,
  onBack,
  onNext,
  isNextDisabled = false,
  isSubmitting = false,
}: PlanModalFooterProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-[#25252b] bg-[#101012] shrink-0">
      {/* Left Action: Cancel on Step 1, Back on Steps 2-4 */}
      {currentStep === 1 ? (
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 rounded-lg bg-[#17171b] hover:bg-[#202026] text-[#f4f4f5] border border-[#25252b] text-xs font-semibold transition-colors focus:outline-none focus:ring-1 focus:ring-[#6E53CC] disabled:opacity-50 cursor-pointer"
        >
          Cancel
        </button>
      ) : (
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#17171b] hover:bg-[#202026] text-[#f4f4f5] border border-[#25252b] text-xs font-semibold transition-colors focus:outline-none focus:ring-1 focus:ring-[#6E53CC] disabled:opacity-50 cursor-pointer"
        >
          <ArrowLeft size={15} />
          <span>Back</span>
        </button>
      )}

      {/* Right Action: Next on Steps 1-3, Create Plan on Step 4 */}
      <button
        type="button"
        onClick={onNext}
        disabled={isNextDisabled || isSubmitting}
        className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#6E53CC] hover:bg-[#A78BFA] text-white text-xs font-semibold transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-[#6E53CC] cursor-pointer"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            <span>Creating plan…</span>
          </>
        ) : currentStep === 4 ? (
          <span>Create Plan</span>
        ) : (
          <>
            <span>Next</span>
            <ArrowRight size={15} />
          </>
        )}
      </button>
    </div>
  );
}
