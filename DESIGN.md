---
version: alpha
colors:
  canvas: "#FFFFFF"
  surface: "#F6F8F7"
  surfaceMuted: "#EEF3F0"
  primary: "#0D7056"
  primaryHover: "#095B46"
  rail: "#123B35"
  analytical: "#2F7FD3"
  signal: "#D5A72B"
  text: "#102A27"
  textMuted: "#63726D"
  border: "#D8E2DD"
  success: "#0D805E"
  warning: "#A66F08"
  danger: "#C6453A"
typography:
  display:
    fontFamily: "Microsoft YaHei, PingFang SC, Noto Sans SC, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.875rem"
    lineHeight: "1.2"
  body:
    fontFamily: "Microsoft YaHei, PingFang SC, Noto Sans SC, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    lineHeight: "1.55"
  data:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: "0.875rem"
    lineHeight: "1.4"
rounded:
  sm: "0.375rem"
  md: "0.5625rem"
  lg: "0.75rem"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
components:
  button:
    radius: "0.5625rem"
  panel:
    radius: "0.5625rem"
  input:
    radius: "0.5625rem"
---

# 栖序多站运营台设计系统

## Overview

栖序是面向中文电商团队的多站运营控制台。界面参考“清晰的运营台账”，以真白画布、松墨绿导航、玉绿色动作和细分隔线建立秩序。记忆点是从网站切换器延伸出的“站点脊线”，表达多个网站汇入同一运营视图。

系统不能看起来像通用 AI 卡片墙、宠物娱乐应用或玻璃拟态后台。专业词如 WooCommerce、GA4、Search Console、SEO / GEO、AI、SKU、API、OAuth 保留官方写法，其余用户界面使用简体中文。

Runtime ownership is Model B: `apps/web/app/globals.css` owns executable tokens; this file mirrors their normative values. Shared primitives translate tokens into states.

## Colors

画布使用真白。深松墨绿只用于主导航，玉绿用于主动作与站点主线，蓝色用于数据分析，琥珀色用于提醒。状态不能只依赖颜色表达。

## Typography

中文标题、正文与控件使用系统中文无衬线字体栈，避免网络字体造成闪烁。数字、SKU、时间和公式使用等宽或等宽数字。

## Layout

桌面端为 224px 导航栏、68px 顶栏和开放式 12 栏内容区。网站切换器是顶栏首要控件；每个页面默认作用于当前网站。窄屏将导航变为抽屉，指标与右侧洞察按单列排列。

## Elevation & Depth

静态表面保持近乎扁平，以 1px 边线和留白分层。阴影只用于菜单、对话框等浮层。

## Shapes

控件使用 6–9px 圆角；只有状态标签可以是胶囊形。禁止嵌套大圆角容器。

## Components

站点切换器是共享 authored listbox；新增网站使用应用内对话框。表格保持语义化 `<table>`。全局滚动条、焦点环、减少动态效果和响应式规则由 `globals.css` 统一实现。

## Do's and Don'ts

- 显示当前网站、数据来源、同步时间和演示状态。
- 每个网站独立保存商品、集成、OAuth 与同步任务。
- 使用开放式台账、表格、图表和右侧运营栏变化节奏。
- 不使用渐变光效、玻璃拟态、宠物插画或无意义卡片填充。
- 不用虚构数据冒充已连接来源。
