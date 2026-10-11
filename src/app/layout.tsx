import type { Metadata } from "next";
import { Anybody } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const anybody = Anybody({
  variable: "--font-anybody",
  subsets: ["latin"],
  axes: ["wdth"],
});

export const metadata: Metadata = {
  title: "Tectonic 2026 — Volunteer Portal",
  description: "Access your personal Tectonic 2026 volunteer schedule.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${anybody.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Script src="https://next.brella.io/scripts/custom-page" />
      </body>
    </html>
  );
}
