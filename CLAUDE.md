# CLAUDE.md

## 项目

面向碎片时间学习的粤语词汇练习微信小程序。第一版聚焦「看词选义」，每天 3–5 分钟，学几个也算；数据模型保留多语言 / 方言扩展能力。

- 需求唯一事实来源：`docs/PRD.md`
- 当前阶段：本地 Demo 已完成（8 个页面，30 词，Fluent Emoji 图标 + 轻动效）；下一步接云端与 TTS。

## 技术栈

- 微信原生小程序 + TypeScript
- TypeScript 由开发者工具内置编译插件处理（只删类型、不做类型检查），提交前跑 `npm run typecheck`
- Demo：本地存储（`wx.getStorageSync` / `wx.setStorageSync`）
- 正式版：微信云开发（云数据库、云函数、云存储）
- 内容以 JSON 批量导入，管理员 openid 白名单
- 图标：Microsoft Fluent Emoji（MIT），本地 PNG；不引入整套 UI 组件库

在 PRD 评审通过前，不要擅自引入后端框架、跨端框架或第三方 UI 库；如认为有必要，先说明理由并更新文档。

## 目录约定

```
miniprogram/      小程序客户端
  app.ts/json/wxss
  assets/         Fluent Emoji 图标（PNG）与许可
  data/words.ts   Demo 词库（正式版迁到 content/ JSON）
  services/       本地存储、每日建议、复习算法
  pages/          今日、词书、词书详情、练习、结果、统计、错词本、设置
cloudfunctions/   （规划）云函数
content/          （规划）词书 JSON、TTS 与导入脚本
docs/             PRD、设计稿、决策记录
```

## 开发约定

- 文档、注释、提交信息使用中文。
- 提交信息遵循 Conventional Commits：`feat:`、`fix:`、`docs:`、`chore:`、`refactor:`。
- 不提交 `node_modules/`、`project.private.config.json`、`.env`、密钥与证书。
- 云函数侧校验权限；不要只靠前端隐藏管理入口。
- 用户数据只允许本人读写；内容集合客户端只读。
- 粤语发音由服务端 TTS 预生成并存入云存储；小程序客户端不持有第三方 API Key。
- 不采集儿童个人身份信息，不申请非必要权限。
- 不接入诱导分享、诱导关注或未经授权的内容。
- 保持「低压力」原则：不做强制任务、不惩罚断签、不用负面文案。
- UI 保持轻量美化：不引入整套组件库；动效用 WXSS `animation` / `transition`。
- 图标使用 Microsoft Fluent Emoji（MIT）；新增图标时在 `miniprogram/assets/README.md` 记录来源并保留许可。
- 若后续要引入 TDesign / Vant，先更新 README / PRD 并说明构建成本与收益。
- Demo 阶段保持零后端依赖；接云开发时先更新 PRD 和数据模型，再改代码。

## 需求变更

实现与 PRD 不一致时，先更新 `docs/PRD.md` 并在 PR 描述中说明，再改代码。

## 常用命令

```bash
npm install
npm run typecheck          # TypeScript 类型检查

# 微信开发者工具：导入仓库根目录即可（AppID 已配置真实开发 AppID）
# 命令行打开需先在「设置 → 安全设置」开启服务端口：
# /Applications/wechatwebdevtools.app/Contents/MacOS/cli open --project <repo>
```
