import { describe, expect, it } from "vitest";
import { PROMPTS } from "../data/prompt-catalog";
import {
  drawPrompt,
  filterPrompts,
  getCatalogStats,
  rememberPrompt,
  type Difficulty,
  type GameMode,
  type PromptType,
} from "./prompts";

const modes: GameMode[] = ["friends", "couple"];
const difficulties: Difficulty[] = ["easy", "advanced", "spicy"];
const types: PromptType[] = ["truth", "dare"];

describe("prompt catalog", () => {
  it("contains the approved 2000-prompt distribution", () => {
    expect(PROMPTS).toHaveLength(2000);
    expect(getCatalogStats(PROMPTS)).toEqual({
      total: 2000,
      friends: {
        total: 1500,
        easy: { truth: 250, dare: 250 },
        advanced: { truth: 250, dare: 250 },
        spicy: { truth: 250, dare: 250 },
      },
      couple: {
        total: 500,
        easy: { truth: 83, dare: 83 },
        advanced: { truth: 83, dare: 83 },
        spicy: { truth: 84, dare: 84 },
      },
    });
  });

  it("uses unique IDs and unique visible text", () => {
    expect(new Set(PROMPTS.map((prompt) => prompt.id))).toHaveLength(2000);
    expect(new Set(PROMPTS.map((prompt) => prompt.text))).toHaveLength(2000);
  });

  it("contains every mode, difficulty, and prompt type bucket", () => {
    for (const mode of modes) {
      for (const difficulty of difficulties) {
        for (const type of types) {
          expect(
            filterPrompts(PROMPTS, { mode, difficulty, type }).length,
          ).toBeGreaterThan(0);
        }
      }
    }
  });

  it("avoids recently drawn prompts whenever another choice exists", () => {
    const pool = filterPrompts(PROMPTS, {
      mode: "friends",
      difficulty: "easy",
      type: "truth",
    });
    const recentIds = pool.slice(0, 20).map((prompt) => prompt.id);
    const drawn = drawPrompt(pool, recentIds, () => 0);

    expect(recentIds).not.toContain(drawn.id);
  });

  it("keeps the newest 50 prompt IDs for repeat avoidance", () => {
    const previous = Array.from({ length: 50 }, (_, index) => `old-${index}`);

    expect(rememberPrompt(previous, "newest")).toEqual([
      "newest",
      ...previous.slice(0, 49),
    ]);
  });

  it("excludes unsafe or explicit instructions", () => {
    const forbidden = /强迫|偷拍视频|泄露密码|危险驾驶|露骨性行为/;
    expect(PROMPTS.filter((prompt) => forbidden.test(prompt.text))).toEqual([]);
  });
});
