import { useState, useEffect, useCallback } from "react";
import { cn } from "@lib/utils";

type ThemePreference = "system" | "light" | "dark";

/** Resolve the effective theme from a preference value. */
function resolveTheme(pref: ThemePreference): "light" | "dark" {
  if (pref === "light" || pref === "dark") return pref;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/** Apply the resolved theme to the document root. */
function applyTheme(pref: ThemePreference) {
  document.documentElement.setAttribute("data-theme", resolveTheme(pref));
}

/**
 * Compact three-button pill toggle: System / Light / Dark.
 * Persists preference in localStorage under the key "theme".
 * Designed to sit inside the Navbar.
 */
export default function ThemeToggle() {
  const [preference, setPreference] = useState<ThemePreference>("system");
  const [mounted, setMounted] = useState(false);

  // Hydrate preference from localStorage after mount.
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark" || stored === "system") {
      setPreference(stored);
    }
    setMounted(true);
  }, []);

  const update = useCallback((next: ThemePreference) => {
    setPreference(next);
    localStorage.setItem("theme", next);
    applyTheme(next);
  }, []);

  // Listen for OS-level color-scheme changes when in "system" mode.
  useEffect(() => {
    if (preference !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [preference]);

  // Prevent rendering with wrong active state before hydration.
  if (!mounted) {
    return (
      <div
        className="inline-flex items-center gap-0.5 p-0.5 border border-border/40 bg-bg-elevated/50 opacity-0"
        data-squircle="8"
        aria-hidden
      >
        <span className="p-1"><MonitorIcon /></span>
        <span className="p-1"><SunIcon /></span>
        <span className="p-1"><MoonIcon /></span>
      </div>
    );
  }

  return (
    <div
      className="inline-flex items-center gap-0.5 p-0.5 border border-border/40 bg-bg-elevated/50"
      data-squircle="8"
      role="radiogroup"
      aria-label="Theme"
    >
      <ToggleButton
        active={preference === "system"}
        label="System"
        onClick={() => update("system")}
        icon={<MonitorIcon />}
      />
      <ToggleButton
        active={preference === "light"}
        label="Light"
        onClick={() => update("light")}
        icon={<SunIcon />}
      />
      <ToggleButton
        active={preference === "dark"}
        label="Dark"
        onClick={() => update("dark")}
        icon={<MoonIcon />}
      />
    </div>
  );
}

/* ── Internal sub-components ── */

function ToggleButton({
  active,
  label,
  onClick,
  icon,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      aria-label={label}
      onClick={onClick}
      className={cn(
        "flex items-center justify-center p-1 transition-colors duration-200 cursor-pointer border-none",
        active
          ? "bg-bg-card text-text-primary"
          : "bg-transparent text-text-tertiary hover:text-text-secondary"
      )}
      data-squircle="6"
    >
      {icon}
    </button>
  );
}

/* ── SVG Icons (14×14) ── */

function MonitorIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
