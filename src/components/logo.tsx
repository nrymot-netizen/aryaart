import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-2" aria-label="Arya Art home">
      <span className="grid size-9 place-items-center rounded-full bg-ink text-lg text-white transition-transform group-hover:-rotate-6">✦</span>
      <span className="text-xl font-bold tracking-[-0.04em]">arya<span className="font-[family-name:var(--font-display)] font-normal italic text-plum">art</span></span>
    </Link>
  );
}
