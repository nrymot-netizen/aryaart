"use client";

import { useEffect, useRef } from "react";
import { X } from "@phosphor-icons/react";
import { Button } from "./button";

export function Dialog({ open, title, children, onClose }: { open: boolean; title: string; children: React.ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (open && !node.open) node.showModal();
    if (!open && node.open) node.close();
  }, [open]);
  if (!open) return null;
  return (
    <dialog ref={ref} onClose={onClose} className="w-[min(100%-2rem,440px)] rounded-3xl border border-black/10 bg-paper p-0 shadow-card backdrop:bg-ink/40">
      <div className="flex items-start justify-between gap-3 px-5 pt-5">
        <h2 className="text-lg font-bold">{title}</h2>
        <button type="button" onClick={onClose} className="grid size-9 place-items-center rounded-full hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-plum" aria-label="Close"><X size={18} /></button>
      </div>
      <div className="px-5 pb-5 pt-3">{children}</div>
    </dialog>
  );
}

export function DialogActions({ children }: { children: React.ReactNode }) {
  return <div className="mt-5 flex justify-end gap-2">{children}</div>;
}

export { Button };
