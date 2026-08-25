import { describe, expect, it } from "vitest";
import { createDemoState } from "@/features/demo/demo-state";
import { reduceDemoState, type ReduceContext } from "@/features/demo/demo-reducer";
import { processStoryReady, sanitizeProcessCaption, teenPaidWorkStaysPrivateUntilOptIn } from "@/lib/domain/process-stories";
import type { DemoFile } from "@/types";

const buyer: ReduceContext = { now: "2026-08-25T18:00:00Z", id: (prefix) => `${prefix}-1`, actorId: "buyer-alex", role: "buyer", accountType: "adult" };
const luna: ReduceContext = { ...buyer, actorId: "luna", role: "artist", artistId: "luna" };
const maya: ReduceContext = { now: "2026-08-25T18:00:00Z", id: (prefix) => `${prefix}-m`, actorId: "maya", role: "artist", artistId: "maya", accountType: "protected-teen" };

const previewFile = (id: string, orderId: string, kind: DemoFile["kind"]): DemoFile => ({
  id,
  orderId,
  name: `${kind}.png`,
  type: "image/png",
  size: 1200,
  kind,
  preview: "data:image/png;base64,aaaa",
  source: "arya-canvas",
  createdAt: buyer.now,
});

function completeMayaOrder() {
  let { state } = reduceDemoState(createDemoState(), {
    type: "submit-request",
    order: {
      buyerId: "buyer-alex",
      artistId: "maya",
      serviceId: "pet-sticker",
      brief: "A cozy peach companion with a tiny bell. Keep it private.",
      characterCount: 1,
      intendedUse: "personal",
      addOnIds: [],
      deadline: "2026-09-30",
      budget: 30,
      references: [],
      estimatedPrice: 20,
      price: 20,
      revisionLimit: 1,
      revisionsUsed: 0,
      parentApprovalRequired: false,
      parentApproved: true,
    },
  }, buyer);
  const id = state.orders[0].id;
  state = reduceDemoState(state, { type: "respond", orderId: id, action: "accept-request" }, maya).state;
  state = reduceDemoState(state, { type: "buyer-respond", orderId: id, action: "complete-checkout" }, buyer).state;
  state = reduceDemoState(state, { type: "artist-deliver", orderId: id, action: "submit-sketch", file: previewFile("maya-sk", id, "sketch") }, maya).state;
  state = reduceDemoState(state, { type: "buyer-respond", orderId: id, action: "approve-sketch" }, buyer).state;
  state = reduceDemoState(state, { type: "artist-deliver", orderId: id, action: "submit-final", file: previewFile("maya-fn", id, "final") }, maya).state;
  const accepted = reduceDemoState(state, { type: "buyer-respond", orderId: id, action: "accept-delivery" }, buyer);
  return { ...accepted, orderId: id };
}

