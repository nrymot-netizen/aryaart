"use client";

import { Star } from "@phosphor-icons/react";
import { getArtistReviews } from "@/data/mock-data";
import { useDemo } from "@/features/demo/demo-provider";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export function ReviewList({ artistId }: { artistId: string }) {
  const { state, dispatch } = useDemo();
  const hidden = new Set(state.hiddenReviewIds);
  const items = [...getArtistReviews(artistId), ...state.createdReviews.filter((review) => review.artistId === artistId)].filter((review) => !hidden.has(review.id));
  if (!items.length) return <EmptyState icon={Star} title="No reviews yet" description="Reviews appear after a completed commission." />;
  return (
    <div className="space-y-4">
      {items.map((review) => (
        <article key={review.id} className="rounded-3xl border border-black/[0.07] bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <strong>{review.author}</strong>
            <span className="flex items-center gap-1 text-sm font-bold"><Star size={14} weight="fill" className="text-amber-400" />{review.rating}</span>
          </div>
          <p className="mt-1 text-xs text-black/45">{review.serviceTitle} · {formatDate(review.createdAt)}</p>
          <p className="mt-3 leading-7 text-black/70">{review.body}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="ghost" className="min-h-9 px-4 py-1 text-xs" onClick={() => dispatch({ type: "report-review", reviewId: review.id })}>Report</Button>
            <Button variant="ghost" className="min-h-9 px-4 py-1 text-xs" onClick={() => dispatch({ type: "hide-review", reviewId: review.id })}>Hide</Button>
          </div>
        </article>
      ))}
    </div>
  );
}
