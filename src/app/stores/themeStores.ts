"use client";

import { create } from "zustand";
import { applyTheme } from "@/src/lib/theme/theme";

export type ThemeMode = "dark" | "light";
export type ThemePalette = "default" | "retro" | "pomegranate";

export interface CustomThemeColors {
  background: string;
  foreground: string;
  primary: string;
}

export interface ThemeState {
  mode: ThemeMode;
  palette: ThemePalette;
  customColors: CustomThemeColors | null;
}

interface ThemeStore extends ThemeState {
  setMode: (mode: ThemeMode) => void;
  setPalette: (palette: ThemePalette) => void;
  setCustomColors: (colors: CustomThemeColors) => void;
  clearCustom: () => void;
  toggleMode: () => void;
  /** @deprecated use mode — kept for gradual migration */
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const STORAGE_MODE = "theme-mode";
const STORAGE_PALETTE = "theme-palette";
const STORAGE_CUSTOM = "theme-custom";

function persist(state: ThemeState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_MODE, state.mode);
  localStorage.setItem(STORAGE_PALETTE, state.palette);
  if (state.customColors) {
    localStorage.setItem(STORAGE_CUSTOM, JSON.stringify(state.customColors));
  } else {
    localStorage.removeItem(STORAGE_CUSTOM);
  }
  localStorage.setItem("theme", state.mode);
}

function commit(state: ThemeState) {
  persist(state);
  applyTheme(state);
}

export function loadThemeFromStorage(): ThemeState {
  if (typeof window === "undefined") {
    return { mode: "dark", palette: "default", customColors: null };
  }

  const legacy = localStorage.getItem("theme");
  const mode =
    (localStorage.getItem(STORAGE_MODE) as ThemeMode | null) ??
    (legacy === "light" || legacy === "dark" ? legacy : "dark");

  const paletteRaw = localStorage.getItem(STORAGE_PALETTE);
  const palette: ThemePalette =
    paletteRaw === "retro" || paletteRaw === "pomegranate"
      ? paletteRaw
      : "default";

  let customColors: CustomThemeColors | null = null;
  const customRaw = localStorage.getItem(STORAGE_CUSTOM);
  if (customRaw) {
    try {
      const parsed = JSON.parse(customRaw) as CustomThemeColors;
      if (parsed.background && parsed.foreground && parsed.primary) {
        customColors = parsed;
      }
    } catch {
      customColors = null;
    }
  }

  return { mode, palette, customColors };
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  mode: "dark",
  palette: "default",
  customColors: null,
  theme: "dark",

  setMode: (mode) => {
    const next = { ...get(), mode, theme: mode };
    set({ mode, theme: mode });
    commit(next);
  },

  setPalette: (palette) => {
    const next = {
      ...get(),
      palette,
      customColors: null as CustomThemeColors | null,
    };
    set({ palette, customColors: null });
    commit(next);
  },

  setCustomColors: (colors) => {
    const next = { ...get(), customColors: colors };
    set({ customColors: colors });
    commit(next);
  },

  clearCustom: () => {
    const next = { ...get(), customColors: null };
    set({ customColors: null });
    commit(next);
  },

  toggleMode: () => {
    const current = get().mode;
    get().setMode(current === "dark" ? "light" : "dark");
  },

  setTheme: (mode) => get().setMode(mode),
  toggleTheme: () => get().toggleMode(),
}));
