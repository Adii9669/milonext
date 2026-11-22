"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";

interface PlanDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  error?: string | null;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const WEEKDAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function PlanDatePicker({ value, onChange, error }: PlanDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial view year and month from value or today
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [viewYear, setViewYear] = useState(() => {
    if (value) {
      const parts = value.split("-").map(Number);
      if (parts.length === 3 && !isNaN(parts[0])) return parts[0];
    }
    return today.getFullYear();
  });

  const [viewMonth, setViewMonth] = useState(() => {
    if (value) {
      const parts = value.split("-").map(Number);
      if (parts.length === 3 && !isNaN(parts[1])) return parts[1] - 1;
    }
    return today.getMonth();
  });

  // Close calendar popover on click outside
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Format readable display date
  const displayLabel = useMemo(() => {
    if (!value) return "Select a date";
    const [y, m, d] = value.split("-").map(Number);
    if (!y || !m || !d) return "Select a date";
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [value]);

  // Navigate months
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Days matrix
  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const days: {
      day: number;
      month: number;
      year: number;
      isCurrentMonth: boolean;
      dateStr: string;
      isPast: boolean;
    }[] = [];

    // Previous month padding
    for (let i = firstDay - 1; i >= 0; i--) {
      const prevDay = daysInPrevMonth - i;
      const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
      const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, "0")}-${String(prevDay).padStart(2, "0")}`;
      const dObj = new Date(prevYear, prevMonth, prevDay);
      days.push({
        day: prevDay,
        month: prevMonth,
        year: prevYear,
        isCurrentMonth: false,
        dateStr,
        isPast: dObj < today,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const dObj = new Date(viewYear, viewMonth, d);
      days.push({
        day: d,
        month: viewMonth,
        year: viewYear,
        isCurrentMonth: true,
        dateStr,
        isPast: dObj < today,
      });
    }

    // Next month padding
    const remaining = (7 - (days.length % 7)) % 7;
    for (let n = 1; n <= remaining; n++) {
      const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
      const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, "0")}-${String(n).padStart(2, "0")}`;
      const dObj = new Date(nextYear, nextMonth, n);
      days.push({
        day: n,
        month: nextMonth,
        year: nextYear,
        isCurrentMonth: false,
        dateStr,
        isPast: dObj < today,
      });
    }

    return days;
  }, [viewYear, viewMonth, today]);

  const handleSelectDay = (dateStr: string, isPast: boolean) => {
    if (isPast) return;
    onChange(dateStr);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="space-y-1.5 relative">
      <label
        htmlFor="plan-date-button"
        className="text-xs font-semibold text-[#f4f4f5] flex items-center gap-1"
      >
        <span>Date</span>
        <span className="text-red-400" aria-hidden="true">*</span>
      </label>

      {/* Trigger Button */}
      <button
        id="plan-date-button"
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className={`w-full h-10 px-3.5 rounded-lg bg-[#18181c] text-sm text-left flex items-center justify-between border transition-colors focus:outline-none focus:ring-1 ${
          error
            ? "border-red-500/60 focus:border-red-500 focus:ring-red-500"
            : isOpen
            ? "border-[#6E53CC] ring-1 ring-[#6E53CC]"
            : "border-[#25252b] hover:border-[#383842] focus:border-[#6E53CC] focus:ring-[#6E53CC]"
        }`}
      >
        <span className={value ? "text-[#f4f4f5]" : "text-[#71717a]"}>
          {displayLabel}
        </span>
        <CalendarIcon size={16} className="text-[#6E53CC] shrink-0" />
      </button>

      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1.5 mt-1 animate-in fade-in-50 duration-150">
          <AlertCircle size={13} className="shrink-0" />
          <span>{error}</span>
        </p>
      )}

      {/* Calendar Popover */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Choose date"
          className="absolute left-0 top-full mt-1.5 z-50 w-[290px] rounded-xl bg-[#101012] border border-[#25252b] shadow-2xl p-3 animate-in fade-in-50 zoom-in-95 duration-150 select-none"
        >
          {/* Calendar Header with Month Navigation */}
          <div className="flex items-center justify-between mb-2.5 px-1">
            <span className="text-xs font-bold text-[#f4f4f5]">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 rounded-md text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#17171b] transition-colors"
                title="Previous month"
                aria-label="Previous month"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 rounded-md text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#17171b] transition-colors"
                title="Next month"
                aria-label="Next month"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {WEEKDAY_NAMES.map((name) => (
              <span key={name} className="text-[10px] font-semibold text-[#71717a]">
                {name}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {calendarDays.map((item, idx) => {
              const isSelected = value === item.dateStr;
              const isToday =
                today.getFullYear() === item.year &&
                today.getMonth() === item.month &&
                today.getDate() === item.day;

              return (
                <button
                  key={`${item.dateStr}-${idx}`}
                  type="button"
                  disabled={item.isPast}
                  onClick={() => handleSelectDay(item.dateStr, item.isPast)}
                  className={`h-7 w-7 rounded-lg text-xs flex items-center justify-center font-medium transition-colors mx-auto ${
                    isSelected
                      ? "bg-[#6E53CC] text-white font-bold shadow-sm shadow-[#6E53CC]/30"
                      : item.isPast
                      ? "text-[#40404a] cursor-not-allowed"
                      : !item.isCurrentMonth
                      ? "text-[#555562] hover:bg-[#18181c] hover:text-[#a1a1aa]"
                      : isToday
                      ? "bg-[rgba(110,83,204,0.18)] text-[#6E53CC] border border-[#6E53CC]/50"
                      : "text-[#f4f4f5] hover:bg-[#17171b]"
                  }`}
                >
                  {item.day}
                </button>
              );
            })}
          </div>

          {/* Quick shortcuts footer */}
          <div className="mt-2.5 pt-2 border-t border-[#25252b] flex items-center justify-between text-[11px]">
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                const dStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
                onChange(dStr);
                setViewYear(now.getFullYear());
                setViewMonth(now.getMonth());
                setIsOpen(false);
              }}
              className="text-[#6E53CC] hover:underline font-medium"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                const dStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;
                onChange(dStr);
                setViewYear(tomorrow.getFullYear());
                setViewMonth(tomorrow.getMonth());
                setIsOpen(false);
              }}
              className="text-[#a1a1aa] hover:text-[#f4f4f5]"
            >
              Tomorrow
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
