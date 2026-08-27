# ds-hentai

**ExHentai.org-inspired 深色画廊皮肤** for the DeepSeek Harness Web GUI —— 不只换配色：按参考页把壳层重建成深炭底、浅灰文字、灰色实线边框、紧凑表格化索引，以及搜索式发送。

![Preview](docs/preview.svg)

皮肤不改 DSH 源文件、不开调试端口、不另建会话数据面。原生会话、工具卡片、Markdown 与宿主设置仍由 DSH 渲染；overlay 只点击/填入既有控件。关闭皮肤后 overlay 与作用域样式一并卸下。

## 功能

- **画廊壳层** —— 顶部导航（Front Page / New Session / Popular / Workspaces / Favorites / Settings）、居中 `ido` 内容盒、会话表或缩略图、底栏。
- **替代控件** —— 会话表、模型 / Access / Agent / Effort / Commands / Files 的 `[...]` 面板、附件 File Search、Search/Clear 发送；均驱动原生 DSH 会话与发送。
- **会话操作** —— Compact / Extended 模式下 Action 列：Rename / Fork / Archive，走原生 `session.rename` / `sessions.fork` / `workspaces.archiveSession`。
- **灰阶 token** —— `--dsw-alias-*` / `--dsw-specific-*` 统一为深炭 `#34353b`、面板 `#4f535b`、2px 灰边 `#8d8d8d`、红/绿状态色。
- **可逆设置** —— 两处入口（宿主 General 与画廊 Settings），选项见下。
- **纯浏览器插件** —— 持久化仅 `localStorage`（开关、chip、模式、收藏、类别过滤、侧边栏、输入框、previous-theme）。

## 设置

插件提供 **两处设置入口**，皮肤相关开关在两边同步；会话级选项（模型、权限、Agent 预设）只出现在画廊 Settings / 发送坞，并写回 DSH，不另存一份。

| 入口 | 怎么打开 | 覆盖范围 |
| ---- | -------- | -------- |
| **宿主 General** | DSH **Settings → General**，或画廊 Settings 里的 **Open Host Settings** | 皮肤开关、彩色标签、原生侧边栏、输入框、Front Page 显示模式 |
| **画廊 Settings** | 顶部导航 **Settings** | 上述皮肤选项 + Appearance / Language / Agent Preset / Permission / Models |

插件、插件市场、供应商 API Key 仍在宿主设置里；画廊 Settings 只提供跳转按钮。

### 皮肤与布局（两边都有）

这些选项存在宿主 General 和画廊 Settings，改一处两边都会更新。首次安装默认 **启用皮肤**。

| 选项 | 可选值 | 默认 | 作用 |
| ---- | ------ | ---- | ---- |
| **ExHentai 深色画廊皮肤** / Gallery Skin | 启用皮肤 / 系统外观 | 启用皮肤 | 启用：注册 `dsh-exhentai` 主题并挂 overlay。关闭：卸下 overlay 与作用域 CSS，恢复切换前的 DSH 外观（Light / Dark / System）。 |
| **分类彩色标签** | 开启 / 关闭 | 开启 | 会话类别 chip 用红/橙/金/绿/蓝/紫；关闭后统一中性灰。 |
| **原生侧边栏** | 显示 / 隐藏 | 隐藏 | 会话页是否显示 DSH 左侧会话栏。隐藏后用 Front Page 表切换会话。原生节点仍留在 DOM 里，供点击适配；宿主对话框弹出时会临时露出侧栏。 |
| **对话输入框** | 皮肤输入框 / 原生输入框 | 皮肤输入框 | **二选一**。皮肤：会话页用搜索坞（Search / Clear + `[Model]` `[Access]` `[Agent]` `[Effort]` `[Commands]` `[Files]`），并 CSS 隐藏原生输入卡。原生：只用 DSH 输入卡，不画皮肤坞。 |
| **Front Page 显示模式** | Minimal / Minimal+ / Compact / Extended / Thumbnail | Compact | 索引页会话列表的排版，见下一节。Front Page 底栏下拉与设置页单选共用同一值。 |

关闭皮肤后，侧边栏 / 输入框 / overlay 全部卸下，界面回到 DSH 内建主题；再次启用皮肤会读回上次保存的侧边栏、输入框和显示模式。

恢复内建外观：任意一处把皮肤切到 **系统外观**。若设置页打不开：

```sh
dsh plugin --profile web remove ds-hentai
dsh web
```

### Front Page 显示模式

作用于 Front Page / Popular / Favorites 的会话列表（每页 25 条）。Front Page 底栏也可直接改，不必进 Settings。

