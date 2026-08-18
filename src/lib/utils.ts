import type { Availability } from "@/types";

export const availabilityLabel: Record<Availability, string> = {
  open: "Open",
  limited: "Limited",
  waitlist: "Waitlist",
  closed: "Closed",
};

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en", { notation: value >= 1000 ? "compact" : "standard" }).format(value);
}

export function formatDate(isoDate: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${isoDate}T00:00:00Z`));
}

export function subjectLabel(subject: string) {
  return subject.replace(/^\w/, (letter) => letter.toUpperCase());
}
