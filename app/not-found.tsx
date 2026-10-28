import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";

// Shown for an unknown route and for an account id the synthetic data does not hold.
export default function NotFound() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <PageHeader
        title="Not found"
        subtitle="No page or synthetic account matches this address. Account ids look like acct-001."
      />
      <Link href="/" className="text-sm font-medium text-link underline hover:text-link-hover focus:outline-none focus:ring-2 focus:ring-focus">
        Back to Account Health
      </Link>
    </main>
  );
}
