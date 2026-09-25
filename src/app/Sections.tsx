"use client";

// ─── BELOW-THE-FOLD PAGE ─────────────────────────────────────────────────────
//
// Split out of App.tsx so that none of this code is fetched, parsed or hydrated
// before the preloader's counter reaches 100. App.tsx renders it through
// next/dynamic inside the same `sectionsReady` gate that used to hold these
// components inline, so the DOM, the mount order and every
// IntersectionObserver-gated reveal are unchanged — only *when* the module
// arrives moves, to just after the count finishes, while the preloader's 0.9s
// exit wipe is still covering the viewport.
//
// Nothing here is reachable from the hero/nav/preloader, which is what makes the
// move purely subtractive for the first paint: the shared helpers
// (useInView / useTilt / ScrambleText / SectionLabel), the data (SOCIALS /
// PROJECTS / STACK / ATTRIBUTES) and every react-icons import now live in this
// module and are gone from the critical chunk.
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
// The react-icons imports, SOCIALS and the IconType import follow in the moved
// block below (they were lifted verbatim from App.tsx's own import list).

import { SiReact, SiNextdotjs, SiTypescript, SiNodedotjs, SiPython, SiPostgresql, SiDocker, SiKubernetes, SiGo, SiShopify, SiUpwork } from "react-icons/si";
import { FiCloud, FiClock, FiDollarSign, FiRefreshCw, FiAward } from "react-icons/fi";
import { TbApi } from "react-icons/tb";
import { FaLinkedinIn, FaGithub, FaInstagram, FaFacebookF, FaTelegram } from "react-icons/fa6";

const SOCIALS = [
  { name: "LinkedIn", href: "https://www.linkedin.com/in/dawit-dargie-30b43b426", Icon: FaLinkedinIn },
  { name: "Upwork", href: "https://www.upwork.com/freelancers/~019bc6bca616218c7e", Icon: SiUpwork },
  { name: "GitHub", href: "https://github.com/dawitdargie", Icon: FaGithub },
  { name: "Instagram", href: "https://www.instagram.com/dawitdargie1", Icon: FaInstagram },
  { name: "Facebook", href: "https://web.facebook.com/profile.php?id=61588882831030", Icon: FaFacebookF },
  { name: "Telegram", href: "https://t.me/dawitdargie", Icon: FaTelegram },
];
import type { IconType } from "react-icons";
type Project = {
  id: number;
  title: string;
  category: string;
  tags: string[];
  image: string;
  accent: string;
  short: string;
  problem?: string; // optional "THE PROBLEM & SOLUTION" block (\n-separated lines)
  what: string;
  how: string;
  use: string;
  built: string;
  live?: string; // deployed site URL — projects without a live site omit this
  github: string;
};

