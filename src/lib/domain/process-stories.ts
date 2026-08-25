import { latestFileOfKind } from "@/lib/domain/canvas";
import { type ProcessLog } from "@/lib/domain/process-log";
import type { AccountType, CommissionOrder, DemoFile, ProcessStoryConsent } from "@/types";

export const PROCESS_CAPTION_MAX = 80;

export function emptyProcessConsent(orderId: string, id = `consent-${orderId}`): ProcessStoryConsent {
  return { id, orderId, artistOptIn: false, artistReplayOptIn: false, buyerOptIn: false, buyerCaption: "" };
}

export function sanitizeProcessCaption(raw: string) {
  return raw.replace(/\s+/g, " ").trim().slice(0, PROCESS_CAPTION_MAX);
}

export function processFiles(files: DemoFile[], orderId: string) {
  const scoped = files.filter((file) => file.orderId === orderId);
  return {
    sketch: latestFileOfKind(scoped, "sketch"),
    final: latestFileOfKind(scoped, "final"),
  };
}

export function processStoryReady(input: {
  status: CommissionOrder["status"];
  sketch?: DemoFile;
  final?: DemoFile;
  artistOptIn: boolean;
  buyerOptIn: boolean;
}): { ok: true } | { ok: false; reason: "not-complete" | "needs-both" | "needs-files" } {
  if (input.status !== "completed") return { ok: false, reason: "not-complete" };
  if (!input.artistOptIn || !input.buyerOptIn) return { ok: false, reason: "needs-both" };
  if (!input.sketch?.preview || !input.final?.preview) return { ok: false, reason: "needs-files" };
  return { ok: true };
}

export function shouldIncludeFinalReplay(artistReplayOptIn: boolean, log: ProcessLog | null) {
  return Boolean(artistReplayOptIn && log && log.ops.length > 0);
}

export function teenPaidWorkStaysPrivateUntilOptIn(artistAccountType: AccountType) {
  return artistAccountType === "protected-teen";
}

export function processStoryHrefFromPostId(postId: string) {
  return postId.startsWith("post-pstory-") ? `/process/${postId.slice("post-pstory-".length)}` : null;
}
