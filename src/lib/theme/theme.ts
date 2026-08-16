import type {
  CustomThemeColors,
  ThemeMode,
  ThemePalette,
  ThemeState,
} from "@/src/app/stores/themeStores";

const CUSTOM_VARS = [
  "--background",
  "--foreground",
  "--primary",
  "--color-background",
  "--color-foreground",
  "--color-primary",
] as const;

export function applyTheme(state: ThemeState) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;

  root.setAttribute("data-theme", state.mode);
  root.setAttribute("data-palette", state.palette);

  if (state.customColors) {
    root.setAttribute("data-custom-theme", "true");
    applyCustomColorVars(state.customColors);
  } else {
    root.removeAttribute("data-custom-theme");
    clearCustomColorVars();
  }
}

function normalizeHex(color: string): string {
  const trimmed = color.trim();
  if (/^#[0-9A-Fa-f]{3}$/.test(trimmed)) {
    const r = trimmed[1];
    const g = trimmed[2];
    const b = trimmed[3];
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return trimmed;
}

function applyCustomColorVars(colors: CustomThemeColors) {
  const root = document.documentElement;
  const background = normalizeHex(colors.background);
  const foreground = normalizeHex(colors.foreground);
  const primary = normalizeHex(colors.primary);

  const entries: [string, string][] = [
    ["--background", background],
    ["--foreground", foreground],
    ["--primary", primary],
    ["--color-background", background],
    ["--color-foreground", foreground],
    ["--color-primary", primary],
  ];

  for (const [key, value] of entries) {
    root.style.setProperty(key, value, "important");
  }

  root.style.colorScheme = stateIsDark(background) ? "dark" : "light";
}

function stateIsDark(hex: string): boolean {
  const match = hex.match(/^#([0-9a-f]{6})$/i);
  if (!match) return true;
  const n = parseInt(match[1], 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}

function clearCustomColorVars() {
  const root = document.documentElement;
  for (const key of CUSTOM_VARS) {
    root.style.removeProperty(key);
  }
  root.style.removeProperty("color-scheme");
}

export function getSystemTheme(): ThemeMode {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export type { ThemeMode, ThemePalette, CustomThemeColors };
