export type GameMode = "friends" | "couple";
export type Difficulty = "easy" | "advanced" | "spicy";
export type PromptType = "truth" | "dare";

export type Prompt = {
  id: string;
  mode: GameMode;
  difficulty: Difficulty;
  type: PromptType;
  text: string;
};

export type PromptFilters = {
  mode: GameMode;
  difficulty: Difficulty;
  type: PromptType;
};

export function filterPrompts(
  prompts: readonly Prompt[],
  filters: PromptFilters,
): Prompt[] {
  return prompts.filter(
    (prompt) =>
      prompt.mode === filters.mode &&
      prompt.difficulty === filters.difficulty &&
      prompt.type === filters.type,
  );
}

export function drawPrompt(
  pool: readonly Prompt[],
  recentIds: readonly string[],
  random: () => number = Math.random,
): Prompt {
  if (pool.length === 0) {
    throw new Error("当前筛选下没有可抽取的题目");
  }

  const recent = new Set(recentIds);
  const fresh = pool.filter((prompt) => !recent.has(prompt.id));
  const candidates = fresh.length > 0 ? fresh : [...pool];
  const index = Math.min(
    candidates.length - 1,
    Math.floor(random() * candidates.length),
  );
  return candidates[index];
}

type BucketStats = Record<Difficulty, Record<PromptType, number>>;

export type CatalogStats = {
  total: number;
  friends: BucketStats & { total: number };
  couple: BucketStats & { total: number };
};

export function getCatalogStats(prompts: readonly Prompt[]): CatalogStats {
  const emptyMode = (): BucketStats & { total: number } => ({
    total: 0,
    easy: { truth: 0, dare: 0 },
    advanced: { truth: 0, dare: 0 },
    spicy: { truth: 0, dare: 0 },
  });
  const stats: CatalogStats = {
    total: prompts.length,
    friends: emptyMode(),
    couple: emptyMode(),
  };

  for (const prompt of prompts) {
    stats[prompt.mode].total += 1;
    stats[prompt.mode][prompt.difficulty][prompt.type] += 1;
  }

  return stats;
}

