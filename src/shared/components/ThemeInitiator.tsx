"use client";

import { useEffect } from "react";
import { applyTheme } from "@/src/lib/theme/theme";
import {
  loadThemeFromStorage,
  useThemeStore,
} from "@/src/app/stores/themeStores";

export default function ThemeInitializer() {
  useEffect(() => {
    const saved = loadThemeFromStorage();

    useThemeStore.setState({
      mode: saved.mode,
      theme: saved.mode,
      palette: saved.palette,
      customColors: saved.customColors,
    });

    applyTheme(saved);
  }, []);

  return null;
}
