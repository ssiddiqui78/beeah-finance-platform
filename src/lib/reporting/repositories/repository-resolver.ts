import supabaseReportingWriter from "./impl/supabase-reporting-writer";

export interface ReportingRepository {
  getRepositoryName(): string;
  saveDataset(dataset: any): Promise<{ rowCount: number; controlCount: number }>;
}

export function resolveReportingRepository(): ReportingRepository {
  // ⚡ HARD OVERRIDE: Force the system to use the active Supabase writer instance directly
  return supabaseReportingWriter;
}
