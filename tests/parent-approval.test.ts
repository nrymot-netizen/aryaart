import { describe, expect, it } from "vitest";
import { createDemoState } from "@/features/demo/demo-state";
import { reduceDemoState, type ReduceContext } from "@/features/demo/demo-reducer";
import { isProductEvent, uniqueEventKey } from "@/lib/domain/events";

const riley: ReduceContext = { now: "2026-08-26T15:00:00Z", id: (prefix) => `${prefix}-1`, actorId: "buyer-riley", role: "buyer", accountType: "protected-teen" };
const parent: ReduceContext = { ...riley, actorId: "parent-preview", role: "parent-preview", accountType: "adult" };
const luna: ReduceContext = { now: "2026-08-26T15:00:00Z", id: (prefix) => `${prefix}-l`, actorId: "luna", role: "artist", artistId: "luna", accountType: "adult" };

const teenRequest = {
  buyerId: "buyer-riley",
  artistId: "luna",
  serviceId: "anime-portrait",
  brief: "A lantern-lit portrait of my original character.",
  characterCount: 1,
  intendedUse: "personal" as const,
  addOnIds: [] as string[],
  deadline: "2026-09-20",
  budget: 60,
  references: [],
  estimatedPrice: 45,
  price: 45,
  revisionLimit: 2,
  revisionsUsed: 0,
  parentApprovalRequired: true,
  parentApproved: false,
};

describe("parent approval for a teen buyer", () => {
  it("holds Riley’s request in draft until parent preview approves", () => {
    const submitted = reduceDemoState(createDemoState("buyer-riley"), { type: "submit-request", order: teenRequest }, riley);
    expect(submitted.state.orders[0]?.status).toBe("draft");
    expect(submitted.state.parentApprovals[0]?.status).toBe("pending");
    expect(submitted.state.notifications.some((item) => item.profileId === "parent-preview")).toBe(true);

    const blocked = reduceDemoState(submitted.state, { type: "parent-approve", approvalId: submitted.state.parentApprovals[0]!.id }, riley);
    expect(blocked.error).toMatch(/parent preview/i);

    const approved = reduceDemoState(submitted.state, { type: "parent-approve", approvalId: submitted.state.parentApprovals[0]!.id }, parent);
    expect(approved.state.orders[0]?.status).toBe("awaiting-artist");
    expect(approved.state.orders[0]?.parentApproved).toBe(true);
  });

  it("loads a pending teen request and switches into parent preview", () => {
    const result = reduceDemoState(createDemoState("buyer-alex"), { type: "load-scenario", scenario: "parent-approval" }, riley);
    expect(result.state.personaId).toBe("parent-preview");
    expect(result.state.orders[0]?.buyerId).toBe("buyer-riley");
    expect(result.state.orders[0]?.status).toBe("draft");
    expect(result.href).toMatch(/^\/orders\//);
  });

  it("lets Riley check out after the request was parent-approved", () => {
    let { state } = reduceDemoState(createDemoState("buyer-riley"), { type: "submit-request", order: teenRequest }, riley);
    const approvalId = state.parentApprovals[0]!.id;
    state = reduceDemoState(state, { type: "parent-approve", approvalId }, parent).state;
    const id = state.orders[0]!.id;
    state = reduceDemoState(state, { type: "respond", orderId: id, action: "accept-request" }, luna).state;
    expect(state.orders[0]?.status).toBe("payment-required");
    const checkout = reduceDemoState(state, { type: "buyer-respond", orderId: id, action: "complete-checkout" }, riley);
    expect(checkout.error).toBeUndefined();
    expect(checkout.state.orders[0]?.status).toBe("in-progress");
  });
});

describe("demo event inspector", () => {
  it("records product view events once per id", () => {
    expect(isProductEvent("artwork_viewed")).toBe(true);
    expect(uniqueEventKey("artwork_viewed")).toBe("artworkId");
    const first = reduceDemoState(createDemoState(), { type: "track-event", name: "artwork_viewed", payload: { artworkId: "moon-garden" } }, riley);
    const second = reduceDemoState(first.state, { type: "track-event", name: "artwork_viewed", payload: { artworkId: "moon-garden" } }, riley);
    expect(first.state.events.filter((item) => item.name === "artwork_viewed")).toHaveLength(1);
    expect(second.state.events.filter((item) => item.name === "artwork_viewed")).toHaveLength(1);
    const unknown = reduceDemoState(first.state, { type: "track-event", name: "hunger_logged" }, riley);
    expect(unknown.state.events.some((item) => item.name === "hunger_logged")).toBe(false);
  });
});
