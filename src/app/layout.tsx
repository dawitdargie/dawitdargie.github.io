import { Unbounded, Inter, JetBrains_Mono } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";

const unbounded = Unbounded({
  subsets: ["latin"],
  weight: ["900", "700"], // dropped 300
  variable: "--font-unbounded",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-inter",
  display: "swap",
  preload: false,
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
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

const BOOT_COUNTER_JS = `
(function () {
  var CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
  var timers = [];
  var BOOT_STUCK_MS = 1100; // was 1800
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
    }, 12)); // was 20
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

        <link
          rel="preload"
          as="image"
          href="/robot.avif"
          type="image/avif"
          fetchPriority="high"
        />

        <script dangerouslySetInnerHTML={{ __html: BOOT_COUNTER_JS }} />
      </head>
      <body
        suppressHydrationWarning
        className={`${unbounded.className} ${inter.className} ${jetbrainsMono.className}`}
      >
        {children}
        <script dangerouslySetInnerHTML={{ __html: HERO_PANEL_BOOT_JS }} />
      </body>
    </html>
  );
}