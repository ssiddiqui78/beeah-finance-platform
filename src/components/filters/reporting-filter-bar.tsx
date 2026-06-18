"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Filter } from "lucide-react";

import {
  reportingViewOptions,
  scenarioOptions,
  type FilterOption,
} from "@/lib/config/reporting-filters";

type FilterKey =
  | "period"
  | "scenario"
  | "vertical"
  | "subVertical"
  | "view";

type ReportingFilterBarProps = {
  periodOptions: FilterOption[];
  verticalOptions: FilterOption[];
  subVerticalOptions: FilterOption[];
  subVerticalOptionsByVertical: Record<string, FilterOption[]>;
};

function getSelectedLabel(value: string, options: FilterOption[]): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

export function ReportingFilterBar({
  periodOptions,
  verticalOptions,
  subVerticalOptions,
  subVerticalOptionsByVertical,
}: ReportingFilterBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedValues = useMemo(
    () => ({
      period: searchParams.get("period") ?? "latest",
      scenario: searchParams.get("scenario") ?? "actual_vs_budget",
      vertical: searchParams.get("vertical") ?? "all",
      subVertical: searchParams.get("subVertical") ?? "all",
      view: searchParams.get("view") ?? "group",
    }),
    [searchParams]
  );

  const visibleSubVerticalOptions = useMemo(() => {
    if (selectedValues.vertical === "all") {
      return subVerticalOptions;
    }

    return (
      subVerticalOptionsByVertical[selectedValues.vertical] ?? subVerticalOptions
    );
  }, [
    selectedValues.vertical,
    subVerticalOptions,
    subVerticalOptionsByVertical,
  ]);

  function updateFilter(key: FilterKey, value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (
      (key === "period" && value === "latest") ||
      (key === "scenario" && value === "actual_vs_budget") ||
      (key === "vertical" && value === "all") ||
      (key === "subVertical" && value === "all") ||
      (key === "view" && value === "group")
    ) {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    if (key === "vertical") {
      const nextSubVerticalOptions =
        value === "all"
          ? subVerticalOptions
          : subVerticalOptionsByVertical[value] ?? subVerticalOptions;

      const currentSubVertical = params.get("subVertical") ?? "all";
      const isStillValid = nextSubVerticalOptions.some(
        (option) => option.value === currentSubVertical
      );

      if (!isStillValid) {
        params.delete("subVertical");
      }
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-slate-100 p-2 text-slate-600">
            <Filter className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-950">
              Reporting Context
            </h3>
            <p className="text-xs text-slate-500">
              Dataset-aware filter state for workbook, local snapshot, and future SAP-backed reporting.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <FilterSelect
            label="Period"
            value={selectedValues.period}
            options={periodOptions}
            onChange={(value) => updateFilter("period", value)}
          />

          <FilterSelect
            label="Scenario"
            value={selectedValues.scenario}
            options={scenarioOptions}
            onChange={(value) => updateFilter("scenario", value)}
          />

          <FilterSelect
            label="Vertical"
            value={selectedValues.vertical}
            options={verticalOptions}
            onChange={(value) => updateFilter("vertical", value)}
          />

          <FilterSelect
            label="Sub-Vertical"
            value={selectedValues.subVertical}
            options={visibleSubVerticalOptions}
            onChange={(value) => updateFilter("subVertical", value)}
          />

          <FilterSelect
            label="View"
            value={selectedValues.view}
            options={reportingViewOptions}
            onChange={(value) => updateFilter("view", value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <ContextBadge
            label="Period"
            value={getSelectedLabel(selectedValues.period, periodOptions)}
          />
          <ContextBadge
            label="Scenario"
            value={getSelectedLabel(selectedValues.scenario, scenarioOptions)}
          />
          <ContextBadge
            label="Vertical"
            value={getSelectedLabel(selectedValues.vertical, verticalOptions)}
          />
          <ContextBadge
            label="Sub-Vertical"
            value={getSelectedLabel(
              selectedValues.subVertical,
              visibleSubVerticalOptions
            )}
          />
          <ContextBadge
            label="View"
            value={getSelectedLabel(selectedValues.view, reportingViewOptions)}
          />
        </div>
      </div>
    </section>
  );
}

type FilterSelectProps = {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
};

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: FilterSelectProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400"
      >
        {options.map((option) => (
          <option key={`${label}-${option.value}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ContextBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700">
      {label}: {value}
    </div>
  );
}
