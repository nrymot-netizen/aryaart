import type { IntendedUse } from "@/types";

export const LICENSE_CHARACTER_LINE =
  "If you brought an original character, you already own that character. The artist owns this picture of it.";

export interface LicenseCopy {
  headline: string;
  detail: string;
  intendedUse: IntendedUse;
}

export function licenseSummary(
  intendedUse: IntendedUse,
  options: { artistName: string; commercialContext?: string },
): LicenseCopy {
  const artist = options.artistName.trim() || "The artist";
  if (intendedUse === "commercial") {
    const context = options.commercialContext?.trim() || "this commission";
    return {
      intendedUse,
      headline: `You get the files plus a commercial license for ${context}. ${artist} still owns the copyright.`,
      detail: LICENSE_CHARACTER_LINE,
    };
  }
  return {
    intendedUse,
    headline: `You get the files for personal use, including printing at home. ${artist} keeps the copyright.`,
    detail: LICENSE_CHARACTER_LINE,
  };
}

export function orderLicenseCopy(
  intendedUse: IntendedUse,
  artistName: string,
  storedHeadline?: string,
): LicenseCopy {
  const computed = licenseSummary(intendedUse, { artistName, commercialContext: "this commission" });
  if (storedHeadline?.trim()) return { ...computed, headline: storedHeadline.trim() };
  return computed;
}
