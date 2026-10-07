import type { ReactNode } from "react";

export type Tone = "good" | "bad" | "warn" | "neutral" | "info" | "accent";

const tones: Record<Tone, string> = {
  good: "bg-emerald-100 text-emerald-800 ring-emerald-300",
  bad: "bg-red-100 text-red-800 ring-red-300",
  warn: "bg-amber-100 text-amber-800 ring-amber-300",
  neutral: "bg-gray-100 text-gray-700 ring-gray-300",
  info: "bg-sky-100 text-sky-800 ring-sky-300",
  accent: "bg-violet-100 text-violet-800 ring-violet-300",
};

export function Pill({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

// Unknown is always grey: it must never read as a pass or as a failure.
export const statusTone: Record<"met" | "not_met" | "unknown", Tone> = {
  met: "good",
  not_met: "bad",
  unknown: "neutral",
};

export const statusText: Record<"met" | "not_met" | "unknown", string> = {
  met: "Met",
  not_met: "Not met",
  unknown: "Unknown",
};
