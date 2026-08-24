import { useState, useEffect, useRef } from "react";
import Lenis from "lenis";
import { motion, AnimatePresence, useScroll, useTransform } from "motion/react";

// ─── DATA ────────────────────────────────────────────────────────────────────

const PROJECTS = [
  { id: 1, title: "CRYPTEX", category: "DeFi Trading Platform", year: "2024", tags: ["Next.js", "Solidity", "Web3"], image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=900&h=560&fit=crop&auto=format", accent: "#FF3B00" },
  { id: 2, title: "LUMINA AI", category: "AI Content Engine", year: "2024", tags: ["React", "Python", "OpenAI"], image: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=900&h=560&fit=crop&auto=format", accent: "#C8FF00" },
  { id: 3, title: "NEXUS", category: "Real-time Collaboration", year: "2023", tags: ["WebSockets", "Redis", "Docker"], image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=900&h=560&fit=crop&auto=format", accent: "#6B2FFA" },
  { id: 4, title: "ORBIT", category: "SaaS Analytics Dashboard", year: "2023", tags: ["TypeScript", "PostgreSQL", "AWS"], image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&h=560&fit=crop&auto=format", accent: "#00D4FF" },
];

const STACK = ["React", "Next.js", "TypeScript", "Node.js", "Python", "PostgreSQL", "Redis", "Docker", "AWS", "GraphQL", "Prisma", "Tailwind", "Three.js", "Figma", "Kubernetes"];
const ATTRIBUTES = ["SCALABLE", "PERFORMANT", "RESILIENT", "ELEGANT", "CRAFTED", "PRECISE", "TESTED", "DEPLOYED", "SECURE", "TYPED", "OBSESSIVE", "INTENTIONAL"];
const FLOATING_CODE = ["const solve = (x) => x ** 2;", "git push origin main", "docker compose up --build", "SELECT * FROM dreams;", "npm run build:production", "async function deploy() {}", "kubectl apply -f k8s/", "type Future = Promise<void>;", "@app.route('/api/v2')", "git commit -m 'ship it'"];
const ROLES = ["ENGINEER", "CREATOR", "ARCHITECT", "BUILDER", "DREAMER"];
const MANIFESTO = [
  { left: "GREAT CODE IS", right: "INVISIBLE" },
  { left: "PERFORMANCE IS", right: "A FEATURE" },
  { left: "DESIGN AND CODE", right: "ARE ONE" },
  { left: "SHIP FAST,", right: "OBSESS QUALITY" },
];
const TERMINAL_SEQ = [
  { type: "cmd", text: "$ whoami" },
  { type: "res", text: "  alex.chen  ·  Full Stack Developer & Systems Architect" },
  { type: "blank", text: "" },
  { type: "cmd", text: "$ cat philosophy.txt" },
  { type: "res", text: "  I treat every line of code as a design decision." },
  { type: "res", text: "  Great software is invisible — it just works." },
  { type: "blank", text: "" },
  { type: "cmd", text: "$ ls ~/skills" },
  { type: "res", text: "  react  next.js  typescript  node.js  python  postgresql" },
  { type: "res", text: "  redis  docker  kubernetes  aws  graphql  three.js" },
  { type: "blank", text: "" },
  { type: "cmd", text: "$ node stats.js" },
  { type: "res", text: '  { years: 4, projects: 32, clients: 18, coffee: "∞" }' },
  { type: "blank", text: "" },
  { type: "cmd", text: "$ ping hello@alex.dev --check-availability" },
  { type: "res", text: "  PONG  12ms  ·  status: OPEN_TO_WORK  ✓" },
];

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
  const lens = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"default" | "hover" | "click">("default");
  const mx = useRef(0), my = useRef(0), lx = useRef(0), ly = useRef(0), raf = useRef(0);
  const lastNavDispatch = useRef(0);

  useEffect(() => {
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
    const over = (e: MouseEvent) => setState((e.target as HTMLElement).closest("a,button,[data-hover]") ? "hover" : "default");
    const tick = () => {
      lx.current += (mx.current - lx.current) * 0.45;
      ly.current += (my.current - ly.current) * 0.45;
      const size = state === "hover" ? 36 : 28;
      if (lens.current) {
        lens.current.style.transform = `translate(${lx.current}px, ${ly.current}px) scale(${state === "click" ? 0.85 : state === "hover" ? 1.1 : 1})`;
        lens.current.style.filter = state === "hover" ? "drop-shadow(0 0 12px rgba(255,59,0,0.8))" : "none";
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
  }, [state]);

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
    <div className="fixed inset-0 pointer-events-none z-[300]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`, backgroundRepeat: "repeat", backgroundSize: "200px 200px", opacity: 0.028, mixBlendMode: "overlay" }} />
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
  { num: "02", label: "WORK", id: "work" },
  { num: "03", label: "ABOUT", id: "about" },
  { num: "04", label: "PHILOSOPHY", id: "philosophy" },
  { num: "05", label: "CAPS", id: "capabilities" },
  { num: "06", label: "CONTACT", id: "contact" },
  { num: "07", label: "BUILD", id: "closing" },
];

function Nav({ onScrollTo }: { onScrollTo: (id: string) => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [roleIdx, setRoleIdx] = useState(0);
  const [roleVisible, setRoleVisible] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => {
    const cycle = setInterval(() => {
      setRoleVisible(false);
      setTimeout(() => {
        setRoleIdx(p => (p + 1) % ROLES.length);
        setRoleVisible(true);
      }, 350);
    }, 2200);
    return () => clearInterval(cycle);
  }, []);

  // Track active section via IntersectionObserver
  useEffect(() => {
    const sections = NAV_SECTIONS.map(s => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    if (sections.length === 0) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter(e => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { threshold: [0.3, 0.5, 0.8], rootMargin: "-20% 0px -35% 0px" }
    );
    sections.forEach(s => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  const isExpanded = (id: string) => hoveredId === id || activeId === id;

  return (
    <motion.nav id="main-nav" initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3, duration: 1, ease: [0.16, 1, 0.3, 1] }} className="fixed top-0 left-0 right-0 z-[200] flex items-center justify-between px-8 py-6 transition-all duration-500" style={{ borderBottom: scrolled ? "1px solid rgba(235,235,235,0.06)" : "1px solid transparent", backdropFilter: scrolled ? "blur(12px)" : "none" }}>
      <button onClick={() => onScrollTo("top")} className="text-xs tracking-[0.25em] font-medium transition-opacity hover:opacity-60" style={{ fontFamily: "JetBrains Mono, monospace", color: "#FF3B00" }} data-hover>A.DEV</button>

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
        className="md:hidden flex flex-col items-center justify-center gap-1.5 p-2"
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

      <div className="flex items-center gap-2 text-xs tracking-[0.2em]" style={{ fontFamily: "JetBrains Mono, monospace", color: "rgba(235,235,235,0.3)" }}>
        <div className="overflow-hidden h-7 flex items-center">
          <motion.div
            key={roleIdx}
            initial={{ y: 28, opacity: 0 }}
            animate={roleVisible ? { y: 0, opacity: 1 } : { y: -28, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="text-xs tracking-[0.3em] font-bold"
            style={{ fontFamily: "JetBrains Mono, monospace", color: "#FF3B00" }}
          >
            {ROLES[roleIdx]}
          </motion.div>
        </div>
        <div className="flex gap-1.5">
          {ROLES.map((_, i) => (
            <div key={i} className="rounded-full transition-all duration-300" style={{ width: i === roleIdx ? "16px" : "4px", height: "4px", background: i === roleIdx ? "#FF3B00" : "rgba(235,235,235,0.15)" }} />
          ))}
        </div>
      </div>
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
      style={{ fontFamily: "Unbounded, sans-serif", fontSize: "clamp(72px, 13.5vw, 220px)", color: "transparent", letterSpacing: "-0.04em", lineHeight: 0.88, fontWeight: 900 }}
    >
      {/* Opaque white letters — image does not reach here */}
      <span style={{ position: "relative", zIndex: 1, color: "#EBEBEB" }}>S</span>
      <span style={{ position: "relative", zIndex: 1, color: "#EBEBEB" }}>T</span>
      <span style={{ position: "relative", zIndex: 1, color: "#EBEBEB" }}>A</span>
      {/* Transparent outlined letters — shape visible, image shows through fill */}
      <span id="stack-c" style={{ position: "relative", zIndex: 1, color: "transparent", WebkitTextStroke: "2px rgba(235,235,235,0.9)", paintOrder: "stroke fill" }}>C</span>
      <span style={{ position: "relative", zIndex: 1, color: "transparent", WebkitTextStroke: "2px rgba(235,235,235,0.9)", paintOrder: "stroke fill" }}>K</span>
    </div>
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

  // Measure: image panel spans from "CURRENTLY" down to the "STACK" line bottom,
  // with its left edge at the middle of letter "C" in "STACK" — relative to the hero section.
  useEffect(() => {
    const measure = () => {
      if (!ref.current) return;
      const sectionRect = ref.current.getBoundingClientRect();
      const c = document.getElementById("stack-c");
      const line = document.getElementById("stack-line");
      const currently = document.getElementById("hero-currently");
      if (!c || !line || !currently) return;
      const cRect = c.getBoundingClientRect();
      const lineRect = line.getBoundingClientRect();
      const curRect = currently.getBoundingClientRect();
      const padX = sectionRect.width * 0.06;
      const padY = sectionRect.height * 0.06;
      const left = cRect.left - sectionRect.left + cRect.width / 2;
      const width = sectionRect.right - sectionRect.left - left - padX;
      const nav = document.getElementById("main-nav");
      const navRect = nav?.getBoundingClientRect();
      const top = navRect ? navRect.bottom - sectionRect.top - padY : curRect.top - sectionRect.top + 40 - padY;
      const bottom = sectionRect.bottom - sectionRect.top - padY;
      if (width <= 0 || bottom <= top) return;
      setImgStyle({
        display: "block",
        position: "absolute",
        left,
        width,
        top,
        bottom,
        zIndex: 0,
      });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
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
    return () => { window.removeEventListener("mousemove", move); cancelAnimationFrame(raf.current); };
  }, []);

  return (
    <section id="home" ref={ref} className="relative min-h-screen flex flex-col justify-end px-8 overflow-visible" style={{ background: "#030303", paddingTop: "20svh", paddingBottom: "clamp(60px, 8vw, 100px)" }}>
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(235,235,235,1) 1px, transparent 1px), linear-gradient(90deg, rgba(235,235,235,1) 1px, transparent 1px)", backgroundSize: "100px 100px" }} />
      <div className="absolute pointer-events-none" style={{ top: "20%", left: "35%", width: "700px", height: "700px", background: "radial-gradient(circle, rgba(255,59,0,0.08) 0%, transparent 70%)", transform: "translate(-50%,-50%)", animation: "blobPulse 8s ease-in-out infinite" }} />
      <FloatingCode />

      {/* Robot image — tall right-side panel from "CURRENTLY" to STACK, left edge at middle of "C" */}
      <div
        ref={imgRef}
        className="pointer-events-none"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ ...imgStyle, animation: "heroImgFloat 6s ease-in-out infinite" }}
      >
        {/* Glow behind image */}
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(255,59,0,0.18) 0%, transparent 70%)", opacity: hovered ? 1 : 0.5, transition: "opacity 0.4s" }} />
        {/* Parallax layer */}
        <div ref={parallaxRef} className="absolute inset-0" style={{ transform: "translate(0px,0px)" }}>
          <img
            src={ROBOT_IMG}
            alt="Robot"
            draggable={false}
            className="w-full h-full object-contain"
            style={{ width: "100%", height: "1000%", objectFit: "contain", transform: hovered ? "scale(1.06)" : "scale(1)", transition: "transform 0.5s cubic-bezier(0.16,,0.3,1)", filter: hovered ? "brightness(1.1)" : "brightness(0.9)" }}
          />
        </div>
      </div>

      <div id="hero-currently" className="text-xs tracking-[0.25em] mb-2" style={{ fontFamily: "JetBrains Mono, monospace", color: "rgba(235,235,235,0)" }} aria-hidden="true" />

      <motion.div style={{ y, opacity, position: "relative", zIndex: 1 }}>
        <div className="mb-6">
          {words.map((w, i) => (
            <div key={w.text} className="overflow-hidden leading-none" style={{ marginLeft: i === 1 ? "clamp(40px, 8vw, 120px)" : 0 }}>
              {w.text === "STACK" ? (
                <motion.div initial={{ y: "110%", skewY: 3 }} animate={{ y: 0, skewY: 0 }} transition={{ delay: 0.5 + i * 0.13, duration: 1.3, ease: [0.16, 1, 0.3, 1] }} className="font-black tracking-tighter">
                  <StackLine color={w.color} />
                </motion.div>
              ) : (
                <motion.div initial={{ y: "110%", skewY: 3 }} animate={{ y: 0, skewY: 0 }} transition={{ delay: 0.5 + i * 0.13, duration: 1.3, ease: [0.16, 1, 0.3, 1] }} className="font-black tracking-tighter" style={{ fontFamily: "Unbounded, sans-serif", fontSize: "clamp(72px, 13.5vw, 220px)", color: w.color, letterSpacing: "-0.04em", lineHeight: 0.88 }}>
                  {w.text}
                </motion.div>
              )}
            </div>
          ))}
        </div>

        {/* Thin accent line under DEV. */}
        <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 1.3, duration: 1.2, ease: [0.16, 1, 0.3, 1] }} className="mb-8 origin-left" style={{ height: "1px", background: "linear-gradient(90deg, #FF3B00, transparent)", width: "clamp(200px, 30vw, 500px)" }} />

        <div className="flex items-end justify-between mt-4">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2, duration: 0.9 }} className="max-w-xs text-sm leading-7" style={{ fontFamily: "Inter, sans-serif", color: "rgba(235,235,235,0.38)", fontWeight: 300 }}>
            Engineering experiences at the intersection of <em style={{ color: "rgba(235,235,235,0.6)", fontStyle: "italic" }}>craft</em> and precision.
          </motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 1 }} className="flex flex-col items-center gap-3">
            <div className="text-xs tracking-[0.3em]" style={{ fontFamily: "JetBrains Mono, monospace", color: "rgba(235,235,235,0.2)" }}>SCROLL</div>
            <motion.div animate={{ scaleY: [1, 1.4, 1], opacity: [0.3, 0.8, 0.3] }} transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }} className="w-px h-14 origin-top" style={{ background: "linear-gradient(to bottom, #FF3B00, transparent)" }} />
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

// ─── TERMINAL ABOUT (NEW) ─────────────────────────────────────────────────────

function TerminalAbout() {
  const { ref, visible } = useInView(0.15);
  const [lines, setLines] = useState<Array<{ text: string; type: string }>>([]);
  const [typing, setTyping] = useState({ text: "", type: "" });
  const [started, setStarted] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const termBodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const blink = setInterval(() => setShowCursor(p => !p), 530);
    return () => clearInterval(blink);
  }, []);

  useEffect(() => {
    if (termBodyRef.current) termBodyRef.current.scrollTop = termBodyRef.current.scrollHeight;
  }, [lines, typing]);

  useEffect(() => {
    if (!visible || started) return;
    setStarted(true);
    let li = 0, ci = 0;
    let completed: Array<{ text: string; type: string }> = [];
    let cancelled = false;
    const step = () => {
      if (cancelled || li >= TERMINAL_SEQ.length) { setTyping({ text: "", type: "" }); return; }
      const item = TERMINAL_SEQ[li];
      if (item.type === "blank") {
        completed = [...completed, { text: "", type: "blank" }];
        setLines([...completed]); setTyping({ text: "", type: "" });
        li++; ci = 0;
        setTimeout(step, 120);
        return;
      }
      if (ci <= item.text.length) {
        setTyping({ text: item.text.slice(0, ci), type: item.type });
        ci++;
        setTimeout(step, item.type === "cmd" ? 58 : 16);
      } else {
        completed = [...completed, { text: item.text, type: item.type }];
        setLines([...completed]); setTyping({ text: "", type: "" });
        li++; ci = 0;
        setTimeout(step, item.type === "cmd" ? 380 : 65);
      }
    };
    setTimeout(step, 700);
    return () => { cancelled = true; };
  }, [visible, started]);

  return (
    <section id="about" ref={ref} className="px-8 py-28 md:py-40" style={{ background: "#030303" }}>
      <div className="max-w-7xl mx-auto">
        <SectionLabel number="01" label="ABOUT" visible={visible} />
        <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

          {/* Left: large bio title */}
          <div>
            {["I BUILD", "THINGS", "THAT LAST."].map((line, i) => (
              <div key={line} className="overflow-hidden" style={{ lineHeight: 1 }}>
                <motion.div initial={{ y: "105%" }} animate={visible ? { y: 0 } : {}} transition={{ duration: 1.1, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }} className="font-black tracking-tighter pb-2" style={{ fontFamily: "Unbounded, sans-serif", fontSize: "clamp(2rem, 5.5vw, 5rem)", color: i === 1 ? "#FF3B00" : "#EBEBEB", letterSpacing: "-0.035em" }}>
                  {line}
                </motion.div>
              </div>
            ))}

            {/* Stats row */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={visible ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.5, duration: 0.8 }} className="flex gap-10 mt-10">
              {[{ n: "04+", l: "YEARS" }, { n: "32+", l: "PROJECTS" }, { n: "18+", l: "CLIENTS" }].map(({ n, l }) => (
                <div key={l}>
                  <div className="font-black leading-none" style={{ fontFamily: "Unbounded, sans-serif", fontSize: "2rem", color: "#EBEBEB", letterSpacing: "-0.03em" }}>{n}</div>
                  <div className="text-xs tracking-[0.22em] mt-1" style={{ fontFamily: "JetBrains Mono, monospace", color: "rgba(235,235,235,0.28)" }}>{l}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: Terminal window */}
          <motion.div initial={{ opacity: 0, y: 40, scale: 0.97 }} animate={visible ? { opacity: 1, y: 0, scale: 1 } : {}} transition={{ duration: 1, delay: 0.25, ease: [0.16, 1, 0.3, 1] }} className="rounded-sm overflow-hidden shadow-2xl" style={{ border: "1px solid rgba(235,235,235,0.1)", boxShadow: "0 0 60px rgba(255,59,0,0.06)" }}>
            {/* Title bar */}
            <div className="flex items-center gap-3 px-4 py-3" style={{ background: "#0D0D0D", borderBottom: "1px solid rgba(235,235,235,0.07)" }}>
              <div className="w-3 h-3 rounded-full" style={{ background: "#FF5F57" }} />
              <div className="w-3 h-3 rounded-full" style={{ background: "#FEBC2E" }} />
              <div className="w-3 h-3 rounded-full" style={{ background: "#28C840" }} />
              <div className="flex-1 text-center text-xs" style={{ fontFamily: "JetBrains Mono, monospace", color: "rgba(235,235,235,0.3)" }}>alex@portfolio: ~</div>
            </div>
            {/* Body */}
            <div ref={termBodyRef} className="p-5 overflow-y-auto" style={{ background: "#050505", minHeight: "340px", maxHeight: "420px" }}>
              {lines.map((line, i) => (
                <div key={i} className="text-sm leading-6" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                  {line.type === "blank" ? <span>&nbsp;</span> : (
                    <span style={{ color: line.type === "cmd" ? "#EBEBEB" : "rgba(235,235,235,0.5)" }}>
                      {line.text}
                    </span>
                  )}
                </div>
              ))}
              {typing.text && (
                <div className="text-sm leading-6" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                  <span style={{ color: typing.type === "cmd" ? "#EBEBEB" : "rgba(235,235,235,0.5)" }}>
                    {typing.text}
                    <span style={{ color: "#FF3B00", opacity: showCursor ? 1 : 0 }}>█</span>
                  </span>
                </div>
              )}
              {!typing.text && (
                <div className="text-sm" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                  <span style={{ color: "#FF3B00", opacity: showCursor ? 1 : 0 }}>█</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── MANIFESTO STRIP (NEW) ────────────────────────────────────────────────────

function ManifestoLine({ left, right, delay }: { left: string; right: string; delay: number }) {
  const { ref, visible } = useInView(0.4);
  return (
    <div ref={ref} className="flex items-baseline justify-between py-5 relative overflow-hidden" style={{ borderBottom: "1px solid rgba(235,235,235,0.05)" }}>
      <div className="overflow-hidden">
        <motion.div
          initial={{ x: "-100%", opacity: 0 }}
          animate={visible ? { x: 0, opacity: 1 } : {}}
          transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
          className="font-black tracking-tighter"
          style={{ fontFamily: "Unbounded, sans-serif", fontSize: "clamp(1.5rem, 4vw, 4rem)", color: "rgba(235,235,235,0.7)", letterSpacing: "-0.035em", lineHeight: 1 }}
        >
          {left}
        </motion.div>
      </div>
      <div className="overflow-hidden">
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={visible ? { x: 0, opacity: 1 } : {}}
          transition={{ duration: 0.9, delay: delay + 0.06, ease: [0.16, 1, 0.3, 1] }}
          className="font-black tracking-tighter text-right"
          style={{ fontFamily: "Unbounded, sans-serif", fontSize: "clamp(1.5rem, 4vw, 4rem)", color: "#FF3B00", letterSpacing: "-0.035em", lineHeight: 1 }}
        >
          {right}
        </motion.div>
      </div>
    </div>
  );
}

function ManifestoStrip() {
  const { ref, visible } = useInView(0.1);
  return (
    <section id="philosophy" ref={ref} className="px-8 py-20 md:py-32 relative overflow-hidden" style={{ background: "#030303" }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(255,59,0,0.03) 0%, transparent 70%)" }} />
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0 }} animate={visible ? { opacity: 1 } : {}} transition={{ duration: 0.6 }} className="text-xs tracking-[0.35em] mb-10" style={{ fontFamily: "JetBrains Mono, monospace", color: "rgba(235,235,235,0.2)" }}>
          ⊹ MY PHILOSOPHY
        </motion.div>
        {MANIFESTO.map((line, i) => (
          <ManifestoLine key={i} left={line.left} right={line.right} delay={i * 0.08} />
        ))}
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
  { id: "01", title: "FULL STACK ENGINEERING", desc: "End-to-end product development — scalable APIs, resilient data layers, and the interfaces humans actually love.", accent: "#FF3B00", Bg: FullStackBg, col: "1 / 3" },
  { id: "02", title: "SYSTEM ARCHITECTURE", desc: "Distributed systems, microservices, and infrastructure designed to handle edge cases and extreme load.", accent: "#6B2FFA", Bg: ArchBg, col: "3" },
  { id: "03", title: "UI/UX ENGINEERING", desc: "Interfaces that feel alive — motion-driven, accessible, pixel-perfect, and built to delight at every interaction.", accent: "#00D4FF", Bg: UIBg, col: "1" },
  { id: "04", title: "CLOUD & DEVOPS", desc: "CI/CD pipelines, containerization, and cloud infrastructure that ships fast and stays stable under pressure.", accent: "#C8FF00", Bg: CloudBg, col: "2 / 4" },
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
          animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 8 }}
          transition={{ duration: 0.35 }}
          className="relative z-10 text-xs leading-5"
          style={{ fontFamily: "Inter, sans-serif", color: "rgba(235,235,235,0.5)", fontWeight: 300, maxWidth: "320px" }}
        >
          {card.desc}
        </motion.p>
        {/* Arrow */}
        <motion.div
          className="absolute bottom-6 right-6 text-sm"
          animate={{ x: hovered ? 0 : 4, opacity: hovered ? 1 : 0, rotate: -45 }}
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
    <section id="capabilities" ref={ref} className="px-8 py-28 md:py-40" style={{ background: "#030303" }}>
      <div className="max-w-7xl mx-auto">
        <SectionLabel number="02" label="CAPABILITIES" visible={visible} />
        <div className="mt-14 grid gap-2" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
          {BENTO_CARDS.map((card, i) => (
            <BentoCard key={card.id} card={card} delay={i * 0.1} visible={visible} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── WORK SECTION (IMPROVED) ─────────────────────────────────────────────────

function WorkSection() {
  const { ref, visible } = useInView(0.1);
  const [activeId, setActiveId] = useState<number | null>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 }), cur = useRef({ x: 0, y: 0 }), raf = useRef(0);

  useEffect(() => {
    const move = (e: MouseEvent) => { pos.current = { x: e.clientX, y: e.clientY }; };
    const tick = () => {
      cur.current.x += (pos.current.x - cur.current.x) * 0.1;
      cur.current.y += (pos.current.y - cur.current.y) * 0.1;
      if (imgRef.current) imgRef.current.style.transform = `translate(${cur.current.x - 160}px,${cur.current.y - 105}px)`;
      raf.current = requestAnimationFrame(tick);
    };
    window.addEventListener("mousemove", move, { passive: true });
    raf.current = requestAnimationFrame(tick);
    return () => { window.removeEventListener("mousemove", move); cancelAnimationFrame(raf.current); };
  }, []);

  return (
    <section id="work" ref={ref} className="px-8 py-28 md:py-40 relative" style={{ background: "#030303" }}>
      {/* Floating thumbnail */}
      <div ref={imgRef} className="fixed top-0 left-0 z-[150] pointer-events-none" style={{ width: "320px", height: "210px", opacity: activeId !== null ? 1 : 0, transition: "opacity 0.35s ease" }}>
        {PROJECTS.map((p) => (
          <div key={p.id} className="absolute inset-0 overflow-hidden" style={{ opacity: activeId === p.id ? 1 : 0, transition: "opacity 0.3s" }}>
            <img src={p.image} alt={p.title} className="w-full h-full object-cover" style={{ transform: "scale(1.06)" }} />
            <div className="absolute inset-0" style={{ background: "rgba(3,3,3,0.25)" }} />
            {/* Project accent corner */}
            <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: PROJECTS.find(x => x.id === activeId)?.accent }} />
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-14">
          <SectionLabel number="03" label="SELECTED WORK" visible={visible} />
          <motion.div initial={{ opacity: 0 }} animate={visible ? { opacity: 1 } : {}} transition={{ delay: 0.3 }} className="text-xs tracking-[0.2em] hidden md:block" style={{ fontFamily: "JetBrains Mono, monospace", color: "rgba(235,235,235,0.2)" }}>
            {PROJECTS.length} PROJECTS
          </motion.div>
        </div>
        {PROJECTS.map((project, i) => (
          <ProjectRow key={project.id} project={project} index={i} parentVisible={visible} onHover={() => setActiveId(project.id)} onLeave={() => setActiveId(null)} />
        ))}
      </div>
    </section>
  );
}

function ProjectRow({ project, index, parentVisible, onHover, onLeave }: { project: typeof PROJECTS[0]; index: number; parentVisible: boolean; onHover: () => void; onLeave: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={parentVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="group cursor-pointer"
      onMouseEnter={() => { setHovered(true); onHover(); }}
      onMouseLeave={() => { setHovered(false); onLeave(); }}
      data-hover
    >
      <div className="flex items-center justify-between py-7 relative overflow-hidden" style={{ borderBottom: "1px solid rgba(235,235,235,0.07)" }}>
        {/* Hover fill from left */}
        <motion.div className="absolute inset-0 pointer-events-none" initial={{ scaleX: 0 }} animate={{ scaleX: hovered ? 1 : 0 }} transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }} style={{ background: `linear-gradient(90deg, ${project.accent}0A 0%, transparent 100%)`, transformOrigin: "left" }} />
        {/* Left accent line on hover */}
        <motion.div className="absolute left-0 top-0 bottom-0 w-px" animate={{ opacity: hovered ? 1 : 0 }} transition={{ duration: 0.3 }} style={{ background: project.accent }} />

        <div className="flex items-center gap-8 lg:gap-14 relative pl-4">
          <div className="text-xs w-6 shrink-0 tabular-nums" style={{ fontFamily: "JetBrains Mono, monospace", color: "rgba(235,235,235,0.22)" }}>0{index + 1}</div>
          <div className="font-black tracking-tighter" style={{ fontFamily: "Unbounded, sans-serif", fontSize: "clamp(1.5rem, 3.2vw, 3rem)", color: hovered ? project.accent : "#EBEBEB", letterSpacing: "-0.035em", lineHeight: 1, transition: "color 0.4s ease" }}>
            {project.title}
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
    <section id="contact" ref={ref} className="relative px-8 py-28 md:py-40 overflow-hidden" style={{ background: "#030303" }} onMouseMove={handleMouseMove}>
      <div ref={sectionRef} className="absolute inset-0 pointer-events-none transition-all duration-300" style={{ background: `radial-gradient(ellipse 60% 60% at ${mouse.x}% ${mouse.y}%, rgba(255,59,0,0.06) 0%, transparent 70%)` }} />

      <div className="max-w-7xl mx-auto relative">
        <div className="flex items-center justify-between mb-16">
          <SectionLabel number="04" label="CONTACT" visible={visible} />
          <LiveClock />
        </div>

        {/* Big heading */}
        <div className="mb-12">
          {[["GOT A", "#EBEBEB"], ["PROJECT?", "#FF3B00"]].map(([text, color], i) => (
            <div key={text} className="overflow-hidden">
              <motion.div initial={{ y: "105%" }} animate={visible ? { y: 0 } : {}} transition={{ duration: 1.1, delay: 0.1 + i * 0.1, ease: [0.16, 1, 0.3, 1] }} className="font-black tracking-tighter leading-none" style={{ fontFamily: "Unbounded, sans-serif", fontSize: "clamp(3rem, 9vw, 9rem)", color, letterSpacing: "-0.04em" }}>
                {text}
              </motion.div>
            </div>
          ))}
        </div>

        {/* Email link */}
        <motion.a
          href="mailto:hello@alex.dev"
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
            <ScrambleText text="hello@alex.dev" trigger={visible} />
          </span>
          <motion.span animate={{ x: emailHovered ? 10 : 0, rotate: emailHovered ? -45 : 0 }} transition={{ duration: 0.35 }} style={{ color: "#FF3B00", fontSize: "1.4rem" }}>→</motion.span>
        </motion.a>

        {/* Response badge */}
        <motion.div initial={{ opacity: 0 }} animate={visible ? { opacity: 1 } : {}} transition={{ delay: 0.6 }} className="flex items-center gap-3 mt-6">
          <div className="text-xs tracking-[0.2em] px-3 py-1.5" style={{ fontFamily: "JetBrains Mono, monospace", color: "#C8FF00", border: "1px solid rgba(200,255,0,0.25)", fontSize: "0.65rem" }}>
            ⚡ RESPONSE TIME &lt; 24HRS
          </div>
        </motion.div>

        {/* Socials */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={visible ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay: 0.7 }} className="flex flex-wrap gap-8 mt-14">
          {["GITHUB", "LINKEDIN", "TWITTER", "DRIBBBLE"].map((s) => (
            <a key={s} href="#" className="text-xs tracking-[0.25em] transition-colors duration-200 hover:text-[#FF3B00]" style={{ fontFamily: "JetBrains Mono, monospace", color: "rgba(235,235,235,0.25)" }} data-hover>{s}</a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── CLOSING SECTION (NEW) ────────────────────────────────────────────────────

function ClosingSection() {
  const { ref, visible } = useInView(0.15);
  return (
    <section id="closing" ref={ref} className="relative px-8 py-28 md:py-40 overflow-hidden" style={{ borderTop: "1px solid rgba(235,235,235,0.05)", background: "#030303" }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 100% 60% at 50% 100%, rgba(255,59,0,0.04) 0%, transparent 70%)" }} />
      <div className="max-w-7xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={visible ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8 }} className="text-xs tracking-[0.4em] mb-10" style={{ fontFamily: "JetBrains Mono, monospace", color: "rgba(235,235,235,0.2)" }}>
          ⊹ OPEN TO NEW OPPORTUNITIES
        </motion.div>

        {["LET'S BUILD", "THE FUTURE."].map((line, i) => (
          <div key={line} className="overflow-hidden">
            <motion.div initial={{ y: "110%", opacity: 0 }} animate={visible ? { y: 0, opacity: 1 } : {}} transition={{ duration: 1.2, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }} className="font-black leading-none tracking-tighter" style={{ fontFamily: "Unbounded, sans-serif", fontSize: "clamp(2.5rem, 9vw, 8rem)", color: i === 0 ? "#EBEBEB" : "#FF3B00", letterSpacing: "-0.04em" }}>
              {line}
            </motion.div>
          </div>
        ))}

        <motion.div initial={{ opacity: 0, scaleX: 0 }} animate={visible ? { opacity: 1, scaleX: 1 } : {}} transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }} className="mx-auto mt-10 mb-10 origin-center" style={{ width: "120px", height: "1px", background: "linear-gradient(90deg, transparent, #FF3B00, transparent)" }} />

        <motion.p initial={{ opacity: 0, y: 16 }} animate={visible ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay: 0.6 }} className="text-sm leading-7 max-w-sm mx-auto" style={{ fontFamily: "Inter, sans-serif", color: "rgba(235,235,235,0.3)", fontWeight: 300 }}>
          Available for full-time roles, freelance engagements, and ambitious projects that push the boundaries of what&apos;s possible.
        </motion.p>
      </div>
    </section>
  );
}

// ─── FOOTER ──────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="px-8 py-7 flex flex-wrap gap-4 items-center justify-between" style={{ borderTop: "1px solid rgba(235,235,235,0.05)", background: "#030303" }}>
      <div className="text-xs tracking-[0.2em]" style={{ fontFamily: "JetBrains Mono, monospace", color: "rgba(235,235,235,0.14)" }}>© 2024 ALEX.DEV — ALL RIGHTS RESERVED</div>
      <div className="text-xs tracking-[0.2em]" style={{ fontFamily: "JetBrains Mono, monospace", color: "rgba(235,235,235,0.14)" }}>DESIGNED & BUILT WITH OBSESSION</div>
    </footer>
  );
}

// ─── GLOBAL CSS ───────────────────────────────────────────────────────────────

const GLOBAL_CSS = `
  * { cursor: none !important; }
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
              <TerminalAbout />
              <ManifestoStrip />
              <BentoCapabilities />
              <WorkSection />
              <ContactSection />
              <ClosingSection />
              <Footer />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
