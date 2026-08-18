export function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return <div className="pointer-events-none fixed inset-x-4 bottom-24 z-[60] flex justify-center md:bottom-8" role="status" aria-live="polite"><p className="rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-white shadow-card">{message}</p></div>;
}
