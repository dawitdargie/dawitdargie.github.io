/**
 * Post-build pass over the static export in `out/`.
 *
 * Two DOM-neutral rewrites, both measured against the real artifact, neither of
 * which changes what the browser paints or when any animation runs:
 *
 * 1. HOIST THE ASYNC CHUNK <script> TAGS ABOVE THE INLINED <style>.
 *    `experimental.inlineCss` puts ~40 KB of CSS in a single inline <style> at the
 *    top of <head>, and the preload scanner cannot see past it — so every JS
 *    request waited for ~40 KB of HTML to arrive first (~200 ms on slow 4G) while
 *    the preloader counter was already running. The tags are `async`, which by
 *    spec carries no ordering guarantee, so moving them is semantically inert: it
 *    only starts the downloads earlier. Both the preload links (font, LCP image)
 *    and the `<script id="_R_">` app bootstrap keep their exact positions, as does
 *    the adjacency between `_R_` and the `self.__next_f` payload scripts.
 *    (The `nomodule` legacy bundle is intentionally left where it is.)
 *
 * 2. DROP NON-LATIN @font-face DESCRIPTIONS.
 *    next/font emits one @font-face per family/weight/subset — 51 of them,
 *    13.7 KB — and the RSC flight payload carries a second and third copy inside
 *    inline scripts. Nothing on the page uses a codepoint from those ranges, and
 *    the rules that remain are the ones whose unicode-range actually covers this
 *    content (U+?? + U+2000-206F + U+20AC + U+2122 + U+2191/U+2193 + …), so the
 *    rendered glyphs are untouched.
 *
 * Runs as `next build && node scripts/optimize-html.mjs` (see package.json), and
 * exits non-zero — failing the deploy — if either rewrite does not verify.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

const OUT_DIR = fileURLToPath(new URL("../out", import.meta.url));

// ── 1. font-face pruning ────────────────────────────────────────────────────

const FONT_FACE_RULE = /@font-face\s*\{[^}]*\}/g;
const COVERS_LATIN = /unicode-range:[^;}]*U\+\?\?/;

function pruneNonLatinFontFaces(html) {
  let removed = 0;
  const out = html.replace(FONT_FACE_RULE, (rule) => {
    if (!/unicode-range:/.test(rule)) return rule; // no range → applies to everything
    if (COVERS_LATIN.test(rule)) return rule;
    removed += 1;
    return "";
  });
  return { out, removed };
}

// ── 2. chunk-script hoisting ────────────────────────────────────────────────

const SCRIPT_TAG = /<script\b[^>]*\bsrc="([^"]+)"[^>]*><\/script>/g;
const STYLE_ANCHOR = '<style data-precedence';

function hoistChunkScripts(html) {
  const targets = [];
  SCRIPT_TAG.lastIndex = 0;
  let m;
  while ((m = SCRIPT_TAG.exec(html)) !== null) {
    const tag = m[0];
    const src = m[1];
    if (!src.includes("/_next/static/chunks/")) continue;
    if (/nomodule/i.test(tag)) continue; // legacy only
    if (/id="_R_"/.test(tag)) continue; // app bootstrap — position is load-bearing
    targets.push({ tag, src, index: m.index });
  }
  if (targets.length === 0) return { html, hoisted: [], note: "no chunk scripts" };

  const anchorOf = (h) => {
    const i = h.indexOf(STYLE_ANCHOR);
    return i === -1 ? h.indexOf("</head>") : i;
  };
  if (anchorOf(html) === -1) return { html, hoisted: [], note: "no anchor in <head>" };
  if (Math.min(...targets.map((t) => t.index)) < anchorOf(html)) {
    return { html, hoisted: [], note: "already hoisted" };
  }

  let out = html;
  for (const { tag } of targets) {
    if (!out.includes(tag)) return { html, hoisted: [], note: `tag vanished: ${tag.slice(0, 60)}` };
    out = out.replace(tag, "");
  }
  const at = anchorOf(out);
  out = out.slice(0, at) + targets.map((t) => t.tag).join("") + out.slice(at);
  return { html: out, hoisted: targets.map((t) => t.src), note: "hoisted" };
}

// ── verification ────────────────────────────────────────────────────────────

const scriptSrcs = (h) => (h.match(/<script\b[^>]*\bsrc="[^"]+"/g) ?? []).slice().sort();
const countChunkTags = (h) => (h.match(/<script\b[^>]*src="\/_next\/static\/chunks\/[^"]+"/g) ?? []).length;

function verify(before, after, hoisted) {
  const problems = [];
  if (scriptSrcs(before).join() !== scriptSrcs(after).join()) {
    problems.push("the set of <script src> tags changed");
  }
  if (countChunkTags(before) !== countChunkTags(after)) {
    problems.push("a chunk <script> tag was lost or duplicated");
  }
  if (hoisted.length > 0) {
    const styleAt = after.indexOf(STYLE_ANCHOR);
    for (const src of hoisted) {
      const at = after.indexOf(`src="${src}"`);
      if (at === -1 || at > styleAt) problems.push(`${src} was not hoisted above the inlined CSS`);
    }
  }
  const rAt = after.indexOf('id="_R_"');
  const fAt = after.indexOf("self.__next_f");
  if (rAt === -1 || fAt === -1 || rAt > fAt) {
    problems.push("the _R_ bootstrap no longer precedes the RSC payload");
  }
  const keptLatin = (after.match(/@font-face\s*\{[^}]*\}/g) ?? []).filter((r) => COVERS_LATIN.test(r)).length;
  if (keptLatin === 0) problems.push("every latin @font-face was removed");
  return problems;
}

// ── run ─────────────────────────────────────────────────────────────────────

const pages = readdirSync(OUT_DIR).filter((f) => f.endsWith(".html"));
if (pages.length === 0) {
  console.error("[optimize-html] no .html files in out/ — did `next build` run?");
  process.exit(1);
}

const gz = (s) => (gzipSync(Buffer.from(s)).length / 1024).toFixed(1);
let failed = false;

for (const page of pages) {
  const file = join(OUT_DIR, page);
  const before = readFileSync(file, "utf8");
  const pruned = pruneNonLatinFontFaces(before);
  const moved = hoistChunkScripts(pruned.out);
  const after = moved.html;

  const problems = verify(before, after, moved.hoisted);
  if (problems.length > 0) {
    failed = true;
    console.error(`[optimize-html] ${page} FAILED verification:`);
    for (const p of problems) console.error(`  - ${p}`);
    continue;
  }

  writeFileSync(file, after);
  console.log(
    `[optimize-html] ${page}: ${moved.note}, ${moved.hoisted.length} script(s) hoisted, ` +
      `${pruned.removed} non-latin @font-face rule(s) dropped — ` +
      `html ${(before.length / 1024).toFixed(1)}→${(after.length / 1024).toFixed(1)} KB raw, ` +
      `${gz(before)}→${gz(after)} KB gzip`,
  );
}

if (failed) process.exit(1);
