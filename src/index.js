"use strict";
const fs = require("node:fs");
const path = require("node:path");

const slug = (s) => s.toLowerCase().trim().replace(/<[^>]+>/g, "").replace(/[^\p{L}\p{N}\s_-]/gu, "").replace(/\s/g, "-");
/** Strip fenced code so we don't lint inside it; returns {lines, fences} */
function scanMd(text) {
  const lines = text.replace(/\r\n?/g, "\n").split("\n"); const fences = []; let open = null;
  const masked = lines.map((l, i) => {
    const m = /^\s{0,3}(`{3,}|~{3,})\s*([\w+#.-]*)/.exec(l);
    if (m && !open) { open = { line: i + 1, lang: m[2], marker: m[1] }; return ""; }
    if (open && new RegExp(`^\\s{0,3}${open.marker[0]}{${open.marker.length},}\\s*$`).test(l)) { fences.push(open); open = null; return ""; }
    return open ? "" : l.replace(/`[^`]*`/g, (s) => " ".repeat(s.length));
  });
  if (open) fences.push({ ...open, unclosed: true });
  return { lines: masked, raw: lines, fences };
}
const SECTIONS = {
  install: /^(install(ation|ing)?|setup|getting started|quick ?start|requirements)/i,
  usage: /^(usage|how to use|examples?|commands|api|quick ?start|getting started|run(ning)?)/i,
  license: /^licen[cs]e/i,
  contributing: /^(contribut|development|local development)/i,
};
function lint(text, { dir = ".", checkFiles = true } = {}) {
  const issues = []; const add = (level, rule, line, msg) => issues.push({ level, rule, line, msg });
  const { lines, raw, fences } = scanMd(text);
  const headings = [];
  lines.forEach((l, i) => { const m = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(l); if (m) headings.push({ level: m[1].length, text: m[2].replace(/[*_`]|!?\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/^\p{Extended_Pictographic}\uFE0F?\s*/u, "").trim(), line: i + 1 }); });
  // html headings (<h1 align=center>)
  lines.forEach((l, i) => { for (const m of l.matchAll(/<h([1-6])[^>]*>(.*?)<\/h\1>/gi)) headings.push({ level: +m[1], text: m[2].replace(/<[^>]+>/g, "").trim(), line: i + 1, html: true }); });
  headings.sort((a, b) => a.line - b.line);
  const nonEmpty = text.trim().length;
  if (!nonEmpty) { add("error", "empty", 1, "README is empty"); return finish(issues, { headings, words: 0 }); }
  const h1 = headings.filter((h) => h.level === 1);
  const banner = /^\s*(?:<!--[\s\S]*?-->\s*)*(?:<p[^>]*>\s*)?(?:<a[^>]*>\s*)?<img\b[^>]*\balt=["'][^"']+/i.test(text) || /^\s*!\[[^\]]+\]\(/.test(text);
  if (!h1.length && banner) add("info", "title", 1, "Title is an image banner — fine on GitHub, but add a # heading for search & screen readers");
  else if (!h1.length) add("error", "title", 1, "No top-level # title");
  else if (h1.length > 1) add("warn", "multiple-h1", h1[1].line, `${h1.length} H1 headings — use one title, ## for sections`);
  let prev = 0; for (const h of headings) { if (prev && h.level > prev + 1) add("warn", "heading-jump", h.line, `Heading jumps from H${prev} to H${h.level}`); prev = h.level; }
  const seen = {}; for (const h of headings) { const k = h.level + ":" + h.text.toLowerCase(); if (seen[k]) add("warn", "duplicate-heading", h.line, `Duplicate heading "${h.text}"`); seen[k] = 1; }
  const names = headings.map((h) => h.text);
  for (const [k, re] of Object.entries(SECTIONS)) if (!names.some((n) => re.test(n))) add(k === "contributing" ? "info" : "warn", `missing-${k}`, null, `No ${k[0].toUpperCase() + k.slice(1)} section`);
  // description: first paragraph text after title
  const words = lines.join(" ").replace(/!?\[([^\]]*)\]\([^)]*\)|<[^>]+>|[#*_>|-]/g, " $1 ").split(/\s+/).filter((w) => /\w/.test(w)).length;
  if (words < 60) add("warn", "too-short", null, `Only ${words} words — explain what it does, why, and how to run it`);
  const firstPara = lines.slice((h1[0]?.line || 0)).find((l) => l.trim() && !/^\s*(#|!\[|<|\[!\[|---|```)/.test(l) && !/^\s*\[!\[/.test(l));
  if (!firstPara) add("warn", "no-description", h1[0]?.line || 1, "No description paragraph under the title");
  // links + images
  const anchors = new Set(headings.map((h) => slug(h.text)));
  for (const m of text.matchAll(/<a\s+(?:name|id)="([^"]+)"/g)) anchors.add(m[1]);
  lines.forEach((l, i) => {
    const ln = i + 1;
    for (const m of l.matchAll(/(!?)\[([^\]]*)\]\(\s*<?([^)\s>]*)>?(?:\s+"[^"]*")?\s*\)/g)) {
      const [, img, label, url] = m;
      if (!url) { add("error", "empty-link", ln, `Empty link target for "${label}"`); continue; }
      if (img && !label.trim()) add("warn", "image-alt", ln, `Image without alt text: ${url}`);
      if (!img && !label.trim() && !/^\[!\[/.test(m[0])) add("warn", "empty-link-text", ln, `Link without text: ${url}`);
      if (!img && /^(click here|here|link|this)$/i.test(label.trim())) add("info", "link-text", ln, `Vague link text "${label}"`);
      check(url, ln, img);
    }
    for (const m of l.matchAll(/<img\b[^>]*>/gi)) { const src = /src=["']([^"']+)/i.exec(m[0])?.[1]; if (!/\balt=["']/i.test(m[0])) add("warn", "image-alt", ln, `<img> without alt text${src ? ": " + src : ""}`); if (src) check(src, ln, true); }
    { const t = l.replace(/`[^`]*`/g, ""); const m = /\b(?:TODO|TBD|FIXME)\b(?=\s*[:(]|\s*$)/.exec(t) || /^\s*[-*]?\s*(?:TODO|TBD)\b/i.exec(t) || /\b(?:lorem ipsum|coming soon)\b/i.exec(t); if (m) add("warn", "placeholder", ln, `Placeholder text: "${m[0].trim().replace(/^[-*]\s*/, "")}"`); }
    if (/\]\(https?:\/\/(localhost|127\.0\.0\.1)/.test(l)) add("warn", "localhost-link", ln, "Link to localhost won't work for readers");
    if (/https?:\/\/github\.com\/[^/\s]+\/[^/\s]+\/blob\/[0-9a-f]{40}/.test(l)) add("info", "pinned-sha-link", ln, "Link pinned to a commit SHA — may go stale");
  });
  function check(url, ln, img) {
    if (url.startsWith("#")) { if (!anchors.has(decodeURIComponent(url.slice(1)).toLowerCase())) add("error", "broken-anchor", ln, `Anchor ${url} doesn't match any heading`); return; }
    if (/^(https?:|mailto:|data:|tel:)/i.test(url)) { if (/^http:\/\//i.test(url) && !/localhost|127\./.test(url)) add("info", "http-link", ln, `Insecure http:// link: ${url}`); return; }
    if (!checkFiles) return;
    const p = decodeURIComponent(url.split("#")[0].split("?")[0]); if (!p) return;
    if (!fs.existsSync(path.resolve(dir, p))) add("error", img ? "missing-image" : "broken-link", ln, `${img ? "Image" : "File"} not found: ${p}`);
  }
  for (const f of fences) {
    if (f.unclosed) add("error", "unclosed-fence", f.line, "Code block is never closed");
    else if (!f.lang) add("info", "fence-lang", f.line, "Code block without a language (no syntax highlighting)");
  }
  const hasCode = fences.length > 0; if (!hasCode) add("warn", "no-code", null, "No code blocks — show how to install / run it");
  const hasImage = /!\[[^\]]*\]\(|<img\b/i.test(text); if (!hasImage) add("info", "no-visual", null, "No screenshot, GIF or logo — a picture sells the project");
  raw.forEach((l, i) => { if (/\s+$/.test(l) && !/ {2}$/.test(l)) {} if (/\t/.test(l) && !lines[i] === "") {} });
  return finish(issues, { headings, words, fences: fences.length });
}
const W = { error: 12, warn: 5, info: 1 };
function finish(issues, extra) {
  const score = Math.max(0, 100 - issues.reduce((s, i) => s + W[i.level], 0));
  const grade = score >= 90 ? "A" : score >= 80 ? "B" : score >= 65 ? "C" : score >= 50 ? "D" : "F";
  return { issues: issues.sort((a, b) => (a.line ?? 1e9) - (b.line ?? 1e9)), score, grade, ...extra };
}
function findReadme(dir) { for (const f of ["README.md", "readme.md", "Readme.md", "README.markdown", "README"]) if (fs.existsSync(path.join(dir, f))) return path.join(dir, f); return null; }
module.exports = { lint, scanMd, slug, findReadme };
