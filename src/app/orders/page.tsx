"use client";

import { Receipt } from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";
import { artists, getService } from "@/data/mock-data";
import { useDemo } from "@/features/demo/demo-provider";
import { orderStatusLabel } from "@/lib/domain/orders";
import { EmptyState } from "@/components/ui/empty-state";
import { PageIntro } from "@/components/page-intro";

export default function OrdersPage() {
  const { state, persona } = useDemo();
  const [filter, setFilter] = useState<"all" | "active" | "done">("all");
  const mine = state.orders.filter((order) => {
    if (persona.role === "artist") return order.artistId === persona.artistId;
    if (persona.role === "parent-preview") return order.parentApprovalRequired;
    return order.buyerId === persona.id;
  });
  const visible = mine.filter((order) => {
    if (filter === "active") return !["completed", "declined", "cancelled"].includes(order.status);
    if (filter === "done") return ["completed", "declined", "cancelled"].includes(order.status);
    return true;
  });

  return (
    <>
      <PageIntro eyebrow={persona.role === "artist" ? "Incoming & active" : "Your commissions"} title="Orders" description="Requests, active projects, files, and history — one workspace per commission, never an open inbox." />
      <div className="mx-auto max-w-4xl px-4 pb-20 sm:px-6">
        <div className="mb-5 flex gap-2">
          {(["all", "active", "done"] as const).map((item) => <button key={item} onClick={() => setFilter(item)} className={`rounded-full px-4 py-2 text-sm font-semibold ${filter === item ? "bg-ink text-white" : "bg-white"}`}>{item}</button>)}
        </div>
        {visible.length === 0 ? (
          <EmptyState icon={Receipt} title="No orders in this view" description="Request a LunaLines portrait to walk the full demo, or switch personas to see the other side." action={{ label: "Request LunaLines", onClick: () => { window.location.href = "/commissions/anime-portrait/request"; } }} />
        ) : (
          <div className="space-y-3">
            {visible.map((order) => {
              const artist = artists.find((item) => item.id === order.artistId);
              const service = getService(order.serviceId);
              return (
                <Link key={order.id} href={order.status === "payment-required" && persona.role === "buyer" ? `/checkout/${order.id}` : `/orders/${order.id}`} className="block rounded-3xl border border-black/[0.07] bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-card">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-plum">{orderStatusLabel[order.status]}</p>
                      <h2 className="mt-1 text-lg font-bold">{service?.title ?? "Commission"}</h2>
                      <p className="text-sm text-black/50">@{artist?.username} · ${order.price}</p>
                    </div>
                    <span className="text-sm font-bold text-plum">Open →</span>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm text-black/60">{order.brief}</p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
