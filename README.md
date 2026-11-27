# 每日单词练习小程序

面向碎片时间学习的粤语词汇练习微信小程序。第一版以「看词选义」为核心题型，每天 3–5 分钟，学几个词也算数；数据模型保留多语言 / 方言扩展能力。

## 当前状态

| 阶段 | 状态 |
| --- | --- |
| 需求梳理 / PRD | ✅ v0.2 |
| 本地 Demo | ✅ 8 个页面，30 词，本地存储 |
| 云端 / 登录 | ⬜ 未开始 |
| TTS 发音 | ⬜ 未接入（界面已留位置） |
| 正式内容制作 | 🟡 Demo 词库 30 词，正式词书待制作 |
| 小程序备案 / 类目 | ⬜ 未启动（公开上架前必须） |

- 产品需求文档：[docs/PRD.md](docs/PRD.md)

## 本地 Demo

已跑通的闭环：

- 今日建议：默认 5 个新词，可调 3 / 5 / 10；学 1 个也算
- 看词选义：一屏一题、四选一、即时判定与解析
- 结果页：正确率、星星、新学 / 复习、错题列表
- 错词本：自动收集，连续答对 3 次移出
- 学习统计：近 7 天、累计学习、已掌握、连续天数
- 设置：每日建议量、轻震动、清除数据、关于与隐私

Demo 使用本地存储，不依赖 AppID、云开发或登录；发音按钮暂时只提示「演示版暂未接入发音」。

> Demo 词库是示例内容，正式发布前会由粤语母语者逐条审校释义、粤拼和例句。

### 运行

1. 打开微信开发者工具，选择「导入项目」。
2. 项目目录选择仓库根目录（包含 `project.config.json`）。
3. AppID 已配置为 `touristappid`，可直接本地编译。
4. 编译后进入「今日」页开始练习。

> 如果要用命令行 `cli open`，需要先在开发者工具「设置 → 安全设置」开启服务端口。

类型检查：

```bash
npm install
npm run typecheck
```

### Demo 与正式版的差距

| 维度 | Demo | 正式版 |
| --- | --- | --- |
| 数据 | `miniprogram/data/words.ts` 内置 30 词 | JSON 导入 + 云数据库 |
| 账号 | 无登录，数据只在本机 | 微信登录 + 云开发 |
| 发音 | 未接入 TTS | 服务端预生成音频 |
| 管理 | 无管理界面 | 导入脚本；管理页 P1 |
| 同步 | 换设备不同步 | 云端同步 |

## 规划中的技术栈

- 微信原生小程序 + TypeScript（开发者工具内置 TS 编译，`typecheck` 单独跑）
- Demo：本地存储；正式版：微信云开发（云数据库 / 云函数 / 云存储）
- 内容通过 JSON 批量导入，管理员 openid 白名单
- 第三方 TTS（腾讯云 / Qwen3-TTS 备选）预生成音频，存入云存储

## 目录结构

```
.
├── miniprogram/
│   ├── app.ts / app.json / app.wxss
│   ├── sitemap.json
│   ├── data/words.ts          # Demo 词库（30 个粤语日常词）
│   ├── services/store.ts      # 本地存储、每日建议、复习与统计
│   └── pages/
│       ├── home/              # 今日
│       ├── books/             # 词书
│       ├── book-detail/       # 词书详情
│       ├── practice/          # 看词选义
│       ├── result/            # 练习结果
│       ├── stats/             # 学习统计
│       ├── wrongbook/         # 错词本
│       └── settings/          # 我的 / 设置
├── docs/
│   └── PRD.md
├── project.config.json
├── tsconfig.json
├── package.json
└── README.md
```

## 文档

- [产品需求文档 PRD](docs/PRD.md)
- [开发约定](CLAUDE.md)

## 协作约定

- 文档与提交信息使用中文。
- 提交信息遵循 Conventional Commits（`feat:`、`fix:`、`docs:`、`chore:`）。
- 不提交 `node_modules/`、`project.private.config.json`、密钥与环境变量文件。
- 需求以 PRD 为唯一事实来源，实现与 PRD 不一致时先更新文档。

## 许可证

待定。
