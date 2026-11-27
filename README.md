# 拾乡音

面向碎片时间学习的多语言 / 方言词汇练习微信小程序。当前本地测试词表有 40 个词，按「家人称呼 → 日常场景 → 基础词汇」三阶段组织，先验证家庭录音与学习流程；正式首发语言 / 方言待定。每天 3–5 分钟，学几个词也算数。

## 当前状态

| 阶段 | 状态 |
| --- | --- |
| 需求梳理 / PRD | ✅ v0.7 |
| 本地 Demo | ✅ 12 个页面，40 个三阶段测试词，本地存储 |
| 视觉 / 图标 | ✅ Fluent Emoji 卡通图标 + 轻动效 |
| 家庭口音词库 | 🟡 本地录音原型已实现，并接入每日练习与统计；云端家庭版待开发 |
| 云端 / 登录 | ⬜ 未开始 |
| TTS 发音 | ⬜ 未接入（界面已留位置） |
| 正式内容制作 | 🟡 Demo 词库 40 词（家人 / 日常 / 基础三阶段），正式词书待制作 |
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

Demo 使用本地存储，不依赖云开发或登录；发音按钮暂时只提示「演示版暂未接入发音」。

> 当前测试词表为普通话；正式方言词书待定，发布前会由对应语言的母语者逐条审校释义、注音和例句。

### 运行

1. 打开微信开发者工具，选择「导入项目」。
2. 项目目录选择仓库根目录（包含 `project.config.json`）。
3. AppID 已配置为 `wx2aecf3ad971f1e01`，可直接本地编译；如果提示 AppID 被占用，先在开发者工具里关闭误建的 `project` 项目。
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
| 数据 | `miniprogram/data/words.ts` 内置 40 个三阶段测试词（自动生成） | JSON 导入 + 云数据库 |
| 账号 | 无登录，数据只在本机 | 微信登录 + 云开发 |
| 发音 | 未接入 TTS | 服务端预生成音频 |
| 家庭录音 | 本地文件，仅当前设备 | 云存储 + 家庭同步 |
| 管理 | 无管理界面 | 导入脚本；管理页 P1 |
| 同步 | 换设备不同步 | 云端同步 |

## 视觉与图标

- 视觉方向：保留米色 + 墨绿 + 珊瑚的温暖手绘感，不引入整套 UI 组件库。
- 交互：页面进入、选项判定、反馈弹层、星星逐个弹出等轻量动效，基于 WXSS `animation` / `transition`。
- 图标：Microsoft Fluent Emoji（Flat 风格，MIT License），已转为 PNG；tabBar 81px、页面图标 128px，全部本地加载。
- 图标来源与许可见 `miniprogram/assets/README.md` 和 `miniprogram/assets/LICENSE-FluentEmoji.txt`。
- 现在不引入 TDesign / Vant：Demo 页面少、视觉自定义程度高，组件库需要 npm 构建且会拉向通用企业风；等定位稳定、复用变多再评估。

## 第二阶段：家庭口音词库（长辈教学）

**一句话**：让每个家庭用自己的口音，建一座只属于家人的方言词库——长辈录，子孙学。

- 家庭私有空间 + 邀请 + 角色（管理员 / 长辈 / 学习者）
- 长辈录音模式：一屏一词、录音 / 试听 / 重录 / 保存，可选本地说法
- 子孙用长辈录音做每日练习、跟读、家庭对话卡
- 默认家庭私有，不做公开 UGC、自由聊天、AI 方言对话
- 完整设计：[docs/FAMILY-MODULE.md](docs/FAMILY-MODULE.md)

### 家庭录音原型（本地）

入口：今日 → 家庭口音词库；或 我的 → 家庭口音词库。

1. **长辈录音**：一屏一词，长按麦克风说话、松开结束、上滑取消（和微信语音一致）；可试听 / 重录 / 保存，可填「我们这里叫」。
2. **家庭词库**：听长辈录音、重录、删除。
3. **听音选义**：用长辈录音做 5 道听音选择题，结果计入学习统计、连续天数和错词本。
4. **每日练习**：主词书里如果有长辈录音，练习页会显示喇叭，优先播放长辈发音。
5. **阶段进度**：家庭主页显示家人称呼 / 日常场景 / 基础词汇三阶段录音进度。

限制与测试：

