import { useState, useEffect, useLayoutEffect, useRef, createContext, useContext, startTransition } from "react";
import Lenis from "lenis";
import { motion, AnimatePresence, useScroll, useTransform, type MotionValue } from "motion/react";

import dynamic from "next/dynamic";

// The below-the-fold page (src/app/Sections.tsx). Loaded on demand, *after* the
// preloader's count finishes, so its bytes and its parse never sit between first
// paint and the moment the counter reaches 100 — which is what used to leave it
// parked on "099" while the whole page evaluated. `ssr: false` because these
// sections only ever render on the client (they mount behind the `sectionsReady`
// gate and every reveal is IntersectionObserver-gated); `loading: () => null`
// renders nothing while the chunk is in flight, exactly as that gate did.
const BelowFold = dynamic(() => import("./Sections"), { ssr: false, loading: () => null });

// ─── THEME ───────────────────────────────────────────────────────────────────

type Theme = "dark" | "light";
const ThemeContext = createContext<{ theme: Theme; toggleTheme: () => void }>({ theme: "dark", toggleTheme: () => {} });
function useTheme() { return useContext(ThemeContext); }

// "THEME SWITCH" — floating circular icon button, pinned to the bottom-right corner
// on every screen size (position: fixed → visible over every section while scrolling).
// Dark theme active  -> SUN icon (click = switch to light)
// Light theme active -> CRESCENT MOON icon (click = switch to dark)
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const light = theme === "light";
  return (
    <motion.button
      onClick={toggleTheme}
      data-hover
      role="switch"
      aria-checked={light}
      aria-label={light ? "Switch to dark theme" : "Switch to light theme"}
      title={light ? "Dark mode" : "Light mode"}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      className="fixed bottom-6 right-6 z-[320] flex items-center justify-center rounded-full"
      style={{
        width: "46px",
        height: "46px",
        color: light ? "var(--ink)" : "var(--accent)",
        background: "rgba(var(--bg-rgb),0.72)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        border: `1px solid ${light ? "rgba(var(--ink-rgb),0.18)" : "rgba(var(--accent-rgb),0.38)"}`,
        boxShadow: "0 8px 26px rgba(0,0,0,0.32)",
        transition: "color 0.4s ease, border-color 0.4s ease, background 0.4s ease",
      }}
    >
      {/* Both shapes share one 20×20 box → crossfade, the button is never empty.
          No mode="wait": exit and enter overlap so a glyph is always on screen. */}
      <span className="relative block" style={{ width: "20px", height: "20px" }}>
      <AnimatePresence initial={false}>
        {light ? (
          <motion.svg
            key="moon"
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ position: "absolute", inset: 0 }}
            initial={{ rotate: 60, scale: 0.7, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: -60, scale: 0.7, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
          </motion.svg>
        ) : (
          <motion.svg
            key="sun"
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ position: "absolute", inset: 0 }}
            initial={{ rotate: -60, scale: 0.7, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 60, scale: 0.7, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
          </motion.svg>
        )}
      </AnimatePresence>
      </span>
    </motion.button>
  );
}

// ─── DATA ────────────────────────────────────────────────────────────────────


const FLOATING_CODE = ["const solve = (x) => x ** 2;", "git push origin main", "docker compose up --build", "SELECT * FROM dreams;", "npm run build:production", "async function deploy() {}", "kubectl apply -f k8s/", "type Future = Promise<void>;", "@app.route('/api/v2')", "git commit -m 'ship it'"];

// ─── FLOATING CODE BG ────────────────────────────────────────────────────────

function FloatingCode() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden>
      {FLOATING_CODE.map((line, i) => (
        <div key={i} className="absolute text-xs whitespace-nowrap" style={{ fontFamily: "JetBrains Mono, monospace", color: "rgba(var(--accent-rgb),0.06)", left: `${(i * 13 + 5) % 88}%`, animation: `floatUp ${12 + i * 1.3}s linear infinite`, animationDelay: `${-i * 1.5}s` }}>
          {line}
        </div>
      ))}
    </div>
  );
}

// ─── CUSTOM CURSOR ─────────────────────────────────────────────────────────────