const PROJECTS: Project[] = [
  {
    id: 1,
    title: "PERFINSIGHT",
    category: "",
    tags: ["Golang", "Neon PostgreSQL", "Docker", "Render"],
    image: "/perfinsight.avif",
    accent: "#FF3B00",
    short: "PerfInsight is a Go performance intelligence platform that turns application telemetry into actionable insights. showing where time goes, what's causing bottlenecks, and what to fix.",
    problem: "THE PROBLEM: Knowing a Go service is slow isn't enough. developers need to know where, why, and what to fix, which raw telemetry and complex observability tools don't clearly provide.\nTHE SOLUTION: PerfInsight traces, analyzes, and explains request performance with evidence and suggested fixes.\nObserve → Analyze → Explain → Suggest a Fix",
    what: "Traces requests and database operations.\nMeasures performance.\nDetects bottlenecks and common issues.\nExplains findings with evidence.\nSuggests fixes.",
    how: "Go App + SDK → Collector → PostgreSQL → Analysis Engine → Report\n\nThe SDK collects telemetry, the collector stores it, and the analysis engine applies deterministic rules to identify and explain performance issues.",
    use: "Install and instrument your Go application, generate traffic, then run an analysis request.\nSee the README for the complete usage instructions.",
    built: "SDK - Instruments Go applications.\nCollector - Receives and stores telemetry.\nAnalysis Engine - Detects performance issues.\nCLI/API - Reports findings and suggested fixes.",
    github: "https://github.com/dawitdargie/perfinsight",
  },
  {
    id: 3,
    title: "HACKSHELF",
    category: "",
    tags: ["Next.js", "Golang", "TanStack", "PostgreSQL", "Docker"],
    image: "/hackshelf.avif",
    accent: "#6B2FFA",
    short: "Online bookstore built for hackers and penetration testers, with complete books readable directly in the browser.",
    problem: "THE PROBLEM: Finding quality cybersecurity books that are free, legally redistributable, and easy to read can be difficult, while existing resources are often scattered across different sites and formats.\nTHE SOLUTION: HackShelf brings legally redistributable books into one platform with search, discovery, reading progress, bookmarks, ratings, and personal libraries.\nDiscover → Read → Save → Continue",
    what: "Provides complete, legally redistributable books.\nHelps discover books through search, filters, and categories.\nTracks reading progress and bookmarks.\nSupports ratings and reviews.\nManages the catalog through a secure admin panel.",
    how: "Next.js Frontend → Go API → PostgreSQL (Auth / Books / Library)\n\nThe frontend communicates with a Go API, which handles authentication, books, reading progress, bookmarks, ratings, reviews, and admin operations. PostgreSQL stores the application data.",
    use: "Browse or search for a book, open it in the browser, and create an account to save books, track progress, bookmark chapters, and review books.\nSee the README for complete setup and usage instructions.",
    built: "Frontend - Next.js application for the catalog, reader, library, and admin UI.\nBackend - Go API handling business logic, authentication, and catalog operations.\nDatabase - PostgreSQL for users, books, chapters, progress, bookmarks, ratings, and reviews.\nSecurity - Hashed passwords, token rotation, rate limiting, and role-based admin access.",
    live: "https://hackshelf.vercel.app",
    github: "https://github.com/dawitdargie/hackshelf",
  },
  {
    id: 4,
    title: "SYSTEMLENS",
    category: "",
    tags: ["TypeScript", "Next.js", "Mermaid.js", "GitHub & Groq APIs"],
    image: "/systemlens.avif",
    accent: "#00D4FF",
    short: "SystemLens makes unfamiliar GitHub repositories easier to understand by turning complex codebases into clear architecture(with visual diagram), explanations, and code-grounded answers.",
    problem: "THE PROBLEM: Understanding an unfamiliar codebase can take days, with hundreds of files and technical details that don't make sense to every audience.\nTHE SOLUTION: SystemLens analyzes a GitHub repository and turns it into structured, role-specific explanations, architecture diagrams, and code-grounded answers.\nAnalyze → Understand → Explore → Ask",
    what: "Analyzes public GitHub repositories.\nMaps architecture, modules, tech stack, and data flow.\nExplains the system for CEOs, PMs, Developers, QA, and Customers.\nVisualizes architecture with interactive diagrams.\nAnswers questions using the actual codebase.",
    how: "GitHub Repo → Repository Analysis → AI Understanding → Profile / Diagram / Chat\n\nIt fetches repository data through GitHub's API, extracts technical facts, uses AI to generate understanding, and grounds code questions in relevant source files.",
    use: "Paste a public GitHub repository URL, click Analyze, choose a perspective, explore the architecture, or ask questions about the codebase.\nSee the README for complete setup and usage instructions.",
    built: "Repository Analyzer - Fetches and extracts repository data.\nAI Engine - Generates profiles, explanations, and answers.\nSSE API - Streams analysis and AI responses in real time.\nCaching - Reduces repeated repository and AI requests.\nFrontend - Presents profiles, diagrams, and code chat.",
    live: "https://systemlenss.vercel.app/",
    github: "https://github.com/dawitdargie/systemlens",
  },
];
const STACK = ["SCALABLE", "PERFORMANT", "RESILIENT", "ELEGANT", "CRAFTED", "PRECISE"];
const ATTRIBUTES = ["TESTED", "DEPLOYED", "SECURE", "TYPED", "OBSESSIVE", "INTENTIONAL"];
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

// ─── SECTION LABEL ───────────────────────────────────────────────────────────

function SectionLabel({ number, label, visible }: { number: string; label: string; visible: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={visible ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.7 }} className="flex items-center gap-5">
      <div className="text-xs tracking-[0.3em]" style={{ fontFamily: "JetBrains Mono, monospace", color: "var(--accent)" }}>{number} — {label}</div>
      <div className="flex-1 h-px" style={{ background: "rgba(var(--ink-rgb),0.07)" }} />
    </motion.div>
  );
}

// ─── DUAL MARQUEE (NEW) ───────────────────────────────────────────────────────

