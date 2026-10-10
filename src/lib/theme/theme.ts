import type { ThemeMode, ThemeState } from "@/src/app/stores/themeStores";

export function applyTheme(state: ThemeState) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;

  // Only dark / light — no palette attributes, no custom vars
  root.setAttribute("data-theme", state.mode);

  // Clean up any legacy attributes from the old multi-theme system
  root.removeAttribute("data-palette");
  root.removeAttribute("data-custom-theme");

  // Remove any inline custom property overrides left from the old system
  const customVars = [
    "--background",
    "--foreground",
    "--primary",
    "--color-background",
    "--color-foreground",
    "--color-primary",
  ] as const;
  for (const key of customVars) {
    root.style.removeProperty(key);
  }
  root.style.removeProperty("color-scheme");
}

export function getSystemTheme(): ThemeMode {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export type { ThemeMode };
