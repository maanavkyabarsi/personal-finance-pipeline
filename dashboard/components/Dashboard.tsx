"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  allSpendingCategories,
  availableMonths,
  budgetByCategory,
  categorySummaries,
  monthlyTotals,
} from "@/lib/derive";
import { num } from "@/lib/format";
import type { SpendingRow, ViewId } from "@/lib/types";
import { monthKey } from "@/lib/format";
import { isSpendingCategory } from "@/lib/categories";
import { BottomNav, Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { Toast, type ToastState } from "./Toast";
import { TransactionsDrawer, type DrawerTarget } from "./TransactionsDrawer";
import { Alert } from "./icons";
import { Button, Card, EmptyState, Skeleton } from "./primitives";
import { OverviewView } from "./views/OverviewView";
import { CategoriesView } from "./views/CategoriesView";
import { BudgetsView } from "./views/BudgetsView";

const VIEW_META: Record<ViewId, { title: string; subtitle: string }> = {
  overview: { title: "Overview", subtitle: "Your spending at a glance" },
  categories: { title: "Categories", subtitle: "Spending broken down by category" },
  budgets: { title: "Budgets", subtitle: "Set and track your monthly limits" },
};

export function Dashboard() {
  const [rows, setRows] = useState<SpendingRow[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [view, setView] = useState<ViewId>("overview");
  const [month, setMonth] = useState<string>("");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [drawer, setDrawer] = useState<DrawerTarget | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  const load = useCallback(async (showSpinner: boolean) => {
    if (showSpinner) setRefreshing(true);
    try {
      const res = await fetch("/api/spending");
      if (!res.ok) throw new Error();
      const data: SpendingRow[] = await res.json();
      setRows(Array.isArray(data) ? data : []);
      setLoadError(false);
    } catch {
      setLoadError(true);
      setRows((r) => r ?? []);
    } finally {
      if (showSpinner) setRefreshing(false);
    }
  }, []);

  // Initial data fetch + persisted theme read — synchronizing with external
  // systems (network + DOM) on mount, which is what effects are for.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time initial data fetch on mount
    load(false);
    setTheme(
      document.documentElement.classList.contains("dark") ? "dark" : "light"
    );
  }, [load]);

  const months = useMemo(() => availableMonths(rows ?? []), [rows]);

  // Effective month is derived (not stored) so it always stays valid as data
  // loads or changes; `month` only holds an explicit user selection.
  const effectiveMonth = useMemo(() => {
    if (month && months.includes(month)) return month;
    return months.length ? months[months.length - 1] : "";
  }, [month, months]);

  const points = useMemo(() => monthlyTotals(rows ?? []), [rows]);
  const summaries = useMemo(
    () => (effectiveMonth ? categorySummaries(rows ?? [], effectiveMonth) : []),
    [rows, effectiveMonth]
  );
  const budgets = useMemo(() => budgetByCategory(rows ?? []), [rows]);
  const allCategories = useMemo(
    () => allSpendingCategories(rows ?? []),
    [rows]
  );
  const spentByCategory = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of rows ?? []) {
      if (monthKey(r.month) !== effectiveMonth) continue;
      if (!isSpendingCategory(r.primary_category) || !r.primary_category) continue;
      const amt = num(r.total_spending);
      if (amt <= 0) continue;
      m.set(r.primary_category, (m.get(r.primary_category) ?? 0) + amt);
    }
    return m;
  }, [rows, effectiveMonth]);

  function toggleTheme() {
    setTheme((t) => {
      const next = t === "dark" ? "light" : "dark";
      document.documentElement.classList.toggle("dark", next === "dark");
      try {
        localStorage.setItem("fp-theme", next);
      } catch {}
      return next;
    });
  }

  const handleSave = useCallback(
    async (category: string, limit: number, isNew: boolean) => {
      try {
        const res = await fetch("/api/budget_limits", {
          method: isNew ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            primary_category: category,
            budget_limit: limit,
          }),
        });
        if (!res.ok) throw new Error();
        await load(false);
        setToast({
          id: Date.now(),
          message: `${prettyLabel(category)} budget saved`,
          tone: "success",
        });
        return true;
      } catch {
        setToast({
          id: Date.now(),
          message: "Couldn't save budget",
          tone: "error",
        });
        return false;
      }
    },
    [load]
  );

  const openCategory = useCallback(
    (category: string) => setDrawer({ category, month: effectiveMonth }),
    [effectiveMonth]
  );

  const meta = VIEW_META[view];
  const loading = rows === null;
  const empty = !loading && (rows?.length ?? 0) === 0;

  return (
    <div className="flex min-h-dvh bg-bg">
      <Sidebar active={view} onSelect={setView} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          title={meta.title}
          subtitle={meta.subtitle}
          months={months}
          month={effectiveMonth}
          onMonthChange={setMonth}
          theme={theme}
          onToggleTheme={toggleTheme}
          onRefresh={() => load(true)}
          refreshing={refreshing}
        />

        <main className="mx-auto w-full max-w-7xl flex-1 px-5 pb-24 pt-5 lg:px-8 lg:pb-10">
          <div key={view} className="animate-fade-up">
            {loadError && empty ? (
              <Card>
                <EmptyState
                  icon={<Alert size={24} />}
                  title="Couldn't load your data"
                  message="We couldn't reach the spending API. Check that the dashboard is configured with BigQuery credentials, then retry."
                />
                <div className="flex justify-center pb-8">
                  <Button variant="primary" onClick={() => load(true)}>
                    Retry
                  </Button>
                </div>
              </Card>
            ) : loading ? (
              <LoadingState />
            ) : empty ? (
              <Card>
                <EmptyState
                  icon={<Alert size={24} />}
                  title="No spending data yet"
                  message="Once the pipeline syncs transactions into BigQuery, your spending and budgets will appear here."
                />
              </Card>
            ) : view === "overview" ? (
              <OverviewView
                month={effectiveMonth}
                summaries={summaries}
                points={points}
                onOpenCategory={openCategory}
                onSelectMonth={setMonth}
              />
            ) : view === "categories" ? (
              <CategoriesView
                month={effectiveMonth}
                summaries={summaries}
                onOpenCategory={openCategory}
              />
            ) : (
              <BudgetsView
                month={effectiveMonth}
                categories={allCategories}
                budgets={budgets}
                spentByCategory={spentByCategory}
                onSave={handleSave}
              />
            )}
          </div>
        </main>
      </div>

      <BottomNav active={view} onSelect={setView} />
      <TransactionsDrawer target={drawer} onClose={() => setDrawer(null)} />
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-4 h-7 w-28" />
            <Skeleton className="mt-2 h-3 w-20" />
          </Card>
        ))}
      </div>
      <Card className="p-5">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-4 h-56 w-full" />
      </Card>
    </div>
  );
}

function prettyLabel(category: string): string {
  return category
    .toLowerCase()
    .split("_")
    .map((w) => (w === "and" ? "&" : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
}
