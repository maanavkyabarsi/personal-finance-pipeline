// BigQuery serializes DATE/TIMESTAMP as { value: string } and NUMERIC may arrive
// as a string. These types stay permissive; lib/format.ts normalizes the values.

export type BqDate = string | { value: string } | null;
export type BqNumber = number | string | { value: string } | null;

/** Row shape from GET /api/spending (gold.spending_by_category ⨝ gold.budget_limits) */
export interface SpendingRow {
  primary_category: string | null;
  detailed_category: string | null;
  total_spending: BqNumber;
  month: BqDate;
  account_id: string | null;
  budget_limit: BqNumber;
  budget_updated_at: BqDate;
}

/** Row shape from GET /api/transactions[/detail] (silver.transactions) */
export interface TransactionRow {
  transaction_name: string | null;
  amount: BqNumber;
  transaction_date: BqDate;
  pfc_primary?: string | null;
  pfc_detailed?: string | null;
}

/** Derived: one primary category rolled up for a single month. */
export interface CategorySummary {
  category: string;
  spent: number;
  budget: number | null;
  detailed: { name: string; spent: number }[];
}

/** Derived: total spend for one month across spending categories. */
export interface MonthPoint {
  /** "YYYY-MM" */
  key: string;
  label: string;
  spent: number;
}

export type ViewId = "overview" | "categories" | "budgets";
