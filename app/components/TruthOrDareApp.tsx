"use client";

import { useEffect, useMemo, useState } from "react";
import { PROMPTS } from "../data/prompt-catalog";
import {
  drawPrompt,
  filterPrompts,
  type Difficulty,
  type GameMode,
  type Prompt,
  type PromptType,
} from "../lib/prompts";

const modeOptions: Array<{
  value: GameMode;
  icon: string;
  title: string;
  subtitle: string;
  count: number;
}> = [
  {
    value: "friends",
    icon: "✦",
    title: "朋友局",
    subtitle: "搞笑、社交、放开玩",
    count: 1500,
  },
  {
    value: "couple",
    icon: "♥",
    title: "情侣局",
    subtitle: "心动、默契、亲密感",
    count: 500,
  },
];

const difficultyOptions: Array<{
  value: Difficulty;
  label: string;
  hint: string;
}> = [
  { value: "easy", label: "轻松", hint: "暖场" },
  { value: "advanced", label: "进阶", hint: "认真玩" },
  { value: "spicy", label: "刺激", hint: "别害羞" },
];

const promptLabels: Record<PromptType, { label: string; icon: string }> = {
  truth: { label: "真心话", icon: "◉" },
  dare: { label: "大冒险", icon: "⚡" },
};

const STORAGE_KEY = "truth-or-dare-mobile-state";