describe("process stories", () => {
  it("stays private until both people opt in", () => {
    const orderId = "order-luna-first-paid";
    const seeded = createDemoState();
    expect(seeded.processStories).toEqual([]);
    const artistOnly = reduceDemoState(seeded, { type: "process-story-opt-in", orderId, side: "artist", optIn: true, replayOptIn: true }, luna);
    expect(artistOnly.state.processStories).toEqual([]);
    const both = reduceDemoState(artistOnly.state, { type: "process-story-opt-in", orderId, side: "buyer", optIn: true, caption: "Quiet garden light." }, buyer);
    expect(both.state.processStories[0]?.orderId).toBe(orderId);
    expect(both.state.processStories[0]?.caption).toBe("Quiet garden light.");
    expect(both.state.processStories[0]?.includeReplay).toBe(true);
    expect(both.state.createdPosts.some((post) => post.id === `post-pstory-${orderId}`)).toBe(true);
    expect(both.state.events.some((event) => event.name === "process_story_published")).toBe(true);
    expect(JSON.stringify(both.state.processStories[0])).not.toMatch(/moonlit garden portrait/i);
    expect(both.href).toBe(`/process/${orderId}`);
  });

  it("unpublishes when either person opts out", () => {
    let { state } = reduceDemoState(createDemoState(), { type: "process-story-opt-in", orderId: "order-luna-first-paid", side: "artist", optIn: true, replayOptIn: true }, luna);
    state = reduceDemoState(state, { type: "process-story-opt-in", orderId: "order-luna-first-paid", side: "buyer", optIn: true }, buyer).state;
    expect(state.processStories).toHaveLength(1);
    const out = reduceDemoState(state, { type: "process-story-opt-in", orderId: "order-luna-first-paid", side: "artist", optIn: false }, luna);
    expect(out.state.processStories).toEqual([]);
    expect(out.state.createdPosts.some((post) => post.id === "post-pstory-order-luna-first-paid")).toBe(false);
  });

  it("does not auto-post a protected-teen delivery", () => {
    const accepted = completeMayaOrder();
    expect(accepted.state.orders[0].status).toBe("completed");
    expect(accepted.state.processStories).toEqual([]);
    expect(teenPaidWorkStaysPrivateUntilOptIn("protected-teen")).toBe(true);
    const both = reduceDemoState(
      reduceDemoState(accepted.state, { type: "process-story-opt-in", orderId: accepted.orderId, side: "artist", optIn: true }, maya).state,
      { type: "process-story-opt-in", orderId: accepted.orderId, side: "buyer", optIn: true, caption: "Soft and peachy." },
      buyer,
    );
    expect(both.state.processStories[0]?.orderId).toBe(accepted.orderId);
  });

  it("blocks a public caption that shares contact", () => {
    const result = reduceDemoState(createDemoState(), {
      type: "process-story-opt-in",
      orderId: "order-luna-first-paid",
      side: "buyer",
      optIn: true,
      caption: "Email me at alex@example.com",
    }, buyer);
    expect(result.error).toMatch(/contact information is restricted/i);
    expect(result.state.processStoryConsents).toEqual([]);
    expect(result.state.processStories).toEqual([]);
  });

  it("cannot publish without sketch and final stills", () => {
    const result = reduceDemoState(
      reduceDemoState(createDemoState(), { type: "process-story-opt-in", orderId: "order-quiet-light", side: "artist", optIn: true }, { ...luna, actorId: "rose", artistId: "rose" }).state,
      { type: "process-story-opt-in", orderId: "order-quiet-light", side: "buyer", optIn: true },
      buyer,
    );
    expect(result.state.processStories).toEqual([]);
    expect(processStoryReady({
      status: "completed",
      artistOptIn: true,
      buyerOptIn: true,
    }).ok).toBe(false);
  });

  it("cannot publish an upload with no preview stills", () => {
    let { state } = reduceDemoState(createDemoState(), {
      type: "submit-request",
      order: {
        buyerId: "buyer-alex",
        artistId: "luna",
        serviceId: "anime-portrait",
        brief: "Keep this brief off the public story.",
        characterCount: 1,
        intendedUse: "personal",
        addOnIds: [],
        deadline: "2026-09-30",
        budget: 75,
        references: [],
        estimatedPrice: 45,
        price: 45,
        revisionLimit: 2,
        revisionsUsed: 0,
        parentApprovalRequired: false,
        parentApproved: true,
      },
    }, buyer);
    const id = state.orders[0].id;
    state = reduceDemoState(state, { type: "respond", orderId: id, action: "accept-request" }, luna).state;
    state = reduceDemoState(state, { type: "buyer-respond", orderId: id, action: "complete-checkout" }, buyer).state;
    state = reduceDemoState(state, { type: "artist-deliver", orderId: id, action: "submit-sketch", file: { id: "sk-up", name: "s.png", type: "image/png", size: 12, kind: "sketch", createdAt: buyer.now } }, luna).state;
    state = reduceDemoState(state, { type: "buyer-respond", orderId: id, action: "approve-sketch" }, buyer).state;
    state = reduceDemoState(state, { type: "artist-deliver", orderId: id, action: "submit-final", file: { id: "fn-up", name: "f.png", type: "image/png", size: 12, kind: "final", createdAt: buyer.now } }, luna).state;
    state = reduceDemoState(state, { type: "buyer-respond", orderId: id, action: "accept-delivery" }, buyer).state;
    const published = reduceDemoState(
      reduceDemoState(state, { type: "process-story-opt-in", orderId: id, side: "artist", optIn: true }, luna).state,
      { type: "process-story-opt-in", orderId: id, side: "buyer", optIn: true },
      buyer,
    );
    expect(published.state.processStories.some((item) => item.orderId === id)).toBe(false);
  });

  it("trims captions to one public line", () => {
    expect(sanitizeProcessCaption("  quiet   garden  ")).toBe("quiet garden");
    expect(sanitizeProcessCaption("x".repeat(120)).length).toBe(80);
  });
});
