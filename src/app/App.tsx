import { useState, useEffect, useRef } from "react";
import Lenis from "lenis";
import { motion, AnimatePresence, useScroll, useTransform, type MotionValue } from "motion/react";
import { SiReact, SiNextdotjs, SiTypescript, SiThreedotjs, SiNodedotjs, SiPython, SiGraphql, SiPostgresql, SiDocker, SiKubernetes, SiRedis, SiGo } from "react-icons/si";
import { FiCloud, FiClock, FiDollarSign, FiRefreshCw, FiAward } from "react-icons/fi";
import { FaLinkedinIn, FaGithub, FaInstagram, FaFacebookF, FaTelegram } from "react-icons/fa6";

const SOCIALS = [
  { name: "LinkedIn", href: "https://www.linkedin.com/in/dawitdargie", Icon: FaLinkedinIn },
  { name: "GitHub", href: "https://github.com/dawitdargie", Icon: FaGithub },
  { name: "Instagram", href: "https://www.instagram.com/dawitdargie", Icon: FaInstagram },
  { name: "Facebook", href: "https://www.facebook.com/dawitdargie", Icon: FaFacebookF },
  { name: "Telegram", href: "https://t.me/dawitdargie", Icon: FaTelegram },
];
import type { IconType } from "react-icons";

// ─── DATA ────────────────────────────────────────────────────────────────────

const PROJECTS = [
  {
    id: 1,
    title: "CRYPTEX",
    category: "",
    year: "2024",
    tags: ["Next.js", "Solidity", "Web3"],
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=900&h=560&fit=crop&auto=format",
    accent: "#FF3B00",
    short: "A real-time decentralized trading terminal with live order books, wallet-native auth, and sub-second price streaming across major DEXs.",
    what: "CRYPTEX is a decentralized trading platform that lets users swap tokens, track live order books, and manage a portfolio from their own wallet — no account or custody required.",
    how: "It connects directly to on-chain liquidity through smart-contract routers, streams prices over WebSockets, and signs every transaction client-side so keys never leave the user's device.",
    use: "Connect a Web3 wallet, pick a token pair, review the live quote and slippage, then confirm the swap — positions and history update in real time on the dashboard.",
    built: "Built with Next.js and TypeScript on the front end, Solidity contracts deployed to EVM chains, ethers.js for wallet interaction, and Redis-backed WebSocket channels for price streaming.",
    link: "https://github.com/",
  },
  {
    id: 2,
    title: "LUMINA AI",
    category: "",
    year: "2024",
    tags: ["React", "Python", "OpenAI"],
    image: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=900&h=560&fit=crop&auto=format",
    accent: "#C8FF00",
    short: "An AI writing studio that turns rough briefs into publish-ready articles, social threads, and product copy in your own brand voice.",
    what: "LUMINA AI generates long-form articles, ad copy, and social content from a short brief, learning each brand's tone from examples you upload.",
    how: "Prompts are assembled from your brief, selected tone profile, and retrieved brand examples, then streamed token-by-token from a language model pipeline with automatic fact-and-format post-processing.",
    use: "Paste a topic or brief, choose a format and tone, hit generate, then edit inline and export to Markdown, HTML, or straight to your CMS.",
    built: "React front end with a Python FastAPI backend, OpenAI models orchestrated through a queue-based worker system, PostgreSQL for projects and versions, and SSE for live streaming output.",
    link: "https://github.com/",
  },
  {
    id: 3,
    title: "NEXUS",
    category: "",
    year: "2023",
    tags: ["WebSockets", "Redis", "Docker"],
    image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=900&h=560&fit=crop&auto=format",
    accent: "#6B2FFA",
    short: "A multiplayer workspace where distributed teams co-edit documents, whiteboards, and tasks with conflict-free real-time sync.",
    what: "NEXUS is a real-time collaboration hub where teams co-edit documents and boards simultaneously, seeing every teammate's cursor and changes instantly.",
    how: "Edits are captured as operations and synced over WebSockets using CRDT conflict resolution, fanned out through a Redis pub/sub layer so every client converges to the same state even after disconnects.",
    use: "Create a workspace, invite teammates with a share link, and start editing together — everything syncs live with full version history you can rewind at any time.",
    built: "Node.js WebSocket gateway, Redis pub/sub and presence tracking, Yjs CRDTs for conflict-free merging, React client canvas editor, all containerized with Docker Compose.",
    link: "https://github.com/",
  },
  {
    id: 4,
    title: "ORBIT",
    category: "",
    year: "2023",
    tags: ["TypeScript", "PostgreSQL", "AWS"],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&h=560&fit=crop&auto=format",
    accent: "#00D4FF",
    short: "A product analytics platform that turns raw event streams into live funnels, retention curves, and revenue dashboards.",
    what: "ORBIT ingests product events and turns them into real-time dashboards — funnels, retention cohorts, and revenue metrics — without writing SQL.",
    how: "Events stream into a partitioned PostgreSQL warehouse via an ingestion API, where pre-aggregated rollup tables keep every chart query under 100ms no matter the volume.",
    use: "Drop the tracking snippet into your app, watch events arrive live, then build dashboards by dragging metrics, filters, and date ranges onto customizable panels.",
    built: "TypeScript end to end, Next.js dashboard with a custom charting layer, PostgreSQL with table partitioning and materialized views, deployed on AWS with Lambda ingest and CloudWatch alerting.",
    link: "https://github.com/",
  },
];

const STACK = ["SCALABLE", "PERFORMANT", "RESILIENT", "ELEGANT", "CRAFTED", "PRECISE"];
const ATTRIBUTES = ["TESTED", "DEPLOYED", "SECURE", "TYPED", "OBSESSIVE", "INTENTIONAL"];
const FLOATING_CODE = ["const solve = (x) => x ** 2;", "git push origin main", "docker compose up --build", "SELECT * FROM dreams;", "npm run build:production", "async function deploy() {}", "kubectl apply -f k8s/", "type Future = Promise<void>;", "@app.route('/api/v2')", "git commit -m 'ship it'"];

// ─── HOOKS ───────────────────────────────────────────────────────────────────

function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function useTilt(strength = 10) {
  const ref = useRef<HTMLDivElement>(null);
  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * strength;
    const y = ((e.clientY - r.top) / r.height - 0.5) * strength;
    ref.current.style.transform = `perspective(1000px) rotateY(${x}deg) rotateX(${-y}deg) scale3d(1.02,1.02,1.02)`;
    ref.current.style.transition = "transform 0.08s ease-out";
  };
  const onMouseLeave = () => {
    if (!ref.current) return;
    ref.current.style.transform = "perspective(1000px) rotateY(0deg) rotateX(0deg) scale3d(1,1,1)";
    ref.current.style.transition = "transform 0.7s cubic-bezier(0.03,0.98,0.52,0.99)";
  };
  return { ref, onMouseMove, onMouseLeave };
}

// ─── SCRAMBLE TEXT ───────────────────────────────────────────────────────────

function ScrambleText({ text, trigger, className = "", style = {} }: { text: string; trigger: boolean; className?: string; style?: React.CSSProperties }) {
  const [display, setDisplay] = useState(text.replace(/\S/g, " "));
  const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&";
  const ran = useRef(false);
  useEffect(() => {
    if (!trigger || ran.current) return;
    ran.current = true;
    let iter = 0;
    const iv = setInterval(() => {
      setDisplay(text.split("").map((c, i) => { if (c === " ") return " "; if (i < iter) return text[i]; return CHARS[Math.floor(Math.random() * CHARS.length)]; }).join(""));
      iter += 0.4;
      if (iter >= text.length) { clearInterval(iv); setDisplay(text); }
    }, 25);
    return () => clearInterval(iv);
  }, [trigger, text]);
  return <span className={className} style={style}>{display}</span>;
}

// ─── FLOATING CODE BG ────────────────────────────────────────────────────────

