"use client";

import React from "react";
import { CheckCircle2, Sparkles } from "lucide-react";
import { PlanTitleField } from "./PlanTitleField";
import { PlanDescriptionField } from "./PlanDescriptionField";
import { PlanCategorySelector } from "./PlanCategorySelector";

interface PlanDetailsStepProps {
  title: string;
  onTitleChange: (value: string) => void;
  titleError?: string | null;
  description: string;
  onDescriptionChange: (value: string) => void;
  category: string | null;
  onCategoryChange: (value: string | null) => void;
  isStep1Completed?: boolean;
}

export function PlanDetailsStep({
  title,
  onTitleChange,
  titleError,
  description,
  onDescriptionChange,
  category,
  onCategoryChange,
  isStep1Completed,
}: PlanDetailsStepProps) {
  return (
    <div className="flex-1 p-5 sm:p-6 overflow-y-auto scrollbar-none space-y-4">
      {/* Header Info */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-[#f4f4f5]">
          Plan Details
        </h2>
        <p className="text-xs text-[#a1a1aa] mt-0.5 leading-relaxed">
          Give your plan a clear title and description so participants know what to expect.
        </p>
      </div>

      {/* Inline Completion Banner if user validated Step 1 */}
      {isStep1Completed && (
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[rgba(110,83,204,0.18)] border border-[#6E53CC]/40 text-xs text-[#A78BFA] animate-in fade-in-50 duration-200">
          <CheckCircle2 size={16} className="shrink-0 text-[#6E53CC]" />
          <span>
            <strong>Step 1 Details saved!</strong> Step 2 (Time & Place) will be enabled in the upcoming release.
          </span>
        </div>
      )}

      {/* Field 1: Title */}
      <PlanTitleField
        value={title}
        onChange={onTitleChange}
        error={titleError}
        maxLength={100}
      />

      {/* Field 2: Description */}
      <PlanDescriptionField
        value={description}
        onChange={onDescriptionChange}
        maxLength={500}
      />

      {/* Field 3: Category */}
      <PlanCategorySelector
        selectedCategory={category}
        onSelectCategory={onCategoryChange}
      />
    </div>
  );
}
