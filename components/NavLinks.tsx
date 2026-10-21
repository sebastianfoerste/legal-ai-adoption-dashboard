"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navGroups } from "@/lib/navigation";

// Grouped by job, as the docs describe them: watch the portfolio, read the signals, close the
// product loop. A sidebar from the lg breakpoint, a wrapping row below it.
export function NavLinks() {
  const pathname = usePathname();
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2 lg:flex-col lg:gap-5">
      {navGroups.map((group) => (
        <div key={group.id}>
          <p id={`nav-${group.id}`} className="mb-1 hidden px-3 text-xs font-semibold uppercase tracking-wide text-muted lg:block">
            {group.label}
          </p>
          <ul aria-labelledby={`nav-${group.id}`} className="flex flex-wrap gap-1 lg:flex-col">
            {group.items.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`block rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-focus ${
                      active
                        ? "bg-gray-900 text-white"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
