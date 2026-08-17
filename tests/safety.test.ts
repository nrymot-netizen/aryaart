import { describe, expect, it } from "vitest";
import { evaluateContactSharing } from "@/lib/domain/safety";

describe("protected teen message safety", () => {
  it("allows normal project feedback", () => expect(evaluateContactSharing("Could the cape be a little more purple?", true).allowed).toBe(true));
  it("blocks email sharing", () => {
    const result = evaluateContactSharing("Send it to alex@example.com", true);
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("email");
  });
  it("blocks likely phone numbers", () => expect(evaluateContactSharing("Text me at (312) 555-0184", true).allowed).toBe(false));
  it("blocks common off-platform handles", () => expect(evaluateContactSharing("my discord is moonart#1234", true).allowed).toBe(false));
  it("does not apply protected-account restrictions to adult accounts", () => expect(evaluateContactSharing("alex@example.com", false).allowed).toBe(true));
});
