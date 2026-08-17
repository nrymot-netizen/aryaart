import type { Artist, Artwork, CommissionService, Notification } from "@/types";

export const artists: Artist[] = [
  { id: "luna", username: "LunaLines", displayName: "Luna Chen", specialty: "Anime & fantasy illustrator", bio: "Dreamy character art, magical worlds, and expressive portraits.", avatar: "/art/avatar-luna.svg", accountType: "adult", styles: ["Anime", "Fantasy"], availability: "limited", slots: 2, startingPrice: 45, rating: 4.9, completedCommissions: 38 },
  { id: "maya", username: "SketchMaya", displayName: "Maya", specialty: "Cute characters & pets", bio: "Soft shapes, warm colors, and a lot of personality.", avatar: "/art/avatar-maya.svg", accountType: "protected-teen", styles: ["Cute", "Watercolor"], availability: "waitlist", startingPrice: 20, rating: 4.8, completedCommissions: 14 },
  { id: "nova", username: "PixelNova", displayName: "Noah Vega", specialty: "Pixel artist & game illustrator", bio: "Tiny worlds, bold palettes, and characters ready for adventure.", avatar: "/art/avatar-nova.svg", accountType: "adult", styles: ["Pixel art", "Fantasy"], availability: "open", slots: 4, startingPrice: 35, rating: 5, completedCommissions: 52 },
  { id: "leo", username: "ArtByLeo", displayName: "Leo", specialty: "Comic illustrations", bio: "Dynamic panels and colorful heroes with a hand-inked feel.", avatar: "/art/avatar-leo.svg", accountType: "protected-teen", styles: ["Comic"], availability: "limited", slots: 1, startingPrice: 30, rating: 4.7, completedCommissions: 11 },
  { id: "rose", username: "RoseCanvas", displayName: "Rose Bennett", specialty: "Realistic portrait artist", bio: "Luminous digital portraits made to preserve meaningful moments.", avatar: "/art/avatar-rose.svg", accountType: "adult", styles: ["Realism"], availability: "closed", startingPrice: 120, rating: 4.9, completedCommissions: 67 },
];

export const artworks: Artwork[] = [
  { id: "moon-garden", artistId: "luna", title: "Moon Garden", image: "/art/moon-garden.svg", style: "Anime", subject: "Character", price: 45, likes: 1240 },
  { id: "summer-familiar", artistId: "maya", title: "Summer Familiar", image: "/art/summer-familiar.svg", style: "Cute", subject: "Pet", price: 24, likes: 682, isNew: true },
  { id: "neon-quest", artistId: "nova", title: "Neon Quest", image: "/art/neon-quest.svg", style: "Pixel art", subject: "Landscape", price: 35, likes: 934 },
  { id: "first-flight", artistId: "leo", title: "First Flight", image: "/art/first-flight.svg", style: "Comic", subject: "Character", price: 38, likes: 517, isNew: true },
  { id: "quiet-light", artistId: "rose", title: "Quiet Light", image: "/art/quiet-light.svg", style: "Realism", subject: "Portrait", price: 140, likes: 1106 },
  { id: "starbound", artistId: "luna", title: "Starbound", image: "/art/starbound.svg", style: "Fantasy", subject: "Character", price: 55, likes: 806 },
];

export const services: CommissionService[] = [
  { id: "anime-portrait", artistId: "luna", title: "Anime Character Portrait", description: "A polished, expressive character portrait in my signature dreamy style.", startingPrice: 45, turnaround: "7–10 days", revisions: 2, availability: "limited", includes: ["One character", "Full color", "Simple background", "High-resolution PNG"] },
  { id: "fantasy-scene", artistId: "luna", title: "Fantasy Character Scene", description: "Your character inside a custom magical environment.", startingPrice: 95, turnaround: "14–18 days", revisions: 2, availability: "limited", includes: ["One character", "Detailed environment", "Full rendering", "High-resolution PNG"] },
  { id: "pet-sticker", artistId: "maya", title: "Cozy Pet Portrait", description: "A sweet, stylized portrait of your favorite companion.", startingPrice: 20, turnaround: "5–7 days", revisions: 1, availability: "waitlist", includes: ["One pet", "Pastel background", "Print-ready PNG"] },
];

export const notifications: Notification[] = [
  { id: "n1", title: "A new artist match", detail: "We found 3 fantasy artists you may love.", read: false },
  { id: "n2", title: "Waitlist update", detail: "You moved up to #4 on SketchMaya’s list.", read: false },
];

export const getArtist = (id: string) => artists.find((artist) => artist.id === id);
export const getArtistArt = (id: string) => artworks.filter((artwork) => artwork.artistId === id);
