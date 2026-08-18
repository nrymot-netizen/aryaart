"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { getArtist, getService } from "@/data/mock-data";
import { useDemo } from "@/features/demo/demo-provider";
import { Button } from "@/components/ui/button";
import { ProtectedAccountNotice } from "@/components/safety/protected-account-notice";

export default function CheckoutPage() {
  const params = useParams<{ orderId: string }>();
  const { state, persona, dispatch } = useDemo();
  const order = state.orders.find((item) => item.id === params.orderId);
  if (!order) return <div className="px-4 py-24 text-center">Checkout not found.</div>;
  const artist = getArtist(order.artistId);
  const service = getService(order.serviceId);
  const pending = state.parentApprovals.find((item) => item.orderId === order.id && item.status === "pending");

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
      <Link href={`/orders/${order.id}`} className="text-sm font-bold text-plum">← Order</Link>
      <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-coral">Simulated checkout</p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-5xl">Pay in demo mode</h1>
      <p className="mt-3 text-black/55">No real card is collected. This records a simulated payment and opens the workspace.</p>
      <div className="mt-8 space-y-3 rounded-4xl border border-black/[0.07] bg-white p-6 text-sm">
        <p className="flex justify-between"><span>Artist</span><strong>@{artist?.username}</strong></p>
        <p className="flex justify-between"><span>Service</span><strong>{service?.title}</strong></p>
        <p className="flex justify-between"><span>Accepted price</span><strong>${order.price}</strong></p>
        <p className="flex justify-between"><span>Deadline</span><strong>{order.deadline}</strong></p>
        <p className="flex justify-between"><span>Usage</span><strong>{order.intendedUse}</strong></p>
        <p className="flex justify-between"><span>Revisions</span><strong>{order.revisionLimit}</strong></p>
      </div>
      <div className="mt-5 rounded-3xl bg-mist p-4 text-sm">Demo payment method · Arya sandbox · **** 0000</div>
      {persona.accountType === "protected-teen" && <div className="mt-4"><ProtectedAccountNotice /></div>}
      {pending && persona.role === "parent-preview" && <Button className="mt-6 w-full" onClick={() => dispatch({ type: "parent-approve", approvalId: pending.id })}>Approve as parent</Button>}
      <Button className="mt-6 w-full" onClick={() => dispatch({ type: "buyer-respond", orderId: order.id, action: "complete-checkout" })} disabled={persona.id !== order.buyerId || order.status !== "payment-required"}>Complete demo checkout</Button>
    </div>
  );
}
