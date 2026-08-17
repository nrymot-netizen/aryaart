import type { Icon } from "@phosphor-icons/react";
import { Button } from "./button";

export function EmptyState({ icon: Icon, title, description, action }: { icon: Icon; title: string; description: string; action?: { label: string; onClick: () => void } }) {
  return <div className="rounded-4xl border border-dashed border-black/15 bg-white px-6 py-14 text-center"><span className="mx-auto grid size-12 place-items-center rounded-2xl bg-mist text-plum"><Icon size={25} /></span><h2 className="mt-4 text-lg font-bold">{title}</h2><p className="mx-auto mt-1 max-w-md text-sm leading-6 text-black/50">{description}</p>{action && <Button className="mt-5" onClick={action.onClick}>{action.label}</Button>}</div>;
}