export function TruthOrDareApp() {
  const [mode, setMode] = useState<GameMode>("friends");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [currentPrompt, setCurrentPrompt] = useState<Prompt | null>(null);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [completed, setCompleted] = useState(0);
  const [wheelOpen, setWheelOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [cardKey, setCardKey] = useState(0);
  const [hasLoadedPreferences, setHasLoadedPreferences] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as {
          mode?: GameMode;
          difficulty?: Difficulty;
          completed?: number;
        };
        if (saved.mode === "friends" || saved.mode === "couple") {
          setMode(saved.mode);
        }
        if (
          saved.difficulty === "easy" ||
          saved.difficulty === "advanced" ||
          saved.difficulty === "spicy"
        ) {
          setDifficulty(saved.difficulty);
        }
        if (typeof saved.completed === "number") {
          setCompleted(saved.completed);
        }
      } catch {
        // Invalid local preferences are safely ignored.
      }
      setHasLoadedPreferences(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hasLoadedPreferences) return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ mode, difficulty, completed }),
    );
  }, [mode, difficulty, completed, hasLoadedPreferences]);

  const activeCount = useMemo(
    () =>
      PROMPTS.filter(
        (prompt) =>
          prompt.mode === mode && prompt.difficulty === difficulty,
      ).length,
    [difficulty, mode],
  );

  function updateMode(nextMode: GameMode) {
    setMode(nextMode);
    setCurrentPrompt(null);
  }

  function updateDifficulty(nextDifficulty: Difficulty) {
    setDifficulty(nextDifficulty);
    setCurrentPrompt(null);
  }

  function draw(type: PromptType | "random") {
    const resolvedType: PromptType =
      type === "random" ? (Math.random() < 0.5 ? "truth" : "dare") : type;
    const pool = filterPrompts(PROMPTS, {
      mode,
      difficulty,
      type: resolvedType,
    });
    const next = drawPrompt(pool, recentIds);
    setRecentIds((previous) => [next.id, ...previous].slice(0, 20));
    setCurrentPrompt(next);
    setCardKey((value) => value + 1);
  }

  function completePrompt() {
    setCompleted((value) => value + 1);
    setCurrentPrompt(null);
  }

  function spinWheel() {
    if (spinning) return;
    setSpinning(true);
    window.setTimeout(() => {
      const chosen: PromptType = Math.random() < 0.5 ? "truth" : "dare";
      draw(chosen);
      setSpinning(false);
      setWheelOpen(false);
    }, 1100);
  }

  return (
    <main className={`app-shell mode-${mode}`}>
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <div className="mobile-page">
        <header className="topbar">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true">
              ?
            </span>
            <div>
              <strong>输家请抽牌</strong>
              <span>真心话大冒险</span>
            </div>
          </div>
          <div className="completed-pill" aria-label={`已完成 ${completed} 次`}>
            <span aria-hidden="true">✓</span>
            {completed}
          </div>
        </header>

        <section className="hero">
          <span className="eyebrow">2000 道题目 · 输了别躲</span>
          <h1>
            输了别躲，
            <br />
            <em>抽一张吧。</em>
          </h1>
          <p>选好场景和难度，剩下的交给运气。</p>
        </section>

        <section className="control-section" aria-labelledby="mode-title">
          <div className="section-heading">
            <div>
              <span className="step-number">01</span>
              <h2 id="mode-title">今晚什么局？</h2>
            </div>
            <span className="section-note">先选场景</span>
          </div>
          <div className="mode-grid">
            {modeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`mode-card ${mode === option.value ? "is-active" : ""}`}
                onClick={() => updateMode(option.value)}
                aria-pressed={mode === option.value}
              >
                <span className="mode-icon" aria-hidden="true">
                  {option.icon}
                </span>
                <strong>{option.title}</strong>
                <span>{option.subtitle}</span>
                <small>{option.count} 道</small>
              </button>
            ))}
          </div>
        </section>

        <section className="control-section" aria-labelledby="difficulty-title">
          <div className="section-heading">
            <div>
              <span className="step-number">02</span>
              <h2 id="difficulty-title">敢玩多大？</h2>
            </div>
            <span className="section-note">当前 {activeCount} 道</span>
          </div>
          <div className="difficulty-tabs">
            {difficultyOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={difficulty === option.value ? "is-active" : ""}
                onClick={() => updateDifficulty(option.value)}
                aria-pressed={difficulty === option.value}
              >
                <strong>{option.label}</strong>
                <span>{option.hint}</span>
              </button>
            ))}
          </div>
          {mode === "couple" && difficulty === "spicy" && (
            <p className="consent-note">
              <span aria-hidden="true">♡</span>
              亲密挑战只在双方愿意时进行，任何题目都可以跳过。
            </p>
          )}
        </section>

        <section className="draw-section" aria-labelledby="draw-title">
          <div className="section-heading">
            <div>
              <span className="step-number">03</span>
              <h2 id="draw-title">抽你的惩罚</h2>
            </div>
            <button
              className="wheel-link"
              type="button"
              onClick={() => setWheelOpen(true)}
            >
              <span aria-hidden="true">◎</span>
              转盘
            </button>
          </div>

          <div
            key={cardKey}
            className={`prompt-card ${currentPrompt ? "has-prompt" : ""}`}
            aria-live="polite"
          >
            {currentPrompt ? (
              <>
                <div className={`prompt-badge type-${currentPrompt.type}`}>
                  <span aria-hidden="true">
                    {promptLabels[currentPrompt.type].icon}
                  </span>
                  {promptLabels[currentPrompt.type].label}
                </div>
                <p>{currentPrompt.text}</p>
                <span className="prompt-id">
                  {mode === "friends" ? "朋友局" : "情侣局"} ·{" "}
                  {
                    difficultyOptions.find(
                      (item) => item.value === difficulty,
                    )?.label
                  }
                </span>
              </>
            ) : (
              <div className="card-placeholder">
                <span className="question-mark" aria-hidden="true">
                  ?
                </span>
                <strong>准备好了吗？</strong>
                <p>选一种方式，翻开今晚的惩罚。</p>
              </div>
            )}
          </div>

          {currentPrompt ? (
            <div className="result-actions">
              <button
                className="secondary-action"
                type="button"
                onClick={() => draw(currentPrompt.type)}
              >
                ↻ 换一个
              </button>
              <button
                className="primary-action"
                type="button"
                onClick={completePrompt}
              >
                ✓ 完成了
              </button>
            </div>
          ) : (
            <div className="draw-actions">
              <button
                className="draw-button truth-button"
                type="button"
                onClick={() => draw("truth")}
              >
                <span aria-hidden="true">◉</span>
                <strong>真心话</strong>
                <small>敢不敢说实话</small>
              </button>
              <button
                className="draw-button dare-button"
                type="button"
                onClick={() => draw("dare")}
              >
                <span aria-hidden="true">⚡</span>
                <strong>大冒险</strong>
                <small>敢不敢做出来</small>
              </button>
              <button
                className="random-button"
                type="button"
                onClick={() => draw("random")}
              >
                <span aria-hidden="true">✦</span>
                随机来一个
              </button>
            </div>
          )}
        </section>

        <footer>
          <span>朋友 1500</span>
          <i />
          <span>情侣 500</span>
          <i />
          <span>最近 20 题不重复</span>
        </footer>
      </div>

      {wheelOpen && (
        <div className="wheel-overlay" role="dialog" aria-modal="true" aria-label="随机转盘">
          <button
            className="overlay-close"
            type="button"
            onClick={() => setWheelOpen(false)}
            aria-label="关闭转盘"
          >
            ×
          </button>
          <div className="wheel-panel">
            <span className="eyebrow">让运气替你决定</span>
            <h2>真心话还是大冒险？</h2>
            <div className="wheel-wrap">
              <span className="wheel-pointer" aria-hidden="true" />
              <div className={`wheel ${spinning ? "is-spinning" : ""}`}>
                <div className="wheel-label wheel-truth">真心话</div>
                <div className="wheel-label wheel-dare">大冒险</div>
                <span className="wheel-center">GO</span>
              </div>
            </div>
            <button
              className="spin-button"
              type="button"
              onClick={spinWheel}
              disabled={spinning}
            >
              {spinning ? "命运正在转…" : "开始转盘"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
