import type { AccountType, AnalyticsEvent, Artwork, Availability, CommissionOrder, CommissionService, DemoFile, LedgerEntry, Milestone, Notification, OrderBlock, OrderMessage, OrderReport, ParentApproval, PersonaRole, Post, RequestDraft, Review, TimelineEvent, WaitlistEntry } from "@/types";
import { seedDemoNotifications, seedLedger, seedMessages, seedMilestones, seedOrders, seedTimeline } from "@/data/seed-orders";
import { seedWaitlists } from "@/data/mock-data";
import { defaultDemoPersona } from "@/features/demo/demo-personas";
import { seedLanternArtwork, seedLanternLog, seedLanternPost } from "@/data/seed-lantern";
import type { ProcessLog } from "@/lib/domain/process-log";

export const DEMO_STATE_VERSION = 2;
export const demoStateKey = "arya-demo-state-v2";
export const legacyPersonaKey = "arya-demo-persona-v1";

export interface DemoPersistedState {
  version: number;
  personaId: string;
  savedArtworkIds: string[];
  savedArtistIds: string[];
  waitlists: WaitlistEntry[];
  drafts: RequestDraft[];
  orders: CommissionOrder[];
  messages: OrderMessage[];
  files: DemoFile[];
  milestones: Milestone[];
  timeline: TimelineEvent[];
  notifications: Notification[];
  ledger: LedgerEntry[];
  parentApprovals: ParentApproval[];
  createdArtworks: Artwork[];
  createdPosts: Post[];
  createdServices: CommissionService[];
  createdReviews: Review[];
  artistAvailability: Record<string, { availability: Availability; slots?: number }>;
  events: AnalyticsEvent[];
  orderReports: OrderReport[];
  orderBlocks: OrderBlock[];
  hiddenReviewIds: string[];
  reportedReviewIds: string[];
  processLogs: ProcessLog[];
}

export function createDemoState(personaId = defaultDemoPersona.id): DemoPersistedState {
  return {
    version: DEMO_STATE_VERSION,
    personaId,
    savedArtworkIds: [],
    savedArtistIds: [],
    waitlists: seedWaitlists.map((entry) => ({ ...entry })),
    drafts: [],
    orders: seedOrders.map((order) => ({ ...order, references: order.references.map((file) => ({ ...file })) })),
    messages: seedMessages.map((message) => ({ ...message })),
    files: [{ id: "file-sketch-flight", orderId: "order-first-flight", name: "first-flight-sketch.svg", type: "image/svg+xml", size: 18000, kind: "sketch", preview: "/art/first-flight.svg", createdAt: "2026-08-16T15:00:00Z" }],
    milestones: seedMilestones.map((item) => ({ ...item })),
    timeline: seedTimeline.map((item) => ({ ...item })),
    notifications: seedDemoNotifications.map((item) => ({ ...item })),
    ledger: seedLedger.map((item) => ({ ...item })),
    parentApprovals: [],
    createdArtworks: [{ ...seedLanternArtwork }],
    createdPosts: [{ ...seedLanternPost }],
    createdServices: [],
    createdReviews: [],
    artistAvailability: {},
    events: [],
    orderReports: [],
    orderBlocks: [],
    hiddenReviewIds: [],
    reportedReviewIds: [],
    processLogs: [{ ...seedLanternLog, ops: seedLanternLog.ops.map((op) => ({ ...op })) }],
  };
}

export function toggleSavedId(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id];
}

function withSeedItem<T extends { id: string }>(items: T[], seed: T): T[] {
  return items.some((item) => item.id === seed.id) ? items : [seed, ...items];
}

export function parseDemoState(raw: string | null, legacyPersona?: string | null): DemoPersistedState {
  const fallback = createDemoState(legacyPersona && legacyPersona.length ? legacyPersona : defaultDemoPersona.id);
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw) as Partial<DemoPersistedState>;
    if (parsed.version !== DEMO_STATE_VERSION || typeof parsed.personaId !== "string") return fallback;
    return {
      ...fallback,
      ...parsed,
      version: DEMO_STATE_VERSION,
      personaId: parsed.personaId,
      savedArtworkIds: Array.isArray(parsed.savedArtworkIds) ? parsed.savedArtworkIds : [],
      savedArtistIds: Array.isArray(parsed.savedArtistIds) ? parsed.savedArtistIds : [],
      waitlists: Array.isArray(parsed.waitlists) ? parsed.waitlists : fallback.waitlists,
      drafts: Array.isArray(parsed.drafts) ? parsed.drafts : [],
      orders: Array.isArray(parsed.orders) ? parsed.orders : fallback.orders,
      messages: Array.isArray(parsed.messages) ? parsed.messages : fallback.messages,
      files: Array.isArray(parsed.files) ? parsed.files : fallback.files,
      milestones: Array.isArray(parsed.milestones) ? parsed.milestones : fallback.milestones,
      timeline: Array.isArray(parsed.timeline) ? parsed.timeline : fallback.timeline,
      notifications: Array.isArray(parsed.notifications) ? parsed.notifications : fallback.notifications,
      ledger: Array.isArray(parsed.ledger) ? parsed.ledger : fallback.ledger,
      parentApprovals: Array.isArray(parsed.parentApprovals) ? parsed.parentApprovals : [],
      createdArtworks: withSeedItem(Array.isArray(parsed.createdArtworks) ? parsed.createdArtworks : fallback.createdArtworks, { ...seedLanternArtwork }),
      createdPosts: withSeedItem(Array.isArray(parsed.createdPosts) ? parsed.createdPosts : fallback.createdPosts, { ...seedLanternPost }),
      createdServices: Array.isArray(parsed.createdServices) ? parsed.createdServices : [],
      createdReviews: Array.isArray(parsed.createdReviews) ? parsed.createdReviews : [],
      artistAvailability: parsed.artistAvailability ?? {},
      events: Array.isArray(parsed.events) ? parsed.events : [],
      orderReports: Array.isArray(parsed.orderReports) ? parsed.orderReports : [],
      orderBlocks: Array.isArray(parsed.orderBlocks) ? parsed.orderBlocks : [],
      hiddenReviewIds: Array.isArray(parsed.hiddenReviewIds) ? parsed.hiddenReviewIds : [],
      reportedReviewIds: Array.isArray(parsed.reportedReviewIds) ? parsed.reportedReviewIds : [],
      processLogs: withSeedItem(Array.isArray(parsed.processLogs) ? parsed.processLogs : fallback.processLogs, { ...seedLanternLog, ops: seedLanternLog.ops.map((op) => ({ ...op })) }),
    };
  } catch {
    return fallback;
  }
}

export function needsParentGate(accountType: AccountType, role: PersonaRole, action: "submit-request" | "checkout" | "payout") {
  if (role === "parent-preview") return false;
  return accountType === "protected-teen" && (action === "checkout" || action === "payout" || action === "submit-request");
}
