import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/navbar";
import localFont from "next/font/local";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import { siteConfig } from "@/config/site";
import { Viewport } from "next";
import { cn } from "@/lib/utils";
import { Analytics } from "@vercel/analytics/react";
import { GoogleAnalytics } from "@next/third-parties/google";
import Footer from "@/components/Footer";

// Display font - Elegant serif for headings
const fontDisplay = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

// Body font - Clean, modern sans-serif
const fontBody = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

// Keep CalSans for brand elements
const fontHeading = localFont({
  src: "../assets/fonts/CalSans-SemiBold.woff2",
  variable: "--font-heading",
});

interface RootLayoutProps {
  children: React.ReactNode;
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0A0A0B" },
    { media: "(prefers-color-scheme: dark)", color: "#0A0A0B" },
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
          "min-h-screen bg-bg-primary font-body antialiased text-text-primary overflow-x-hidden",
          fontBody.variable,
          fontDisplay.variable,
          fontHeading.variable
        )}
      >
        <Analytics />
        <GoogleAnalytics gaId="G-59WSL645R4" />
        
        {/* Background Effects */}
        <div className="fixed inset-0 bg-grid pointer-events-none opacity-50" />
        <div className="fixed inset-0 bg-radial-glow pointer-events-none" />
        
        {/* Main Layout */}
        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">
            <div className="section-container">
              {children}
            </div>
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
