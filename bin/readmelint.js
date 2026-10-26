#!/usr/bin/env node
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const { parseArgs } = require("node:util");
const { lint, findReadme } = require("../src");
const { c, header, plural, bar } = require("../src/ui");
const pkg = require("../package.json");

const HELP = `${header("readmelint", "a README that people actually read")}

${c.bold("Usage")}
  readmelint [file|dir] [options]

${c.bold("Checks")}  title · description · install / usage / license sections · heading order
         broken relative links + images · broken #anchors · image alt text
         unclosed / unlabeled code blocks · placeholders (TODO, TBD, lorem)

${c.bold("Options")}
      --min <score>    exit 1 if the score is below this (default 0, CI: 80)
      --quiet          only errors
      --no-files       don't check that linked files exist
      --json           machine-readable output
  -v, --version / -h, --help`;

let a;
try { a = parseArgs({ allowPositionals: true, options: { min: { type: "string", default: "0" }, quiet: { type: "boolean", short: "q" }, "no-files": { type: "boolean" }, json: { type: "boolean" }, version: { type: "boolean", short: "v" }, help: { type: "boolean", short: "h" } } }); }
catch (e) { console.error(c.red(`✖ ${e.message}`)); process.exit(2); }
const o = a.values;
if (o.help) { console.log(HELP); process.exit(0); }
if (o.version) { console.log(pkg.version); process.exit(0); }
let target = path.resolve(a.positionals[0] || ".");
if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = findReadme(target);
if (!target || !fs.existsSync(target)) { console.error(c.red(`✖ No README found${a.positionals[0] ? " at " + a.positionals[0] : " here"}`)); process.exit(2); }

const r = lint(fs.readFileSync(target, "utf8"), { dir: path.dirname(target), checkFiles: !o["no-files"] });
const fail = r.score < +o.min || r.issues.some((i) => i.level === "error" && o.quiet);
if (o.json) { console.log(JSON.stringify({ file: path.relative(process.cwd(), target), ...r }, null, 2)); process.exit(r.score < +o.min ? 1 : 0); }

const rel = path.relative(process.cwd(), target) || target;
console.log(header("readmelint", rel));
const GC = { A: c.green, B: c.green, C: c.yellow, D: c.yellow, F: c.red };
console.log(`\n  ${GC[r.grade](c.bold(`  ${r.grade}  `))}  ${c.bold(r.score)}${c.dim("/100")}  ${GC[r.grade](bar(r.score / 100, 24))}   ${c.dim(`${r.words} words · ${plural(r.headings.length, "heading")} · ${plural(r.fences, "code block")}`)}`);
const shown = r.issues.filter((i) => !o.quiet || i.level === "error");
if (!shown.length) console.log(`\n${c.green("✔")} Looks great.`);
else {
  console.log();
  const ICON = { error: c.red("✖"), warn: c.yellow("⚠"), info: c.cyan("•") };
  for (const i of shown) console.log(`  ${ICON[i.level]} ${c.dim((i.line ? ":" + i.line : "").padEnd(5))} ${i.msg} ${c.gray(`(${i.rule})`)}`);
}
const n = (l) => r.issues.filter((i) => i.level === l).length;
console.log(`\n${n("error") ? c.red(plural(n("error"), "error")) : c.green("0 errors")} · ${c.yellow(plural(n("warn"), "warning"))} · ${c.cyan(plural(n("info"), "tip"))}${+o.min ? (r.score < +o.min ? c.red(`  ✖ below --min ${o.min}`) : c.green(`  ✔ ≥ ${o.min}`)) : ""}`);
process.exit(fail ? 1 : 0);
