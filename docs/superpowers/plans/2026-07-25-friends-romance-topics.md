# Friends Romance Topics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace exactly 600 friends-mode prompts with progressively bolder romance topics while preserving the 2000-prompt catalog and all existing interactions.

**Architecture:** Add a `topic` field to generated prompts and keep romance base copy in a dedicated data module. Extend the catalog builder so each friends bucket combines an exact number of general and romance candidates, while couple buckets remain fully romance-tagged. Tests validate counts, uniqueness, distribution, consent wording, and existing safety exclusions.

**Tech Stack:** TypeScript, Next.js, Vitest, existing deterministic prompt generator.

## Global Constraints

- Total catalog remains exactly 2000 prompts: friends 1500 and couple 500.
- Friends romance distribution is exactly 75/75 easy truth/dare, 100/100 advanced truth/dare, and 125/125 spicy truth/dare.
- Friends romance total is exactly 600 prompts.
- Existing prompt IDs, modes, difficulties, draw controls, wheel, and recent-50 avoidance remain compatible.
- Physical or directed interactions require explicit consent and allow refusal or simulation.
- No forced confession/contact, private-data exposure,偷拍, password disclosure, dangerous behavior, or explicit sexual acts.

---

### Task 1: Topic Schema and Exact Distribution Tests

**Files:**
- Modify: `app/lib/prompts.ts`
- Modify: `app/lib/prompts.test.ts`

**Interfaces:**
- Produces: `PromptTopic = "general" | "romance"` and required `Prompt.topic`.
- Consumes: `PROMPTS` and `getCatalogStats`.

- [ ] **Step 1: Write failing distribution tests**

Add to `app/lib/prompts.test.ts`:

```ts
it("contains the approved friends romance distribution", () => {
  const romance = PROMPTS.filter(
    (prompt) => prompt.mode === "friends" && prompt.topic === "romance",
  );

  expect(romance).toHaveLength(600);
  expect(
    Object.fromEntries(
      difficulties.flatMap((difficulty) =>
        types.map((type) => [
          `${difficulty}-${type}`,
          romance.filter(
            (prompt) =>
              prompt.difficulty === difficulty && prompt.type === type,
          ).length,
        ]),
      ),
    ),
  ).toEqual({
    "easy-truth": 75,
    "easy-dare": 75,
    "advanced-truth": 100,
    "advanced-dare": 100,
    "spicy-truth": 125,
    "spicy-dare": 125,
  });
});

it("keeps directed romance dares explicitly consensual", () => {
  const directed = PROMPTS.filter(
    (prompt) =>
      prompt.mode === "friends" &&
      prompt.topic === "romance" &&
      prompt.type === "dare",
  );

  expect(
    directed.every((prompt) =>
      /愿意|同意|拒绝|模拟|不勉强/.test(prompt.text),
    ),
  ).toBe(true);
});
```

- [ ] **Step 2: Run the tests and verify RED**

Run: `npm run test:unit -- app/lib/prompts.test.ts`

Expected: FAIL because `Prompt` has no `topic` field and no romance distribution exists.

- [ ] **Step 3: Add the topic type**

Update `app/lib/prompts.ts`:

```ts
export type PromptTopic = "general" | "romance";

export type Prompt = {
  id: string;
  mode: GameMode;
  difficulty: Difficulty;
  type: PromptType;
  topic: PromptTopic;
  text: string;
};
```

- [ ] **Step 4: Keep the test red for the correct reason**

Run: `npm run test:unit -- app/lib/prompts.test.ts`

Expected: FAIL on romance counts, proving the schema compiles but the content is not implemented.

### Task 2: Curated Romance Core Data

**Files:**
- Create: `app/data/friend-romance-cores.ts`

**Interfaces:**
- Produces: six readonly string arrays with lengths 15, 15, 20, 20, 25, and 25.
- Consumes: no application state.

- [ ] **Step 1: Add five truth and five consent-first dare styles**

```ts
export const friendRomanceTruthStyles = [
  "关于心动，直接回答：",
  "不许说“随便”，认真回答：",
  "把第一反应说出来：",
  "看着大家坦白回答：",
  "用最诚实的一句话回答：",
] as const;

export const friendRomanceDareStyles = [
  "在涉及他人且对方明确愿意的前提下：",
  "允许对方拒绝或改为模拟，然后完成：",
  "先征得相关人的同意，再完成：",
  "不公开隐私、不勉强任何人地完成：",
  "可以用假设或演练代替真实行动，然后完成：",
] as const;
```

