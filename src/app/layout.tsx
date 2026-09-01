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
  description:
    "Dawit Dargie — Full Stack Engineer building complete systems. Specialized in Go, React, Next.js, TypeScript and system architecture. View my portfolio and projects.",
  keywords: [
    "Dawit Dargie",
    "Full Stack Engineer",
    "Full Stack Developer",
    "Go Developer",
    "React",
    "Next.js",
    "TypeScript",
  ],
  authors: [{ name: "Dawit Dargie" }],
  creator: "Dawit Dargie",
  openGraph: {
    title: "Dawit Dargie | Full Stack Engineer",
    description:
      "Full Stack Engineer building complete systems with Go, React, Next.js & TypeScript.",
    url: "https://dawitdargie.github.io/",
    siteName: "Dawit Dargie",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dawit Dargie | Full Stack Engineer",
    description: "Full Stack Engineer building complete systems.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://dawitdargie.github.io/",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${unbounded.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        {/* Structured Data - Person */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Dawit Dargie",
              url: "https://dawitdargie.github.io/",
              jobTitle: "Full Stack Engineer",
              description:
                "Full Stack Engineer building complete systems with Go, React, Next.js and TypeScript.",
              sameAs: [
                "https://www.linkedin.com/in/dawit-dargie-30b43b426",
                "https://github.com/dawitdargie",
                "https://www.instagram.com/dawitdargie1",
                "https://t.me/dawitdargie",
              ],
            }),
          }}
        />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
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