"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { getArtist, getService } from "@/data/mock-data";
import { DrawingStudio, type DrawingStudioHandle } from "@/features/canvas/drawing-studio";
import { useDemo } from "@/features/demo/demo-provider";
import { drawingToDemoFile } from "@/lib/domain/canvas";
import { createDraftId, drawingDraftFor } from "@/lib/domain/drawing-drafts";
import { Button } from "@/components/ui/button";
import { LicenseNotice } from "@/features/license/license-notice";

export default function OrderDrawPage() {
  return <Suspense fallback={<div className="px-4 py-16 text-sm text-black/50">Loading the canvas…</div>}><OrderDrawForm /></Suspense>;
}

function OrderDrawForm() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const { state, persona, dispatch, hydrated } = useDemo();
  const studioRef = useRef<DrawingStudioHandle>(null);
  const order = state.orders.find((item) => item.id === params.id);
  const kind = searchParams.get("kind") === "final" ? "final" : "sketch";
  const [error, setError] = useState<string | null>(null);
  const draftId = order ? createDraftId("order", `${order.id}-${kind}`) : "draft-order-unknown";
  const savedDraft = drawingDraftFor(state.drawingDrafts, draftId);

  const artist = order ? getArtist(order.artistId) : undefined;
  const service = order ? getService(order.serviceId) : undefined;
  const isArtist = Boolean(order && persona.role === "artist" && persona.artistId === order.artistId);
  const files = order ? state.files.filter((item) => item.orderId === order.id) : [];
  const previousSketch = files.filter((item) => item.kind === "sketch" && item.preview).at(-1)?.preview;
  const ghostImage = kind === "sketch" ? previousSketch : undefined;
  const initialImage = kind === "final" ? previousSketch : undefined;
  const title = useMemo(() => (kind === "final" ? "Final" : "Sketch"), [kind]);

  if (!hydrated) {
    return <div className="px-4 py-16 text-sm text-black/50">Loading the canvas…</div>;
  }

  if (!order) {
    return <div className="mx-auto max-w-3xl px-4 py-24 text-center"><h1 className="text-2xl font-bold">Order not found</h1><Link href="/orders" className="mt-4 inline-block font-bold text-plum">Back to orders</Link></div>;
  }

  if (!isArtist) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Switch to the artist on this order</h1>
        <p className="mt-2 text-black/50">Only @{artist?.username} can draw the {kind} for this commission.</p>
        <Link href={`/orders/${order.id}`} className="mt-4 inline-block font-bold text-plum">Back to workspace</Link>
      </div>
    );
  }

  if (order.status !== "in-progress") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">This order isn’t ready for a {kind}</h1>
        <p className="mt-2 text-black/50">Drawing opens when the commission is in progress.</p>
        <Link href={`/orders/${order.id}`} className="mt-4 inline-block font-bold text-plum">Back to workspace</Link>
      </div>
    );
  }

  return (
    <div className="px-3 py-4 sm:px-5">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link href={`/orders/${order.id}`} className="text-sm font-bold text-plum">← {service?.title ?? "Workspace"}</Link>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-4xl">{title} desk</h1>
        </div>
        <Button variant="ghost" onClick={() => history.back()}>Cancel</Button>
      </div>
      <DrawingStudio
        ref={studioRef}
        actionLabel={kind === "final" ? "Submit final" : "Submit sketch"}
        draftId={draftId}
        ghostImage={ghostImage}
        initialImage={savedDraft ? undefined : initialImage}
        initialDraft={savedDraft}
        onAutosave={(draft) => dispatch({ type: "save-drawing-draft", draft })}
        references={order.references.map((file) => ({ id: file.id, name: file.name, preview: file.preview }))}
        sidebarExtra={(
          <section className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-black/40">Brief</h2>
            <p className="text-sm leading-6 text-black/70">{order.brief}</p>
            <p className="text-xs text-black/45">Due {order.deadline} · ${order.price}</p>
            <LicenseNotice intendedUse={order.intendedUse} artistName={artist?.displayName ?? "The artist"} storedHeadline={order.termsSnapshot?.licenseSummary} compact />
            {error && <p className="text-sm font-semibold text-red-600" role="alert">{error}</p>}
          </section>
        )}
        onExport={(drawing) => {
          const file = drawingToDemoFile(drawing, kind, `${kind}.jpg`, new Date().toISOString());
          const result = dispatch({
            type: "artist-deliver",
            orderId: order.id,
            action: kind === "final" ? "submit-final" : "submit-sketch",
            file,
            processOps: drawing.ops ?? [],
            paperColor: drawing.paperColor,
          });
          if (result.error) setError(result.error);
          else dispatch({ type: "clear-drawing-draft", id: draftId });
        }}
      />
    </div>
  );
}
