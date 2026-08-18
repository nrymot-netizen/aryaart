import { EmptyState } from "@/components/ui/empty-state";
import { Compass } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24">
      <EmptyState icon={Compass} title="We couldn’t find that page" description="The artwork, artist, or service may have moved. Head back to Discover and search from there." />
      <p className="mt-6 text-center"><Link href="/" className="font-bold text-plum">Return to Discover</Link></p>
    </div>
  );
}
