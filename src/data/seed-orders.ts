import type { CommissionOrder, LedgerEntry, Milestone, Notification, OrderMessage, TimelineEvent } from "@/types";
import { milestoneBlueprint } from "@/lib/domain/orders";

function milestones(orderId: string, completedCount: number, currentIndex: number): Milestone[] {
  return milestoneBlueprint.map((type, index) => ({
    id: `${orderId}-m${index}`,
    orderId,
    type,
    status: index < completedCount ? "complete" : index === currentIndex ? "current" : "pending",
    completedAt: index < completedCount ? "2026-08-10T12:00:00Z" : undefined,
  }));
}

export const seedOrders: CommissionOrder[] = [
  {
    id: "order-quiet-light",
    buyerId: "buyer-alex",
    artistId: "rose",
    serviceId: "realism-portrait",
    status: "completed",
    brief: "A quiet window-light portrait, linen and a still expression.",
    characterCount: 1,
    intendedUse: "personal",
    addOnIds: [],
    deadline: "2026-04-20",
    budget: 140,
    references: [],
    estimatedPrice: 120,
    price: 120,
    revisionLimit: 2,
    revisionsUsed: 0,
    termsSnapshot: { serviceTitle: "Luminous Portrait", price: 120, deadline: "2026-04-20", revisions: 2, intendedUse: "personal", addOnIds: [] },
    parentApprovalRequired: false,
    parentApproved: true,
    review: { rating: 5, body: "It felt like a real sitting. Light, fabric, and expression all landed.", createdAt: "2026-04-12" },
    createdAt: "2026-03-01T12:00:00Z",
    updatedAt: "2026-04-12T12:00:00Z",
  },
  {
    id: "order-first-flight",
    buyerId: "buyer-alex",
    artistId: "leo",
    serviceId: "comic-cover",
    status: "sketch-review",
    brief: "A comic cover of my original hero leaping the last rooftop at dusk.",
    characterCount: 1,
    intendedUse: "personal",
    addOnIds: ["leo-title"],
    deadline: "2026-08-28",
    budget: 55,
    notes: "Keep the cape readable in silhouette.",
    references: [{ id: "ref-flight", name: "pose-ref.png", type: "image/png", size: 240000, kind: "reference", preview: "/art/first-flight.svg", createdAt: "2026-08-08T12:00:00Z" }],
    estimatedPrice: 52,
    price: 52,
    revisionLimit: 1,
    revisionsUsed: 0,
    termsSnapshot: { serviceTitle: "Comic Cover Portrait", price: 52, deadline: "2026-08-28", revisions: 1, intendedUse: "personal", addOnIds: ["leo-title"] },
    parentApprovalRequired: false,
    parentApproved: true,
    createdAt: "2026-08-08T12:00:00Z",
    updatedAt: "2026-08-16T15:00:00Z",
  },
];

export const seedMilestones: Milestone[] = [
  ...milestones("order-quiet-light", 9, 9),
  ...milestones("order-first-flight", 4, 4),
];

export const seedMessages: OrderMessage[] = [
  { id: "msg-1", orderId: "order-first-flight", senderId: "system", body: "Order moved to sketch review.", kind: "system", moderationState: "ok", createdAt: "2026-08-16T15:00:00Z" },
  { id: "msg-2", orderId: "order-first-flight", senderId: "leo", body: "Sketch is up — I pushed the leap a little higher so the city reads under the cape.", kind: "user", moderationState: "ok", createdAt: "2026-08-16T15:05:00Z" },
];

export const seedTimeline: TimelineEvent[] = [
  { id: "t1", orderId: "order-first-flight", actorId: "leo", eventType: "submit-sketch", detail: "Sketch submitted", createdAt: "2026-08-16T15:00:00Z" },
  { id: "t2", orderId: "order-quiet-light", actorId: "buyer-alex", eventType: "accept-delivery", detail: "Delivery accepted", createdAt: "2026-04-11T12:00:00Z" },
];

export const seedLedger: LedgerEntry[] = [
  { id: "led-rose", artistId: "rose", orderId: "order-quiet-light", entryType: "available", amount: 120, createdAt: "2026-04-12T12:00:00Z" },
  { id: "led-leo", artistId: "leo", orderId: "order-first-flight", entryType: "pending", amount: 52, createdAt: "2026-08-12T12:00:00Z" },
];

export const seedDemoNotifications: Notification[] = [
  { id: "n1", profileId: "buyer-alex", title: "Sketch ready", detail: "ArtByLeo submitted a sketch for First Flight.", href: "/orders/order-first-flight", type: "sketch-submitted", read: false, createdAt: "2026-08-16T15:06:00Z" },
  { id: "n2", profileId: "leo", title: "Waiting on sketch approval", detail: "Alex is reviewing your comic cover sketch.", href: "/orders/order-first-flight", type: "sketch-submitted", read: false, createdAt: "2026-08-16T15:06:00Z" },
  { id: "n3", profileId: "buyer-alex", title: "A new artist match", detail: "We found 3 fantasy artists you may love.", href: "/search?style=Fantasy", type: "match", read: false, createdAt: "2026-08-16T12:00:00Z" },
];
