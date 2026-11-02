import { publishedStoreConfigured } from "./config";
import { memoryPublishedStore } from "./memory";
import { supabasePublishedStore } from "./supabase";
import type { PublishedArtStore } from "./types";

export function getPublishedStore(): PublishedArtStore {
  if (publishedStoreConfigured()) return supabasePublishedStore();
  return {
    ...memoryPublishedStore("unconfigured"),
    configured: false,
    async publish() {
      throw new Error("Shared gallery is not connected.");
    },
  };
}
