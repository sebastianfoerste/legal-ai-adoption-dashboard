import type { Severity } from "@/lib/schema";

const styles: Record<Severity, string> = {
  low: "bg-gray-100 text-gray-700 ring-gray-300",
  medium: "bg-amber-100 text-amber-800 ring-amber-300",
  high: "bg-red-100 text-red-800 ring-red-300",
};

export function SeverityTag({ severity }: { severity: Severity }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium uppercase tracking-wide ring-1 ring-inset ${styles[severity]}`}
    >
      {severity}
    </span>
  );
}
