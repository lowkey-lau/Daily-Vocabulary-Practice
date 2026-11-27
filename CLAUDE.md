# CLAUDE.md

## 项目

产品名：拾乡音。面向碎片时间学习的多语言 / 方言词汇练习微信小程序。当前本地测试词表有 40 个词，按「家人称呼 → 日常场景 → 基础词汇」三阶段组织，验证家庭录音与学习流程；正式首发语言 / 方言待定。

- 需求唯一事实来源：`docs/PRD.md` + `docs/modules/`
- 当前阶段：本地 Demo + 家庭录音本地原型已完成（12 个页面，40 个三阶段测试词）；家庭录音已接入每日练习、学习统计和错词本。云端家庭版待开发；商业化规划已完成，当前不收费。

## 技术栈

- 微信原生小程序 + TypeScript
- TypeScript 由开发者工具内置编译插件处理（只删类型、不做类型检查），提交前跑 `npm run typecheck`
- Demo：本地存储（`wx.getStorageSync` / `wx.setStorageSync`）
- 正式版：微信云开发（云数据库、云函数、云存储）
- 内容以 JSON 批量导入，管理员 openid 白名单
- 本地测试词表管线：三阶段选词 + HSK 1–2 命中参考（MIT）+ pinyin-pro（MIT）+ 原创释义/例句
- 图标：Microsoft Fluent Emoji（MIT），本地 PNG；不引入整套 UI 组件库
- 本地录音原型：`wx.getRecorderManager` + `wx.env.USER_DATA_PATH`；音频文件不进入云端
- 第二阶段：家庭口音词库（长辈录音），需要云端多用户、家庭权限与录音存储
- 商业化：后期规划见 `docs/modules/monetization.md`；当前版本不接广告、不收费

在 PRD 评审通过前，不要擅自引入后端框架、跨端框架或第三方 UI 库；如认为有必要，先说明理由并更新文档。

## 目录约定

```
miniprogram/      小程序客户端
  app.ts/json/wxss
  assets/         Fluent Emoji 图标（PNG）与许可
  data/words.ts   自动生成（40 个三阶段测试词；不要手改）
  services/       本地存储、每日建议、复习算法、家庭录音
  pages/          今日、词书、词书详情、练习、结果、统计、错词本、设置、家庭录音
cloudfunctions/   （规划）云函数
content/          选词、HSK 源快照、来源与许可
scripts/          fetch:hsk / build:words 内容脚本
brand/            小程序头像、注册资料、品牌说明
docs/             PRD、模块文档、决策记录
  PRD.md          总 PRD / 核心学习
  modules/        模块化 PRD
    README.md     模块索引
    family-accent.md
    content-pipeline.md
    brand-release.md
    monetization.md
```

## 开发约定

- 文档、注释、提交信息使用中文。
- 提交信息遵循 Conventional Commits：`feat:`、`fix:`、`docs:`、`chore:`、`refactor:`。
- 不提交 `node_modules/`、`project.private.config.json`、`.env`、密钥与证书。
- 云函数侧校验权限；不要只靠前端隐藏管理入口。
- 用户数据只允许本人读写；内容集合客户端只读。
- 标准词书发音由服务端 TTS 预生成并存入云存储；小程序客户端不持有第三方 API Key。
- 不采集儿童个人身份信息，不申请非必要权限。
- 不接入诱导分享、诱导关注或未经授权的内容。
- 保持「低压力」原则：不做强制任务、不惩罚断签、不用负面文案。
- UI 保持轻量美化：不引入整套组件库；动效用 WXSS `animation` / `transition`。
- 图标使用 Microsoft Fluent Emoji（MIT）；新增图标时在 `miniprogram/assets/README.md` 记录来源并保留许可。
- 若后续要引入 TDesign / Vant，先更新 README / PRD 并说明构建成本与收益。
- 家庭模块默认家庭私有；所有家庭读写经云函数校验成员身份；长辈录音需明确同意，可删除。
- 家庭录入页不展示拼音 / 标准注音；方言读音以长辈实际录音为准，本地说法可选填。
- `miniprogram/data/words.ts` 是自动生成的；改词表请编辑 `content/selected-words.json`，再跑 `npm run build:words`。
- 内容来源、许可和使用范围必须记录在 `content/SOURCES.md`。
- 本地录音只写 `USER_DATA_PATH`；删除录音 / 清空家庭数据时同步删除文件，避免孤儿文件。
- 录音交互与微信语音一致：长按开始、松开结束、上滑取消；录音页必须处理 `scope.record` 权限。
- 模拟器可能不支持录音，以真机预览为准。
- Demo 阶段保持零后端依赖；接云开发时先更新 PRD 和数据模型，再改代码。

## 需求变更

实现与 PRD 不一致时，先更新 `docs/PRD.md` 或对应 `docs/modules/` 文档，并在 PR 描述中说明，再改代码。

## 常用命令

```bash
npm install
npm run typecheck          # TypeScript 类型检查
npm run fetch:hsk          # 拉取 HSK 1–2 源词表（需要网络）
npm run build:words        # 从 content/selected-words.json 生成 data/words.ts

# 微信开发者工具：导入仓库根目录即可（AppID 已配置真实开发 AppID）
# 命令行打开需先在「设置 → 安全设置」开启服务端口：
# /Applications/wechatwebdevtools.app/Contents/MacOS/cli open --project <repo>
```
