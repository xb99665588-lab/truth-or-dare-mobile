import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";

test("GitHub Pages export uses the independent repository base path", async () => {
  const html = await readFile("out/index.html", "utf8");
  assert.match(html, /\/truth-or-dare-mobile\/_next\/static\//);
  assert.match(html, /真心话大冒险 · 输家请抽牌/);
  assert.match(
    html,
    /https:\/\/xb99665588-lab\.github\.io\/truth-or-dare-mobile\/og\.png/,
  );
  await stat("out/og.png");
});
