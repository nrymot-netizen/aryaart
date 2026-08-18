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
  const commercial = selection.intendedUse === "commercial" ? Math.max(0, selection.commercialSurcharge ?? 0) : 0;
  return Math.max(0, basePrice) + extraCharacters * Math.max(0, selection.extraCharacterPrice) + addOnTotal + commercial;
}

export function remainingRevisions(limit: number, used: number): number {
  return Math.max(0, Math.floor(limit) - Math.max(0, Math.floor(used)));
}

export function canUseRevision(limit: number, used: number): boolean {
  return remainingRevisions(limit, used) > 0;
}

export const orderStatusLabel: Record<OrderStatus, string> = {
  draft: "Draft",
  "awaiting-artist": "Awaiting artist",
  counteroffer: "Counteroffer",
  "payment-required": "Payment required",
  "in-progress": "In progress",
  "sketch-review": "Sketch review",
  "final-review": "Final review",
  completed: "Completed",
  declined: "Declined",
  cancelled: "Cancelled",
};

export function getWorkspaceNextAction(status: OrderStatus, role: PersonaRole): { title: string; detail: string } | null {
  const matrix: Partial<Record<OrderStatus, Partial<Record<PersonaRole, { title: string; detail: string }>>>> = {
    "awaiting-artist": {
      artist: { title: "Respond to this request", detail: "Accept, counter, or decline. Only one response can be active." },
      buyer: { title: "Waiting on the artist", detail: "You’ll be notified when they accept, counter, or decline." },
    },
    counteroffer: {
      buyer: { title: "Review the counteroffer", detail: "Accept the new terms or decline them." },
      artist: { title: "Waiting on the buyer", detail: "They can accept or reject your counter." },
    },
    "payment-required": {
      buyer: { title: "Complete simulated checkout", detail: "No real card is charged. This unlocks the workspace." },
      artist: { title: "Waiting for simulated payment", detail: "The workspace opens after checkout." },
    },
    "in-progress": {
      artist: { title: "Submit a sketch or keep painting", detail: "Upload a sketch for approval, or a final if the sketch already passed." },
      buyer: { title: "Work is in progress", detail: "You’ll review the sketch when it’s ready." },
    },
    "sketch-review": {
      buyer: { title: "Review the sketch", detail: "Approve it, or request a revision with feedback." },
      artist: { title: "Waiting on sketch approval", detail: "The buyer can approve or request a revision." },
    },
    "final-review": {
      buyer: { title: "Review the final delivery", detail: "Accept the artwork to complete the order." },
      artist: { title: "Waiting on final acceptance", detail: "Earnings move from pending to available after acceptance." },
    },
    completed: {
      buyer: { title: "Leave a review", detail: "Only completed orders can be reviewed, once." },
      artist: { title: "This commission is complete", detail: "Simulated earnings are available." },
    },
  };
  return matrix[status]?.[role] ?? null;
}

export const milestoneBlueprint = [
  "Request accepted",
  "Payment confirmed",
  "Sketch started",
  "Sketch submitted",
  "Sketch approved",
  "Coloring / rendering",
  "Final preview",
  "Final delivery",
  "Completed",
] as const;
