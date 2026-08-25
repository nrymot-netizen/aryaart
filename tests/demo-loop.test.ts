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

  it("records canvas as the source when Luna draws a sketch on Arya", () => {
    let { state } = request();
    const id = state.orders[0].id;
    state = reduceDemoState(state, { type: "respond", orderId: id, action: "accept-request" }, luna).state;
    state = reduceDemoState(state, { type: "buyer-respond", orderId: id, action: "complete-checkout" }, buyer).state;
    state = reduceDemoState(state, {
      type: "artist-deliver",
      orderId: id,
      action: "submit-sketch",
      file: { id: "sk", name: "sketch.jpg", type: "image/jpeg", size: 1200, kind: "sketch", source: "arya-canvas", preview: "data:image/jpeg;base64,aaaa", createdAt: buyer.now },
    }, luna).state;
    expect(state.orders[0].status).toBe("sketch-review");
    expect(state.files.some((file) => file.source === "arya-canvas" && file.kind === "sketch")).toBe(true);
    expect(state.events.some((event) => event.name === "sketch_submitted" && event.payload?.source === "canvas")).toBe(true);
  });

  it("publishes a canvas drawing into the demo portfolio", () => {
    const result = reduceDemoState(createDemoState(), {
      type: "create-artwork",
      processOps: [{ type: "fill", x: 12, y: 20, color: "#17151b", layerId: "layer-1" }],
      paperColor: "#fffdf8",
      artwork: {
        id: "art-canvas-demo",
        artistId: "luna",
        title: "Night garden",
        description: "Drawn on Arya.",
        image: "data:image/jpeg;base64,aaaa",
        style: "Anime",
        subject: "character",
        tags: ["anime"],
        tools: ["Arya Canvas"],
        aiDisclosure: false,
        visibility: "public",
        publishedAt: "2026-08-17",
        price: 40,
        likes: 0,
        isNew: true,
        format: "digital",
      },
    }, luna);
    expect(result.state.createdArtworks[0]?.id).toBe("art-canvas-demo");
    expect(result.state.createdArtworks[0]?.tools).toContain("Arya Canvas");
    expect(result.state.processLogs[0]?.subjectId).toBe("art-canvas-demo");
    expect(result.href).toBe("/art/art-canvas-demo");
    expect(result.state.events.some((event) => event.name === "artwork_published" && event.payload?.source === "canvas")).toBe(true);
    expect(result.state.events.some((event) => event.name === "process_log_recorded")).toBe(true);
  });

  it("does not let an upload fake Arya Canvas proof without strokes", () => {
    const result = reduceDemoState(createDemoState(), {
      type: "create-artwork",
      artwork: {
        id: "art-upload-demo",
        artistId: "luna",
        title: "File drop",
        description: "Published from a file.",
        image: "data:image/jpeg;base64,aaaa",
        style: "Anime",
        subject: "character",
        tags: ["upload"],
        tools: ["Arya Canvas"],
        aiDisclosure: false,
        visibility: "public",
        publishedAt: "2026-08-17",
        price: 40,
        likes: 0,
        format: "digital",
      },
    }, luna);
    expect(result.state.createdArtworks[0]?.tools).not.toContain("Arya Canvas");
    expect(result.state.processLogs.some((item) => item.subjectId === "art-upload-demo")).toBe(false);
    expect(result.state.events.some((event) => event.name === "artwork_published" && event.payload?.source === "upload")).toBe(true);
  });

  it("snapshots license copy when Luna accepts a request", () => {
    const submitted = request();
    const accepted = reduceDemoState(submitted.state, { type: "respond", orderId: submitted.state.orders[0].id, action: "accept-request" }, luna);
    const headline = accepted.state.orders[0].termsSnapshot?.licenseSummary ?? "";
    expect(headline).toMatch(/files for personal use/i);
    expect(headline).toMatch(/copyright/i);
    expect(headline.toLowerCase()).not.toMatch(/own the art/);
  });

  it("blocks a buyer from accepting their own request", () => {
    const submitted = request();
    const result = reduceDemoState(submitted.state, { type: "respond", orderId: submitted.state.orders[0].id, action: "accept-request" }, buyer);
    expect(result.error).toBeTruthy();
    expect(submitted.state.orders[0].status).toBe("awaiting-artist");
  });

  it("blocks protected-teen contact sharing in the workspace", () => {
    const sketch = createDemoState();
    const result = reduceDemoState(sketch, { type: "send-message", orderId: "order-first-flight", body: "email me at alex@example.com" }, { ...buyer, actorId: "leo", role: "artist", artistId: "leo", accountType: "protected-teen" });
    expect(result.error).toContain("Message not sent");
  });

  it("blocks an adult buyer from sending contact on a protected-teen artist order", () => {
    const result = reduceDemoState(createDemoState(), { type: "send-message", orderId: "order-first-flight", body: "text me 312-555-0184" }, buyer);
    expect(result.error).toContain("Message not sent");
  });

  it("rejects a request brief that shares contact on a protected thread", () => {
    const result = reduceDemoState(createDemoState(), {
      type: "submit-request",
      order: {
        buyerId: "buyer-alex",
        artistId: "maya",
        serviceId: "pet-sticker",
        brief: "Please email the sketch to alex@example.com",
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
    expect(result.error).toContain("Request not sent");
  });

  it("records a demo report and hides the other party after a block", () => {
    const reported = reduceDemoState(createDemoState(), { type: "report-order", orderId: "order-first-flight" }, buyer);
    expect(reported.state.orderReports[0]?.orderId).toBe("order-first-flight");
    const blocked = reduceDemoState(reported.state, { type: "block-order", orderId: "order-first-flight" }, buyer);
    expect(blocked.state.orderBlocks[0]?.blockedId).toBe("leo");
  });

  it("promotes the first waitlist entry when a slot opens", () => {
    const result = reduceDemoState(createDemoState(), { type: "promote-waitlist", artistId: "maya", serviceId: "pet-sticker" }, luna);
    expect(result.state.waitlists.find((entry) => entry.buyerId === "seed-buyer-1")?.status).toBe("promoted");
  });

  it("adds a commercial surcharge to the estimate when configured", () => {
    expect(calculateCommissionEstimate(45, { characterCount: 1, extraCharacterPrice: 25, selectedAddOns: [], intendedUse: "commercial", commercialSurcharge: 20 })).toBe(65);
  });
});
