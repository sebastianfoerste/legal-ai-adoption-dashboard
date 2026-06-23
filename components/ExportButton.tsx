"use client";

import type { Account } from "@/lib/schema";
import { accountHealth } from "@/lib/aggregate";

interface ExportButtonProps {
  accounts: Account[];
}

export function ExportButton({ accounts }: ExportButtonProps) {
  const handleExport = () => {
    const headers = [
      "Account ID",
      "Account Name",
      "Account Type",
      "Total Seats",
      "Active Users",
      "Utilization Rate",
      "Health Score",
      "Health Band",
      "Renewal Date",
    ];

    const rows = accounts.map((a) => {
      const health = accountHealth(a.id);
      const utilization = a.seats > 0 ? (a.activeUsers / a.seats).toFixed(4) : "0.0000";
      return [
        a.id,
        `"${a.name.replace(/"/g, '""')}"`,
        a.type,
        a.seats,
        a.activeUsers,
        utilization,
        health.score,
        health.band,
        a.renewalDate,
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "harvey_csm_accounts_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleExport}
      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors cursor-pointer"
      title="Export portfolio accounts as CSV"
    >
      <svg
        className="h-3.5 w-3.5 text-gray-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        />
      </svg>
      Export CSV
    </button>
  );
}
