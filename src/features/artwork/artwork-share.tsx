"use client";

import { useState } from "react";
import { Copy, DownloadSimple, LinkSimple } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

export async function renderShareCard(input: {
  imageSrc: string;
  title: string;
  artistName: string;
  drawnOnArya: boolean;
  humanMade: boolean;
}): Promise<Blob> {
  const image = await loadImage(input.imageSrc);
  const width = 720;
  const artHeight = 900;
  const footer = 132;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = artHeight + footer;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not draw the share card.");
  ctx.fillStyle = "#fffdf8";
  ctx.fillRect(0, 0, width, artHeight);
  const scale = Math.max(width / image.width, artHeight / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  ctx.drawImage(image, (width - drawWidth) / 2, (artHeight - drawHeight) / 2, drawWidth, drawHeight);
  ctx.fillStyle = "#17151b";
  ctx.fillRect(0, artHeight, width, footer);
  ctx.fillStyle = "#fffdf8";
  ctx.font = "700 28px Georgia, 'Times New Roman', serif";
  ctx.fillText(truncate(input.title, 28), 28, artHeight + 48);
  ctx.font = "600 16px ui-sans-serif, system-ui, sans-serif";
  ctx.fillStyle = "#c7b4ff";
  ctx.fillText(input.artistName, 28, artHeight + 78);
  const marks = [input.drawnOnArya ? "Drawn on Arya" : null, input.humanMade ? "Human-made" : null].filter(Boolean).join("  ·  ");
  ctx.fillStyle = "#8b8794";
  ctx.font = "600 13px ui-sans-serif, system-ui, sans-serif";
  ctx.fillText(marks || "Arya Art", 28, artHeight + 106);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
  if (!blob) throw new Error("Could not export the share card.");
  return blob;
}

function truncate(value: string, max: number) {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not load the artwork for a share card."));
    image.src = src;
  });
}

export function ArtworkShareActions({
  title,
  artistName,
  imageSrc,
  drawnOnArya,
  humanMade,
  onCopied,
  onDownloaded,
}: {
  title: string;
  artistName: string;
  imageSrc: string;
  drawnOnArya: boolean;
  humanMade: boolean;
  onCopied?: () => void;
  onDownloaded?: () => void;
}) {
  const [status, setStatus] = useState<string | null>(null);
  const share = async (mode: "download" | "copy") => {
    try {
      const blob = await renderShareCard({ imageSrc, title, artistName, drawnOnArya, humanMade });
      if (mode === "download") {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 28) || "arya"}-share.jpg`;
        link.click();
        URL.revokeObjectURL(url);
        onDownloaded?.();
        setStatus("Share card downloaded.");
        return;
      }
      try {
        await navigator.clipboard.write([new ClipboardItem({ "image/jpeg": blob })]);
        onCopied?.();
        setStatus("Share card copied.");
      } catch {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "arya-share.jpg";
        link.click();
        URL.revokeObjectURL(url);
        onDownloaded?.();
        setStatus("Share card downloaded.");
      }
    } catch {
      setStatus("Could not build a share card from this file.");
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    onCopied?.();
    setStatus("Link copied.");
  };

  return (
    <div className="mt-4 space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => void share("copy")}><Copy size={16} /> Copy share card</Button>
        <Button variant="ghost" onClick={() => void share("download")}><DownloadSimple size={16} /> Download card</Button>
        <Button variant="ghost" onClick={() => void copyLink()}><LinkSimple size={16} /> Copy link</Button>
      </div>
      {status && <p className="text-xs font-semibold text-plum" role="status">{status}</p>}
    </div>
  );
}
