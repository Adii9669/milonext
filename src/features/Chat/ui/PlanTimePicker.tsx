"use client";

import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type WheelEvent as ReactWheelEvent } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Clock3, X } from "lucide-react";

interface TimeParts {
  hour: number;
  minute: number;
  period: "AM" | "PM";
}

interface PickerPosition {
  top: number;
  left: number;
  width: number;
}

type WheelValue = string | number;

interface TimeWheelColumnProps<T extends WheelValue> {
  id: string;
  label: string;
  values: readonly T[];
  value: T;
  open: boolean;
  formatValue: (value: T) => string;
  onChange: (value: T) => void;
}

interface PeriodWheelProps {
  id: string;
  value: "AM" | "PM";
  onChange: (value: "AM" | "PM") => void;
}

interface TimeWheelPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  optional?: boolean;
  error?: string | null;
  id: string;
}

const WHEEL_ROW_HEIGHT = 36;
const WHEEL_CYCLES = 9;
const WHEEL_MIDDLE_CYCLE = Math.floor(WHEEL_CYCLES / 2);
const WHEEL_RECENTER_CYCLE = 3;
const WHEEL_GESTURE_SETTLE_MS = 300;
const MOUSE_WHEEL_SETTLE_MS = 520;
const MOUSE_WHEEL_ANIMATION_MS = 420;
const MOUSE_WHEEL_DELTA_THRESHOLD = 80;
const HOUR_VALUES = Array.from({ length: 12 }, (_, index) => index + 1);
const MINUTE_VALUES = Array.from({ length: 60 }, (_, index) => index);
const PERIOD_VALUES = ["AM", "PM"] as const;

function isReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isMouseWheelEvent(event: ReactWheelEvent<HTMLElement>): boolean {
  return event.deltaMode !== WheelEvent.DOM_DELTA_PIXEL ||
    Math.abs(event.deltaY) >= MOUSE_WHEEL_DELTA_THRESHOLD;
}

