"use client"; // Error boundaries must be Client Components.

// No error reporting: the dashboard makes no network or telemetry calls. The digest lets a
// developer match the message to the server log.
export default function RouteError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">This page could not be shown</h1>
      <p className="mt-1 text-sm text-gray-600">
        Nothing was changed: the dashboard only reads synthetic data. A data file that fails
        validation is the usual cause; the server log names the file.
        {error.digest && <> Reference: <code className="font-mono">{error.digest}</code>.</>}
      </p>
      <button
        type="button"
        onClick={() => unstable_retry()}
        className="mt-4 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-focus"
      >
        Try again
      </button>
    </main>
  );
}
