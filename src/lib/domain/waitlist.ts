import type { WaitlistEntry } from "@/types";

export function activeWaitlistEntries(entries: WaitlistEntry[], artistId: string, serviceId: string): WaitlistEntry[] {
  return entries
    .filter((entry) => entry.artistId === artistId && entry.serviceId === serviceId && entry.status === "active")
    .sort((a, b) => a.position - b.position);
}

export function getWaitlistEntry(entries: WaitlistEntry[], artistId: string, serviceId: string, buyerId: string): WaitlistEntry | undefined {
  return entries.find((entry) => entry.artistId === artistId && entry.serviceId === serviceId && entry.buyerId === buyerId && entry.status === "active");
}

export function joinWaitlist(entries: WaitlistEntry[], input: { artistId: string; serviceId: string; buyerId: string }): { ok: true; entries: WaitlistEntry[]; position: number } | { ok: false; error: string } {
  const existing = getWaitlistEntry(entries, input.artistId, input.serviceId, input.buyerId);
  if (existing) return { ok: true, entries, position: existing.position };
  const active = activeWaitlistEntries(entries, input.artistId, input.serviceId);
  const position = (active.at(-1)?.position ?? 0) + 1;
  const next: WaitlistEntry = {
    id: `waitlist-${input.artistId}-${input.serviceId}-${input.buyerId}`,
    artistId: input.artistId,
    serviceId: input.serviceId,
    buyerId: input.buyerId,
    position,
    status: "active",
  };
  return { ok: true, entries: [...entries, next], position };
}

export function leaveWaitlist(entries: WaitlistEntry[], input: { artistId: string; serviceId: string; buyerId: string }): WaitlistEntry[] {
  const current = getWaitlistEntry(entries, input.artistId, input.serviceId, input.buyerId);
  if (!current) return entries;
  return entries
    .map((entry) => {
      if (entry.id === current.id) return { ...entry, status: "left" as const };
      if (entry.artistId === input.artistId && entry.serviceId === input.serviceId && entry.status === "active" && entry.position > current.position) {
        return { ...entry, position: entry.position - 1 };
      }
      return entry;
    });
}

export function waitlistPositionLabel(position: number): string {
  return `You’re #${position}.`;
}

export function promoteWaitlistEntry(entries: WaitlistEntry[], artistId: string, serviceId: string, now: string) {
  const active = activeWaitlistEntries(entries, artistId, serviceId);
  const first = active[0];
  if (!first) return { entries, promoted: null as WaitlistEntry | null };
  const expiresAt = new Date(new Date(now).getTime() + 48 * 60 * 60 * 1000).toISOString();
  const next = entries.map((entry) => {
    if (entry.id === first.id) return { ...entry, status: "promoted" as const, promotedAt: now, expiresAt };
    if (entry.artistId === artistId && entry.serviceId === serviceId && entry.status === "active" && entry.position > first.position) {
      return { ...entry, position: entry.position - 1 };
    }
    return entry;
  });
  return { entries: next, promoted: { ...first, status: "promoted" as const, promotedAt: now, expiresAt } };
}
