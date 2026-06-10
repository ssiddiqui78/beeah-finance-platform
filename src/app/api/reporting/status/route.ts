import { NextResponse } from "next/server";

import { getReportingStatus } from "@/lib/reporting/services/reporting-status";

export async function GET() {
  const status = await getReportingStatus();

  return NextResponse.json(status);
}
