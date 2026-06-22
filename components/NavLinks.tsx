"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/", label: "Account Health" },
  { href: "/blockers", label: "Adoption Blockers" },
  { href: "/feedback", label: "Product Feedback" },
];

export function NavLinks() {
  const pathname = usePathname();
  return (
    <>
      {nav.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              active
                ? "bg-gray-900 text-white"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}