function DualMarquee() {
  const stackDouble = [...STACK, ...STACK];
  const attrDouble = [...ATTRIBUTES, ...ATTRIBUTES];
  return (
    <div
      className="py-6 overflow-hidden relative"
      style={{
        borderTop: "1px solid rgba(var(--ink-rgb),0.06)",
        borderBottom: "1px solid rgba(var(--ink-rgb),0.06)",
        transition: "border-color 0.5s ease",
      }}
    >
      {/* Row 1: tech stack → left */}
      <div className="mb-3">
        <motion.div className="flex gap-10 whitespace-nowrap" animate={{ x: ["0%", "-50%"] }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }}>
          {stackDouble.map((item, i) => (
            <div key={i} className="flex items-center gap-10 shrink-0">
              <span
                className="text-xs tracking-[0.25em] uppercase"
                style={{
                  fontFamily: "JetBrains Mono, monospace",
                  color: "rgba(var(--ink-rgb),0.65)",
                  transition: "color 0.5s ease",
                }}
              >
                {item}
              </span>
              <span
                style={{
                  color: "rgba(var(--accent-rgb),0.3)",
                  fontSize: "0.55rem",
                  transition: "color 0.5s ease",
                }}
              >
                ✦
              </span>
            </div>
          ))}
        </motion.div>
      </div>
      {/* Row 2: attributes → right */}
      <div>
        <motion.div className="flex gap-10 whitespace-nowrap" animate={{ x: ["-50%", "0%"] }} transition={{ duration: 45, repeat: Infinity, ease: "linear" }}>
          {attrDouble.map((item, i) => (
            <div key={i} className="flex items-center gap-10 shrink-0">
              <span
                className="text-xs tracking-[0.35em] uppercase font-bold"
                style={{
                  fontFamily: "Unbounded, sans-serif",
                  fontSize: "0.55rem",
                  color: "rgba(var(--ink-rgb),0.18)",
                  transition: "color 0.5s ease",
                }}
              >
                {item}
              </span>
              <span
                style={{
                  color: "rgba(200,255,0,0.25)",
                  fontSize: "0.45rem",
                  transition: "color 0.5s ease",
                }}
              >
                ◆
              </span>
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
          background: "radial-gradient(ellipse 60% 60% at 50% 40%, rgba(var(--accent-rgb),0.4) 0%, transparent 70%)",
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
            src="/dawit.avif"
            alt="Dawit Dargie"
            draggable={false}
            loading="lazy"
            decoding="async"
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
            background: "linear-gradient(to top, rgba(var(--bg-rgb),0.55) 0%, rgba(var(--bg-rgb),0) 40%)",
            opacity: bright ? 0 : 1,
            transition: "opacity 0.7s ease",
          }}
        />

        {/* Scanline sweep */}
        <div
          className="absolute left-0 right-0 h-px pointer-events-none"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(var(--accent-rgb),0.5), transparent)",
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
    <section id="about" ref={ref} className="px-8 py-14 md:py-24" style={{ background: "var(--bg)" }}>
      <div className="max-w-7xl mx-auto">
        <SectionLabel number="02" label="ABOUT" visible={visible} />
        <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

          {/* Left: identity + philosophy */}
          <div>
            {[{ t: "DAWIT DARGIE", c: "var(--ink)" }, { t: "FULL-STACK", c: "var(--accent)" }, { t: "DEVELOPER", c: "var(--accent)" }].map((line, i) => (
              <div key={line.t} className="overflow-hidden" style={{ lineHeight: 1 }}>
                <motion.div initial={{ y: "105%" }} animate={visible ? { y: 0 } : {}} transition={{ duration: 1.1, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }} className="font-black tracking-tighter pb-2 break-words" style={{ fontFamily: "Unbounded, sans-serif", fontSize: "clamp(1.7rem, 4.6vw, 4.2rem)", color: line.c, letterSpacing: "-0.035em" }}>
                  {line.t}
                </motion.div>
              </div>
            ))}

            <motion.div initial={{ opacity: 0, y: 18 }} animate={visible ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.45, duration: 0.8 }} className="mt-8">
              <p className="font-bold text-base sm:text-lg leading-relaxed" style={{ fontFamily: "Inter, sans-serif", color: "var(--ink)" }}>
                I build complete systems around problems.
              </p>
              <p className="mt-5 text-sm sm:text-base leading-7 sm:leading-8 font-light" style={{ fontFamily: "Inter, sans-serif", color: "rgba(var(--ink-rgb),0.72)" }}>
                I start with the problem and the outcome, understand what needs to work, define the users,
                data, rules, and interactions, shape the right system structure and experience, build and
                connect everything end-to-end, then test and refine it until it is reliable, usable, and performant.
              </p>
              <p className="mt-6 text-sm sm:text-base leading-7 font-medium" style={{ fontFamily: "Inter, sans-serif", color: "rgba(var(--ink-rgb),0.75)" }}>
                You get <span className="font-black" style={{ color: "var(--accent)" }}>premium-quality work without the premium-agency price.</span>
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
    { name: "GO", level: 95, years: 2, accent: "var(--ink)" },
    { name: "REACT", level: 95, years: 4, accent: "var(--ink)" },
    { name: "NEXT.JS", level: 92, years: 3, accent: "var(--ink)" },
    { name: "TYPESCRIPT", level: 94, years: 4, accent: "var(--ink)" },
    { name: "SHOPIFY", level: 86, years: 2, accent: "var(--ink)" },
  ]},
  { radius: 46, duration: 38, reverse: true, skills: [
    { name: "NODE.JS", level: 91, years: 4, accent: "var(--ink)" },
    { name: "PYTHON", level: 87, years: 3, accent: "var(--ink)" },
    { name: "POSTGRESQL", level: 88, years: 3, accent: "var(--ink)" },
    { name: "REST API", level: 90, years: 3, accent: "var(--ink)" },
  ]},
  { radius: 58, duration: 52, reverse: false, skills: [
    { name: "DOCKER", level: 86, years: 3, accent: "var(--ink)" },
    { name: "KUBERNETES", level: 78, years: 2, accent: "var(--ink)" },
    { name: "AWS", level: 85, years: 3, accent: "var(--ink)" },
  ]},
];

