import {
  defaultPeriodOption,
  defaultSubVerticalOption,
  defaultVerticalOption,
  type FilterOption,
} from "@/lib/config/reporting-filters";
import { getReportingDataset } from "@/lib/reporting/services/reporting-source";

export type ReportingFilterOptions = {
  periodOptions: FilterOption[];
  verticalOptions: FilterOption[];
  subVerticalOptions: FilterOption[];
  subVerticalOptionsByVertical: Record<string, FilterOption[]>;
};

const verticalLabelMap: Record<string, string> = {
  ENV: "Environment",
  Cap: "Capital",
  RE: "Real Estate",
  Exec: "Executive",
  Conso: "Consolidated",
};

const preferredVerticalOrder = ["ENV", "Cap", "RE", "Exec", "Conso"];

function uniqueOrdered(values: (string | null | undefined)[]): string[] {
  const seen = new Set<string>();
  const output: string[] = [];

  for (const value of values) {
    const normalized = String(value ?? "").trim();
    if (!normalized) continue;

    if (!seen.has(normalized)) {
      seen.add(normalized);
      output.push(normalized);
    }
  }

  return output;
}

function formatVerticalLabel(value: string): string {
  return verticalLabelMap[value] ?? value;
}

function sortVerticals(values: string[]): string[] {
  return [...values].sort((a, b) => {
    const aIndex = preferredVerticalOrder.indexOf(a);
    const bIndex = preferredVerticalOrder.indexOf(b);

    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;

    return aIndex - bIndex;
  });
}

export async function getReportingFilterOptions(): Promise<ReportingFilterOptions> {
  const dataset = await getReportingDataset();

  const verticalValues = sortVerticals(
    uniqueOrdered(dataset.reportingRows.map((row) => row.vertical))
  );

  const verticalOptions: FilterOption[] = [
    defaultVerticalOption,
    ...verticalValues.map((value) => ({
      label: formatVerticalLabel(value),
      value,
    })),
  ];

  const allSubVerticalValues = uniqueOrdered(
    dataset.reportingRows.map((row) => row.subVertical)
  );

  const subVerticalOptions: FilterOption[] = [
    defaultSubVerticalOption,
    ...allSubVerticalValues.map((value) => ({
      label: value,
      value,
    })),
  ];

  const subVerticalOptionsByVertical: Record<string, FilterOption[]> = {};

  for (const vertical of verticalValues) {
    const scopedSubVerticals = uniqueOrdered(
      dataset.reportingRows
        .filter((row) => (row.vertical ?? "").trim() === vertical)
        .map((row) => row.subVertical)
    );

    subVerticalOptionsByVertical[vertical] = [
      defaultSubVerticalOption,
      ...scopedSubVerticals.map((value) => ({
        label: value,
        value,
      })),
    ];
  }

  const periodOptions: FilterOption[] =
    dataset.periodCode === "latest"
      ? [defaultPeriodOption]
      : [
          defaultPeriodOption,
          {
            label: dataset.periodLabel,
            value: dataset.periodCode,
          },
        ];

  return {
    periodOptions,
    verticalOptions,
    subVerticalOptions,
    subVerticalOptionsByVertical,
  };
}
