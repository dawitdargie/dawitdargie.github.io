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
  title: "Dawit Dargie | Full Stack Engineer",
  description: "Showcase your skills with a stunning, animation-rich portfolio designed for full stack developers.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${unbounded.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Unbounded:wght@200;300;400;700;900&family=Inter:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=JetBrains+Mono:ital,wght@0,300;0,400;0,500;1,300;1,400&display=swap"
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${unbounded.className} ${inter.className} ${jetbrainsMono.className}`}
      >
        {children}
      </body>
    </html>
  );
}
