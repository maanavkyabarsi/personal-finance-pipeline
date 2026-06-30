"use client";

import { budgetStatus } from "@/lib/derive";
import { currency, monthLabelLong } from "@/lib/format";
import type { CategorySummary, MonthPoint } from "@/lib/types";
import { CategoryRows } from "../CategoryList";
import { Alert, ChartPie, Target, TrendUp, Wallet } from "../icons";
import { Card, EmptyState, SectionHeading } from "../primitives";
import { StatCard } from "../StatCard";
import { TrendChart } from "../TrendChart";

export function OverviewView({
  month,
  summaries,
  points,
  onOpenCategory,
  onSelectMonth,
}: {
  month: string;
  summaries: CategorySummary[];
  points: MonthPoint[];
  onOpenCategory: (category: string) => void;
  onSelectMonth: (key: string) => void;
}) {
  const totalSpent = summaries.reduce((s, c) => s + c.spent, 0);
  const totalBudget = summaries.reduce((s, c) => s + (c.budget ?? 0), 0);
  const overCount = summaries.filter(
    (c) => budgetStatus(c.spent, c.budget) === "over"
  ).length;
  const top = summaries[0];

  const idx = points.findIndex((p) => p.key === month);
  const prev = idx > 0 ? points[idx - 1].spent : null;
  const delta =
    prev && prev > 0 ? ((totalSpent - prev) / prev) * 100 : null;

  const remaining = totalBudget - totalSpent;
  const budgetFootnote =
    totalBudget > 0
      ? remaining >= 0
        ? `${currency(remaining)} left`
        : `${currency(-remaining)} over`
      : "No budgets set";

  if (summaries.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={<ChartPie size={24} />}
          title="No spending this month"
          message={`There's no expenditure recorded for ${monthLabelLong(
            month
          )}. Pick another month from the selector above.`}
        />
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          label="Total spent"
          value={currency(totalSpent)}
          icon={<Wallet size={18} />}
          accent="var(--primary)"
          delta={delta}
          footnote={prev ? "vs last month" : monthLabelLong(month)}
        />
        <StatCard
          label="Total budget"
          value={totalBudget > 0 ? currency(totalBudget) : "—"}
          icon={<Target size={18} />}
          accent="var(--accent)"
          footnote={budgetFootnote}
        />
        <StatCard
          label="Over budget"
          value={`${overCount}`}
          icon={<Alert size={18} />}
          accent={overCount > 0 ? "var(--danger)" : "var(--accent)"}
          footnote={
            overCount > 0
              ? `categor${overCount === 1 ? "y" : "ies"} to review`
              : "all within limits"
          }
        />
        <StatCard
          label="Top category"
          value={top ? currency(top.spent) : "—"}
          icon={<TrendUp size={18} />}
          accent="var(--warning)"
          footnote={top ? prettyTop(top) : undefined}
        />
      </div>

      <Card className="p-5">
        <SectionHeading
          title="Spending trend"
          subtitle="Total expenditure by month — hover or tap a point"
        />
        <div className="mt-3">
          <TrendChart
            points={points}
            activeKey={month}
            onSelectMonth={onSelectMonth}
          />
        </div>
      </Card>

      <Card className="p-3 sm:p-4">
        <div className="px-2 pb-1 pt-2">
          <SectionHeading
            title="Where it went"
            subtitle={`By category · ${monthLabelLong(month)}`}
          />
        </div>
        <CategoryRows summaries={summaries} onOpen={onOpenCategory} />
      </Card>
    </div>
  );
}

function prettyTop(top: CategorySummary): string {
  return top.category
    .toLowerCase()
    .split("_")
    .map((w) => (w === "and" ? "&" : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
}
