import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Star } from "@phosphor-icons/react/dist/ssr";
import type { Artist } from "@/types";
import { StatusPill } from "./status-pill";

export function ArtistCard({ artist }: { artist: Artist }) {
  return (
    <Link href={`/artists/${artist.id}`} className="group min-w-[270px] rounded-3xl border border-black/[0.07] bg-white p-4 transition hover:-translate-y-1 hover:shadow-card sm:min-w-0">
      <div className="flex items-start gap-3"><Image src={artist.avatar} alt="" width={56} height={56} className="size-14 rounded-2xl object-cover" /><div className="min-w-0 flex-1"><div className="flex items-center gap-1"><h3 className="truncate font-bold">@{artist.username}</h3>{artist.accountType === "protected-teen" && <ShieldCheck size={16} weight="fill" className="shrink-0 text-plum" />}</div><p className="mt-0.5 truncate text-sm text-black/55">{artist.specialty}</p></div></div>
      <div className="mt-5 flex items-center justify-between"><StatusPill status={artist.availability} slots={artist.slots} /><span className="flex items-center gap-1 text-sm font-bold"><Star size={15} weight="fill" className="text-amber-400" />{artist.rating}</span></div>
      <div className="mt-4 border-t border-black/[0.07] pt-3 text-sm"><span className="text-black/45">Commissions from </span><span className="font-bold">${artist.startingPrice}</span></div>
    </Link>
  );
}
