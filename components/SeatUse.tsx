import { SEAT_CONTEXT_NOTE, SEAT_SPLIT_NOTE, accountSeatUse, formatIdle, type SeatUse } from "@/lib/seat-use";
import type { Account } from "@/lib/schema";

function Row({ use, total }: { use: SeatUse; total?: boolean }) {
  const cell = "px-3 py-2";
  return (
    <tr className={total ? "border-t-2 border-gray-200 font-medium" : undefined}>
      <th scope="row" className={`${cell} text-left font-medium text-gray-900`}>{use.label}</th>
      <td className={`${cell} text-gray-700`}>{use.seats}</td>
      <td className={`${cell} text-gray-900`}>
        {use.idleLatest === null ? <span className="italic text-unknown">Unknown</span> : formatIdle(use.idleLatest, use.seats)}
      </td>
      <td className={`${cell} text-gray-700`}>
        {use.idleFirst === null ? <span className="italic text-unknown">Unknown</span> : formatIdle(use.idleFirst, use.seats)}
      </td>
      <td className={`${cell} italic text-unknown`}>Unknown</td>
    </tr>
  );
}

// Seats without an active user: counts only, with the split the data cannot support shown as
// Unknown. Context for the account owner, never a seat-removal or expansion signal.
export function SeatUseTable({ account }: { account: Account }) {
  const use = accountSeatUse(account);
  const inconsistent = [use.account, ...use.groups].some((s) => s.inconsistent);
  return (
    <section aria-labelledby="seat-use-title">
      <h3 id="seat-use-title" className="mb-2 text-base font-semibold text-gray-900">Seat use</h3>
      <p className="mb-4 max-w-3xl text-sm text-gray-600">
        Seats with no active user in a week, from the weekly active-user counts. {SEAT_CONTEXT_NOTE}
      </p>
      <div tabIndex={0} className="overflow-x-auto rounded-lg border border-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus">
        <table className="w-full min-w-[640px] text-sm">
          <caption className="sr-only">Seats without an active user, by practice group</caption>
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-muted">
            <tr>
              <th scope="col" className="px-3 py-2 font-medium">Practice group</th>
              <th scope="col" className="px-3 py-2 font-medium">Seats</th>
              <th scope="col" className="px-3 py-2 font-medium">Idle, latest week</th>
              <th scope="col" className="px-3 py-2 font-medium">Idle, week 1 of {use.account.weeks}</th>
              <th scope="col" className="px-3 py-2 font-medium">Never used vs lapsed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {use.groups.map((g) => (
              <Row key={g.label} use={g} />
            ))}
            <Row use={use.account} total />
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-gray-600">
        {SEAT_SPLIT_NOTE}
        {inconsistent && " Some weekly counts exceed the seats held, so the affected figures are Unknown."}
      </p>
    </section>
  );
}
