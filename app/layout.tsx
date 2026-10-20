import type { Metadata } from "next";
import { NavLinks } from "@/components/NavLinks";
import "./globals.css";

// No next/font/google: it downloads the font at build time, so the build failed without
// network access and was not reproducible. The font stacks are defined in globals.css.

export const metadata: Metadata = {
  title: "Legal AI Adoption Dashboard",
  description: "Mock post-sales dashboard for steering legal-AI adoption. Synthetic data.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full bg-white text-gray-900 lg:flex">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-10 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-link focus:ring-2 focus:ring-focus"
        >
          Skip to content
        </a>
        {/* A sidebar from the lg breakpoint: the eight links wrapped to two rows at 1280px. */}
        <nav
          aria-label="Main"
          className="border-b border-gray-200 lg:sticky lg:top-0 lg:h-screen lg:w-56 lg:shrink-0 lg:overflow-y-auto lg:border-b-0 lg:border-r"
        >
          <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-6 py-3 lg:mx-0 lg:flex-col lg:items-stretch lg:gap-6 lg:px-3 lg:py-6">
            <span className="text-sm font-semibold lg:px-3">Legal AI Adoption</span>
            <NavLinks />
          </div>
        </nav>
        <div className="flex min-h-full min-w-0 flex-1 flex-col">
          <div id="content" tabIndex={-1} className="flex-1 focus:outline-none">
            {children}
          </div>
          <footer className="border-t border-gray-200">
            <div className="mx-auto max-w-5xl px-6 py-4 text-xs text-muted">
              Synthetic demonstration data — no real client, firm, or personal data.
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
