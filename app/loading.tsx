// Shown while a server-rendered page is prepared. Plain text, announced politely: there is
// no spinner, and no placeholder figure that could be read as a value.
export default function Loading() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <p role="status" className="text-sm text-muted">
        Loading synthetic data…
      </p>
    </main>
  );
}
