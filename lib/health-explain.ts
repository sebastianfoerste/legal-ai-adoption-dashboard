import healthConfig from "../data/health-config.json";
import { BAND_FLOORS, type HealthBand, type HealthResult } from "./health";

/**
 * Explains a computed health score in the terms of its formula: the configured weights, the
 * weights after an unknown component is left out, the points each component earned, the
 * blocker penalty and the band cut-offs. Pure; reads the result, never recomputes it.
 *
 * What it does not do: say why a score moved. Only the previous total is stored, not the
 * previous breakdown, so a change is reported as a number and attributed to nothing.
 */

export type ExplainedComponent = "utilization" | "trend" | "reviewedCompletion";

export interface ComponentRow {
  key: ExplainedComponent;
  label: string;
  measures: string;
  /** Share of the score in the configuration, 0..1. */
  configuredWeight: number;
  /** Share after unknown components are left out, 0..1; null when this one is unknown. */
  effectiveWeight: number | null;
  /** Points earned; null when the component was not captured. Never 0 for unknown. */
  points: number | null;
  /** The most this component could contribute for this account. */
  maxPoints: number | null;
}

export interface BandRow {
  band: HealthBand;
  label: string;
  from: number;
  to: number;
}

export interface HealthExplanation {
  components: ComponentRow[];
  penalty: { points: number; cap: number; perBlocker: { high: number; medium: number; low: number } };
  rescaled: boolean;
  bands: BandRow[];
  change: { previous: number; current: number; delta: number } | null;
  /** Points minus penalty before rounding, and how the shown score follows from it. */
  total: { unrounded: number; limited: "floor" | "ceiling" | null; score: number };
  notes: string[];
}

export const bandLabel: Record<HealthBand, string> = {
  at_risk: "At risk",
  needs_attention: "Needs attention",
  steady: "Steady",
  healthy: "Healthy",
};

export const HEALTH_BANDS: BandRow[] = [
  { band: "at_risk", label: bandLabel.at_risk, from: 0, to: BAND_FLOORS.needs_attention - 1 },
  { band: "needs_attention", label: bandLabel.needs_attention, from: BAND_FLOORS.needs_attention, to: BAND_FLOORS.steady - 1 },
  { band: "steady", label: bandLabel.steady, from: BAND_FLOORS.steady, to: BAND_FLOORS.healthy - 1 },
  { band: "healthy", label: bandLabel.healthy, from: BAND_FLOORS.healthy, to: 100 },
];

const DEFINITIONS: Record<ExplainedComponent, { label: string; measures: string }> = {
  utilization: { label: "Licence use", measures: "Active users divided by licensed seats." },
  trend: {
    label: "Usage trend",
    measures: "Change in weekly active users from the first to the latest week of the series.",
  },
  reviewedCompletion: {
    label: "Reviewed output",
    measures: "Draft outputs a human reviewer verified, divided by draft outputs produced.",
  },
};

export const CHANGE_NOTE =
  "Only the previous total is stored, not its breakdown, so this view does not say which component moved.";
export const ROUNDING_NOTE =
  "Points are rounded for display, so they may not add up exactly to the score. The score is the unrounded total, kept between 0 and 100, rounded once.";
export const EXPANSION_NOTE =
  "The score is a triage aid. It is not an input to expansion readiness and does not predict renewal.";

export function explainHealth(
  result: HealthResult,
  previousScore?: number | null,
  config = healthConfig,
): HealthExplanation {
  const w = config.weights;
  const unknown = new Set<string>(result.unknownComponents);
  const known = (key: ExplainedComponent) => !unknown.has(key);
  const knownWeight = (Object.keys(w) as ExplainedComponent[]).filter(known).reduce((sum, key) => sum + w[key], 0);
  const points: Record<ExplainedComponent, number | null> = {
    utilization: result.breakdown.utilizationPts,
    trend: result.breakdown.trendPts,
    reviewedCompletion: result.breakdown.reviewedCompletionPts,
  };

  const components = (["utilization", "trend", "reviewedCompletion"] as const).map((key): ComponentRow => {
    const isKnown = known(key) && points[key] !== null;
    const effectiveWeight = isKnown && knownWeight > 0 ? w[key] / knownWeight : null;
    return {
      key,
      ...DEFINITIONS[key],
      configuredWeight: w[key],
      effectiveWeight,
      points: isKnown ? points[key] : null,
      maxPoints: effectiveWeight === null ? null : effectiveWeight * 100,
    };
  });

  const rescaled = components.some((c) => c.points === null);
  const notes = [
    ...(rescaled
      ? [
          `${components
            .filter((c) => c.points === null)
            .map((c) => c.label)
            .join(" and ")} was not captured, so it is left out and the other weights are rescaled to 100. A missing measurement neither raises nor lowers the score.`,
        ]
      : []),
    ROUNDING_NOTE,
    EXPANSION_NOTE,
  ];
  const unrounded = components.reduce((sum, c) => sum + (c.points ?? 0), 0) - result.breakdown.penalty;

  const p = config.penalties;
  return {
    components,
    penalty: {
      points: result.breakdown.penalty,
      cap: p.maxPenalty,
      perBlocker: { high: p.highBlocker, medium: p.mediumBlocker, low: p.lowBlocker },
    },
    rescaled,
    bands: HEALTH_BANDS,
    change:
      previousScore === undefined || previousScore === null
        ? null
        : { previous: previousScore, current: result.score, delta: result.score - previousScore },
    total: {
      unrounded,
      limited: unrounded < 0 ? "floor" : unrounded > 100 ? "ceiling" : null,
      score: result.score,
    },
    notes,
  };
}