- [ ] **Step 2: Add the exact easy cores**

```ts
export const friendRomanceEasyTruth = [
  "你最容易被哪一种笑容打动？",
  "你的理想型最重要的三个特点是什么？",
  "你第一次心动大概发生在什么年龄？",
  "你更喜欢日久生情还是一见钟情？",
  "异性朋友做什么小事最容易让你产生好感？",
  "你喜欢主动追求还是等待对方靠近？",
  "你认为朋友变恋人最大的优点是什么？",
  "你最想和喜欢的人一起完成哪件普通小事？",
  "什么样的聊天方式最容易让你心动？",
  "你会用哪首歌暗示自己喜欢一个人？",
  "你更看重外表、性格还是相处感觉？",
  "你觉得自己恋爱时会变得黏人吗？",
  "喜欢的人怎样称呼你最让你开心？",
  "你理想中的第一次约会是什么样？",
  "你能接受和认识很久的朋友谈恋爱吗？",
] as const;

export const friendRomanceEasyDare = [
  "用三个词描述你的理想型",
  "演出看到喜欢的人突然出现时的表情",
  "用一句不直接说喜欢的话表达心动",
  "模拟邀请喜欢的人一起吃饭",
  "选一首适合告白的歌并哼唱一句",
  "对在场一位你欣赏的人说出一个具体优点",
  "演示你收到心动消息时的真实反应",
  "设计一个不尴尬的约会开场白",
  "用天气预报的方式描述最近的感情状态",
  "模拟给理想型做十秒自我介绍",
  "用一个动作表现偷偷喜欢一个人",
  "给未来对象设计一个可爱的昵称",
  "演出异性朋友突然夸你时的反应",
  "用一句电影台词表达朦胧好感",
  "在三十秒内说出五个令人心动的小细节",
] as const;
```

- [ ] **Step 3: Add the exact advanced cores**

```ts
export const friendRomanceAdvancedTruth = [
  "你最近一次真正心动是因为什么？",
  "你曾经暗恋一个人最长多久？",
  "你有没有把喜欢藏在玩笑里？",
  "你会因为喜欢的人和别人走得近而吃醋吗？",
  "你错过过哪一种本来可能开始的关系？",
  "你收到过最像暧昧信号的一句话是什么？",
  "你曾经为了见喜欢的人故意制造过什么机会？",
  "你能接受喜欢的人曾是好友的前任吗？",
  "你更害怕告白失败还是一直没有说出口？",
  "你认为异性之间可以保持纯友谊吗？",
  "你曾把哪种普通互动误会成心动信号？",
  "你最想问曾经喜欢的人哪个问题？",
  "你会因为对方不主动而放弃一段暧昧吗？",
  "在场有没有人符合你理想型的一项特征？",
  "你谈恋爱后最希望保留多少个人空间？",
  "什么行为会让你立刻停止喜欢一个人？",
  "你曾经删掉过准备发给喜欢之人的什么消息？",
  "你最难忘的一次告白或被告白是什么？",
  "你愿意先从朋友开始了解心动对象吗？",
  "你觉得自己最会释放哪一种暧昧信号？",
] as const;

export const friendRomanceAdvancedDare = [
  "模拟一次认真但不油腻的告白",
  "对在场一位你欣赏的人保持十秒对视",
  "让大家给你设计一句适合理想型的开场白并演出来",
  "用语音消息的语气说一句晚安情话但不真实发送",
  "演出发现暗恋对象也喜欢自己时的反应",
  "选择一位朋友模拟第一次约会的见面场景",
  "说出在场一位异性朋友最吸引人的优点",
  "用三个具体细节夸奖一位你愿意夸的人",
  "模拟邀请心动对象周末见面",
  "用十五秒演出从朋友变恋人的偶像剧情节",
  "让大家判断你表演的三种暧昧信号",
  "模拟收到前任问候时最成熟的回复",
  "选一首歌并解释为什么适合送给喜欢的人",
  "对镜头完成一段二十秒约会自我介绍",
  "用一句话区分好感、喜欢和爱",
  "模拟向异性好友确认彼此关系",
  "演出吃醋但努力保持镇定的样子",
  "说出你愿意为喜欢的人做的三件小事",
  "让现场一人扮演心动对象并完成三轮约会问答",
  "用不超过二十个字写一句暧昧但不冒犯的消息",
] as const;
```

