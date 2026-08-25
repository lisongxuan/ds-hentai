# ds-hentai

**ExHentai.org-inspired 深色画廊皮肤** for the DeepSeek Harness Web GUI —— 把界面切换到 ExHentai.org 的深灰"典籍/画廊"风格：深炭底、浅灰文字、灰色实线边框、紧凑表格化排版、红/绿状态色。

![Preview](docs/preview.svg)

## 功能

- **灰阶深色换肤** —— 基于 DeepSeek Harness 主题 token 系统（`--dsw-alias-*` / `--dsw-specific-*`），统一为单调深灰：
  - 深炭底 `#34353b`、面板灰 `#4f535b`、斑马行 `#363940/#3c414b`
  - 控件 2px 实线灰边 `#8d8d8d`、小圆角
  - 状态色：错误 `#ff3333`、正向 `#00e639`、警告 `#fb7878`
  - 基础字族 Arial/Helvetica、紧凑的表格化版面
- **作用域装饰 CSS** —— token 覆盖不到的形状/排版/伪元素（滚动条、语泡、标题栏、tooltip 黄底、列表 hover/选中），全部挂在 `body[data-dsh-exhentai-active="true"]` 下，皮肤停用时整段移除。
- **可逆设置** —— General 设置里加入皮肤行：`启用皮肤 / 系统外观` 二态 + 可选的 `分类彩色标签` 开关；关闭后恢复切换前的内置外观（`light`/`dark`/`system`）。
- **纯浏览器插件** —— 不替换原生控件、不改 DSH 文件、不开调试端口；只持久化 `localStorage` 三个键（`enabled`、`chips`、`previous-theme`）。

## 安装

```sh
# 从 npm（预构建）
npx @deepseek-ai/dsh plugin --profile web add ds-hentai
# 或直接从 GitHub
npx @deepseek-ai/dsh plugin --profile web add github:<owner>/ds-hentai
```

重启 `dsh web` 后刷新页面。纯浏览器端插件（`dsh.client`），改动走 bundle rev 缓存穿透，日常更新只需刷新。

## 开发

```sh
npm install
npm run build      # src/client.js + src/skin.css → lib/client.js
npm run check      # 校验 bundle 信封/占位符/无 ESM import/大小预算
npm test           # build + check
npm pack --dry-run # 发布视图关门
```

## 目录

- `src/client.js` —— 插件主体（`THEME` 定义 + `apply` 状态机 + 设置行）
- `src/skin.css` —— 作用域装饰样式
- `scripts/build-client.mjs` —— 组装 `window.__ModuleLoader__.load(...)` 信封到 `lib/client.js`
- `docs/ARCHITECTURE.md` —— 运行时数据流与边界
- `docs/COMPATIBILITY.md` —— 基线、分层稳定性、恢复方式

## 界面边界

皮肤只装饰既有 DSH 表面；不创建替代的会话、模型、附件、发送、设置、会话、详情控件。状态条不复用于虚构模型/配额/连接/送达/代理状态。

## License

[MIT](LICENSE)
