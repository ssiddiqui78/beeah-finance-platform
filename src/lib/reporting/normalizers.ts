// src/lib/reporting/normalizers.ts
import type { StatementType } from "@/types/reporting";

export function asText(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text.length > 0 ? text : null;
}

export function asNumber(value: unknown): number {
  if (value === null || value === undefined || value === "") return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;

  const normalized = String(value).replace(/,/g, "").replace(/%/g, "").trim();
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function normalizeStatementType(value: unknown): StatementType {
  const raw = String(value ?? "").trim().toUpperCase();
  if (raw === "PL" || raw === "BS" || raw === "CF") {
    return raw;
  }
  return "PL";
}

export function normalizePnlDisplayValue(
  statementType: StatementType,
  rawValue: number
): number {
  if (statementType === "PL") {
    return rawValue * -1;
  }
  return rawValue;
}
