"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getArtist, getService } from "@/data/mock-data";
import { useDemo } from "@/features/demo/demo-provider";
import { getWorkspaceNextAction, orderStatusLabel, remainingRevisions } from "@/lib/domain/orders";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/form-field";
import { ProtectedAccountNotice } from "@/components/safety/protected-account-notice";
import { Dialog, DialogActions } from "@/components/ui/dialog";
import type { DemoFile } from "@/types";

const tabs = ["Messages", "Files", "Timeline", "Details"] as const;

export default function OrderWorkspacePage() {
  const params = useParams<{ id: string }>();
  const { state, persona, dispatch } = useDemo();
  const order = state.orders.find((item) => item.id === params.id);
  const [tab, setTab] = useState<(typeof tabs)[number]>("Messages");
  const [message, setMessage] = useState("");
  const [blocked, setBlocked] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [review, setReview] = useState({ rating: 5, body: "" });
  const [dialog, setDialog] = useState<"accept" | "counter" | "decline" | null>(null);
  const [counter, setCounter] = useState({ price: order?.estimatedPrice ?? 0, deadline: order?.deadline ?? "", revisions: order?.revisionLimit ?? 2, notes: "", reason: "Scope is larger than the original brief." });
  const [decline, setDecline] = useState({ reason: "Schedule is full", note: "" });

  if (!order) return <div className="mx-auto max-w-3xl px-4 py-24 text-center"><h1 className="text-2xl font-bold">Order not found</h1><Link href="/orders" className="mt-4 inline-block font-bold text-plum">Back to orders</Link></div>;

  const artist = getArtist(order.artistId);
  const service = getService(order.serviceId);
  const isArtist = persona.role === "artist" && persona.artistId === order.artistId;
  const isBuyer = persona.id === order.buyerId;
  const participant = isArtist || isBuyer || persona.role === "parent-preview";
  const next = getWorkspaceNextAction(order.status, persona.role);
  const messages = state.messages.filter((item) => item.orderId === order.id);
  const files = [...order.references, ...state.files.filter((item) => item.orderId === order.id)];
  const milestones = state.milestones.filter((item) => item.orderId === order.id);
  const events = state.timeline.filter((item) => item.orderId === order.id);
  const protectedAccount = artist?.accountType === "protected-teen" || persona.accountType === "protected-teen";

  if (!participant) {
    return <div className="mx-auto max-w-3xl px-4 py-24 text-center"><h1 className="text-2xl font-bold">This workspace is private</h1><p className="mt-2 text-black/50">Only the buyer and artist on this order can enter.</p></div>;
  }

  const send = () => {
    const result = dispatch({ type: "send-message", orderId: order.id, body: message, protectedAccount });
    if (result.error) setBlocked(result.error);
    else { setMessage(""); setBlocked(null); }
  };

  const upload = (kind: "sketch" | "final", fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file) return;
    const demoFile: DemoFile = { id: `${kind}-${file.name}`, orderId: order.id, name: file.name, type: file.type, size: file.size, kind, preview: URL.createObjectURL(file), createdAt: new Date().toISOString() };
    dispatch({ type: "artist-deliver", orderId: order.id, action: kind === "sketch" ? "submit-sketch" : "submit-final", file: demoFile });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Link href="/orders" className="text-sm font-bold text-plum">← Orders</Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-plum">{orderStatusLabel[order.status]}</p>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-4xl sm:text-5xl">{service?.title ?? "Commission"}</h1>
          <p className="mt-2 text-black/55">@{artist?.username} · ${order.price} · {remainingRevisions(order.revisionLimit, order.revisionsUsed)} revisions left</p>
        </div>
        {order.status === "payment-required" && isBuyer && <Link href={`/checkout/${order.id}`} className="rounded-full bg-plum px-5 py-3 text-sm font-bold text-white">Go to checkout</Link>}
      </div>

      {next && <div className="mt-6 rounded-3xl bg-ink px-5 py-4 text-white"><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#c7b4ff]">Next required action</p><p className="mt-1 text-lg font-bold">{next.title}</p><p className="text-sm text-white/70">{next.detail}</p></div>}
      {protectedAccount && <div className="mt-4"><ProtectedAccountNotice compact /></div>}

      {isArtist && order.status === "awaiting-artist" && (
        <div className="mt-5 flex flex-wrap gap-2">
          <Button onClick={() => setDialog("accept")}>Accept</Button>
          <Button variant="secondary" onClick={() => setDialog("counter")}>Counter</Button>
          <Button variant="danger" onClick={() => setDialog("decline")}>Decline</Button>
        </div>
      )}
      {isBuyer && order.status === "counteroffer" && order.counter && (
        <div className="mt-5 rounded-3xl bg-white p-5">
          <p className="font-bold">Counteroffer · ${order.counter.price} · {order.counter.deadline} · {order.counter.revisions} revisions</p>
          <p className="mt-2 text-sm text-black/60">{order.counter.reason} {order.counter.notes}</p>
          <div className="mt-4 flex gap-2"><Button onClick={() => dispatch({ type: "buyer-respond", orderId: order.id, action: "accept-counter" })}>Accept terms</Button><Button variant="ghost" onClick={() => dispatch({ type: "buyer-respond", orderId: order.id, action: "reject-counter" })}>Reject</Button></div>
        </div>
      )}
      {isArtist && order.status === "in-progress" && (
        <div className="mt-5 flex flex-wrap gap-3">
          <label className="inline-flex min-h-11 cursor-pointer items-center rounded-full bg-plum px-5 text-sm font-bold text-white">Upload sketch<input type="file" accept="image/*" className="sr-only" onChange={(event) => upload("sketch", event.target.files)} /></label>
          <label className="inline-flex min-h-11 cursor-pointer items-center rounded-full border border-black/10 bg-white px-5 text-sm font-bold">Upload final<input type="file" accept="image/*" className="sr-only" onChange={(event) => upload("final", event.target.files)} /></label>
        </div>
      )}
      {isBuyer && order.status === "sketch-review" && (
        <div className="mt-5 space-y-3 rounded-3xl bg-white p-5">
          <p className="text-sm text-black/55">{remainingRevisions(order.revisionLimit, order.revisionsUsed)} revision{remainingRevisions(order.revisionLimit, order.revisionsUsed) === 1 ? "" : "s"} remaining</p>
          <Textarea value={feedback} onChange={(event) => setFeedback(event.target.value)} placeholder="What should change?" />
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => dispatch({ type: "buyer-respond", orderId: order.id, action: "approve-sketch" })}>Approve sketch</Button>
            <Button variant="ghost" onClick={() => dispatch({ type: "buyer-respond", orderId: order.id, action: "request-revision", feedback })}>Request revision</Button>
          </div>
        </div>
      )}
      {isBuyer && order.status === "final-review" && <div className="mt-5"><Button onClick={() => dispatch({ type: "buyer-respond", orderId: order.id, action: "accept-delivery" })}>Accept final delivery</Button></div>}
      {isBuyer && order.status === "completed" && !order.review && (
        <form className="mt-5 space-y-3 rounded-3xl bg-white p-5" onSubmit={(event) => { event.preventDefault(); dispatch({ type: "submit-review", orderId: order.id, rating: review.rating, body: review.body, serviceTitle: service?.title ?? "Commission" }); }}>
          <p className="font-bold">Leave a review</p>
          <input type="range" min={1} max={5} value={review.rating} onChange={(event) => setReview({ ...review, rating: Number(event.target.value) })} />
          <p className="text-sm">{review.rating} stars</p>
          <Textarea value={review.body} onChange={(event) => setReview({ ...review, body: event.target.value })} />
          <Button type="submit">Publish review</Button>
        </form>
      )}

      <div className="mt-8 flex gap-4 border-b border-black/10">{tabs.map((item) => <button key={item} onClick={() => setTab(item)} className={`border-b-2 py-3 text-sm font-bold ${tab === item ? "border-ink" : "border-transparent text-black/40"}`}>{item}</button>)}</div>
      <div className="mt-6 lg:hidden" />
      <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
        <div>
          {tab === "Messages" && (
            <div>
              <div className="space-y-3">
                {messages.map((item) => (
                  <div key={item.id} className={`rounded-3xl p-4 text-sm ${item.kind === "system" ? "bg-mist text-black/60" : item.moderationState === "blocked" ? "bg-red-50 text-red-700" : "bg-white"}`}>
                    <p className="text-xs font-bold uppercase tracking-[0.12em]">{item.kind === "system" ? "System" : item.senderId === "leo" || item.senderId === "luna" || item.senderId === "maya" || item.senderId === "nova" || item.senderId === "rose" ? "Artist" : "Buyer"}</p>
                    <p className="mt-1 leading-6">{item.moderationState === "blocked" ? "Message not sent. Sharing personal contact information is restricted for protected teen accounts." : item.body}</p>
                  </div>
                ))}
              </div>
              {(isBuyer || isArtist) && order.status !== "declined" && order.status !== "cancelled" && (
                <div className="mt-4">
                  <Textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Project-only message" />
                  {blocked && <p className="mt-2 text-sm font-semibold text-red-700" role="alert">{blocked}</p>}
                  <Button className="mt-3" onClick={send}>Send</Button>
                </div>
              )}
            </div>
          )}
          {tab === "Files" && (
            <ul className="grid gap-3 sm:grid-cols-2">{files.length ? files.map((file) => <li key={file.id} className="rounded-3xl bg-white p-4 text-sm"><p className="font-bold">{file.kind}</p><p>{file.name}</p>{file.preview && <img src={file.preview} alt="" className="mt-3 w-full rounded-2xl" />}</li>) : <p className="text-sm text-black/50">No files yet.</p>}</ul>
          )}
          {tab === "Timeline" && (
            <ol className="space-y-3">{events.map((item) => <li key={item.id} className="rounded-3xl bg-white p-4 text-sm"><p className="font-bold">{item.eventType}</p><p className="text-black/60">{item.detail}</p></li>)}</ol>
          )}
          {tab === "Details" && (
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-3xl bg-white p-4"><dt className="text-black/45">Brief</dt><dd className="mt-1">{order.brief}</dd></div>
              <div className="rounded-3xl bg-white p-4"><dt className="text-black/45">Use</dt><dd className="mt-1">{order.intendedUse}</dd></div>
              <div className="rounded-3xl bg-white p-4"><dt className="text-black/45">Deadline</dt><dd className="mt-1">{order.deadline}</dd></div>
              <div className="rounded-3xl bg-white p-4"><dt className="text-black/45">Accepted terms</dt><dd className="mt-1">{order.termsSnapshot ? `$${order.termsSnapshot.price} · ${order.termsSnapshot.revisions} revisions` : "Not locked yet"}</dd></div>
            </dl>
          )}
        </div>
        <aside>
          <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-black/40">Milestones</h2>
          <ol className="mt-3 space-y-2">{milestones.map((item) => <li key={item.id} className="flex items-center gap-2 text-sm"><span className={`size-2.5 rounded-full ${item.status === "complete" ? "bg-emerald-500" : item.status === "current" ? "bg-plum" : "bg-black/15"}`} />{item.type}</li>)}</ol>
        </aside>
      </div>

      <Dialog open={dialog === "accept"} title="Accept this request" onClose={() => setDialog(null)}>
        <p className="text-sm text-black/60">This locks the current estimate (${order.estimatedPrice}) and deadline ({order.deadline}).</p>
        <DialogActions><Button variant="ghost" onClick={() => setDialog(null)}>Cancel</Button><Button onClick={() => { dispatch({ type: "respond", orderId: order.id, action: "accept-request" }); setDialog(null); }}>Accept</Button></DialogActions>
      </Dialog>
      <Dialog open={dialog === "counter"} title="Send a counteroffer" onClose={() => setDialog(null)}>
        <div className="space-y-3 text-sm">
          <label className="block font-bold">Price<input className="mt-1 w-full rounded-2xl border border-black/10 px-3 py-2" type="number" value={counter.price} onChange={(event) => setCounter({ ...counter, price: Number(event.target.value) })} /></label>
          <label className="block font-bold">Deadline<input className="mt-1 w-full rounded-2xl border border-black/10 px-3 py-2" type="date" value={counter.deadline} onChange={(event) => setCounter({ ...counter, deadline: event.target.value })} /></label>
          <label className="block font-bold">Revisions<input className="mt-1 w-full rounded-2xl border border-black/10 px-3 py-2" type="number" value={counter.revisions} onChange={(event) => setCounter({ ...counter, revisions: Number(event.target.value) })} /></label>
          <label className="block font-bold">Reason<textarea className="mt-1 w-full rounded-2xl border border-black/10 px-3 py-2" value={counter.reason} onChange={(event) => setCounter({ ...counter, reason: event.target.value })} /></label>
        </div>
        <DialogActions><Button variant="ghost" onClick={() => setDialog(null)}>Cancel</Button><Button onClick={() => { dispatch({ type: "respond", orderId: order.id, action: "counter-request", counter }); setDialog(null); }}>Send counter</Button></DialogActions>
      </Dialog>
      <Dialog open={dialog === "decline"} title="Decline this request" onClose={() => setDialog(null)}>
        <label className="block text-sm font-bold">Private reason<input className="mt-1 w-full rounded-2xl border border-black/10 px-3 py-2" value={decline.reason} onChange={(event) => setDecline({ ...decline, reason: event.target.value })} /></label>
        <label className="mt-3 block text-sm font-bold">Note to buyer<textarea className="mt-1 w-full rounded-2xl border border-black/10 px-3 py-2" value={decline.note} onChange={(event) => setDecline({ ...decline, note: event.target.value })} /></label>
        <DialogActions><Button variant="ghost" onClick={() => setDialog(null)}>Cancel</Button><Button variant="danger" onClick={() => { dispatch({ type: "respond", orderId: order.id, action: "decline-request", decline }); setDialog(null); }}>Decline</Button></DialogActions>
      </Dialog>
    </div>
  );
}
