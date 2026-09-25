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
  variable: "--font-inter",
  display: "swap",
  // Body text isn't the LCP element — don't spend critical-path bandwidth on it.
  preload: false,
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
  // Only used for small mono labels — keep it off the critical path.
  preload: false,
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

        {/* LCP image: the hero robot. Dark theme is always the first paint,
            and the image is revealed by JS after the preloader, so start the
            download with the HTML instead of waiting for hydration. */}
        <link
          rel="preload"
          as="image"
          href="/robot.avif"
          type="image/avif"
          fetchPriority="high"
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