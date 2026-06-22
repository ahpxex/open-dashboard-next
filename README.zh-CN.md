# Open Dashboard

[English](./README.md) · **简体中文**

> 一个收录了 **36 个抄即用后台 UI 形状**的目录 —— CRUD 表格、详情页与主从页、看板、日历、表单向导、图表、计费、RBAC、i18n 等等 —— 让 AI agent **装上即可组合**出一个真实可用的后台(中台)。

Open Dashboard 是一个 **skill 目录**,而不是一个让你 clone 下来再开膛破肚的样板。这些 skill 放在 `.claude/skills/`;agent(Claude Code、Cursor、Codex……)把它们装上,就能从这些形状里**组装**出你需要的 dashboard —— 而不必去逆向一整套代码库。每个形状都是经过测试的真实组件,并由仓库里的 live demo 作证。

![电商总览 —— KPI、营收趋势和图表,由目录中的形状组合而成,以平台的图表系统渲染。](docs/dashboard.png)

## 安装 skill

### Claude Code

```
/plugin marketplace add ahpxex/open-dashboard
/plugin install open-dashboard@open-dashboard
```

skill 会被命名空间化到插件下(例如 `open-dashboard:add-component`),因此不会和其他 skill 包冲突。

### 其他任意 agent(Cursor、Codex、Windsurf、Aider……)

这些 skill 是标准的、与 agent 无关的 `SKILL.md` 文件:

```bash
npx openskills install ahpxex/open-dashboard   # 读取 SKILL.md / AGENTS.md
npx skills add ahpxex/open-dashboard            # Vercel skills.sh
```

> 这些形状假设你已经有 **`scaffold-dashboard`** 这个底座(它们 import 的平台层)。先跑那个 —— 或者直接 fork 本仓库 —— 再在其上组合形状。单独把一个形状拷进一个无关项目里,它会带上说明,外加一个**离开底座无法编译**的模板;这是预期行为。

## 你会得到什么

- **`add-component`** —— 一个覆盖 **36 个 UI 形状**的目录 + 检索器,分组为:*表单 · 列表与表格 · 富视图 · 详情与页面 · 展示与反馈 · 平台层*(RBAC / 社交登录 / ⌘K 搜索 / i18n / 计费 / 实时)。每个形状都是一个抄即用的模板,外加一份 reference 文档,内含精确的 `cp` + 改线步骤、它所依赖的底座,以及它的不变量。
- **操作类 skill** —— `scaffold-dashboard`(立起底座)、`add-backend`(数据层 + 六套可运行的后端预设)、`rebrand`(名字 / logo / 导航 / 主题)。

## 搭一个 dashboard

每一步都是一个 skill —— 你是按需*添加*,而不是从一个庞然大物里裁剪:

1. **`scaffold-dashboard`** —— 在新项目里立起干净、零配置的底座。
2. **`rebrand`** —— 名字、logo、导航、主题(`src/config/app.ts`)。
3. **`add-backend`** —— 保持零配置(内存),或设置 `DATABASE_URL` 走 Postgres,或挑一套预设(Hono / FastAPI / Supabase,搭配 Drizzle / Prisma,better-auth / Auth.js / JWT)。数据与 auth 在两个 seam 后面可换。
4. **`add-backend`** —— `create-resource <name>` 脚手架出一整条 CRUD 纵切(表 + server fn + query hook + `DataTable` 页面 + 创建/编辑弹窗 + 导航)。
5. **`add-component`** —— 从目录里组合出详情页、主从页、看板、图表、向导、计费等等。

走查:[`PORTING.md`](./PORTING.md) · 形状目录:[`PATTERNS.md`](./PATTERNS.md) · 约定:[`CLAUDE.md`](./CLAUDE.md) · 后端:[`docs/backends.md`](./docs/backends.md)。

## 在本地探索仓库(可选)

仓库本身就是一个可运行的 app:每个形状都在 **Skills Gallery** 里有 live demo,所以你可以在组合之前先点着目录逛一圈。两个示例后台 —— **电商** 和 **销售(CRM)** —— 展示了这些形状如何组合成真实业务。

```bash
bun install
bun run dev   # 零配置:内存数据 + 内存 auth,不用 Docker、不用 Postgres
```

打开 [http://localhost:3000](http://localhost:3000) → **Dev quick login**。

## 它如何保持诚实

随包分发的 skill 模板是**从仓库自己的工作源码生成**的,并保持字节级同步(`bun run sync-skills --check`,在 CI 里强制)。一个形状绝不会分发仓库没有 typecheck、build、test 过的代码 —— gallery 的 demo *就是*测试。

基于 TanStack Start(React 19 + Vite + Nitro)、Drizzle + better-auth、shadcn-on-[`@base-ui/react`](https://base-ui.com/) + Tailwind v4,使用 Bun、Biome 和 Vitest 构建。

## 社区

在开放环境中构建,并分享给 [linux.do](https://linux.do/) 社区 —— 欢迎在那里提问、反馈、晒成果。

## 许可

MIT
