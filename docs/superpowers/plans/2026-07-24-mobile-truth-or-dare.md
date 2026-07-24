# Mobile Truth or Dare Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and publish a mobile-only truth-or-dare punishment picker with exactly 2000 safe, unique prompts.

**Architecture:** A deterministic prompt catalog feeds pure filtering and drawing functions. One client page owns the short interaction flow, while global CSS supplies the mobile party visual system and accessible motion behavior.

**Tech Stack:** React 19, TypeScript, vinext/Vite, Vitest, CSS, localStorage, Sites hosting.

## Global Constraints

- Friend mode has exactly 1500 prompts; couple mode has exactly 500.
- Friend buckets contain 250 prompts per mode/difficulty/type combination.
- Couple truth and dare each contain 83 easy, 83 advanced, and 84 spicy prompts.
- Couple content may be bold and suggestive but never explicit, coercive, humiliating, dangerous, or privacy-violating.
- The UI targets phone portrait widths from 360px through 430px.

---

### Task 1: Define and test the catalog contract

**Files:**
- Create: `app/lib/prompts.test.ts`
- Create: `app/lib/prompts.ts`
- Create: `app/data/prompt-catalog.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `PROMPTS`, `filterPrompts`, `drawPrompt`, `getCatalogStats`

- [ ] Install Vitest and add a unit-test script.
- [ ] Write tests for exact totals, bucket quotas, unique IDs/text, filtering, and recent-item avoidance.
- [ ] Run the focused test and confirm failure before catalog implementation.
- [ ] Implement deterministic catalog generation and pure domain functions.
- [ ] Run the focused test and confirm all assertions pass.

### Task 2: Build the mobile interaction

**Files:**
- Replace: `app/page.tsx`
- Create: `app/components/TruthOrDareApp.tsx`
- Replace: `app/globals.css`
- Modify: `app/layout.tsx`
- Delete: `app/_sites-preview/SkeletonPreview.tsx`
- Delete: `app/_sites-preview/preview.css`

**Interfaces:**
- Consumes: prompt-domain exports from Task 1
- Produces: mode selection, difficulty selection, draw card, swap, completion, and wheel interaction

- [ ] Replace the starter render test with assertions for the finished product shell.
- [ ] Confirm the render test fails against the starter.
- [ ] Implement the complete mobile page and metadata.
- [ ] Remove starter-only preview code and dependency.
- [ ] Confirm unit and rendered-output tests pass.

### Task 3: Validate and publish

**Files:**
- Verify all project source
- Create: `public/og.png` only if a generated social card passes visual inspection

**Interfaces:**
- Consumes: finished site source
- Produces: deployed private site version

- [ ] Run the full unit suite and production build.
- [ ] Verify the rendered HTML contains the product title and excludes preview metadata.
- [ ] Commit and push the exact validated source.
- [ ] Package, save, and deploy the Sites version.
- [ ] Confirm the deployment succeeds and open the deployed URL.

