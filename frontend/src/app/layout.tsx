import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "SkillSwap — Peer-to-Peer Skill Exchange",
  description: "Trade knowledge, not money. Connect with peers to teach what you know and learn what you love.",
  openGraph: {
    title: "SkillSwap — Peer-to-Peer Skill Exchange",
    description: "Trade knowledge, not money. Connect with peers to teach what you know and learn what you love.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-canvas-light dark:bg-canvas-dark text-foreground-light dark:text-foreground-dark selection:bg-apple-blue/20 selection:text-apple-blue">
        <Providers>
          <Navbar />
          <main className="flex-1 pb-20 md:pb-12">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
