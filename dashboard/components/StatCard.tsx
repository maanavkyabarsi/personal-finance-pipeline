"use client";

import type { ReactNode } from "react";
import { TrendDown, TrendUp } from "./icons";
import { Card, cx } from "./primitives";

export function StatCard({
  label,
  value,
  icon,
  accent = "var(--primary)",
  delta,
  footnote,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  accent?: string;
  /** signed % change vs previous period; positive = spending rose (bad). */
  delta?: number | null;
  footnote?: string;
}) {
  const hasDelta = delta !== undefined && delta !== null && Number.isFinite(delta);
  const rose = hasDelta && (delta as number) > 0;
  const flat = hasDelta && Math.abs(delta as number) < 0.005;

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm font-medium text-muted">{label}</span>
        <span
          className="flex h-9 w-9 items-center justify-center rounded-xl"
          style={{ background: `${accent}1f`, color: accent }}
          aria-hidden
        >
          {icon}
        </span>
      </div>
      <p className="tnum mt-3 text-2xl font-semibold tracking-tight text-text">
        {value}
      </p>
      <div className="mt-1.5 flex items-center gap-2">
        {hasDelta && !flat && (
          <span
            className={cx(
              "tnum inline-flex items-center gap-1 text-xs font-semibold",
              rose ? "text-danger" : "text-accent"
            )}
          >
            {rose ? <TrendUp size={14} /> : <TrendDown size={14} />}
            {Math.abs(delta as number).toFixed(0)}%
          </span>
        )}
        {footnote && <span className="text-xs text-subtle">{footnote}</span>}
      </div>
    </Card>
  );
}
