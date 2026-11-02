import Link from "next/link";
import { Pill } from "@/components/engagement/Pill";
import { deliveryTone, outcomeTone } from "@/components/evidence/ChangeEvidence";
import { SeverityTag } from "@/components/SeverityTag";
import { deliveryStatusLabel, outcomeStatusLabel } from "@/lib/evidence/loop";
import { formatCount, type FeedbackTheme } from "@/lib/feedback-themes";

// Themes in name order. The counts say how widely a theme was raised; they are not a rank,
// and routing is not delivery: delivery comes only from linked change records.
export function FeedbackThemes({
  themes,
  accountName,
}: {
  themes: FeedbackTheme[];
  accountName: (id: string) => string;
}) {
  return (
    <section aria-labelledby="themes-heading" className="mb-8">
      <h2 id="themes-heading" className="text-lg font-semibold text-gray-900">
        Themes
      </h2>
      <p className="mt-1 max-w-3xl text-sm text-gray-600">
        Listed by name. &ldquo;Raised by&rdquo; counts distinct accounts and persona roles out of
        every account and role in the synthetic portfolio, so a theme one heavy user repeats does
        not outweigh one raised across accounts. The counts are context for a product decision,
        not a ranking. Delivery is read from the change records that cite a theme&rsquo;s items.
      </p>
      <div
        tabIndex={0}
        className="mt-4 overflow-x-auto rounded-lg border border-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
      >
        <table className="w-full min-w-[760px] text-left text-sm">
          <caption className="sr-only">
            Feedback themes with the accounts and persona roles that raised them, routing and
            delivery from linked change records
          </caption>
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-muted">
            <tr>
              <th scope="col" className="px-3 py-2 font-medium">Theme</th>
              <th scope="col" className="px-3 py-2 font-medium">Raised by</th>
              <th scope="col" className="px-3 py-2 font-medium">Items</th>
              <th scope="col" className="px-3 py-2 font-medium">Routing (triage only)</th>
              <th scope="col" className="px-3 py-2 font-medium">Delivery (change records)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 align-top">
            {themes.map((t) => (
              <tr key={t.theme}>
                <th scope="row" className="px-3 py-2 font-medium text-gray-900">
                  {t.theme}
                  <div className="mt-1">
                    <SeverityTag severity={t.highestSeverity} />
                  </div>
                </th>
                <td className="px-3 py-2 text-gray-700">
                  <div className="font-medium text-gray-900">{formatCount(t.accounts, "accounts")}</div>
                  <div className="text-xs text-gray-600">{t.accountIds.map(accountName).join(", ")}</div>
                  <div className="mt-1 font-medium text-gray-900">{formatCount(t.personas, "persona roles")}</div>
                  <div className="text-xs text-gray-600">{t.personaRoles.join(", ")}</div>
                </td>
                <td className="px-3 py-2 text-gray-700">{t.itemIds.length}</td>
                <td className="px-3 py-2 text-xs text-gray-700">
                  {t.routing.new} new · {t.routing.triaged} triaged · {t.routing.shared_with_product} shared
                </td>
                <td className="px-3 py-2">
                  {t.changes.length === 0 ? (
                    <span className="text-xs italic text-unknown">
                      No change record: delivery unknown
                    </span>
                  ) : (
                    <ul className="space-y-1.5">
                      {t.changes.map((c) => (
                        <li key={c.changeId} className="text-xs">
                          <Link
                            href={`/research#${c.changeId}`}
                            className="font-medium text-link underline hover:text-link-hover focus:outline-none focus:ring-2 focus:ring-focus"
                          >
                            {c.changeId}: {c.title}
                          </Link>
                          <div className="mt-1 flex flex-wrap gap-1">
                            <Pill tone={deliveryTone[c.deliveryStatus]}>
                              {deliveryStatusLabel[c.deliveryStatus]}
                            </Pill>
                            <Pill tone={outcomeTone[c.view.outcomeStatus]}>
                              {c.view.outcomeStatus === "not_applicable"
                                ? outcomeStatusLabel.not_applicable
                                : `Outcome: ${outcomeStatusLabel[c.view.outcomeStatus]}`}
                            </Pill>
                          </div>
                        </li>
                      ))}
                      {t.itemsWithoutChange.length > 0 && (
                        <li className="text-xs italic text-unknown">
                          {t.itemsWithoutChange.length} of {t.itemIds.length} item(s) not cited by any
                          change record: their delivery is unknown
                        </li>
                      )}
                    </ul>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
