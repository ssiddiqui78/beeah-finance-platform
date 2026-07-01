export type NavigationItem = {
  label: string;
  href: string;
  description: string;
};

export const primaryNavigation: NavigationItem[] = [
  {
    label: "Executive Summary",
    href: "/executive-summary",
    description:
      "Group-level KPIs, variance highlights, and management attention items.",
  },
  {
    label: "Consolidated P&L",
    href: "/consolidated-pnl",
    description: "Earnings bridge, line-item performance, and margin analysis.",
  },
  {
    label: "Balance Sheet",
    href: "/balance-sheet",
    description:
      "Financial position, liquidity, leverage, and working capital views.",
  },
  {
    label: "Segment Performance",
    href: "/segment-performance",
    description:
      "Vertical, sub-vertical, company, and profit-center performance analysis.",
  },
  {
    label: "Reporting Admin",
    href: "/reporting-admin",
    description:
      "Workbook import, snapshot refresh, and reporting source controls.",
  },
];
