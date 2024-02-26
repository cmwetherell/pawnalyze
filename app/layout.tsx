import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import { Inter as FontSans } from "next/font/google"
import localFont from "next/font/local"
import { siteConfig } from "@/config/site"
import { Viewport } from "next";
import { cn } from "@/lib/utils";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

// Font files can be colocated inside of `pages`
const fontHeading = localFont({
  src: "../assets/fonts/CalSans-SemiBold.woff2",
  variable: "--font-heading",
})

interface RootLayoutProps {
  children: React.ReactNode
}
 
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'cyan' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export const metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "Chess",
    "Chess Analytics",
    "Chess AI",
    "Chess Predictions",
    "Elo",
    
  ],
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
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [`${siteConfig.url}/img/chess-complexity-ai.jpg`],
    creator: "@pawnalyze",
  },
  icons: {
    icon: "/favicon.ico",
    // shortcut: "/favicon-16x16.png",
    // apple: "/apple-touch-icon.png",
  },
  manifest: `${siteConfig.url}/site.webmanifest`,
}



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(
          "min-h-screen bg-white font-sans antialiased text-black",
          fontSans.variable,
          fontHeading.variable
        )}>
          <Navbar />
          <div className="flex flex-col bg-white min-h-screen container mx-auto">
          {children}
          </div>
      </body>
      {/* <Footer /> */}
    </html>
  );
}
