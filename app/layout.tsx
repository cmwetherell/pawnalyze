import type { Metadata } from "next";
import { Playfair_Display, Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import { siteConfig } from "@/config/site";
import { Viewport } from "next";
import { cn } from "@/lib/utils";
import { Analytics } from "@vercel/analytics/react";
import { GoogleAnalytics } from "@next/third-parties/google";
import Footer from "@/components/Footer";

const fontDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const fontBody = Outfit({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

interface RootLayoutProps {
  children: React.ReactNode;
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0d0d10" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0d10" },
  ],
};

export const metadata: Metadata = {
  title: "Pawnalyze | Chess Analytics",
  description:
    "Advanced chess analytics with tournament predictions, interactive scenario explorer, and in-depth analysis. Discover, analyze, and predict with Pawnalyze.",
  keywords: ["Chess", "Chess Analytics", "Chess AI", "Chess Predictions", "Elo"],
  authors: [
    {
      name: "Caleb Wetherell",
      url: "https://github.com/cmwetherell",
    },
  ],
  creator: "Caleb Wetherell",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.pawnalyze.com",
    title: "Pawnalyze | Chess Analytics",
    description:
      "Advanced chess analytics with tournament predictions, interactive scenario explorer, and in-depth analysis. Discover, analyze, and predict with Pawnalyze.",
    siteName: siteConfig.name,
    images: [
      {
        url: "https://opengraph.b-cdn.net/production/documents/6250d357-0195-42a7-b47f-744756ea9b37.png?token=O1TzXLBYnJ3ucc_mviBU6ttPMd9uW-c2iKFJJ2b4VsU&height=1200&width=1200&expires=33247948154",
        width: 1200,
        height: 1200,
        alt: "Pawnalyze | Chess Analytics",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@pawnalyze",
    title: "Pawnalyze | Chess Analytics",
    description:
      "Advanced chess analytics with tournament predictions, interactive scenario explorer, and in-depth analysis. Discover, analyze, and predict with Pawnalyze.",
    creator: "@pawnalyze",
    images: [
      "https://opengraph.b-cdn.net/production/documents/6250d357-0195-42a7-b47f-744756ea9b37.png?token=O1TzXLBYnJ3ucc_mviBU6ttPMd9uW-c2iKFJJ2b4VsU&height=1200&width=1200&expires=33247948154",
    ],
  },
  icons: {
    icon: "/favicon.ico",
  },
  manifest: `${siteConfig.url}/site.webmanifest`,
  metadataBase: new URL(siteConfig.metadataBase),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body
        className={cn(
          "min-h-screen bg-obsidian-950 font-body antialiased",
          fontDisplay.variable,
          fontBody.variable,
          fontMono.variable
        )}
      >
        <Analytics />
        <GoogleAnalytics gaId="G-59WSL645R4" />
        
        {/* Main Layout Container */}
        <div className="relative flex min-h-screen flex-col">
          {/* Background Effects */}
          <div className="fixed inset-0 -z-10">
            {/* Gradient Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-[600px] bg-gradient-to-b from-amber-400/[0.07] via-amber-500/[0.03] to-transparent blur-3xl" />
            {/* Subtle Grid Pattern */}
            <div 
              className="absolute inset-0 opacity-[0.02]"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(251, 191, 36, 0.3) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(251, 191, 36, 0.3) 1px, transparent 1px)
                `,
                backgroundSize: '60px 60px',
              }}
            />
          </div>
          
          <Navbar />
          
          <main className="flex-1">
            {children}
          </main>
          
          <Footer />
        </div>
      </body>
    </html>
  );
}
