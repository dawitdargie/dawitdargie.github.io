import { Unbounded, Inter, JetBrains_Mono } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";

const unbounded = Unbounded({
  subsets: ["latin"],
  weight: ["200", "300", "400", "700", "900"],
  variable: "--font-unbounded",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Unique Design Portfolio",
  description: "Showcase your skills with a stunning, animation-rich portfolio designed for full stack developers.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${unbounded.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body
        suppressHydrationWarning
        className={`${unbounded.className} ${inter.className} ${jetbrainsMono.className}`}
      >
        {children}
      </body>
    </html>
  );
}
