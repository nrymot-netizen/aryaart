import { describe, expect, it } from "vitest";
import { seedWaitlists } from "@/data/mock-data";
import { getWaitlistEntry, joinWaitlist, leaveWaitlist, waitlistPositionLabel } from "@/lib/domain/waitlist";

describe("waitlists", () => {
  it("lets a buyer join one waitlist per artist/service combination and reports position", () => {
    const joined = joinWaitlist(seedWaitlists, { artistId: "maya", serviceId: "pet-sticker", buyerId: "buyer-alex" });
    expect(joined.ok).toBe(true);
    if (!joined.ok) return;
    expect(joined.position).toBe(4);
    expect(waitlistPositionLabel(joined.position)).toBe("You’re #4.");
    const again = joinWaitlist(joined.entries, { artistId: "maya", serviceId: "pet-sticker", buyerId: "buyer-alex" });
    expect(again.ok && again.position).toBe(4);
  });

  it("allows a separate waitlist on another service from the same artist", () => {
    const first = joinWaitlist(seedWaitlists, { artistId: "maya", serviceId: "pet-sticker", buyerId: "buyer-alex" });
    if (!first.ok) throw new Error("join failed");
    const second = joinWaitlist(first.entries, { artistId: "maya", serviceId: "character-chibi", buyerId: "buyer-alex" });
    expect(second.ok && second.position).toBe(1);
  });

  it("removes the buyer and compacts later positions on leave", () => {
    const joined = joinWaitlist(seedWaitlists, { artistId: "maya", serviceId: "pet-sticker", buyerId: "buyer-alex" });
    if (!joined.ok) throw new Error("join failed");
    const left = leaveWaitlist(joined.entries, { artistId: "maya", serviceId: "pet-sticker", buyerId: "buyer-alex" });
    expect(getWaitlistEntry(left, "maya", "pet-sticker", "buyer-alex")).toBeUndefined();
    expect(getWaitlistEntry(left, "maya", "pet-sticker", "seed-buyer-3")?.position).toBe(3);
  });
});
