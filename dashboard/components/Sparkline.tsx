"use client";

import type { MonthPoint } from "@/lib/types";

export function Sparkline({
  points,
  height = 70,
}: {
  points: MonthPoint[];
  height?: number;
}) {
  const W = 300;
  const H = height;
  const pad = 6;

  if (points.length === 0) return null;

  const max = Math.max(...points.map((p) => p.spent), 1);
  const min = Math.min(...points.map((p) => p.spent), 0);
  const span = max - min || 1;

  const x = (i: number) =>
    points.length <= 1 ? W / 2 : (i / (points.length - 1)) * W;
  const y = (v: number) => H - pad - ((v - min) / span) * (H - pad * 2);

  const coords = points.map((p, i) => `${x(i)},${y(p.spent)}`).join(" ");
  const last = points[points.length - 1];

  return (
    <svg
      width="100%"
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      role="img"
      aria-label="Monthly spending trend"
    >
      <polyline
        fill="none"
        stroke="var(--green-mid)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={coords}
      />
      {points.length > 1 && (
        <circle cx={x(points.length - 1)} cy={y(last.spent)} r={3} fill="var(--green-mid)" />
      )}
    </svg>
  );
}
