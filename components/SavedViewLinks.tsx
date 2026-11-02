import Link from "next/link";
import type { SavedView } from "@/lib/views";

// Shared, committed views (data/views.json). The one matching the current URL is marked.
export function SavedViewLinks({ views, currentHref }: { views: SavedView[]; currentHref: string }) {
  if (views.length === 0) return null;
  return (
    <nav aria-label="Saved views" className="mt-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">Saved views</p>
      <ul className="mt-1 flex flex-wrap gap-2">
        {views.map((view) => {
          const current = view.href === currentHref;
          return (
            <li key={view.id}>
              <Link
                href={view.href}
                title={view.description}
                aria-current={current ? "page" : undefined}
                className={`inline-block rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset focus:outline-none focus:ring-2 focus:ring-focus ${
                  current ? "bg-gray-900 text-white ring-gray-900" : "bg-white text-gray-700 ring-gray-300 hover:bg-gray-100"
                }`}
              >
                {view.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
