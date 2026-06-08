// src/components/shared/period-filter.tsx
"use client";

import React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export default function PeriodFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Resolve current active query parameter state defaulting to 'all' (Full Year)
  const currentPeriod = searchParams.get("period") || "all";

  const filterOptions = [
    { label: "Full Year", value: "all" },
    { label: "Q1 Performance", value: "Q1" },
    { label: "Q2 Performance", value: "Q2" },
    { label: "Q3 Performance", value: "Q3" },
    { label: "Q4 Performance", value: "Q4" },
  ];

  const handlePeriodChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("period");
    } else {
      params.set("period", value);
    }
    
    // Push the updated search parameter instantly without hard window refreshes
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center justify-between border border-slate-200 bg-white px-6 py-3 rounded-xl shadow-sm">
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
        Reporting Window Focus
      </div>
      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
        {filterOptions.map((opt) => {
          const isActive = currentPeriod === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => handlePeriodChange(opt.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                isActive
                  ? "bg-white text-emerald-700 shadow-sm font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
