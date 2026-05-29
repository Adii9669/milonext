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
      className="p-2 rounded-md hover:bg-accent transition"
      title={`Switch to ${mode === "dark" ? "light" : "dark"} mode`}
    >
      {mode === "dark" ? (
        <Sun className="w-5 h-5 text-primary" />
      ) : (
        <Moon className="w-5 h-5 text-primary" />
      )}
    </button>
  );
}
