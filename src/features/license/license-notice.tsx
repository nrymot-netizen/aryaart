"use client";

import { orderLicenseCopy } from "@/lib/domain/license";
import type { IntendedUse } from "@/types";

export function LicenseNotice({
  intendedUse,
  artistName,
  storedHeadline,
  compact = false,
}: {
  intendedUse: IntendedUse;
  artistName: string;
  storedHeadline?: string;
  compact?: boolean;
}) {
  const copy = orderLicenseCopy(intendedUse, artistName, storedHeadline);
  return (
    <div className={compact ? "rounded-2xl bg-mist px-4 py-3 text-sm leading-6 text-black/70" : "rounded-3xl border border-black/[0.07] bg-white px-5 py-4 text-sm leading-6 text-black/70"}>
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-plum">What you get</p>
      <p className="mt-1 font-semibold text-ink">{copy.headline}</p>
      <p className="mt-2 text-xs leading-5 text-black/50">{copy.detail}</p>
    </div>
  );
}
