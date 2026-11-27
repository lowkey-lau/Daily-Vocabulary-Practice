# CLAUDE.md

## 项目

面向碎片时间学习的粤语词汇练习微信小程序。第一版聚焦「看词选义」，每天 3–5 分钟，学几个也算；数据模型保留多语言 / 方言扩展能力。

- 需求唯一事实来源：`docs/PRD.md`
- 当前阶段：需求与 PRD（v0.2，首发粤语），代码脚手架尚未开始。

## 技术栈（已定方向）

- 微信原生小程序 + TypeScript
- 微信云开发：云数据库、云函数、云存储
- 内容以 JSON 批量导入，管理员 openid 白名单

在 PRD 评审通过前，不要擅自引入后端框架、跨端框架或第三方 UI 库；如认为有必要，先说明理由并更新文档。

## 目录约定（规划）

```
miniprogram/      小程序客户端（pages / components / services / utils）
cloudfunctions/   云函数（login、getDailyPlan、submitAttempt、adminImport 等）
content/          词书 JSON、导入与校验脚本
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

## 需求变更

实现与 PRD 不一致时，先更新 `docs/PRD.md` 并在 PR 描述中说明，再改代码。

## 常用命令

脚手架完成后补充（开发、类型检查、内容导入、部署云函数）。
