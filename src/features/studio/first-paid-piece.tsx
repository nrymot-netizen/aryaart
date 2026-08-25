"use client";

import { useEffect } from "react";
import Link from "next/link";
import { getService } from "@/data/mock-data";
import { useDemo } from "@/features/demo/demo-provider";
import { buyerDisplayName, firstPaidPiece } from "@/lib/domain/identity";

export function FirstPaidPieceCard({ artistId }: { artistId: string }) {
  const { state, dispatch } = useDemo();
  const order = firstPaidPiece(state.orders, artistId);
  const orderId = order?.id;
  useEffect(() => {
    if (!orderId) return;
    dispatch({ type: "track-event", name: "first_paid_piece_viewed", payload: { orderId } });
  }, [dispatch, orderId]);
  if (!order) return null;
  const service = getService(order.serviceId);
  return (
    <section className="rounded-4xl border border-plum/20 bg-white p-5 lg:col-span-2">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-plum">First paid piece</p>
      <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl">{service?.title ?? "Commission"}</h2>
      <p className="mt-2 text-sm text-black/60">
        {buyerDisplayName(order.buyerId)} paid ${order.price} in demo currency. The files went to the buyer. You keep the copyright.
      </p>
      <Link href={`/orders/${order.id}`} className="mt-4 inline-flex min-h-11 items-center rounded-full bg-plum px-5 text-sm font-bold text-white">
        Open the order
      </Link>
    </section>
  );
}
