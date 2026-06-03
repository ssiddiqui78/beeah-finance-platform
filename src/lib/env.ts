// src/lib/env.ts
import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().default("Beeah Finance Platform"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().or(z.literal("")).optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().or(z.literal("")).optional(),
  
  NEXT_PUBLIC_ENABLE_EXEC_SUMMARY: z.string().default("true").transform((v) => v === "true"),
  NEXT_PUBLIC_ENABLE_CONSOLIDATED_PNL: z.string().default("true").transform((v) => v === "true"),
  NEXT_PUBLIC_ENABLE_BALANCE_SHEET: z.string().default("true").transform((v) => v === "true"),
  NEXT_PUBLIC_ENABLE_SEGMENT_PERFORMANCE: z.string().default("true").transform((v) => v === "true"),
  NEXT_PUBLIC_ENABLE_CASH_FLOW: z.string().default("false").transform((v) => v === "true"),
  NEXT_PUBLIC_ENABLE_BUDGETING: z.string().default("false").transform((v) => v === "true"),
  NEXT_PUBLIC_ENABLE_FORECASTING: z.string().default("false").transform((v) => v === "true"),
  NEXT_PUBLIC_ENABLE_AI: z.string().default("false").transform((v) => v === "true"),
});

const parsed = envSchema.parse(process.env);

export const env = {
  appName: parsed.NEXT_PUBLIC_APP_NAME,
  appUrl: parsed.NEXT_PUBLIC_APP_URL,
  supabaseUrl: parsed.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: parsed.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  defaultCurrency: "AED",
  flags: {
    execSummary: parsed.NEXT_PUBLIC_ENABLE_EXEC_SUMMARY,
    consolidatedPnL: parsed.NEXT_PUBLIC_ENABLE_CONSOLIDATED_PNL,
    balanceSheet: parsed.NEXT_PUBLIC_ENABLE_BALANCE_SHEET,
    segmentPerformance: parsed.NEXT_PUBLIC_ENABLE_SEGMENT_PERFORMANCE,
    cashFlow: parsed.NEXT_PUBLIC_ENABLE_CASH_FLOW,
    budgeting: parsed.NEXT_PUBLIC_ENABLE_BUDGETING,
    forecasting: parsed.NEXT_PUBLIC_ENABLE_FORECASTING,
    ai: parsed.NEXT_PUBLIC_ENABLE_AI,
  }
} as const;