function FloatingCode() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden>
      {FLOATING_CODE.map((line, i) => (
        <div key={i} className="absolute text-xs whitespace-nowrap" style={{ fontFamily: "JetBrains Mono, monospace", color: "rgba(255,59,0,0.06)", left: `${(i * 13 + 5) % 88}%`, animation: `floatUp ${12 + i * 1.3}s linear infinite`, animationDelay: `${-i * 1.5}s` }}>
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
        lens.current.style.filter = state === "hover" ? "drop-shadow(0 0 12px rgba(255,59,0,0.8))" : "none";
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
          <path d="M38 38 L 54 54" stroke="#9AA0A6" strokeWidth="6" strokeLinecap="round" />
          <path d="M38 38 L 54 54" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" />
          <circle cx="28" cy="28" r="20" fill="none" stroke="#9AA0A6" strokeWidth="4" />
          <circle cx="28" cy="28" r="17" fill="rgba(235,235,235,0.08)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <path d="M18 20 Q 24 16 30 22" stroke="rgba(255,255,255,0.4)" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      </div>

      <div
        ref={ring}
        className="fixed top-0 left-0 z-[9998] pointer-events-none rounded-full"
        style={{
          width: "40px",
          height: "40px",
          border: "2px solid rgba(235,235,235,0.5)",
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
    <div className="fixed right-5 top-16 bottom-8 z-[150] w-px hidden md:block" style={{ background: "rgba(235,235,235,0.05)" }}>
      <motion.div className="w-full origin-top" style={{ background: "linear-gradient(to bottom, #FF3B00, rgba(255,59,0,0.2))", scaleY, height: "100%" }} />
    </div>
  );
}

// ─── PRELOADER ────────────────────────────────────────────────────────────────

function Preloader({ onDone }: { onDone: () => void }) {
  const [count, setCount] = useState(0);
  const [glitch, setGlitch] = useState("   ");
  const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
  useEffect(() => {
    const gi = setInterval(() => { setGlitch(Array.from({ length: 3 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join("")); }, 70);
    let n = 0;
    const ci = setInterval(() => {
      n += Math.floor(Math.random() * 5) + 1;
      if (n >= 100) { n = 100; clearInterval(ci); clearInterval(gi); setGlitch("   "); setTimeout(onDone, 500); }
      setCount(n);
    }, 35);
    return () => { clearInterval(gi); clearInterval(ci); };
  }, [onDone]);
  return (
    <motion.div className="fixed inset-0 z-[9000] flex flex-col items-center justify-center overflow-hidden" style={{ background: "#030303", clipPath: "inset(0 0 0% 0)" }} exit={{ clipPath: "inset(0 0 100% 0)", transition: { duration: 0.9, ease: [0.76, 0, 0.24, 1] } }}>
      <div className="absolute left-0 right-0 h-px z-10 pointer-events-none" style={{ background: "linear-gradient(90deg, transparent, #FF3B00, transparent)", animation: "scanline 3s linear infinite", top: `${count}%`, opacity: 0.6 }} />
      <div className="relative select-none">
        <div className="font-black tabular-nums" style={{ fontFamily: "Unbounded, sans-serif", fontSize: "clamp(5rem, 20vw, 18rem)", color: "#EBEBEB", letterSpacing: "-0.05em", lineHeight: 1 }}>
          {String(count).padStart(3, "0")}
        </div>
        <div className="absolute inset-0 flex items-center justify-center font-black tabular-nums select-none pointer-events-none" style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "clamp(5rem, 20vw, 18rem)", color: "#FF3B00", letterSpacing: "-0.05em", lineHeight: 1, opacity: count < 100 ? 0.18 : 0, transition: "opacity 0.3s" }}>
          {glitch}
        </div>
      </div>
      <div className="mt-8 w-72 overflow-hidden" style={{ height: "1px", background: "rgba(235,235,235,0.08)" }}>
        <motion.div className="h-full" style={{ background: "#FF3B00" }} animate={{ width: `${count}%` }} transition={{ duration: 0.08, ease: "linear" }} />
      </div>
      <div className="mt-5 text-xs tracking-[0.3em] uppercase" style={{ fontFamily: "JetBrains Mono, monospace", color: "rgba(235,235,235,0.25)" }}>
        SYS_INIT — LOADING PORTFOLIO
      </div>
    </motion.div>
  );
}

// ─── SECTION LABEL ───────────────────────────────────────────────────────────

function SectionLabel({ number, label, visible }: { number: string; label: string; visible: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={visible ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.7 }} className="flex items-center gap-5">
      <div className="text-xs tracking-[0.3em]" style={{ fontFamily: "JetBrains Mono, monospace", color: "#FF3B00" }}>{number} — {label}</div>
      <div className="flex-1 h-px" style={{ background: "rgba(235,235,235,0.07)" }} />
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

function Nav({ onScrollTo }: { onScrollTo: (id: string) => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  // Track active section via IntersectionObserver
  useEffect(() => {
    const sections = NAV_SECTIONS.map(s => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    if (sections.length === 0) return;
    // Detect whichever section crosses a thin band at the vertical middle of the viewport.
    // Works uniformly for short and tall sections (ratio-based thresholds fail on tall ones).
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) setActiveId(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach(s => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  const isExpanded = (id: string) => hoveredId === id || activeId === id;

  return (
    <motion.nav id="main-nav" initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3, duration: 1, ease: [0.16, 1, 0.3, 1] }} className="fixed top-0 left-0 right-0 z-[200] flex items-center justify-between px-8 py-6 transition-all duration-500" style={{ borderBottom: scrolled ? "1px solid rgba(235,235,235,0.06)" : "1px solid transparent", backdropFilter: scrolled ? "blur(12px)" : "none" }}>
      <button onClick={() => onScrollTo("top")} className="text-xs tracking-[0.25em] font-medium transition-opacity hover:opacity-60" style={{ fontFamily: "JetBrains Mono, monospace", color: "#FF3B00" }} data-hover>DAWIT</button>

      {/* Desktop nav */}
      <div className="hidden md:flex items-center gap-3">
        {NAV_SECTIONS.map(({ num, label, id }) => {
          const expanded = isExpanded(id);
          const active = activeId === id;
          const color = active ? "#FF3B00" : hoveredId === id ? "#EBEBEB" : "rgba(235,235,235,0.45)";
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
          className="block w-6 h-0.5 bg-[#EBEBEB] origin-center"
          style={{
            transform: menuOpen ? "rotate(45deg) translateY(4.5px)" : "rotate(-12deg)",
            transition: "transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        />
        <span
          className="block w-6 h-0.5 bg-[#EBEBEB]"
          style={{
            opacity: menuOpen ? 0 : 1,
            transform: menuOpen ? "scaleX(0)" : "scaleX(1)",
            transition: "opacity 0.2s ease, transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        />
        <span
          className="block w-6 h-0.5 bg-[#EBEBEB] origin-center"
          style={{
            transform: menuOpen ? "rotate(-45deg) translateY(-4.5px)" : "rotate(12deg)",
            transition: "transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        />
      </button>

      {/* Mobile nav panel */}
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="md:hidden absolute top-full left-0 right-0 border-b border-white/5"
          style={{ background: "rgba(3,3,3,0.95)", backdropFilter: "blur(12px)" }}
        >
          <div className="flex flex-col items-start gap-1 px-8 py-6">
            {NAV_SECTIONS.map(({ num, label, id }) => {
              const active = activeId === id;
              const color = active ? "#FF3B00" : "#EBEBEB";
          return (
            <button
              key={id}
              data-id={id}
              onClick={() => { onScrollTo(id); setMenuOpen(false); }}
              onMouseEnter={() => setHoveredId(id)}
              onMouseLeave={() => setHoveredId(null)}
              data-hover
              className="text-left text-sm tracking-[0.15em] transition-colors duration-200"
              style={{ fontFamily: "JetBrains Mono, monospace", color, padding: "8px 0", display: "flex", alignItems: "center", gap: "10px" }}
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

const ROBOT_IMG = "/robot.jpeg";

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
      <span style={{ position: "relative", zIndex: 1, color: "#EBEBEB" }}>S</span>
      <span style={{ position: "relative", zIndex: 1, color: "#EBEBEB" }}>T</span>
      <span style={{ position: "relative", zIndex: 1, color: "#EBEBEB" }}>A</span>
      <span
        id="stack-c"
        style={{
          position: "relative",
          zIndex: 1,
          color: "transparent",
          WebkitTextStroke: "2px rgba(235,235,235,0.9)",
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
          WebkitTextStroke: "2px rgba(235,235,235,0.9)",
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
            color: "#EBEBEB",
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

// ─── HERO SECTION (IMPROVED) ─────────────────────────────────────────────────

function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, -180]);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const words = [{ text: "FULL", color: "#EBEBEB" }, { text: "STACK", color: "#EBEBEB" }, { text: "DEV.", color: "#FF3B00" }];
  const imgRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const [imgStyle, setImgStyle] = useState<React.CSSProperties>({ display: "none" });
  const [hovered, setHovered] = useState(false);
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
    const t1 = window.setTimeout(measure, 120);
    const t2 = window.setTimeout(measure, 500);
    const t3 = window.setTimeout(measure, 1200);

    window.addEventListener("resize", measure);
    const ro = new ResizeObserver(measure);
    if (ref.current) ro.observe(ref.current);

    // Re-measure when fonts finish loading (letter positions change)
    if (document.fonts?.ready) {
      document.fonts.ready.then(measure).catch(() => {});
    }

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.removeEventListener("resize", measure);
      ro.disconnect();
    };
  }, []);

  // Cursor parallax — image moves slightly toward the cursor
  useEffect(() => {
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

  return (
    <section
  id="home"
  ref={ref}
  className="relative flex flex-col justify-start px-8 overflow-hidden md:overflow-visible"
  style={{
    background: "#030303",
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
            "linear-gradient(rgba(235,235,235,1) 1px, transparent 1px), linear-gradient(90deg, rgba(235,235,235,1) 1px, transparent 1px)",
          backgroundSize: "100px 100px",
        }}
      />
      
      <FloatingCode />

      {/* Robot image panel */}
      <div
        ref={imgRef}
        className="pointer-events-none"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ ...imgStyle, containerType: "inline-size" }}      >
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(255,59,0,0.18) 0%, transparent 70%)",
            opacity: hovered ? 1 : 0.5,
            transition: "opacity 0.4s",
          }}
        />
        <div ref={parallaxRef} className="absolute inset-0 overflow-hidden" style={{ transform: "translate(0px,0px)" }}>
          <img
            src={ROBOT_IMG}
            alt="Robot"
            draggable={false}
            className="w-full h-full object-contain"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              objectPosition: "center bottom",
transform: "scale(1)",              transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
              filter: hovered ? "brightness(1.1)" : "brightness(0.9)",
            }}
          />
        </div>
      </div>

      {/* Tagline — bottom-right of the hero section */}
      <HeroImageTagline />

      <div
        id="hero-currently"
        className="text-xs tracking-[0.25em] mb-2"
        style={{ fontFamily: "JetBrains Mono, monospace", color: "rgba(235,235,235,0)" }}
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
            style={{ fontFamily: "Inter, sans-serif", color: "rgba(235,235,235,0.38)", fontWeight: 300 }}
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
              style={{ background: "linear-gradient(to bottom, #FF3B00, transparent)" }}
            />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

// ─── DUAL MARQUEE (NEW) ───────────────────────────────────────────────────────

function DualMarquee() {
  const stackDouble = [...STACK, ...STACK];
  const attrDouble = [...ATTRIBUTES, ...ATTRIBUTES];
  return (
    <div className="py-6 overflow-hidden relative" style={{ borderTop: "1px solid rgba(235,235,235,0.06)", borderBottom: "1px solid rgba(235,235,235,0.06)" }}>
      {/* Row 1: tech stack → left */}
      <div className="mb-3">
        <motion.div className="flex gap-10 whitespace-nowrap" animate={{ x: ["0%", "-50%"] }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }}>
          {stackDouble.map((item, i) => (
            <div key={i} className="flex items-center gap-10 shrink-0">
              <span className="text-xs tracking-[0.25em] uppercase" style={{ fontFamily: "JetBrains Mono, monospace", color: "rgba(235,235,235,0.45)" }}>{item}</span>
              <span style={{ color: "rgba(255,59,0,0.3)", fontSize: "0.55rem" }}>✦</span>
            </div>
          ))}
        </motion.div>
      </div>
      {/* Row 2: attributes → right */}
      <div>
        <motion.div className="flex gap-10 whitespace-nowrap" animate={{ x: ["-50%", "0%"] }} transition={{ duration: 45, repeat: Infinity, ease: "linear" }}>
          {attrDouble.map((item, i) => (
            <div key={i} className="flex items-center gap-10 shrink-0">
              <span className="text-xs tracking-[0.35em] uppercase font-bold" style={{ fontFamily: "Unbounded, sans-serif", fontSize: "0.55rem", color: "rgba(235,235,235,0.18)" }}>{item}</span>
              <span style={{ color: "rgba(200,255,0,0.25)", fontSize: "0.45rem" }}>◆</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

// ─── ABOUT — "PORTRAIT CHAMBER" ──────────────────────────────────────────────

function PortraitChamber({ visible }: { visible: boolean }) {
  const [hovered, setHovered] = useState(false);
  const bright = hovered;
  const tilt = useTilt(5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.97 }}
      animate={visible ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 1, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="relative"
    >
      {/* Ambient glow behind the frame */}
      <div
        className="absolute -inset-6 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 60% at 50% 40%, rgba(255,59,0,0.4) 0%, transparent 70%)",
          opacity: bright ? 0.7 : 0.16,
          filter: "blur(12px)",
          transition: "opacity 0.7s ease",
        }}
      />

      {/* Frame */}
      <div
        ref={tilt.ref}
        onMouseMove={tilt.onMouseMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { tilt.onMouseLeave(); setHovered(false); }}
        data-hover
        aria-label="Light up portrait"
        className="relative mx-auto overflow-hidden select-none"
        style={{
          maxWidth: "460px",
          aspectRatio: "4 / 5",
        }}
      >
        {/* The portrait — dark & dormant by default, alive on hover/click */}
        <div className="absolute inset-0" style={{ animation: "heroImgFloat 9s ease-in-out infinite" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/dawit.webp"
            alt="Dawit Dargie"
            draggable={false}
            className="w-full h-full object-cover"
            style={{
              filter: bright ? "grayscale(0) brightness(1.04) contrast(1.02) saturate(1.08)" : "grayscale(1) contrast(1.05)",
              transform: "scale(1.04)",
              transition: "filter 0.7s ease",
            }}
          />
        </div>

        {/* Dark vignette overlay — lifts when lit */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(to top, rgba(3,3,3,0.55) 0%, rgba(3,3,3,0) 40%)",
            opacity: bright ? 0 : 1,
            transition: "opacity 0.7s ease",
          }}
        />

        {/* Scanline sweep */}
        <div
          className="absolute left-0 right-0 h-px pointer-events-none"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(255,59,0,0.5), transparent)",
            animation: "scanline 6s linear infinite",
            opacity: bright ? 0.22 : 0.55,
            transition: "opacity 0.6s ease",
          }}
        />
      </div>
    </motion.div>
  );
}

function AboutSection() {
  const { ref, visible } = useInView(0.15);

  return (
    <section id="about" ref={ref} className="px-8 py-14 md:py-24" style={{ background: "#030303" }}>
      <div className="max-w-7xl mx-auto">
        <SectionLabel number="02" label="ABOUT" visible={visible} />
        <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

          {/* Left: identity + philosophy */}
          <div>
            {[{ t: "DAWIT DARGIE", c: "#EBEBEB" }, { t: "FULL-STACK", c: "#FF3B00" }, { t: "DEVELOPER", c: "#FF3B00" }].map((line, i) => (
              <div key={line.t} className="overflow-hidden" style={{ lineHeight: 1 }}>
                <motion.div initial={{ y: "105%" }} animate={visible ? { y: 0 } : {}} transition={{ duration: 1.1, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }} className="font-black tracking-tighter pb-2 break-words" style={{ fontFamily: "Unbounded, sans-serif", fontSize: "clamp(1.7rem, 4.6vw, 4.2rem)", color: line.c, letterSpacing: "-0.035em" }}>
                  {line.t}
                </motion.div>
              </div>
            ))}

            <motion.div initial={{ opacity: 0, y: 18 }} animate={visible ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.45, duration: 0.8 }} className="mt-8">
              <p className="font-bold text-base sm:text-lg leading-relaxed" style={{ fontFamily: "Inter, sans-serif", color: "#EBEBEB" }}>
                I build complete systems around problems.
              </p>
              <p className="mt-5 text-sm sm:text-base leading-7 sm:leading-8 font-light" style={{ fontFamily: "Inter, sans-serif", color: "rgba(235,235,235,0.55)" }}>
                I start with the problem and the outcome, understand what needs to work, define the users,
                data, rules, and interactions, shape the right system structure and experience, build and
                connect everything end-to-end, then test and refine it until it is reliable, usable, and performant.
              </p>
              <p className="mt-6 text-sm sm:text-base leading-7 font-medium" style={{ fontFamily: "Inter, sans-serif", color: "rgba(235,235,235,0.75)" }}>
                You get <span className="font-black" style={{ color: "#FF3B00" }}>premium-quality work without the premium-agency price.</span>
              </p>
            </motion.div>
          </div>

          {/* Right: portrait chamber */}
          <PortraitChamber visible={visible} />
        </div>
      </div>
    </section>
  );
}
// ─── SKILLS SECTION — "THE STACK ORBIT" ───────────────────────────────────────
const SKILL_ORBITS = [
  { radius: 34, duration: 26, reverse: false, skills: [
    { name: "GO", level: 82, years: 2, accent: "#EBEBEB" },
    { name: "REACT", level: 95, years: 4, accent: "#EBEBEB" },
    { name: "NEXT.JS", level: 92, years: 3, accent: "#EBEBEB" },
    { name: "TYPESCRIPT", level: 94, years: 4, accent: "#EBEBEB" },
    { name: "THREE.JS", level: 80, years: 2, accent: "#EBEBEB" },
  ]},
  { radius: 46, duration: 38, reverse: true, skills: [
    { name: "NODE.JS", level: 91, years: 4, accent: "#EBEBEB" },
    { name: "PYTHON", level: 87, years: 3, accent: "#EBEBEB" },
    { name: "GRAPHQL", level: 84, years: 2, accent: "#EBEBEB" },
    { name: "POSTGRESQL", level: 88, years: 3, accent: "#EBEBEB" },
  ]},
  { radius: 58, duration: 52, reverse: false, skills: [
    { name: "DOCKER", level: 86, years: 3, accent: "#EBEBEB" },
    { name: "KUBERNETES", level: 78, years: 2, accent: "#EBEBEB" },
    { name: "REDIS", level: 82, years: 3, accent: "#EBEBEB" },
    { name: "AWS", level: 85, years: 3, accent: "#EBEBEB" },
  ]},
];

type Skill = typeof SKILL_ORBITS[0]["skills"][0];

const ALL_SKILLS: Skill[] = SKILL_ORBITS.flatMap((o) => o.skills);

const SKILL_ICONS: Record<string, IconType> = {
  REACT: SiReact,
  "NEXT.JS": SiNextdotjs,
  TYPESCRIPT: SiTypescript,
  "THREE.JS": SiThreedotjs,
  "NODE.JS": SiNodedotjs,
  PYTHON: SiPython,
  GRAPHQL: SiGraphql,
  POSTGRESQL: SiPostgresql,
  DOCKER: SiDocker,
  KUBERNETES: SiKubernetes,
  REDIS: SiRedis,
  AWS: FiCloud,
  GO: SiGo,
};

const SKILL_TAGLINES: Record<string, string> = {
  REACT: "Component architecture, hooks mastery, and render-performance tuning.",
  "NEXT.JS": "App router, SSR/ISR and edge runtime — full-stack React at production scale.",
  TYPESCRIPT: "Strict typing, generics and type-level design for zero-surprise codebases.",
  "THREE.JS": "WebGL scenes, shader materials and interactive 3D on the web.",
  "NODE.JS": "Event-driven APIs, streams and real-time services at scale.",
  PYTHON: "Automation, data pipelines, AI integrations and backend tooling.",
  GRAPHQL: "Schema design, resolvers and efficient client-side data graphs.",
  POSTGRESQL: "Data modeling, indexing, partitioning and query optimization.",
  DOCKER: "Reproducible containerized environments from laptop to production.",
  KUBERNETES: "Orchestration, autoscaling and resilient zero-downtime deploys.",
  REDIS: "Caching, pub/sub and sub-millisecond data access layers.",
  AWS: "Serverless, storage, networking and cloud cost discipline.",
  GO: "Concurrent, lightweight backend services and CLI tools powered by goroutines.",
};

function skillIcon(s: Skill): IconType {
  return SKILL_ICONS[s.name] ?? FiCloud;
}

function SkillTile({ skill, index, active, visible, onSelect }: { skill: Skill; index: number; active: boolean; visible: boolean; onSelect: (s: Skill) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.04, duration: 0.45 }}
      onClick={() => onSelect(skill)}
      onMouseEnter={() => onSelect(skill)}
      data-hover
      role="button"
      aria-label={`Inspect ${skill.name}`}
      className="relative flex flex-col justify-between rounded-lg select-none p-2 sm:p-3 min-h-[72px]"
      style={{
        border: `1px solid ${active ? skill.accent : skill.accent + "38"}`,
        background: active ? skill.accent : `${skill.accent}0D`,
        boxShadow: active ? `0 0 28px ${skill.accent}66` : "none",
        transform: active ? "scale(1.05)" : "scale(1)",
        zIndex: active ? 10 : 1,
        transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      <span className="text-[0.5rem] leading-none" style={{ fontFamily: "JetBrains Mono, monospace", color: active ? "rgba(3,3,3,0.6)" : `${skill.accent}99` }}>
        {String(index + 1).padStart(2, "0")}
      </span>
      {(() => {
        const Icon = skillIcon(skill);
        return (
          <span className="flex justify-center items-center leading-none my-1">
            <Icon
              style={{
                width: "clamp(1.5rem, 3.2vw, 2.2rem)",
                height: "auto",
                color: active ? "#030303" : "#EBEBEB",
                filter: active ? "none" : `drop-shadow(0 0 10px ${skill.accent}55)`,
                transition: "color 0.3s ease, filter 0.3s ease",
              }}
            />
          </span>
        );
      })()}
      <div>
        <div className="text-center truncate mb-1" style={{ fontSize: "clamp(0.42rem, 0.85vw, 0.58rem)", letterSpacing: "0.08em", fontFamily: "JetBrains Mono, monospace", color: active ? "#030303" : "rgba(235,235,235,0.5)" }}>
          {skill.name}
        </div>
        <div className="h-[3px] w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
          <div className="h-full rounded-full" style={{ width: `${skill.level}%`, background: active ? "#030303" : skill.accent, transition: "background 0.3s ease" }} />
        </div>
      </div>
    </motion.div>
  );
}


function SkillPanel({ skill, index, visible }: { skill: Skill; index: number; visible: boolean }) {
  return (
    <motion.div key={skill.name} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col h-full">
      <div className="text-[0.55rem] tracking-[0.3em]" style={{ fontFamily: "JetBrains Mono, monospace", color: `${skill.accent}B0` }}>
        ELEMENT_{String(index + 1).padStart(2, "0")} // INSPECT
      </div>
      {(() => {
        const Icon = skillIcon(skill);
        return (
          <div className="mt-4 leading-none">
            <Icon
              style={{
                height: "clamp(3.2rem, 6vw, 4.8rem)",
                width: "auto",
                color: skill.accent,
                filter: `drop-shadow(0 0 22px ${skill.accent}88)`,
              }}
            />
          </div>
        );
      })()}
      <div className="font-black tracking-tight mt-2 break-words" style={{ fontFamily: "Unbounded, sans-serif", fontSize: "clamp(1rem, 1.8vw, 1.5rem)", color: "#EBEBEB", letterSpacing: "-0.02em" }}>
        {skill.name}
      </div>
      <p className="mt-3 text-xs sm:text-sm leading-6 font-light min-h-[3.2rem]" style={{ fontFamily: "Inter, sans-serif", color: "rgba(235,235,235,0.55)" }}>
        {SKILL_TAGLINES[skill.name]}
      </p>

      <div className="mt-auto pt-5">
        <div className="flex justify-between text-[0.55rem] tracking-[0.25em] mb-1.5" style={{ fontFamily: "JetBrains Mono, monospace", color: "rgba(235,235,235,0.35)" }}>
          <span>PROFICIENCY</span>
          <span style={{ color: skill.accent }}>{skill.level}%</span>
        </div>
        <div className="h-[5px] w-full rounded-full overflow-hidden" style={{ background: "rgba(235,235,235,0.07)" }}>
          <motion.div
            key={`${skill.name}-bar`}
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={visible ? { width: `${skill.level}%` } : {}}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            style={{ background: skill.accent, boxShadow: `0 0 10px ${skill.accent}` }}
          />
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[0.55rem] tracking-[0.22em]" style={{ fontFamily: "JetBrains Mono, monospace", color: "rgba(235,235,235,0.3)" }}>
          <span>{skill.years}Y EXPERIENCE</span>
          <span>ELEMENT {index + 1}/{ALL_SKILLS.length} · STABLE</span>
        </div>
      </div>
    </motion.div>
  );
}


function SkillsSection() {
  const { ref, visible } = useInView(0.15);
  const [activeSkill, setActiveSkill] = useState<Skill>(ALL_SKILLS[0]);
  const activeIndex = ALL_SKILLS.findIndex((s) => s.name === activeSkill.name);

  return (
    <section id="skills" ref={ref} className="relative px-5 sm:px-8 py-14 md:py-24 overflow-hidden" style={{ background: "#030303" }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 50% at 30% 40%, rgba(255,59,0,0.05) 0%, transparent 70%)" }} />
      <div className="max-w-7xl mx-auto">
        <SectionLabel number="04" label="SKILLS" visible={visible} />

        {/* Telemetry strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={visible ? { opacity: 1 } : {}}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mt-5 flex flex-wrap gap-x-6 gap-y-1 text-[0.6rem] tracking-[0.25em]"
          style={{ fontFamily: "JetBrains Mono, monospace", color: "rgba(235,235,235,0.25)" }}
        >
          <span><span style={{ color: "#C8FF00" }}>●</span> TABLE ONLINE</span>
          <span>ELEMENTS: {ALL_SKILLS.length}</span>
          <span className="hidden sm:inline">HOVER OR TAP A TILE TO INSPECT</span>
        </motion.div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(280px,400px)_1fr] items-stretch">
          {/* Detail panel */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={visible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative rounded-xl p-6 sm:p-7 order-2 lg:order-1 overflow-hidden"
            style={{ border: "1px solid rgba(235,235,235,0.09)", background: "#070707" }}
          >
            <div className="absolute top-0 left-0 w-10 h-px transition-colors duration-500" style={{ background: activeSkill.accent }} />
            <div className="absolute top-0 left-0 w-px h-10 transition-colors duration-500" style={{ background: activeSkill.accent }} />
            <SkillPanel skill={activeSkill} index={activeIndex} visible={visible} />
          </motion.div>

          {/* Element tile grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 auto-rows-fr gap-2 sm:gap-3 order-1 lg:order-2">
            {ALL_SKILLS.map((skill, i) => (
              <SkillTile
                key={skill.name}
                skill={skill}
                index={i}
                active={activeSkill.name === skill.name}
                visible={visible}
                onSelect={setActiveSkill}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}



// ─── WHY ME — GUARANTEE CARDS ────────────────────────────────────────────────

const GUARANTEES = [
  { title: "Completed on right time", desc: "I respect your time. Projects are completed on schedule without shortcuts or delays.", accent: "#EBEBEB", Icon: FiClock },
  { title: "Affordable price with quality", desc: "You'll get honest, upfront costs. pay for exactly what you get. Quality work, low cost.", accent: "#EBEBEB", Icon: FiDollarSign },
  { title: "Free updates & revisions", desc: "Your vision can evolve. I offer free updates to make sure the final product fits you perfectly.", accent: "#EBEBEB", Icon: FiRefreshCw },
  { title: "No results, no payment", desc: "I stand by my work. If you're not satisfied, you don't pay. Simple and risk-free.", accent: "#EBEBEB", Icon: FiAward },
];

function GuaranteeCard({ item, index, visible }: { item: typeof GUARANTEES[0]; index: number; visible: boolean }) {
  const [hovered, setHovered] = useState(false);
  const tilt = useTilt(6);
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); tilt.onMouseLeave(); }}
      onMouseMove={tilt.onMouseMove}
      ref={tilt.ref}
      data-hover
      className="relative flex flex-col overflow-hidden rounded-xl p-5 sm:p-6 h-full"
      style={{
        background: hovered ? `${item.accent}08` : "#070707",
        border: `1px solid ${hovered ? item.accent + "55" : "rgba(235,235,235,0.08)"}`,
        boxShadow: hovered ? `0 18px 50px ${item.accent}22` : "none",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        transition: "background 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {/* Sweep fill from left */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={false}
        animate={{ scaleX: hovered ? 1 : 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ background: `linear-gradient(90deg, ${item.accent}12 0%, transparent 85%)`, transformOrigin: "left" }}
      />
      {/* Ghost index — top-right decoration */}
      <div
        className="font-black leading-none select-none absolute top-3 right-4 z-10"
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
          color: hovered ? item.accent : `${item.accent}26`,
          letterSpacing: "-0.04em",
          transition: "color 0.4s ease",
        }}
      >
        {String(index + 1).padStart(2, "0")}
      </div>
      {/* Icon badge */}
      <div
        className="relative z-10 flex items-center justify-center rounded-xl shrink-0"
        style={{
          width: "clamp(46px, 5vw, 54px)",
          height: "clamp(46px, 5vw, 54px)",
          background: hovered ? item.accent : `${item.accent}14`,
          border: `1px solid ${hovered ? item.accent : item.accent + "44"}`,
          boxShadow: hovered ? `0 0 26px ${item.accent}55` : "none",
          transform: hovered ? "scale(1.08) rotate(-6deg)" : "scale(1) rotate(0deg)",
          transition: "all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        <item.Icon
          style={{
            width: "clamp(22px, 2.4vw, 26px)",
            height: "clamp(22px, 2.4vw, 26px)",
            color: hovered ? "#030303" : item.accent,
            transition: "color 0.35s ease",
          }}
        />
      </div>
      {/* Title */}
      <h3
        className="font-black tracking-tight mt-5 sm:mt-6 relative z-10 break-words"
        style={{ fontFamily: "Unbounded, sans-serif", fontSize: "clamp(1.05rem, 1.8vw, 1.35rem)", color: hovered ? item.accent : "#EBEBEB", letterSpacing: "-0.02em", lineHeight: 1.25, transition: "color 0.4s ease" }}
      >
        {item.title}
      </h3>
      {/* Description */}
      <p className="mt-3 text-xs sm:text-sm leading-6 font-light relative z-10" style={{ fontFamily: "Inter, sans-serif", color: "rgba(235,235,235,0.55)", transition: "color 0.4s ease" }}>
        {item.desc}
      </p>
      {/* Bottom accent line */}
      <div className="mt-auto pt-5 relative z-10">
        <div
          className="h-[2px] w-full origin-left"
          style={{ background: `linear-gradient(90deg, ${item.accent}, transparent)`, transform: hovered ? "scaleX(1)" : "scaleX(0.25)", opacity: hovered ? 1 : 0.35, transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)" }}
        />
      </div>
    </motion.div>
  );
}

function WhyMeSection() {
  const { ref, visible } = useInView(0.1);
  return (
    <section id="why-me" ref={ref} className="px-5 sm:px-8 py-12 md:py-20 relative overflow-hidden" style={{ background: "#030303" }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(255,59,0,0.03) 0%, transparent 70%)" }} />
      <div className="max-w-7xl mx-auto">
        <SectionLabel number="05" label="WHY CHOOSE ME" visible={visible} />
        <motion.div
          initial={{ opacity: 0 }}
          animate={visible ? { opacity: 1 } : {}}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mt-5 text-[0.6rem] tracking-[0.25em]"
          style={{ fontFamily: "JetBrains Mono, monospace", color: "rgba(235,235,235,0.25)" }}
        >
          // FOUR GUARANTEES · ZERO RISK
        </motion.div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-stretch">
          {GUARANTEES.map((item, i) => (
            <GuaranteeCard key={item.title} item={item} index={i} visible={visible} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── BENTO CAPABILITIES (NEW) ─────────────────────────────────────────────────

function FullStackBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 80% at 25% 50%, rgba(255,59,0,0.1) 0%, transparent 70%)", animation: "blobShift 7s ease-in-out infinite alternate" }} />
      {["const App = () => {", "interface Props {", "  children: ReactNode", "async function build(", "  return <Future />;"].map((line, i) => (
        <div key={i} className="absolute text-xs whitespace-nowrap select-none" style={{ fontFamily: "JetBrains Mono, monospace", color: "rgba(255,59,0,0.1)", top: `${15 + i * 18}%`, left: "8%", animation: `codeFloat ${3.5 + i * 0.4}s ease-in-out infinite alternate`, animationDelay: `${i * 0.25}s` }}>
          {line}
        </div>
      ))}
    </div>
  );
}

function ArchBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", padding: "8px" }}>
      {Array.from({ length: 64 }, (_, i) => {
        const row = Math.floor(i / 8), col = i % 8;
        return (
          <div key={i} className="flex items-center justify-center">
            <div className="w-1 h-1 rounded-full" style={{ background: "rgba(107,47,250,0.5)", animation: "dotWave 3s ease-in-out infinite", animationDelay: `${(row + col) * 0.085}s` }} />
          </div>
        );
      })}
    </div>
  );
}

function UIBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(0,212,255,0.07) 0%, rgba(107,47,250,0.07) 50%, rgba(255,59,0,0.07) 100%)", animation: "spectrumShift 5s ease-in-out infinite alternate" }} />
      <div className="absolute" style={{ top: "12%", left: "8%", width: "44%", height: "22%", border: "1px solid rgba(0,212,255,0.18)" }} />
      <div className="absolute" style={{ top: "42%", left: "8%", width: "84%", height: "14%", border: "1px solid rgba(0,212,255,0.12)" }} />
      <div className="absolute" style={{ top: "65%", left: "8%", width: "36%", height: "22%", border: "1px solid rgba(107,47,250,0.18)", borderRadius: "50%" }} />
      <div className="absolute" style={{ top: "65%", right: "8%", width: "36%", height: "22%", border: "1px solid rgba(107,47,250,0.12)" }} />
    </div>
  );
}

function CloudBg() {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="absolute rounded-full" style={{ border: `1px solid rgba(0,212,255,${0.2 - i * 0.03})`, width: `${i * 16}%`, height: `${i * 16}%`, animation: "radarRing 3.5s ease-out infinite", animationDelay: `${i * 0.55}s` }} />
      ))}
      <div className="w-2 h-2 rounded-full z-10" style={{ background: "#00D4FF", boxShadow: "0 0 10px #00D4FF, 0 0 20px rgba(0,212,255,0.4)" }} />
    </div>
  );
}

const BENTO_CARDS = [
  { id: "01", title: "FULL STACK ENGINEERING", desc: "End-to-end product development — scalable APIs, resilient data layers, and the interfaces humans actually love.", accent: "#EBEBEB", Bg: FullStackBg, col: "1 / 3" },
  { id: "02", title: "SYSTEM ARCHITECTURE", desc: "Distributed systems, microservices, and infrastructure designed to handle edge cases and extreme load.", accent: "#EBEBEB", Bg: ArchBg, col: "3" },
  { id: "03", title: "UI/UX ENGINEERING", desc: "Interfaces that feel alive — motion-driven, accessible, pixel-perfect, and built to delight at every interaction.", accent: "#EBEBEB", Bg: UIBg, col: "1" },
  { id: "04", title: "CLOUD & DEVOPS", desc: "CI/CD pipelines, containerization, and cloud infrastructure that ships fast and stays stable under pressure.", accent: "#EBEBEB", Bg: CloudBg, col: "2 / 4" },
];

function BentoCard({ card, delay, visible }: { card: typeof BENTO_CARDS[0]; delay: number; visible: boolean }) {
  const tilt = useTilt(8);
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{ gridColumn: card.col }}
      data-bento-card
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      data-hover
    >
      <div
        ref={tilt.ref}
        onMouseMove={tilt.onMouseMove}
        onMouseLeave={tilt.onMouseLeave}
        className="relative p-8 h-64 flex flex-col justify-between overflow-hidden"
        style={{ background: "#0A0A0A", border: `1px solid ${hovered ? card.accent + "30" : "rgba(235,235,235,0.07)"}`, transition: "border-color 0.4s ease" }}
      >
        <card.Bg />
        {/* Content */}
        <div className="relative z-10">
          <div className="text-xs tracking-[0.3em] mb-3" style={{ fontFamily: "JetBrains Mono, monospace", color: card.accent, opacity: 0.7 }}>{card.id}</div>
          <div className="font-black leading-tight" style={{ fontFamily: "Unbounded, sans-serif", fontSize: "clamp(0.9rem, 1.5vw, 1.2rem)", color: hovered ? card.accent : "#EBEBEB", letterSpacing: "-0.02em", transition: "color 0.4s ease" }}>
            {card.title}
          </div>
        </div>
        <motion.p
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="relative z-10 text-xs leading-5"
          style={{ fontFamily: "Inter, sans-serif", color: "rgba(235,235,235,0.5)", fontWeight: 300, maxWidth: "320px" }}
        >
          {card.desc}
        </motion.p>
        {/* Arrow */}
        <motion.div
          className="absolute bottom-6 right-6 text-sm"
          animate={{ x: hovered ? 0 : 4, opacity: 1, rotate: -45 }}
          transition={{ duration: 0.3 }}
          style={{ color: card.accent }}
        >
          →
        </motion.div>
        {/* Accent corner */}
        <div className="absolute top-0 left-0 w-8 h-px" style={{ background: hovered ? card.accent : "transparent", transition: "background 0.4s" }} />
        <div className="absolute top-0 left-0 w-px h-8" style={{ background: hovered ? card.accent : "transparent", transition: "background 0.4s" }} />
      </div>
    </motion.div>
  );
}

function BentoCapabilities() {
  const { ref, visible } = useInView(0.1);
  return (
    <section id="services" ref={ref} className="px-8 py-14 md:py-24" style={{ background: "#030303" }}>
      <div className="max-w-7xl mx-auto">
        <SectionLabel number="06" label="SERVICES" visible={visible} />
        <div className="mt-14 grid gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {BENTO_CARDS.map((card, i) => (
            <BentoCard key={card.id} card={card} delay={i * 0.1} visible={visible} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── WORK SECTION (IMPROVED) ─────────────────────────────────────────────────

// ─── PROJECT DETAIL MODAL ─────────────────────────────────────────────────────

function ProjectModal({ project, onClose }: { project: typeof PROJECTS[0]; onClose: () => void }) {
  const [ctaHovered, setCtaHovered] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const check = () => setShowHint(el.scrollHeight > el.clientHeight + 8 && el.scrollTop < 12);
    check();
    // re-check after images load
    const t = window.setTimeout(check, 600);
    el.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      window.clearTimeout(t);
      el.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, []);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", esc);
    // Freeze the background page; the box scrolls natively (data-lenis-prevent)
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", esc);
      document.documentElement.style.overflow = "";
    };
  }, [onClose]);

  const sections = [
    { label: "WHAT IT DOES", text: project.what },
    { label: "HOW IT WORKS", text: project.how },
    { label: "HOW TO USE IT", text: project.use },
    { label: "HOW IT'S BUILT", text: project.built },
  ];

  return (
    <motion.div
      className="fixed inset-0 z-[500] flex items-center justify-center p-4 sm:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
      data-modal-overlay
    >
      {/* Backdrop — click anywhere outside closes */}
      <div className="absolute inset-0" style={{ background: "rgba(3,3,3,0.85)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }} />

      {/* Box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        ref={boxRef}
        className="project-modal-scroll relative w-full max-w-3xl max-h-[88vh] overflow-y-auto rounded-xl"
        data-lenis-prevent
        style={{
          background: "#0A0A0A",
          border: `1px solid ${project.accent}45`,
          boxShadow: `0 0 90px ${project.accent}25, 0 40px 80px rgba(0,0,0,0.6)`,
        }}
        data-hover
      >
        {/* X close */}
        <button
          onClick={onClose}
          aria-label="Close project details"
          data-hover
          className="absolute top-3 right-3 z-20 w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300 hover:rotate-90"
          style={{ background: "rgba(3,3,3,0.75)", border: "1px solid rgba(235,235,235,0.18)", color: "#EBEBEB", fontSize: "1rem", lineHeight: 1 }}
        >
          ✕
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-[250px_1fr]">
          {/* Left rail: image + meta + CTA */}
          <div
            className="flex flex-col gap-5 p-5 sm:p-6 border-b sm:border-b-0 sm:border-r"
            style={{ borderColor: "rgba(235,235,235,0.08)" }}
          >
            <div className="relative w-full h-36 sm:h-44 overflow-hidden rounded-lg shrink-0">
              <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
              <div className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ background: project.accent }} />
            </div>

            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => setCtaHovered(true)}
              onMouseLeave={() => setCtaHovered(false)}
              data-hover
              className="flex items-center justify-between gap-2 px-4 py-3.5 rounded-lg"
              style={{
                border: `1px solid ${project.accent}${ctaHovered ? "" : "55"}`,
                background: ctaHovered ? `${project.accent}14` : "transparent",
                boxShadow: ctaHovered ? `0 0 34px ${project.accent}44` : "none",
                transition: "all 0.35s ease",
              }}
            >
              <span className="text-[0.62rem] tracking-[0.25em] font-bold whitespace-nowrap" style={{ fontFamily: "JetBrains Mono, monospace", color: ctaHovered ? project.accent : "#EBEBEB", transition: "color 0.35s ease" }}>
                VISIT LIVE SITE
              </span>
              <motion.span animate={{ x: ctaHovered ? 6 : 0, rotate: ctaHovered ? -45 : 0 }} transition={{ duration: 0.3 }} style={{ color: project.accent, fontSize: "1.2rem" }}>
                →
              </motion.span>
            </a>

            <div className="flex flex-col gap-2 text-[0.6rem] tracking-[0.22em]" style={{ fontFamily: "JetBrains Mono, monospace"}}>
              <span style={{ color: project.accent }}>{project.category.toUpperCase()}</span>
              <span style={{ color: "rgba(235,235,235,0.4)" }}>{project.year}</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {project.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 tracking-wider" style={{ border: "1px solid rgba(235,235,235,0.12)", color: "rgba(235,235,235,0.45)" }}>{tag.toUpperCase()}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: title + all details */}
          <div className="p-5 sm:p-7">
            <h3 className="font-black tracking-tighter break-words pr-10 sm:pr-0" style={{ fontFamily: "Unbounded, sans-serif", fontSize: "clamp(1.5rem, 3.5vw, 2.3rem)", color: "#EBEBEB", letterSpacing: "-0.03em", lineHeight: 1.05 }}>
              {project.title}
            </h3>

            <div className="mt-5 grid gap-5">
              {sections.map(({ label, text }) => (
                <div key={label} className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-1 sm:gap-4 items-start">
                  <div className="text-[0.6rem] tracking-[0.25em] pt-1 sm:text-right" style={{ fontFamily: "JetBrains Mono, monospace", color: project.accent, borderRight: `2px solid ${project.accent}66`, paddingRight: "8px" }}>
                    {label}
                  </div>
                  <p className="text-sm leading-6 font-light" style={{ fontFamily: "Inter, sans-serif", color: "rgba(235,235,235,0.62)" }}>
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Scroll hint — shown only when content overflows */}
        <div
          className="sticky bottom-0 left-0 right-0 z-10 pointer-events-none flex justify-center"
          style={{
            padding: "18px 0 10px",
            marginTop: "-46px",
            background: "linear-gradient(to top, rgba(10,10,10,0.95) 30%, transparent)",
            opacity: showHint ? 1 : 0,
            transition: "opacity 0.4s ease",
          }}
        >
          <span
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[0.55rem] tracking-[0.28em]"
            style={{
              fontFamily: "JetBrains Mono, monospace",
              color: project.accent,
              border: `1px solid ${project.accent}44`,
              background: "rgba(10,10,10,0.85)",
              animation: "hintBob 1.6s ease-in-out infinite",
            }}
          >
            SCROLL FOR MORE
            <span style={{ fontSize: "0.7rem" }}>↓</span>
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}

function WorkSection() {
  const { ref, visible } = useInView(0.1);
  const [openProject, setOpenProject] = useState<typeof PROJECTS[0] | null>(null);

  return (
    <section id="work" ref={ref} className="px-8 py-14 md:py-24 relative" style={{ background: "#030303" }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-14">
          <SectionLabel number="03" label="SELECTED WORK" visible={visible} />
          <motion.div initial={{ opacity: 0 }} animate={visible ? { opacity: 1 } : {}} transition={{ delay: 0.3 }} className="text-xs tracking-[0.2em] hidden md:block" style={{ fontFamily: "JetBrains Mono, monospace", color: "rgba(235,235,235,0.2)" }}>
            {PROJECTS.length} PROJECTS
          </motion.div>
        </div>
        {PROJECTS.map((project, i) => (
          <ProjectRow key={project.id} project={project} index={i} parentVisible={visible} onOpen={() => setOpenProject(project)} />
        ))}
      </div>

      <AnimatePresence>
        {openProject && <ProjectModal key="project-modal" project={openProject} onClose={() => setOpenProject(null)} />}
      </AnimatePresence>
    </section>
  );
}

function ProjectRow({ project, index, parentVisible, onOpen }: { project: typeof PROJECTS[0]; index: number; parentVisible: boolean; onOpen: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={parentVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="group cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onOpen}
      role="button"
      aria-label={`Open details for ${project.title}`}
      data-hover
    >
      <div className="flex items-center justify-between py-7 relative overflow-hidden" style={{ borderBottom: "1px solid rgba(235,235,235,0.07)" }}>
        {/* Hover fill from left */}
        <motion.div className="absolute inset-0 pointer-events-none" initial={{ scaleX: 0 }} animate={{ scaleX: hovered ? 1 : 0 }} transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }} style={{ background: `linear-gradient(90deg, ${project.accent}0A 0%, transparent 100%)`, transformOrigin: "left" }} />
        {/* Left accent line on hover */}
        <motion.div className="absolute left-0 top-0 bottom-0 w-px" animate={{ opacity: hovered ? 1 : 0 }} transition={{ duration: 0.3 }} style={{ background: project.accent }} />

        <div className="flex items-start md:items-center gap-4 md:gap-8 lg:gap-14 relative pl-2 sm:pl-4">
          <div className="text-xs w-6 shrink-0 tabular-nums pt-2 md:pt-0" style={{ fontFamily: "JetBrains Mono, monospace", color: "rgba(235,235,235,0.22)" }}>0{index + 1}</div>
          <div className="min-w-0">
            <div className="font-black tracking-tighter break-words" style={{ fontFamily: "Unbounded, sans-serif", fontSize: "clamp(1.15rem, 3.2vw, 3rem)", color: hovered ? project.accent : "#EBEBEB", letterSpacing: "-0.035em", lineHeight: 1.05, transition: "color 0.4s ease" }}>
              {project.title}
            </div>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={parentVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.1 + 0.3, duration: 0.6 }}
              className="mt-2 text-xs sm:text-sm leading-5 sm:leading-6 font-light max-w-xl"
              style={{ fontFamily: "Inter, sans-serif", color: hovered ? "rgba(235,235,235,0.7)" : "rgba(235,235,235,0.4)", transition: "color 0.4s ease" }}
            >
              {project.short}
            </motion.p>
          </div>
        </div>

        <div className="flex items-center gap-5 lg:gap-10 relative pr-2">
          <div className="hidden md:block text-xs tracking-[0.15em]" style={{ fontFamily: "JetBrains Mono, monospace", color: "rgba(235,235,235,0.3)" }}>{project.category}</div>
          <div className="hidden lg:flex gap-2">
            {project.tags.map((tag) => (
              <span key={tag} className="text-xs px-2.5 py-1 tracking-wider" style={{ fontFamily: "JetBrains Mono, monospace", color: hovered ? project.accent : "rgba(235,235,235,0.28)", border: `1px solid ${hovered ? project.accent + "50" : "rgba(235,235,235,0.1)"}`, transition: "all 0.4s ease" }}>{tag}</span>
            ))}
          </div>
          <div className="text-xs tracking-[0.18em]" style={{ fontFamily: "JetBrains Mono, monospace", color: "rgba(235,235,235,0.22)" }}>{project.year}</div>
          <motion.span animate={{ x: hovered ? 6 : 0, rotate: hovered ? -45 : 0 }} transition={{ duration: 0.3 }} style={{ color: hovered ? project.accent : "rgba(235,235,235,0.25)", fontSize: "1.2rem", transition: "color 0.4s" }}>→</motion.span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── CONTACT SECTION (IMPROVED) ──────────────────────────────────────────────

function LiveClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString("en-US", { timeZone: "America/Los_Angeles", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }));
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, []);
  return (
    <div className="flex items-center gap-3">
      <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#C8FF00", animation: "pulseDot 2s ease-in-out infinite" }} />
      <span className="text-xs tracking-[0.2em]" style={{ fontFamily: "JetBrains Mono, monospace", color: "rgba(235,235,235,0.3)" }}>
        SF — {time} PDT
      </span>
    </div>
  );
}

function ContactSection() {
  const { ref, visible } = useInView(0.2);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: 50, y: 50 });
  const [emailHovered, setEmailHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!sectionRef.current) return;
    const r = sectionRef.current.getBoundingClientRect();
    setMouse({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };

  return (
    <section id="contact" ref={ref} className="relative px-8 py-14 md:py-24 overflow-hidden" style={{ background: "#030303" }} onMouseMove={handleMouseMove}>
      <div ref={sectionRef} className="absolute inset-0 pointer-events-none transition-all duration-300" style={{ background: `radial-gradient(ellipse 60% 60% at ${mouse.x}% ${mouse.y}%, rgba(255,59,0,0.06) 0%, transparent 70%)` }} />

      <div className="max-w-7xl mx-auto relative">
        <div className="flex items-center justify-between mb-16">
          <SectionLabel number="07" label="CONTACT" visible={visible} />
          <LiveClock />
        </div>

        {/* Big heading */}
        <div className="mb-12">
          {[["GOT A", "#EBEBEB"], ["PROJECT?", "#FF3B00"]].map(([text, color], i) => (
            <div key={text} className="overflow-hidden">
              <motion.div initial={{ y: "105%" }} animate={visible ? { y: 0 } : {}} transition={{ duration: 1.1, delay: 0.1 + i * 0.1, ease: [0.16, 1, 0.3, 1] }} className="font-black tracking-tighter leading-none break-words" style={{ fontFamily: "Unbounded, sans-serif", fontSize: "clamp(2.2rem, 9vw, 9rem)", color, letterSpacing: "-0.04em" }}>
                {text}
              </motion.div>
            </div>
          ))}
        </div>

        {/* Email link */}
        <motion.a
          href="mailto:dawitdargie2@gmail.com"
          initial={{ opacity: 0, y: 20 }}
          animate={visible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.4 }}
          className="group inline-flex items-center gap-6 pb-3 relative"
          style={{ borderBottom: "1px solid rgba(235,235,235,0.12)" }}
          onMouseEnter={() => setEmailHovered(true)}
          onMouseLeave={() => setEmailHovered(false)}
          data-hover
        >
          <span className="font-light tracking-tight" style={{ fontFamily: "Unbounded, sans-serif", fontSize: "clamp(0.9rem, 2.2vw, 1.8rem)", color: emailHovered ? "#FF3B00" : "rgba(235,235,235,0.55)", letterSpacing: "-0.02em", transition: "color 0.4s ease" }}>
            <ScrambleText text="dawitdargie2@gmail.com" trigger={visible} />
          </span>
          <motion.span animate={{ x: emailHovered ? 10 : 0, rotate: emailHovered ? -45 : 0 }} transition={{ duration: 0.35 }} style={{ color: "#FF3B00", fontSize: "1.4rem" }}>→</motion.span>
        </motion.a>

        {/* Response badge */}
        <motion.div initial={{ opacity: 0 }} animate={visible ? { opacity: 1 } : {}} transition={{ delay: 0.6 }} className="flex items-center gap-3 mt-6">
          <div className="text-xs tracking-[0.2em] px-3 py-1.5" style={{ fontFamily: "JetBrains Mono, monospace", color: "#ff7700", border: "1px solid rgba(200,255,0,0.25)", fontSize: "0.65rem" }}>
            FAST RESPONSE TIME
          </div>
        </motion.div>

        {/* Socials */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={visible ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay: 0.7 }} className="flex flex-wrap gap-3 mt-14">
          {SOCIALS.map(({ name, href, Icon }, i) => (
            <motion.a
              key={name}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={name}
              title={name}
              data-hover
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 400, damping: 18 }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.background = "#FF3B00";
                el.style.borderColor = "#FF3B00";
                el.style.color = "#030303";
                el.style.boxShadow = "0 8px 30px rgba(255,59,0,0.4)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.background = "transparent";
                el.style.borderColor = "rgba(235,235,235,0.12)";
                el.style.color = "rgba(235,235,235,0.55)";
                el.style.boxShadow = "none";
              }}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center"
              style={{
                border: "1px solid rgba(235,235,235,0.12)",
                color: "rgba(235,235,235,0.55)",
                transition: "background 0.3s ease, border-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease",
              }}
            >
              <Icon style={{ width: "1.05rem", height: "1.05rem" }} />
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── FOOTER ──────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="px-8 py-7 flex flex-wrap gap-4 items-center justify-between" style={{ borderTop: "1px solid rgba(235,235,235,0.05)", background: "#030303" }}>
      <div className="text-xs tracking-[0.2em]" style={{ fontFamily: "JetBrains Mono, monospace", color: "rgba(235,235,235,0.14)" }}>©DAWIT DARGIE — ALL RIGHTS RESERVED</div>
    </footer>
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
  .project-modal-scroll::-webkit-scrollbar-track { background: rgba(235,235,235,0.04); }
  .project-modal-scroll::-webkit-scrollbar-thumb { background: rgba(255,59,0,0.45); border-radius: 4px; }
  .project-modal-scroll { scrollbar-width: thin; scrollbar-color: rgba(255,59,0,0.45) rgba(235,235,235,0.04); }
  @keyframes hintBob {
    0%, 100% { transform: translateY(0); opacity: 1; }
    50% { transform: translateY(4px); opacity: 0.65; }
  }
  ::-webkit-scrollbar { width: 2px; }
  ::-webkit-scrollbar-track { background: #030303; }
  ::-webkit-scrollbar-thumb { background: rgba(255,59,0,0.35); }
  @keyframes scanline {
    from { top: -1%; opacity: 0; }
    10% { opacity: 0.6; }
    90% { opacity: 0.6; }
    to { top: 101%; opacity: 0; }
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
      <div style={{ background: "#030303" }}>
        <GrainOverlay />
        <CustomCursor />
        <AnimatePresence>
          {!loaded && <Preloader key="preloader" onDone={() => setLoaded(true)} />}
        </AnimatePresence>
        <AnimatePresence>
          {loaded && (
            <motion.div key="site" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
              <ScrollProgress />
              <Nav onScrollTo={scrollTo} />
              <HeroSection />
              <DualMarquee />
              <AboutSection />
              <WorkSection />
              <SkillsSection />
              <WhyMeSection />
              <BentoCapabilities />
              <ContactSection />
              <Footer />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
