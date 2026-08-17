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
