> **歷史倉庫 — RallyPath 開發入口已統一（2026-09-19）**
>
> 唯一開發與發布來源：[demonyang885/tennis-tactics-interactive-preview / main](https://github.com/demonyang885/tennis-tactics-interactive-preview/tree/main)。名稱中的 preview 是歷史命名。
> 新功能請從該倉庫最新 main 建立分支；本倉庫的 main／feature 分支和下方舊網址僅供歷史參考，不是最新版本。
> 開工前讀 [SOURCE_OF_TRUTH.md](https://github.com/demonyang885/tennis-tactics-interactive-preview/blob/docs/rallypath-source-of-truth/SOURCE_OF_TRUTH.md)（配套收口 PR 分支；合併後以 main 同檔為準）。
> 保留本機未提交工作；不要因本文件而 reset、清理或搬移舊 checkout。此提示不等於 GitHub 已技術性封鎖舊庫寫入或部署。

# 青少年网球战术

一个帮助青少年看懂单打球路和临场选择的交互原型。

- 21 个单项战术：发球、接发、相持、防守、变节奏、网前和关键分。
- 8 组组合打法：把 2–3 个单项按真实比赛信号衔接起来。
- 16 种衍生选择：对手站位、回球深浅或自身平衡改变时，及时换一招。
- 每个战术包含球路动画、逐步播放、当前判断、适用信号、三个临场选择、调整条件和同伴练习。

公开测试地址：[https://demonyang885.github.io/tennis-tactics/](https://demonyang885.github.io/tennis-tactics/)

推送到 `main` 后，GitHub Actions 会重新构建并部署最新版本。`version.json` 可用于核对线上版本对应的提交。

本机预览：运行 `npm ci`，然后运行 `npm run dev -- --host 127.0.0.1 --port 5173`。

新增内容请从 `src/content/next.ts` 开始，并按 `src/content/TACTIC_AUTHORING.md` 的内容标准填写。构建时会自动检查战术、讲解、动画与组合引用是否完整。

验证：`npm run check:content`、`npm run build`、`npm run prepare:pages`、`npm run test:pages`。GitHub Pages 成品位于 `dist/github-pages/`。

战术内容用于帮助判断，不保证得分，也不能替代教练的现场指导。教学原则参考 ITF、LTA 和 USTA 的公开资料；具体组合与练习为本原型的教学化编排。
