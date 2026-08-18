import { describe, expect, it } from "vitest";
import { createDemoState } from "@/features/demo/demo-state";
import { reduceDemoState, type ReduceContext } from "@/features/demo/demo-reducer";
import { calculateSimulatedBalance } from "@/lib/domain/ledger";
import { calculateCommissionEstimate } from "@/lib/domain/orders";

const buyer: ReduceContext = { now: "2026-08-17T18:00:00Z", id: (prefix) => `${prefix}-1`, actorId: "buyer-alex", role: "buyer", accountType: "adult" };
const luna: ReduceContext = { ...buyer, actorId: "luna", role: "artist", artistId: "luna" };

function request(state = createDemoState()) {
  return reduceDemoState(state, {
    type: "submit-request",
    order: {
      buyerId: "buyer-alex",
      artistId: "luna",
      serviceId: "anime-portrait",
      brief: "A full-color fantasy portrait of my original character in moonlight.",
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
}

describe("demo commission loop", () => {
  it("lets Alex request Luna and both personas see awaiting-artist", () => {
    const submitted = request();
    const order = submitted.state.orders[0];
    expect(order.status).toBe("awaiting-artist");
    expect(order.artistId).toBe("luna");
  });

  it("accepts, checks out, delivers, and completes with available earnings", () => {
    let { state } = request();
    const id = state.orders[0].id;
    state = reduceDemoState(state, { type: "respond", orderId: id, action: "accept-request" }, luna).state;
    expect(state.orders[0].status).toBe("payment-required");
    state = reduceDemoState(state, { type: "buyer-respond", orderId: id, action: "complete-checkout" }, buyer).state;
    expect(state.orders[0].status).toBe("in-progress");
    state = reduceDemoState(state, { type: "artist-deliver", orderId: id, action: "submit-sketch", file: { id: "sk", name: "sketch.png", type: "image/png", size: 12, kind: "sketch", createdAt: buyer.now } }, luna).state;
    expect(state.orders[0].status).toBe("sketch-review");
    state = reduceDemoState(state, { type: "buyer-respond", orderId: id, action: "approve-sketch" }, buyer).state;
    state = reduceDemoState(state, { type: "artist-deliver", orderId: id, action: "submit-final", file: { id: "fn", name: "final.png", type: "image/png", size: 12, kind: "final", createdAt: buyer.now } }, luna).state;
    state = reduceDemoState(state, { type: "buyer-respond", orderId: id, action: "accept-delivery" }, buyer).state;
    expect(state.orders[0].status).toBe("completed");
    expect(calculateSimulatedBalance(state.ledger, "luna").available).toBeGreaterThan(0);
  });

  it("blocks a buyer from accepting their own request", () => {
    const submitted = request();
    const result = reduceDemoState(submitted.state, { type: "respond", orderId: submitted.state.orders[0].id, action: "accept-request" }, buyer);
    expect(result.error).toBeTruthy();
    expect(submitted.state.orders[0].status).toBe("awaiting-artist");
  });

  it("blocks protected-teen contact sharing in the workspace", () => {
    const sketch = createDemoState();
    const result = reduceDemoState(sketch, { type: "send-message", orderId: "order-first-flight", body: "email me at alex@example.com", protectedAccount: true }, { ...buyer, actorId: "leo", role: "artist", artistId: "leo", accountType: "protected-teen" });
    expect(result.error).toContain("Message not sent");
  });

  it("promotes the first waitlist entry when a slot opens", () => {
    const result = reduceDemoState(createDemoState(), { type: "promote-waitlist", artistId: "maya", serviceId: "pet-sticker" }, luna);
    expect(result.state.waitlists.find((entry) => entry.buyerId === "seed-buyer-1")?.status).toBe("promoted");
  });

  it("adds a commercial surcharge to the estimate when configured", () => {
    expect(calculateCommissionEstimate(45, { characterCount: 1, extraCharacterPrice: 25, selectedAddOns: [], intendedUse: "commercial", commercialSurcharge: 20 })).toBe(65);
  });
});
