"use client";

import { currencyCents, dateStr, dayLabel, num, prettyCategory } from "@/lib/format";
import type { TransactionRow } from "@/lib/types";
import { Inbox } from "./icons";
import { Skeleton } from "./primitives";

function txnTitle(t: TransactionRow): string {
  return t.merchant_name || t.transaction_name || "Transaction";
}

export function RecentTransactions({ rows }: { rows: TransactionRow[] | null }) {
  if (rows === null) {
    return (
      <div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 border-t border-border py-2.5 first:border-t-0"
          >
            <Skeleton className="h-8 w-8 rounded-[9px]" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-2.5 w-16" />
            </div>
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-2 text-subtle">
          <Inbox size={18} />
        </span>
        <p className="text-[13px] text-muted">No transactions this month</p>
      </div>
    );
  }

  const sorted = [...rows].sort(
    (a, b) =>
      (dateStr(b.transaction_date) ?? "").localeCompare(
        dateStr(a.transaction_date) ?? ""
      )
  );

  return (
    <div>
      {sorted.map((t, i) => {
        const title = txnTitle(t);
        const amt = num(t.amount);
        const refund = amt < 0;
        return (
          <div
            key={i}
            className="flex items-center gap-3 border-t border-border py-2.5 first:border-t-0"
          >
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-surface-2 text-[13px] font-semibold text-primary"
              aria-hidden
            >
              {title.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-text">{title}</p>
              <p className="truncate text-[11.5px] text-subtle">
                {prettyCategory(t.pfc_primary ?? null)}
              </p>
            </div>
            <span className="w-[52px] shrink-0 text-[11.5px] text-subtle">
              {dayLabel(dateStr(t.transaction_date))}
            </span>
            <span
              className={`num shrink-0 text-[13px] font-medium ${
                refund ? "text-accent" : "text-text"
              }`}
            >
              {refund ? "+" : "−"}
              {currencyCents(Math.abs(amt))}
            </span>
          </div>
        );
      })}
    </div>
  );
}
