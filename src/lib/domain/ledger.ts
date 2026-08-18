import type { LedgerEntry } from "@/types";

export function calculateSimulatedBalance(entries: LedgerEntry[], artistId: string) {
  const mine = entries.filter((entry) => entry.artistId === artistId);
  return {
    pending: mine.filter((entry) => entry.entryType === "pending").reduce((sum, entry) => sum + entry.amount, 0),
    available: mine.filter((entry) => entry.entryType === "available").reduce((sum, entry) => sum + entry.amount, 0),
  };
}
