import { ARYA_CANVAS_TOOL } from "@/lib/domain/canvas";
import { humanMadeFromStrokes, type ProcessLog } from "@/lib/domain/process-log";
import type { CommissionOrder } from "@/types";

export const IDENTITY_EVENTS = [
  "replay_played",
  "replay_completed",
  "share_card_copied",
  "share_card_downloaded",
  "process_log_recorded",
  "first_paid_piece_viewed",
  "challenge_opened",
  "challenge_entered",
  "try_brief_clicked",
  "process_story_opt_in",
  "process_story_published",
] as const;

export type IdentityEventName = (typeof IDENTITY_EVENTS)[number];

export function isIdentityEvent(name: string): name is IdentityEventName {
  return (IDENTITY_EVENTS as readonly string[]).includes(name);
}

export function drawnOnArya(tools: string[]) {
  return tools.includes(ARYA_CANVAS_TOOL);
}

export function publicHumanMade(tools: string[], processLog: ProcessLog | null) {
  return humanMadeFromStrokes({ tools, processLog });
}

export function firstPaidPiece(orders: CommissionOrder[], artistId: string) {
  return orders
    .filter((order) => order.artistId === artistId && order.status === "completed")
    .slice()
    .sort((left, right) => left.updatedAt.localeCompare(right.updatedAt) || left.createdAt.localeCompare(right.createdAt))[0] ?? null;
}

export function buyerDisplayName(buyerId: string) {
  if (buyerId === "buyer-alex") return "Alex";
  return "a buyer";
}
