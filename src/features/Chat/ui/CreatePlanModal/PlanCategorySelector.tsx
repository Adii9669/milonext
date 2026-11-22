"use client";

import React from "react";
import {
  MessageCircle,
  Briefcase,
  BookOpen,
  Smile,
  Gamepad2,
  MoreHorizontal,
  type LucideIcon,
} from "lucide-react";

export interface PlanCategoryOption {
  id: string;
  label: string;
  icon: LucideIcon;
}

export const PLAN_CATEGORIES: PlanCategoryOption[] = [
  { id: "general", label: "General", icon: MessageCircle },
  { id: "work", label: "Work", icon: Briefcase },
  { id: "study", label: "Study", icon: BookOpen },
  { id: "fun", label: "Fun", icon: Smile },
  { id: "game", label: "Game", icon: Gamepad2 },
  { id: "other", label: "Other", icon: MoreHorizontal },
];

interface PlanCategorySelectorProps {
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export function PlanCategorySelector({
  selectedCategory,
  onSelectCategory,
}: PlanCategorySelectorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-[#f4f4f5]">
        <span>Category</span>{" "}
        <span className="text-xs font-normal text-[#71717a]">(optional)</span>
      </label>

      <div
        className="grid grid-cols-3 sm:grid-cols-6 gap-2"
        role="radiogroup"
        aria-label="Plan category options"
      >
        {PLAN_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const Icon = cat.icon;

          return (
            <button
              key={cat.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelectCategory(isSelected ? null : cat.id)}
              className={`flex flex-col items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-medium transition-all ${
                isSelected
                  ? "bg-[rgba(110,83,204,0.18)] text-[#6E53CC] border border-[#6E53CC] shadow-sm shadow-[#6E53CC]/10"
                  : "bg-[#17171b] text-[#a1a1aa] border border-[#25252b] hover:text-[#f4f4f5] hover:bg-[#202026] hover:border-[#383842]"
              }`}
            >
              <Icon size={18} className={isSelected ? "text-[#6E53CC]" : "text-[#71717a]"} />
              <span className="truncate">{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
