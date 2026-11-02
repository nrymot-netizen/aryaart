import type { Artist } from "@/types";

const handlePattern = /^ink-[a-z0-9]{6,16}$/;

const publisherRules = {
  acceptedSubjects: ["Your own drawings"],
  declinedSubjects: ["Off-platform contact"],
  revisionPolicy: "This profile is for work drawn on Arya.",
  usageRights: "The artist keeps the copyright.",
  communicationBoundary: "No open DMs.",
  expectedResponseTime: "Drawing here.",
  cancellationPolicy: "Public pieces can stay up after you leave this browser.",
};

export function isPublisherHandle(id: string) {
  return handlePattern.test(id);
}

export function createPublisherHandle() {
  const bytes = new Uint8Array(8);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) crypto.getRandomValues(bytes);
  else for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  return `ink-${Array.from(bytes, (value) => (value % 36).toString(36)).join("")}`;
}

export function publisherArtist(handle: string): Artist {
  return {
    id: handle,
    username: handle,
    displayName: handle,
    specialty: "Drawn on Arya",
    bio: "Drawn on Arya. A person, not a follower count.",
    avatar: "/art/avatar-you.svg",
    accountType: "adult",
    styles: ["Anime", "Cute", "Fantasy"],
    availability: "closed",
    startingPrice: 0,
    rating: 0,
    completedCommissions: 0,
    responseTime: "Drawing here",
    emerging: true,
    exposureRank: 50,
    rules: publisherRules,
  };
}

export function normalizePublishArtistId(artistId: string, handle: string) {
  if (artistId === "you" || artistId === handle || isPublisherHandle(artistId)) return handle;
  return artistId;
}

export function shouldSharePublish(artistId: string) {
  return artistId === "you" || isPublisherHandle(artistId);
}

export function isVisitorArtist(id: string) {
  return shouldSharePublish(id);
}
