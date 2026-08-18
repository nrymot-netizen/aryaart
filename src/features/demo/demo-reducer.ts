import { getService } from "@/data/mock-data";
import { calculateCommissionEstimate, canUseRevision, getNextOrderStatus, milestoneBlueprint } from "@/lib/domain/orders";
import { evaluateContactSharing } from "@/lib/domain/safety";
import { joinWaitlist, leaveWaitlist, promoteWaitlistEntry } from "@/lib/domain/waitlist";
import type { Artwork, Availability, CommissionOrder, CommissionService, DemoFile, Milestone, Notification, OrderAction, PersonaRole, Post } from "@/types";
import { createDemoState, type DemoPersistedState } from "./demo-state";

export interface ReduceContext {
  now: string;
  id: (prefix: string) => string;
  actorId: string;
  role: PersonaRole;
  accountType: "adult" | "protected-teen";
  artistId?: string;
}

export type DemoCommand =
  | { type: "set-persona"; personaId: string }
  | { type: "reset" }
  | { type: "toggle-save-artwork"; id: string }
  | { type: "toggle-save-artist"; id: string }
  | { type: "join-waitlist"; artistId: string; serviceId: string }
  | { type: "leave-waitlist"; artistId: string; serviceId: string }
  | { type: "promote-waitlist"; artistId: string; serviceId: string }
  | { type: "save-draft"; draft: DemoPersistedState["drafts"][number] }
  | { type: "submit-request"; order: Omit<CommissionOrder, "id" | "createdAt" | "updatedAt" | "status"> }
  | { type: "respond"; orderId: string; action: Extract<OrderAction, "accept-request" | "counter-request" | "decline-request">; counter?: CommissionOrder["counter"]; decline?: CommissionOrder["decline"] }
  | { type: "buyer-respond"; orderId: string; action: Extract<OrderAction, "accept-counter" | "reject-counter" | "complete-checkout" | "approve-sketch" | "request-revision" | "accept-delivery">; feedback?: string }
  | { type: "artist-deliver"; orderId: string; action: Extract<OrderAction, "submit-sketch" | "submit-final">; file: DemoFile }
  | { type: "send-message"; orderId: string; body: string; protectedAccount: boolean }
  | { type: "submit-review"; orderId: string; rating: number; body: string; serviceTitle: string }
  | { type: "create-artwork"; artwork: Artwork; post?: Post }
  | { type: "create-service"; service: CommissionService }
  | { type: "update-availability"; artistId: string; availability: Availability; slots?: number }
  | { type: "mark-read"; id?: string }
  | { type: "parent-approve"; approvalId: string }
  | { type: "load-scenario"; scenario: "luna-incoming" | "maya-open-slot" };

export interface ReduceResult {
  state: DemoPersistedState;
  toast?: string;
  error?: string;
  href?: string;
}

function track(state: DemoPersistedState, ctx: ReduceContext, name: string, payload?: Record<string, string | number | boolean>): DemoPersistedState {
  return {
    ...state,
    events: [...state.events, { id: ctx.id("evt"), name, createdAt: ctx.now, payload }],
  };
}

function notify(state: DemoPersistedState, ctx: ReduceContext, items: Omit<Notification, "id" | "createdAt" | "read">[]): DemoPersistedState {
  const notifications = items.map((item) => ({ ...item, id: ctx.id("n"), createdAt: ctx.now, read: false }));
  return { ...state, notifications: [...notifications, ...state.notifications] };
}

function timeline(state: DemoPersistedState, ctx: ReduceContext, orderId: string, eventType: string, detail: string): DemoPersistedState {
  return {
    ...state,
    timeline: [{ id: ctx.id("t"), orderId, actorId: ctx.actorId, eventType, detail, createdAt: ctx.now }, ...state.timeline],
  };
}

function systemMessage(state: DemoPersistedState, ctx: ReduceContext, orderId: string, body: string): DemoPersistedState {
  return {
    ...state,
    messages: [...state.messages, { id: ctx.id("msg"), orderId, senderId: "system", body, kind: "system", moderationState: "ok", createdAt: ctx.now }],
  };
}

