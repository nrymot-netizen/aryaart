import type { PublishedArtStore, PublishedBundle, PublishedCatalog, PublishInput } from "./types";

const catalogs = new Map<string, PublishedCatalog>();

function emptyCatalog(): PublishedCatalog {
  return { artworks: [], processLogs: [], pairs: [], profiles: [] };
}

export function memoryPublishedStore(namespace = "default"): PublishedArtStore {
  if (!catalogs.has(namespace)) catalogs.set(namespace, emptyCatalog());
  const catalog = () => catalogs.get(namespace) ?? emptyCatalog();

  return {
    configured: true,
    async list() {
      return catalog();
    },
    async getArtwork(id) {
      const current = catalog();
      const artwork = current.artworks.find((item) => item.id === id);
      if (!artwork) return null;
      const profile = current.profiles.find((item) => item.handle === artwork.artistId) ?? { id: artwork.artistId, handle: artwork.artistId };
      return {
        artwork,
        processLog: current.processLogs.find((item) => item.subjectId === id) ?? null,
        pair: current.pairs.find((item) => item.replyArtworkId === id) ?? null,
        profile,
      };
    },
    async getPair(id) {
      const current = catalog();
      const pair = current.pairs.find((item) => item.id === id);
      if (!pair) return null;
      const source = await this.getArtwork(pair.sourceArtworkId);
      const reply = await this.getArtwork(pair.replyArtworkId);
      if (!source || !reply) return null;
      return { pair, source, reply };
    },
    async publish(input: PublishInput) {
      const current = catalog();
      const profile = current.profiles.find((item) => item.handle === input.handle) ?? { id: input.handle, handle: input.handle };
      const next: PublishedCatalog = {
        profiles: [profile, ...current.profiles.filter((item) => item.handle !== profile.handle)],
        artworks: [input.artwork, ...current.artworks.filter((item) => item.id !== input.artwork.id)],
        processLogs: input.processLog
          ? [input.processLog, ...current.processLogs.filter((item) => item.subjectId !== input.artwork.id)]
          : current.processLogs,
        pairs: input.pair ? [input.pair, ...current.pairs.filter((item) => item.id !== input.pair?.id)] : current.pairs,
      };
      catalogs.set(namespace, next);
      return {
        artwork: input.artwork,
        processLog: input.processLog,
        pair: input.pair,
        profile,
      };
    },
  };
}

export function resetMemoryPublishedStore(namespace = "default") {
  catalogs.set(namespace, emptyCatalog());
}

export function bundleFromMemory(bundle: PublishedBundle) {
  return bundle;
}
