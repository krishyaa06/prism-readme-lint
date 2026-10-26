const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { lint, slug, scanMd } = require("../src");
const ex = path.join(__dirname, "../examples");
const bin = path.join(__dirname, "../bin/readmelint.js");
const rules = (r) => r.issues.map((i) => i.rule);

test("slug matches GitHub anchors", () => {
  assert.equal(slug("Getting Started!"), "getting-started"); assert.equal(slug("API (v2)"), "api-v2"); assert.equal(slug("Ünïcode Test"), "ünïcode-test");
});
test("good README scores A", () => {
  const r = lint(fs.readFileSync(path.join(ex, "good/README.md"), "utf8"), { dir: path.join(ex, "good") });
  assert.equal(r.grade, "A", JSON.stringify(r.issues)); assert.equal(r.issues.filter((i) => i.level !== "info").length, 0);
});
test("bad README catches everything", () => {
  const r = lint(fs.readFileSync(path.join(ex, "bad-README.md"), "utf8"), { dir: ex });
  for (const k of ["image-alt", "missing-image", "heading-jump", "placeholder", "broken-link", "broken-anchor", "unclosed-fence", "missing-install", "missing-usage", "missing-license", "too-short", "link-text"]) assert.ok(rules(r).includes(k), k);
  assert.equal(r.grade, "F");
});
test("ignores links inside code", () => {
  const r = lint("# T\n\n```md\n[x](missing.md)\n```\n\n`[y](nope.md)`\n", { dir: ex });
  assert.ok(!rules(r).includes("broken-link"));
  assert.equal(scanMd("```js\na\n```").fences[0].lang, "js");
});
test("cli", () => {
  assert.equal(spawnSync("node", [bin, path.join(ex, "good")]).status, 0);
  assert.equal(spawnSync("node", [bin, path.join(ex, "bad-README.md"), "--min", "80"]).status, 1);
  assert.equal(spawnSync("node", [bin, "/nope"]).status, 2);
  assert.equal(JSON.parse(spawnSync("node", [bin, path.join(ex, "good"), "--json"], { encoding: "utf8" }).stdout).grade, "A");
});