type Skill = typeof SKILL_ORBITS[0]["skills"][0];

const ALL_SKILLS: Skill[] = SKILL_ORBITS.flatMap((o) => o.skills);

const SKILL_ICONS: Record<string, IconType> = {
  REACT: SiReact,
  "NEXT.JS": SiNextdotjs,
  TYPESCRIPT: SiTypescript,
  "NODE.JS": SiNodedotjs,
  PYTHON: SiPython,
  POSTGRESQL: SiPostgresql,
  DOCKER: SiDocker,
  KUBERNETES: SiKubernetes,
  AWS: FiCloud,
  GO: SiGo,
  SHOPIFY: SiShopify,
  "REST API": TbApi,
};

const SKILL_TAGLINES: Record<string, string> = {
  REACT: "Component architecture, hooks mastery, and render-performance tuning.",
  "NEXT.JS": "App router, SSR/ISR and edge runtime, full-stack React at production scale.",
  TYPESCRIPT: "Strict typing, generics and type-level design for zero-surprise codebases.",
  "NODE.JS": "Event-driven APIs, streams and real-time services at scale.",
  PYTHON: "Automation, data pipelines, AI integrations and backend tooling.",
  POSTGRESQL: "Data modeling, indexing, partitioning and query optimization.",
  DOCKER: "Reproducible containerized environments from laptop to production.",
  KUBERNETES: "Orchestration, autoscaling and resilient zero-downtime deploys.",
  AWS: "Serverless, storage, networking and cloud cost discipline.",
  GO: "Production-grade Go services built with Gin, goroutines and concurrency patterns, type-safe SQL via sqlc, table-driven testing, and Prometheus/OpenTelemetry observability.",
  SHOPIFY: "Storefronts, headless commerce and custom theme development on Shopify.",
  "REST API": "Designing and consuming clean, versioned HTTP APIs that power reliable integrations.",
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
      <span className="text-[0.5rem] leading-none" style={{ fontFamily: "JetBrains Mono, monospace", color: active ? "rgba(var(--bg-rgb),0.6)" : `${skill.accent}99` }}>
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
                color: active ? "var(--bg)" : "var(--ink)",
                filter: active ? "none" : `drop-shadow(0 0 10px ${skill.accent}55)`,
                transition: "color 0.3s ease, filter 0.3s ease",
              }}
            />
          </span>
        );
      })()}
      <div>
        <div className="text-center truncate mb-1" style={{ fontSize: "clamp(0.42rem, 0.85vw, 0.58rem)", letterSpacing: "0.08em", fontFamily: "JetBrains Mono, monospace", color: active ? "var(--bg)" : "rgba(var(--ink-rgb),0.68)" }}>
          {skill.name}
        </div>
        <div className="h-[3px] w-full rounded-full overflow-hidden" style={{ background: "rgba(var(--ink-rgb),0.08)" }}>
          <div className="h-full rounded-full" style={{ width: `${skill.level}%`, background: active ? "var(--bg)" : skill.accent, transition: "background 0.3s ease" }} />
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
      <div className="font-black tracking-tight mt-2 break-words" style={{ fontFamily: "Unbounded, sans-serif", fontSize: "clamp(1rem, 1.8vw, 1.5rem)", color: "var(--ink)", letterSpacing: "-0.02em" }}>
        {skill.name}
      </div>
      <p className="mt-3 text-xs sm:text-sm leading-6 font-light min-h-[3.2rem]" style={{ fontFamily: "Inter, sans-serif", color: "rgba(var(--ink-rgb),0.72)" }}>
        {SKILL_TAGLINES[skill.name]}
      </p>

      <div className="mt-auto pt-5">
        <div className="h-[5px] w-full rounded-full overflow-hidden" style={{ background: "rgba(var(--ink-rgb),0.07)" }}>
          <motion.div
            key={`${skill.name}-bar`}
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={visible ? { width: `${skill.level}%` } : {}}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            style={{ background: skill.accent, boxShadow: `0 0 10px ${skill.accent}` }}
          />
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
    <section id="skills" ref={ref} className="relative px-5 sm:px-8 py-14 md:py-24 overflow-hidden" style={{ background: "var(--bg)" }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 50% at 30% 40%, rgba(var(--accent-rgb),0.05) 0%, transparent 70%)" }} />
      <div className="max-w-7xl mx-auto">
        <SectionLabel number="04" label="SKILLS" visible={visible} />

        {/* Telemetry strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={visible ? { opacity: 1 } : {}}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mt-5 flex flex-wrap gap-x-6 gap-y-1 text-[0.6rem] tracking-[0.25em]"
          style={{ fontFamily: "JetBrains Mono, monospace", color: "rgba(var(--ink-rgb),0.25)" }}
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
            style={{ border: "1px solid rgba(var(--ink-rgb),0.09)", background: "var(--bg2)" }}
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
  { title: "Completed on right time", desc: "I respect your time. Projects are completed on schedule without shortcuts or delays.", accent: "var(--ink)", Icon: FiClock },
  { title: "Affordable price with quality", desc: "You'll get honest, upfront costs. pay for exactly what you get. Quality work, low cost.", accent: "var(--ink)", Icon: FiDollarSign },
  { title: "Free updates & revisions", desc: "Your vision can evolve. I offer free updates to make sure the final product fits you perfectly.", accent: "var(--ink)", Icon: FiRefreshCw },
  { title: "No results, no payment", desc: "I stand by my work. If you're not satisfied, you don't pay. Simple and risk-free.", accent: "var(--ink)", Icon: FiAward },
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
        background: hovered ? `${item.accent}08` : "var(--bg2)",
        border: `1px solid ${hovered ? item.accent + "55" : "rgba(var(--ink-rgb),0.08)"}`,
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
            color: hovered ? "var(--bg)" : item.accent,
            transition: "color 0.35s ease",
          }}
        />
      </div>
      {/* Title */}
      <h3
        className="font-black tracking-tight mt-5 sm:mt-6 relative z-10 break-words"
        style={{ fontFamily: "Unbounded, sans-serif", fontSize: "clamp(1.05rem, 1.8vw, 1.35rem)", color: hovered ? item.accent : "var(--ink)", letterSpacing: "-0.02em", lineHeight: 1.25, transition: "color 0.4s ease" }}
      >
        {item.title}
      </h3>
      {/* Description */}
      <p className="mt-3 text-xs sm:text-sm leading-6 font-light relative z-10" style={{ fontFamily: "Inter, sans-serif", color: "rgba(var(--ink-rgb),0.72)", transition: "color 0.4s ease" }}>
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
    <section id="why-me" ref={ref} className="px-5 sm:px-8 py-12 md:py-20 relative overflow-hidden" style={{ background: "var(--bg)" }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(var(--accent-rgb),0.03) 0%, transparent 70%)" }} />
      <div className="max-w-7xl mx-auto">
        <SectionLabel number="05" label="WHY CHOOSE ME" visible={visible} />
        <motion.div
          initial={{ opacity: 0 }}
          animate={visible ? { opacity: 1 } : {}}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mt-5 text-[0.6rem] tracking-[0.25em]"
          style={{ fontFamily: "JetBrains Mono, monospace", color: "rgba(var(--ink-rgb),0.25)" }}
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
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 80% at 25% 50%, rgba(var(--accent-rgb),0.1) 0%, transparent 70%)", animation: "blobShift 7s ease-in-out infinite alternate" }} />
      {["const App = () => {", "interface Props {", "  children: ReactNode", "async function build(", "  return <Future />;"].map((line, i) => (
        <div key={i} className="absolute text-xs whitespace-nowrap select-none" style={{ fontFamily: "JetBrains Mono, monospace", color: "rgba(var(--accent-rgb),0.1)", top: `${15 + i * 18}%`, left: "8%", animation: `codeFloat ${3.5 + i * 0.4}s ease-in-out infinite alternate`, animationDelay: `${i * 0.25}s` }}>
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
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(0,212,255,0.07) 0%, rgba(107,47,250,0.07) 50%, rgba(var(--accent-rgb),0.07) 100%)", animation: "spectrumShift 5s ease-in-out infinite alternate" }} />
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
  { id: "01", title: "FULL STACK ENGINEERING", desc: "End-to-end product development. scalable APIs, resilient data layers, and the interfaces humans actually love.", accent: "var(--ink)", Bg: FullStackBg, col: "1 / 3" },
  { id: "02", title: "SYSTEM ARCHITECTURE", desc: "Distributed systems, microservices, and infrastructure designed to handle edge cases and load.", accent: "var(--ink)", Bg: ArchBg, col: "3" },
  { id: "03", title: "UI/UX ENGINEERING", desc: "Interfaces that feel alive. motion-driven, accessible, pixel-perfect, and built to delight at every interaction.", accent: "var(--ink)", Bg: UIBg, col: "1" },
  { id: "04", title: "FULL-STACK TEACHING", desc: "Teaching full-stack development through practical work with frontend, backend, databases, APIs, and real-world application architecture and projects.", accent: "var(--ink)", Bg: CloudBg, col: "2 / 4" },
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
        style={{ background: "var(--bg3)", border: `1px solid ${hovered ? card.accent + "30" : "rgba(var(--ink-rgb),0.07)"}`, transition: "border-color 0.4s ease" }}
      >
        <card.Bg />
        {/* Content */}
        <div className="relative z-10">
          <div className="text-xs tracking-[0.3em] mb-3" style={{ fontFamily: "JetBrains Mono, monospace", color: card.accent, opacity: 0.7 }}>{card.id}</div>
          <div className="font-black leading-tight" style={{ fontFamily: "Unbounded, sans-serif", fontSize: "clamp(0.9rem, 1.5vw, 1.2rem)", color: hovered ? card.accent : "var(--ink)", letterSpacing: "-0.02em", transition: "color 0.4s ease" }}>
            {card.title}
          </div>
        </div>
        <motion.p
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="relative z-10 text-xs leading-5"
          style={{ fontFamily: "Inter, sans-serif", color: "rgba(var(--ink-rgb),0.5)", fontWeight: 300, maxWidth: "320px" }}
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
    <section id="services" ref={ref} className="px-8 py-14 md:py-24" style={{ background: "var(--bg)" }}>
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

function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
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
    ...(project.problem ? [{ label: "THE PROBLEM & SOLUTION", text: project.problem }] : []),
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
      <div className="absolute inset-0" style={{ background: "rgba(var(--bg-rgb),0.85)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }} />

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
          background: "var(--bg3)",
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
          style={{ background: "rgba(var(--bg-rgb),0.75)", border: "1px solid rgba(var(--ink-rgb),0.18)", color: "var(--ink)", fontSize: "1rem", lineHeight: 1 }}
        >
          ✕
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-[250px_1fr]">
          {/* Left rail: image + meta + CTA */}
          <div
            className="flex flex-col gap-5 p-5 sm:p-6 border-b sm:border-b-0 sm:border-r"
            style={{ borderColor: "rgba(var(--ink-rgb),0.08)" }}
          >
            <div className="relative w-full h-36 sm:h-44 overflow-hidden rounded-lg shrink-0">
              <img src={project.image} alt={project.title} loading="lazy" decoding="async" className="w-full h-full object-cover" />
              <div className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ background: project.accent }} />
            </div>

            {/* Live site CTA — only for projects that have a deployed site */}
            {project.live && (
              <a
                href={project.live}
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
                <span className="text-[0.62rem] tracking-[0.25em] font-bold whitespace-nowrap" style={{ fontFamily: "JetBrains Mono, monospace", color: ctaHovered ? project.accent : "var(--ink)", transition: "color 0.35s ease" }}>
                  VISIT LIVE SITE
                </span>
                <motion.span animate={{ x: ctaHovered ? 6 : 0, rotate: ctaHovered ? -45 : 0 }} transition={{ duration: 0.3 }} style={{ color: project.accent, fontSize: "1.2rem" }}>
                  →
                </motion.span>
              </a>
            )}

            {/* GitHub CTA — always shown (only button when there's no live site) */}
            <a
              href={project.github}
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
              <span className="text-[0.62rem] tracking-[0.25em] font-bold whitespace-nowrap" style={{ fontFamily: "JetBrains Mono, monospace", color: ctaHovered ? project.accent : "var(--ink)", transition: "color 0.35s ease" }}>
                VIEW IN GITHUB
              </span>
              <motion.span animate={{ x: ctaHovered ? 6 : 0, rotate: ctaHovered ? -45 : 0 }} transition={{ duration: 0.3 }} style={{ color: project.accent, fontSize: "1.2rem" }}>
                →
              </motion.span>
            </a>

            <div className="flex flex-col gap-2 text-[0.6rem] tracking-[0.22em]" style={{ fontFamily: "JetBrains Mono, monospace"}}>
              <span style={{ color: project.accent }}>{project.category.toUpperCase()}</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {project.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 tracking-wider" style={{ border: "1px solid rgba(var(--ink-rgb),0.12)", color: "rgba(var(--ink-rgb),0.65)" }}>{tag.toUpperCase()}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: title + all details */}
          <div className="p-5 sm:p-7">
            <h3 className="font-black tracking-tighter break-words pr-10 sm:pr-0" style={{ fontFamily: "Unbounded, sans-serif", fontSize: "clamp(1.5rem, 3.5vw, 2.3rem)", color: "var(--ink)", letterSpacing: "-0.03em", lineHeight: 1.05 }}>
              {project.title}
            </h3>

            <div className="mt-5 grid gap-5">
              {sections.map(({ label, text }) => (
                <div key={label} className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-1 sm:gap-4 items-start">
                  <div className="text-[0.6rem] tracking-[0.25em] pt-1 sm:text-right" style={{ fontFamily: "JetBrains Mono, monospace", color: project.accent, borderRight: `2px solid ${project.accent}66`, paddingRight: "8px" }}>
                    {label}
                  </div>
                  <p className="text-sm leading-6 font-light whitespace-pre-line" style={{ fontFamily: "Inter, sans-serif", color: "rgba(var(--ink-rgb),0.62)" }}>
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
  const [openProject, setOpenProject] = useState<Project | null>(null);

  return (
    <section id="work" ref={ref} className="px-8 py-14 md:py-24 relative" style={{ background: "var(--bg)" }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-14">
          <SectionLabel number="03" label="RECENT WORK" visible={visible} />
          <motion.div initial={{ opacity: 0 }} animate={visible ? { opacity: 1 } : {}} transition={{ delay: 0.3 }} className="text-xs tracking-[0.2em] hidden md:block" style={{ fontFamily: "JetBrains Mono, monospace", color: "rgba(var(--ink-rgb),0.2)" }}>
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

function ProjectRow({ project, index, parentVisible, onOpen }: { project: Project; index: number; parentVisible: boolean; onOpen: () => void }) {
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
      <div className="flex items-center justify-between py-7 relative overflow-hidden" style={{ borderBottom: "1px solid rgba(var(--ink-rgb),0.07)" }}>
        {/* Hover fill from left */}
        <motion.div className="absolute inset-0 pointer-events-none" initial={{ scaleX: 0 }} animate={{ scaleX: hovered ? 1 : 0 }} transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }} style={{ background: `linear-gradient(90deg, ${project.accent}0A 0%, transparent 100%)`, transformOrigin: "left" }} />
        {/* Left accent line on hover */}
        <motion.div className="absolute left-0 top-0 bottom-0 w-px" animate={{ opacity: hovered ? 1 : 0 }} transition={{ duration: 0.3 }} style={{ background: project.accent }} />

        <div className="flex items-start md:items-center gap-4 md:gap-8 lg:gap-14 relative pl-2 sm:pl-4">
          <div className="text-xs w-6 shrink-0 tabular-nums pt-2 md:pt-0" style={{ fontFamily: "JetBrains Mono, monospace", color: "rgba(var(--ink-rgb),0.22)" }}>0{index + 1}</div>
          <div className="min-w-0">
            <div className="font-black tracking-tighter break-words" style={{ fontFamily: "Unbounded, sans-serif", fontSize: "clamp(1.15rem, 3.2vw, 3rem)", color: hovered ? project.accent : "var(--ink)", letterSpacing: "-0.035em", lineHeight: 1.05, transition: "color 0.4s ease" }}>
              {project.title}
            </div>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={parentVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.1 + 0.3, duration: 0.6 }}
              className="mt-2 text-xs sm:text-sm leading-5 sm:leading-6 font-light max-w-xl"
              style={{ fontFamily: "Inter, sans-serif", color: hovered ? "rgba(var(--ink-rgb),0.8)" : "rgba(var(--ink-rgb),0.6)", transition: "color 0.4s ease" }}
            >
              {project.short}
            </motion.p>
          </div>
        </div>

        <div className="flex items-center gap-5 lg:gap-10 relative pr-2">
          <div className="hidden md:block text-xs tracking-[0.15em]" style={{ fontFamily: "JetBrains Mono, monospace", color: "rgba(var(--ink-rgb),0.5)" }}>{project.category}</div>
          <div className="hidden lg:flex gap-2">
            {project.tags.map((tag) => (
              <span key={tag} className="text-xs px-2.5 py-1 tracking-wider" style={{ fontFamily: "JetBrains Mono, monospace", color: hovered ? project.accent : "rgba(var(--ink-rgb),0.28)", border: `1px solid ${hovered ? project.accent + "50" : "rgba(var(--ink-rgb),0.1)"}`, transition: "all 0.4s ease" }}>{tag}</span>
            ))}
          </div>
          <motion.span animate={{ x: hovered ? 6 : 0, rotate: hovered ? -45 : 0 }} transition={{ duration: 0.3 }} style={{ color: hovered ? project.accent : "rgba(var(--ink-rgb),0.25)", fontSize: "1.2rem", transition: "color 0.4s" }}>→</motion.span>
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
      <span className="text-xs tracking-[0.2em]" style={{ fontFamily: "JetBrains Mono, monospace", color: "rgba(var(--ink-rgb),0.5)" }}>
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
    <section id="contact" ref={ref} className="relative px-8 py-14 md:py-24 overflow-hidden" style={{ background: "var(--bg)" }} onMouseMove={handleMouseMove}>
      <div ref={sectionRef} className="absolute inset-0 pointer-events-none transition-all duration-300" style={{ background: `radial-gradient(ellipse 60% 60% at ${mouse.x}% ${mouse.y}%, rgba(var(--accent-rgb),0.06) 0%, transparent 70%)` }} />

      <div className="max-w-7xl mx-auto relative">
        <div className="flex items-center justify-between mb-16">
          <SectionLabel number="07" label="CONTACT" visible={visible} />
          <LiveClock />
        </div>

        {/* Big heading */}
        <div className="mb-12">
          {[["GOT AN", "var(--ink)"], ["IDEA?", "var(--accent)"]].map(([text, color], i) => (
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
          style={{ borderBottom: "1px solid rgba(var(--ink-rgb),0.12)" }}
          onMouseEnter={() => setEmailHovered(true)}
          onMouseLeave={() => setEmailHovered(false)}
          data-hover
        >
          <span className="font-light tracking-tight" style={{ fontFamily: "Unbounded, sans-serif", fontSize: "clamp(0.9rem, 2.2vw, 1.8rem)", color: emailHovered ? "var(--accent)" : "rgba(var(--ink-rgb),0.72)", letterSpacing: "-0.02em", transition: "color 0.4s ease" }}>
            <ScrambleText text="dawitdargie2@gmail.com" trigger={visible} />
          </span>
          <motion.span animate={{ x: emailHovered ? 10 : 0, rotate: emailHovered ? -45 : 0 }} transition={{ duration: 0.35 }} style={{ color: "var(--accent)", fontSize: "1.4rem" }}>→</motion.span>
        </motion.a>

        {/* Response badge */}
        <motion.div initial={{ opacity: 0 }} animate={visible ? { opacity: 1 } : {}} transition={{ delay: 0.6 }} className="flex items-center gap-3 mt-6">
          <div className="text-xs tracking-[0.2em] px-3 py-1.5" style={{ fontFamily: "JetBrains Mono, monospace", color: "var(--accent-warm)", border: "1px solid rgba(200,255,0,0.25)", fontSize: "0.65rem" }}>
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
                el.style.background = "var(--accent)";
                el.style.borderColor = "var(--accent)";
                el.style.color = "var(--bg)";
                el.style.boxShadow = "0 8px 30px rgba(var(--accent-rgb),0.4)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.background = "transparent";
                el.style.borderColor = "rgba(var(--ink-rgb),0.12)";
                el.style.color = "rgba(var(--ink-rgb),0.72)";
                el.style.boxShadow = "none";
              }}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center"
              style={{
                border: "1px solid rgba(var(--ink-rgb),0.12)",
                color: "rgba(var(--ink-rgb),0.72)",
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
    <footer className="px-8 py-7 flex flex-wrap gap-4 items-center justify-between" style={{ borderTop: "1px solid rgba(var(--ink-rgb),0.05)", background: "var(--bg)" }}>
      <div className="text-xs tracking-[0.2em]" style={{ fontFamily: "JetBrains Mono, monospace", color: "rgba(var(--ink-rgb),0.14)" }}>©DAWIT DARGIE — ALL RIGHTS RESERVED</div>
    </footer>
  );
}

// ─── EXPORT ──────────────────────────────────────────────────────────────────

export default function BelowFold() {
  return (
    <>
      <DualMarquee />
      <AboutSection />
      <WorkSection />
      <SkillsSection />
      <WhyMeSection />
      <BentoCapabilities />
      <ContactSection />
      <Footer />
    </>
  );
}
