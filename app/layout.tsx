import type { Metadata } from "next";
import { Inter, Cinzel, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-serif",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "FATHOM | Advanced Freight Analytics",
  description: "Stop Shipping Fraud Before It Happens",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${cinzel.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
