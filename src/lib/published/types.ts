import type { Artwork, DrawBackPair } from "@/types";
import type { ProcessLog } from "@/lib/domain/process-log";

export interface PublishedProfile {
  id: string;
  handle: string;
}

export interface PublishedBundle {
  artwork: Artwork;
  processLog: ProcessLog | null;
  pair: DrawBackPair | null;
  profile: PublishedProfile;
}

export interface PublishedCatalog {
  artworks: Artwork[];
  processLogs: ProcessLog[];
  pairs: DrawBackPair[];
  profiles: PublishedProfile[];
}

export interface PublishInput {
  artwork: Artwork;
  processLog: ProcessLog | null;
  pair: DrawBackPair | null;
  handle: string;
}

export interface PublishedArtStore {
  configured: boolean;
  list(): Promise<PublishedCatalog>;
  getArtwork(id: string): Promise<PublishedBundle | null>;
  getPair(id: string): Promise<{ pair: DrawBackPair; source: PublishedBundle; reply: PublishedBundle } | null>;
  publish(input: PublishInput): Promise<PublishedBundle>;
}
