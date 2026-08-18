"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, BookmarkSimple, Compass, PaintBrush, Receipt, Sparkle, Storefront } from "@phosphor-icons/react";
import { Logo } from "./logo";
import { PersonaSwitcher } from "@/features/demo/persona-switcher";
import { useDemo } from "@/features/demo/demo-provider";

const nav = [
  { label: "Discover", href: "/", icon: Compass },
  { label: "Commissions", href: "/commissions", icon: Sparkle },
  { label: "Create", href: "/create", icon: PaintBrush },
  { label: "Orders", href: "/orders", icon: Receipt },
  { label: "Studio", href: "/studio", icon: Storefront },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { unreadCount } = useDemo();
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-black/5 bg-paper/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1480px] items-center justify-between px-4 sm:px-6 lg:px-10">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
            {nav.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return <Link key={item.href} href={item.href} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${active ? "bg-ink text-white" : "text-black/60 hover:bg-black/5 hover:text-ink"}`}>{item.label}</Link>;
            })}
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/saved" className={`relative grid size-10 place-items-center rounded-full hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-plum ${pathname.startsWith("/saved") ? "bg-black/5 text-plum" : ""}`} aria-label="Saved artwork and artists"><BookmarkSimple size={21} weight={pathname.startsWith("/saved") ? "fill" : "regular"} /></Link>
            <Link href="/notifications" className={`relative grid size-10 place-items-center rounded-full hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-plum ${pathname.startsWith("/notifications") ? "bg-black/5 text-plum" : ""}`} aria-label="Notifications"><Bell size={21} />{unreadCount > 0 && <span className="absolute right-2 top-2 size-2 rounded-full bg-coral ring-2 ring-paper" />}</Link>
            <PersonaSwitcher />
          </div>
        </div>
      </header>
      <main className="min-h-[calc(100vh-4rem)] pb-24 md:pb-10">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-50 flex h-[74px] items-start justify-around border-t border-black/10 bg-paper/95 px-2 pt-2 backdrop-blur-xl md:hidden" aria-label="Mobile navigation">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return <Link key={item.href} href={item.href} className={`flex min-w-14 flex-col items-center gap-1 rounded-xl px-2 py-1 text-[11px] font-semibold ${active ? "text-plum" : "text-black/45"}`}><Icon size={23} weight={active ? "fill" : "regular"} />{item.label}</Link>;
        })}
      </nav>
    </>
  );
}