- 录音只保存在当前设备的 `USER_DATA_PATH`，不上传云端。
- 开发者工具模拟器可能不支持麦克风录音，建议用「预览」在真机测试。
- 40 个 Demo 词（家人称呼 / 日常场景 / 基础词汇）；正式版 100–200 词 + 云端家庭同步。
- 家庭录入页不显示拼音 / 标准读音，长辈按自家口音录；本地说法可选填。
- 需要麦克风权限；拒绝后可在设置里开启。
- 清空入口：家庭主页底部「清空本地家庭数据」。

## 内容管线

当前 40 个测试词按三阶段组织：

- 第一阶段：家人称呼 13 词
- 第二阶段：日常场景 15 词
- 第三阶段：基础词汇 12 词

词目命中 HSK 1–2 时记录等级 / 词频；家人称呼和场景短语（如吃饭、喝水、买菜）不在 HSK 1–2 的，标记为补充词。释义和例句由本项目原创：

- **词目 / 等级 / 词频**：Complete HSK Vocabulary（MIT，命中部分）
- **拼音**：pinyin-pro（MIT），轻声人工覆盖
- **释义 / 例句 / 标签**：本项目原创

```bash
npm run fetch:hsk     # 拉取 HSK 2.0 Level 1–2 源词表
npm run build:words   # 生成 miniprogram/data/words.ts
```

- 编辑 `content/selected-words.json`，不要直接改 `miniprogram/data/words.ts`
- 来源与许可：[content/SOURCES.md](content/SOURCES.md)
- 管线说明：[content/README.md](content/README.md)

## 规划中的技术栈

- 微信原生小程序 + TypeScript（开发者工具内置 TS 编译，`typecheck` 单独跑）
- Demo：本地存储；正式版：微信云开发（云数据库 / 云函数 / 云存储）
- 内容通过 JSON 批量导入，管理员 openid 白名单
- 第三方 TTS（腾讯云 / Qwen3-TTS 备选）预生成音频，存入云存储
- 图标：Fluent Emoji（MIT），本地 PNG，无网络依赖
- 本地录音原型：`wx.getRecorderManager` + `USER_DATA_PATH`；正式版走云存储
- 家庭模块（第二阶段）：云端多用户 + 家庭权限 + 长辈录音存储

## 目录结构

```
.
├── miniprogram/
│   ├── app.ts / app.json / app.wxss
│   ├── sitemap.json
│   ├── assets/                # Fluent Emoji 图标（PNG）
│   ├── data/words.ts          # 自动生成（40 个三阶段测试词）
│   ├── services/
│   │   ├── store.ts           # 本地存储、每日建议、复习与统计
│   │   └── family-store.ts    # 家庭录音、本地家庭词库、听音题
│   └── pages/
│       ├── home/              # 今日
│       ├── books/             # 词书
│       ├── book-detail/       # 词书详情
│       ├── practice/          # 看词选义
│       ├── result/            # 练习结果
│       ├── stats/             # 学习统计
│       ├── wrongbook/         # 错词本
│       ├── settings/          # 我的 / 设置
│       ├── family/            # 家庭口音词库主页
│       ├── family-record/     # 长辈录音
│       ├── family-words/      # 家庭词库
│       └── family-practice/   # 听音选义
├── brand/                     # 小程序头像、注册资料、品牌说明
├── content/                   # 选词、HSK 源快照、来源与许可
│   ├── selected-words.json    # 人工维护的选词 + 原创释义/例句
│   ├── core.json              # 构建产物（审阅用）
│   └── source/                # HSK 1–2 源词表快照
├── scripts/                   # fetch:hsk / build:words
├── docs/
│   ├── PRD.md
│   └── FAMILY-MODULE.md       # 家庭口音词库（长辈教学）设计
├── project.config.json
├── tsconfig.json
├── package.json
└── README.md
```

## 文档

- [产品需求文档 PRD](docs/PRD.md)
- [家庭口音词库模块设计](docs/FAMILY-MODULE.md)
- [小程序注册资料](brand/INTRO.md)
- [品牌头像与说明](brand/README.md)
- [内容管线](content/README.md)
- [来源与许可](content/SOURCES.md)
- [开发约定](CLAUDE.md)

## 协作约定

- 文档与提交信息使用中文。
- 提交信息遵循 Conventional Commits（`feat:`、`fix:`、`docs:`、`chore:`）。
- 不提交 `node_modules/`、`project.private.config.json`、密钥与环境变量文件。
- 需求以 PRD 为唯一事实来源，实现与 PRD 不一致时先更新文档。

## 许可证

待定。
