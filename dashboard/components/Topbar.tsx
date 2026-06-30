"use client";

import { monthLabel } from "@/lib/format";
import { Moon, Refresh, Sun } from "./icons";
import { Button, cx } from "./primitives";

export function MonthSelect({
  months,
  value,
  onChange,
}: {
  months: string[];
  value: string;
  onChange: (m: string) => void;
}) {
  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">Select month</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="tnum h-10 cursor-pointer appearance-none rounded-xl border border-border bg-surface pl-3.5 pr-9 text-sm font-medium text-text transition-colors hover:bg-surface-hover focus-visible:border-primary"
      >
        {months.map((m) => (
          <option key={m} value={m}>
            {monthLabel(m)}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-3 h-4 w-4 text-muted"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </label>
  );
}

export function ThemeToggle({
  theme,
  onToggle,
}: {
  theme: "light" | "dark";
  onToggle: () => void;
}) {
  return (
    <Button
      variant="secondary"
      onClick={onToggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className="w-10 px-0"
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </Button>
  );
}

export function Topbar({
  title,
  subtitle,
  months,
  month,
  onMonthChange,
  theme,
  onToggleTheme,
  onRefresh,
  refreshing,
}: {
  title: string;
  subtitle: string;
  months: string[];
  month: string;
  onMonthChange: (m: string) => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-bg/85 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 lg:px-8">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold tracking-tight text-text">
            {title}
          </h1>
          <p className="text-sm text-muted">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          {months.length > 0 && (
            <MonthSelect months={months} value={month} onChange={onMonthChange} />
          )}
          <Button
            variant="secondary"
            onClick={onRefresh}
            aria-label="Refresh data"
            className="w-10 px-0"
            disabled={refreshing}
          >
            <Refresh size={18} className={cx(refreshing && "animate-spin")} />
          </Button>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </div>
    </header>
  );
}
