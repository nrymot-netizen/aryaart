import { IDENTITY_EVENTS, isIdentityEvent } from "@/lib/domain/identity";

export const PRODUCT_EVENTS = [
  ...IDENTITY_EVENTS,
  "artwork_viewed",
  "artist_profile_viewed",
  "service_selected",
  "request_started",
  "request_submitted",
  "artist_response_submitted",
  "checkout_completed",
  "milestone_action",
  "canvas_opened",
  "artwork_published",
  "sketch_submitted",
  "final_delivered",
  "delivery_accepted",
  "review_submitted",
  "waitlist_joined",
  "safety_message_blocked",
  "artwork_saved",
] as const;

export type ProductEventName = (typeof PRODUCT_EVENTS)[number];

const UNIQUE_EVENT_KEYS: Partial<Record<ProductEventName, string>> = {
  artwork_viewed: "artworkId",
  artist_profile_viewed: "artistId",
  service_selected: "serviceId",
  request_started: "serviceId",
  canvas_opened: "route",
  first_paid_piece_viewed: "orderId",
  challenge_opened: "challengeId",
  draw_back_started: "artworkId",
  draw_back_published: "pairId",
};

export function isProductEvent(name: string): name is ProductEventName {
  return (PRODUCT_EVENTS as readonly string[]).includes(name) || isIdentityEvent(name);
}

export function uniqueEventKey(name: string) {
  return UNIQUE_EVENT_KEYS[name as ProductEventName];
}
