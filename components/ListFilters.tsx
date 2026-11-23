import Link from "next/link";
import { describeFilter, type FilterField, type ParsedFilter } from "@/lib/list-filters";
import type { SavedView } from "@/lib/views";
import { SavedViewLinks } from "@/components/SavedViewLinks";

const control =
  "mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-focus";

// A plain GET form: the filtered list is a URL, so it can be bookmarked or shared. No client JS.
export function ListFilters({
  path,
  fields,
  parsed,
  views,
  currentHref,
  asOf,
  note,
}: {
  path: string;
  fields: FilterField[];
  parsed: ParsedFilter;
  views: SavedView[];
  currentHref: string;
  /** Carried through so a filter does not reset a chosen as-of date. */
  asOf?: string;
  /** What the filters apply to on this page, and what they leave alone. */
  note: string;
}) {
  const active = Object.keys(parsed.values).length > 0;
  return (
    <section aria-labelledby="filters-heading" className="mb-8 rounded-lg border border-gray-200 bg-gray-50 p-4">
      <h2 id="filters-heading" className="text-label font-semibold text-gray-900">
        Filters
      </h2>
      <SavedViewLinks views={views} currentHref={currentHref} />
      <form method="GET" action={path} className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {asOf && <input type="hidden" name="asOf" value={asOf} />}
        {fields.map((field) => (
          <div key={field.key}>
            <label htmlFor={`filter-${field.key}`} className="block text-xs font-semibold uppercase text-gray-600">
              {field.label}
            </label>
            <select id={`filter-${field.key}`} name={field.key} defaultValue={parsed.values[field.key] ?? ""} className={control}>
              <option value="">All</option>
              {field.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        ))}
        <div className="flex items-end gap-2">
          <button
            type="submit"
            className="inline-flex cursor-pointer items-center rounded-lg bg-violet-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-focus"
          >
            Apply
          </button>
          {active && (
            <Link
              href={asOf ? `${path}?asOf=${asOf}` : path}
              className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-focus"
            >
              Reset
            </Link>
          )}
        </div>
      </form>
      <p className="mt-3 text-xs text-gray-600" role="status">
        {describeFilter(fields, parsed.values)} {note}
        {parsed.rejected.map((r) => (
          <span key={r.key} className="ml-1 text-amber-700">
            Ignored {r.key} &quot;{r.value}&quot;: not one of its options.
          </span>
        ))}
      </p>
    </section>
  );
}
