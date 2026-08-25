import { describe, expect, it } from "vitest";
import { LICENSE_CHARACTER_LINE, licenseSummary } from "@/lib/domain/license";

describe("licenseSummary", () => {
  it("states files, personal use, and that the artist keeps copyright", () => {
    const copy = licenseSummary("personal", { artistName: "Luna Chen" });
    expect(copy.headline).toContain("files for personal use");
    expect(copy.headline).toContain("printing at home");
    expect(copy.headline).toContain("Luna Chen keeps the copyright");
    expect(copy.detail).toBe(LICENSE_CHARACTER_LINE);
  });

  it("treats commercial as a wider license, not a copyright sale", () => {
    const copy = licenseSummary("commercial", { artistName: "Noah Vega", commercialContext: "this commission" });
    expect(copy.headline).toContain("commercial license");
    expect(copy.headline).toContain("Noah Vega still owns the copyright");
  });

  it("never says the buyer owns the art or an NFT", () => {
    for (const intendedUse of ["personal", "commercial"] as const) {
      const text = `${licenseSummary(intendedUse, { artistName: "Leo" }).headline} ${LICENSE_CHARACTER_LINE}`.toLowerCase();
      expect(text).not.toMatch(/own the art/);
      expect(text).not.toMatch(/owns the art/);
      expect(text).not.toMatch(/nft/);
    }
  });
});
