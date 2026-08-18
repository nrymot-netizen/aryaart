"use client";

import { EmptyState } from "@/components/ui/empty-state";
import { Warning } from "@phosphor-icons/react";

export default function ErrorState({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24">
      <EmptyState icon={Warning} title="Something went sideways" description={error.message || "Please try again. Your demo saves are still on this device."} action={{ label: "Try again", onClick: reset }} />
    </div>
  );
}