| 模式 | 布局 | 标题下 tags | Action（Rename / Fork / Archive） |
| ---- | ---- | ----------- | -------------------------------- |
| **Minimal** | 表格 | 隐藏 | 无 |
| **Minimal+** | 表格 | 显示 | 无 |
| **Compact** | 表格 | 显示 | 有（默认） |
| **Extended** | 表格 | 显示 | 有 |
| **Thumbnail** | 卡片网格 | 仅类别色条 | 无 |

窄屏（约 800px 及以下）会隐藏 Action 列。行首类别色条、Published 时间和收藏心形在表格模式下始终显示。

### 画廊 Settings 里的其它组

这些组只在顶部导航 **Settings** 里出现。

**Appearance** — Light / Dark / System。这是 DSH 内建外观，**仅在皮肤关闭时生效**。启用皮肤时实际主题仍是 `dsh-exhentai`；关闭皮肤会切回这里记下的偏好。

**Language** — 界面语言。仅当宿主提供 locale 列表时显示，调用原生 `setLocale`。

**Agent Preset** — 当前会话的 Agent 预设（宿主列出的项；回退为 Standard / PTC / Minimal / Creator）。正在跑的任务会沿用开始时的预设；电台点不动时，到宿主设置里改默认。

**Permission** — 当前会话的权限预设（`/permission`）。需先打开一个会话。选 **Full access** 会弹出浏览器确认。

**Models** — 当前会话的模型。列表来自宿主 `sessions.models`；供应商 API Key 仍在宿主设置。需先打开一个会话。

会话页搜索坞的 `[Model]` `[Access]` `[Agent]` `[Effort]` `[Commands]` `[Files]` 与上述会话级选项是同一套原生接口，不是第二份配置。

### 只在 Front Page 上的过滤（不是 Settings 页）

| 控件 | 作用 | 是否持久化 |
| ---- | ---- | ---------- |
| 类别色条表 | 按会话 tag / workspace / model / 计算类别过滤列表 | `ds-hentai:cats` |
| Search Keywords | 按标题、副标题、tags 过滤 | 否（刷新即清空） |
| `[Model]` `[Access]` `[Files]` | 当前会话的模型、权限、附件 | 走 DSH，不经本插件存储 |
| ♡ / ♥ | 本地收藏，导航 Favorites 只显示已收藏 | `ds-hentai:favs` |
| Popular | 按消息数、再按时间排序的同一张表 | 否 |

### 持久化

仅浏览器 `localStorage`，不含 prompt、回复、凭据或用量：

| Key | 值 |
| --- | -- |
| `ds-hentai:enabled` | `on` / `off` |
| `ds-hentai:chips` | `on` / `off` |
| `ds-hentai:previous-theme` | `light` / `dark` / `system` |
| `ds-hentai:mode` | `minimal` / `minimalplus` / `compact` / `extended` / `thumbnail` |
| `ds-hentai:native-sidebar` | `on` / `off` |
| `ds-hentai:composer` | `skin` / `native` |
| `ds-hentai:favs` | 会话 id 数组 |
| `ds-hentai:cats` | Front Page 类别过滤 |
| `ds-hentai:model` / `ds-hentai:region` | 遗留 chrome 键；区域电台已不再暴露在 UI 上 |

## 安装

```sh
# 从 npm（预构建）
npx @deepseek-ai/dsh plugin --profile web add ds-hentai
# 或直接从 GitHub
npx @deepseek-ai/dsh plugin --profile web add github:<owner>/ds-hentai
```

重启 `dsh web` 后刷新页面。纯浏览器端插件（`dsh.client`），改动走 bundle rev 缓存穿透，日常更新只需刷新。需要 `shell.overlay`（ui-layout）才能画出廊壳；没有该槽位时会退化为 token + 作用域 CSS + General 设置行。基线见 [docs/COMPATIBILITY.md](docs/COMPATIBILITY.md)。

## 开发

```sh
npm install
npm run build      # src/client.js + src/skin.css → lib/client.js
npm run check      # 校验 bundle 信封/占位符/无 ESM import/大小预算
npm test           # build + check
npm pack --dry-run # 发布视图关门
```

## 目录

- `src/client.js` —— 插件主体（`THEME`、`apply` 状态机、设置行、`shell.overlay` 画廊壳）
- `src/skin.css` —— 作用域装饰 + 布局重建
- `scripts/build-client.mjs` —— 组装 `window.__ModuleLoader__.load(...)` 信封到 `lib/client.js`
- `docs/ARCHITECTURE.md` —— 运行时数据流与边界
- `docs/COMPATIBILITY.md` —— 基线、分层稳定性、恢复方式

## License

[MIT](LICENSE)
