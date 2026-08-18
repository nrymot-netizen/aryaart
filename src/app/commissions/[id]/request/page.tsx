import { notFound } from "next/navigation";
import { artists, getService } from "@/data/mock-data";
import { RequestWizard } from "@/features/commissions/request-wizard";

export default async function RequestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const service = getService(id);
  if (!service) notFound();
  const artist = artists.find((item) => item.id === service.artistId);
  if (!artist) notFound();
  return <RequestWizard service={service} artist={artist} />;
}
