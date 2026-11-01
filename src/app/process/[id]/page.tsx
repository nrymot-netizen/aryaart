import type { Metadata } from "next";
import { ProcessStoryBody } from "@/features/process/process-story-body";

export const metadata: Metadata = {
  title: "Sketch to final",
};

export default function ProcessStoryPage() {
  return <ProcessStoryBody />;
}