function CustomCursor() {
  const [finePointer, setFinePointer] = useState<boolean | null>(null);
  const [touchDetected, setTouchDetected] = useState(false);
  const lens = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"default" | "hover" | "click">("default");
  const mx = useRef(0), my = useRef(0), lx = useRef(0), ly = useRef(0), raf = useRef(0);
  const lastNavDispatch = useRef(0);
  const lastProxScan = useRef(0);
  const proxHit = useRef(false);

  useEffect(() => {
    setFinePointer(!!window.matchMedia?.("(hover: hover) and (pointer: fine)")?.matches);
  }, []);

  // Hybrid-device safety: if a touch fires before any mouse movement,
  // this is a touch session — kill the custom cursor entirely.
  useEffect(() => {
    let mouseSeen = false;
    const onTouch = () => { if (!mouseSeen) setTouchDetected(true); };
    const onMouse = () => { mouseSeen = true; };
    window.addEventListener("touchstart", onTouch, { passive: true });
    window.addEventListener("mousemove", onMouse, { passive: true, once: true });
    return () => {
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("mousemove", onMouse);
    };
  }, []);


  useEffect(() => {
    if (!finePointer || touchDetected) return;
    const move = (e: MouseEvent) => {
      mx.current = e.clientX;
      my.current = e.clientY;
    };
    const down = (e: MouseEvent) => {
      setState("click");
      if (ring.current) {
        ring.current.style.transition = "none";
        ring.current.style.left = e.clientX + "px";
        ring.current.style.top = e.clientY + "px";
        ring.current.style.opacity = "0.7";
        ring.current.style.transform = "translate(-50%,-50%) scale(0.4)";
        requestAnimationFrame(() => {
          if (ring.current) {
            ring.current.style.transition = "opacity 0.4s ease-out, transform 0.4s ease-out";
            ring.current.style.transform = "translate(-50%,-50%) scale(2.5)";
            ring.current.style.opacity = "0";
          }
        });
      }
    };
    const up = () => setState("default");
    const over = (e: MouseEvent) => { if (!proxHit.current) setState((e.target as HTMLElement).closest("a,button,[data-hover]") ? "hover" : "default"); };
    const tick = () => {
      lx.current += (mx.current - lx.current) * 0.45;
      ly.current += (my.current - ly.current) * 0.45;
      if (lens.current) {
        lens.current.style.transform = `translate(${lx.current}px, ${ly.current}px) scale(${state === "click" ? 0.85 : state === "hover" ? 1.1 : 1})`;
        lens.current.style.filter = state === "hover" ? "drop-shadow(0 0 12px rgba(var(--accent-rgb),0.8))" : "none";
      }

      // Proximity hover: trigger hover effects when an interactive element is
      // within a few pixels of the lens in ANY direction — no exact-point needed.
      if (lens.current && state !== "click") {
        const nowP = performance.now();
        if (nowP - lastProxScan.current > 80) {
          lastProxScan.current = nowP;
          const r = lens.current.getBoundingClientRect();
          const cx = r.left + r.width / 2;
          const cy = r.top + r.height / 2;
          const R = 16, K = 0.7071 * R;
          let hit = false;
          for (const [dx, dy] of [[0, 0], [R, 0], [-R, 0], [0, R], [0, -R], [K, K], [-K, K], [K, -K], [-K, -K]]) {
            const els = document.elementsFromPoint(cx + dx, cy + dy);
            if (els.some((el) => (el as HTMLElement).closest?.("a,button,[data-hover]"))) { hit = true; break; }
          }
          if (hit !== proxHit.current) {
            proxHit.current = hit;
            setState(hit ? "hover" : "default");
          }
        }
      }

      // Dispatch cursor-nav-hover if lens overlaps any nav button
      if (lens.current) {
        const now = performance.now();
        if (now - lastNavDispatch.current > 30) {
          lastNavDispatch.current = now;
          const rect = lens.current.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const buttons = document.querySelectorAll("nav button[data-hover], #main-nav button[data-hover]");
          let hit = false;
          buttons.forEach((btn) => {
            const b = (btn as HTMLElement).getBoundingClientRect();
            if (
              cx > b.left - 12 &&
              cx < b.right + 12 &&
              cy > b.top - 12 &&
              cy < b.bottom + 12
            ) {
              const id = btn.getAttribute("data-id") || btn.getAttribute("data-section");
              if (id) {
                window.dispatchEvent(new CustomEvent("cursor-nav-hover", { detail: { id } }));
                hit = true;
              }
            }
          });
          if (!hit) {
            window.dispatchEvent(new Event("cursor-nav-clear"));
          }
        }
      }

      raf.current = requestAnimationFrame(tick);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    raf.current = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      cancelAnimationFrame(raf.current);
    };
  }, [state, finePointer, touchDetected]);

  if (!finePointer || touchDetected) return null;

  return (
    <>
      <div
        ref={lens}
        className="fixed top-0 left-0 z-[9999] pointer-events-none"
        style={{
          width: state === "hover" ? "36px" : "28px",
          height: state === "hover" ? "36px" : "28px",
          transition: "width 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), height 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.2s ease",
        }}
      >
        <svg viewBox="0 0 64 64" width="100%" height="100%" style={{ overflow: "visible" }}>
          <path d="M38 38 L 54 54" stroke="var(--cursor-a)" strokeWidth="6" strokeLinecap="round" />
          <path d="M38 38 L 54 54" stroke="var(--cursor-b)" strokeWidth="2" strokeLinecap="round" />
          <circle cx="28" cy="28" r="20" fill="none" stroke="var(--cursor-a)" strokeWidth="4" />
          <circle cx="28" cy="28" r="17" fill="rgba(var(--ink-rgb),0.08)" stroke="rgba(var(--ink-rgb),0.15)" strokeWidth="1" />
          <path d="M18 20 Q 24 16 30 22" stroke="rgba(var(--ink-rgb),0.4)" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      </div>

      <div
        ref={ring}
        className="fixed top-0 left-0 z-[9998] pointer-events-none rounded-full"
        style={{
          width: "40px",
          height: "40px",
          border: "2px solid rgba(var(--ink-rgb),0.5)",
          opacity: 0,
          transform: "translate(-50%,-50%) scale(0.5)",
          transition: "opacity 0.4s ease-out, transform 0.4s ease-out",
        }}
      />
    </>
  );
}

// ─── GRAIN OVERLAY ────────────────────────────────────────────────────────────

function GrainOverlay() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-[300] hidden md:block"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat",
        backgroundSize: "200px 200px",
        opacity: 0.028,
        mixBlendMode: "overlay",
      }}
    />
  );
}

// ─── SCROLL PROGRESS ─────────────────────────────────────────────────────────

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);
  return (
    <div className="fixed right-5 top-16 bottom-8 z-[150] w-px hidden md:block" style={{ background: "rgba(var(--ink-rgb),0.05)" }}>
      <motion.div className="w-full origin-top" style={{ background: "linear-gradient(to bottom, var(--accent), rgba(var(--accent-rgb),0.2))", scaleY, height: "100%" }} />
    </div>
  );
}

