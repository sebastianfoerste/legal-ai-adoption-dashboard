import Link from "next/link";
import { getAccounts } from "@/lib/data";
import { formatDate, resolveAsOf } from "@/lib/engagement/as-of";
import { getInterventions } from "@/lib/engagement/data";
import {
  INTERVENTION_STAGES,
  interventionStage,
  stageLabel,
  summarizeInterventions,
  type InterventionStage,
} from "@/lib/engagement/interventions";
import { InterventionCard } from "@/components/engagement/InterventionCard";
import { AsOfNote } from "@/components/AsOfNote";
import { PageHeader } from "@/components/PageHeader";
import { SyntheticNotice } from "@/components/SyntheticNotice";

const stageMeaning: Record<InterventionStage, string> = {
  proposed: "A problem, its evidence and a hypothesis are recorded. Nothing has started.",
  underway: "The action is being delivered. No outcome can be stated.",
  completed:
    "The action is delivered. Whether it worked is open until follow-up observations are evaluated.",
  evaluated:
    "Follow-up observations were compared with the expected result. The result can still be that it was not achieved.",
};

export default async function InterventionsPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const asOfState = resolveAsOf((await searchParams)?.asOf);
  const asOf = asOfState.date;
  const interventions = getInterventions();
  const summary = summarizeInterventions(interventions, asOf);
  const accounts = getAccounts();
  const accountName = (id: string) => accounts.find((a) => a.id === id)?.name ?? id;

  const stats: { label: string; value: number; tone: string }[] = [
    { label: "Proposed", value: summary.byStage.proposed, tone: "text-gray-900" },
    { label: "Underway", value: summary.byStage.underway, tone: "text-sky-700" },
    { label: "Completed, not evaluated", value: summary.byStage.completed, tone: "text-amber-700" },
    { label: "Evaluated", value: summary.byStage.evaluated, tone: "text-violet-700" },
    { label: "Result achieved", value: summary.byResult.achieved, tone: "text-emerald-700" },
    { label: "Result not achieved", value: summary.byResult.not_achieved, tone: "text-red-700" },
    { label: "Follow-ups overdue", value: summary.followUpsOverdue, tone: "text-red-700" },
  ];

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <PageHeader
        title="Interventions"
        subtitle={`Every intervention from observed problem to evaluated outcome, as of ${formatDate(asOf)}. Delivering an action does not establish that it worked.`}
      >
        <AsOfNote asOf={asOfState} />
        <div className="mt-6">
          <SyntheticNotice />
        </div>
      </PageHeader>

      <section
        className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7"
        aria-label="Interventions by stage and result"
      >
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-gray-200 p-3 text-center">
            <div className={`text-2xl font-semibold ${s.tone}`}>{s.value}</div>
            <div className="mt-0.5 text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </section>

      <div className="space-y-10">
        {INTERVENTION_STAGES.map((stage) => {
          const inStage = interventions.filter((i) => interventionStage(i) === stage);
          return (
            <section key={stage} aria-labelledby={`stage-${stage}`}>
              <h2 id={`stage-${stage}`} className="text-lg font-semibold text-gray-900">
                {stageLabel[stage]} <span className="font-normal text-gray-400">({inStage.length})</span>
              </h2>
              <p className="mt-1 text-sm text-gray-600">{stageMeaning[stage]}</p>
              <div className="mt-4 space-y-4">
                {inStage.length === 0 && (
                  <p className="text-sm italic text-gray-400">No intervention in this stage.</p>
                )}
                {inStage.map((intervention) => (
                  <div key={intervention.id}>
                    <InterventionCard
                      intervention={intervention}
                      accountName={accountName(intervention.accountId)}
                      asOf={asOf}
                    />
                    <p className="mt-1 text-right text-xs">
                      <Link
                        href={`/accounts/${intervention.accountId}`}
                        className="font-medium text-violet-600 hover:text-violet-700"
                      >
                        Open {accountName(intervention.accountId)} →
                      </Link>
                    </p>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
