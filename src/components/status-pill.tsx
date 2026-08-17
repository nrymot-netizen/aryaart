import type { Availability } from "@/types";
import { availabilityLabel } from "@/lib/utils";

const styles: Record<Availability, string> = {
  open: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  limited: "bg-amber-50 text-amber-700 ring-amber-200",
  waitlist: "bg-violet-50 text-violet-700 ring-violet-200",
  closed: "bg-stone-100 text-stone-500 ring-stone-200",
};

export function StatusPill({ status, slots }: { status: Availability; slots?: number }) {
  const text = status === "limited" && slots ? `${slots} slots open` : availabilityLabel[status];
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${styles[status]}`}><span className="size-1.5 rounded-full bg-current" />{text}</span>;
}