// ─── PRELOADER ────────────────────────────────────────────────────────────────

// Preloader pacing — unchanged from the original design: 20ms ticks with random
// 1..5 steps (~0.67s of counting), 150ms hold, 0.9s wipe.
//
// The only change is *when* the counting starts. An inline boot script in
// layout.tsx runs the exact same counter from HTML-parse time, so the number is
// already climbing while the JS chunks download — no more sitting frozen at 000
// until hydration. The boot script stops at 99 and React adopts the live value
// below, so the final 1%, the glitch clear, the hold and the wipe stay owned
// here, exactly as before.
//
// FAILSAFE: on slow mobile the JS can take seconds after the boot script has
// already parked at 99. Without a cap, the counter sits on "099" until React
// hydrates. PRELOADER_FAILSAFE_MS forces 99→100 + onDone so the wipe always
// starts within ~2.2s of this component mounting — same look, no hang.
const PRELOADER_TICK_MS = 20;
const PRELOADER_GLITCH_MS = 40;
const PRELOADER_HOLD_MS = 150;
const PRELOADER_FAILSAFE_MS = 2200;

// Handoff surface published by the inline boot script (see layout.tsx).
type BootCounter = { count: number; glitch: string; stopped: boolean; stop: () => void };
const bootCounter = () =>
  typeof window === "undefined"
    ? undefined
    : (window as unknown as { __pl?: BootCounter }).__pl;

