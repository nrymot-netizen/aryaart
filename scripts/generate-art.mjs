import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dir = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "art");

const pieces = [
  { id: "lunar-vow", c1: "#1a1238", c2: "#7a4ea8", accent: "#f4c6d8", moon: "#ffe7b0", variant: 0 },
  { id: "foxfire-gate", c1: "#2a1030", c2: "#c45c6a", accent: "#f6d59a", moon: "#ffd9a0", variant: 1 },
  { id: "glass-harbor", c1: "#13243f", c2: "#5b7dcf", accent: "#c8e7ff", moon: "#f4f0c8", variant: 2 },
  { id: "dusk-oracle", c1: "#2c1548", c2: "#8f5ad1", accent: "#efb4ff", moon: "#fff0c2", variant: 3 },
  { id: "peach-companion", c1: "#f6d5c4", c2: "#ee9bb3", accent: "#fff4ea", moon: "#ffe3b0", variant: 4 },
  { id: "ribbon-rain", c1: "#f4e1ef", c2: "#d98bb5", accent: "#fff", moon: "#ffe8c4", variant: 5 },
  { id: "sleepy-market", c1: "#f7e6c8", c2: "#e7a56b", accent: "#fff7ea", moon: "#fff1c2", variant: 0 },
  { id: "honey-window", c1: "#f3d7a4", c2: "#d98a4a", accent: "#fff4d8", moon: "#fff3c0", variant: 1 },
  { id: "cloud-snack", c1: "#e8f2ff", c2: "#9ec4f0", accent: "#fff", moon: "#ffe9b8", variant: 2 },
  { id: "byte-garden", c1: "#10162e", c2: "#3dd6b0", accent: "#7cf0d2", moon: "#ffe27a", variant: 6 },
  { id: "chrome-sprite", c1: "#17122c", c2: "#6d5ef0", accent: "#b8b0ff", moon: "#ffd86a", variant: 6 },
  { id: "arcade-dusk", c1: "#1a1030", c2: "#ff5f9b", accent: "#ffb0d0", moon: "#ffe08a", variant: 6 },
  { id: "constellation-chip", c1: "#0e1630", c2: "#4d7dff", accent: "#9ec0ff", moon: "#fff3b0", variant: 6 },
  { id: "overworld-key", c1: "#12241c", c2: "#3fbf7a", accent: "#b6f0c8", moon: "#ffe58a", variant: 6 },
  { id: "ink-alley", c1: "#1d1a18", c2: "#e15b4a", accent: "#f4c27a", moon: "#ffe7b0", variant: 1 },
  { id: "panel-seven", c1: "#21170f", c2: "#3d7ad9", accent: "#f2d39a", moon: "#fff0c0", variant: 3 },
  { id: "comet-runner", c1: "#24140f", c2: "#ef7a3a", accent: "#ffd19a", moon: "#ffe7a8", variant: 2 },
  { id: "rooftop-chase", c1: "#1b2030", c2: "#6a89d9", accent: "#f0c4a0", moon: "#fff4c4", variant: 0 },
  { id: "last-bell", c1: "#2a1612", c2: "#c44848", accent: "#f3c48a", moon: "#ffe0a0", variant: 5 },
  { id: "amber-study", c1: "#3a2414", c2: "#c9894a", accent: "#f3d6b0", moon: "#ffe7b8", variant: 4 },
  { id: "velvet-hour", c1: "#2b1824", c2: "#8a4a68", accent: "#e8c4c8", moon: "#ffe8c4", variant: 3 },
  { id: "window-sonata", c1: "#243040", c2: "#7fa0c8", accent: "#efe6d4", moon: "#fff4d0", variant: 2 },
  { id: "linen-portrait", c1: "#ead9c4", c2: "#c49a72", accent: "#fff8ef", moon: "#ffe9c0", variant: 4 },
  { id: "still-water", c1: "#1c2c34", c2: "#4f7f8a", accent: "#d7e8e4", moon: "#fff1c8", variant: 0 },
];

function render(piece) {
  const { id, c1, c2, accent, moon, variant } = piece;
  if (variant === 6) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 800" shape-rendering="crispEdges"><rect width="700" height="800" fill="${c1}"/><rect y="500" width="700" height="300" fill="${c2}" opacity=".35"/><rect x="80" y="360" width="90" height="140" fill="${c2}"/><rect x="170" y="280" width="120" height="220" fill="${accent}"/><rect x="290" y="400" width="140" height="100" fill="${c2}"/><rect x="430" y="250" width="140" height="250" fill="${accent}"/><rect x="570" y="340" width="70" height="160" fill="${c2}"/><circle cx="140" cy="140" r="64" fill="${moon}"/><rect x="90" y="560" width="520" height="28" fill="${accent}"/></svg>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 900"><defs><linearGradient id="${id}-g" x2="1" y2="1"><stop stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect width="700" height="900" fill="url(#${id}-g)"/><circle cx="${variant % 2 ? 160 : 540}" cy="${140 + variant * 18}" r="${90 + variant * 8}" fill="${moon}"/><path d="M0 ${640 - variant * 20}Q180 ${500 + variant * 12} 350 ${690 - variant * 10}T700 ${610}V900H0Z" fill="${accent}" opacity=".9"/><path d="M${240 + variant * 10} 700q-24-${240 + variant * 20} 110-300 150 80 70 320" fill="${accent}"/><circle cx="${360 + variant * 8}" cy="${310 + variant * 6}" r="${78 + variant * 3}" fill="#f3c2a4"/></svg>`;
}

for (const piece of pieces) {
  writeFileSync(join(dir, `${piece.id}.svg`), `${render(piece)}\n`);
}

console.log(`wrote ${pieces.length} artworks`);
