import type { BqDate, BqNumber } from "./types";

/** Normalize a BigQuery numeric (number | string | {value}) to a JS number. */
export function num(v: BqNumber): number {
  if (v === null || v === undefined) return 0;
  if (typeof v === "number") return v;
  if (typeof v === "string") return Number(v) || 0;
  if (typeof v === "object" && "value" in v) return Number(v.value) || 0;
  return 0;
}

/** Normalize a BigQuery date (string | {value}) to an ISO date string or null. */
export function dateStr(v: BqDate): string | null {
  if (!v) return null;
  if (typeof v === "string") return v;
  if (typeof v === "object" && "value" in v) return v.value;
  return null;
}

/** "YYYY-MM" key from a BigQuery date. */
export function monthKey(v: BqDate): string | null {
  const s = dateStr(v);
  return s ? s.slice(0, 7) : null;
}

const currencyFmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const currencyFmtCents = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** $1,234 — whole dollars, used for headline figures. */
export function currency(n: number): string {
  return currencyFmt.format(Math.round(n));
}

/** $1,234.56 — used for individual transactions. */
export function currencyCents(n: number): string {
  return currencyFmtCents.format(n);
}

/** Compact form for axis labels: $1.2k, $980. */
export function currencyCompact(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1000) return `$${(n / 1000).toFixed(abs >= 10000 ? 0 : 1)}k`;
  return `$${Math.round(n)}`;
}

export function percent(n: number, digits = 0): string {
  return `${(n * 100).toFixed(digits)}%`;
}

/** "Mar 2025" from a "YYYY-MM" key. */
export function monthLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  if (!y || !m) return key;
  return new Date(y, m - 1, 1).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

/** "March 2025" — long form for headers. */
export function monthLabelLong(key: string): string {
  const [y, m] = key.split("-").map(Number);
  if (!y || !m) return key;
  return new Date(y, m - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

/** "Mar 14" from an ISO date string. */
export function dayLabel(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso + (iso.length === 10 ? "T00:00:00" : ""));
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** RENT_AND_UTILITIES -> "Rent & Utilities" */
export function prettyCategory(raw: string | null): string {
  if (!raw) return "Uncategorized";
  return raw
    .toLowerCase()
    .split("_")
    .map((w) => (w === "and" ? "&" : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
}
