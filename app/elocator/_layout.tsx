import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Elocator",
  description: "Chess Complexity Calculator",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
