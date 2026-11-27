# 来源与许可

## HSK 1–2 词目 / 等级 / 词频

- 来源：Complete HSK Vocabulary
- 仓库：https://github.com/drkameleon/complete-hsk-vocabulary
- 文件：
  - `wordlists/exclusive/old/1.json`（HSK 2.0 Level 1）
  - `wordlists/exclusive/old/2.json`（HSK 2.0 Level 2）
- 许可：MIT License，Copyright (c) 2026 Yanis Zafirópulos
- 本项目使用范围：仅作为**词目命中参考**，同步 HSK 等级、词频、词性
- 未使用：源数据中的拼音、英文释义、例句
- 家人称呼、日常场景短语等未命中的词标记为「补充词」，释义和拼音由本项目处理
- 快照：`content/source/hsk-2.0-level1-2.json`，2026-11-27，297 词
- 许可全文：`content/LICENSE-HSK.txt`

> HSK 官方考试大纲、教材释义和例句的版权归官方所有。本项目只把 HSK 词表作为选词参考，中文释义和例句由本项目原创，不复制官方内容。

## 拼音

- 来源：pinyin-pro 3.29.5
- 仓库：https://github.com/zh-lx/pinyin-pro
- 许可：MIT License，Copyright (c) 2022-present zh-lx
- 用途：构建时根据词目生成拼音；仅作为开发依赖，不随小程序发布
- 人工覆盖：`scripts/build-words.mjs` 中的 `PINYIN_OVERRIDES`（学生、朋友）
- 许可全文：`content/LICENSE-PINYIN-PRO.txt`

> 未直接使用 HSK 源表中的拼音：源表对多音字存在错误（例如「看」给成 kān、「听」给成 yǐn）。

## 本项目原创内容

- 中文释义、例句、例句说明、标签、选词范围
- 作者：本项目
- 正式发布前由对应语言 / 方言的母语者审校

## 评估过但本版未采用

| 来源 | 许可 | 未采用原因 |
| --- | --- | --- |
| Concepticon / Swadesh | CC BY 4.0 | 适合跨语言核心概念表，但需要自己补中文词目；可作为下一步扩展 |
| CC-CEDICT | CC BY-SA 4.0 | 英文释义为主；直接采用会触发 share-alike，本版只做参考 |
| jieba dict.txt | MIT | 有词频但无释义，本版用三阶段选词即可 |
| rime-cantonese | CC BY 4.0 / ODbL | 粤语注音，等确定粤语词书时再接 |
| CC-Canto | CC BY-SA 3.0 | 粤语词典，等确定粤语词书时再接 |
| PanLex | CC0 | 跨语言翻译候选，质量需母语者核对 |

## 变更要求

新增内容源时：

1. 在 `content/` 下补 LICENSE 文件
2. 在本文件记录来源、许可、使用范围和是否修改
3. 在「关于与隐私」页或小程序内提供来源说明
