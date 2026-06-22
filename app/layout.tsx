import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Legal AI Adoption Dashboard",
  description: "Mock post-sales dashboard for steering legal-AI adoption. Synthetic data.",
};

const nav = [
  { href: "/", label: "Account Health" },
  { href: "/blockers", label: "Adoption Blockers" },
  { href: "/feedback", label: "Product Feedback" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-gray-900">
        <nav className="border-b border-gray-200">
          <div className="mx-auto flex max-w-5xl items-center gap-1 px-6 py-3">
            <span className="mr-4 text-sm font-semibold">Legal AI Adoption</span>
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
