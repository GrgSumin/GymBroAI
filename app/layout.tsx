import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Manrope, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

import { cn } from "@/lib/utils";

const bodySans = Manrope({
  variable: "--font-display-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const headingSans = Space_Grotesk({
  variable: "--font-display-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-display-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "GymBroAI",
  description: "Personal AI fitness coaching with saved chat history.",
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body
          className={cn(
            bodySans.variable,
            headingSans.variable,
            mono.variable,
            "min-h-dvh bg-black text-zinc-100 antialiased"
          )}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
