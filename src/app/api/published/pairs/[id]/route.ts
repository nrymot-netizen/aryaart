import { NextResponse } from "next/server";
import { publishedStoreConfigured } from "@/lib/published/config";
import { getPublishedStore } from "@/lib/published/store";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!publishedStoreConfigured()) {
    return NextResponse.json({ configured: false, pair: null }, { status: 404 });
  }
  try {
    const bundle = await getPublishedStore().getPair(id);
    if (!bundle) return NextResponse.json({ configured: true, pair: null }, { status: 404 });
    return NextResponse.json({ configured: true, ...bundle });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not load that pair." }, { status: 500 });
  }
}
