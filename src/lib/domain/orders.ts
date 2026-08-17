import type { OrderAction, OrderStatus, PersonaRole, PriceSelection } from "@/types";

type Transition = { action: OrderAction; roles: PersonaRole[]; next: OrderStatus };

const transitions: Record<OrderStatus, Transition[]> = {
  draft: [{ action: "submit-request", roles: ["buyer"], next: "awaiting-artist" }],
  "awaiting-artist": [
    { action: "accept-request", roles: ["artist"], next: "payment-required" },
    { action: "counter-request", roles: ["artist"], next: "counteroffer" },
    { action: "decline-request", roles: ["artist"], next: "declined" },
    { action: "cancel", roles: ["buyer"], next: "cancelled" },
  ],
  counteroffer: [
    { action: "accept-counter", roles: ["buyer"], next: "payment-required" },
    { action: "reject-counter", roles: ["buyer"], next: "declined" },
    { action: "cancel", roles: ["buyer", "artist"], next: "cancelled" },
  ],
  "payment-required": [
    { action: "complete-checkout", roles: ["buyer"], next: "in-progress" },
    { action: "cancel", roles: ["buyer", "artist"], next: "cancelled" },
  ],
  "in-progress": [
    { action: "submit-sketch", roles: ["artist"], next: "sketch-review" },
    { action: "submit-final", roles: ["artist"], next: "final-review" },
    { action: "cancel", roles: ["buyer", "artist"], next: "cancelled" },
  ],
  "sketch-review": [
    { action: "approve-sketch", roles: ["buyer"], next: "in-progress" },
    { action: "request-revision", roles: ["buyer"], next: "in-progress" },
  ],
  "final-review": [{ action: "accept-delivery", roles: ["buyer"], next: "completed" }],
  completed: [], declined: [], cancelled: [],
};

export function getNextOrderStatus(status: OrderStatus, action: OrderAction, role: PersonaRole): OrderStatus | null {
  return transitions[status].find((transition) => transition.action === action && transition.roles.includes(role))?.next ?? null;
}

export function calculateCommissionEstimate(basePrice: number, selection: PriceSelection): number {
  const extraCharacters = Math.max(0, Math.floor(selection.characterCount) - 1);
  const addOnTotal = selection.selectedAddOns.reduce((total, addOn) => total + addOn.price, 0);
  return Math.max(0, basePrice) + extraCharacters * Math.max(0, selection.extraCharacterPrice) + addOnTotal;
}

export function remainingRevisions(limit: number, used: number): number {
  return Math.max(0, Math.floor(limit) - Math.max(0, Math.floor(used)));
}
