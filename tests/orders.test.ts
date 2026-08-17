import { describe, expect, it } from "vitest";
import { calculateCommissionEstimate, getNextOrderStatus, remainingRevisions } from "@/lib/domain/orders";

describe("commission pricing", () => {
  it("calculates base price, extra characters, and selected add-ons", () => {
    expect(calculateCommissionEstimate(45, { characterCount: 2, extraCharacterPrice: 25, selectedAddOns: [{ id: "bg", name: "Detailed background", price: 30 }, { id: "rush", name: "Rush delivery", price: 20 }] })).toBe(120);
  });
  it("does not allow negative pricing inputs to reduce the estimate", () => {
    expect(calculateCommissionEstimate(45, { characterCount: 2, extraCharacterPrice: -25, selectedAddOns: [] })).toBe(45);
  });
});

describe("order transitions", () => {
  it("allows the requested artist to counter an awaiting request", () => expect(getNextOrderStatus("awaiting-artist", "counter-request", "artist")).toBe("counteroffer"));
  it("prevents a buyer from accepting their own request", () => expect(getNextOrderStatus("awaiting-artist", "accept-request", "buyer")).toBeNull());
  it("allows the buyer to complete checkout after terms are accepted", () => expect(getNextOrderStatus("payment-required", "complete-checkout", "buyer")).toBe("in-progress"));
  it("makes completed orders terminal", () => expect(getNextOrderStatus("completed", "cancel", "buyer")).toBeNull());
});

describe("revisions", () => {
  it("never displays a negative remaining revision count", () => expect(remainingRevisions(2, 4)).toBe(0));
});
