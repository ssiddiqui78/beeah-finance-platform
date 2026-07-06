import { z } from "zod";

const serverSchema = z.object({
  REPORTING_WORKBOOK_PATH: z.string().default("./data/input/beeah-monthly-report.xlsx"),
  REPORTING_PERIOD_CODE: z.string().default("2026-03"),
  REPORTING_PERIOD_LABEL: z.string().default("Mar 2026 YTD"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
});

export const serverEnv = serverSchema.parse({
  REPORTING_WORKBOOK_PATH: process.env.REPORTING_WORKBOOK_PATH,
  REPORTING_PERIOD_CODE: process.env.REPORTING_PERIOD_CODE,
  REPORTING_PERIOD_LABEL: process.env.REPORTING_PERIOD_LABEL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
});
