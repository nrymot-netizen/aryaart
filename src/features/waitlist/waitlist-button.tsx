"use client";

import { useDemo } from "@/features/demo/demo-provider";
import { getWaitlistEntry, waitlistPositionLabel } from "@/lib/domain/waitlist";
import { Button } from "@/components/ui/button";

export function WaitlistButton({ artistId, serviceId }: { artistId: string; serviceId: string }) {
  const { state, persona, dispatch } = useDemo();
  const entry = getWaitlistEntry(state.waitlists, artistId, serviceId, persona.id);

  if (entry) {
    return (
      <div className="space-y-2">
        <p className="text-sm font-semibold text-plum" aria-live="polite">{waitlistPositionLabel(entry.position)}</p>
        <Button variant="ghost" className="w-full" onClick={() => dispatch({ type: "leave-waitlist", artistId, serviceId })}>Leave waitlist</Button>
      </div>
    );
  }

  return <Button className="w-full bg-plum hover:bg-[#5b35b5]" onClick={() => dispatch({ type: "join-waitlist", artistId, serviceId })}>Join waitlist</Button>;
}
