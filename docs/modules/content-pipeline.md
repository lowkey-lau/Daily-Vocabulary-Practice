# 拾乡音 · 内容管线模块 PRD

| 项目 | 内容 |
| --- | --- |
| 模块 | 词表、选词、拼音、来源与许可 |
| 文档版本 | v0.1 |
| 更新日期 | 2026-11-27 |
| 负责人 | lowkey |
| 关联主 PRD | [PRD.md](../PRD.md) |
| 状态 | 已接入：40 词三阶段 |

---

## 1. 当前内容

- 40 个测试词，按三阶段组织：
  - 第一阶段 · 家人称呼：13 词
  - 第二阶段 · 日常场景：15 词
  - 第三阶段 · 基础词汇：12 词
- 26 个词命中 HSK 1–2 源表，14 个为补充词（家人称呼 / 场景短语）。
- 拼音由 `pinyin-pro` 生成，轻声人工覆盖。
- 释义、例句、标签为原创。

---

## 2. 数据流

```
Complete HSK Vocabulary 1–2（MIT，命中参考）
        +
content/selected-words.json（三阶段选词 + 原创释义/例句）
        +
pinyin-pro（MIT，生成拼音 + 轻声覆盖）
        ↓
scripts/build-words.mjs
        ↓
miniprogram/data/words.ts（小程序使用，自动生成）
content/core.json（人工审阅用）
```

---

## 3. 文件

| 文件 | 说明 |
| --- | --- |
| `content/selected-words.json` | 人工维护：选词、阶段、词性、释义、例句、标签 |
| `content/source/hsk-2.0-level1-2.json` | HSK 1–2 源词表快照（297 词，词目/等级/词频/词性） |
| `content/core.json` | 构建产物：40 词 + 阶段 + HSK 等级/词频或补充词标记 |
| `miniprogram/data/words.ts` | 自动生成，小程序使用 |
| `content/SOURCES.md` | 来源、许可、使用范围 |
| `content/README.md` | 管线说明 |

---

## 4. 命令

```bash
npm run fetch:hsk     # 拉取 HSK 2.0 Level 1–2 源词表
npm run build:words   # 从 selected-words.json 生成 words.ts
```

---

## 5. 添加词

1. 在 `content/selected-words.json` 增加：
   `term / stage / pos / meaning / example / exampleMeaning / tags`
2. `stage` 只能是 `family` / `daily` / `basic`
3. 命中 HSK 1–2 会记录等级/词频；未命中的家人称呼和场景短语作为补充词
4. 运行 `npm run build:words`
5. 检查 `content/core.json` 和 `miniprogram/data/words.ts`

---

## 6. 拼音规则

- 不直接使用 HSK 源表的拼音（源表对多音字有错误，如看 kān、听 yǐn）。
- 统一用 `pinyin-pro` 生成。
- 轻声/多音字人工覆盖，当前覆盖：学生 `xué sheng`。
- 家庭录入页不显示拼音；方言读音以长辈录音为准。

---

## 7. 来源与许可

- HSK 源表：Complete HSK Vocabulary，MIT；仅用词目/等级/词频/词性，不使用其英文释义。
- pinyin-pro：MIT，仅构建依赖。
- 中文释义/例句/标签：本项目原创。
- 正式发布前由对应语言/方言的母语者审校。
- 详见 [content/SOURCES.md](../../content/SOURCES.md)、[content/README.md](../../content/README.md)。

---

## 8. 下一步

- 扩到 100–200 词：优先补家人称呼（叔叔、阿姨、舅舅、姑姑、表哥、表姐）和日常场景。
- 为每个阶段补主题标签，方便后续做主题内容包（商业化）。
- 增加内容版本号，支持客户端缓存失效。

---

## 变更记录

| 版本 | 日期 | 变更 |
| --- | --- | --- |
| v0.1 | 2026-11-27 | 初稿：三阶段 40 词、HSK 参考、pinyin-pro、MIT 许可 |
