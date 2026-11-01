import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { DemoProvider } from "@/features/demo/demo-provider";

export const metadata: Metadata = {
  title: "Arya Art — Find art that feels like you",
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
    <html lang="en">
      <body className="font-[family-name:var(--font-sans)] antialiased">
        <DemoProvider><AppShell>{children}</AppShell></DemoProvider>
      </body>
    </html>
  );
}
