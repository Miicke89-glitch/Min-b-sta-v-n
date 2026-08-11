import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const figtree = localFont({
  src: [
    { path: "../fonts/figtree.woff2", weight: "300 900", style: "normal" },
    { path: "../fonts/figtree-italic.woff2", weight: "300 900", style: "italic" },
  ],
  variable: "--font-figtree",
  display: "swap",
});

const fraunces = localFont({
  src: [{ path: "../fonts/fraunces.woff2", weight: "300 700", style: "normal" }],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Din bästa vän",
  description:
    "Den digitala valppärmen — allt om din valp, samlat av din uppfödare.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#faf8f5",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="sv" className={`${figtree.variable} ${fraunces.variable}`}>
      <body>{children}</body>
    </html>
  );
}
