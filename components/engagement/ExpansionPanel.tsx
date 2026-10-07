import {
  recommendationLabel,
  type ExpansionAssessment,
  type Recommendation,
} from "@/lib/engagement/expansion";
import { formatDate } from "@/lib/engagement/as-of";
import { reviewPriorityLabel, type RenewalAid } from "@/lib/engagement/renewal";
import { Pill, statusText, statusTone, type Tone } from "./Pill";

export const recommendationTone: Record<Recommendation, Tone> = {
  expand: "good",
  continue: "info",
  adjust: "warn",
  pause: "bad",
};

export function RecommendationPill({
  recommendation,
  short = false,
}: {
  recommendation: Recommendation;
  short?: boolean;
}) {
  return (
    <Pill tone={recommendationTone[recommendation]}>
      {!short && "Review recommendation: "}
      {recommendationLabel[recommendation]}
    </Pill>
  );
}

export function ExpansionPanel({ assessment }: { assessment: ExpansionAssessment }) {
  return (
    <div className="rounded-lg border border-gray-200">
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-gray-100 bg-gray-50 px-3 py-2">
        <div className="min-w-0">
          <p className="text-sm text-gray-700">
            {assessment.proposedScope
              ? `Scope under review: ${assessment.proposedScope}`
              : "No expansion scope is recorded for this account."}
          </p>
          <p className="mt-0.5 text-xs text-gray-500">
            {assessment.counts.met} of 6 criteria met · {assessment.counts.not_met} not met ·{" "}
            {assessment.counts.unknown} unknown
          </p>
        </div>
        <RecommendationPill recommendation={assessment.recommendation} />
      </div>

      <ul className="space-y-1 border-b border-gray-100 px-3 py-3 text-sm text-gray-700">
        {assessment.reasoning.map((line, index) => (
          <li key={line} className={index === 0 ? "font-medium text-gray-900" : ""}>
            {line}
          </li>
        ))}
      </ul>

      <ul className="divide-y divide-gray-100">
        {assessment.criteria.map((criterion) => (
          <li key={criterion.key} className="grid gap-2 px-3 py-3 sm:grid-cols-[14rem_1fr]">
            <div className="flex items-start justify-between gap-2 sm:block">
              <p className="text-sm font-medium text-gray-900">{criterion.label}</p>
              <p className="sm:mt-1">
                <Pill tone={statusTone[criterion.status]}>{statusText[criterion.status]}</Pill>
              </p>
            </div>
            <div className="space-y-1 text-sm">
              {criterion.evidence.map((item) => (
                <p key={item} className="text-gray-700">
                  {item}
                </p>
              ))}
              {criterion.missing.map((item) => (
                <p key={item} className="italic text-gray-500">
                  Missing evidence: {item}
                </p>
              ))}
              {criterion.caveats.map((item) => (
                <p key={item} className="text-xs text-amber-800">
                  Caveat: {item}
                </p>
              ))}
            </div>
          </li>
        ))}
      </ul>

      <div className="space-y-1 border-t border-gray-100 bg-gray-50 px-3 py-2 text-xs text-gray-600">
        <p>{assessment.feedbackNote}</p>
        <p>Decision: {assessment.decisionOwner} This panel recommends; it does not decide.</p>
      </div>
    </div>
  );
}

const bearingTone: Record<RenewalAid["signals"][number]["bearing"], Tone> = {
  favourable: "good",
  adverse: "bad",
  unknown: "neutral",
};

export function RenewalAidPanel({ aid }: { aid: RenewalAid }) {
  return (
    <div className="rounded-lg border border-gray-200">
      <div className="border-b border-gray-100 bg-gray-50 px-3 py-2">
        <p className="text-sm font-medium text-gray-900">
          {reviewPriorityLabel[aid.reviewPriority]} · renewal date {formatDate(aid.renewalDate)}, in{" "}
          {aid.daysToRenewal} days
        </p>
        <p className="mt-0.5 text-xs text-gray-600">{aid.disclaimer}</p>
      </div>
      <ul className="divide-y divide-gray-100">
        {aid.signals.map((signal) => (
          <li key={signal.label} className="flex flex-wrap items-baseline gap-2 px-3 py-2 text-sm">
            <span className="w-44 shrink-0 font-medium text-gray-900">{signal.label}</span>
            <Pill tone={bearingTone[signal.bearing]}>{signal.bearing}</Pill>
            <span className="min-w-0 flex-1 basis-64 text-gray-700">{signal.evidence}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
