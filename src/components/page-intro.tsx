export function PageIntro({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-24"><p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-plum">{eyebrow}</p><h1 className="font-[family-name:var(--font-display)] text-5xl leading-none sm:text-7xl">{title}</h1><p className="mx-auto mt-5 max-w-xl text-base leading-7 text-black/55 sm:text-lg">{description}</p></div>;
}
