import type { Availability } from "@/types";

export interface AvailabilityCta {
  kind: "request" | "waitlist" | "closed";
  label: string;
  disabled: boolean;
  helper: string;
}

export function getAvailabilityCta(availability: Availability, slots?: number): AvailabilityCta {
  if (availability === "closed") {
    return { kind: "closed", label: "Commissions closed", disabled: true, helper: "This artist is not accepting new requests right now." };
  }
  if (availability === "waitlist") {
    return { kind: "waitlist", label: "Join waitlist", disabled: false, helper: "A slot opening will let you submit a request. It does not create an order." };
  }
  if (availability === "limited") {
    return {
      kind: "request",
      label: "Request commission",
      disabled: false,
      helper: slots ? `${slots} ${slots === 1 ? "slot" : "slots"} remaining.` : "A small number of slots are open.",
    };
  }
  return { kind: "request", label: "Request commission", disabled: false, helper: "This artist is currently accepting requests." };
}

export function canRequestCommission(availability: Availability): boolean {
  return availability === "open" || availability === "limited";
}
