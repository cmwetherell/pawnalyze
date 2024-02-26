import type { Metadata } from "next";
// import { SpeedInsights } from "@vercel/speed-insights/next"
// import { Analytics } from '@vercel/analytics/react';
import { Inter } from "next/font/google";
// import "./globals.css";
import { SP } from "next/dist/shared/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Elocator",
  description: "Chess Complexity Calculator",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <body>{children}</body>
  );
}
