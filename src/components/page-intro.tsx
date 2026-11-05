export function PageIntro({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 text-center sm:px-6 sm:py-12">
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-plum">{eyebrow}</p>
      <h1 className="text-balance font-[family-name:var(--font-display)] text-[2rem] leading-[0.95] sm:text-5xl">{title}</h1>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-black/55 sm:mt-4 sm:text-base">{description}</p>
    </div>
  );
}