- [ ] **Step 4: Add the exact spicy cores**

```ts
export const friendRomanceSpicyTruth = [
  "在场谁最接近你的理想型？",
  "如果必须选一个人约会，你会选在场谁？",
  "你现在心里有没有明确喜欢的人？",
  "你和朋友之间发生过最暧昧的瞬间是什么？",
  "你有没有喜欢过在场的人或朋友的朋友？",
  "你最容易被哪一种身体距离打乱心跳？",
  "你能接受暧昧多久还不确认关系？",
  "你曾同时对两个人产生过好感吗？",
  "你最想和喜欢的人发生的下一步是什么？",
  "你有没有故意让喜欢的人吃醋过？",
  "你更喜欢牵手、拥抱还是长时间对视？",
  "你曾经和异性朋友差一点越过友情边界吗？",
  "你最想收到谁主动发来的哪句话？",
  "如果旧爱和新心动同时出现，你会怎么选？",
  "你会介意对象和异性好友单独旅行吗？",
  "你最冲动的一次感情决定是什么？",
  "你曾经明知对方喜欢你却装作不知道吗？",
  "在场谁最可能让你相处久了产生好感？",
  "你能接受先暧昧后恋爱还是必须先确认关系？",
  "你最想撤回的一次感情暗示是什么？",
  "你有没有因为害怕失去朋友而不敢告白？",
  "什么样的亲密称呼最容易让你害羞？",
  "你更容易对主动的人还是有距离感的人心动？",
  "你愿意公开恋情还是保持一段时间低调？",
  "你最希望喜欢的人主动完成哪一个亲密动作？",
] as const;

export const friendRomanceSpicyDare = [
  "选择在场最接近你理想型的人并说明三个理由",
  "与一位自愿参与者保持十五秒安静对视",
  "向一位自愿参与者完成一次正式告白演练",
  "与一位自愿参与者牵手十秒",
  "给喜欢的人拟一条暧昧消息并由大家评分是否发送",
  "与一位自愿参与者完成一个十秒拥抱",
  "靠近一位自愿参与者并说一句只用于演练的情话",
  "让一位自愿参与者扮演约会对象完成三道快问快答",
  "选择在场最让你心动的人并真诚夸奖一个细节",
  "模拟向异性好友坦白曾经产生过好感",
  "和一位自愿参与者拍一张有约会氛围的合照",
  "用二十秒演出朋友关系突然升温的场景",
  "让大家从三位虚拟对象中替你选约会对象并解释选择",
  "对一位自愿参与者说出你欣赏其哪种相处方式",
  "模拟收到喜欢的人深夜约见时的回复",
  "与一位自愿参与者额头保持一掌距离对视十秒",
  "说出你会发给心动对象的第一句主动消息",
  "演出发现好友也喜欢同一个人时的真实反应",
  "让一位自愿参与者为你设计专属暧昧称呼并使用三次",
  "模拟在聚会结束后单独邀请心动对象散步",
  "选择牵手、拥抱或对视，并与自愿参与者完成其中一项",
  "读出一段即兴情书但用虚构名字代替真实对象",
  "模拟向朋友解释自己为什么喜欢上共同好友",
  "给未来恋人录一段十秒语音式告白但不真实发送",
  "与一位自愿参与者演出从暧昧到确认关系的最后一句话",
] as const;
```

- [ ] **Step 5: Verify array sizes**

Import the six arrays and add:

```ts
it("provides the exact number of romance cores for each bucket", () => {
  expect([
    friendRomanceEasyTruth.length,
    friendRomanceEasyDare.length,
    friendRomanceAdvancedTruth.length,
    friendRomanceAdvancedDare.length,
    friendRomanceSpicyTruth.length,
    friendRomanceSpicyDare.length,
  ]).toEqual([15, 15, 20, 20, 25, 25]);
});
```

Run: `npm run test:unit -- app/lib/prompts.test.ts`

Expected: array-size test PASS; distribution test remains FAIL until Task 3.

### Task 3: Deterministic Mixed Bucket Builder

**Files:**
- Modify: `app/data/prompt-catalog.ts`
- Test: `app/lib/prompts.test.ts`

**Interfaces:**
- Consumes: romance styles and cores from `friend-romance-cores.ts`.
- Produces: exact general/romance counts with stable prompt IDs.

- [ ] **Step 1: Extend `BucketConfig`**

