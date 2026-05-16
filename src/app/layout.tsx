import type { Metadata } from "next";
import { Syne, Space_Grotesk, Lexend } from "next/font/google";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FiveM ToDo | Premium Management",
  description: "The most advanced ToDo application for FiveM communities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${syne.variable} ${spaceGrotesk.variable} ${lexend.variable} antialiased`}>
      <body className="min-h-screen bg-[#050505] text-white font-sans selection:bg-purple-500/30">
        {children}
      </body>
    </html>
  );
}
