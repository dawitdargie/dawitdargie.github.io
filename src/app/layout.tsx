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
//
// FAILSAFE (mobile): if React has not called stop() within BOOT_STUCK_MS after we
// first hit 99, continue 99→100 in the DOM so the number never sits on "099" while
// chunks download. React's Preloader (App.tsx) still owns the wipe via its own
// failsafe; this only keeps the visible counter honest on slow networks.
const BOOT_COUNTER_JS = `
(function () {
  var CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
  var timers = [];
  var BOOT_STUCK_MS = 1800;
  var state = { count: 0, glitch: "   ", stopped: false, stop: function () {} };
  window.__pl = state;
  function pad(n) { return n < 10 ? "00" + n : n < 100 ? "0" + n : "" + n; }
  function start() {
    var num = document.querySelector("[data-boot-count]");
    if (!num) return false;
    var glitchEl = document.querySelector("[data-boot-glitch]");
    var bar = document.querySelector("[data-boot-bar]");
    var n = 0;
    var hit99At = 0;
    var finishing = false;
    timers.push(setInterval(function () {
      if (state.stopped) return;
      var g = "";
      for (var i = 0; i < 3; i++) g += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
      state.glitch = g;
      if (glitchEl) glitchEl.textContent = g;
    }, 40));
    timers.push(setInterval(function () {
      if (state.stopped) return;
      if (finishing) {
        n += 1 + Math.floor(Math.random() * 3);
        if (n >= 100) {
          n = 100;
          state.count = 100;
          num.textContent = "100";
          if (bar) bar.style.transform = "scaleX(1)";
          if (glitchEl) glitchEl.textContent = "   ";
          state.glitch = "   ";
          state.stopped = true;
          for (var i = 0; i < timers.length; i++) clearInterval(timers[i]);
          timers.length = 0;
          return;
        }
        state.count = n;
        num.textContent = pad(n);
        if (bar) bar.style.transform = "scaleX(" + n / 100 + ")";
        return;
      }
      n += 1 + Math.floor(Math.random() * 5);
      if (n > 99) n = 99;
      if (n === 99 && hit99At === 0) hit99At = Date.now();
      if (n === 99 && hit99At && (Date.now() - hit99At) >= BOOT_STUCK_MS) {
        finishing = true;
        return;
      }
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

// ─── INLINE HERO-PANEL MEASURE ───────────────────────────────────────────────
// The hero image panel's geometry lives in the middle of the "C" of STACK, so it
// can only be measured once the hero has been laid out and the Unbounded file has
// swapped in — which used to mean "when React's effect runs", i.e. after ~2s of
// downloading + evaluating 700 KB of JS. Until then the panel is `display:none`,
// so the robot (the LCP element) stayed unpainted even though its 18 KB AVIF had
// been preloaded and was sitting ready.
//
// This runs during HTML parsing instead: the identical arithmetic on the identical
// boxes, one rAF after `document.fonts.ready` (the same signal the React effect
// re-measures on), and publishes the result on `window.__heroPanel` for
// HeroSection to adopt as its initial state (see heroPanelBoot in App.tsx).
// Because React's first render then matches the DOM this script already styled,
// hydration neither repaints nor corrects anything, and the image is on screen
// ~0.8s earlier. Every failure mode is a no-op: if the elements are missing or the
// width is not measurable, nothing is written and React behaves exactly as it did
// before. A wrong measurement cannot be seen either — the preloader overlay
// covers the viewport until long after hydration has re-measured.
const HERO_PANEL_BOOT_JS = `
(function () {
  function run() {
    var panel = document.querySelector("[data-hero-panel]");
    var section = document.getElementById("home");
    var c = document.getElementById("stack-c");
    if (!panel || !section || !c) return;
    var sectionRect = section.getBoundingClientRect();
    var cRect = c.getBoundingClientRect();
    var sectionW = sectionRect.width;
    var rightInset = Math.max(12, sectionW * 0.03);
    var left = cRect.left - sectionRect.left + cRect.width / 2;
    var width = sectionW - left - rightInset;
    var minWidth = Math.min(320, sectionW * 0.58);
    if (width < minWidth) {
      width = minWidth;
      left = sectionW - rightInset - width;
      var minLeft = sectionW * 0.22;
      if (left < minLeft) {
        left = minLeft;
        width = sectionW - rightInset - left;
      }
    }
    if (width <= 8) return;
    panel.style.display = "block";
    panel.style.position = "absolute";
    panel.style.left = left + "px";
    panel.style.width = width + "px";
    panel.style.top = "2.25rem";
    panel.style.bottom = "0";
    panel.style.zIndex = "0";
    panel.style.pointerEvents = "none";
    panel.style.overflow = "hidden";
    window.__heroPanel = {
      display: "block",
      position: "absolute",
      left: left,
      width: width,
      top: "2.25rem",
      bottom: 0,
      zIndex: 0,
      pointerEvents: "none",
      overflow: "hidden"
    };
  }
  var fonts = document.fonts;
  if (fonts && fonts.ready && fonts.status !== "loaded") {
    fonts.ready.then(function () { requestAnimationFrame(run); }).catch(function () { requestAnimationFrame(run); });
  } else {
    requestAnimationFrame(run);
  }
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

        {/* LCP image: the hero robot. Dark theme is always the first paint, the
            panel is positioned by the inline script below (HERO_PANEL_BOOT_JS)
            during HTML parsing, so start the download with the HTML. */}
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

        {/* Positions the hero image panel before hydration (see HERO_PANEL_BOOT_JS).
            A classic script at the end of the body content, so it executes after the
            hero markup exists but before the app's JS has even been requested. */}
        <script dangerouslySetInnerHTML={{ __html: HERO_PANEL_BOOT_JS }} />
      </body>
    </html>
  );
}