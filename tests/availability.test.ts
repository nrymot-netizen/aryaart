import { describe, expect, it } from "vitest";
import { canRequestCommission, getAvailabilityCta } from "@/lib/domain/availability";

describe("availability CTAs", () => {
  it("keeps request enabled for open and limited artists", () => {
    expect(getAvailabilityCta("open").kind).toBe("request");
    expect(getAvailabilityCta("limited", 2).helper).toContain("2 slots");
    expect(canRequestCommission("open")).toBe(true);
    expect(canRequestCommission("limited")).toBe(true);
  });

  it("uses waitlist copy when the book is waitlisted", () => {
    expect(getAvailabilityCta("waitlist")).toMatchObject({ kind: "waitlist", disabled: false, label: "Join waitlist" });
    expect(canRequestCommission("waitlist")).toBe(false);
  });

  it("blocks request CTAs when commissions are closed", () => {
    expect(getAvailabilityCta("closed")).toMatchObject({ kind: "closed", disabled: true, label: "Commissions closed" });
    expect(canRequestCommission("closed")).toBe(false);
  });
});
