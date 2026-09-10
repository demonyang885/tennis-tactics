# 青少年网球战术

一个帮助青少年看懂单打球路和临场选择的交互原型。

下一版的产品判断、范围与验收标准见 [`PRODUCT_VNEXT.md`](./PRODUCT_VNEXT.md)。

- 22 个单项战术：发球、接发、相持、防守、变节奏、网前和关键分。
- 8 组互动组合：首段自动播放，之后选择下一招并持续对打。
- “发球后抢先手”已进入 0.3 决策演练：同一场上情境下先看来球、自己和对手，再比较 2–3 种战术的收益与风险。
- 19 个可循环战术节点：每段提供 2–3 个“来球信号＋行动”选择，并保留本回合路径。
- 16 种衍生选择：对手站位、回球深浅或自身平衡改变时，及时换一招。
- 每个战术包含球路动画、逐步播放、当前判断、适用信号、三个临场选择、调整条件和同伴练习。

公开测试地址：[https://demonyang885.github.io/tennis-tactics/](https://demonyang885.github.io/tennis-tactics/)

推送到 `main` 后，GitHub Actions 会重新构建并部署最新版本。`version.json` 可用于核对线上版本对应的提交。

本机预览：运行 `npm ci`，然后运行 `npm run dev -- --host 127.0.0.1 --port 5173`。

新增内容请从 `src/content/next.ts` 开始，并按 `src/content/TACTIC_AUTHORING.md` 的内容标准填写。构建时会自动检查战术、讲解、动画与组合引用是否完整。

验证：`npm run check:content`、`npm run build`、`npm run prepare:pages`、`npm run test:pages`。GitHub Pages 成品位于 `dist/github-pages/`。

战术内容用于帮助判断，不保证得分，也不能替代教练的现场指导。教学原则参考 ITF、LTA 和 USTA 的公开资料；具体组合与练习为本原型的教学化编排。
