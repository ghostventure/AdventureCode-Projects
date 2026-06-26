"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const storageKey = "sample-demo-theme";

function getPreferredTheme() {
  if (typeof window === "undefined") return "day";

  const stored = window.localStorage.getItem(storageKey);

  if (stored === "day" || stored === "night") {
    return stored;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "night" : "day";
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme === "night" ? "dark" : "light";
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState("day");

  useEffect(() => {
    const preferredTheme = getPreferredTheme();
    setTheme(preferredTheme);
    applyTheme(preferredTheme);
  }, []);

  const isNight = theme === "night";

  const handleToggle = () => {
    const nextTheme = isNight ? "day" : "night";
    setTheme(nextTheme);
    window.localStorage.setItem(storageKey, nextTheme);
    applyTheme(nextTheme);
  };

  return (
    <button
      aria-label={`Switch to ${isNight ? "day" : "night"} theme`}
      aria-pressed={isNight}
      className="theme-toggle"
      type="button"
      onClick={handleToggle}
      title={`Switch to ${isNight ? "day" : "night"} theme`}
    >
      {isNight ? <Sun size={17} strokeWidth={2.2} aria-hidden="true" /> : <Moon size={17} strokeWidth={2.2} aria-hidden="true" />}
      <span>{isNight ? "Day" : "Night"}</span>
    </button>
  );
}