function setMilestones(state: DemoPersistedState, orderId: string, completed: number, current: number): DemoPersistedState {
  const next = milestoneBlueprint.map((type, index) => ({
    id: `${orderId}-m${index}`,
    orderId,
    type,
    status: (index < completed ? "complete" : index === current ? "current" : "pending") as Milestone["status"],
    completedAt: index < completed ? new Date().toISOString() : undefined,
  }));
  return { ...state, milestones: [...state.milestones.filter((item) => item.orderId !== orderId), ...next] };
}

function replaceOrder(state: DemoPersistedState, order: CommissionOrder): DemoPersistedState {
  return { ...state, orders: state.orders.map((item) => (item.id === order.id ? order : item)) };
}

function transition(order: CommissionOrder, action: OrderAction, role: PersonaRole, now: string): CommissionOrder | null {
  const next = getNextOrderStatus(order.status, action, role);
  if (!next) return null;
  return { ...order, status: next, updatedAt: now };
}

export function reduceDemoState(state: DemoPersistedState, command: DemoCommand, ctx: ReduceContext): ReduceResult {
  switch (command.type) {
    case "set-persona":
      return { state: { ...state, personaId: command.personaId } };
    case "reset":
      return { state: createDemoState(), toast: "Demo state reset." };
    case "toggle-save-artwork": {
      const saved = state.savedArtworkIds.includes(command.id);
      return { state: track({ ...state, savedArtworkIds: saved ? state.savedArtworkIds.filter((id) => id !== command.id) : [...state.savedArtworkIds, command.id] }, ctx, "artwork_saved"), toast: saved ? "Removed from saved." : "Saved artwork." };
    }
    case "toggle-save-artist": {
      const saved = state.savedArtistIds.includes(command.id);
      return { state: { ...state, savedArtistIds: saved ? state.savedArtistIds.filter((id) => id !== command.id) : [...state.savedArtistIds, command.id] }, toast: saved ? "Removed from saved." : "Saved artist." };
    }
    case "join-waitlist": {
      const joined = joinWaitlist(state.waitlists, { artistId: command.artistId, serviceId: command.serviceId, buyerId: ctx.actorId });
      if (!joined.ok) return { state, error: "Could not join waitlist." };
      return { state: notify(track({ ...state, waitlists: joined.entries }, ctx, "waitlist_joined"), ctx, [{ profileId: ctx.actorId, title: "Waitlist joined", detail: `You’re #${joined.position}.`, href: `/commissions/${command.serviceId}`, type: "waitlist" }]), toast: `Joined waitlist. You’re #${joined.position}.` };
    }
    case "leave-waitlist":
      return { state: { ...state, waitlists: leaveWaitlist(state.waitlists, { artistId: command.artistId, serviceId: command.serviceId, buyerId: ctx.actorId }) }, toast: "Left the waitlist." };
    case "promote-waitlist": {
      const result = promoteWaitlistEntry(state.waitlists, command.artistId, command.serviceId, ctx.now);
      if (!result.promoted) return { state, toast: "No one is waiting." };
      return {
        state: notify({ ...state, waitlists: result.entries }, ctx, [
          { profileId: result.promoted.buyerId, title: "A slot opened", detail: "You can submit a request now. This does not create an order.", href: `/commissions/${command.serviceId}/request`, type: "slot-opened" },
          { profileId: command.artistId, title: "Waitlist promoted", detail: "The first eligible buyer was notified.", href: "/studio", type: "waitlist" },
        ]),
        toast: "Promoted the first waitlist entry.",
      };
    }
    case "save-draft":
      return { state: { ...state, drafts: [...state.drafts.filter((draft) => !(draft.serviceId === command.draft.serviceId && draft.buyerId === command.draft.buyerId)), command.draft] } };
    case "submit-request": {
      if (ctx.role !== "buyer") return { state, error: "Only a buyer can submit a request." };
      const id = ctx.id("req");
      const parentGate = ctx.accountType === "protected-teen";
      const order: CommissionOrder = {
        ...command.order,
        id,
        status: parentGate ? "draft" : "awaiting-artist",
        parentApprovalRequired: parentGate,
        parentApproved: !parentGate,
        createdAt: ctx.now,
        updatedAt: ctx.now,
      };
      let next = track({ ...state, drafts: state.drafts.filter((draft) => draft.serviceId !== order.serviceId), orders: [order, ...state.orders] }, ctx, "request_submitted");
      if (parentGate) {
        next = { ...next, parentApprovals: [{ id: ctx.id("pa"), teenPersonaId: ctx.actorId, action: "submit-request", orderId: id, status: "pending", createdAt: ctx.now }, ...next.parentApprovals] };
        return { state: notify(next, ctx, [{ profileId: "parent-preview", title: "Parent approval needed", detail: "A protected teen account submitted a commission request.", href: "/orders", type: "parent-approval" }]), toast: "Waiting on simulated parent approval.", href: `/orders/${id}` };
      }
      next = notify(next, ctx, [
        { profileId: order.artistId, title: "New commission request", detail: "A buyer sent a structured request.", href: `/orders/${id}`, type: "request-received" },
        { profileId: order.buyerId, title: "Request sent", detail: "The artist has your brief. Status: Awaiting artist.", href: `/orders/${id}`, type: "request-submitted" },
      ]);
      return { state: next, toast: "Request sent. Status: Awaiting artist.", href: `/orders/${id}` };
    }
    case "respond": {
      const current = state.orders.find((item) => item.id === command.orderId);
      if (!current) return { state, error: "Request not found." };
      if (ctx.role !== "artist" || ctx.artistId !== current.artistId) return { state, error: "Only the requested artist can respond." };
      const updated = transition(current, command.action, "artist", ctx.now);
      if (!updated) return { state, error: "That response isn’t available." };
      if (command.action === "accept-request") {
        const priced = { ...updated, price: current.estimatedPrice, termsSnapshot: { serviceTitle: getService(current.serviceId)?.title ?? "Commission", price: current.estimatedPrice, deadline: current.deadline, revisions: current.revisionLimit, intendedUse: current.intendedUse, addOnIds: current.addOnIds } };
        let next = replaceOrder(systemMessage(timeline(state, ctx, current.id, "accept-request", "Artist accepted the request"), ctx, current.id, "The artist accepted. Simulated checkout is next."), priced);
        next = setMilestones(next, current.id, 1, 1);
        return { state: notify(track(next, ctx, "artist_response_submitted"), ctx, [{ profileId: current.buyerId, title: "Request accepted", detail: "Complete simulated checkout to open the workspace.", href: `/checkout/${current.id}`, type: "accepted" }]), toast: "Accepted. Buyer can check out." };
      }
      if (command.action === "counter-request" && command.counter) {
        const priced = { ...updated, counter: command.counter, price: command.counter.price, revisionLimit: command.counter.revisions, deadline: command.counter.deadline };
        let next = replaceOrder(systemMessage(timeline(state, ctx, current.id, "counter-request", command.counter.reason), ctx, current.id, "The artist sent a counteroffer."), priced);
        return { state: notify(next, ctx, [{ profileId: current.buyerId, title: "Counteroffer received", detail: command.counter.reason, href: `/orders/${current.id}`, type: "countered" }]), toast: "Counteroffer sent." };
      }
      if (command.action === "decline-request") {
        const priced = { ...updated, decline: command.decline };
        let next = replaceOrder(systemMessage(timeline(state, ctx, current.id, "decline-request", command.decline?.reason ?? "Declined"), ctx, current.id, "The artist declined this request."), priced);
        return { state: notify(next, ctx, [{ profileId: current.buyerId, title: "Request declined", detail: command.decline?.note ?? "The artist declined this request.", href: `/orders/${current.id}`, type: "declined" }]), toast: "Request declined." };
      }
      return { state, error: "Incomplete response." };
    }
    case "buyer-respond": {
      const current = state.orders.find((item) => item.id === command.orderId);
      if (!current) return { state, error: "Order not found." };
      if (ctx.role !== "buyer" || ctx.actorId !== current.buyerId) return { state, error: "Only the buyer can do that." };
      if (command.action === "request-revision" && !canUseRevision(current.revisionLimit, current.revisionsUsed)) {
        return { state, error: "No revisions remaining. A simulated change order would be required." };
      }
      const updated = transition(current, command.action, "buyer", ctx.now);
      if (!updated) return { state, error: "That action isn’t available." };
      if (command.action === "accept-counter" && current.counter) {
        const priced = { ...updated, price: current.counter.price, revisionLimit: current.counter.revisions, deadline: current.counter.deadline, termsSnapshot: { serviceTitle: getService(current.serviceId)?.title ?? "Commission", price: current.counter.price, deadline: current.counter.deadline, revisions: current.counter.revisions, intendedUse: current.intendedUse, addOnIds: current.addOnIds } };
        let next = replaceOrder(systemMessage(timeline(state, ctx, current.id, "accept-counter", "Buyer accepted the counteroffer"), ctx, current.id, "Counteroffer accepted. Simulated checkout is next."), priced);
        next = setMilestones(next, current.id, 1, 1);
        return { state: notify(next, ctx, [{ profileId: current.artistId, title: "Counter accepted", detail: "Waiting on simulated checkout.", href: `/orders/${current.id}`, type: "accepted" }]), toast: "Terms accepted.", href: `/checkout/${current.id}` };
      }
      if (command.action === "reject-counter") {
        return { state: notify(replaceOrder(systemMessage(timeline(state, ctx, current.id, "reject-counter", "Buyer rejected the counteroffer"), ctx, current.id, "The buyer rejected the counteroffer."), updated), ctx, [{ profileId: current.artistId, title: "Counter rejected", detail: "The request was declined.", href: `/orders/${current.id}`, type: "declined" }]), toast: "Counteroffer rejected." };
      }
      if (command.action === "complete-checkout") {
        if (ctx.accountType === "protected-teen" && !current.parentApproved) {
          const approval = { id: ctx.id("pa"), teenPersonaId: ctx.actorId, action: "checkout" as const, orderId: current.id, status: "pending" as const, createdAt: ctx.now };
          return { state: notify({ ...state, parentApprovals: [approval, ...state.parentApprovals] }, ctx, [{ profileId: "parent-preview", title: "Checkout needs parent approval", detail: "Simulated approval is required before demo payment.", href: `/checkout/${current.id}`, type: "parent-approval" }]), toast: "Parent approval required.", error: "Parent approval required." };
        }
        const priced = { ...updated };
        let next = replaceOrder(state, priced);
        next = setMilestones(next, current.id, 3, 2);
        next = {
          ...next,
          ledger: [{ id: ctx.id("led"), artistId: current.artistId, orderId: current.id, entryType: "pending", amount: current.price, createdAt: ctx.now }, ...next.ledger],
        };
        next = systemMessage(timeline(next, ctx, current.id, "complete-checkout", "Simulated payment recorded"), ctx, current.id, "Simulated payment confirmed. The workspace is open.");
        return { state: notify(track(next, ctx, "checkout_completed"), ctx, [{ profileId: current.artistId, title: "Payment confirmed", detail: "You can start the sketch.", href: `/orders/${current.id}`, type: "payment" }]), toast: "Demo checkout complete.", href: `/orders/${current.id}` };
      }
      if (command.action === "approve-sketch") {
        let next = replaceOrder(systemMessage(timeline(state, ctx, current.id, "approve-sketch", "Sketch approved"), ctx, current.id, "Sketch approved. Coloring can begin."), updated);
        next = setMilestones(next, current.id, 6, 5);
        return { state: notify(next, ctx, [{ profileId: current.artistId, title: "Sketch approved", detail: "Continue to final delivery.", href: `/orders/${current.id}`, type: "milestone" }]), toast: "Sketch approved." };
      }
      if (command.action === "request-revision") {
        const priced = { ...updated, revisionsUsed: current.revisionsUsed + 1 };
        let next = replaceOrder(systemMessage(timeline(state, ctx, current.id, "request-revision", command.feedback ?? "Revision requested"), ctx, current.id, `Revision requested${command.feedback ? `: ${command.feedback}` : ""}.`), priced);
        next = setMilestones(next, current.id, 3, 2);
        return { state: notify(next, ctx, [{ profileId: current.artistId, title: "Revision requested", detail: command.feedback ?? "The buyer asked for a revision.", href: `/orders/${current.id}`, type: "revision" }]), toast: "Revision requested." };
      }
      if (command.action === "accept-delivery") {
        let next = replaceOrder(systemMessage(timeline(state, ctx, current.id, "accept-delivery", "Final delivery accepted"), ctx, current.id, "Delivery accepted. This commission is complete."), updated);
        next = setMilestones(next, current.id, 9, 9);
        next = {
          ...next,
          ledger: next.ledger.map((entry) => (entry.orderId === current.id && entry.entryType === "pending" ? { ...entry, entryType: "available" as const } : entry)),
        };
        return { state: notify(track(next, ctx, "delivery_accepted"), ctx, [{ profileId: current.artistId, title: "Delivery accepted", detail: "Simulated earnings are now available.", href: "/studio", type: "completed" }, { profileId: current.buyerId, title: "Leave a review", detail: "Tell others how the commission went.", href: `/orders/${current.id}`, type: "review" }]), toast: "Artwork accepted. Order complete." };
      }
      return { state, error: "Incomplete buyer action." };
    }
    case "artist-deliver": {
      const current = state.orders.find((item) => item.id === command.orderId);
      if (!current) return { state, error: "Order not found." };
      if (ctx.role !== "artist" || ctx.artistId !== current.artistId) return { state, error: "Only the artist can deliver files." };
      const updated = transition(current, command.action, "artist", ctx.now);
      if (!updated) return { state, error: "That delivery isn’t available." };
      const file = { ...command.file, orderId: current.id, createdAt: ctx.now };
      let next = { ...replaceOrder(state, updated), files: [...state.files, file] };
      if (command.action === "submit-sketch") {
        next = setMilestones(systemMessage(timeline(next, ctx, current.id, "submit-sketch", "Sketch submitted"), ctx, current.id, "A sketch was submitted for review."), current.id, 4, 4);
        return { state: notify(next, ctx, [{ profileId: current.buyerId, title: "Sketch submitted", detail: "Review the sketch and approve or request a revision.", href: `/orders/${current.id}`, type: "sketch-submitted" }]), toast: "Sketch sent." };
      }
      next = setMilestones(systemMessage(timeline(next, ctx, current.id, "submit-final", "Final submitted"), ctx, current.id, "Final artwork was delivered."), current.id, 8, 7);
      return { state: notify(next, ctx, [{ profileId: current.buyerId, title: "Final delivered", detail: "Accept the delivery to complete the order.", href: `/orders/${current.id}`, type: "final-delivered" }]), toast: "Final delivered." };
    }
    case "send-message": {
      const current = state.orders.find((item) => item.id === command.orderId);
      if (!current) return { state, error: "Order not found." };
      if (ctx.actorId !== current.buyerId && ctx.artistId !== current.artistId) return { state, error: "Messages stay inside this order." };
      const safety = evaluateContactSharing(command.body, command.protectedAccount);
      if (!safety.allowed) {
        const blocked = { id: ctx.id("msg"), orderId: command.orderId, senderId: ctx.actorId, body: command.body, kind: "user" as const, moderationState: "blocked" as const, createdAt: ctx.now };
        return { state: track({ ...state, messages: [...state.messages, blocked] }, ctx, "safety_message_blocked"), error: safety.message };
      }
      return {
        state: notify({
          ...state,
          messages: [...state.messages, { id: ctx.id("msg"), orderId: command.orderId, senderId: ctx.actorId, body: command.body, kind: "user", moderationState: "ok", createdAt: ctx.now }],
        }, ctx, [{ profileId: ctx.actorId === current.buyerId ? current.artistId : current.buyerId, title: "New workspace message", detail: command.body.slice(0, 80), href: `/orders/${command.orderId}`, type: "message" }]),
      };
    }
    case "submit-review": {
      const current = state.orders.find((item) => item.id === command.orderId);
      if (!current || current.status !== "completed") return { state, error: "Only completed orders can be reviewed." };
      if (current.review) return { state, error: "This order already has a review." };
      if (ctx.actorId !== current.buyerId) return { state, error: "Only the buyer can review." };
      const review = { id: ctx.id("rev"), artistId: current.artistId, author: "Alex", rating: command.rating, body: command.body, serviceTitle: command.serviceTitle, createdAt: ctx.now };
      return {
        state: notify(track(replaceOrder({ ...state, createdReviews: [...state.createdReviews, review] }, { ...current, review: { rating: command.rating, body: command.body, createdAt: ctx.now }, updatedAt: ctx.now }), ctx, "review_submitted"), ctx, [{ profileId: current.artistId, title: "New review", detail: `${command.rating} stars on ${command.serviceTitle}.`, href: `/artists/${current.artistId}?tab=reviews`, type: "review" }]),
        toast: "Review published.",
      };
    }
    case "create-artwork":
      return { state: { ...state, createdArtworks: [command.artwork, ...state.createdArtworks], createdPosts: command.post ? [command.post, ...state.createdPosts] : state.createdPosts }, toast: "Artwork published.", href: `/art/${command.artwork.id}` };
    case "create-service":
      return { state: { ...state, createdServices: [command.service, ...state.createdServices] }, toast: "Service published.", href: `/commissions/${command.service.id}` };
    case "update-availability":
      return { state: { ...state, artistAvailability: { ...state.artistAvailability, [command.artistId]: { availability: command.availability, slots: command.slots } } }, toast: "Availability updated." };
    case "mark-read":
      return {
        state: {
          ...state,
          notifications: state.notifications.map((item) => {
            const match = command.id ? item.id === command.id : item.profileId === ctx.actorId || item.profileId === ctx.artistId;
            return match ? { ...item, read: true } : item;
          }),
        },
      };
    case "parent-approve": {
      const approval = state.parentApprovals.find((item) => item.id === command.approvalId);
      if (!approval) return { state, error: "Approval not found." };
      let next: DemoPersistedState = { ...state, parentApprovals: state.parentApprovals.map((item) => (item.id === command.approvalId ? { ...item, status: "approved" as const } : item)) };
      if (approval.orderId) {
        const order = next.orders.find((item) => item.id === approval.orderId);
        if (order?.status === "draft") {
          const released = { ...order, status: "awaiting-artist" as const, parentApproved: true, updatedAt: ctx.now };
          next = replaceOrder(next, released);
          next = notify(next, ctx, [{ profileId: released.artistId, title: "New commission request", detail: "Parent approval completed. The request is awaiting the artist.", href: `/orders/${released.id}`, type: "request-received" }]);
        } else if (order) {
          next = replaceOrder(next, { ...order, parentApproved: true });
        }
      }
      return { state: next, toast: "Simulated parent approval completed." };
    }
    case "load-scenario": {
      if (command.scenario === "luna-incoming") {
        const service = getService("anime-portrait");
        if (!service) return { state, error: "Missing Luna service." };
        const existing = state.orders.find((item) => item.serviceId === "anime-portrait" && item.status === "awaiting-artist");
        if (existing) return { state, href: `/orders/${existing.id}`, toast: "Luna already has an incoming request." };
        const estimate = calculateCommissionEstimate(service.startingPrice, { characterCount: 1, extraCharacterPrice: service.extraCharacterPrice ?? 0, selectedAddOns: [], intendedUse: "personal" });
        const order: CommissionOrder = {
          id: ctx.id("req"),
          buyerId: "buyer-alex",
          artistId: "luna",
          serviceId: "anime-portrait",
          status: "awaiting-artist",
          brief: "A full-color fantasy portrait of my original character in moonlight, looking toward the garden.",
          characterCount: 1,
          intendedUse: "personal",
          addOnIds: [],
          deadline: "2026-09-10",
          budget: 75,
          references: [],
          estimatedPrice: estimate,
          price: estimate,
          revisionLimit: service.revisions,
          revisionsUsed: 0,
          parentApprovalRequired: false,
          parentApproved: true,
          createdAt: ctx.now,
          updatedAt: ctx.now,
        };
        return { state: { ...state, orders: [order, ...state.orders] }, toast: "Loaded Luna incoming request.", href: `/orders/${order.id}` };
      }
      const promoted = reduceDemoState({ ...state, artistAvailability: { ...state.artistAvailability, maya: { availability: "limited", slots: 1 } } }, { type: "promote-waitlist", artistId: "maya", serviceId: "pet-sticker" }, ctx);
      return { ...promoted, toast: "Maya opened a slot and promoted the waitlist." };
    }
    default:
      return { state };
  }
}

export function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
}
