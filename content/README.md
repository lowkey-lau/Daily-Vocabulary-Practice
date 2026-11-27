# 内容管线

本地测试词表不是手写死在 `words.ts` 里，而是从免费 HSK 1–2 词表选词，再合并本项目原创释义和 `pinyin-pro` 拼音生成。

## 数据流

```
HSK 1–2 源词表（fetch:hsk）
        +
content/selected-words.json（选词 + 原创释义/例句）
        +
pinyin-pro（生成拼音 + 轻声覆盖）
        ↓
scripts/build-words.mjs
        ↓
miniprogram/data/words.ts（小程序使用）
content/core-40.json（人工审阅用）
```

## 文件

| 文件 | 说明 |
| --- | --- |
| `selected-words.json` | 人工维护：选词、词性、释义、例句、标签 |
| `source/hsk-2.0-level1-2.json` | 从 HSK 源表拉取的 297 词快照（词目 / 等级 / 词频 / 词性） |
| `core-40.json` | 构建产物：合并后的 40 词，含 HSK 等级和词频，便于审阅 |
| `LICENSE-HSK.txt` | HSK 源表 MIT 许可 |
| `LICENSE-PINYIN-PRO.txt` | pinyin-pro MIT 许可 |

## 命令

```bash
npm run fetch:hsk     # 拉取 HSK 2.0 level 1–2 源词表
npm run build:words   # 合并选词 + 拼音，生成 miniprogram/data/words.ts
```

日常只改 `content/selected-words.json`，然后跑 `npm run build:words`。

## 添加词

1. 在 `selected-words.json` 的 `words` 里加一条：
   `term / pos / meaning / example / exampleMeaning / tags`
2. 确认 `term` 在 HSK 1–2 源词表里；不在会构建失败
3. 运行 `npm run build:words`
4. 检查 `content/core-40.json` 和 `miniprogram/data/words.ts`

## 拼音

- 拼音由 `pinyin-pro`（MIT）生成，不直接使用 HSK 源表的拼音
- 轻声 / 多音字在 `scripts/build-words.mjs` 的 `PINYIN_OVERRIDES` 里人工覆盖
- 当前覆盖：学生 `xué sheng`、朋友 `péng you`

## 注意

- **不要直接编辑 `miniprogram/data/words.ts`**，它是自动生成的
- 释义、例句、标签为本项目原创，不复制词典或教材内容
- 正式发布前由母语者审校释义、拼音和例句
- 来源和许可详见 [SOURCES.md](./SOURCES.md)
