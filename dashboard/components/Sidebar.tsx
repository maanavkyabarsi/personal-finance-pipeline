"use client";

import type { ViewId } from "@/lib/types";
import { ChartPie, Layers, Target, Wallet } from "./icons";
import { cx } from "./primitives";

const NAV: { id: ViewId; label: string; icon: typeof ChartPie }[] = [
  { id: "overview", label: "Overview", icon: ChartPie },
  { id: "categories", label: "Categories", icon: Layers },
  { id: "budgets", label: "Budgets", icon: Target },
];

function NavItems({
  active,
  onSelect,
  layout,
}: {
  active: ViewId;
  onSelect: (v: ViewId) => void;
  layout: "rail" | "bar";
}) {
  return (
    <>
      {NAV.map(({ id, label, icon: Icon }) => {
        const selected = active === id;
        return (
          <button
            key={id}
            onClick={() => onSelect(id)}
            aria-current={selected ? "page" : undefined}
            className={cx(
              "flex cursor-pointer items-center gap-3 rounded-xl font-medium transition-colors duration-200",
              layout === "rail"
                ? "w-full px-3 py-2.5 text-sm"
                : "flex-1 flex-col gap-1 px-2 py-2 text-xs",
              selected
                ? "bg-primary-soft text-primary"
                : "text-muted hover:bg-surface-hover hover:text-text"
            )}
          >
            <Icon size={layout === "rail" ? 19 : 22} />
            {label}
          </button>
        );
      })}
    </>
  );
}

/** Desktop rail (≥1024px) — sidebar for top-level nav (adaptive-navigation rule). */
export function Sidebar({
  active,
  onSelect,
}: {
  active: ViewId;
  onSelect: (v: ViewId) => void;
}) {
  return (
    <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-border bg-surface px-3 py-5 lg:flex">
      <div className="flex items-center gap-2.5 px-2 pb-6">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-on-primary">
          <Wallet size={20} />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-text">Spending</p>
          <p className="text-xs text-subtle">Expense analytics</p>
        </div>
      </div>
      <nav className="flex flex-col gap-1" aria-label="Primary">
        <NavItems active={active} onSelect={onSelect} layout="rail" />
      </nav>
      <div className="mt-auto px-2 pt-4">
        <p className="text-xs text-subtle">Personal Finance Pipeline</p>
      </div>
    </aside>
  );
}

/** Mobile bottom bar (<1024px) — max 3 items (bottom-nav-limit rule). */
export function BottomNav({
  active,
  onSelect,
}: {
  active: ViewId;
  onSelect: (v: ViewId) => void;
}) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 flex gap-1 border-t border-border bg-surface/95 px-3 pb-[env(safe-area-inset-bottom)] pt-1.5 backdrop-blur lg:hidden"
      aria-label="Primary"
    >
      <NavItems active={active} onSelect={onSelect} layout="bar" />
    </nav>
  );
}
