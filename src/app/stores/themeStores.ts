"use client";

import { create } from "zustand";
import { applyTheme } from "@/src/lib/theme/theme";

export type ThemeMode = "dark" | "light";

// Kept for backward type-compat — consumers that import these won't break
export type ThemePalette = "default";
export interface CustomThemeColors {
  background: string;
  foreground: string;
  primary: string;
}

export interface ThemeState {
  mode: ThemeMode;
  /** @deprecated no-op — palette system removed */
  palette: ThemePalette;
  /** @deprecated no-op — custom colors removed */
  customColors: CustomThemeColors | null;
}

interface ThemeStore extends ThemeState {
  setMode: (mode: ThemeMode) => void;
  /** @deprecated no-op */
  setPalette: (palette: ThemePalette) => void;
  /** @deprecated no-op */
  setCustomColors: (colors: CustomThemeColors) => void;
  /** @deprecated no-op */
  clearCustom: () => void;
  toggleMode: () => void;
  /** @deprecated use mode */
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const STORAGE_KEY = "theme-mode";

function persist(mode: ThemeMode) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, mode);
  // Keep legacy key in sync so ThemeInitializer still works
  localStorage.setItem("theme", mode);
  // Wipe obsolete keys
  localStorage.removeItem("theme-palette");
  localStorage.removeItem("theme-custom");
}

export function loadThemeFromStorage(): ThemeState {
  if (typeof window === "undefined") {
    return { mode: "dark", palette: "default", customColors: null };
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  const legacy = localStorage.getItem("theme");
  const mode: ThemeMode =
    stored === "light" || stored === "dark"
      ? stored
      : legacy === "light"
        ? "light"
        : "dark";

  return { mode, palette: "default", customColors: null };
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  mode: "dark",
  palette: "default",
  customColors: null,
  theme: "dark",

  setMode: (mode) => {
    set({ mode, theme: mode });
    persist(mode);
    applyTheme({ mode, palette: "default", customColors: null });
  },

  toggleMode: () => {
    const next = get().mode === "dark" ? "light" : "dark";
    get().setMode(next);
  },

  // No-ops — kept so existing call-sites don't break at runtime
  setPalette: () => {},
  setCustomColors: () => {},
  clearCustom: () => {},

  setTheme: (mode) => get().setMode(mode),
  toggleTheme: () => get().toggleMode(),
}));
