// src/lib/reporting/services/reporting-source.ts
import { env } from "@/lib/env";
import { ParsedReportDataset } from "@/types/reporting";
import { beeahSampleDataset } from "../mock/beeah-sample";

/**
 * Core application data hydration gateway.
 * Safely routes your granular ledger models into Next.js Server Components.
 */
export async function getReportingDataset(): Promise<ParsedReportDataset> {
  // If Supabase keys are not set up yet, fallback to your type-safe granular mockup dataset
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    return beeahSampleDataset;
  }

  try {
    // Future live enterprise data acquisition placeholder logic
    return beeahSampleDataset;
  } catch {
    return beeahSampleDataset;
  }
}
