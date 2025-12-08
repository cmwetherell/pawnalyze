import type { Metadata } from "next";
import { Bricolage_Grotesque, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import localFont from "next/font/local";
import { siteConfig } from "@/config/site";
import { Viewport } from "next";
import { cn } from "@/lib/utils";
import { Analytics } from "@vercel/analytics/react";
import { GoogleAnalytics } from "@next/third-parties/google";
import Footer from "@/components/Footer";

const fontBody = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

const fontDisplay = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-display",
});

const fontHeading = localFont({
  src: "../assets/fonts/CalSans-SemiBold.woff2",
  variable: "--font-heading",
});

interface RootLayoutProps {
  children: React.ReactNode;
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
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
    // apple: [
    //   {
    //     url: "/apple-touch-icon.png",
    //     sizes: "180x180",
    //   },
    // ],
  },
  manifest: `${siteConfig.url}/site.webmanifest`,
  metadataBase: new URL(siteConfig.metadataBase),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-ink text-sand antialiased relative overflow-x-hidden",
          fontBody.variable,
          fontDisplay.variable,
          fontHeading.variable
        )}
      >
        <div className="ambient-grid" aria-hidden="true" />
        <div className="noise-layer" aria-hidden="true" />
        <div className="glow-orb glow-orb--amber top-[-10%] left-[-5%]" aria-hidden="true" />
        <div className="glow-orb glow-orb--mint bottom-[-15%] right-[-10%]" aria-hidden="true" />
        <Analytics />
        <GoogleAnalytics gaId="G-59WSL645R4" />
        <div className="relative z-10 flex min-h-screen flex-col">
          <Navbar />
          <div className="flex-1">{children}</div>
          <Footer />
        </div>
      </body>
    </html>
  );
}