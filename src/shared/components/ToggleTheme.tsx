"use client";

import { Sun, Moon } from "lucide-react";
import { useThemeStore } from "@/src/app/stores/themeStores";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const mode = useThemeStore((s) => s.mode);
  const toggleMode = useThemeStore((s) => s.toggleMode);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <button
      type="button"
      onClick={toggleMode}
      aria-label={`Switch to ${mode === "dark" ? "light" : "dark"} mode`}
      className="grid size-11 place-items-center rounded-full border border-border bg-background/85 text-foreground shadow-[var(--shadow-soft)] backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-surface-hover hover:text-primary active:translate-y-0 active:scale-95"
      title={`Switch to ${mode === "dark" ? "light" : "dark"} mode`}
    >
      {mode === "dark" ? (
        <Sun aria-hidden="true" className="size-5 transition-transform duration-300 hover:rotate-12" />
      ) : (
        <Moon aria-hidden="true" className="size-5 transition-transform duration-300 hover:rotate-12" />
      )}
    </button>
  );
}
