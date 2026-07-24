# Draw Controls Simplification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the result-state action flow with three permanently visible “真心话 / 随机 / 大冒险” controls and increase recent-prompt avoidance from 20 to 50.

**Architecture:** Keep prompt selection inside `TruthOrDareApp`, but move recent-history truncation into a small tested helper in `app/lib/prompts.ts`. Render one stable three-column action row beneath the prompt card for both empty and populated states; clicking any action continues to call the existing `draw` function so the card updates in place.

**Tech Stack:** Next.js, React, TypeScript, Vitest, Node test runner, CSS, GitHub Pages static export.

## Global Constraints

- Mobile-only layout.
- Action order is exactly “真心话”, “随机”, “大冒险”.
- The three draw controls remain visible before and after drawing.
- “随机来一个”, “换一个”, “完成了”, and completed-count state are removed.
- The most recent 50 prompt IDs are excluded whenever another choice exists.
- The existing mode, difficulty, prompt-card animation, wheel, and 2000-prompt catalog remain unchanged.

---

### Task 1: Recent Prompt History Limit

**Files:**
- Modify: `app/lib/prompts.ts`
- Modify: `app/lib/prompts.test.ts`
- Modify: `app/components/TruthOrDareApp.tsx`

**Interfaces:**
- Produces: `rememberPrompt(recentIds: readonly string[], nextId: string, limit?: number): string[]`
- Consumes: the existing `drawPrompt`, `Prompt`, and `recentIds` state.

- [ ] **Step 1: Write the failing unit test**

Add this import and test to `app/lib/prompts.test.ts`:

```ts
import { rememberPrompt } from "./prompts";

it("keeps the newest 50 prompt IDs for repeat avoidance", () => {
  const previous = Array.from({ length: 50 }, (_, index) => `old-${index}`);

  expect(rememberPrompt(previous, "newest")).toEqual([
    "newest",
    ...previous.slice(0, 49),
  ]);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm run test:unit -- app/lib/prompts.test.ts`

Expected: FAIL because `rememberPrompt` is not exported.

- [ ] **Step 3: Implement the helper and use it**

Add to `app/lib/prompts.ts`:

```ts
export function rememberPrompt(
  recentIds: readonly string[],
  nextId: string,
  limit = 50,
): string[] {
  return [nextId, ...recentIds.filter((id) => id !== nextId)].slice(0, limit);
}
```

Import `rememberPrompt` in `TruthOrDareApp.tsx` and replace the 20-item state update with:

```ts
setRecentIds((previous) => rememberPrompt(previous, next.id));
```

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `npm run test:unit -- app/lib/prompts.test.ts`

Expected: all prompt unit tests PASS.

- [ ] **Step 5: Commit**

```powershell
git add app/lib/prompts.ts app/lib/prompts.test.ts app/components/TruthOrDareApp.tsx
git commit -m "feat: avoid the latest 50 prompts"
```

### Task 2: Permanent Three-Button Draw Controls

**Files:**
- Create: `app/components/TruthOrDareApp.test.tsx`
- Modify: `app/components/TruthOrDareApp.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: `draw(type: PromptType | "random")`.
- Produces: one `.draw-actions` row containing three buttons in truth, random, dare order.

- [ ] **Step 1: Write the failing component-render test**

Create `app/components/TruthOrDareApp.test.tsx`:

```tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { TruthOrDareApp } from "./TruthOrDareApp";

describe("draw controls", () => {
  it("renders permanent truth, random, and dare controls in order", () => {
    const html = renderToStaticMarkup(<TruthOrDareApp />);
    const truth = html.indexOf(">真心话<");
    const random = html.indexOf(">随机<");
    const dare = html.indexOf(">大冒险<");

    expect(truth).toBeGreaterThan(-1);
    expect(random).toBeGreaterThan(truth);
    expect(dare).toBeGreaterThan(random);
    expect(html).not.toContain("随机来一个");
    expect(html).not.toContain("换一个");
    expect(html).not.toContain("完成了");
  });
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm run test:unit -- app/components/TruthOrDareApp.test.tsx`

Expected: FAIL because the existing order is truth, dare, random and old copy remains.

- [ ] **Step 3: Simplify component state and markup**

In `TruthOrDareApp.tsx`:

- Remove `completed`, `completePrompt`, completed local-storage fields, and `.completed-pill`.
- Always render one `.draw-actions` row after `.prompt-card`.
- Use three `.draw-button` buttons calling `draw("truth")`, `draw("random")`, and `draw("dare")`.
- Give the middle button `random-draw-button` and visible label `随机`.
- Do not conditionally replace the action row when `currentPrompt` exists.

- [ ] **Step 4: Convert the action row to a three-column mobile layout**

In `app/globals.css`:

```css
.draw-actions {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.65rem;
}

.random-draw-button {
  /* Reuse the existing random accent while matching draw-button sizing. */
}
```

Remove unused `.random-button`, `.result-actions`, and `.completed-pill` rules. Keep a minimum 44px touch target and allow short labels to fit at the narrowest supported mobile width.

- [ ] **Step 5: Run the focused test and verify GREEN**

Run: `npm run test:unit -- app/components/TruthOrDareApp.test.tsx`

Expected: PASS.

- [ ] **Step 6: Run all unit tests**

Run: `npm run test:unit`

Expected: all tests PASS with zero failures.

- [ ] **Step 7: Commit**

```powershell
git add app/components/TruthOrDareApp.test.tsx app/components/TruthOrDareApp.tsx app/globals.css
git commit -m "feat: simplify mobile draw controls"
```

### Task 3: Full Verification and GitHub Pages Publication

**Files:**
- Verify: `app/components/TruthOrDareApp.tsx`
- Verify: `app/globals.css`
- Verify: `out/`

**Interfaces:**
- Consumes: the finished application and GitHub Pages configuration.
- Produces: a verified static build published at `https://xb99665588-lab.github.io/truth-or-dare-mobile/`.

- [ ] **Step 1: Run the complete checks**

Run:

```powershell
npm run lint
npm run test:unit
npm test
npm run build:pages
node --test tests/pages-export.test.mjs
```

Expected: every command exits 0 with no test failures.

- [ ] **Step 2: Inspect the static HTML**

Check `out/index.html` for the three action labels and verify that `随机来一个`, `换一个`, and `完成了` are absent.

- [ ] **Step 3: Publish source and static export**

Commit any remaining intentional changes, update the GitHub `main` branch, publish the contents of `out/` to `gh-pages`, and keep the Pages source set to `gh-pages` at `/`.

- [ ] **Step 4: Verify production**

Request:

`https://xb99665588-lab.github.io/truth-or-dare-mobile/`

Expected: HTTP 200, updated labels present, removed labels absent, and every referenced JavaScript/CSS asset returns HTTP 200.