function TimeWheelColumn<T extends WheelValue>({
  id,
  label,
  values,
  value,
  open,
  formatValue,
  onChange,
}: TimeWheelColumnProps<T>) {
  const wheelRef = useRef<HTMLDivElement>(null);
  const centeredIndexRef = useRef(0);
  const selectedRef = useRef(value);
  const onChangeRef = useRef(onChange);
  const wheelGestureActiveRef = useRef(false);
  const wheelGestureTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wheelAnimationFrameRef = useRef<number | null>(null);
  const [centeredIndex, setCenteredIndex] = useState(0);
  const selectedValueIndex = values.indexOf(value);

  useLayoutEffect(() => {
    selectedRef.current = value;
    onChangeRef.current = onChange;
  });

  useLayoutEffect(() => {
    const wheel = wheelRef.current;
    if (!wheel || !open || selectedValueIndex < 0) return;

    const startIndex = WHEEL_MIDDLE_CYCLE * values.length + selectedValueIndex;
    centeredIndexRef.current = startIndex;
    setCenteredIndex(startIndex);
    wheel.scrollTop = startIndex * WHEEL_ROW_HEIGHT;
  }, [open]);

  useEffect(() => () => {
    if (wheelGestureTimerRef.current) clearTimeout(wheelGestureTimerRef.current);
    if (wheelAnimationFrameRef.current !== null) cancelAnimationFrame(wheelAnimationFrameRef.current);
  }, []);

  function scrollToIndex(index: number, duration = 0) {
    const wheel = wheelRef.current;
    if (!wheel) return;
    if (wheelAnimationFrameRef.current !== null) {
      cancelAnimationFrame(wheelAnimationFrameRef.current);
      wheelAnimationFrameRef.current = null;
    }

    const target = index * WHEEL_ROW_HEIGHT;
    if (duration > 0 && !isReducedMotion()) {
      const start = wheel.scrollTop;
      const distance = target - start;
      const startedAt = performance.now();

      function animate(now: number) {
        const progress = Math.min((now - startedAt) / duration, 1);
        const eased = 1 - (1 - progress) ** 3;
        wheel!.scrollTop = start + distance * eased;
        if (progress < 1) {
          wheelAnimationFrameRef.current = requestAnimationFrame(animate);
        } else {
          wheelAnimationFrameRef.current = null;
        }
      }

      wheelAnimationFrameRef.current = requestAnimationFrame(animate);
      return;
    }

    wheel.scrollTo({
      top: target,
      behavior: isReducedMotion() ? "auto" : "smooth",
    });
  }

  function handleScroll() {
    const wheel = wheelRef.current;
    if (!wheel) return;

    let index = Math.round(wheel.scrollTop / WHEEL_ROW_HEIGHT);
    const cycleLength = values.length;
    const recenterOffset = cycleLength * WHEEL_RECENTER_CYCLE;

    if (index < cycleLength * 2) {
      wheel.scrollTop += recenterOffset * WHEEL_ROW_HEIGHT;
      index += recenterOffset;
    } else if (index >= cycleLength * (WHEEL_CYCLES - 2)) {
      wheel.scrollTop -= recenterOffset * WHEEL_ROW_HEIGHT;
      index -= recenterOffset;
    }

    if (centeredIndexRef.current !== index) {
      centeredIndexRef.current = index;
      setCenteredIndex(index);
    }

    const nextValue = values[((index % cycleLength) + cycleLength) % cycleLength];
    if (nextValue !== selectedRef.current) {
      selectedRef.current = nextValue;
      onChangeRef.current(nextValue);
    }
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    scrollToIndex(centeredIndexRef.current + (event.key === "ArrowDown" ? 1 : -1));
  }

  function handleWheel(event: ReactWheelEvent<HTMLDivElement>) {
    event.preventDefault();
    const mouseWheel = isMouseWheelEvent(event);
    if (!wheelGestureActiveRef.current) {
      wheelGestureActiveRef.current = true;
      scrollToIndex(
        centeredIndexRef.current + (event.deltaY > 0 ? 1 : -1),
        mouseWheel ? MOUSE_WHEEL_ANIMATION_MS : 0,
      );
    }

    if (wheelGestureTimerRef.current) clearTimeout(wheelGestureTimerRef.current);
    wheelGestureTimerRef.current = setTimeout(() => {
      wheelGestureActiveRef.current = false;
      wheelGestureTimerRef.current = null;
    }, mouseWheel
      ? MOUSE_WHEEL_SETTLE_MS
      : WHEEL_GESTURE_SETTLE_MS);
  }

  return (
    <div className="relative min-w-0 flex-1">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[72px] z-10 h-9 rounded-lg border-y border-[#34343d] bg-[#202026]/70"
      />
      <div
        ref={wheelRef}
        role="listbox"
        aria-label={label}
        aria-activedescendant={`${id}-${label}-${centeredIndex}`}
        aria-orientation="vertical"
        tabIndex={0}
        onScroll={handleScroll}
        onWheel={handleWheel}
        onKeyDown={handleKeyDown}
        className="scrollbar-none relative h-[180px] overflow-y-auto overscroll-contain rounded-lg py-[72px] [scroll-snap-type:y_mandatory] [scroll-snap-stop:always] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60"
      >
        {Array.from({ length: WHEEL_CYCLES }, (_, cycle) =>
          values.map((option, optionIndex) => {
            const index = cycle * values.length + optionIndex;
            const distance = Math.abs(index - centeredIndex);
            return (
              <div
                id={`${id}-${label}-${index}`}
                key={`${cycle}-${optionIndex}`}
                role="option"
                aria-selected={index === centeredIndex}
                onClick={() => scrollToIndex(index)}
                className={`flex h-9 cursor-pointer snap-center items-center justify-center tabular-nums transition-[opacity,transform,color] duration-150 ${
                  distance === 0
                    ? "scale-110 text-base font-semibold text-[#f4f4f5]"
                    : "text-sm text-[#a1a1aa]"
                }`}
                style={{
                  opacity: distance === 0 ? 1 : distance === 1 ? 0.78 : distance === 2 ? 0.55 : 0.32,
                }}
              >
                {formatValue(option)}
              </div>
            );
          }),
        )}
      </div>
      <span className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-[#17171b] to-transparent" aria-hidden="true" />
      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#17171b] to-transparent" aria-hidden="true" />
    </div>
  );
}

function PeriodWheel({ id, value, onChange }: PeriodWheelProps) {
  const pointerStart = useRef<{ id: number; y: number } | null>(null);
  const didSwipe = useRef(false);
  const wheelGestureActiveRef = useRef(false);
  const wheelGestureTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [lastDirection, setLastDirection] = useState(value === "PM" ? 1 : -1);
  const [transitionDuration, setTransitionDuration] = useState(200);

  useEffect(() => () => {
    if (wheelGestureTimerRef.current) clearTimeout(wheelGestureTimerRef.current);
  }, []);

  function switchPeriod(direction: number) {
    if (direction === 0) return;
    setLastDirection(direction > 0 ? 1 : -1);
    onChange(direction > 0 ? (value === "AM" ? "PM" : "AM") : (value === "PM" ? "AM" : "PM"));
  }

  return (
    <div
      role="listbox"
      aria-label="AM or PM"
      aria-activedescendant={`${id}-period-${value}`}
      aria-orientation="vertical"
      tabIndex={0}
      onWheel={(event) => {
        event.preventDefault();
        const mouseWheel = isMouseWheelEvent(event);
        setTransitionDuration(mouseWheel ? MOUSE_WHEEL_ANIMATION_MS : 200);
        if (!wheelGestureActiveRef.current) {
          wheelGestureActiveRef.current = true;
          switchPeriod(event.deltaY);
        }

        if (wheelGestureTimerRef.current) clearTimeout(wheelGestureTimerRef.current);
        wheelGestureTimerRef.current = setTimeout(() => {
          wheelGestureActiveRef.current = false;
          wheelGestureTimerRef.current = null;
        }, mouseWheel ? MOUSE_WHEEL_SETTLE_MS : WHEEL_GESTURE_SETTLE_MS);
      }}
      onPointerDown={(event) => {
        didSwipe.current = false;
        pointerStart.current = { id: event.pointerId, y: event.clientY };
      }}
      onPointerUp={(event) => {
        if (pointerStart.current?.id !== event.pointerId) return;
        const distance = event.clientY - pointerStart.current.y;
        if (Math.abs(distance) >= 12) {
          didSwipe.current = true;
          switchPeriod(distance);
        }
        pointerStart.current = null;
      }}
      onPointerCancel={() => {
        pointerStart.current = null;
      }}
      onKeyDown={(event) => {
        if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
        event.preventDefault();
        switchPeriod(event.key === "ArrowDown" ? 1 : -1);
      }}
      className="relative h-[180px] w-14 shrink-0 touch-none overflow-hidden rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[72px] z-10 h-9 rounded-lg border-y border-[#34343d] bg-[#202026]/70"
      />
      {PERIOD_VALUES.map((period) => {
        const selected = value === period;
        const top = selected ? 72 : lastDirection > 0 ? 36 : 108;
        return (
          <button
            id={`${id}-period-${period}`}
            key={period}
            type="button"
            role="option"
            aria-selected={selected}
            onClick={(event) => {
              if (didSwipe.current) {
                event.preventDefault();
                didSwipe.current = false;
                return;
              }
              if (!selected) {
                const direction = period === "PM" ? 1 : -1;
                setLastDirection(direction);
                onChange(period);
              }
            }}
            className={`absolute left-0 z-20 flex h-9 w-full items-center justify-center text-xs transition-[top,opacity,transform,color] ease-out motion-reduce:transition-none ${
              selected
                ? "scale-110 font-semibold text-[#f4f4f5]"
                : "text-[#a1a1aa] opacity-60 hover:text-white"
            }`}
            style={{ top, transitionDuration: `${transitionDuration}ms` }}
          >
            {period}
          </button>
        );
      })}
    </div>
  );
}

function parseTime(value: string): TimeParts | null {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
  if (!match) return null;
  const hour24 = Number(match[1]);
  return {
    hour: hour24 % 12 || 12,
    minute: Number(match[2]),
    period: hour24 >= 12 ? "PM" : "AM",
  };
}

function formatTime(parts: TimeParts): string {
  const hour24 = (parts.hour % 12) + (parts.period === "PM" ? 12 : 0);
  return `${String(hour24).padStart(2, "0")}:${String(parts.minute).padStart(2, "0")}`;
}

function formatDisplayTime(parts: TimeParts): string {
  return `${String(parts.hour).padStart(2, "0")}:${String(parts.minute).padStart(2, "0")} ${parts.period}`;
}

function parseEnteredTime(input: string): TimeParts | null {
  const match = /^\s*(\d{1,2}):(\d{2})\s*(AM|PM)?\s*$/i.exec(input);
  if (!match) return null;

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  const rawPeriod = match[3]?.toUpperCase();
  if (minute > 59) return null;

  if (rawPeriod === "AM" || rawPeriod === "PM") {
    if (hour < 1 || hour > 12) return null;
    return { hour, minute, period: rawPeriod };
  }
  if (rawPeriod) return null;

  if (hour > 23) return null;
  return {
    hour: hour % 12 || 12,
    minute,
    period: hour >= 12 ? "PM" : "AM",
  };
}

export function TimeWheelPicker({
  label,
  value,
  onChange,
  required = false,
  optional = false,
  error,
  id,
}: TimeWheelPickerProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<TimeParts>({ hour: 12, minute: 0, period: "PM" });
  const draftRef = useRef(draft);
  const [inputValue, setInputValue] = useState(() => {
    const parsed = parseTime(value);
    return parsed ? formatDisplayTime(parsed) : "";
  });
  const [inputError, setInputError] = useState("");
  const [position, setPosition] = useState<PickerPosition | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLInputElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const selectedTime = parseTime(value);
  const displayTime = selectedTime ? formatDisplayTime(selectedTime) : "";

  useEffect(() => {
    setInputValue(displayTime);
  }, [displayTime]);

  useEffect(() => {
    if (!open) return;

    function updatePosition() {
      const bounds = triggerRef.current?.getBoundingClientRect();
      if (!bounds) return;
      const width = Math.min(Math.max(bounds.width, 300), window.innerWidth - 24);
      const left = Math.max(12, Math.min(bounds.left, window.innerWidth - width - 12));
      const estimatedHeight = 250;
      const top = bounds.bottom + estimatedHeight < window.innerHeight - 12
        ? bounds.bottom + 8
        : Math.max(12, bounds.top - estimatedHeight - 8);
      setPosition({ top, left, width });
    }

    function handlePointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !rootRef.current?.contains(event.target) &&
        !popupRef.current?.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function showPicker() {
    const initialTime = selectedTime ?? { hour: 12, minute: 0, period: "PM" };
    draftRef.current = initialTime;
    setDraft(initialTime);
    setPosition(null);
    setOpen(true);
  }

  function togglePicker() {
    if (open) {
      setOpen(false);
      return;
    }
    showPicker();
  }

  function updateTime(changes: Partial<TimeParts>) {
    const next = { ...draftRef.current, ...changes };
    draftRef.current = next;
    setDraft(next);
    setInputValue(formatDisplayTime(next));
    setInputError("");
    onChange(formatTime(next));
  }

  function handleInputChange(nextValue: string) {
    setInputValue(nextValue);
    setInputError("");
    const parsed = parseEnteredTime(nextValue);
    if (!parsed) return;

    draftRef.current = parsed;
    setDraft(parsed);
    setOpen(false);
    onChange(formatTime(parsed));
  }

  return (
    <div ref={rootRef} className="relative min-w-0 flex-1 space-y-1.5">
      <label htmlFor={id} className="flex items-center gap-1 text-xs font-semibold text-[#f4f4f5]">
        <span>{label}</span>
        {required && <span className="text-red-400" aria-hidden="true">*</span>}
        {optional && <span className="font-normal text-[#71717a]">(optional)</span>}
      </label>

      <div className="relative flex gap-2">
        <input
          ref={triggerRef}
          id={id}
          type="text"
          inputMode="text"
          autoComplete="off"
          maxLength={8}
          placeholder="Choose or type a time"
          value={inputValue}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-required={required}
          aria-invalid={Boolean(error || inputError)}
          onClick={showPicker}
          onChange={(event) => handleInputChange(event.target.value)}
          onBlur={() => {
            if (inputValue && !parseEnteredTime(inputValue)) {
              setInputError("Enter a time like 9:30 AM or 21:30.");
            }
          }}
          className={`h-11 min-w-0 flex-1 rounded-lg border bg-[#18181c] py-0 pl-10 pr-10 text-sm transition-colors placeholder:text-[#71717a] focus:outline-none focus:ring-2 ${
            error || inputError
              ? "border-red-500/60 focus:ring-red-500/40"
              : open
                ? "border-blue-500/70 ring-2 ring-blue-500/20"
                : "border-[#2a2a32] hover:border-[#454550] focus:ring-blue-500/30"
          }`}
          aria-label={`${label}. Type a time or open the time wheel.`}
        />
        <Clock3
          size={16}
          className={`pointer-events-none absolute left-3.5 top-[13px] ${selectedTime ? "text-blue-400" : "text-[#71717a]"}`}
          aria-hidden="true"
        />
        <button
          type="button"
          onClick={togglePicker}
          className="absolute right-2 top-1 inline-flex size-9 items-center justify-center rounded-md text-[#71717a] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          aria-label={`${open ? "Close" : "Open"} ${label.toLowerCase()} time wheel`}
          aria-expanded={open}
        >
          <ChevronDown size={15} className={`transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
        </button>
        {optional && value && (
          <button
            type="button"
            onClick={() => {
              onChange("");
              setInputValue("");
              setInputError("");
              setOpen(false);
            }}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg border border-[#2a2a32] text-[#a1a1aa] hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300"
            aria-label={`Clear ${label.toLowerCase()}`}
            title={`Clear ${label.toLowerCase()}`}
          >
            <X size={15} aria-hidden="true" />
          </button>
        )}
      </div>

      {open && position && createPortal(
        <div
          ref={popupRef}
          role="dialog"
          aria-label={`Choose ${label.toLowerCase()}`}
          style={{ position: "fixed", top: position.top, left: position.left, width: position.width }}
          className="z-[100] rounded-xl border border-[#34343d] bg-[#17171b] p-3 shadow-[0_18px_50px_rgba(0,0,0,0.65)]"
        >
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="text-xs font-medium text-[#a1a1aa]">Scroll to set time</span>
            <span className="text-xs font-semibold tabular-nums text-blue-300">
              {String(draft.hour).padStart(2, "0")}:{String(draft.minute).padStart(2, "0")} {draft.period}
            </span>
          </div>
          <div className="flex items-center gap-1.5" role="group" aria-label="Time">
            <TimeWheelColumn
              id={id}
              label="Hour"
              values={HOUR_VALUES}
              value={draft.hour}
              open={open}
              formatValue={(hour) => String(hour).padStart(2, "0")}
              onChange={(hour) => updateTime({ hour })}
            />
            <span className="z-20 -mx-1 text-sm font-semibold text-[#71717a]" aria-hidden="true">:</span>
            <TimeWheelColumn
              id={id}
              label="Minute"
              values={MINUTE_VALUES}
              value={draft.minute}
              open={open}
              formatValue={(minute) => String(minute).padStart(2, "0")}
              onChange={(minute) => updateTime({ minute })}
            />
            <PeriodWheel
              id={id}
              value={draft.period}
              onChange={(period) => updateTime({ period })}
            />
          </div>
        </div>,
        document.body,
      )}

      {(error || inputError) && <p role="alert" className="mt-1 text-xs text-red-400">{error || inputError}</p>}
    </div>
  );
}

export const PlanTimePicker = TimeWheelPicker;
