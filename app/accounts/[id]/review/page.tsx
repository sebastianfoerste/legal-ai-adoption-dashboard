import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate, resolveAsOf } from "@/lib/engagement/as-of";
import { buildCustomerReview } from "@/lib/engagement/customer-review";
import { recommendationLabel, recommendationMeaning } from "@/lib/engagement/expansion";
import { stageLabel } from "@/lib/engagement/interventions";
import { AsOfNote } from "@/components/AsOfNote";
import { PageHeader } from "@/components/PageHeader";
import { SyntheticNotice } from "@/components/SyntheticNotice";
import { AdoptionTrendTable, MetricDefinitions } from "@/components/engagement/AdoptionTrendTable";
import {
  ExpansionPanel,
  RenewalAidPanel,
  recommendationTone,
} from "@/components/engagement/ExpansionPanel";
import { stageTone } from "@/components/engagement/InterventionCard";
import { Pill, statusText, statusTone } from "@/components/engagement/Pill";
import { ValuePanel } from "@/components/engagement/ValuePanel";
import { ChangeEvidenceSummary } from "@/components/evidence/ChangeEvidence";

function Section({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={`section-${number}`}>
      <h2 id={`section-${number}`} className="mb-4 text-lg font-semibold text-gray-900">
        <span className="mr-2 text-gray-400">{number}.</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

const Unknown = ({ children }: { children: React.ReactNode }) => (
  <p className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm italic text-gray-500">
    Unknown: {children}
  </p>
);

function BulletList({ items, empty }: { items: string[]; empty: string }) {
  if (items.length === 0) return <p className="text-sm text-gray-500">{empty}</p>;
  return (
    <ul className="list-disc space-y-1.5 pl-5 text-sm text-gray-700">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export default async function CustomerReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const asOfState = resolveAsOf((await searchParams)?.asOf);
  const review = buildCustomerReview(id, asOfState.date);
  if (!review) notFound();
  const { expansion } = review;

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-6">
        <Link
          href={`/accounts/${review.accountId}`}
          className="text-sm font-medium text-violet-600 hover:text-violet-700"
        >
          ← Back to {review.accountName}
        </Link>
      </div>

      <PageHeader
        title={`Customer review: ${review.accountName}`}
        subtitle={`As of ${formatDate(review.asOf)} · next review ${formatDate(review.nextReviewDate)}`}
      >
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <a
            href={`/insights/report?account=${review.accountId}&asOf=${review.asOf}`}
            className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            Download Markdown
          </a>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs text-amber-800">
            draft for account-owner review
          </span>
        </div>
        <AsOfNote asOf={asOfState} />
        <div className="mt-6">
          <SyntheticNotice label={review.scenario?.label ?? "Synthetic scenario"}>
            {review.scenario ? `${review.scenario.summary} ` : ""}
            Invented account and figures. No real client data, no document contents, no vendor
            integration. Not legal advice.
          </SyntheticNotice>
        </div>
        <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone={recommendationTone[expansion.recommendation]}>
              Recommendation: {recommendationLabel[expansion.recommendation]}
            </Pill>
            <span className="text-xs text-gray-500">
              {expansion.counts.met} of 6 criteria met · {expansion.counts.not_met} not met ·{" "}
              {expansion.counts.unknown} unknown
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-700">
            {recommendationMeaning[expansion.recommendation]} Reasoning and evidence are in
            section 6.
          </p>
        </div>
      </PageHeader>

      <div className="space-y-10">
        <Section number={1} title="Objectives">
          {review.objectives.length === 0 ? (
            <Unknown>no measurable objectives are agreed with the customer.</Unknown>
          ) : (
            <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200">
              {review.objectives.map((result) => (
                <li key={result.objective.id} className="grid gap-2 px-3 py-3 sm:grid-cols-[1fr_auto]">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{result.objective.statement}</p>
                    <p className="mt-0.5 text-sm text-gray-600">Observed: {result.observed}</p>
                  </div>
                  <p>
                    <Pill tone={statusTone[result.status]}>{statusText[result.status]}</Pill>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section number={2} title="Adoption trends">
          <div className="space-y-4">
            {review.adoption.length === 0 ? (
              <Unknown>no period-by-period adoption series is recorded.</Unknown>
            ) : (
              review.adoption.map((metrics) => (
                <AdoptionTrendTable key={metrics.series.id} metrics={metrics} />
              ))
            )}
            <MetricDefinitions />
          </div>
        </Section>

        <Section number={3} title="Intervention outcomes">
          {review.interventions.length === 0 ? (
            <p className="text-sm text-gray-500">No intervention is recorded.</p>
          ) : (
            <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200">
              {review.interventions.map((item) => (
                <li key={item.intervention.id} className="px-3 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/interventions#${item.intervention.id}`}
                      className="font-mono text-xs text-violet-600 hover:text-violet-700"
                    >
                      {item.intervention.id}
                    </Link>
                    <Pill tone={stageTone[item.stage]}>{stageLabel[item.stage]}</Pill>
                    <span className="text-xs text-gray-500">Owner: {item.owner}</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-700">
                    <span className="font-medium text-gray-900">Action:</span>{" "}
                    {item.intervention.action}
                  </p>
                  <p className="mt-1 text-sm text-gray-700">
                    <span className="font-medium text-gray-900">Expected:</span>{" "}
                    {item.intervention.expectedResult.target}, by{" "}
                    {formatDate(item.intervention.expectedResult.byDate)}.
                  </p>
                  <p className="mt-1 text-sm text-gray-700">
                    <span className="font-medium text-gray-900">Status:</span> {item.statement}{" "}
                    {item.intervention.outcome?.rationale}
                  </p>
                  {item.stage !== "evaluated" && (
                    <p className="mt-1 text-xs text-gray-500">{item.followUp}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section number={4} title="Quality evidence">
          <div className="space-y-4">
            {review.quality.length === 0 ? (
              <Unknown>no measurement of time to an acceptable result is recorded.</Unknown>
            ) : (
              review.quality.map((value) => <ValuePanel key={value.measurement.id} value={value} />)
            )}
          </div>
        </Section>

        <Section number={5} title="Unresolved problems">
          <BulletList items={review.unresolved} empty="None recorded." />
          <h3 className="mb-2 mt-5 text-sm font-semibold text-gray-900">Evidence gaps</h3>
          <BulletList items={review.evidenceGaps} empty="None recorded." />
          <h3 className="mb-1 mt-5 text-sm font-semibold text-gray-900">Product feedback and evidence</h3>
          <p className="mb-3 text-sm text-gray-600">
            Changes recorded against problems this account raised. A release is not an outcome, and
            none of this enters the recommendation below.
          </p>
          {review.productEvidence.length === 0 ? (
            <Unknown>
              no change record is linked to this account&apos;s feedback, so delivery status and
              outcome cannot be stated.
            </Unknown>
          ) : (
            <div className="space-y-2">
              {review.productEvidence.map((view) => (
                <ChangeEvidenceSummary key={view.change.id} view={view} />
              ))}
            </div>
          )}
        </Section>

        <Section
          number={6}
          title={`Recommendation: ${recommendationLabel[expansion.recommendation]}`}
        >
          <div className="space-y-4">
            <ExpansionPanel assessment={expansion} />
            <RenewalAidPanel aid={review.renewal} />
          </div>
        </Section>

        <Section number={7} title="Owners and next review dates">
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-400">
                <tr>
                  <th className="px-3 py-2 font-medium">Item</th>
                  <th className="px-3 py-2 font-medium">Owner</th>
                  <th className="px-3 py-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {review.owners.map((row) => (
                  <tr key={row.item}>
                    <td className="px-3 py-2 text-gray-700">{row.item}</td>
                    <td className="px-3 py-2 text-gray-700">{row.owner}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-gray-700">
                      {formatDate(row.date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-gray-500">
            Sources: {review.generatedFrom.join(", ")}. {review.reviewGate}
          </p>
        </Section>
      </div>
    </main>
  );
}
