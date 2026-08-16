"use client";

import { useEffect, useState } from "react";
import { Sun, Moon, RotateCcw } from "lucide-react";
import {
  useThemeStore,
  type ThemePalette,
  type CustomThemeColors,
} from "@/src/app/stores/themeStores";

const PALETTES: { id: ThemePalette; label: string }[] = [
  { id: "default", label: "Default" },
  { id: "retro", label: "Retro" },
  { id: "pomegranate", label: "Pomegranate" },
];

const DEFAULT_CUSTOM: CustomThemeColors = {
  background: "#0d0e13",
  foreground: "#f5f7fa",
  primary: "#00e5ff",
};

export default function ThemeCustomizer() {
  const mode = useThemeStore((s) => s.mode);
  const palette = useThemeStore((s) => s.palette);
  const customColors = useThemeStore((s) => s.customColors);
  const toggleMode = useThemeStore((s) => s.toggleMode);
  const setPalette = useThemeStore((s) => s.setPalette);
  const setCustomColors = useThemeStore((s) => s.setCustomColors);
  const clearCustom = useThemeStore((s) => s.clearCustom);

  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<CustomThemeColors>(DEFAULT_CUSTOM);

  useEffect(() => {
    setMounted(true);
    if (customColors) setDraft(customColors);
    else setDraft(DEFAULT_CUSTOM);
  }, [customColors]);

  if (!mounted) return null;

  const updateDraft = (key: keyof CustomThemeColors, value: string) => {
    const next = { ...draft, [key]: value };
    setDraft(next);
  };

  const applyCustom = () => {
    setCustomColors({ ...draft });
    setOpen(true);
  };

  const resetAll = () => {
    clearCustom();
    setPalette("default");
    setDraft(DEFAULT_CUSTOM);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {open && (
        <div
          className="w-72 rounded-xl border border-border bg-surface p-4 shadow-[var(--shadow-soft)] text-text-primary"
          role="dialog"
          aria-label="Theme customizer"
        >
          <p className="text-xs uppercase tracking-widest text-text-muted mb-3">
            Appearance
          </p>

          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-text-secondary">Mode</span>
            <button
              type="button"
              onClick={toggleMode}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-surface-elevated hover:bg-surface-hover transition text-sm"
            >
              {mode === "dark" ? (
                <>
                  <Sun className="w-4 h-4 text-primary" /> Light
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-primary" /> Dark
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-text-muted mb-2">Preset palette</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {PALETTES.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPalette(p.id)}
                className={`px-3 py-1 text-xs rounded-full border transition ${
                  palette === p.id && !customColors
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-surface-elevated hover:bg-surface-hover text-text-secondary"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <p className="text-xs text-text-muted mb-2">Custom colors</p>
          <div className="space-y-3 mb-4">
            {(
              [
                ["background", "Background"],
                ["foreground", "Text"],
                ["primary", "Accent"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="flex items-center gap-2">
                <label className="text-xs text-text-secondary w-20 shrink-0">
                  {label}
                </label>
                <input
                  type="color"
                  value={draft[key]}
                  onChange={(e) => updateDraft(key, e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border border-border bg-transparent"
                />
                <input
                  type="text"
                  value={draft[key]}
                  onChange={(e) => updateDraft(key, e.target.value)}
                  className="flex-1 min-w-0 px-2 py-1 text-xs rounded border border-border bg-background text-foreground font-mono"
                />
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={applyCustom}
              className="flex-1 px-3 py-2 text-xs rounded-md bg-primary text-primary-foreground hover:opacity-90 transition"
            >
              Apply custom
            </button>
            <button
              type="button"
              onClick={resetAll}
              className="px-3 py-2 text-xs rounded-md border border-border hover:bg-surface-hover transition"
              title="Reset to default"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {customColors && (
            <p className="mt-2 text-[10px] text-text-muted text-center">
              Custom theme active
            </p>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="px-4 py-2 rounded-full border border-border bg-surface-elevated text-sm text-text-primary shadow-[var(--shadow-soft)] hover:bg-surface-hover transition"
      >
        {open ? "Close theme" : "Customize theme"}
      </button>
    </div>
  );
}
