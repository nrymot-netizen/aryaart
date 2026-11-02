import type { Icon } from "@phosphor-icons/react";
import Link from "next/link";
import { Button } from "./button";

export function EmptyState({ icon: Icon, title, description, action }: { icon: Icon; title: string; description: string; action?: { label: string; onClick?: () => void; href?: string } }) {
  return (
    <div className="rounded-4xl border border-dashed border-black/15 bg-white px-6 py-14 text-center">
      <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-mist text-plum"><Icon size={25} /></span>
      <h2 className="mt-4 text-lg font-bold">{title}</h2>
      <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-black/50">{description}</p>
      {action?.href ? (
        <Link href={action.href} className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-ink px-5 text-sm font-bold text-white">{action.label}</Link>
      ) : action ? (
        <Button className="mt-5" onClick={action.onClick}>{action.label}</Button>
      ) : null}
    </div>
  );
}
