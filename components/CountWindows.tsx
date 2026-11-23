import { PANEL_COUNTS, describeCounts, type Panel } from "@/lib/count-windows";

/** The window and lag of a panel's counts, in one line beside them (plan item C8). */
export function CountWindows({
  panel,
  asOf,
  weeks,
  className = "mt-2",
}: {
  panel: Panel;
  asOf: string;
  weeks: number | null;
  className?: string;
}) {
  return (
    <p className={`text-xs text-muted ${className}`} data-testid="count-windows">
      {describeCounts(PANEL_COUNTS[panel], { asOf, weeks })}
    </p>
  );
}
