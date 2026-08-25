"use client";

import Image from "next/image";
import { isInlineArtworkSrc } from "@/lib/domain/canvas";

export function ArtworkMedia({
  src,
  alt,
  width,
  height,
  priority = false,
  className = "",
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
}) {
  if (isInlineArtworkSrc(src)) {
    return <img src={src} alt={alt} width={width} height={height} className={className} />;
  }
  return <Image src={src} alt={alt} width={width} height={height} priority={priority} className={className} />;
}
