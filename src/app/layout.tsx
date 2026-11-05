import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { DemoProvider } from "@/features/demo/demo-provider";
import { PublishedProvider } from "@/features/published/published-provider";

export const metadata: Metadata = {
  title: {
    default: "Arya Art — Find art that feels like you",
    template: "%s — Arya Art",
  },
  description: "Discover independent artists and commission something personal.",
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#fbfaf7",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="font-[family-name:var(--font-sans)] antialiased">
        <DemoProvider><PublishedProvider><AppShell>{children}</AppShell></PublishedProvider></DemoProvider>
      </body>
    </html>
  );
}
