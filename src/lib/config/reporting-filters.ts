export type FilterOption = {
  label: string;
  value: string;
};

export const periodOptions: FilterOption[] = [
  { label: "Latest", value: "latest" },
  { label: "Mar 2026 YTD", value: "2026-03" },
  { label: "Q1 2026", value: "2026-q1" },
];

export const scenarioOptions: FilterOption[] = [
  { label: "Actual vs Budget", value: "actual_vs_budget" },
  { label: "Actual only", value: "actual" },
  { label: "Budget only", value: "budget" },
  { label: "Forecast", value: "forecast" },
];

export const verticalOptions: FilterOption[] = [
  { label: "All Verticals", value: "all" },
  { label: "Environment", value: "ENV" },
  { label: "Capital", value: "Cap" },
  { label: "Real Estate", value: "RE" },
  { label: "Executive", value: "Exec" },
];

export const subVerticalOptions: FilterOption[] = [
  { label: "All Sub-Verticals", value: "all" },
  { label: "Tandeef", value: "Tandeef" },
  { label: "Recycling", value: "Recycling" },
  { label: "Re.Life", value: "Re.Life" },
  { label: "Shared Services", value: "Shared Services" },
  { label: "ECS", value: "ECS" },
  { label: "Digital", value: "Digital" },
  { label: "BRE", value: "BRE" },
  { label: "Capital", value: "Capital" },
  { label: "Hospital", value: "Hospital" },
  { label: "Executive", value: "Executive" },
];

export const reportingViewOptions: FilterOption[] = [
  { label: "Group View", value: "group" },
  { label: "Segment View", value: "segment" },
  { label: "Company View", value: "company" },
  { label: "Profit Center View", value: "profit_center" },
];
