"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, BookmarkSimple, Compass, GearSix, PaintBrush, Receipt, Sparkle, Storefront } from "@phosphor-icons/react";
import { Logo } from "./logo";
import { PersonaSwitcher } from "@/features/demo/persona-switcher";
import { useDemo } from "@/features/demo/demo-provider";
import { AgeAttestation } from "@/features/safety/age-attestation";

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
  const drawingMode = pathname.startsWith("/create/draw") || pathname.includes("/draw");
  return (
    <>
      <header className={`sticky top-0 z-40 border-b border-black/5 bg-paper/90 pt-[env(safe-area-inset-top)] backdrop-blur-xl ${drawingMode ? "h-auto" : ""}`}>
        <div className={`mx-auto flex items-center justify-between px-3 sm:px-6 lg:px-10 ${drawingMode ? "h-12" : "h-16"} max-w-[1480px]`}>
          <Logo />
          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
            {nav.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return <Link key={item.href} href={item.href} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${active ? "bg-ink text-white" : "text-black/60 hover:bg-black/5 hover:text-ink"}`}>{item.label}</Link>;
            })}
          </nav>
          <div className="flex items-center gap-1 sm:gap-2">
            <Link href="/saved" className={`${drawingMode ? "hidden sm:grid" : "grid"} relative size-10 place-items-center rounded-full hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-plum ${pathname.startsWith("/saved") ? "bg-black/5 text-plum" : ""}`} aria-label="Saved artwork and artists"><BookmarkSimple size={21} weight={pathname.startsWith("/saved") ? "fill" : "regular"} /></Link>
            <Link href="/notifications" className={`${drawingMode ? "hidden sm:grid" : "grid"} relative size-10 place-items-center rounded-full hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-plum ${pathname.startsWith("/notifications") ? "bg-black/5 text-plum" : ""}`} aria-label="Notifications"><Bell size={21} />{unreadCount > 0 && <span className="absolute right-2 top-2 size-2 rounded-full bg-coral ring-2 ring-paper" />}</Link>
            <Link href="/settings" className={`${drawingMode ? "hidden sm:grid" : "grid"} relative size-10 place-items-center rounded-full hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-plum ${pathname.startsWith("/settings") ? "bg-black/5 text-plum" : ""}`} aria-label="Safety settings"><GearSix size={21} weight={pathname.startsWith("/settings") ? "fill" : "regular"} /></Link>
            <PersonaSwitcher />
          </div>
        </div>
      </header>
      <main className={`min-w-0 min-h-[calc(100dvh-4rem)] ${drawingMode ? "pb-[max(0.75rem,env(safe-area-inset-bottom))]" : "pb-[calc(5.75rem+env(safe-area-inset-bottom))] md:pb-10"}`}>{children}</main>
      {!drawingMode && (
      <nav className="fixed inset-x-0 bottom-0 z-50 flex items-start justify-around border-t border-black/10 bg-paper/95 px-1 pt-2 backdrop-blur-xl md:hidden" style={{ paddingBottom: "max(0.65rem, env(safe-area-inset-bottom))" }} aria-label="Mobile navigation">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return <Link key={item.href} href={item.href} className={`flex min-h-11 min-w-12 flex-col items-center gap-0.5 rounded-xl px-1.5 py-1 text-[10px] font-semibold sm:min-w-14 sm:text-[11px] ${active ? "text-plum" : "text-black/45"}`}><Icon size={22} weight={active ? "fill" : "regular"} />{item.label}</Link>;
        })}
      </nav>
      )}
      <AgeAttestation />
    </>
  );
}
