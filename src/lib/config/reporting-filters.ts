export type FilterOption = {
  label: string;
  value: string;
};

export const defaultPeriodOption: FilterOption = {
  label: "Latest",
  value: "latest",
};

export const defaultVerticalOption: FilterOption = {
  label: "All Verticals",
  value: "all",
};

export const defaultSubVerticalOption: FilterOption = {
  label: "All Sub-Verticals",
  value: "all",
};

export const scenarioOptions: FilterOption[] = [
  { label: "Actual vs Budget", value: "actual_vs_budget" },
  { label: "Actual only", value: "actual" },
  { label: "Budget only", value: "budget" },
  { label: "Forecast", value: "forecast" },
];

export const reportingViewOptions: FilterOption[] = [
  { label: "Group View", value: "group" },
  { label: "Segment View", value: "segment" },
  { label: "Company View", value: "company" },
  { label: "Profit Center View", value: "profit_center" },
];
