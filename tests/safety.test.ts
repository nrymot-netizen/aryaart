import { describe, expect, it } from "vitest";
import { evaluateContactFields, evaluateContactSharing, evaluatePublicCopy, isProtectedThread, orderIsProtectedThread } from "@/lib/domain/safety";

describe("protected teen message safety", () => {
  it("allows normal project feedback", () => expect(evaluateContactSharing("Could the cape be a little more purple?", true).allowed).toBe(true));
  it("blocks email sharing", () => {
    const result = evaluateContactSharing("Send it to alex@example.com", true);
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("email");
  });
  it("blocks obfuscated email", () => expect(evaluateContactSharing("email alex at gmail dot com", true).allowed).toBe(false));
  it("blocks likely phone numbers", () => expect(evaluateContactSharing("Text me at (312) 555-0184", true).allowed).toBe(false));
  it("blocks common off-platform handles", () => expect(evaluateContactSharing("my discord is moonart#1234", true).allowed).toBe(false));
  it("blocks instagram profile URLs", () => expect(evaluateContactSharing("find me instagram.com/moonart", true).allowed).toBe(false));
  it("does not apply protected-account restrictions to adult-only threads", () => expect(evaluateContactSharing("alex@example.com", false).allowed).toBe(true));
  it("treats a protected-teen artist as a protected thread", () => expect(orderIsProtectedThread({ buyerId: "buyer-alex", artistId: "leo" })).toBe(true));
  it("does not treat Luna and Alex as a protected thread", () => expect(orderIsProtectedThread({ buyerId: "buyer-alex", artistId: "luna" })).toBe(false));
  it("blocks contact in a request brief on a protected thread", () => {
    expect(evaluateContactFields(["Please send files to alex@example.com", "thanks"], true).allowed).toBe(false);
  });
  it("allows a brief without contact on a protected thread", () => {
    expect(evaluateContactFields(["A cozy pet portrait with a yellow bow"], true).allowed).toBe(true);
  });
  it("marks either participant as enough for a protected thread", () => {
    expect(isProtectedThread("protected-teen", "adult")).toBe(true);
    expect(isProtectedThread("adult", "adult")).toBe(false);
  });
  it("blocks contact on a public title or description", () => {
    expect(evaluatePublicCopy(["Moon garden", "Find me instagram.com/moonart"]).allowed).toBe(false);
    expect(evaluatePublicCopy(["Moon garden", "Drawn on Arya."]).allowed).toBe(true);
  });
});
