import type { HealthResult } from "@/lib/health";
import { CHANGE_NOTE, explainHealth } from "@/lib/health-explain";

const pct = (share: number) => `${Math.round(share * 100)}%`;
const pts = (value: number) => Math.round(value).toString();

// How the score is built for this account, in the formula's own terms. Collapsed by default;
// the badge caption above it already carries the points.
export function HealthExplanation({ health, previousScore }: { health: HealthResult; previousScore?: number }) {
  const e = explainHealth(health, previousScore);
  return (
    <details className="mt-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
      <summary className="cursor-pointer font-medium text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus">
        How this score is built
      </summary>
      <div className="mt-2 space-y-3">
        <div tabIndex={0} className="overflow-x-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-focus">
          <table className="w-full min-w-[560px] text-left text-xs">
            <caption className="sr-only">Health score components, weights and points</caption>
            <thead className="text-muted">
              <tr>
                <th scope="col" className="py-1 pr-3 font-medium">Component</th>
                <th scope="col" className="py-1 pr-3 font-medium">What it measures</th>
                <th scope="col" className="py-1 pr-3 font-medium">Weight</th>
                <th scope="col" className="py-1 font-medium">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-700">
              {e.components.map((c) => (
                <tr key={c.key}>
                  <th scope="row" className="py-1.5 pr-3 font-medium text-gray-900">{c.label}</th>
                  <td className="py-1.5 pr-3">{c.measures}</td>
                  <td className="py-1.5 pr-3 whitespace-nowrap">
                    {pct(c.configuredWeight)}
                    {e.rescaled && c.effectiveWeight !== null && ` → ${pct(c.effectiveWeight)}`}
                  </td>
                  <td className="py-1.5 whitespace-nowrap">
                    {c.points === null || c.maxPoints === null ? (
                      <span className="italic text-unknown">Unknown, left out</span>
                    ) : (
                      `${pts(c.points)} of ${pts(c.maxPoints)}`
                    )}
                  </td>
                </tr>
              ))}
              <tr>
                <th scope="row" className="py-1.5 pr-3 font-medium text-gray-900">Open blockers</th>
                <td className="py-1.5 pr-3">
                  Minus {e.penalty.perBlocker.high} per high, {e.penalty.perBlocker.medium} per medium and{" "}
                  {e.penalty.perBlocker.low} per low blocker, at most {e.penalty.cap}.
                </td>
                <td className="py-1.5 pr-3">Penalty</td>
                <td className="py-1.5 whitespace-nowrap">−{pts(e.penalty.points)}</td>
              </tr>
              <tr>
                <th scope="row" className="py-1.5 pr-3 font-medium text-gray-900">Score</th>
                <td className="py-1.5 pr-3">
                  Total before rounding: {e.total.unrounded.toFixed(1)}
                  {e.total.limited === "floor" && ", raised to 0: the score cannot fall below 0"}
                  {e.total.limited === "ceiling" && ", capped at 100"}. Rounded once.
                </td>
                <td className="py-1.5 pr-3" />
                <td className="py-1.5 whitespace-nowrap font-semibold text-gray-900">{e.total.score}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-600">
          Bands: {e.bands.map((b) => `${b.label} ${b.from}–${b.to}`).join(" · ")}. Weights and penalties are
          read from <code className="font-mono">data/health-config.json</code>.
        </p>
        {e.change && (
          <p className="text-xs text-gray-600">
            Since the last QBR: {e.change.previous} → {e.change.current} ({e.change.delta > 0 ? "+" : ""}
            {e.change.delta}). {CHANGE_NOTE}
          </p>
        )}
        {e.notes.map((note) => (
          <p key={note} className="text-xs text-gray-600">{note}</p>
        ))}
      </div>
    </details>
  );
}
