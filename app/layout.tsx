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
      <body className="min-h-full flex flex-col bg-white text-gray-900">
        <nav className="border-b border-gray-200">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-1 px-6 py-3">
            <span className="mr-4 text-sm font-semibold">Legal AI Adoption</span>
            <NavLinks />
          </div>
        </nav>
        <div className="flex-1">{children}</div>
        <footer className="border-t border-gray-200">
          <div className="mx-auto max-w-5xl px-6 py-4 text-xs text-gray-400">
            Synthetic demonstration data — no real client, firm, or personal data.
          </div>
        </footer>
      </body>
    </html>
  );
}