```ts
type BucketConfig = {
  mode: GameMode;
  difficulty: Difficulty;
  type: PromptType;
  count: number;
  cores: readonly string[];
  styles: readonly string[];
  defaultTopic?: Prompt["topic"];
  romanceCount?: number;
  romanceCores?: readonly string[];
  romanceStyles?: readonly string[];
};
```

- [ ] **Step 2: Build both candidate groups**

Replace `buildBucket` with:

```ts
function buildBucket(config: BucketConfig): Prompt[] {
  const romanceCount = config.romanceCount ?? 0;
  const generalCount = config.count - romanceCount;
  const generalCandidates = config.styles.flatMap((style) =>
    config.cores.map((core) => ({
      text: `${style}${core}`,
      topic: config.defaultTopic ?? ("general" as const),
    })),
  );
  const romanceCandidates = (config.romanceStyles ?? []).flatMap((style) =>
    (config.romanceCores ?? []).map((core) => ({
      text: `${style}${core}`,
      topic: "romance" as const,
    })),
  );

  if (
    generalCandidates.length < generalCount ||
    romanceCandidates.length < romanceCount
  ) {
    throw new Error(
      `题库语料不足：${config.mode}/${config.difficulty}/${config.type}`,
    );
  }

  return [
    ...generalCandidates.slice(0, generalCount),
    ...romanceCandidates.slice(0, romanceCount),
  ].map(({ text, topic }, index) => ({
    id: `${config.mode}-${config.difficulty}-${config.type}-${String(index + 1).padStart(3, "0")}`,
    mode: config.mode,
    difficulty: config.difficulty,
    type: config.type,
    topic,
    text,
  }));
}
```

- [ ] **Step 3: Configure the six friends buckets**

Use these fields on the six existing friends configs:

```ts
{ difficulty: "easy", type: "truth", romanceCount: 75, romanceCores: friendRomanceEasyTruth, romanceStyles: friendRomanceTruthStyles }
{ difficulty: "easy", type: "dare", romanceCount: 75, romanceCores: friendRomanceEasyDare, romanceStyles: friendRomanceDareStyles }
{ difficulty: "advanced", type: "truth", romanceCount: 100, romanceCores: friendRomanceAdvancedTruth, romanceStyles: friendRomanceTruthStyles }
{ difficulty: "advanced", type: "dare", romanceCount: 100, romanceCores: friendRomanceAdvancedDare, romanceStyles: friendRomanceDareStyles }
{ difficulty: "spicy", type: "truth", romanceCount: 125, romanceCores: friendRomanceSpicyTruth, romanceStyles: friendRomanceTruthStyles }
{ difficulty: "spicy", type: "dare", romanceCount: 125, romanceCores: friendRomanceSpicyDare, romanceStyles: friendRomanceDareStyles }
```

Retain each config's existing `mode`, `count`, `cores`, and `styles` fields.

- [ ] **Step 4: Tag couple buckets**

Add this field to all six couple bucket configs:

```ts
defaultTopic: "romance"
```

- [ ] **Step 5: Run all unit tests and verify GREEN**

Run: `npm run test:unit`

Expected: 2000 total prompts, exact 600 friends romance prompts, all IDs/text unique, consent checks and safety checks PASS.

- [ ] **Step 6: Commit the implementation**

```powershell
git add app/data/friend-romance-cores.ts app/data/prompt-catalog.ts app/lib/prompts.ts app/lib/prompts.test.ts
git commit -m "feat: add romance topics to friends mode"
```

### Task 4: Full Verification and Publication

**Files:**
- Verify: `app/data/friend-romance-cores.ts`
- Verify: `app/data/prompt-catalog.ts`
- Verify: `out/`

**Interfaces:**
- Produces: updated Sites and GitHub Pages deployments.

- [ ] **Step 1: Run complete validation**

```powershell
npm run lint
npm run test:unit
npm test
npm run build:pages
node --test tests/pages-export.test.mjs
```

Expected: all commands exit 0 with no failed tests.

- [ ] **Step 2: Publish exact source**

Push the validated `main` commit to the configured Sites source repository and GitHub `main`.

- [ ] **Step 3: Publish both production targets**

Package and deploy the saved Sites version. Publish the `out/` tree to `gh-pages` with `.nojekyll`, then wait for GitHub Pages status `built`.

- [ ] **Step 4: Verify public delivery**

Request both production URLs. GitHub Pages must return HTTP 200 and all referenced JavaScript/CSS assets must also return HTTP 200.
