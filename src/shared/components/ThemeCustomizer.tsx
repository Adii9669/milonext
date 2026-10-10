"use client";

import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { useThemeStore } from "@/src/app/stores/themeStores";

export default function ThemeCustomizer() {
  const mode = useThemeStore((s) => s.mode);
  const toggleMode = useThemeStore((s) => s.toggleMode);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Clear any leftover palette / custom colors so every user starts clean
    if (typeof window !== "undefined") {
      localStorage.removeItem("theme-palette");
      localStorage.removeItem("theme-custom");
    }
  }, []);

  if (!mounted) return null;

  const isDark = mode === "dark";

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        type="button"
        onClick={toggleMode}
        title={`Switch to ${isDark ? "light" : "dark"} mode`}
        className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-border bg-surface text-text-primary shadow-[var(--shadow-soft)] hover:bg-surface-hover transition-all duration-150 text-sm font-semibold"
      >
        {isDark ? (
          <>
            <Sun className="w-4 h-4 text-primary" />
            Light mode
          </>
        ) : (
          <>
            <Moon className="w-4 h-4 text-primary" />
            Dark mode
          </>
        )}
      </button>
    </div>
  );
}
