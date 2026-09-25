import { Unbounded, Inter, JetBrains_Mono } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";

// Weights are trimmed to what the page actually renders (every Unbounded element
// carries font-black/900, font-bold/700 or font-light/300; Inter uses 300/400/500;
// JetBrains Mono uses 400/500). Unbounded 200+400 and Inter 600 were declared but
// never painted — each one shipped 5-7 extra @font-face subset rules.
//
// 900 is listed FIRST on purpose: next/font preloads the first declared weight, and
// 900 is what the hero heading (the LCP text) is painted in. Before this change the
// single font preload was Unbounded 200 — a weight the page never renders.
const unbounded = Unbounded({
  subsets: ["latin"],
  weight: ["900", "700", "300"],
  variable: "--font-unbounded",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-inter",
  display: "swap",
  // Body text isn't the LCP element — don't spend critical-path bandwidth on it.
  preload: false,
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
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

// ─── INLINE BOOT COUNTER ─────────────────────────────────────────────────────
// Runs at HTML-parse time, long before the ~255 KB of JS is parsed, and drives the
// exact same counter the Preloader component uses (20ms ticks, random 1..5 steps).
// That is what stops the number sitting frozen at 000 while React downloads: the
// count is already climbing. It stops at 99 and hands the live value over —
// React adopts it, clears the glitch, holds 150ms and runs the 0.9s wipe, so the
// choreography and every frame of the animation stay owned by the component.
const BOOT_COUNTER_JS = `
(function () {
  var CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
  var timers = [];
  var state = { count: 0, glitch: "   ", stopped: false, stop: function () {} };
  window.__pl = state;
  function pad(n) { return n < 10 ? "00" + n : n < 100 ? "0" + n : "" + n; }
  function start() {
    var num = document.querySelector("[data-boot-count]");
    if (!num) return false;
    var glitchEl = document.querySelector("[data-boot-glitch]");
    var bar = document.querySelector("[data-boot-bar]");
    var n = 0;
    timers.push(setInterval(function () {
      var g = "";
      for (var i = 0; i < 3; i++) g += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
      state.glitch = g;
      if (glitchEl) glitchEl.textContent = g;
    }, 40));
    timers.push(setInterval(function () {
      if (state.stopped) return;
      n += 1 + Math.floor(Math.random() * 5);
      if (n > 99) n = 99; /* the last 1% belongs to React */
      state.count = n;
      num.textContent = pad(n);
      if (bar) bar.style.transform = "scaleX(" + n / 100 + ")";
    }, 20));
    state.stop = function () {
      state.stopped = true;
      for (var i = 0; i < timers.length; i++) clearInterval(timers[i]);
      timers.length = 0;
    };
    return true;
  }
  var tries = 0;
  function look() {
    if (start() || ++tries > 600) return;
    requestAnimationFrame(look);
  }
  requestAnimationFrame(look);
})();
`;

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

        {/* Starts the preloader count at HTML-parse time (see BOOT_COUNTER_JS). */}
        <script dangerouslySetInnerHTML={{ __html: BOOT_COUNTER_JS }} />
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