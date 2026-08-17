import { describe, expect, it } from "vitest";
import { commissionRequestSchema } from "@/lib/validation/commission";

describe("commission request validation", () => {
  const valid = { brief: "A full-color fantasy portrait of my original character.", serviceId: "anime-portrait", characterCount: 1, intendedUse: "personal", budget: 75, deadline: "2026-09-30", rulesAccepted: true };
  it("accepts a complete structured request", () => expect(commissionRequestSchema.safeParse(valid).success).toBe(true));
  it("rejects a vague brief", () => expect(commissionRequestSchema.safeParse({ ...valid, brief: "draw me" }).success).toBe(false));
  it("requires commission rules acceptance", () => expect(commissionRequestSchema.safeParse({ ...valid, rulesAccepted: false }).success).toBe(false));
  it("limits character count", () => expect(commissionRequestSchema.safeParse({ ...valid, characterCount: 99 }).success).toBe(false));
});
