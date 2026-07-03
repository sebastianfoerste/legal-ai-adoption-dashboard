import { getAccounts, getFeedback } from "@/lib/data";
import { SeverityTag } from "@/components/SeverityTag";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import type { FeedbackItem } from "@/lib/schema";

const areaLabel: Record<FeedbackItem["productArea"], string> = {
  drafting: "Drafting",
  review: "Review",
  research: "Research",
  knowledge: "Knowledge",
  integrations: "Integrations",
  admin: "Admin & analytics",
};

const statusOrder: FeedbackItem["status"][] = ["new", "triaged", "shared_with_product"];
const statusLabel: Record<FeedbackItem["status"], string> = {
  new: "New",
  triaged: "Triaged",
  shared_with_product: "Shared with Product",
};

function StatusPipeline({ status }: { status: FeedbackItem["status"] }) {
  const idx = statusOrder.indexOf(status);
  return (
    <div className="flex items-center gap-1">
      {statusOrder.map((s, i) => (
        <span
          key={s}
          className={`rounded-full px-2 py-0.5 text-xs ${
            i <= idx ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-400"
          }`}
        >
          {statusLabel[s]}
        </span>
      ))}
    </div>
  );
}

export default function FeedbackPage() {
  const accounts = getAccounts();
  const accountName = (id: string) => accounts.find((a) => a.id === id)?.name ?? id;
  const feedback = getFeedback();

  const byArea = new Map<FeedbackItem["productArea"], FeedbackItem[]>();
  for (const f of feedback) {
    const list = byArea.get(f.productArea) ?? [];
    list.push(f);
    byArea.set(f.productArea, list);
  }

  const statusCounts = statusOrder.map((s) => ({
    status: s,
    count: feedback.filter((f) => f.status === s).length,
  }));

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <PageHeader
        title="Product Feedback Queue"
        subtitle="User friction captured during adoption, routed to product areas — the view you hand to Product and Engineering."
      >
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          {statusCounts.map(({ status, count }) => (
            <span key={status} className="rounded-lg border border-gray-200 px-3 py-1.5">
              <span className="font-semibold">{count}</span>{" "}
              <span className="text-gray-500">{statusLabel[status]}</span>
            </span>
          ))}
        </div>
      </PageHeader>

      <div className="space-y-6">
        {[...byArea.entries()].map(([area, items]) => (
          <Card key={area}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{areaLabel[area]}</h2>
              <span className="text-xs text-gray-400">{items.length} item(s)</span>
            </div>
            <ul className="mt-4 space-y-4">
              {items.map((f) => (
                <li
                  key={f.id}
                  className="border-t border-gray-100 pt-4 first:border-t-0 first:pt-0"
                >
                  <p className="text-sm text-gray-900">{f.text}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    <SeverityTag severity={f.severity} />
                    <span>{f.sourcePersona}</span>
                    <span>·</span>
                    <span>{accountName(f.accountId)}</span>
                    <span>·</span>
                    <span>{f.theme}</span>
                  </div>
                  <div className="mt-2">
                    <StatusPipeline status={f.status} />
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </main>
  );
}