function Preloader({ onDone }: { onDone: () => void }) {
  const [count, setCount] = useState(0);
  const [glitch, setGlitch] = useState("   ");
  const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
  const finished = useRef(false);

  const finish = (clearGlitch: boolean) => {
    if (finished.current) return;
    finished.current = true;
    setCount(100);
    if (clearGlitch) setGlitch("   ");
    setTimeout(onDone, PRELOADER_HOLD_MS);
  };

  // Adopt whatever the boot script has already counted, then continue it here.
  useLayoutEffect(() => {
    const boot = bootCounter();
    if (!boot) return;
    boot.stop();
    setCount(boot.count);
    if (boot.glitch) setGlitch(boot.glitch);
  }, []);

  useEffect(() => {
    const gi = setInterval(() => {
      if (finished.current) return;
      setGlitch(
        Array.from({ length: 3 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join("")
      );
    }, PRELOADER_GLITCH_MS);

    let n = bootCounter()?.count ?? 0;
    // If boot already reached 99 (common on mobile: HTML + boot ran, JS late),
    // start the final ticks immediately instead of waiting another interval.
    if (n >= 99) n = 99;

    const ci = setInterval(() => {
      if (finished.current) return;
      n += Math.floor(Math.random() * 5) + 1;
      if (n >= 100) {
        n = 100;
        clearInterval(ci);
        clearInterval(gi);
        finish(true);
        return;
      }
      setCount(n);
    }, PRELOADER_TICK_MS);

    // Never leave the user staring at 099 while chunks download on slow 4G.
    const failsafe = window.setTimeout(() => {
      clearInterval(ci);
      clearInterval(gi);
      finish(true);
    }, PRELOADER_FAILSAFE_MS);

    return () => {
      clearInterval(gi);
      clearInterval(ci);
      window.clearTimeout(failsafe);
    };
    // finish() is guarded by finished ref so double-fire is safe even if onDone
    // identity changes between parent re-renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onDone]);

  return (
    <motion.div className="fixed inset-0 z-[9000] flex flex-col items-center justify-center overflow-hidden" style={{ background: "var(--bg)", clipPath: "inset(0 0 0% 0)" }} exit={{ clipPath: "inset(0 0 100% 0)", transition: { duration: 0.9, ease: [0.76, 0, 0.24, 1] } }}>
      <div className="absolute left-0 right-0 top-0 h-px z-10 pointer-events-none" style={{ background: "linear-gradient(90deg, transparent, var(--accent), transparent)", animation: "scanlineY 3s linear infinite", opacity: 0.6 }} />
      <div className="relative select-none">
        <div data-boot-count suppressHydrationWarning className="font-black tabular-nums" style={{ fontFamily: "Unbounded, sans-serif", fontSize: "clamp(5rem, 20vw, 18rem)", color: "var(--ink)", letterSpacing: "-0.05em", lineHeight: 1 }}>
          {String(count).padStart(3, "0")}
        </div>
        <div data-boot-glitch suppressHydrationWarning className="absolute inset-0 flex items-center justify-center font-black tabular-nums select-none pointer-events-none" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "clamp(5rem, 20vw, 18rem)", color: "var(--accent)", letterSpacing: "-0.05em", lineHeight: 1, opacity: count < 100 ? 0.18 : 0, transition: "opacity 0.3s" }}>
          {glitch}
        </div>
      </div>
      <div className="mt-8 w-72 overflow-hidden" style={{ height: "1px", background: "rgba(var(--ink-rgb),0.08)" }}>
        <motion.div data-boot-bar suppressHydrationWarning className="h-full w-full" style={{ background: "var(--accent)", transformOrigin: "left" }} animate={{ scaleX: count / 100 }} transition={{ duration: 0.08, ease: "linear" }} />
      </div>
      <div className="mt-5 text-xs tracking-[0.3em] uppercase" style={{ fontFamily: "JetBrains Mono, monospace", color: "rgba(var(--ink-rgb),0.25)" }}>
        SYS_INIT — LOADING PORTFOLIO
      </div>
    </motion.div>
  );
}

// ─── NAV ─────────────────────────────────────────────────────────────────────

const NAV_SECTIONS = [
  { num: "01", label: "HOME", id: "home" },
  { num: "02", label: "ABOUT", id: "about" },
  { num: "03", label: "WORK", id: "work" },
  { num: "04", label: "SKILLS", id: "skills" },
  { num: "05", label: "WHY ME", id: "why-me" },
  { num: "06", label: "SERVICES", id: "services" },
  { num: "07", label: "CONTACT", id: "contact" },
];

function Nav({ onScrollTo, sectionsReady }: { onScrollTo: (id: string) => void; sectionsReady: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  // Track active section via IntersectionObserver.
  //
  // The observer MUST be (re)built after the sections exist: Nav ships in the
  // static HTML while everything below the fold mounts when the preloader hands
  // over (`sectionsReady`), so resolving the elements at first mount would only
  // ever find #home and no other link could expand.
  //
  // Cost: `attach` is a no-op unless the number of sections actually changed, so
  // this is at most two rebuilds per page load (1 target, then 7). The callback
  // never reads layout — only isIntersecting/target.id — and setActiveId bails out
  // when the id is unchanged, so a full-page scroll costs one small Nav re-render
  // per section boundary.
  useEffect(() => {
    let obs: IntersectionObserver | null = null;
    let attached = 0;
    const attach = () => {
      const sections = NAV_SECTIONS.map(s => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
      if (sections.length === 0 || sections.length === attached) return;
      attached = sections.length;
      obs?.disconnect();
      // Detect whichever section crosses a thin band at the vertical middle of the
      // viewport. Works uniformly for short and tall sections (ratio-based
      // thresholds fail on tall ones).
      obs = new IntersectionObserver(
        (entries) => {
          entries.forEach(e => {
            if (e.isIntersecting) setActiveId(prev => (prev === e.target.id ? prev : e.target.id));
          });
        },
        { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
      );
      sections.forEach(s => obs?.observe(s));
    };
    attach();
    // Safety net: if the sections mount later (or the page height changes), re-attach.
    const ro = new ResizeObserver(attach);
    ro.observe(document.body);
    return () => { ro.disconnect(); obs?.disconnect(); };
  }, [sectionsReady]);

  const isExpanded = (id: string) => hoveredId === id || activeId === id;

  return (
    <motion.nav id="main-nav" initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3, duration: 1, ease: [0.16, 1, 0.3, 1] }} className="fixed top-0 left-0 right-0 z-[200] flex items-center justify-between px-8 py-6 transition-all duration-500" style={{ borderBottom: scrolled ? "1px solid rgba(var(--ink-rgb),0.06)" : "1px solid transparent", backdropFilter: scrolled ? "blur(12px)" : "none" }}>
      {/* Left cluster: logo */}
      <div className="flex items-center gap-3">
        <button onClick={() => onScrollTo("top")} className="text-xs tracking-[0.25em] font-medium transition-opacity hover:opacity-60" style={{ fontFamily: "JetBrains Mono, monospace", color: "var(--accent)" }} data-hover>DAWIT</button>
      </div>

      {/* Right cluster: nav links · mobile menu */}
      <div className="flex items-center">
      {/* Desktop nav */}
      <div className="hidden md:flex items-center gap-3">
        {NAV_SECTIONS.map(({ num, label, id }) => {
          const expanded = isExpanded(id);
          const active = activeId === id;
          const color = active ? "var(--accent)" : hoveredId === id ? "var(--ink)" : "rgba(var(--ink-rgb),0.65)";
          return (
            <button
              key={id}
              data-id={id}
              onClick={() => onScrollTo(id)}
              onMouseEnter={() => setHoveredId(id)}
              onMouseLeave={() => setHoveredId(null)}
              data-hover
                className="text-xs tracking-[0.15em] transition-colors duration-200 px-3 py-3"
                style={{ fontFamily: "JetBrains Mono, monospace", color, display: "flex", alignItems: "center", gap: "6px" }}
            >
              <span style={{ opacity: active ? 1 : 0.8 }}>{num}</span>
              <span
                className="overflow-hidden whitespace-nowrap"
                style={{
                  maxWidth: expanded ? "160px" : "0px",
                  opacity: expanded ? 1 : 0,
                  willChange: "max-width",
                  transition: "max-width 0.5s cubic-bezier(0.22,1,0.36,1), opacity 0.4s ease 0.12s",
                }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Mobile menu button */}
      <button
  className="md:hidden flex flex-col items-center justify-center gap-1.5 p-2 shrink-0 relative z-[210]"
  onClick={() => setMenuOpen(!menuOpen)}
  data-hover
  aria-label="Toggle menu"
>
        <span
          className="block w-6 h-0.5 bg-[var(--ink)] origin-center"
          style={{
            transform: menuOpen ? "rotate(45deg) translateY(4.5px)" : "rotate(-12deg)",
            transition: "transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        />
        <span
          className="block w-6 h-0.5 bg-[var(--ink)]"
          style={{
            opacity: menuOpen ? 0 : 1,
            transform: menuOpen ? "scaleX(0)" : "scaleX(1)",
            transition: "opacity 0.2s ease, transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        />
        <span
          className="block w-6 h-0.5 bg-[var(--ink)] origin-center"
          style={{
            transform: menuOpen ? "rotate(-45deg) translateY(-4.5px)" : "rotate(12deg)",
            transition: "transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        />
      </button>
      </div>

      {/* Mobile nav panel */}
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="md:hidden absolute top-full left-0 right-0 border-b border-white/5"
          style={{ background: "rgba(var(--bg-rgb),0.95)", backdropFilter: "blur(12px)" }}
        >
          <div className="flex flex-col items-start gap-1 px-8 py-6">
            {NAV_SECTIONS.map(({ num, label, id }) => {
              const active = activeId === id;
              const color = active ? "var(--accent)" : "var(--ink)";
          return (
            <button
              key={id}
              data-id={id}
              onClick={() => { onScrollTo(id); setMenuOpen(false); }}
              onMouseEnter={() => setHoveredId(id)}
              onMouseLeave={() => setHoveredId(null)}
              data-hover
              className="text-left text-sm tracking-[0.15em] transition-colors duration-200 -mx-8"
              style={{ fontFamily: "JetBrains Mono, monospace", color, padding: "8px 0 8px 32px", display: "flex", alignItems: "center", gap: "10px", width: "100%" }}
            >
                  <span style={{ opacity: active ? 1 : 0.6 }}>{num}</span>
                  <span className="overflow-hidden whitespace-nowrap" style={{ maxWidth: "160px", opacity: 1, transition: "max-width 0.4s cubic-bezier(0.22,1,0.36,1), opacity 0.3s ease" }}>
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}

// ─── HERO STACK LINE (ROBOT IMAGE + TRANSPARENT C/K) ─────────────────────────

const ROBOT_IMG = "/robot.avif";
const ROBOT_LIGHT_IMG = "/robotw.avif";

function StackLine({ color }: { color: string }) {
  return (
    <div
      id="stack-line"
      className="relative inline-flex items-baseline"
      style={{
        fontFamily: "Unbounded, sans-serif",
        fontSize: "clamp(40px, 11vw, 220px)",
        color: "transparent",
        letterSpacing: "-0.04em",
        lineHeight: 0.88,
        fontWeight: 900,
      }}
    >
      <span style={{ position: "relative", zIndex: 1, color: "var(--ink)" }}>S</span>
      <span style={{ position: "relative", zIndex: 1, color: "var(--ink)" }}>T</span>
      <span style={{ position: "relative", zIndex: 1, color: "var(--ink)" }}>A</span>
      <span
        id="stack-c"
        style={{
          position: "relative",
          zIndex: 1,
          color: "transparent",
          WebkitTextStroke: "2px rgba(var(--ink-rgb),0.9)",
          paintOrder: "stroke fill",
        }}
      >
        C
      </span>
      <span
        style={{
          position: "relative",
          zIndex: 1,
          color: "transparent",
          WebkitTextStroke: "2px rgba(var(--ink-rgb),0.9)",
          paintOrder: "stroke fill",
        }}
      >
        K
      </span>
    </div>
  );
}

// ─── HERO IMAGE TAGLINE (transparent outline text over robot image) ──────────

function HeroImageTagline() {
  const LINES = [
    { text: "Build systems", style: { bottom: "calc(2.70rem + 2.4em)" } },
    { text: "that transform ideas", style: { bottom: "calc(2.70rem + 1.2em)" } },
    { text: "into machines that work.", style: { bottom: "2.70rem" } },
  ];
  return (
    <>
      {LINES.map((line) => (
        <div
          key={line.text}
          className="font-bold"
          style={{
            position: "absolute",
            right: "max(0.75rem, 3vw)",
            zIndex: 1,
            pointerEvents: "none",
            ...line.style,
            textAlign: "right",
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            fontWeight: 800,
            color: "var(--ink)",
            fontSize: "clamp(13px, 1.8vw, 35px)",
            letterSpacing: "-0.02em",
            lineHeight: 1.15,
            whiteSpace: "nowrap",
          }}
        >
          {line.text}
        </div>
      ))}
    </>
  );
}

// Handoff surface published by the inline hero-panel boot script (see layout.tsx).
//
// The panel's geometry can only be measured once the hero has been laid out, which
// used to mean "after hydration" — so the robot (the LCP element) stayed
// display:none until ~2s while its fully-downloaded AVIF sat idle. The inline
// script runs the exact same arithmetic on the exact same boxes during HTML
// parsing and publishes the result here; React adopts it as its initial state, so
// the first client render matches the DOM the script already painted and the image
// is on screen ~0.8s earlier. If the script is absent, or could not measure (no
// #stack-c, width <= 8), this is undefined and the component behaves exactly as
// before.
type HeroPanelStyle = {
  display: "block";
  position: "absolute";
  left: number;
  width: number;
  top: string;
  bottom: number;
  zIndex: number;
  pointerEvents: "none";
  overflow: "hidden";
};
const heroPanelBoot = (): HeroPanelStyle | undefined =>
  typeof window === "undefined"
    ? undefined
    : (window as unknown as { __heroPanel?: HeroPanelStyle }).__heroPanel;

// ─── HERO SECTION (IMPROVED) ─────────────────────────────────────────────────

function HeroSection() {
  const { theme } = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, -180]);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const words = [{ text: "FULL", color: "var(--ink)" }, { text: "STACK", color: "var(--ink)" }, { text: "DEV.", color: "var(--accent)" }];
  const imgRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const [imgStyle, setImgStyle] = useState<React.CSSProperties>(() => heroPanelBoot() ?? { display: "none" });
  const [hovered, setHovered] = useState(false);
  const [lightRobotReady, setLightRobotReady] = useState(false);
  const target = useRef({ x: 0, y: 0 });
  const cur = useRef({ x: 0, y: 0 });
  const raf = useRef(0);

  // Image panel:
  // - left edge ≈ middle of "C" in STACK
  // - right edge slightly inset from section right
  // - top = bottom of navbar
  // - bottom = bottom of hero section
  // - always visible on small screens via min width
  useEffect(() => {
    const measure = () => {
      if (!ref.current) return;
      const sectionRect = ref.current.getBoundingClientRect();
      const c = document.getElementById("stack-c");
      const nav = document.getElementById("main-nav");
      if (!c) return;

      const cRect = c.getBoundingClientRect();
      const navRect = nav?.getBoundingClientRect();

      const sectionW = sectionRect.width;
      const rightInset = Math.max(12, sectionW * 0.03);

// Ideal: left at middle of "C"
let left = cRect.left - sectionRect.left + cRect.width / 2;
let width = sectionW - left - rightInset;

// Bigger image on all screen sizes
const minWidth = Math.min(320, sectionW * 0.58);
if (width < minWidth) {
  width = minWidth;
  left = sectionW - rightInset - width;
  const minLeft = sectionW * 0.22;
  if (left < minLeft) {
    left = minLeft;
    width = sectionW - rightInset - left;
  }
}

      // Height: nav bottom → hero bottom
      const top = navRect ? Math.max(0, navRect.bottom - sectionRect.top) : 0;

      if (width <= 8) return;

      setImgStyle({
  display: "block",
  position: "absolute",
  left,
  width,
  // higher = closer to navbar (was ~4.5rem or nav bottom)
  top: "2.25rem",
  bottom: 0,
  zIndex: 0,
  pointerEvents: "none",
  overflow: "hidden",
});
    };

    measure();
    // One rAF covers the case where the first layout had not been flushed when
    // this effect ran. The ResizeObserver below fires again whenever the hero box
    // actually changes — including the web-font swap, which moves the heading —
    // and `fonts.ready` covers that directly, so the three fixed 120/500/1200ms
    // re-measures this replaces were re-reading identical geometry (three
    // guaranteed synchronous reflows per load, all inside the hydration window).
    const rafId = window.requestAnimationFrame(measure);

    window.addEventListener("resize", measure);
    const ro = new ResizeObserver(measure);
    if (ref.current) ro.observe(ref.current);

    // Re-measure when fonts finish loading (letter positions change)
    if (document.fonts?.ready) {
      document.fonts.ready.then(measure).catch(() => {});
    }

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", measure);
      ro.disconnect();
    };
  }, []);

  // Cursor parallax — image moves slightly toward the cursor.
  //
  // Mouse-only by definition. On a touch device there is no pointer to follow, so
  // `target` stays at (0,0) and the loop below would rewrite the same
  // `translate(0px, 0px)` every single frame — a permanent rAF callback plus a
  // style write, on the devices least able to afford it. Bailing out paints the
  // identical result: the transform already ships as translate(0,0) inline.
  useEffect(() => {
    const mouseDevice = !!window.matchMedia?.("(hover: hover) and (pointer: fine)")?.matches;
    if (!mouseDevice) return;
    const move = (e: MouseEvent) => {
      if (!ref.current) return;
      const r = ref.current.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      target.current.x = Math.max(-14, Math.min(14, dx * 0.05));
      target.current.y = Math.max(-10, Math.min(10, dy * 0.05));
    };
    const tick = () => {
      cur.current.x += (target.current.x - cur.current.x) * 0.12;
      cur.current.y += (target.current.y - cur.current.y) * 0.12;
      if (parallaxRef.current) parallaxRef.current.style.transform = `translate(${cur.current.x}px, ${cur.current.y}px)`;
      raf.current = requestAnimationFrame(tick);
    };
    window.addEventListener("mousemove", move, { passive: true });
    raf.current = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", move);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  // Dark robot: preloaded with the HTML (<link rel="preload"> in layout.tsx) and
  // always in the DOM, so it needs no JS warm-up.
  // Light robot (~18 KB, alpha-matted cut-out) is invisible on first paint
  // because the first theme is always dark. Warm it once the page is idle: the
  // theme crossfade still feels instant, but the bytes stay off the first load.
  useEffect(() => {
    let cancelled = false;
    const warm = () => {
      if (cancelled) return;
      const light = new Image();
      light.decoding = "async";
      light.src = ROBOT_LIGHT_IMG;
      light.decode?.().catch(() => {});
      setLightRobotReady(true);
    };
    const idleId = typeof window.requestIdleCallback === "function"
      ? window.requestIdleCallback(warm, { timeout: 2500 })
      : window.setTimeout(warm, 1200);
    return () => {
      cancelled = true;
      if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idleId);
      else window.clearTimeout(idleId);
    };
  }, []);

  return (
    <section
  id="home"
  ref={ref}
  className="relative flex flex-col justify-start px-8 overflow-hidden md:overflow-visible"
  style={{
    background: "var(--bg)",
    paddingTop: "4.5rem",   /* under navbar */
    paddingBottom: "2rem",  /* small extra space under content */
    minHeight: "unset",
    height: "auto",
  }}
>
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(var(--ink-rgb),1) 1px, transparent 1px), linear-gradient(90deg, rgba(var(--ink-rgb),1) 1px, transparent 1px)",
          backgroundSize: "100px 100px",
        }}
      />
      
      <FloatingCode />

      {/* Robot image panel.
          `suppressHydrationWarning` is deliberate, not a silencer for a real bug:
          HERO_PANEL_BOOT_JS (see layout.tsx) positions this box during HTML parsing
          so the robot can paint before hydration, which means the DOM already holds
          a style attribute React did not write. React's values differ from it only
          by CSSOM rounding (562.516px vs 562.5156364440918) and by string-vs-number
          form, so nothing needs patching and there is nothing to warn about — same
          reason the preloader's data-boot-* elements carry this prop. Geometry is
          still owned by the re-measure below (rAF + ResizeObserver + fonts.ready),
          so a stale position could not persist either way. */}
      <div
        ref={imgRef}
        data-hero-panel=""
        suppressHydrationWarning
        className="pointer-events-none"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ ...imgStyle, containerType: "inline-size" }}      >
        {theme !== "light" && (
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(var(--accent-rgb),0.18) 0%, transparent 70%)",
            opacity: hovered ? 1 : 0.5,
            transition: "opacity 0.4s",
          }}
        />
        )}
        <div ref={parallaxRef} className="absolute inset-0 overflow-hidden" style={{ transform: "translate(0px,0px)" }}>
          {/* Dark-theme robot — stacked & crossfaded so swaps are instant and in sync with the theme transition */}
          <img
            src={ROBOT_IMG}
            alt="Robot"
            draggable={false}
            fetchPriority="high"
            decoding="async"
            className="w-full h-full object-contain"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "contain",
              objectPosition: "center bottom",
              transform: "scale(1)",
              opacity: theme === "light" ? 0 : 1,
              transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
              filter: theme === "light" ? "none" : hovered ? "brightness(1.1)" : "brightness(0.9)",
            }}
          />
          {/* Light-theme robot — mounted on the first light-theme render, or once
              the idle warm-up has cached it. Mounting it unconditionally means the
              browser fetches ~18 KB of alpha-matted pixels that are invisible on
              the default dark theme. */}
          {(theme === "light" || lightRobotReady) && (
            <img
              src={ROBOT_LIGHT_IMG}
              alt=""
              aria-hidden="true"
              draggable={false}
              decoding="async"
              className="w-full h-full object-contain"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "contain",
                objectPosition: "center bottom",
                transform: "scale(1)",
                opacity: theme === "light" ? 1 : 0,
                transition: "opacity 0s",
                filter: "none",
              }}
            />
          )}
        </div>
      </div>

      {/* Tagline — bottom-right of the hero section */}
      <HeroImageTagline />

      <div
        id="hero-currently"
        className="text-xs tracking-[0.25em] mb-2"
        style={{ fontFamily: "JetBrains Mono, monospace", color: "rgba(var(--ink-rgb),0)" }}
        aria-hidden="true"
      />

      <motion.div style={{ y, opacity, position: "relative", zIndex: 1 }}>
        <div className="mb-6" style={{ marginTop: "1.25rem" }}>
  {words.map((w, i) => (
            <div
              key={w.text}
              className="overflow-hidden leading-none"
              style={{ marginLeft: i === 1 ? "clamp(40px, 8vw, 120px)" : 0 }}
            >
              {w.text === "STACK" ? (
                <motion.div
                  initial={{ y: "110%", skewY: 3 }}
                  animate={{ y: 0, skewY: 0 }}
                  transition={{ delay: 0.5 + i * 0.13, duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
                  className="font-black tracking-tighter"
                >
                  <StackLine color={w.color} />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ y: "110%", skewY: 3 }}
                  animate={{ y: 0, skewY: 0 }}
                  transition={{ delay: 0.5 + i * 0.13, duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
                  className="font-black tracking-tighter"
                  style={{
                    fontFamily: "Unbounded, sans-serif",
                    fontSize: "clamp(40px, 11vw, 220px)",
                    color: w.color,
                    letterSpacing: "-0.04em",
                    lineHeight: 0.88,
                  }}
                >
                  {w.text}
                </motion.div>
              )}
            </div>
          ))}
        </div>

        

        <div className="flex items-end justify-between mt-4">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.9 }}
            className="max-w-xs text-sm leading-7"
            style={{ fontFamily: "Inter, sans-serif", color: "rgba(var(--ink-rgb),0.38)", fontWeight: 300 }}
          >
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="flex flex-col items-center gap-3"
          >
            <motion.div
              animate={{ scaleY: [1, 1.4, 1], opacity: [0.3, 0.8, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
              className="w-px h-14 origin-top"
              style={{ background: "linear-gradient(to bottom, var(--accent), transparent)" }}
            />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

// ─── GLOBAL CSS ───────────────────────────────────────────────────────────────

const GLOBAL_CSS = `
  @media (hover: hover) and (pointer: fine) {
    * { cursor: none !important; }
  }
  /* Bento cards: ignore desktop span columns below lg */
  @media (max-width: 1023px) {
    #services [data-bento-card] { grid-column: auto !important; }
  }
  /* Visible scrollbar inside project modal */
  .project-modal-scroll::-webkit-scrollbar { width: 8px; }
  .project-modal-scroll::-webkit-scrollbar-track { background: rgba(var(--ink-rgb),0.04); }
  .project-modal-scroll::-webkit-scrollbar-thumb { background: rgba(var(--accent-rgb),0.45); border-radius: 4px; }
  .project-modal-scroll { scrollbar-width: thin; scrollbar-color: rgba(var(--accent-rgb),0.45) rgba(var(--ink-rgb),0.04); }
  @keyframes hintBob {
    0%, 100% { transform: translateY(0); opacity: 1; }
    50% { transform: translateY(4px); opacity: 0.65; }
  }
  ::-webkit-scrollbar { width: 2px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: rgba(var(--accent-rgb),0.35); }
  @keyframes scanline {
    from { top: -1%; opacity: 0; }
    10% { opacity: 0.6; }
    90% { opacity: 0.6; }
    to { top: 101%; opacity: 0; }
  }
  /* Composited twin of the scanline sweep for the preloader: same 100vh travel,
     but on transform so it never triggers layout while the page is loading. */
  @keyframes scanlineY {
    from { transform: translateY(-1vh); opacity: 0; }
    10% { opacity: 0.6; }
    90% { opacity: 0.6; }
    to { transform: translateY(101vh); opacity: 0; }
  }
  @keyframes floatUp {
    from { transform: translateY(110vh); opacity: 0; }
    5% { opacity: 1; }
    95% { opacity: 1; }
    to { transform: translateY(-20px); opacity: 0; }
  }
  @keyframes blobPulse {
    0%, 100% { transform: translate(-50%,-50%) scale(1); opacity: 1; }
    50% { transform: translate(-50%,-50%) scale(1.25); opacity: 0.65; }
  }
  @keyframes pulseDot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.35; transform: scale(0.7); }
  }
  @keyframes blobShift {
    from { transform: translate(0,0) scale(1); }
    to { transform: translate(45px,-30px) scale(1.18); }
  }
  @keyframes codeFloat {
    from { transform: translateX(0); opacity: 0.8; }
    to { transform: translateX(22px); opacity: 0.25; }
  }
  @keyframes dotWave {
    0%, 100% { opacity: 0.07; transform: scale(0.5); }
    50% { opacity: 0.6; transform: scale(1.6); }
  }
  @keyframes spectrumShift {
    from { filter: hue-rotate(0deg) brightness(1); }
    to { filter: hue-rotate(50deg) brightness(1.08); }
  }
  @keyframes radarRing {
    0% { transform: scale(0.2); opacity: 0.7; }
    100% { transform: scale(4.5); opacity: 0; }
  }
  @keyframes cursorOrbitSpin {
    from { transform: rotate(0deg) translate(13px, 0); }
    to { transform: rotate(360deg) translate(13px, 0); }
  }
  @keyframes cursorOrbitSpinReverse {
    from { transform: rotate(0deg) translate(10px, 0); }
    to { transform: rotate(-360deg) translate(10px, 0); }
  }
  @keyframes orbitSpin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes orbitSpinReverse {
    from { transform: rotate(0deg); }
    to { transform: rotate(-360deg); }
  }
  @keyframes heroImgFloat {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    25% { transform: translateY(-8px) rotate(-1.2deg); }
    50% { transform: translateY(0) rotate(0deg); }
    75% { transform: translateY(6px) rotate(1deg); }
  }
`;

// ─── ROOT APP ────────────────────────────────────────────────────────────────

export default function App() {
  const [loaded, setLoaded] = useState(false);
  // The below-fold page mounts in a *transition*, one commit after the preloader
  // has been told to leave. The order of events is unchanged, but React is now
  // free to yield while it renders every section, so the 0.9s wipe animates on an
  // unblocked main thread instead of competing with ~350 elements' worth of
  // commits in a single long task. Nothing visible changes: every one of these
  // sections is off-screen and its reveal is IntersectionObserver-gated, and the
  // overlay is still covering the viewport while they mount.
  const [sectionsReady, setSectionsReady] = useState(false);
  const [theme, setTheme] = useState<Theme>("dark");

  // First load is ALWAYS dark — no persistence, no restore (per spec).

  // Keep html/body background in sync (covers overscroll areas + light theme).
  useEffect(() => {
    const c = theme === "light" ? "#F4F1E8" : "#030303";
    document.body.style.backgroundColor = c;
    document.documentElement.style.backgroundColor = c;
  }, [theme]);

  // The full page now ships in the static HTML, so lock scrolling while the
  // preloader overlay is up — parity with the previous "no content yet" state.
  useEffect(() => {
    if (loaded) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [loaded]);

  // Mounting the below-fold page is deferred by one commit and made interruptible
  // (see `sectionsReady` above). `loaded` itself stays urgent so the preloader's
  // exit wipe starts at exactly the same moment it always has.
  useEffect(() => {
    if (!loaded) return;
    startTransition(() => setSectionsReady(true));
  }, [loaded]);

  const toggleTheme = () =>
    setTheme((t) => (t === "dark" ? "light" : "dark"));

  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (!loaded) return;
    const lenis = new Lenis({
      duration: 1.3,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    lenisRef.current = lenis;
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    const raf = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, [loaded]);

  const scrollTo = (id: string) => {
    if (id === "top") {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(0);
        return;
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      if (lenisRef.current) lenisRef.current.scrollTo(el);
      else el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div data-theme={theme} style={{ background: "var(--bg)", transition: "background-color 0.5s ease" }}>
        <GrainOverlay />
        <CustomCursor />
        <ThemeToggle />
        <AnimatePresence>
          {!loaded && <Preloader key="preloader" onDone={() => setLoaded(true)} />}
        </AnimatePresence>
        {/* Nav + hero ship in the static HTML so FCP/LCP never wait for JS. Every
            section below the fold mounts after the reveal, exactly as it did
            before: their bytes stay out of the HTML and out of the hydration
            window (they are whileInView-animated and off-screen, so nothing about
            their look or timing changes). The mount is one transition commit
            later (`sectionsReady`) purely so React can yield through it. */}
        <motion.div key="site" initial={false} animate={{ opacity: 1 }}>
          <ScrollProgress />
          <Nav onScrollTo={scrollTo} sectionsReady={sectionsReady} />
          <HeroSection />
          {sectionsReady && <BelowFold />}
        </motion.div>
      </div>
      </ThemeContext.Provider>
    </>
  );
}