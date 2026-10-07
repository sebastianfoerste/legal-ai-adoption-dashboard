export function SyntheticNotice({ label, children }: { label?: string; children?: React.ReactNode }) {
  return (
    <aside
      className="rounded-lg border border-dashed border-violet-300 bg-violet-50/60 px-4 py-3 text-sm text-gray-700"
      aria-label="Synthetic data notice"
    >
      <p className="text-xs font-bold uppercase tracking-wider text-violet-700">
        {label ?? "Synthetic data"}
      </p>
      <p className="mt-1">
        {children ??
          "Accounts, specialists and figures on this page are invented for demonstration. No real client data, no document contents and no vendor integration."}
      </p>
    </aside>
  );
}
