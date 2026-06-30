// Metadata for Plaid Personal Finance Categories (primary level).
// Each spending category gets a stable, accessible hue and an icon key so the
// same category looks identical everywhere (icon-style-consistent rule).

export interface CategoryMeta {
  /** chart/accent color (works on both themes) */
  color: string;
  iconKey: IconKey;
  /** money flowing IN — excluded from expenditure totals */
  inflow?: boolean;
}

export type IconKey =
  | "food"
  | "cart"
  | "car"
  | "home"
  | "bolt"
  | "plane"
  | "film"
  | "heart"
  | "sparkles"
  | "wrench"
  | "bank"
  | "gift"
  | "scale"
  | "briefcase"
  | "arrowDown"
  | "arrowUp"
  | "tag";

const CATEGORY_META: Record<string, CategoryMeta> = {
  FOOD_AND_DRINK: { color: "#f97316", iconKey: "food" },
  GENERAL_MERCHANDISE: { color: "#8b5cf6", iconKey: "cart" },
  TRANSPORTATION: { color: "#0ea5e9", iconKey: "car" },
  RENT_AND_UTILITIES: { color: "#14b8a6", iconKey: "home" },
  HOME_IMPROVEMENT: { color: "#84cc16", iconKey: "wrench" },
  TRAVEL: { color: "#ec4899", iconKey: "plane" },
  ENTERTAINMENT: { color: "#a855f7", iconKey: "film" },
  MEDICAL: { color: "#ef4444", iconKey: "heart" },
  PERSONAL_CARE: { color: "#d946ef", iconKey: "sparkles" },
  GENERAL_SERVICES: { color: "#6366f1", iconKey: "briefcase" },
  GOVERNMENT_AND_NON_PROFIT: { color: "#64748b", iconKey: "scale" },
  LOAN_PAYMENTS: { color: "#f59e0b", iconKey: "bank" },
  BANK_FEES: { color: "#e11d48", iconKey: "bank" },
  TRANSFER_OUT: { color: "#94a3b8", iconKey: "arrowUp" },
  INCOME: { color: "#10b981", iconKey: "arrowDown", inflow: true },
  TRANSFER_IN: { color: "#22c55e", iconKey: "arrowDown", inflow: true },
};

const FALLBACK: CategoryMeta = { color: "#6b7280", iconKey: "tag" };

export function categoryMeta(raw: string | null): CategoryMeta {
  if (!raw) return FALLBACK;
  return CATEGORY_META[raw] ?? FALLBACK;
}

/** True for outflow categories that count as expenditure. */
export function isSpendingCategory(raw: string | null): boolean {
  return !categoryMeta(raw).inflow;
}
