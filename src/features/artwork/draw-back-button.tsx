"use client";

import Link from "next/link";
import { PencilSimple } from "@phosphor-icons/react";
import { useDemo } from "@/features/demo/demo-provider";
import { drawBackHref } from "@/lib/domain/draw-back";

export function DrawBackButton({ artworkId, className = "" }: { artworkId: string; className?: string }) {
  const { dispatch } = useDemo();
  return (
    <Link
      href={drawBackHref(artworkId)}
      onClick={() => dispatch({ type: "track-event", name: "draw_back_started", payload: { artworkId } })}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-bold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum ${className}`}
    >
      <PencilSimple size={16} weight="bold" />
      Draw back
    </Link>
  );
}
