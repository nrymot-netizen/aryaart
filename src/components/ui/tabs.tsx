import Link from "next/link";

export function TabNav({ items, active }: { items: { href: string; id: string; label: string }[]; active: string }) {
  return (
    <nav aria-label="Profile sections" className="sticky top-16 z-30 border-b border-black/5 bg-paper/95 backdrop-blur">
      <div className="no-scrollbar mx-auto flex max-w-6xl gap-7 overflow-x-auto px-4 sm:px-6">
        {items.map((item) => {
          const selected = item.id === active;
          return <Link key={item.id} href={item.href} scroll={false} aria-current={selected ? "page" : undefined} className={`whitespace-nowrap border-b-2 py-4 text-sm font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum ${selected ? "border-ink text-ink" : "border-transparent text-black/45 hover:text-ink"}`}>{item.label}</Link>;
        })}
      </div>
    </nav>
  );
}
