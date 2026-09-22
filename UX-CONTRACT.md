# 栖序多站运营台 UX contract

视觉规范见 `DESIGN.md`；本文件定义跨页面行为。

## Canonical UI map

| Capability     | Canonical owner                   | Source of truth               | Allowed variants      | Verification     |
| -------------- | --------------------------------- | ----------------------------- | --------------------- | ---------------- |
| Site scope     | `components/site-context.tsx`     | API `/sites` + active site id | remote, local preview | E2E + API        |
| Select/Listbox | `components/topbar.tsx`           | active site context           | authored              | keyboard + popup |
| Date           | `components/period-control.tsx`   | committed range               | presets, custom       | locale + E2E     |
| Form           | app-owned labeled fields          | API DTO                       | create, edit, secret  | E2E              |
| Scrollbar      | `app/globals.css`                 | owning scroller               | stable gutter         | computed style   |
| Dialog         | app-owned modal surfaces          | owning feature state          | modal, alert          | focus + Escape   |
| CRUD           | feature service + API transaction | MySQL                         | return, stay          | full flow        |

## Site isolation

当前网站由顶栏网站切换器控制。所有商品、集成、OAuth state、同步任务与查询必须同时按 `tenant_id` 和 `site_id` 隔离。新增网站时创建独立的 WooCommerce、GA4 和 Search Console 集成记录。切换网站不复制页面代码，只更换作用域。

## Navigation and state

列表查询、筛选、排序和分页写入 URL。每个数据页支持加载、空状态、未配置、同步中、降级、错误重试和正常状态；不同数据面板独立失败。

## Forms and feedback

表单使用 `noValidate`、持久输入值、内联纠错与首个错误焦点。机密信息默认遮罩。破坏性、权限、隐私、批量或高成本动作使用应用内确认对话框。

## Async and recovery

同步动作创建带 `site_id` 的幂等 MySQL 任务，由 hPanel Cron 分批执行。网络中断不伪造成功；失败保留错误并按策略重试。

## 问问栖序

AI 回答必须区分实际数据、计算指标和 AI 解读，并注明当前网站、数据集与时间范围。

## Accessibility and locale

目标为 WCAG 2.2 AA。主语言为 `zh-CN`，默认时区为 `Asia/Shanghai`。支持键盘、可见焦点、语义标签、实时状态、200% 缩放和减少动态效果。专业产品名保持官方英文。
