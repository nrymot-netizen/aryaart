"use client";

import Link from "next/link";
import { useDemo } from "@/features/demo/demo-provider";
import { PageIntro } from "@/components/page-intro";
import { EmptyState } from "@/components/ui/empty-state";
import { Bell } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

export default function NotificationsPage() {
  const { state, persona, dispatch } = useDemo();
  const items = state.notifications.filter((item) => item.profileId === persona.id || item.profileId === persona.artistId);

  return (
    <>
      <PageIntro eyebrow="Stay in the loop" title="Notifications" description="Every ping links to the next action. Nothing here is an open DM." />
      <div className="mx-auto max-w-3xl px-4 pb-20 sm:px-6">
        {items.length > 0 && <Button variant="ghost" className="mb-4" onClick={() => dispatch({ type: "mark-read" })}>Mark all read</Button>}
        {items.length === 0 ? <EmptyState icon={Bell} title="You’re caught up" description="Request activity, waitlist movement, and parent approvals will land here." /> : (
          <div className="space-y-2">
            {items.map((item) => (
              <Link key={item.id} href={item.href} onClick={() => dispatch({ type: "mark-read", id: item.id })} className={`block rounded-3xl border p-5 ${item.read ? "border-transparent bg-white/60" : "border-black/[0.07] bg-white"}`}>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-plum">{item.type}</p>
                <h2 className="mt-1 font-bold">{item.title}</h2>
                <p className="mt-1 text-sm text-black/55">{item.detail}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
