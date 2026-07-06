import { z } from "zod";

const serverSchema = z.object({
  REPORTING_WORKBOOK_PATH: z.string().optional(),
  REPORTING_PERIOD_CODE: z.string().default("2026-03"),
  REPORTING_PERIOD_LABEL: z.string().default("Mar 2026 YTD"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
});

export const serverEnv = serverSchema.parse({
  REPORTING_WORKBOOK_PATH: process.env.REPORTING_WORKBOOK_PATH,
  REPORTING_PERIOD_CODE: process.env.REPORTING_PERIOD_CODE,
  REPORTING_PERIOD_LABEL: process.env.REPORTING_PERIOD_LABEL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
});
