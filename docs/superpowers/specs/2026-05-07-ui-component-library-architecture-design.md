# 企业级可扩展 UI 组件库整体架构设计

## 1. 架构定位

本组件库采用 **Framework-agnostic Core + Vue 3 Adapter + 可扩展生态层** 的架构路线。

第一阶段目标是交付一套完整的 **Vue 3 + TypeScript 企业级组件库**；同时将主题、Token、工具、图标、国际化协议、通用类型等底层能力沉淀到框架无关的 Core 层，为未来 React、Web Components 或其他框架适配预留空间。

核心定位：

> 不是写一组 Vue 组件，而是建设一套可长期演进的 UI 基础设施平台。

推荐路线对比：

| 方案 | 描述 | 优点 | 风险 |
|---|---|---|---|
| Vue 单框架组件库 | 类似 Element Plus，只围绕 Vue 3 构建 | 落地快、学习成本低、实现清晰 | 架构能力展示有限，未来扩展 React / Web Components 成本高 |
| Core + Vue Adapter | Core 层沉淀主题、类型、工具、图标、国际化协议；Vue 层负责渲染适配 | 最适合展示架构能力，兼顾落地与扩展 | 分层边界需要清晰治理 |
| 多框架同步实现 | 一开始同时输出 Vue / React / Web Components | 平台化能力最强 | 工程复杂度过高，容易变成空架构或重复实现 |

最终选择：**Core + Vue Adapter**。

设计动机：

- 用 Vue 3 保证第一阶段可落地；
- 用 Core 抽象保证长期可扩展；
- 用 Adapter 隔离框架差异；
- 用 Monorepo 保证工程规模化治理；
- 用 Token + CSS Variable 保证主题能力；
- 用独立入口和 resolver 保证按需引入与 Tree-shaking。

---

## 2. Monorepo 整体目录结构设计

建议技术栈：

- **pnpm workspace**：包管理与 workspace linking；
- **Turborepo / Nx**：任务编排、构建缓存、依赖图分析；
- **Vite / tsup / Rollup**：组件构建；
- **Changesets**：版本管理、changelog 与发包；
- **Vitest + Playwright**：单元测试、交互测试与 E2E 测试；
- **Storybook / VitePress**：组件文档、示例和演示。

推荐目录：

```txt
ui-library/
├─ packages/
│  ├─ core/
│  │  ├─ src/
│  │  │  ├─ tokens/
│  │  │  ├─ theme/
│  │  │  ├─ icon/
│  │  │  ├─ i18n/
│  │  │  ├─ shared/
│  │  │  ├─ types/
│  │  │  └─ index.ts
│  │  └─ package.json
│  │
│  ├─ theme/
│  │  ├─ src/
│  │  │  ├─ tokens/
│  │  │  ├─ css-vars/
│  │  │  ├─ scss/
│  │  │  ├─ dark/
│  │  │  └─ index.ts
│  │  └─ package.json
│  │
│  ├─ hooks/
│  │  ├─ src/
│  │  │  ├─ use-namespace/
│  │  │  ├─ use-z-index/
│  │  │  ├─ use-locale/
│  │  │  ├─ use-form/
│  │  │  └─ index.ts
│  │  └─ package.json
│  │
│  ├─ directives/
│  │  ├─ src/
│  │  │  ├─ loading/
│  │  │  ├─ click-outside/
│  │  │  ├─ permission/
│  │  │  └─ index.ts
│  │  └─ package.json
│  │
│  ├─ icons/
│  │  ├─ src/
│  │  │  ├─ svg/
│  │  │  ├─ components/
│  │  │  ├─ resolver.ts
│  │  │  └─ index.ts
│  │  └─ package.json
│  │
│  ├─ components/
│  │  ├─ button/
│  │  │  ├─ src/
│  │  │  │  ├─ button.vue
│  │  │  │  ├─ button.ts
│  │  │  │  └─ types.ts
│  │  │  ├─ style/
│  │  │  │  ├─ index.ts
│  │  │  │  └─ css.ts
│  │  │  ├─ __tests__/
│  │  │  └─ index.ts
│  │  ├─ input/
│  │  ├─ select/
│  │  ├─ form/
│  │  ├─ table/
│  │  └─ index.ts
│  │
│  ├─ vue/
│  │  ├─ src/
│  │  │  ├─ install.ts
│  │  │  ├─ resolver.ts
│  │  │  ├─ config-provider/
│  │  │  ├─ plugin/
│  │  │  └─ index.ts
│  │  └─ package.json
│  │
│  ├─ pro-components/
│  │  ├─ pro-form/
│  │  ├─ pro-table/
│  │  ├─ query-filter/
│  │  ├─ page-container/
│  │  └─ index.ts
│  │
│  ├─ utils/
│  │  ├─ src/
│  │  │  ├─ dom/
│  │  │  ├─ event/
│  │  │  ├─ object/
│  │  │  ├─ warning/
│  │  │  └─ index.ts
│  │  └─ package.json
│  │
│  ├─ build/
│  │  ├─ src/
│  │  │  ├─ build-components.ts
│  │  │  ├─ build-theme.ts
│  │  │  ├─ generate-entry.ts
│  │  │  ├─ generate-types.ts
│  │  │  └─ generate-resolver.ts
│  │  └─ package.json
│  │
│  └─ eslint-config/
│
├─ apps/
│  ├─ docs/
│  ├─ playground/
│  └─ visual-regression/
│
├─ internal/
│  ├─ scripts/
│  ├─ generators/
│  ├─ codemods/
│  └─ fixtures/
│
├─ examples/
│  ├─ vite-vue/
│  ├─ nuxt/
│  └─ admin-template/
│
├─ tests/
│  ├─ e2e/
│  ├─ accessibility/
│  └─ visual/
│
├─ .changeset/
├─ package.json
├─ pnpm-workspace.yaml
├─ turbo.json
├─ tsconfig.base.json
├─ vitest.config.ts
├─ playwright.config.ts
└─ README.md
```

### 2.1 `packages/core`

职责：存放不依赖 Vue 的底层协议和能力。

包括：

- design tokens；
- theme algorithm；
- i18n schema；
- icon metadata；
- common types；
- shared utilities。

设计动机：

> 把 UI 系统规则从 Vue 渲染实现中拆出来。

未来 React 版本不需要重新设计主题、Token、图标、国际化，只需要实现新的 Adapter。

### 2.2 `packages/components`

职责：存放 Vue 基础组件实现。

每个组件是独立发布单元、独立类型单元、独立样式单元。

设计动机：

- 支持按需引入；
- 支持 Tree-shaking；
- 支持独立测试；
- 支持独立文档；
- 支持独立依赖分析。

### 2.3 `packages/vue`

职责：Vue 总入口和框架适配层。

包括：

- `install(app)`；
- 全量注册；
- ConfigProvider；
- LocaleProvider；
- ZIndex 管理；
- 全局配置；
- unplugin-vue-components resolver。

设计动机：

> 组件只负责 UI，Vue Adapter 负责插件化安装、全局配置和框架生命周期接入。

### 2.4 `packages/theme`

职责：独立样式系统。

包括：

- SCSS 源码；
- CSS Variables；
- dark theme；
- compact theme；
- token 转换产物。

设计动机：

> 样式是跨组件、跨框架、跨运行时的系统能力，不应该散落在组件内部。

### 2.5 `packages/pro-components`

职责：业务增强组件。

例如：

- ProForm；
- ProTable；
- QueryFilter；
- PageContainer；
- SearchPanel。

设计动机：

> 基础组件追求通用性，业务组件追求效率。两者必须隔离。

否则基础组件会被业务需求污染，后期难以维护。

---

## 3. 分层架构设计

整体分层：

```txt
生态层 Ecosystem
  ↑
业务层 Pro Components
  ↑
组件层 Components
  ↑
适配层 Vue Adapter
  ↑
基础层 Core
  ↑
样式层 Style System

工具层 Tooling 横向支撑所有层
```

更准确的依赖方向：

```txt
apps/docs
apps/playground
examples
   ↓
@company/ui-vue
@company/ui-pro-components
   ↓
@company/ui-components
   ↓
@company/ui-hooks
@company/ui-directives
@company/ui-icons
   ↓
@company/ui-core
@company/ui-theme
@company/ui-utils

@company/ui-build / internal scripts 横向服务，不进入运行时代码
```

### 3.1 基础层 Core

职责：

- 定义组件库基础协议；
- 定义主题 Token 类型；
- 定义国际化消息结构；
- 定义图标元数据结构；
- 定义全局配置类型；
- 提供框架无关工具。

设计动机：

> Core 是规则层，不是实现层。

它不应该知道 Vue、React、DOM 组件长什么样，只定义系统级协议。

禁止：

```ts
import { ref, computed } from 'vue'
import React from 'react'
```

允许：

```ts
export interface ThemeToken {
  colorPrimary: string
  borderRadiusBase: string
  fontSizeBase: string
}

export interface LocaleMessages {
  common: {
    confirm: string
    cancel: string
  }
}
```

### 3.2 样式层 Style System

职责：

- 管理 design tokens；
- 输出 CSS Variables；
- 输出 SCSS variables / mixins；
- 支持暗色主题；
- 支持运行时换肤；
- 支持组件级样式按需加载。

推荐选型：

```txt
SCSS 编写结构样式
CSS Variable 承载主题变量
运行时通过 CSS Variable 实现换肤
```

设计动机：

- SCSS 适合 mixin、函数、嵌套、BEM 生成和构建期主题包；
- CSS Variable 适合运行时换肤、租户主题、暗色模式和动态品牌色；
- 两者组合可以同时满足工程组织和运行时动态主题。

### 3.3 组件层 Components

职责：

- 实现基础 UI 组件；
- 暴露组件 Props / Emits / Slots 类型；
- 保证组件独立入口；
- 不包含业务逻辑；
- 不直接依赖业务组件。

组件分级：

```txt
基础组件：Button / Icon / Text / Divider
表单组件：Input / Select / Checkbox / Radio / DatePicker / Form
反馈组件：Dialog / Drawer / Message / Notification / Popover
数据展示：Table / Tree / Tag / Badge / Tooltip / Collapse
导航组件：Tabs / Menu / Breadcrumb / Pagination
布局组件：Grid / Space / Layout / Scrollbar
```

设计动机：

> 组件层是稳定通用能力，必须控制边界，不能被业务诉求拖着走。

### 3.4 业务层 Pro Components

职责：

- 提供中后台高阶组件；
- 组合基础组件形成业务模式；
- 提供 schema-driven 能力；
- 提供数据请求、表单联动、权限适配扩展点。

设计动机：

> 企业项目中真正提效的是 Pro 组件，但 Pro 组件不应该污染基础组件。

例如：

- `Table` 只负责表格渲染；
- `ProTable` 负责查询、分页、请求、列配置、工具栏。

### 3.5 工具层 Tooling

职责：

- 组件模板生成；
- 构建入口生成；
- 类型声明生成；
- 样式构建；
- changelog；
- release；
- bundle analyze；
- lint rules；
- codemod。

设计动机：

> 企业级组件库不能依赖手工维护入口、样式、类型和文档。

新增组件时，生成器应自动创建基础目录、测试、样式、文档和导出入口。

### 3.6 生态层 Ecosystem

职责：

- 文档站；
- Playground；
- Resolver；
- ESLint config；
- Figma token pipeline；
- VS Code snippets；
- CLI；
- Nuxt module；
- unplugin 插件；
- changelog；
- migration guide。

设计动机：

> 成熟组件库交付的不是代码包，而是一整套使用体验。

---

## 4. 模块职责、依赖约束与禁止循环依赖规则

### 4.1 推荐包依赖关系

```txt
@company/ui-core
  不依赖任何内部运行时包

@company/ui-utils
  → @company/ui-core

@company/ui-theme
  → @company/ui-core

@company/ui-icons
  → @company/ui-core

@company/ui-hooks
  → @company/ui-core
  → @company/ui-utils

@company/ui-directives
  → @company/ui-core
  → @company/ui-utils

@company/ui-components
  → @company/ui-core
  → @company/ui-utils
  → @company/ui-hooks
  → @company/ui-theme

@company/ui-vue
  → @company/ui-components
  → @company/ui-directives
  → @company/ui-icons
  → @company/ui-theme
  → @company/ui-core

@company/ui-pro-components
  → @company/ui-vue
  → @company/ui-components
  → @company/ui-core

apps/docs
  → 所有公开包
```

### 4.2 依赖约束原则

#### Core 永远在底部

`core` 禁止依赖：

- `vue`；
- `react`；
- `components`；
- `pro-components`；
- `theme` 的运行时实现；
- DOM API。

原因：

> Core 是跨框架复用的基础协议，一旦依赖框架，未来多框架适配就失败。

#### 基础组件不能依赖业务组件

禁止：

```txt
components/button → pro-components/pro-form
components/table → pro-components/pro-table
```

原因：

> 基础组件应该稳定，业务组件可以快速变化。稳定层不能依赖可变层。

#### 样式可以被组件依赖，但不能依赖组件逻辑

允许：

```txt
components/button → theme
```

禁止：

```txt
theme → components/button
```

原因：

> 样式层应该提供变量、mixin、主题包，而不是感知具体组件逻辑。

#### 工具层不进入运行时代码

允许：

```txt
build script → components
```

禁止：

```txt
components → build
```

原因：

> 构建工具是开发时能力，不能进入用户 bundle。

### 4.3 禁止循环依赖规则

推荐工具：

- `eslint-plugin-import/no-cycle`；
- `madge`；
- `dependency-cruiser`；
- `pnpm why`；
- `turbo graph`。

规则示例：

```txt
禁止同层组件互相深依赖：
button ❌ import select
select ❌ import form

允许依赖抽象：
select ✅ import @company/ui-hooks/use-form-item
form ✅ provide form context

禁止跨包深路径：
@company/ui-components/button/src/button.vue ❌ import @company/ui-components/input/src/input.vue

允许公共入口：
@company/ui-components/button ✅ import @company/ui-hooks
```

核心规则：

```txt
同层不能横向互相依赖
下层不能依赖上层
业务不能进入基础
运行时不能依赖构建时
```

如果组件间需要共享逻辑，应抽到：

```txt
@company/ui-hooks
@company/ui-utils
@company/ui-core
```

---

## 5. 打包策略、按需引入与 Tree-shaking 设计

### 5.1 构建产物

建议同时输出：

```txt
dist/
├─ es/
│  ├─ button/
│  ├─ input/
│  ├─ index.js
│  └─ index.d.ts
├─ lib/
│  ├─ button/
│  ├─ input/
│  ├─ index.cjs
│  └─ index.d.ts
├─ theme/
│  ├─ index.css
│  ├─ button.css
│  ├─ input.css
│  └─ dark.css
└─ resolver/
   └─ index.js
```

包入口示例：

```json
{
  "main": "dist/lib/index.cjs",
  "module": "dist/es/index.js",
  "types": "dist/es/index.d.ts",
  "sideEffects": [
    "**/*.css",
    "**/*.scss"
  ],
  "exports": {
    ".": {
      "types": "./dist/es/index.d.ts",
      "import": "./dist/es/index.js",
      "require": "./dist/lib/index.cjs"
    },
    "./button": {
      "types": "./dist/es/button/index.d.ts",
      "import": "./dist/es/button/index.js",
      "require": "./dist/lib/button/index.cjs"
    },
    "./theme/index.css": "./dist/theme/index.css",
    "./theme/button.css": "./dist/theme/button.css"
  }
}
```

### 5.2 全量引入

```ts
import { createApp } from 'vue'
import Ui from '@company/ui-vue'
import '@company/ui-theme/index.css'

createApp(App).use(Ui)
```

适合：

- 后台系统；
- 内部项目；
- 对包体积不敏感的场景。

### 5.3 手动按需引入

```ts
import { UiButton } from '@company/ui-vue/button'
import '@company/ui-theme/button.css'
```

适合：

- 精细控制包体积；
- 组件库内部调试；
- 构建插件失效时兜底。

### 5.4 自动按需引入

使用：

- `unplugin-vue-components`；
- 自定义 resolver；
- `unplugin-auto-import`。

示例：

```ts
import Components from 'unplugin-vue-components/vite'
import { CompanyUiResolver } from '@company/ui-vue/resolver'

export default {
  plugins: [
    Components({
      resolvers: [
        CompanyUiResolver({
          importStyle: 'css'
        })
      ]
    })
  ]
}
```

页面直接使用：

```vue
<template>
  <UiButton type="primary">Submit</UiButton>
</template>
```

自动转换为：

```ts
import { UiButton } from '@company/ui-vue/button'
import '@company/ui-theme/button.css'
```

设计动机：

> 企业组件库要降低使用成本，但不能牺牲 Tree-shaking。

### 5.5 Tree-shaking 关键设计

必须满足：

1. 每个组件独立入口：

```txt
@company/ui-vue/button
@company/ui-vue/input
@company/ui-vue/table
```

2. 不在根入口强制注册所有组件副作用。

3. `package.json` 正确声明样式副作用：

```json
{
  "sideEffects": [
    "**/*.css",
    "**/*.scss"
  ]
}
```

4. 使用 ESM 输出。

5. 样式按组件拆分：

```txt
theme/button.css
theme/input.css
theme/table.css
```

6. 谨慎使用 barrel file，确保根入口没有初始化副作用。

---

## 6. 主题系统与样式方案选型

### 6.1 推荐方案

```txt
SCSS + CSS Variables + Token Pipeline + Runtime Theme
```

分工：

| 技术 | 职责 |
|---|---|
| SCSS | 编写组件结构样式、mixin、BEM、默认样式构建 |
| CSS Variables | 承载主题变量，支持运行时换肤 |
| Design Token | 统一设计语义，连接设计稿、代码、主题 |
| Theme Algorithm | 根据种子色生成完整色板 |
| Runtime Theme | 动态切换品牌色、暗色、紧凑模式 |

### 6.2 Token 分层

```txt
Seed Token
  ↓
Map Token
  ↓
Alias Token
  ↓
Component Token
```

#### Seed Token

最原始的品牌输入：

```ts
const seedToken = {
  colorPrimary: '#1677ff',
  colorSuccess: '#52c41a',
  colorWarning: '#faad14',
  colorError: '#ff4d4f',
  borderRadius: 6,
  fontSize: 14
}
```

#### Map Token

通过算法生成：

```ts
const mapToken = {
  colorPrimaryBg: '#e6f4ff',
  colorPrimaryHover: '#4096ff',
  colorPrimaryActive: '#0958d9'
}
```

#### Alias Token

面向 UI 语义：

```ts
const aliasToken = {
  colorText: '#1f2329',
  colorTextSecondary: '#646a73',
  colorBorder: '#dcdfe6',
  colorBgContainer: '#ffffff'
}
```

#### Component Token

组件私有变量：

```ts
const buttonToken = {
  buttonHeightMd: '32px',
  buttonPaddingHorizontal: '16px',
  buttonPrimaryBg: 'var(--ui-color-primary)'
}
```

设计动机：

> 不同层级解决不同抽象问题，避免所有组件直接依赖品牌色。

### 6.3 CSS Variable 命名

```css
:root {
  --ui-color-primary: #1677ff;
  --ui-color-success: #52c41a;
  --ui-color-text: #1f2329;
  --ui-color-border: #dcdfe6;
  --ui-border-radius-base: 6px;
  --ui-font-size-base: 14px;
}
```

组件变量：

```css
.ui-button {
  --ui-button-height: 32px;
  --ui-button-padding-x: 16px;
  --ui-button-bg: var(--ui-color-primary);
}
```

### 6.4 运行时换肤

API 示例：

```ts
import { createTheme } from '@company/ui-core/theme'

const theme = createTheme({
  colorPrimary: '#722ed1',
  borderRadius: 8,
  mode: 'dark'
})

theme.apply()
```

内部本质：

```ts
document.documentElement.style.setProperty('--ui-color-primary', '#722ed1')
```

设计动机：

> 企业系统常见需求是品牌换肤、租户换肤、暗色模式。如果只用 SCSS，运行时换肤会非常困难。

---

## 7. TypeScript 类型设计、全局类型与组件 Props 规范

### 7.1 类型设计原则

#### 公共类型从 Core 输出

```ts
import type {
  ComponentSize,
  ComponentStatus,
  ThemeToken,
  ComponentBaseProps
} from '@company/ui-core'
```

不要每个组件重复定义：

```ts
type Size = 'small' | 'medium' | 'large'
```

#### 组件 Props 类型显式导出

```ts
export interface ButtonProps {
  type?: ButtonType
  size?: ComponentSize
  disabled?: boolean
  loading?: boolean
}

export type ButtonType =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
```

好处：

- 用户可复用类型；
- 业务封装组件时能继承；
- 文档可自动生成；
- IDE 提示更稳定。

#### Props 命名统一

统一基础 Props：

```ts
export interface ComponentBaseProps {
  class?: unknown
  style?: unknown
  size?: ComponentSize
  disabled?: boolean
}
```

统一尺寸：

```ts
export type ComponentSize = 'small' | 'medium' | 'large'
```

统一状态：

```ts
export type ComponentStatus =
  | 'default'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
```

统一位置：

```ts
export type Placement =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-start'
  | 'top-end'
  | 'bottom-start'
  | 'bottom-end'
```

### 7.2 Vue Props 写法规范

推荐：

```ts
export const buttonProps = {
  type: {
    type: String as PropType<ButtonType>,
    default: 'default'
  },
  size: {
    type: String as PropType<ComponentSize>,
    default: 'medium'
  },
  disabled: Boolean,
  loading: Boolean
} as const
```

同时导出：

```ts
export type ButtonProps = ExtractPropTypes<typeof buttonProps>
```

设计动机：

> Vue 运行时需要 props option，TypeScript 用户需要静态类型，两者都要照顾。

### 7.3 Emits 类型规范

```ts
export const buttonEmits = {
  click: (event: MouseEvent) => event instanceof MouseEvent
}

export type ButtonEmits = typeof buttonEmits
```

命名规则：

```txt
update:modelValue
change
input
focus
blur
visible-change
```

### 7.4 Slots 类型规范

```ts
export interface ButtonSlots {
  default?: () => unknown
  icon?: () => unknown
  loading?: () => unknown
}
```

复杂组件：

```ts
export interface TableSlots<T = Record<string, unknown>> {
  default?: () => unknown
  cell?: (scope: { row: T; column: TableColumn<T>; index: number }) => unknown
  header?: (scope: { column: TableColumn<T>; index: number }) => unknown
}
```

设计动机：

> 复杂组件真正的类型体验主要来自 slot scope，而不只是 props。

### 7.5 全局类型增强

为 Vue 提供全局组件类型：

```ts
declare module 'vue' {
  export interface GlobalComponents {
    UiButton: typeof import('@company/ui-vue')['UiButton']
    UiInput: typeof import('@company/ui-vue')['UiInput']
  }
}
```

设计动机：

> 用户全局注册后，也要在模板里获得类型提示。

---

## 8. 未来可扩展预留设计

### 8.1 多框架适配

推荐包结构：

```txt
packages/
├─ core/
├─ components/
├─ vue/
├─ react/
├─ web-components/
└─ theme/
```

更长期可演进为：

```txt
packages/
├─ primitives/
│  ├─ button/
│  ├─ dialog/
│  └─ tooltip/
├─ vue/
├─ react/
└─ web-components/
```

第一阶段不建议直接做 primitives，因为成本高。

推荐策略：

> 先让 Core 框架无关，组件层 Vue 优先；等组件模型稳定后，再抽 Headless Primitives。

### 8.2 组件懒加载

支持两类：

#### 路由级懒加载

用户侧自然处理：

```ts
const AdminPage = defineAsyncComponent(() => import('./AdminPage.vue'))
```

#### 重型组件懒加载

组件库提供：

```ts
const UiRichTextEditor = defineAsyncComponent(() =>
  import('@company/ui-vue/rich-text-editor')
)
```

适合：

- RichTextEditor；
- CodeEditor；
- Chart；
- Map；
- UploadPreview；
- VirtualTable。

设计规则：

> 基础轻量组件不懒加载，重型组件才懒加载。

否则会增加请求数量和复杂度。

### 8.3 国际化

Core 定义协议：

```ts
export interface LocaleMessages {
  name: string
  common: {
    confirm: string
    cancel: string
  }
  datePicker: {
    today: string
    now: string
    clear: string
  }
  pagination: {
    total: string
    page: string
  }
}
```

Vue Adapter 提供：

```ts
app.use(Ui, {
  locale: zhCN
})
```

组件内使用：

```ts
const { t } = useLocale()
```

预留：

- 动态切换语言；
- 局部覆盖语言包；
- 与 `vue-i18n` 集成；
- SSR 语言注入。

### 8.4 图标系统

推荐：

```txt
@company/ui-icons
├─ raw svg
├─ vue icon components
├─ icon metadata
├─ icon resolver
└─ icon font optional
```

使用方式：

```vue
<UiIcon name="search" />
```

或：

```ts
import SearchIcon from '@company/ui-icons/search'
```

设计原则：

- 图标可单独按需引入；
- 图标元数据框架无关；
- Vue 图标组件只是适配产物；
- 支持内部业务图标扩展。

### 8.5 指令系统

Vue 专属，放在：

```txt
packages/directives
```

例如：

```txt
v-loading
v-click-outside
v-permission
v-repeat-click
v-resize
```

设计动机：

> 指令是 Vue 生态能力，不应该放进 Core，但又是组件库常用增强能力，所以独立成包。

这样未来 React 不需要继承这套实现，只需要实现自己的 hooks 或 HOC。

---

## 9. 最终依赖图

```txt
生态层
apps/docs / apps/playground / cli / resolver / examples
  ↓
业务层
@company/ui-pro-components
  ↓
主入口层
@company/ui-vue
  ↓
组件层
@company/ui-components
  ↓
适配增强层
@company/ui-hooks
@company/ui-directives
@company/ui-icons
  ↓
基础能力层
@company/ui-core
@company/ui-utils
@company/ui-theme
  ↓
工具层横向支撑
@company/ui-build
internal/generators
internal/scripts
```

---

## 10. 架构表达总结

如果用于面试、晋升或架构评审，可以这样表达：

> 我不会把组件库设计成简单的组件集合，而会把它设计成分层的 UI 基础设施。基础层沉淀跨框架协议，组件层实现 Vue 交互，业务层封装中后台高频模式，样式层统一 Token 和运行时主题，工具层保证构建、发包和规范自动化，生态层降低接入和迁移成本。这样既能快速交付 Vue 组件库，也能为多框架、国际化、主题换肤、按需加载和业务组件扩展预留空间。

---

## 11. 后续细化方向

下一步建议按以下顺序继续细化：

1. **Monorepo 工程初始化方案**：pnpm workspace、turbo、tsconfig、eslint、changesets；
2. **包依赖边界与 dependency-cruiser 规则**：把架构约束变成可执行规则；
3. **组件标准目录与生成器规范**：定义新增组件的标准模板；
4. **构建与发包方案**：ESM/CJS、类型声明、样式产物、exports、sideEffects；
5. **主题 Token 系统**：Seed / Map / Alias / Component Token 的代码模型；
6. **Vue Adapter 设计**：install、ConfigProvider、LocaleProvider、resolver；
7. **Button 组件作为最小闭环样板**：验证组件、样式、类型、测试、文档、按需引入全流程。

---

## 12. Monorepo 工程初始化细化方案

本节目标是把前面的架构设计转成可初始化、可维护、可扩展的工程骨架。

第一阶段推荐组合：

```txt
pnpm workspace + Turborepo + TypeScript Project References + Changesets
```

### 12.1 为什么选择 pnpm workspace

`pnpm workspace` 负责解决 Monorepo 中的包管理问题。

选择原因：

- 安装速度快，磁盘占用低；
- workspace 内部包可以通过 `workspace:*` 建立依赖；
- 依赖关系显式，适合组件库多包治理；
- 与 Changesets、Turbo、Vite、tsup 配合成熟。

不建议第一阶段使用 npm workspace 的原因：

- pnpm 对 Monorepo 的约束更强；
- pnpm 的依赖隔离更容易暴露幽灵依赖问题；
- 企业级组件库更需要可控的依赖拓扑。

不建议第一阶段使用 Rush 的原因：

- Rush 更适合超大型企业仓库；
- 配置和认知成本较高；
- 对当前组件库架构展示而言会稀释重点。

设计动机：

> 组件库 Monorepo 的重点不是“把代码放在一个仓库”，而是让多个包之间的依赖、构建、版本和发布都可治理。

### 12.2 为什么选择 Turborepo

Turborepo 负责任务编排和缓存。

主要职责：

- 按依赖关系执行 build；
- 缓存已完成任务；
- 支持并行 lint、test、typecheck；
- 提供清晰的 pipeline 定义；
- 降低多包构建成本。

与 Nx 对比：

| 方案 | 优点 | 风险 | 适用阶段 |
|---|---|---|---|
| Turborepo | 配置轻、上手快、与前端库项目契合 | 代码生成和边界治理能力弱于 Nx | 第一阶段推荐 |
| Nx | 依赖图、生成器、边界规则能力强 | 配置复杂，侵入性更强 | 中大型阶段可升级 |

推荐策略：

> 第一阶段用 Turborepo 保持工程轻量；当组件数量、应用数量、团队规模继续扩大后，再评估是否引入 Nx 的 generators 和 module boundary 能力。

### 12.3 根目录配置文件职责

推荐根目录文件：

```txt
ui-library/
├─ package.json
├─ pnpm-workspace.yaml
├─ turbo.json
├─ tsconfig.base.json
├─ tsconfig.json
├─ eslint.config.js
├─ prettier.config.js
├─ vitest.config.ts
├─ playwright.config.ts
├─ changeset.config.json
├─ .npmrc
├─ .gitignore
└─ README.md
```

每个文件职责：

| 文件 | 职责 |
|---|---|
| `package.json` | 根脚本、开发依赖、包管理器版本声明 |
| `pnpm-workspace.yaml` | 声明 workspace 包范围 |
| `turbo.json` | 定义 build、test、lint、typecheck 等任务流水线 |
| `tsconfig.base.json` | 全局 TS 编译规则和路径别名 |
| `tsconfig.json` | TS project references 入口 |
| `eslint.config.js` | 全仓库代码规范 |
| `prettier.config.js` | 格式化规范 |
| `vitest.config.ts` | 单测配置 |
| `playwright.config.ts` | E2E / 交互测试配置 |
| `changeset.config.json` | 发版策略 |
| `.npmrc` | pnpm 行为、registry、peer dependency 策略 |

设计动机：

> 根配置只负责全局规则，不承载具体包逻辑；每个 package 保留自己的构建入口和 package.json，避免根配置变成不可维护的巨型中心。

### 12.4 `pnpm-workspace.yaml` 设计

建议：

```yaml
packages:
  - "packages/*"
  - "apps/*"
  - "examples/*"
  - "internal/*"
```

设计说明：

- `packages/*`：对外发布或内部复用包；
- `apps/*`：文档站、playground、可视化回归应用；
- `examples/*`：用户接入示例；
- `internal/*`：内部工具，不对外发布。

为什么把 `internal/*` 也放进 workspace：

> 内部生成器、脚本、测试 fixture 也需要复用统一依赖和 TS 配置，但它们应该通过 `private: true` 防止发布。

### 12.5 根 `package.json` 设计

推荐：

```json
{
  "name": "@company/ui-monorepo",
  "private": true,
  "type": "module",
  "packageManager": "pnpm@9.0.0",
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "test": "turbo test",
    "test:e2e": "turbo test:e2e",
    "lint": "turbo lint",
    "typecheck": "turbo typecheck",
    "clean": "turbo clean && rimraf node_modules",
    "changeset": "changeset",
    "version": "changeset version",
    "release": "turbo build && changeset publish",
    "graph": "turbo graph"
  },
  "devDependencies": {
    "@changesets/cli": "latest",
    "@playwright/test": "latest",
    "@types/node": "latest",
    "@vitejs/plugin-vue": "latest",
    "eslint": "latest",
    "prettier": "latest",
    "rimraf": "latest",
    "turbo": "latest",
    "typescript": "latest",
    "vite": "latest",
    "vitest": "latest",
    "vue": "latest"
  }
}
```

设计动机：

- 根 `package.json` 只放全局开发工具；
- 运行时依赖放到对应 package；
- 不在根声明组件库运行时依赖，避免依赖边界模糊；
- `private: true` 防止误发布根包。

### 12.6 `.npmrc` 设计

建议：

```ini
shamefully-hoist=false
strict-peer-dependencies=false
auto-install-peers=true
link-workspace-packages=true
prefer-workspace-packages=true
```

设计说明：

- `shamefully-hoist=false`：避免幽灵依赖；
- `link-workspace-packages=true`：优先链接 workspace 内部包；
- `prefer-workspace-packages=true`：内部包优先使用本地版本；
- `auto-install-peers=true`：降低本地开发时 peer dependency 噪音。

注意：

> 组件库发布时仍然要正确声明 peerDependencies，不能因为本地自动安装 peer 就忽略发布约束。

### 12.7 `turbo.json` 设计

推荐：

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "typecheck": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "lint": {
      "outputs": []
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "test:e2e": {
      "dependsOn": ["build"],
      "outputs": ["test-results/**", "playwright-report/**"]
    },
    "clean": {
      "cache": false
    }
  }
}
```

设计动机：

- `build.dependsOn: ["^build"]` 保证先构建依赖包；
- `typecheck.dependsOn: ["^build"]` 保证类型检查依赖产物稳定；
- `dev.cache=false` 避免开发服务被缓存；
- `outputs` 明确缓存目录，减少无效构建。

### 12.8 TypeScript 配置设计

根 `tsconfig.base.json`：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "jsx": "preserve",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "baseUrl": ".",
    "paths": {
      "@company/ui-core": ["packages/core/src/index.ts"],
      "@company/ui-utils": ["packages/utils/src/index.ts"],
      "@company/ui-theme": ["packages/theme/src/index.ts"],
      "@company/ui-hooks": ["packages/hooks/src/index.ts"],
      "@company/ui-directives": ["packages/directives/src/index.ts"],
      "@company/ui-icons": ["packages/icons/src/index.ts"],
      "@company/ui-components": ["packages/components/index.ts"],
      "@company/ui-vue": ["packages/vue/src/index.ts"]
    }
  }
}
```

根 `tsconfig.json`：

```json
{
  "files": [],
  "references": [
    { "path": "./packages/core" },
    { "path": "./packages/utils" },
    { "path": "./packages/theme" },
    { "path": "./packages/hooks" },
    { "path": "./packages/directives" },
    { "path": "./packages/icons" },
    { "path": "./packages/components" },
    { "path": "./packages/vue" },
    { "path": "./packages/pro-components" }
  ]
}
```

单包 `tsconfig.json` 示例：

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "rootDir": "src",
    "outDir": "dist/types"
  },
  "include": ["src", "*.ts"],
  "exclude": ["dist", "node_modules"]
}
```

设计动机：

> `tsconfig.base.json` 统一规则，单包 `tsconfig.json` 声明边界，根 `tsconfig.json` 通过 references 表达包依赖拓扑。

### 12.9 包命名规范

推荐统一命名：

```txt
@company/ui-core
@company/ui-utils
@company/ui-theme
@company/ui-hooks
@company/ui-directives
@company/ui-icons
@company/ui-components
@company/ui-vue
@company/ui-pro-components
@company/ui-build
```

命名原则：

- 对外包统一使用 `@company/ui-*`；
- 内部工具包可以使用 `@company/ui-internal-*` 或 `private: true`；
- 不建议包名过短，例如 `@company/core`，因为语义不够清晰；
- 不建议所有能力塞进 `@company/ui`，因为会破坏按需引入和多包治理。

### 12.10 单包 `package.json` 规范

以 `@company/ui-core` 为例：

```json
{
  "name": "@company/ui-core",
  "version": "0.0.0",
  "type": "module",
  "main": "dist/index.cjs",
  "module": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  },
  "files": ["dist"],
  "sideEffects": false,
  "scripts": {
    "build": "tsup src/index.ts --format esm,cjs --dts",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "test": "vitest run",
    "lint": "eslint .",
    "clean": "rimraf dist"
  }
}
```

以 `@company/ui-vue` 为例：

```json
{
  "name": "@company/ui-vue",
  "version": "0.0.0",
  "type": "module",
  "main": "dist/lib/index.cjs",
  "module": "dist/es/index.js",
  "types": "dist/es/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/es/index.d.ts",
      "import": "./dist/es/index.js",
      "require": "./dist/lib/index.cjs"
    },
    "./button": {
      "types": "./dist/es/button/index.d.ts",
      "import": "./dist/es/button/index.js",
      "require": "./dist/lib/button/index.cjs"
    },
    "./resolver": {
      "types": "./dist/resolver/index.d.ts",
      "import": "./dist/resolver/index.js"
    }
  },
  "sideEffects": [
    "**/*.css",
    "**/*.scss"
  ],
  "peerDependencies": {
    "vue": "^3.4.0"
  },
  "dependencies": {
    "@company/ui-core": "workspace:*",
    "@company/ui-components": "workspace:*",
    "@company/ui-theme": "workspace:*"
  }
}
```

设计动机：

- `core` 没有样式副作用，所以 `sideEffects: false`；
- `vue` 包可能导入样式，所以保留 CSS/SCSS 副作用；
- `vue` 必须把 `vue` 放在 `peerDependencies`，避免用户项目打入多份 Vue；
- 内部包用 `workspace:*`，保证本地依赖关系明确。

### 12.11 初始化落地顺序

建议按以下顺序初始化：

```txt
Step 1: 创建根 workspace
Step 2: 配置 pnpm-workspace.yaml
Step 3: 配置根 package.json 与 turbo.json
Step 4: 配置 tsconfig.base.json 与 tsconfig references
Step 5: 创建 core / utils / theme 三个底层包
Step 6: 创建 hooks / directives / icons 三个增强包
Step 7: 创建 components 包并实现 Button 样板
Step 8: 创建 vue 包，完成 install 和 resolver
Step 9: 创建 docs 和 playground
Step 10: 接入 changesets、lint、test、typecheck、build
```

为什么先做底层包，再做组件：

> 如果直接写组件，容易把主题、类型、工具函数散落在组件内部；先建底层包，可以迫使组件从第一天就遵守架构边界。

为什么 Button 是第一个组件样板：

- API 简单；
- 状态覆盖典型；
- 样式变量完整；
- 可以验证 props、emits、slots、style、test、docs、resolver 全链路；
- 后续组件都可以复用它的工程模板。

### 12.12 第一阶段验收标准

Monorepo 初始化完成后，应满足：

```txt
pnpm install 成功
pnpm build 成功
pnpm typecheck 成功
pnpm lint 成功
pnpm test 成功
Button 可在 playground 中使用
Button 可通过全量引入使用
Button 可通过手动按需引入使用
Button 可通过 resolver 自动按需引入使用
Button 样式可独立加载
Button 类型可被业务项目正确推导
```

架构验收标准：

- `core` 不依赖 Vue；
- `components` 不依赖 `pro-components`；
- `theme` 不依赖组件逻辑；
- `build` 不进入运行时代码；
- 所有内部包依赖使用 `workspace:*`；
- 所有对外包都有 `exports`、`types`、`sideEffects`；
- 所有组件都有独立入口和独立样式入口。

### 12.13 架构能力表达点

在架构评审中，这一节可以这样表达：

> 我会先用 pnpm workspace 建立多包依赖关系，用 Turborepo 管理构建流水线和缓存，用 TypeScript Project References 表达类型边界，用 Changesets 管理版本发布。这样 Monorepo 不只是目录组织，而是具备依赖治理、构建治理、类型治理和发布治理能力。第一阶段先完成 core、theme、components、vue 四条主链路，再用 Button 组件验证从源码、样式、类型、构建、文档到按需引入的完整闭环。

---

## 13. 包依赖边界与工程规则细化方案

本节目标是把“架构分层”和“禁止循环依赖”从口头约束变成可执行、可检查、可在 CI 中阻断的工程规则。

推荐组合：

```txt
dependency-cruiser + ESLint import rules + TypeScript references + pnpm workspace + CI gate
```

设计原则：

> 架构边界不能只靠人的自觉维护，必须沉淀为自动化规则。否则组件数量一多，跨层依赖、深路径依赖和循环依赖一定会出现。

### 13.1 依赖治理目标

依赖治理要解决五类问题：

```txt
1. 下层包不能依赖上层包
2. 基础组件不能依赖业务组件
3. Core 不能依赖任何框架运行时
4. 运行时代码不能依赖构建工具
5. 禁止包级和文件级循环依赖
```

这五类问题分别对应不同风险：

| 问题 | 风险 |
|---|---|
| 下层依赖上层 | 分层失效，未来无法扩展 |
| 基础依赖业务 | 基础组件被业务污染 |
| Core 依赖 Vue / React | 多框架适配失败 |
| Runtime 依赖 Build | 用户 bundle 被构建工具污染 |
| 循环依赖 | 初始化顺序不稳定，Tree-shaking 变差，测试难写 |

### 13.2 包分层定义

建议给每个包定义明确层级：

```txt
Layer 0: core
  @company/ui-core

Layer 1: foundation
  @company/ui-utils
  @company/ui-theme

Layer 2: framework-enhancer
  @company/ui-hooks
  @company/ui-directives
  @company/ui-icons

Layer 3: components
  @company/ui-components

Layer 4: adapter
  @company/ui-vue

Layer 5: business
  @company/ui-pro-components

Layer 6: ecosystem
  apps/docs
  apps/playground
  examples/*

Layer X: tooling
  @company/ui-build
  internal/*
```

允许依赖方向：

```txt
高层可以依赖低层
低层不能依赖高层
同层默认不能互相依赖，除非经过明确设计
工具层可以读取源码，但不能被运行时代码依赖
```

依赖图：

```txt
ecosystem
  ↓
business
  ↓
adapter
  ↓
components
  ↓
framework-enhancer
  ↓
foundation
  ↓
core
```

设计动机：

> 分层不是为了画图，而是为了控制变化传播方向。越底层越稳定，越上层越接近业务变化。

### 13.3 包级允许依赖矩阵

建议维护一张依赖矩阵：

| 当前包 | 允许依赖 | 禁止依赖 |
|---|---|---|
| `@company/ui-core` | 无内部运行时包 | Vue、React、DOM、components、theme runtime、build |
| `@company/ui-utils` | `ui-core` | components、vue、pro-components、build |
| `@company/ui-theme` | `ui-core` | components、vue、pro-components、build |
| `@company/ui-hooks` | `ui-core`、`ui-utils`、Vue peer | components、pro-components、build |
| `@company/ui-directives` | `ui-core`、`ui-utils`、Vue peer | components、pro-components、build |
| `@company/ui-icons` | `ui-core`、可选 Vue peer | pro-components、build |
| `@company/ui-components` | `ui-core`、`ui-utils`、`ui-theme`、`ui-hooks`、`ui-icons` | `ui-vue`、`ui-pro-components`、`ui-build` |
| `@company/ui-vue` | components、directives、icons、theme、core | pro-components、build |
| `@company/ui-pro-components` | vue、components、core、utils | build |
| `@company/ui-build` | 可读取所有源码 | 不被任何 runtime 包依赖 |
| `apps/docs` | 所有公开包 | 无特殊禁止 |

特别说明：

- `hooks` 和 `directives` 是 Vue 相关增强包，可以依赖 Vue peer，但不能依赖具体组件；
- `components` 可以依赖 `hooks`，但 `hooks` 不能反向依赖 `components`；
- `icons` 如果输出 Vue 图标组件，需要把 Vue 放在 peerDependencies；
- `theme` 只能输出 token、变量、样式，不允许 import 组件源码。

### 13.4 文件级导入规则

除了包级依赖，还要限制文件级导入方式。

#### 禁止跨包 src 深路径导入

禁止：

```ts
import { createTheme } from '@company/ui-core/src/theme/create-theme'
import Button from '@company/ui-components/button/src/button.vue'
```

允许：

```ts
import { createTheme } from '@company/ui-core'
import { UiButton } from '@company/ui-vue/button'
```

原因：

> 深路径导入会绕过包的公共 API，导致内部实现无法重构。

#### 禁止组件之间直接导入实现文件

禁止：

```ts
// packages/components/select/src/select.vue
import UiInput from '../../input/src/input.vue'
```

建议：

```ts
import { useFormItem } from '@company/ui-hooks'
import { UiIcon } from '@company/ui-icons'
```

如果确实需要复用子组件，应抽成内部 primitive：

```txt
packages/components/_internal/popper
packages/components/_internal/collection
packages/components/_internal/trigger
```

设计动机：

> 组件之间一旦互相 import，后续会很容易形成复杂网状依赖。共享能力要上移到 hooks、utils 或 internal primitives。

#### 禁止默认从根包导入内部组件

在组件库内部禁止：

```ts
import { UiButton } from '@company/ui-vue'
```

内部应使用更明确的依赖：

```ts
import { buttonProps } from '../button/src/button'
```

或者通过独立包入口：

```ts
import { UiButton } from '@company/ui-vue/button'
```

原因：

> 内部从根入口导入容易导致根入口加载大量无关模块，破坏 Tree-shaking，也容易制造循环依赖。

### 13.5 `dependency-cruiser` 配置设计

建议在根目录新增：

```txt
.dependency-cruiser.cjs
```

示例配置：

```js
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment: '禁止循环依赖',
      from: {},
      to: { circular: true }
    },
    {
      name: 'core-no-framework',
      severity: 'error',
      comment: 'core 层禁止依赖 Vue / React / DOM 框架实现',
      from: { path: '^packages/core/src' },
      to: {
        path: 'node_modules/(vue|react|react-dom)|^packages/(components|vue|pro-components|hooks|directives)/'
      }
    },
    {
      name: 'theme-no-components',
      severity: 'error',
      comment: 'theme 层禁止依赖组件实现',
      from: { path: '^packages/theme/src' },
      to: { path: '^packages/components/' }
    },
    {
      name: 'components-no-pro',
      severity: 'error',
      comment: '基础组件禁止依赖业务组件',
      from: { path: '^packages/components/' },
      to: { path: '^packages/pro-components/' }
    },
    {
      name: 'runtime-no-build',
      severity: 'error',
      comment: '运行时代码禁止依赖构建工具',
      from: { path: '^packages/(core|utils|theme|hooks|directives|icons|components|vue|pro-components)/' },
      to: { path: '^packages/build/|^internal/scripts/|^internal/generators/' }
    },
    {
      name: 'no-cross-package-src-import',
      severity: 'error',
      comment: '禁止跨包导入 src 深路径',
      from: { path: '^packages/' },
      to: { path: '^packages/[^/]+/src/.+' }
    },
    {
      name: 'vue-adapter-no-business',
      severity: 'error',
      comment: 'Vue adapter 不能依赖业务组件层',
      from: { path: '^packages/vue/' },
      to: { path: '^packages/pro-components/' }
    }
  ],
  options: {
    doNotFollow: {
      path: 'node_modules'
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: 'tsconfig.base.json'
    },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default']
    },
    reporterOptions: {
      dot: {
        collapsePattern: 'node_modules/[^/]+'
      }
    }
  }
}
```

注意：

> `no-cross-package-src-import` 需要根据实际路径做白名单，否则包内部自己导入自己的 `src` 也可能被误伤。实际落地时建议通过 `from.pathNot` 或更细粒度规则排除同包内部导入。

更严谨的深路径规则可以改成：

```js
{
  name: 'no-cross-package-private-import',
  severity: 'error',
  from: { path: '^packages/([^/]+)/' },
  to: {
    path: '^packages/(?!$1)[^/]+/src/'
  }
}
```

如果工具不支持正则反向引用，则应拆成脚本生成规则。

### 13.6 ESLint 规则设计

推荐在根 `eslint.config.js` 中加入：

```js
import importPlugin from 'eslint-plugin-import'

export default [
  {
    files: ['**/*.{ts,tsx,vue}'],
    plugins: {
      import: importPlugin
    },
    rules: {
      'import/no-cycle': ['error', { maxDepth: 1 }],
      'import/no-relative-packages': 'error',
      'import/no-duplicates': 'error',
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@company/ui-*/src/*'],
              message: '禁止跨包导入 src 私有路径，请通过 package exports 暴露公共 API。'
            },
            {
              group: ['@company/ui-build', '@company/ui-build/*'],
              message: '运行时代码禁止依赖构建工具包。'
            }
          ]
        }
      ]
    }
  },
  {
    files: ['packages/core/**/*.{ts,tsx,vue}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'vue', message: 'core 是框架无关层，禁止依赖 Vue。' },
            { name: 'react', message: 'core 是框架无关层，禁止依赖 React。' },
            { name: 'react-dom', message: 'core 是框架无关层，禁止依赖 React DOM。' }
          ],
          patterns: ['@company/ui-components*', '@company/ui-vue*', '@company/ui-pro-components*']
        }
      ]
    }
  },
  {
    files: ['packages/components/**/*.{ts,tsx,vue}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            '@company/ui-pro-components*',
            '@company/ui-vue',
            '@company/ui-vue/*'
          ]
        }
      ]
    }
  }
]
```

ESLint 与 dependency-cruiser 的分工：

| 工具 | 适合检查 |
|---|---|
| ESLint | 单文件导入规则、禁止 import、代码风格 |
| dependency-cruiser | 跨文件依赖图、循环依赖、跨层依赖 |
| TypeScript references | 类型层面的项目边界 |
| pnpm workspace | 包依赖声明和链接关系 |

### 13.7 TypeScript References 边界规则

每个包的 `tsconfig.json` 应显式声明 references。

例如 `packages/components/tsconfig.json`：

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "rootDir": ".",
    "outDir": "dist/types"
  },
  "references": [
    { "path": "../core" },
    { "path": "../utils" },
    { "path": "../theme" },
    { "path": "../hooks" },
    { "path": "../icons" }
  ],
  "include": ["**/*.ts", "**/*.vue"],
  "exclude": ["dist", "node_modules"]
}
```

`packages/core/tsconfig.json`：

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "rootDir": "src",
    "outDir": "dist/types"
  },
  "references": [],
  "include": ["src/**/*.ts"],
  "exclude": ["dist", "node_modules"]
}
```

设计动机：

> TypeScript references 可以让类型检查感知包边界。如果某个包没有声明依赖却直接引用另一个包，类型检查或构建阶段就能暴露问题。

### 13.8 package.json 依赖声明规则

每个包必须显式声明自己使用的依赖。

允许：

```json
{
  "dependencies": {
    "@company/ui-core": "workspace:*",
    "@company/ui-utils": "workspace:*"
  },
  "peerDependencies": {
    "vue": "^3.4.0"
  }
}
```

禁止：

```json
{
  "dependencies": {
    "@company/ui-vue": "workspace:*"
  }
}
```

如果当前包是 `@company/ui-components`，它不应该依赖 `@company/ui-vue`。

规则：

```txt
用到了就声明
内部包使用 workspace:*
框架运行时使用 peerDependencies
构建工具使用 devDependencies
不要依赖根 package.json 中的运行时包
```

设计动机：

> pnpm 的依赖隔离可以帮助暴露幽灵依赖，但前提是每个包都正确声明自己的依赖。

### 13.9 组件内部依赖规则

组件内部按以下优先级复用能力：

```txt
1. 组件自己的 src
2. components/_internal 中的内部 primitive
3. @company/ui-hooks
4. @company/ui-utils
5. @company/ui-core
```

禁止优先级倒置：

```txt
Button 不能依赖 Select
Input 不能依赖 Form
Table 不能依赖 ProTable
Dialog 不能依赖 ConfigProvider 的具体实现
```

对于 Form 这类上下文型组件：

```txt
Form 提供 context
FormItem 消费 context
Input 不直接依赖 Form
Input 通过 useFormItem 读取可选上下文
```

设计动机：

> 表单体系最容易产生循环依赖。正确做法是把共享上下文抽到 hook，而不是让 Input、Form、FormItem 互相 import。

### 13.10 `_internal` 内部模块规则

允许在 `packages/components/_internal` 放置组件内部复用 primitive：

```txt
packages/components/_internal/
├─ popper/
├─ trigger/
├─ collection/
├─ focus-trap/
├─ overlay/
└─ transition/
```

规则：

- `_internal` 不作为公共 API 暴露；
- `_internal` 可以被基础组件使用；
- `_internal` 不能依赖具体业务组件；
- `_internal` 内部仍然禁止循环依赖；
- 如果某个 `_internal` 模块变得稳定且跨框架有价值，可以下沉到 `core` 或 `utils`；
- 如果某个 `_internal` 模块与 Vue 强绑定，可以保留在 components 或抽到 hooks。

设计动机：

> `_internal` 是为了避免组件之间互相 import，但它不能变成新的垃圾桶。它只存放真正跨多个基础组件复用的内部 primitive。

### 13.11 CI 校验流程

推荐 CI 中加入：

```txt
pnpm lint
pnpm typecheck
pnpm depcheck
pnpm test
pnpm build
```

新增脚本：

```json
{
  "scripts": {
    "depcheck": "dependency-cruiser --config .dependency-cruiser.cjs packages apps examples internal",
    "depgraph": "dependency-cruiser --config .dependency-cruiser.cjs --output-type dot packages | dot -T svg > dependency-graph.svg"
  }
}
```

CI 阶段：

```yaml
- name: Install dependencies
  run: pnpm install --frozen-lockfile

- name: Lint
  run: pnpm lint

- name: Typecheck
  run: pnpm typecheck

- name: Dependency boundary check
  run: pnpm depcheck

- name: Test
  run: pnpm test

- name: Build
  run: pnpm build
```

设计动机：

> 依赖边界检查必须进入 CI，否则规则只会在本地偶尔执行，无法形成团队约束。

### 13.12 违规示例与修复方式

#### 违规一：Core 依赖 Vue

错误：

```ts
// packages/core/src/theme/use-theme.ts
import { ref } from 'vue'
```

修复：

```txt
core 只保留 createTheme、parseToken、generateCssVars 等纯函数；
Vue 响应式封装放到 packages/hooks/use-theme。
```

#### 违规二：Input 依赖 Form

错误：

```ts
// packages/components/input/src/input.vue
import { formContextKey } from '../../form/src/context'
```

修复：

```txt
把 formContextKey 和 useFormItem 抽到 packages/hooks/use-form-item；
Form provide，Input 通过 hook 可选消费。
```

#### 违规三：组件依赖 Pro 组件

错误：

```ts
// packages/components/table/src/table.vue
import { useProTableQuery } from '@company/ui-pro-components'
```

修复：

```txt
Table 保持纯展示和交互；
ProTable 组合 Table，并注入查询、分页、工具栏能力。
```

#### 违规四：运行时代码依赖构建工具

错误：

```ts
// packages/vue/src/resolver.ts
import { componentMeta } from '@company/ui-build'
```

修复：

```txt
构建阶段生成 resolver 静态产物；
运行时代码只读取生成后的 JSON 或 TS 常量，不依赖 build 包。
```

### 13.13 架构治理分级

建议将规则分成三类：

| 等级 | 含义 | 处理方式 |
|---|---|---|
| Error | 破坏架构边界 | CI 阻断 |
| Warning | 可能影响维护性 | 本地提示，定期治理 |
| Info | 依赖图观察项 | 生成报告，不阻断 |

Error 规则：

- 循环依赖；
- Core 依赖框架；
- 基础组件依赖业务组件；
- Runtime 依赖 Build；
- 跨包 src 深路径导入。

Warning 规则：

- 单个组件依赖过多；
- `_internal` 模块过大；
- 某个包出度或入度异常；
- docs 直接依赖内部未发布模块。

Info 规则：

- 生成依赖图；
- 统计各包体积；
- 统计组件之间共享模块数量。

### 13.14 第一阶段落地步骤

建议按以下顺序落地：

```txt
Step 1: 定义包分层表
Step 2: 在 package.json 中补齐 workspace:* 依赖
Step 3: 配置 TypeScript references
Step 4: 接入 ESLint import/no-cycle 和 no-restricted-imports
Step 5: 接入 dependency-cruiser
Step 6: 为 core/components/vue/pro-components 写第一批 forbidden 规则
Step 7: 加入 pnpm depcheck 脚本
Step 8: 在 CI 中阻断 error 级依赖违规
Step 9: 输出 dependency graph 作为架构评审材料
```

### 13.15 第一阶段验收标准

完成后应满足：

```txt
pnpm depcheck 成功
pnpm lint 成功
pnpm typecheck 成功
core 中无法 import vue
components 中无法 import pro-components
runtime 包无法 import build 包
跨包 src 深路径导入会报错
组件循环依赖会报错
CI 能阻断依赖违规 PR
可以生成 dependency-graph.svg
```

### 13.16 架构能力表达点

在架构评审中，这一节可以这样表达：

> 我不会只在文档里规定分层，而会用 dependency-cruiser、ESLint、TypeScript references 和 pnpm workspace 把分层变成可执行规则。Core 层不能依赖框架，基础组件不能依赖业务组件，运行时代码不能依赖构建工具，跨包不能导入私有 src 路径，循环依赖会在 CI 阶段被阻断。这样组件库规模变大后，架构边界仍然可以被持续治理，而不是依赖人工 review 记忆。

---

## 14. 组件标准目录与生成器规范

本节目标是定义“新增一个组件”时的标准结构、文件职责、导出方式、类型规范、样式入口、测试文档和自动生成流程。

设计原则：

> 企业级组件库不能靠每个开发者自由发挥目录结构。组件越多，越需要用统一模板保证一致性、可测试性、可维护性和可构建性。

### 14.1 组件分级标准

组件分为四类：

```txt
1. Basic 基础组件
2. Form 表单组件
3. Data 数据展示组件
4. Feedback / Overlay 反馈与浮层组件
```

对应示例：

| 类型 | 组件 | 特点 |
|---|---|---|
| Basic | Button / Icon / Divider / Text | API 简单，依赖少 |
| Form | Input / Select / Checkbox / DatePicker / Form | 需要 modelValue、校验、状态联动 |
| Data | Table / Tree / List / Pagination | 泛型类型复杂，slot scope 多 |
| Feedback / Overlay | Dialog / Drawer / Message / Tooltip / Popover | 涉及 Teleport、z-index、focus、滚动锁定 |

为什么要分级：

> 不同组件复杂度不同，测试重点、类型设计和内部依赖也不同。Button 和 Table 不应该用同一套复杂度标准要求，但它们必须共享同一套目录和导出规范。

### 14.2 标准组件目录结构

以 `button` 为例：

```txt
packages/components/button/
├─ src/
│  ├─ button.vue
│  ├─ button.ts
│  ├─ types.ts
│  ├─ constants.ts
│  └─ use-button.ts
├─ style/
│  ├─ index.ts
│  ├─ css.ts
│  └─ button.scss
├─ __tests__/
│  ├─ button.test.ts
│  ├─ button.type.test-d.ts
│  └─ button.visual.spec.ts
├─ docs/
│  ├─ basic.vue
│  ├─ disabled.vue
│  ├─ loading.vue
│  └─ index.md
└─ index.ts
```

说明：

| 文件 | 职责 |
|---|---|
| `src/button.vue` | 组件模板、渲染结构和组合逻辑 |
| `src/button.ts` | Vue props、emits、slots 辅助声明 |
| `src/types.ts` | 对外导出的 TS 类型 |
| `src/constants.ts` | 组件私有常量 |
| `src/use-button.ts` | 组件内部组合逻辑 |
| `style/button.scss` | 组件 SCSS 源码 |
| `style/index.ts` | 引入完整 SCSS 样式 |
| `style/css.ts` | 引入构建后的 CSS 样式 |
| `__tests__/button.test.ts` | 单元测试 |
| `__tests__/button.type.test-d.ts` | 类型测试 |
| `__tests__/button.visual.spec.ts` | 可视化回归或交互测试 |
| `docs/*.vue` | 文档示例 |
| `docs/index.md` | 组件文档正文 |
| `index.ts` | 组件公开入口 |

设计动机：

> 组件目录必须同时服务源码维护、样式构建、类型导出、测试、文档和按需引入。把这些文件固定下来，后续才能自动生成、自动构建和自动校验。

### 14.3 最小组件目录与完整组件目录

不是所有组件一开始都需要完整文件。

最小结构：

```txt
button/
├─ src/
│  ├─ button.vue
│  └─ button.ts
├─ style/
│  ├─ index.ts
│  └─ button.scss
├─ __tests__/
│  └─ button.test.ts
└─ index.ts
```

复杂组件结构：

```txt
table/
├─ src/
│  ├─ table.vue
│  ├─ table.ts
│  ├─ types.ts
│  ├─ constants.ts
│  ├─ context.ts
│  ├─ use-columns.ts
│  ├─ use-selection.ts
│  ├─ use-sorter.ts
│  ├─ use-filter.ts
│  └─ use-scroll.ts
├─ style/
│  ├─ index.ts
│  ├─ css.ts
│  └─ table.scss
├─ __tests__/
├─ docs/
└─ index.ts
```

规则：

- 简单组件不强制拆很多文件；
- 复杂组件必须把状态、上下文、计算逻辑拆到 composables；
- 所有组件必须有 `index.ts` 和 `style/index.ts`；
- 对外类型必须从组件入口显式导出。

### 14.4 组件入口 `index.ts` 规范

示例：

```ts
import Button from './src/button.vue'
import { withInstall } from '@company/ui-utils'

export const UiButton = withInstall(Button)
export default UiButton

export * from './src/button'
export type * from './src/types'
```

设计说明：

- `UiButton` 是命名导出；
- `default` 导出方便局部注册；
- `withInstall` 为组件挂载 `install` 方法；
- props、emits、类型从入口统一导出。

对应使用：

```ts
import { UiButton } from '@company/ui-vue/button'
```

或者：

```ts
import UiButton from '@company/ui-vue/button'
```

命名规则：

```txt
组件目录：button
组件文件：button.vue
组件名：UiButton
导出名：UiButton
样式类名：ui-button
```

### 14.5 `withInstall` 设计

工具函数放在 `@company/ui-utils`：

```ts
import type { App, Plugin } from 'vue'

export type SFCWithInstall<T> = T & Plugin

export function withInstall<T extends { name?: string }>(component: T): SFCWithInstall<T> {
  const install = (app: App) => {
    if (!component.name) return
    app.component(component.name, component)
  }

  return Object.assign(component, { install })
}
```

设计动机：

> 每个组件都可以单独 `app.use(UiButton)`，同时也可以被总入口批量注册。

注意：

- `withInstall` 是 Vue 相关工具，严格来说不应放到框架无关 `utils`；
- 更严谨的拆法是放到 `packages/vue/src/utils/with-install.ts`；
- 如果 `@company/ui-utils` 目标是完全框架无关，则 `withInstall` 应放到 `@company/ui-vue` 或 `@company/ui-hooks`。

推荐最终选择：

```txt
packages/vue/src/utils/with-install.ts
```

原因：

> `withInstall` 依赖 Vue 的 `App` 和 `Plugin` 类型，属于 Vue Adapter 能力，不应该污染通用 utils。

### 14.6 Props 文件规范

`src/button.ts`：

```ts
import type { ExtractPropTypes, PropType } from 'vue'
import type { ComponentSize } from '@company/ui-core'

export const buttonTypes = [
  'default',
  'primary',
  'success',
  'warning',
  'danger'
] as const

export type ButtonType = typeof buttonTypes[number]

export const buttonProps = {
  type: {
    type: String as PropType<ButtonType>,
    default: 'default'
  },
  size: {
    type: String as PropType<ComponentSize>,
    default: 'medium'
  },
  disabled: Boolean,
  loading: Boolean,
  nativeType: {
    type: String as PropType<'button' | 'submit' | 'reset'>,
    default: 'button'
  }
} as const

export type ButtonProps = ExtractPropTypes<typeof buttonProps>
```

设计规范：

- 字面量枚举使用 `as const` 数组；
- 运行时 props 和静态类型保持同源；
- 公共类型从 `@company/ui-core` 引入；
- 组件私有类型在当前组件目录中定义；
- 不在 `.vue` 文件中直接内联复杂 props。

### 14.7 Emits 规范

`src/button.ts`：

```ts
export const buttonEmits = {
  click: (event: MouseEvent) => event instanceof MouseEvent
}

export type ButtonEmits = typeof buttonEmits
```

复杂组件示例：

```ts
export const inputEmits = {
  'update:modelValue': (value: string | number) => ['string', 'number'].includes(typeof value),
  input: (value: string | number) => ['string', 'number'].includes(typeof value),
  change: (value: string | number) => ['string', 'number'].includes(typeof value),
  focus: (event: FocusEvent) => event instanceof FocusEvent,
  blur: (event: FocusEvent) => event instanceof FocusEvent
}
```

命名规则：

```txt
v-model：update:modelValue
值变化：change
输入中：input
聚焦：focus
失焦：blur
显隐：visible-change
选择：select
清空：clear
确认：confirm
取消：cancel
```

设计动机：

> Emits 是组件行为协议，命名统一后，用户在不同组件之间迁移成本更低。

### 14.8 Slots 类型规范

简单组件：

```ts
export interface ButtonSlots {
  default?: () => unknown
  icon?: () => unknown
  loading?: () => unknown
}
```

复杂组件：

```ts
export interface TableSlots<T = Record<string, unknown>> {
  default?: () => unknown
  cell?: (scope: { row: T; column: TableColumn<T>; index: number }) => unknown
  header?: (scope: { column: TableColumn<T>; index: number }) => unknown
  empty?: () => unknown
}
```

规范：

- slot 名称必须在文档中列出；
- slot scope 必须导出类型；
- 数据组件优先支持泛型；
- 不要用 `any` 描述 slot scope。

设计动机：

> 企业级组件库的类型体验主要体现在复杂组件 slot scope 上，尤其是 Table、Form、Tree 这类组件。

### 14.9 组件 `.vue` 文件规范

示例：

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { buttonEmits, buttonProps } from './button'
import { useNamespace } from '@company/ui-hooks'

const props = defineProps(buttonProps)
const emit = defineEmits(buttonEmits)

const ns = useNamespace('button')

const classes = computed(() => [
  ns.b(),
  ns.m(props.type),
  ns.m(props.size),
  ns.is('disabled', props.disabled),
  ns.is('loading', props.loading)
])

function handleClick(event: MouseEvent) {
  if (props.disabled || props.loading) return
  emit('click', event)
}
</script>

<template>
  <button
    :class="classes"
    :type="nativeType"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <slot name="loading" v-if="loading" />
    <slot name="icon" v-else />
    <span :class="ns.e('content')">
      <slot />
    </span>
  </button>
</template>
```

规范：

- props / emits 从同目录 `.ts` 文件导入；
- class 通过 `useNamespace` 生成；
- 不在模板里写复杂表达式；
- 事件处理函数要保持短小；
- DOM 可访问性属性要在组件内统一处理；
- 不在组件中写业务逻辑。

### 14.10 样式目录规范

`style/index.ts`：

```ts
import './button.scss'
```

`style/css.ts`：

```ts
import '@company/ui-theme/button.css'
```

`style/button.scss`：

```scss
@use '@company/ui-theme/src/scss/mixins' as *;

@include b(button) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: var(--ui-button-height);
  padding: 0 var(--ui-button-padding-x);
  color: var(--ui-button-text-color);
  background: var(--ui-button-bg);
  border: 1px solid var(--ui-button-border-color);
  border-radius: var(--ui-border-radius-base);

  @include m(primary) {
    --ui-button-bg: var(--ui-color-primary);
    --ui-button-text-color: var(--ui-color-white);
    --ui-button-border-color: var(--ui-color-primary);
  }

  @include when(disabled) {
    cursor: not-allowed;
    opacity: 0.6;
  }
}
```

设计说明：

- `index.ts` 面向源码 SCSS；
- `css.ts` 面向构建后 CSS；
- resolver 可根据 `importStyle: 'sass' | 'css' | false` 选择入口；
- 样式类名统一通过 namespace 生成。

### 14.11 BEM 与 namespace 规范

推荐类名：

```txt
.ui-button
.ui-button__content
.ui-button--primary
.is-disabled
.is-loading
```

`useNamespace('button')` 输出：

```ts
ns.b()              // ui-button
ns.e('content')    // ui-button__content
ns.m('primary')    // ui-button--primary
ns.is('disabled')  // is-disabled
```

设计动机：

> BEM 解决组件内部结构命名，namespace 解决组件库与业务样式冲突。

预留能力：

```ts
app.use(Ui, {
  namespace: 'acme'
})
```

输出：

```txt
.acme-button
.acme-button__content
```

### 14.12 测试规范

单元测试示例：

```ts
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { UiButton } from '../index'

describe('Button', () => {
  it('renders default slot', () => {
    const wrapper = mount(UiButton, {
      slots: {
        default: 'Submit'
      }
    })

    expect(wrapper.text()).toContain('Submit')
  })

  it('emits click event', async () => {
    const wrapper = mount(UiButton)

    await wrapper.trigger('click')

    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('does not emit click when disabled', async () => {
    const wrapper = mount(UiButton, {
      props: {
        disabled: true
      }
    })

    await wrapper.trigger('click')

    expect(wrapper.emitted('click')).toBeUndefined()
  })
})
```

每个基础组件至少覆盖：

```txt
渲染默认内容
props 状态
emits 行为
slots 渲染
disabled / loading 等边界状态
class name 是否符合规范
```

复杂组件额外覆盖：

```txt
键盘交互
焦点管理
异步显隐
Teleport
滚动锁定
表单联动
泛型类型推导
```

### 14.13 类型测试规范

使用 `tsd` 或 `expect-type`。

示例：

```ts
import { expectTypeOf } from 'expect-type'
import type { ButtonProps, ButtonType } from '../index'

expectTypeOf<ButtonType>().toEqualTypeOf<
  'default' | 'primary' | 'success' | 'warning' | 'danger'
>()

expectTypeOf<ButtonProps['disabled']>().toEqualTypeOf<boolean | undefined>()
```

设计动机：

> 组件库不仅要测试运行时行为，也要测试对用户暴露的类型契约。

### 14.14 文档规范

每个组件文档至少包含：

```txt
基础用法
不同状态
不同尺寸
禁用状态
事件说明
Slots 说明
Props 表格
Emits 表格
样式变量
可访问性说明
```

文档结构：

```md
# Button 按钮

## 何时使用

## 基础用法

## 类型

## 尺寸

## 禁用状态

## 加载状态

## API

### Props

### Emits

### Slots

### CSS Variables

## Accessibility
```

设计动机：

> 企业组件库的推广成本很大程度取决于文档质量。文档模板固定后，组件使用体验才能稳定。

### 14.15 组件元数据规范

每个组件应生成元数据：

```ts
export interface ComponentMeta {
  name: string
  kebabName: string
  title: string
  category: 'basic' | 'form' | 'data' | 'feedback' | 'navigation' | 'layout'
  props: string[]
  events: string[]
  slots: string[]
  style: {
    css: string
    scss: string
  }
}
```

Button 示例：

```ts
export const buttonMeta: ComponentMeta = {
  name: 'UiButton',
  kebabName: 'ui-button',
  title: '按钮',
  category: 'basic',
  props: ['type', 'size', 'disabled', 'loading', 'nativeType'],
  events: ['click'],
  slots: ['default', 'icon', 'loading'],
  style: {
    css: '@company/ui-theme/button.css',
    scss: '@company/ui-vue/button/style'
  }
}
```

用途：

- 生成 resolver；
- 生成文档 API 表格；
- 生成全局类型声明；
- 生成组件列表；
- 生成按需引入映射。

设计动机：

> 组件元数据是连接源码、文档、构建和生态工具的桥梁。

### 14.16 生成器设计

建议放在：

```txt
internal/generators/component
```

生成器输入：

```txt
pnpm gen:component button --category basic --title 按钮
```

生成内容：

```txt
packages/components/button/src/button.vue
packages/components/button/src/button.ts
packages/components/button/src/types.ts
packages/components/button/style/index.ts
packages/components/button/style/css.ts
packages/components/button/style/button.scss
packages/components/button/__tests__/button.test.ts
packages/components/button/__tests__/button.type.test-d.ts
packages/components/button/docs/basic.vue
packages/components/button/docs/index.md
packages/components/button/index.ts
```

同时更新：

```txt
packages/components/index.ts
packages/vue/src/components.ts
packages/vue/src/resolver-meta.ts
apps/docs/sidebar.ts
```

设计动机：

> 新增组件时最容易遗漏入口、样式、类型和文档。生成器的价值是把“规范”变成“默认行为”。

### 14.17 生成器模板变量

模板变量：

```ts
interface ComponentGeneratorOptions {
  name: string
  pascalName: string
  kebabName: string
  camelName: string
  title: string
  category: string
  hasModel: boolean
  hasSlots: boolean
  hasStyle: boolean
  hasTests: boolean
}
```

示例转换：

```txt
button → UiButton → ui-button → button
query-filter → UiQueryFilter → ui-query-filter → queryFilter
```

命名规则：

- 文件名使用 kebab-case；
- 组件名使用 PascalCase，并带 `Ui` 前缀；
- JS 变量使用 camelCase；
- CSS 类名使用 namespace + kebab-case。

### 14.18 组件新增流程

推荐流程：

```txt
Step 1: 运行生成器
Step 2: 完成 props / emits / slots 设计
Step 3: 实现组件模板和样式
Step 4: 补充单元测试
Step 5: 补充类型测试
Step 6: 补充文档示例
Step 7: 在 playground 中验证
Step 8: 检查按需引入
Step 9: 检查构建产物
Step 10: 提交 changeset
```

每一步的目的：

| 步骤 | 目的 |
|---|---|
| 生成器 | 保证结构一致 |
| API 设计 | 避免边写边改导致破坏性变更 |
| 实现 | 保持组件逻辑内聚 |
| 单测 | 保证行为正确 |
| 类型测试 | 保证 TS 契约正确 |
| 文档 | 保证使用体验 |
| Playground | 保证真实运行 |
| 按需引入 | 保证 Tree-shaking |
| 构建产物 | 保证发布可用 |
| changeset | 保证版本记录 |

### 14.19 第一阶段 Button 样板验收标准

Button 作为第一个组件样板，必须满足：

```txt
组件可渲染默认 slot
支持 type / size / disabled / loading / nativeType
click emit 行为正确
disabled 和 loading 状态下不触发 click
样式类名符合 namespace + BEM 规范
支持独立样式入口
支持全量注册
支持局部 app.use(UiButton)
支持手动按需引入
支持 resolver 自动按需引入
Props / Emits / Slots 类型可导出
文档可以展示基础用法、类型、尺寸、禁用、加载状态
单测通过
类型测试通过
构建后产物包含 ESM、CJS、DTS、CSS
```

### 14.20 常见设计陷阱

#### 陷阱一：所有组件都从根入口导出

问题：

```ts
import { UiButton } from '@company/ui-vue'
```

如果根入口有副作用，可能影响 Tree-shaking。

修复：

```ts
import { UiButton } from '@company/ui-vue/button'
```

#### 陷阱二：类型只写在 `.vue` 文件里

问题：

- 外部难以复用；
- 文档难以生成；
- 类型测试难写。

修复：

```txt
props / emits / slots 类型抽到 src/button.ts 和 src/types.ts。
```

#### 陷阱三：组件样式直接写死颜色

问题：

```scss
background: #1677ff;
```

修复：

```scss
background: var(--ui-color-primary);
```

#### 陷阱四：业务字段进入基础组件

问题：

```ts
permissionCode: String
trackEventName: String
```

修复：

```txt
权限交给 v-permission 或业务层组件；
埋点交给指令、插件或业务封装。
```

### 14.21 架构能力表达点

在架构评审中，这一节可以这样表达：

> 我会把组件定义成标准工程单元，而不是单个 Vue 文件。每个组件都有源码、props/emits/slots 类型、样式入口、测试、文档、元数据和公开导出。新增组件通过生成器创建，自动补齐入口、样式、文档和 resolver 元数据。这样组件库规模扩大后，仍然能保持一致的 API 风格、构建产物、按需引入能力和文档体验。

---

## 15. 构建、按需引入与发包方案

本节目标是细化组件库从源码到发布包的完整链路，包括 ESM/CJS/DTS/CSS 产物、`exports`、`sideEffects`、按需引入、Tree-shaking、resolver 生成和 Changesets 发版。

设计原则：

> 组件库构建不是简单地把源码编译成 JS，而是要同时服务全量引入、手动按需引入、自动按需引入、类型提示、样式加载、文档站、测试环境和 npm 发布。

### 15.1 构建目标

第一阶段构建需要满足：

```txt
1. 输出 ESM，支持现代构建工具 Tree-shaking
2. 输出 CJS，兼容部分 Node / SSR / 老工具链
3. 输出 DTS，保证 TypeScript 用户体验
4. 输出按组件拆分的 CSS
5. 输出完整主题 CSS
6. 输出 resolver 元数据
7. 输出全局组件类型声明
8. 保留 package exports，避免用户访问私有路径
```

对应产物：

```txt
packages/vue/dist/
├─ es/
│  ├─ index.js
│  ├─ index.d.ts
│  ├─ button/
│  │  ├─ index.js
│  │  └─ index.d.ts
│  └─ input/
│     ├─ index.js
│     └─ index.d.ts
├─ lib/
│  ├─ index.cjs
│  ├─ button/
│  │  └─ index.cjs
│  └─ input/
│     └─ index.cjs
├─ theme/
│  ├─ index.css
│  ├─ button.css
│  ├─ input.css
│  └─ dark.css
├─ resolver/
│  ├─ index.js
│  └─ index.d.ts
└─ global.d.ts
```

设计动机：

> 不同用户的接入方式不同。好的组件库必须让“全量引入简单，按需引入可靠，自动导入省心，类型提示完整”。

### 15.2 构建工具选型

推荐组合：

```txt
Vite library mode + Rollup + tsup + vue-tsc + sass
```

分工：

| 工具 | 职责 |
|---|---|
| Vite / Rollup | 构建 Vue SFC 组件和 ESM/CJS 产物 |
| tsup | 构建纯 TS 工具包，如 core/utils/build |
| vue-tsc | 生成 Vue 组件 DTS 类型 |
| sass | 编译 SCSS 到 CSS |
| postcss | autoprefixer、压缩、未来可接入 logical properties |
| fast-glob | 扫描组件入口 |
| unplugin-vue-components resolver | 自动按需引入 |

为什么不是全部用 tsup：

> tsup 很适合纯 TS 包，但 Vue SFC、样式拆分、组件级入口和类型生成更适合交给 Vite/Rollup/vue-tsc 组合处理。

为什么不是全部用 Vite：

> core、utils、build 这类纯 TS 包用 tsup 更轻量，构建速度更快，配置更简单。

推荐策略：

```txt
纯 TS 包：tsup
Vue 组件包：Vite/Rollup + vue-tsc
样式包：sass + postcss
类型声明：vue-tsc + tsc 或 rollup-plugin-dts
```

### 15.3 包构建分工

| 包 | 构建工具 | 产物 |
|---|---|---|
| `@company/ui-core` | tsup | ESM / CJS / DTS |
| `@company/ui-utils` | tsup | ESM / CJS / DTS |
| `@company/ui-theme` | sass + tsup | CSS / SCSS / token JS / DTS |
| `@company/ui-icons` | svgo + vite/tsup | SVG components / metadata / DTS |
| `@company/ui-components` | Vite/Rollup + vue-tsc | Vue SFC ESM / CJS / DTS |
| `@company/ui-vue` | Vite/Rollup + vue-tsc | 总入口 / 组件入口 / resolver / global.d.ts |
| `@company/ui-pro-components` | Vite/Rollup + vue-tsc | Pro 组件产物 |
| `@company/ui-build` | tsup | CLI / scripts，不对外运行时使用 |

设计动机：

> 不同包的源码形态不同，不应该强行用同一个构建工具。构建工具要服务包职责，而不是反过来让包迁就工具。

### 15.4 构建入口生成

组件入口不能长期手写，应由构建脚本生成。

源码结构：

```txt
packages/components/
├─ button/index.ts
├─ input/index.ts
├─ select/index.ts
└─ index.ts
```

生成 `packages/components/index.ts`：

```ts
export * from './button'
export * from './input'
export * from './select'
```

生成 `packages/vue/src/components.ts`：

```ts
import { UiButton } from '@company/ui-components/button'
import { UiInput } from '@company/ui-components/input'
import { UiSelect } from '@company/ui-components/select'

export const components = [
  UiButton,
  UiInput,
  UiSelect
]
```

生成 `packages/vue/src/index.ts`：

```ts
export * from '@company/ui-components'
export * from './install'
export * from './config-provider'
```

设计动机：

> 手写入口在组件数量增长后一定会遗漏。入口生成是组件库工程化的基础能力。

### 15.5 ESM 与 CJS 输出策略

ESM 输出：

```txt
dist/es/index.js
dist/es/button/index.js
```

CJS 输出：

```txt
dist/lib/index.cjs
dist/lib/button/index.cjs
```

推荐原则：

- ESM 是主要产物；
- CJS 是兼容产物；
- package `exports.import` 指向 ESM；
- package `exports.require` 指向 CJS；
- 内部源码尽量保持 ESM；
- 不在 CJS 中引入额外 polyfill。

示例：

```json
{
  "main": "dist/lib/index.cjs",
  "module": "dist/es/index.js",
  "exports": {
    ".": {
      "types": "./dist/es/index.d.ts",
      "import": "./dist/es/index.js",
      "require": "./dist/lib/index.cjs"
    }
  }
}
```

设计动机：

> 现代前端项目优先使用 ESM，但企业环境中仍可能有 SSR、Node 脚本或旧构建链需要 CJS。

### 15.6 Package Exports 设计

`@company/ui-vue` 推荐：

```json
{
  "exports": {
    ".": {
      "types": "./dist/es/index.d.ts",
      "import": "./dist/es/index.js",
      "require": "./dist/lib/index.cjs"
    },
    "./button": {
      "types": "./dist/es/button/index.d.ts",
      "import": "./dist/es/button/index.js",
      "require": "./dist/lib/button/index.cjs"
    },
    "./input": {
      "types": "./dist/es/input/index.d.ts",
      "import": "./dist/es/input/index.js",
      "require": "./dist/lib/input/index.cjs"
    },
    "./resolver": {
      "types": "./dist/resolver/index.d.ts",
      "import": "./dist/resolver/index.js"
    },
    "./global": {
      "types": "./dist/global.d.ts"
    },
    "./theme/index.css": "./dist/theme/index.css",
    "./theme/button.css": "./dist/theme/button.css"
  }
}
```

设计规则：

```txt
只暴露稳定公共入口
不暴露 src 私有路径
每个组件都有独立 subpath export
样式有明确 CSS subpath
resolver 独立导出
全局类型独立导出
```

设计动机：

> `exports` 是 npm 包的公共 API 边界。没有 exports，用户很容易依赖内部路径，未来重构会产生破坏性变更。

### 15.7 `sideEffects` 设计

基础纯 TS 包：

```json
{
  "sideEffects": false
}
```

组件包：

```json
{
  "sideEffects": [
    "**/*.css",
    "**/*.scss",
    "**/style/index.ts",
    "**/style/css.ts"
  ]
}
```

为什么不能简单写 `sideEffects: false`：

> 如果组件样式通过 JS 入口导入，错误地声明 `sideEffects: false` 可能导致构建工具把样式删掉。

为什么不能完全不写：

> 不写 `sideEffects` 会降低 Tree-shaking 效果，构建工具会保守保留更多模块。

推荐策略：

```txt
JS/TS 逻辑尽量无副作用
样式入口明确声明副作用
根入口不自动导入全量样式
全量样式由用户显式 import
```

### 15.8 样式构建策略

样式源码：

```txt
packages/theme/src/
├─ scss/
│  ├─ common/
│  ├─ mixins/
│  ├─ base.scss
│  └─ vars.scss
├─ components/
│  ├─ button.scss
│  ├─ input.scss
│  └─ select.scss
└─ index.scss
```

构建产物：

```txt
packages/theme/dist/
├─ index.css
├─ base.css
├─ button.css
├─ input.css
├─ select.css
├─ dark.css
└─ compact.css
```

样式入口：

```ts
// packages/components/button/style/index.ts
import '@company/ui-theme/src/components/button.scss'

// packages/components/button/style/css.ts
import '@company/ui-theme/button.css'
```

全量样式：

```ts
import '@company/ui-theme/index.css'
```

按需样式：

```ts
import '@company/ui-theme/button.css'
```

设计动机：

> 样式必须和组件一样支持按需加载，否则 JS Tree-shaking 成功了，CSS 仍然可能全量进入业务项目。

### 15.9 按需引入方案

支持三种模式。

#### 模式一：全量引入

```ts
import { createApp } from 'vue'
import Ui from '@company/ui-vue'
import '@company/ui-theme/index.css'

createApp(App).use(Ui)
```

适合：

- 内部后台；
- 快速接入；
- 对包体积不敏感。

#### 模式二：手动按需引入

```ts
import { UiButton } from '@company/ui-vue/button'
import '@company/ui-theme/button.css'
```

适合：

- 对体积敏感；
- 不想依赖自动导入插件；
- SSR 或特殊构建环境。

#### 模式三：自动按需引入

```ts
import Components from 'unplugin-vue-components/vite'
import { CompanyUiResolver } from '@company/ui-vue/resolver'

export default {
  plugins: [
    Components({
      resolvers: [
        CompanyUiResolver({ importStyle: 'css' })
      ]
    })
  ]
}
```

业务代码：

```vue
<template>
  <UiButton type="primary">Submit</UiButton>
</template>
```

自动生成：

```ts
import { UiButton } from '@company/ui-vue/button'
import '@company/ui-theme/button.css'
```

设计动机：

> 自动按需引入是企业内部推广组件库的关键能力。用户只写组件标签，构建插件负责导入 JS 和 CSS。

### 15.10 Resolver 设计

Resolver 输入元数据：

```ts
export const componentResolverMeta = [
  {
    name: 'UiButton',
    from: '@company/ui-vue/button',
    styleName: 'button'
  },
  {
    name: 'UiInput',
    from: '@company/ui-vue/input',
    styleName: 'input'
  }
]
```

Resolver 实现：

```ts
export interface CompanyUiResolverOptions {
  importStyle?: 'css' | 'sass' | false
  prefix?: string
}

export function CompanyUiResolver(options: CompanyUiResolverOptions = {}) {
  const { importStyle = 'css', prefix = 'Ui' } = options

  return {
    type: 'component' as const,
    resolve(name: string) {
      if (!name.startsWith(prefix)) return

      const meta = componentResolverMeta.find((item) => item.name === name)
      if (!meta) return

      const sideEffects =
        importStyle === 'css'
          ? `@company/ui-theme/${meta.styleName}.css`
          : importStyle === 'sass'
            ? `@company/ui-vue/${meta.styleName}/style`
            : undefined

      return {
        name,
        from: meta.from,
        sideEffects
      }
    }
  }
}
```

设计说明：

- resolver 不应运行时扫描文件系统；
- resolver 元数据应由构建脚本生成；
- resolver 支持 `css`、`sass` 和 `false`；
- resolver 支持自定义前缀，方便企业内部命名体系。

### 15.11 Tree-shaking 验证方案

必须验证，而不是假设 Tree-shaking 生效。

推荐建立示例：

```txt
examples/tree-shaking/
├─ package.json
├─ vite.config.ts
└─ src/App.vue
```

只使用 Button：

```vue
<template>
  <UiButton>Button</UiButton>
</template>
```

构建后检查：

```txt
dist assets 中不应出现 input/select/table 组件逻辑
dist css 中不应出现 input/select/table 样式
bundle analyzer 中只包含 Button 及其依赖
```

脚本：

```json
{
  "scripts": {
    "test:treeshake": "pnpm --filter ./examples/tree-shaking build && node internal/scripts/check-treeshake.js"
  }
}
```

设计动机：

> Tree-shaking 是构建结果，不是 package.json 写了 sideEffects 就一定成功。必须用示例项目验证最终 bundle。

### 15.12 类型声明生成

类型产物包括三类：

```txt
1. 每个包的 index.d.ts
2. 每个组件入口的 index.d.ts
3. Vue GlobalComponents 全局声明
```

组件入口类型：

```txt
dist/es/button/index.d.ts
```

全局类型：

```ts
declare module 'vue' {
  export interface GlobalComponents {
    UiButton: typeof import('@company/ui-vue/button')['UiButton']
    UiInput: typeof import('@company/ui-vue/input')['UiInput']
  }
}

export {}
```

`package.json` 暴露：

```json
{
  "exports": {
    "./global": {
      "types": "./dist/global.d.ts"
    }
  }
}
```

用户使用：

```ts
// tsconfig.json
{
  "compilerOptions": {
    "types": ["@company/ui-vue/global"]
  }
}
```

设计动机：

> 全局注册组件后，模板里仍然应该有类型提示。全局类型声明是企业组件库提升 DX 的关键细节。

### 15.13 版本管理策略

推荐使用 Changesets。

初始化：

```txt
pnpm changeset init
```

日常流程：

```txt
Step 1: 修改组件或包
Step 2: pnpm changeset
Step 3: 选择受影响 package
Step 4: 选择 semver 类型
Step 5: 填写变更说明
Step 6: 合并后执行 version
Step 7: 构建并发布
```

版本类型：

| 类型 | 场景 |
|---|---|
| patch | bugfix、样式修复、文档修正、不破坏 API 的内部优化 |
| minor | 新组件、新 props、新能力、向后兼容增强 |
| major | 删除 API、重命名 props、改变默认行为、破坏主题变量 |

设计动机：

> 多包组件库需要明确记录哪个包发生了什么变化。手写 changelog 和手工 bump version 很容易出错。

### 15.14 多包版本策略

两种策略：

| 策略 | 描述 | 优点 | 缺点 |
|---|---|---|---|
| Fixed version | 所有包同版本发布 | 用户理解简单，内部组件库更好推广 | 小改动也会导致所有包版本变化 |
| Independent version | 每个包独立版本 | 发布粒度细，变更准确 | 用户理解成本高，依赖组合复杂 |

第一阶段推荐：**Fixed version**。

原因：

- 企业内部推广更简单；
- 用户只需要记一个版本号；
- 组件库初期包之间联动多；
- 降低排查版本不兼容问题的成本。

后期可以评估：

```txt
核心基础包固定版本
图标包、Pro 组件包、工具包独立版本
```

### 15.15 预发布策略

推荐通道：

```txt
latest：稳定版本
next：下一版本候选
alpha：早期实验
beta：功能冻结测试
```

示例：

```txt
1.2.0-alpha.0
1.2.0-beta.0
1.2.0-next.0
1.2.0
```

使用：

```txt
pnpm changeset pre enter alpha
pnpm version
pnpm release --tag alpha
pnpm changeset pre exit
```

设计动机：

> 企业组件库的新组件、新主题系统或 Table/Form 这类核心组件变更，不应该直接进入 latest，应该先让试点项目验证。

### 15.16 发包前校验

发布前必须执行：

```txt
pnpm lint
pnpm typecheck
pnpm test
pnpm depcheck
pnpm build
pnpm test:treeshake
pnpm test:e2e
```

发包前检查产物：

```txt
每个包 dist 存在
每个公开 exports 都能 resolve
每个组件入口都有 d.ts
每个组件样式入口存在
sideEffects 设置正确
peerDependencies 设置正确
没有 src 私有路径被暴露给用户文档
```

建议脚本：

```json
{
  "scripts": {
    "prepublish:check": "pnpm lint && pnpm typecheck && pnpm depcheck && pnpm test && pnpm build && pnpm test:treeshake"
  }
}
```

### 15.17 发布流程

推荐流程：

```txt
开发分支
  ↓
提交 changeset
  ↓
CI 校验
  ↓
合并 main
  ↓
changesets version PR
  ↓
生成 changelog 和 version bump
  ↓
CI 构建
  ↓
npm publish
  ↓
打 tag
  ↓
部署文档站
```

GitHub Actions 可分为两个 workflow：

```txt
pull-request.yml：lint / typecheck / test / build / depcheck
release.yml：changeset version / publish / docs deploy
```

设计动机：

> 发包是共享状态变更，必须可追踪、可回滚、可审计。不要在本地手工 npm publish。

### 15.18 SSR 与外部依赖处理

Vue 应作为 peer dependency：

```json
{
  "peerDependencies": {
    "vue": "^3.4.0"
  },
  "devDependencies": {
    "vue": "^3.4.0"
  }
}
```

Rollup external：

```ts
external: [
  'vue',
  /^@company\/ui-core/,
  /^@company\/ui-utils/,
  /^@company\/ui-theme/
]
```

设计动机：

- 避免打包多份 Vue；
- 保持内部包之间边界；
- 让用户项目决定最终依赖解析；
- SSR 场景下减少运行时冲突。

### 15.19 构建缓存与产物清理

每个包应有：

```json
{
  "scripts": {
    "clean": "rimraf dist",
    "build": "pnpm clean && vite build && vue-tsc -p tsconfig.json --emitDeclarationOnly"
  }
}
```

Turbo：

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "clean": {
      "cache": false
    }
  }
}
```

设计动机：

> 多包构建最常见的问题是旧产物残留和缓存误判。`clean` 与 `outputs` 必须明确。

### 15.20 第一阶段落地步骤

建议按以下顺序落地：

```txt
Step 1: 为 core/utils 配置 tsup 构建
Step 2: 为 theme 配置 sass 构建
Step 3: 为 components/vue 配置 Vite/Rollup 构建
Step 4: 生成组件级入口
Step 5: 生成 package exports
Step 6: 生成 resolver meta
Step 7: 生成 global.d.ts
Step 8: 配置 sideEffects
Step 9: 建立 tree-shaking 示例项目
Step 10: 接入 Changesets
Step 11: 接入 prepublish:check
Step 12: 接入 release workflow
```

### 15.21 第一阶段验收标准

完成后应满足：

```txt
@company/ui-core 输出 ESM/CJS/DTS
@company/ui-vue 输出全量入口和组件入口
@company/ui-theme 输出 index.css 和 button.css
@company/ui-vue/button 可单独 import
@company/ui-theme/button.css 可单独 import
resolver 能自动导入 Button 和样式
global.d.ts 可让模板识别 UiButton
sideEffects 不会误删 CSS
只使用 Button 的示例不会打入 Input/Select/Table
changeset 能生成版本和 changelog
prepublish:check 全部通过
```

### 15.22 常见设计陷阱

#### 陷阱一：根入口自动引入全量样式

问题：

```ts
// packages/vue/src/index.ts
import '@company/ui-theme/index.css'
```

风险：

> 用户即使只用 Button，也会引入全部 CSS。

修复：

```txt
根入口只导出 JS；
全量样式由用户显式 import；
resolver 按组件自动引入样式。
```

#### 陷阱二：组件入口没有 subpath exports

问题：

```ts
import { UiButton } from '@company/ui-vue'
```

无法保证稳定按需引入。

修复：

```json
{
  "exports": {
    "./button": {
      "import": "./dist/es/button/index.js",
      "types": "./dist/es/button/index.d.ts"
    }
  }
}
```

#### 陷阱三：错误设置 sideEffects

问题：

```json
{
  "sideEffects": false
}
```

如果样式通过 JS import，CSS 可能被删除。

修复：

```json
{
  "sideEffects": ["**/*.css", "**/*.scss", "**/style/*"]
}
```

#### 陷阱四：手工维护 exports

问题：

> 组件数量多后，容易遗漏组件入口或类型路径。

修复：

```txt
通过 component meta 自动生成 exports、resolver、global.d.ts 和 docs sidebar。
```

### 15.23 架构能力表达点

在架构评审中，这一节可以这样表达：

> 我会把组件库构建设计成多产物、多入口、多场景的发布体系。ESM 服务 Tree-shaking，CJS 服务兼容，DTS 服务类型体验，CSS 按组件拆分服务样式按需加载，exports 约束公共 API，sideEffects 保证样式不被误删，resolver 负责自动按需引入，Changesets 负责版本和 changelog。最终通过 tree-shaking 示例、prepublish check 和 CI 发布流程验证产物质量，而不是只停留在构建配置层面。

---

## 16. 主题 Token 系统设计

本节目标是细化组件库主题系统，包括 Token 分层、CSS Variable 生成、SCSS 组织、暗色模式、运行时换肤、多品牌主题、组件级 Token 和主题包产物。

推荐方案：

```txt
Design Token + SCSS + CSS Variables + Theme Algorithm + Runtime Theme API
```

设计原则：

> 主题系统不是换几个颜色，而是把设计语言抽象成稳定协议，再把协议转成 CSS 变量、SCSS 变量、JS Token 和运行时 API。

### 16.1 为什么需要 Token 系统

如果组件样式直接写死：

```scss
.ui-button {
  color: #ffffff;
  background: #1677ff;
  border-radius: 6px;
}
```

会带来问题：

```txt
1. 品牌色无法统一替换
2. 暗色模式需要重写大量样式
3. 多租户主题无法运行时切换
4. 设计稿和代码之间没有协议
5. 组件之间视觉规则不一致
6. 业务项目难以局部覆盖主题
```

Token 系统解决的是：

```txt
设计值从哪里来
如何派生完整色板
如何映射到语义变量
如何进入组件样式
如何运行时修改
如何让设计和代码同步
```

设计动机：

> 企业组件库的主题系统要服务品牌统一、租户定制、暗色模式、设计协同和长期维护，而不是只服务单次换肤。

### 16.2 Token 分层模型

推荐四层：

```txt
Seed Token
  ↓
Map Token
  ↓
Alias Token
  ↓
Component Token
```

#### Seed Token

Seed Token 是最原始的品牌输入。

```ts
export interface SeedToken {
  colorPrimary: string
  colorSuccess: string
  colorWarning: string
  colorError: string
  colorInfo: string
  fontSize: number
  borderRadius: number
  spacingUnit: number
}
```

示例：

```ts
export const defaultSeedToken: SeedToken = {
  colorPrimary: '#1677ff',
  colorSuccess: '#52c41a',
  colorWarning: '#faad14',
  colorError: '#ff4d4f',
  colorInfo: '#909399',
  fontSize: 14,
  borderRadius: 6,
  spacingUnit: 4
}
```

职责：

> Seed Token 表示品牌和设计基因，不直接进入大多数组件样式。

#### Map Token

Map Token 由 Seed Token 派生，主要解决色阶、字号阶梯、间距阶梯。

```ts
export interface MapToken {
  colorPrimaryBg: string
  colorPrimaryHover: string
  colorPrimaryActive: string
  colorPrimaryText: string
  colorSuccessBg: string
  colorWarningBg: string
  colorErrorBg: string
  fontSizeSm: number
  fontSizeMd: number
  fontSizeLg: number
  borderRadiusSm: number
  borderRadiusMd: number
  borderRadiusLg: number
  spacingXs: number
  spacingSm: number
  spacingMd: number
  spacingLg: number
}
```

职责：

> Map Token 把少量品牌输入扩展成系统可用的完整设计尺度。

#### Alias Token

Alias Token 是面向 UI 语义的变量。

```ts
export interface AliasToken {
  colorText: string
  colorTextSecondary: string
  colorTextDisabled: string
  colorBgPage: string
  colorBgContainer: string
  colorBgElevated: string
  colorBorder: string
  colorBorderSecondary: string
  colorFillHover: string
  colorFillActive: string
  boxShadow: string
  boxShadowSecondary: string
}
```

职责：

> Alias Token 让组件不直接关心品牌色，而是使用语义化变量。

例如：

```scss
.ui-card {
  color: var(--ui-color-text);
  background: var(--ui-color-bg-container);
  border: 1px solid var(--ui-color-border);
}
```

#### Component Token

Component Token 是组件私有变量。

```ts
export interface ButtonToken {
  buttonHeightSm: number
  buttonHeightMd: number
  buttonHeightLg: number
  buttonPaddingInlineSm: number
  buttonPaddingInlineMd: number
  buttonPaddingInlineLg: number
  buttonPrimaryBg: string
  buttonPrimaryHoverBg: string
  buttonPrimaryActiveBg: string
  buttonBorderRadius: number
}
```

职责：

> Component Token 解决“全局语义变量无法表达组件细节”的问题。

例如 Button 和 Input 都使用 `colorPrimary`，但 Button 的 hover 背景、active 背景、padding、height 是组件私有规则。

### 16.3 Token 派生流程

主题生成流程：

```txt
用户输入 Seed Token
  ↓
normalizeSeedToken
  ↓
defaultAlgorithm / darkAlgorithm / compactAlgorithm
  ↓
生成 Map Token
  ↓
生成 Alias Token
  ↓
合并 Component Token
  ↓
生成 CSS Variables
  ↓
注入 :root 或指定容器
```

代码模型：

```ts
export interface ThemeAlgorithm {
  (seed: SeedToken): MapToken
}

export interface ThemeConfig {
  seed?: Partial<SeedToken>
  algorithm?: ThemeAlgorithm | ThemeAlgorithm[]
  components?: Partial<ComponentTokenMap>
  cssVarPrefix?: string
  target?: HTMLElement | string
}
```

示例：

```ts
const theme = createTheme({
  seed: {
    colorPrimary: '#722ed1',
    borderRadius: 8
  },
  algorithm: [defaultAlgorithm, compactAlgorithm],
  components: {
    Button: {
      buttonBorderRadius: 10
    }
  }
})
```

设计动机：

> Token 不能只是静态 JSON。企业主题常常需要算法派生，比如根据主色生成 hover、active、背景、边框、文本色。

### 16.4 主题算法设计

默认算法：

```ts
export const defaultAlgorithm: ThemeAlgorithm = (seed) => {
  const primaryPalette = generateColorPalette(seed.colorPrimary)

  return {
    colorPrimaryBg: primaryPalette[1],
    colorPrimaryHover: primaryPalette[5],
    colorPrimaryActive: primaryPalette[7],
    colorPrimaryText: primaryPalette[6],
    fontSizeSm: seed.fontSize - 2,
    fontSizeMd: seed.fontSize,
    fontSizeLg: seed.fontSize + 2,
    borderRadiusSm: Math.max(seed.borderRadius - 2, 2),
    borderRadiusMd: seed.borderRadius,
    borderRadiusLg: seed.borderRadius + 2,
    spacingXs: seed.spacingUnit,
    spacingSm: seed.spacingUnit * 2,
    spacingMd: seed.spacingUnit * 3,
    spacingLg: seed.spacingUnit * 4
  }
}
```

暗色算法：

```ts
export const darkAlgorithm: ThemeAlgorithm = (seed) => {
  const map = defaultAlgorithm(seed)

  return {
    ...map,
    colorPrimaryBg: mix(seed.colorPrimary, '#000000', 0.85),
    colorPrimaryHover: mix(seed.colorPrimary, '#ffffff', 0.25),
    colorPrimaryActive: mix(seed.colorPrimary, '#ffffff', 0.15)
  }
}
```

紧凑算法：

```ts
export const compactAlgorithm: ThemeAlgorithm = (seed) => {
  const map = defaultAlgorithm(seed)

  return {
    ...map,
    spacingXs: Math.max(map.spacingXs - 1, 2),
    spacingSm: Math.max(map.spacingSm - 2, 4),
    spacingMd: Math.max(map.spacingMd - 2, 8),
    spacingLg: Math.max(map.spacingLg - 4, 12)
  }
}
```

设计说明：

- `defaultAlgorithm` 生成默认亮色主题；
- `darkAlgorithm` 修改色彩映射；
- `compactAlgorithm` 修改间距和尺寸；
- 多算法可以组合，但要定义后者覆盖前者的规则。

### 16.5 Alias Token 生成

Alias Token 从 Map Token 和 Seed Token 合成。

```ts
export function createAliasToken(seed: SeedToken, map: MapToken): AliasToken {
  return {
    colorText: '#1f2329',
    colorTextSecondary: '#646a73',
    colorTextDisabled: '#a8abb2',
    colorBgPage: '#f5f7fa',
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',
    colorBorder: '#dcdfe6',
    colorBorderSecondary: '#ebeef5',
    colorFillHover: map.colorPrimaryBg,
    colorFillActive: map.colorPrimaryActive,
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)',
    boxShadowSecondary: '0 2px 8px rgba(0, 0, 0, 0.06)'
  }
}
```

暗色 Alias：

```ts
export function createDarkAliasToken(seed: SeedToken, map: MapToken): AliasToken {
  return {
    colorText: 'rgba(255, 255, 255, 0.88)',
    colorTextSecondary: 'rgba(255, 255, 255, 0.65)',
    colorTextDisabled: 'rgba(255, 255, 255, 0.35)',
    colorBgPage: '#000000',
    colorBgContainer: '#141414',
    colorBgElevated: '#1f1f1f',
    colorBorder: '#424242',
    colorBorderSecondary: '#303030',
    colorFillHover: 'rgba(255, 255, 255, 0.08)',
    colorFillActive: 'rgba(255, 255, 255, 0.12)',
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.45)',
    boxShadowSecondary: '0 2px 8px rgba(0, 0, 0, 0.35)'
  }
}
```

设计动机：

> Alias Token 是组件真正应该依赖的主题语义层。组件不应该知道“第 6 阶蓝色”是什么意思，而应该知道“文本色、边框色、容器背景色”。

### 16.6 Component Token 设计

组件默认 Token：

```ts
export function createButtonToken(alias: AliasToken, map: MapToken): ButtonToken {
  return {
    buttonHeightSm: 24,
    buttonHeightMd: 32,
    buttonHeightLg: 40,
    buttonPaddingInlineSm: 8,
    buttonPaddingInlineMd: 12,
    buttonPaddingInlineLg: 16,
    buttonPrimaryBg: map.colorPrimaryText,
    buttonPrimaryHoverBg: map.colorPrimaryHover,
    buttonPrimaryActiveBg: map.colorPrimaryActive,
    buttonBorderRadius: map.borderRadiusMd
  }
}
```

用户覆盖：

```ts
createTheme({
  components: {
    Button: {
      buttonHeightMd: 36,
      buttonBorderRadius: 999
    }
  }
})
```

合并规则：

```txt
默认 Component Token
  ↓
算法生成 Component Token
  ↓
用户传入 Component Token 覆盖
```

设计动机：

> 全局 Token 解决系统一致性，Component Token 解决组件差异化。两者缺一不可。

### 16.7 CSS Variable 生成规则

Token 转 CSS Variable：

```ts
export function tokenToCssVars(token: Record<string, string | number>, prefix = 'ui') {
  return Object.entries(token).reduce<Record<string, string>>((vars, [key, value]) => {
    const cssName = `--${prefix}-${kebabCase(key)}`
    vars[cssName] = typeof value === 'number' ? `${value}px` : value
    return vars
  }, {})
}
```

示例：

```ts
{
  colorPrimary: '#1677ff',
  borderRadiusMd: 6,
  buttonHeightMd: 32
}
```

输出：

```css
:root {
  --ui-color-primary: #1677ff;
  --ui-border-radius-md: 6px;
  --ui-button-height-md: 32px;
}
```

注意：

> 并不是所有 number 都应该自动加 px。`lineHeight`、`fontWeight`、`zIndex` 这类值不能加 px。更严谨的做法是给 Token 增加类型元数据。

更严谨模型：

```ts
export interface TokenValue<T = string | number> {
  value: T
  type: 'color' | 'size' | 'font-size' | 'line-height' | 'number' | 'shadow'
}
```

### 16.8 CSS Variable 命名规范

全局变量：

```css
--ui-color-primary
--ui-color-success
--ui-color-text
--ui-color-text-secondary
--ui-color-bg-page
--ui-color-bg-container
--ui-color-border
--ui-border-radius-md
--ui-font-size-md
--ui-spacing-md
```

组件变量：

```css
--ui-button-height-md
--ui-button-padding-inline-md
--ui-button-primary-bg
--ui-button-primary-hover-bg
--ui-button-border-radius
```

命名规则：

```txt
--{namespace}-{token-name}
--{namespace}-{component-name}-{token-name}
```

设计动机：

> 变量命名必须可读、可预测、可覆盖。用户看到变量名就应该知道它影响什么。

### 16.9 SCSS 与 CSS Variable 分工

SCSS 负责：

```txt
BEM 结构生成
mixin
函数
样式文件组织
编译期主题包
```

CSS Variable 负责：

```txt
颜色
间距
圆角
字号
阴影
z-index
运行时换肤
```

示例：

```scss
@include b(button) {
  height: var(--ui-button-height-md);
  padding-inline: var(--ui-button-padding-inline-md);
  color: var(--ui-button-text-color);
  background: var(--ui-button-bg);
  border-radius: var(--ui-button-border-radius);

  @include m(primary) {
    --ui-button-bg: var(--ui-button-primary-bg);
    --ui-button-text-color: var(--ui-color-white);
  }
}
```

设计动机：

> SCSS 擅长组织样式，CSS Variable 擅长动态变化。不要让 SCSS 承担运行时主题能力，也不要让 CSS Variable 替代所有样式工程化能力。

### 16.10 运行时换肤 API

Core 层提供纯函数：

```ts
export function createTheme(config: ThemeConfig): Theme {
  const seed = mergeSeedToken(defaultSeedToken, config.seed)
  const map = applyAlgorithms(seed, config.algorithm ?? defaultAlgorithm)
  const alias = createAliasToken(seed, map)
  const components = createComponentTokens(alias, map, config.components)
  const token = { ...seed, ...map, ...alias, ...components }
  const cssVars = tokenToCssVars(token, config.cssVarPrefix)

  return {
    token,
    cssVars,
    cssText: stringifyCssVars(cssVars, config.target),
    apply(target = document.documentElement) {
      applyCssVars(target, cssVars)
    }
  }
}
```

使用：

```ts
const theme = createTheme({
  seed: {
    colorPrimary: '#722ed1'
  }
})

theme.apply()
```

Vue Adapter 提供响应式封装：

```ts
const { theme, setTheme } = useTheme()

setTheme({
  seed: {
    colorPrimary: '#13c2c2'
  }
})
```

设计动机：

> Core 提供框架无关能力，Vue Adapter 只负责把它接入 Vue 响应式和 ConfigProvider。

### 16.11 ConfigProvider 主题注入

Vue 使用：

```vue
<UiConfigProvider :theme="theme">
  <App />
</UiConfigProvider>
```

配置：

```ts
const theme = {
  seed: {
    colorPrimary: '#722ed1'
  },
  algorithm: [defaultAlgorithm, compactAlgorithm],
  components: {
    Button: {
      buttonBorderRadius: 999
    }
  }
}
```

实现原则：

```txt
ConfigProvider 接收 ThemeConfig
内部调用 core createTheme
通过 provide/inject 暴露 theme context
将 CSS Variables 注入到 provider 容器或 documentElement
支持嵌套 ConfigProvider 局部主题
```

局部主题：

```vue
<UiConfigProvider :theme="adminTheme">
  <AdminPanel />
</UiConfigProvider>

<UiConfigProvider :theme="marketingTheme">
  <MarketingPanel />
</UiConfigProvider>
```

设计动机：

> 企业后台常常存在不同业务域、不同租户、不同嵌入模块的局部主题需求。只支持全局换肤是不够的。

### 16.12 暗色模式设计

支持三种方式：

#### 方式一：class 切换

```html
<html class="ui-theme-dark">
```

CSS：

```css
.ui-theme-dark {
  --ui-color-bg-page: #000000;
  --ui-color-bg-container: #141414;
  --ui-color-text: rgba(255, 255, 255, 0.88);
}
```

#### 方式二：data attribute

```html
<html data-ui-theme="dark">
```

CSS：

```css
[data-ui-theme='dark'] {
  --ui-color-bg-page: #000000;
}
```

#### 方式三：JS runtime apply

```ts
createTheme({
  algorithm: darkAlgorithm
}).apply()
```

推荐策略：

```txt
静态暗色主题包：class / data attribute
动态主题切换：runtime apply
SSR 首屏：预置 class 或 data attribute，避免闪烁
```

设计动机：

> 暗色模式既要支持构建期主题包，也要支持运行时切换，还要考虑 SSR 首屏闪烁问题。

### 16.13 多品牌与多租户主题

企业场景常见：

```txt
集团默认主题
子品牌 A 主题
子品牌 B 主题
租户自定义主题
节日活动主题
```

推荐结构：

```txt
packages/theme/src/presets/
├─ default.ts
├─ brand-a.ts
├─ brand-b.ts
├─ dark.ts
└─ compact.ts
```

示例：

```ts
export const brandATheme: ThemeConfig = {
  seed: {
    colorPrimary: '#0052d9',
    borderRadius: 4
  }
}
```

使用：

```ts
import { brandATheme } from '@company/ui-theme/presets/brand-a'

app.use(Ui, {
  theme: brandATheme
})
```

租户主题：

```ts
async function loadTenantTheme(tenantId: string) {
  const theme = await fetch(`/api/tenants/${tenantId}/theme`).then((res) => res.json())
  createTheme(theme).apply()
}
```

安全边界：

```txt
后端返回主题值必须校验
只允许合法颜色、数字、枚举
禁止把任意 CSS 文本直接注入页面
```

设计动机：

> 运行时换肤本质上是在修改 CSS，如果允许未校验的任意 CSS，会带来样式污染甚至安全风险。

### 16.14 主题包产物设计

`@company/ui-theme` 输出：

```txt
dist/
├─ index.css
├─ base.css
├─ dark.css
├─ compact.css
├─ button.css
├─ input.css
├─ select.css
├─ tokens/
│  ├─ default.json
│  ├─ dark.json
│  └─ compact.json
├─ presets/
│  ├─ default.js
│  ├─ brand-a.js
│  └─ brand-b.js
└─ scss/
   ├─ index.scss
   ├─ mixins.scss
   └─ vars.scss
```

`package.json exports`：

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./index.css": "./dist/index.css",
    "./dark.css": "./dist/dark.css",
    "./compact.css": "./dist/compact.css",
    "./button.css": "./dist/button.css",
    "./tokens/default.json": "./dist/tokens/default.json",
    "./presets/brand-a": {
      "types": "./dist/presets/brand-a.d.ts",
      "import": "./dist/presets/brand-a.js"
    },
    "./scss/index.scss": "./dist/scss/index.scss"
  }
}
```

设计动机：

> 主题包不只给组件库内部用，也要给业务项目、设计工具、文档站、Figma token pipeline 和运行时换肤系统使用。

### 16.15 Figma Token 同步预留

设计侧 Token 可以通过 JSON 同步：

```txt
Figma Tokens
  ↓
tokens/design/default.json
  ↓
Style Dictionary / custom transformer
  ↓
packages/theme/src/tokens/default.ts
  ↓
CSS Variables / SCSS Variables / JS Token
```

Token JSON 示例：

```json
{
  "color": {
    "primary": {
      "value": "#1677ff",
      "type": "color"
    }
  },
  "radius": {
    "base": {
      "value": 6,
      "type": "dimension"
    }
  }
}
```

设计动机：

> 企业组件库长期维护时，主题不应该只由前端手写。设计系统需要有从设计工具到代码的同步链路。

### 16.16 组件样式变量覆盖方式

用户可以通过 CSS 覆盖：

```css
.custom-area {
  --ui-button-height-md: 36px;
  --ui-button-border-radius: 999px;
}
```

也可以通过 ConfigProvider 覆盖：

```ts
const theme = {
  components: {
    Button: {
      buttonHeightMd: 36,
      buttonBorderRadius: 999
    }
  }
}
```

两种方式区别：

| 方式 | 优点 | 缺点 |
|---|---|---|
| CSS 覆盖 | 简单、局部、生效直接 | 缺少类型约束 |
| ConfigProvider | 有类型、有统一主题上下文 | 需要接入组件库运行时 |

推荐：

```txt
业务局部小改动：CSS Variables 覆盖
系统级主题改动：ConfigProvider / createTheme
```

### 16.17 SSR 与首屏主题

SSR 场景要避免主题闪烁。

推荐：

```txt
服务端根据用户偏好或租户生成 CSS Variables
内联到 HTML head
客户端 hydration 后接管 theme context
```

示例：

```html
<style id="ui-theme-vars">
  :root {
    --ui-color-primary: #1677ff;
    --ui-color-bg-page: #ffffff;
  }
</style>
```

客户端：

```ts
createTheme(themeConfig).apply()
```

注意：

> 服务端和客户端的 themeConfig 必须一致，否则 hydration 后会出现视觉跳变。

### 16.18 可访问性与主题

主题系统需要保证基础可访问性：

```txt
文本色和背景色对比度
禁用态对比度
focus ring 可见性
错误色、警告色不能只靠颜色表达
暗色模式下阴影和边框可见性
```

建议在 Token 生成后做校验：

```ts
validateThemeContrast(token, {
  minTextContrast: 4.5,
  minLargeTextContrast: 3
})
```

设计动机：

> 企业组件库经常服务大量内部系统，可访问性不是加分项，而是基础质量保障。

### 16.19 第一阶段落地步骤

建议顺序：

```txt
Step 1: 定义 SeedToken / MapToken / AliasToken / ComponentToken 类型
Step 2: 实现 defaultSeedToken
Step 3: 实现 defaultAlgorithm
Step 4: 实现 createAliasToken
Step 5: 实现 Button Component Token
Step 6: 实现 tokenToCssVars / stringifyCssVars / applyCssVars
Step 7: 输出 default.css 和 button.css
Step 8: 在 Button 样式中接入 CSS Variables
Step 9: 实现 createTheme runtime API
Step 10: 实现 ConfigProvider theme 注入
Step 11: 实现 darkAlgorithm
Step 12: 验证运行时切换主色、暗色、组件局部 Token
```

### 16.20 第一阶段验收标准

完成后应满足：

```txt
Seed / Map / Alias / Component Token 类型完整
默认主题可生成 CSS Variables
Button 样式完全基于 CSS Variables
@company/ui-theme/index.css 可全量引入
@company/ui-theme/button.css 可按需引入
createTheme({ seed }) 可运行时切换主色
ConfigProvider 可注入主题
支持局部覆盖 Button Token
支持暗色算法生成暗色变量
SSR 可内联初始 CSS Variables
主题值有基本合法性校验
```

### 16.21 常见设计陷阱

#### 陷阱一：只设计全局 Token，不设计组件 Token

问题：

> Button、Input、Table 的细节差异无法表达，最后只能在 SCSS 中写死。

修复：

```txt
全局 Alias Token 负责系统语义；
Component Token 负责组件私有细节。
```

#### 陷阱二：只用 SCSS 变量

问题：

```scss
$color-primary: #1677ff;
```

运行时无法动态换肤。

修复：

```scss
background: var(--ui-color-primary);
```

#### 陷阱三：运行时注入任意 CSS

问题：

```ts
style.innerHTML = userInputCss
```

风险：

> 可能导致样式污染、安全风险和不可控覆盖。

修复：

```txt
只允许结构化 ThemeConfig；
校验颜色、数字、枚举；
由 tokenToCssVars 生成 CSS。
```

#### 陷阱四：暗色模式只做颜色反转

问题：

> 颜色反转会导致品牌色、阴影、边框、禁用态不可控。

修复：

```txt
暗色模式应有独立 darkAlgorithm 和 dark Alias Token。
```

### 16.22 架构能力表达点

在架构评审中，这一节可以这样表达：

> 我会把主题系统设计成 Token 驱动，而不是样式覆盖驱动。Seed Token 表示品牌输入，Map Token 通过算法生成设计尺度，Alias Token 提供 UI 语义，Component Token 描述组件私有变量。SCSS 负责样式组织，CSS Variables 负责运行时换肤，createTheme 提供框架无关主题生成能力，ConfigProvider 负责 Vue 运行时注入。这样既能支持默认主题和暗色模式，也能支持多品牌、多租户、局部主题和未来 Figma Token 同步。

---

## 17. Vue Adapter 运行时平台设计

本节目标是细化 `@company/ui-vue` 的职责边界、目录结构、运行时上下文、插件安装、ConfigProvider、主题接入、国际化、namespace、z-index、组件默认配置、resolver 和全局类型声明。

推荐定位：

```txt
Vue Adapter = Vue 运行时平台层
```

它不是简单的组件导出入口，而是组件库在 Vue 应用中的统一接入层。

设计原则：

> Vue Adapter 不负责重新定义 Core 协议，也不负责实现具体组件业务逻辑，而是把 Core、Theme、Locale、Config、组件注册、按需引入和全局类型系统接入 Vue 运行时。

### 17.1 为什么需要运行时平台型 Adapter

如果 `@company/ui-vue` 只做轻量入口：

```ts
import { UiButton, UiInput } from '@company/ui-vue'

app.use(UiButton)
app.use(UiInput)
```

短期看简单，但组件库规模扩大后会出现问题：

```txt
1. theme 无统一注入点
2. locale 无统一读取方式
3. namespace 无法全局配置
4. z-index 各组件各自维护
5. size / disabled / component defaults 分散在组件内
6. resolver 元数据和组件注册入口割裂
7. 全局组件类型声明难以自动生成
8. Pro Components 缺少统一运行时上下文
```

运行时平台型 Adapter 解决的是：

```txt
组件库如何进入 Vue 应用
全局配置如何下发
局部配置如何覆盖
主题如何运行时注入
语言如何切换
浮层层级如何统一
样式前缀如何隔离
组件如何按需导入
模板如何获得类型提示
```

设计动机：

> 企业级 UI 组件库不是一组孤立组件。组件之间共享主题、语言、尺寸、层级、命名前缀和默认行为，这些能力必须由统一的 Vue 运行时平台承载。

### 17.2 与其他 UI 框架的选择对比

成熟 UI 框架普遍会建设运行时平台层。

| 框架 | Adapter / Runtime 选择 | 可借鉴点 | 风险 |
|---|---|---|---|
| Element Plus | Vue-first 运行时平台 | install、ConfigProvider、namespace、zIndex、locale、resolver | Core 跨框架抽象较弱 |
| Ant Design | Design System Runtime | ConfigProvider、Token、Theme Algorithm、Locale、component config | 运行时复杂度高 |
| Arco Design | 中后台生态平台 | 多端设计资源、Pro 组件、主题生态 | 多框架维护成本高 |
| Naive UI | Vue-only + 强主题运行时 | ConfigProvider、局部主题、强类型 | CSS-in-JS 路线不一定适合当前项目 |
| Vuetify | 应用框架型 Runtime | display、theme、icons、locale、layout | 对业务应用侵入较强 |
| Radix UI | Headless Primitive Runtime | 可访问性、焦点、浮层、键盘交互 | 不提供统一视觉系统 |

对本项目的推荐组合：

```txt
Element Plus：Vue Adapter 和 resolver 设计
Ant Design：ConfigProvider + Token Runtime
Arco Design：企业中后台生态思路
Naive UI：强类型与局部主题体验
Radix UI：未来 Headless Primitive 方向
```

最终选择：

```txt
完整运行时平台设计 + 第一阶段渐进落地
```

也就是说，设计上完整覆盖 `install / ConfigProvider / theme / locale / namespace / zIndex / resolver / global types`，实现时先服务 Button 最小闭环。

### 17.3 Vue Adapter 职责边界

`@company/ui-vue` 应该负责：

```txt
1. Vue 插件安装
2. 全局组件注册
3. ConfigProvider 配置下发
4. provide / inject 上下文管理
5. namespace 生成
6. size 默认值读取
7. locale 当前语言读取
8. z-index 分配
9. theme 运行时注入
10. resolver 元数据导出
11. 全局组件类型声明
12. Vue 专属工具，如 withInstall
```

`@company/ui-vue` 不应该负责：

```txt
1. 不实现 Token 算法
2. 不定义跨框架基础协议
3. 不实现具体组件业务逻辑
4. 不依赖 Pro Components
5. 不让 Core 反向依赖 Vue
6. 不管理构建工具细节
7. 不把所有组件内部状态塞进全局配置
```

职责划分：

| 能力 | 所属层 | 说明 |
|---|---|---|
| ThemeToken 类型 | `@company/ui-core` | 框架无关协议 |
| createTheme 算法 | `@company/ui-core` / `@company/ui-theme` | 生成 token 和 CSS variables |
| useTheme | `@company/ui-vue` | Vue 响应式封装 |
| ConfigProvider | `@company/ui-vue` | Vue 上下文注入 |
| Button 渲染 | `@company/ui-components` | 组件实现 |
| resolver | `@company/ui-vue` | Vue 构建生态接入 |
| ProTable 查询逻辑 | `@company/ui-pro-components` | 业务增强层 |

设计动机：

> Adapter 是桥，不是地基，也不是业务层。它连接 Vue 应用和底层组件库能力，但不能反向污染 Core，也不能吞掉组件本身的职责。

### 17.4 推荐目录结构

```txt
packages/vue/
├─ src/
│  ├─ index.ts
│  ├─ install.ts
│  ├─ components.ts
│  ├─ plugin.ts
│  │
│  ├─ config-provider/
│  │  ├─ config-provider.vue
│  │  ├─ props.ts
│  │  ├─ context.ts
│  │  ├─ use-config.ts
│  │  └─ index.ts
│  │
│  ├─ config/
│  │  ├─ types.ts
│  │  ├─ defaults.ts
│  │  ├─ merge-config.ts
│  │  └─ index.ts
│  │
│  ├─ namespace/
│  │  ├─ use-namespace.ts
│  │  └─ index.ts
│  │
│  ├─ theme/
│  │  ├─ use-theme.ts
│  │  ├─ apply-theme.ts
│  │  └─ index.ts
│  │
│  ├─ locale/
│  │  ├─ types.ts
│  │  ├─ zh-cn.ts
│  │  ├─ en-us.ts
│  │  ├─ use-locale.ts
│  │  └─ index.ts
│  │
│  ├─ z-index/
│  │  ├─ use-z-index.ts
│  │  └─ index.ts
│  │
│  ├─ resolver/
│  │  ├─ meta.ts
│  │  ├─ resolver.ts
│  │  └─ index.ts
│  │
│  ├─ utils/
│  │  ├─ with-install.ts
│  │  └─ index.ts
│  │
│  └─ global.d.ts
│
├─ package.json
└─ tsconfig.json
```

模块职责：

| 模块 | 职责 |
|---|---|
| `install.ts` | 全量注册组件并注入全局配置 |
| `components.ts` | 由生成器维护的组件数组 |
| `config-provider` | 运行时配置上下文 |
| `config` | 全局配置类型、默认值、合并策略 |
| `namespace` | BEM class name 前缀生成 |
| `theme` | Vue 层主题响应式接入和 CSS variables 注入 |
| `locale` | 当前语言包和 `t` 函数 |
| `z-index` | 浮层层级分配 |
| `resolver` | 自动按需引入元数据和 resolver |
| `utils` | Vue 专属工具 |
| `global.d.ts` | 全局组件类型声明 |

设计动机：

> Vue Adapter 的目录应该按运行时能力划分，而不是按组件划分。组件属于 components 包，Adapter 负责把运行时能力组织起来。

### 17.5 全局配置模型

推荐定义统一配置类型：

```ts
import type { ThemeConfig } from '@company/ui-core'
import type { LocaleMessages } from './locale'

export interface UiVueConfig {
  namespace?: string
  size?: ComponentSize
  zIndex?: number
  locale?: LocaleMessages
  theme?: ThemeConfig
  button?: ButtonConfig
  message?: MessageConfig
}
```

第一阶段建议只实现：

```ts
export interface UiVueConfig {
  namespace?: string
  size?: ComponentSize
  zIndex?: number
  locale?: LocaleMessages
  theme?: ThemeConfig
}
```

暂缓复杂组件默认配置：

```txt
button?: ButtonConfig
message?: MessageConfig
form?: FormConfig
pagination?: PaginationConfig
```

原因：

> 组件级默认配置很有价值，但过早引入会让 ConfigProvider 合并策略复杂化。第一阶段先统一 namespace、size、zIndex、locale、theme，等 Button / Input / Form 样板稳定后再扩展 component defaults。

默认配置：

```ts
export const defaultConfig: Required<Pick<UiVueConfig, 'namespace' | 'size' | 'zIndex'>> = {
  namespace: 'ui',
  size: 'medium',
  zIndex: 2000
}
```

设计动机：

> 全局配置应该承载跨组件共享的系统级选项，而不是变成所有组件 props 的大杂烩。

### 17.6 ConfigProvider 设计

使用方式：

```vue
<UiConfigProvider
  namespace="acme"
  size="large"
  :z-index="3000"
  :locale="zhCN"
  :theme="theme"
>
  <App />
</UiConfigProvider>
```

职责：

```txt
1. 接收局部配置
2. 读取父级 ConfigProvider 配置
3. 合并父子配置
4. provide 合并后的配置
5. 注入或更新主题 CSS Variables
6. 为子组件提供统一读取入口
```

上下文结构：

```ts
export interface ConfigProviderContext {
  namespace: ComputedRef<string>
  size: ComputedRef<ComponentSize>
  zIndex: Ref<number>
  locale: ComputedRef<LocaleMessages>
  theme: ComputedRef<ThemeConfig | undefined>
}
```

组件内部读取：

```ts
const config = useConfig()
const ns = useNamespace('button')
const { t } = useLocale()
const { nextZIndex } = useZIndex()
```

设计动机：

> ConfigProvider 是运行时平台的入口。组件不应该直接读取全局变量，而应该通过 Vue provide / inject 读取当前上下文，这样才能支持局部覆盖和嵌套配置。

### 17.7 配置合并策略

配置合并顺序：

```txt
defaultConfig
  ↓
app.use(Ui, globalConfig)
  ↓
父级 ConfigProvider
  ↓
当前 ConfigProvider props
  ↓
组件自身 props
```

示例：

```vue
<UiConfigProvider namespace="admin" size="large">
  <UiButton>Large Button</UiButton>

  <UiConfigProvider size="small">
    <UiButton>Small Button</UiButton>
  </UiConfigProvider>
</UiConfigProvider>
```

最终结果：

```txt
外层 Button：namespace = admin, size = large
内层 Button：namespace = admin, size = small
```

合并原则：

```txt
1. undefined 不覆盖已有值
2. 对象配置浅合并
3. theme.components 可按组件深合并
4. locale 整包替换优先，局部 messages 可后续扩展
5. 组件 props 优先级最高
```

设计动机：

> 配置合并要可预测。用户显式传入的局部配置必须优先，但没有传的字段应该继承父级上下文。

### 17.8 install 插件设计

全量使用：

```ts
import { createApp } from 'vue'
import Ui from '@company/ui-vue'
import '@company/ui-theme/index.css'

createApp(App).use(Ui, {
  namespace: 'ui',
  size: 'medium',
  locale: zhCN
})
```

插件入口：

```ts
export interface UiPluginOptions extends UiVueConfig {}

export function install(app: App, options: UiPluginOptions = {}) {
  provideGlobalConfig(app, options)

  components.forEach((component) => {
    app.use(component)
  })
}

export default {
  install
}
```

设计规则：

```txt
1. install 负责注册组件
2. install 可以注入全局配置
3. install 不自动导入全量样式
4. install 不执行重型运行时逻辑
5. install 必须幂等，避免重复注册副作用
```

为什么不自动导入全量样式：

> 根入口自动导入样式会破坏样式按需加载。用户全量使用时显式导入 `@company/ui-theme/index.css`，按需使用时由 resolver 自动导入组件样式。

### 17.9 `withInstall` 设计

每个组件需要支持单独安装：

```ts
import { UiButton } from '@company/ui-vue/button'

app.use(UiButton)
```

工具函数：

```ts
import type { App, Plugin } from 'vue'

export type SFCWithInstall<T> = T & Plugin

export function withInstall<T extends { name?: string }>(component: T): SFCWithInstall<T> {
  const install = (app: App) => {
    if (!component.name) return
    app.component(component.name, component)
  }

  return Object.assign(component, { install })
}
```

放置位置：

```txt
packages/vue/src/utils/with-install.ts
```

原因：

> `withInstall` 依赖 Vue 的 `App` 和 `Plugin` 类型，属于 Vue Adapter 能力，不应该放进框架无关的 `@company/ui-utils`。

### 17.10 namespace 设计

使用方式：

```ts
const ns = useNamespace('button')

ns.b()              // ui-button
ns.e('content')    // ui-button__content
ns.m('primary')    // ui-button--primary
ns.is('disabled')  // is-disabled
```

支持全局覆盖：

```ts
app.use(Ui, {
  namespace: 'acme'
})
```

输出：

```txt
acme-button
acme-button__content
acme-button--primary
is-disabled
```

设计规则：

```txt
1. namespace 默认是 ui
2. block 使用组件名
3. element 使用 __
4. modifier 使用 --
5. state class 使用 is-
6. namespace 从 ConfigProvider 读取
```

设计动机：

> namespace 解决组件库样式与业务样式、多个组件库之间的命名冲突。它必须是运行时配置，而不是写死在 SCSS 中。

### 17.11 size 全局尺寸设计

全局配置：

```ts
app.use(Ui, {
  size: 'large'
})
```

局部配置：

```vue
<UiConfigProvider size="small">
  <UiButton>Small</UiButton>
</UiConfigProvider>
```

组件 props 优先：

```vue
<UiConfigProvider size="small">
  <UiButton size="large">Large</UiButton>
</UiConfigProvider>
```

优先级：

```txt
组件 props.size > ConfigProvider size > app.use size > default size
```

组件内部：

```ts
const buttonSize = computed(() => props.size ?? config.size.value)
```

设计动机：

> 企业后台常常需要在一个系统中统一使用紧凑、中等或宽松尺寸。全局 size 可以减少重复 props，但组件 props 必须保留最高优先级。

### 17.12 z-index 设计

浮层组件需要统一层级管理：

```txt
Dialog
Drawer
Popover
Tooltip
Dropdown
Message
Notification
```

配置：

```ts
app.use(Ui, {
  zIndex: 3000
})
```

Hook：

```ts
const { initialZIndex, currentZIndex, nextZIndex } = useZIndex()

const dialogZIndex = nextZIndex()
```

设计原则：

```txt
1. zIndex 起始值可配置
2. 每次打开浮层分配新层级
3. 同一 ConfigProvider 子树共享计数器
4. 嵌套 ConfigProvider 可覆盖起始值
5. SSR 下不能依赖 window 初始化
```

设计动机：

> 浮层组件如果各自写死 z-index，会导致 Dialog、Popover、Message 互相遮挡。z-index 必须由运行时平台统一分配。

### 17.13 locale 国际化设计

Core 定义语言包协议：

```ts
export interface LocaleMessages {
  name: string
  common: {
    confirm: string
    cancel: string
    clear: string
  }
  pagination: {
    total: string
    page: string
    pageSize: string
  }
  datePicker: {
    today: string
    now: string
    clear: string
  }
}
```

Vue Adapter 提供语言包：

```ts
import zhCN from '@company/ui-vue/locale/zh-cn'
import enUS from '@company/ui-vue/locale/en-us'

app.use(Ui, {
  locale: zhCN
})
```

组件内部：

```ts
const { t, locale } = useLocale()

t('common.confirm')
```

`useLocale` 职责：

```txt
1. 读取当前 ConfigProvider locale
2. 提供 t(path) 方法
3. 支持 fallback 到默认语言
4. 保持返回值类型可推导
```

与 `vue-i18n` 的关系：

```txt
第一阶段：组件库内置轻量 locale 系统
第二阶段：提供 bridge，允许从 vue-i18n message 中读取组件库语言包
```

设计动机：

> 组件库国际化不应该强制用户使用某个业务 i18n 框架。组件库需要自己的语言包协议，同时预留与 vue-i18n 集成能力。

### 17.14 theme 接入设计

Core / Theme 层负责：

```txt
Seed Token
Map Token
Alias Token
Component Token
createTheme
CSS Variables 生成
```

Vue Adapter 负责：

```txt
1. 读取 ConfigProvider theme
2. 调用 createTheme
3. 将 CSS Variables 注入当前作用域
4. 响应 theme 变化
5. 支持局部主题
```

使用：

```vue
<UiConfigProvider :theme="theme">
  <UiButton type="primary">Submit</UiButton>
</UiConfigProvider>
```

实现思路：

```ts
watchEffect(() => {
  const theme = createTheme(config.theme.value)
  applyThemeVars(providerElement.value, theme.cssVars)
})
```

注入目标：

```txt
全局主题：document.documentElement
局部主题：ConfigProvider 根元素
SSR：生成 cssText 并内联
```

设计动机：

> Vue Adapter 不应该自己计算 Token，但必须负责把主题结果应用到 Vue 组件树。这样 Core 保持框架无关，Vue 层拥有响应式和局部主题能力。

### 17.15 ConfigProvider 与 DOM 包裹策略

有两种实现方式。

#### 方式一：ConfigProvider 渲染真实 DOM

```vue
<div class="ui-config-provider" :style="cssVars">
  <slot />
</div>
```

优点：

```txt
局部主题作用域明确
CSS Variables 天然继承
SSR 输出简单
```

缺点：

```txt
会多一层 DOM
可能影响某些布局
```

#### 方式二：ConfigProvider 不渲染 DOM，只 provide 配置

```vue
<slot />
```

优点：

```txt
不影响 DOM 结构
更轻量
```

缺点：

```txt
局部主题需要额外定位注入目标
CSS Variables 作用域难控制
SSR 更复杂
```

第一阶段推荐：**默认渲染 DOM，允许 `tag` 配置**。

```vue
<UiConfigProvider tag="section">
  <App />
</UiConfigProvider>
```

原因：

> 运行时主题和局部主题是核心能力，多一层可控 DOM 比隐式注入更稳定。对于极端布局场景，可以后续提供 `virtual` 模式。

### 17.16 resolver 设计

自动按需引入：

```ts
import Components from 'unplugin-vue-components/vite'
import { CompanyUiResolver } from '@company/ui-vue/resolver'

export default {
  plugins: [
    Components({
      resolvers: [
        CompanyUiResolver({ importStyle: 'css' })
      ]
    })
  ]
}
```

元数据：

```ts
export const componentResolverMeta = [
  {
    name: 'UiButton',
    from: '@company/ui-vue/button',
    styleName: 'button'
  }
]
```

Resolver：

```ts
export interface CompanyUiResolverOptions {
  importStyle?: 'css' | 'sass' | false
  prefix?: string
}
```

规则：

```txt
1. resolver 不扫描文件系统
2. resolver 只读取构建期生成的 meta
3. importStyle=css 时引入 @company/ui-theme/button.css
4. importStyle=sass 时引入 @company/ui-vue/button/style
5. importStyle=false 时只导入 JS
6. prefix 默认 Ui
```

设计动机：

> resolver 是组件库使用体验的关键。它让用户在模板中直接写 `<UiButton />`，构建工具自动补齐 JS 和 CSS 导入，同时保留 Tree-shaking 能力。

### 17.17 全局组件类型声明

全局注册后，模板仍应有类型提示。

生成：

```ts
declare module 'vue' {
  export interface GlobalComponents {
    UiButton: typeof import('@company/ui-vue/button')['UiButton']
    UiInput: typeof import('@company/ui-vue/input')['UiInput']
  }
}

export {}
```

暴露入口：

```json
{
  "exports": {
    "./global": {
      "types": "./dist/global.d.ts"
    }
  }
}
```

用户配置：

```json
{
  "compilerOptions": {
    "types": ["@company/ui-vue/global"]
  }
}
```

设计动机：

> 全局注册解决运行时可用性，全局类型声明解决开发时可用性。企业组件库不能只考虑代码能跑，还要考虑 IDE、模板提示和业务封装体验。

### 17.18 组件如何消费运行时上下文

Button 示例：

```ts
const config = useConfig()
const ns = useNamespace('button')

const buttonSize = computed(() => props.size ?? config.size.value)
```

Dialog 示例：

```ts
const ns = useNamespace('dialog')
const { nextZIndex } = useZIndex()

const zIndex = ref(nextZIndex())
```

Pagination 示例：

```ts
const { t } = useLocale()

const totalText = computed(() => t('pagination.total'))
```

设计原则：

```txt
1. 组件只通过 hooks 读取运行时上下文
2. 组件不直接 inject 原始 key
3. 组件 props 优先级高于上下文
4. 上下文缺失时回退默认配置
5. hooks 保持小而稳定
```

设计动机：

> hooks 是组件和运行时平台之间的稳定接口。组件不应该知道 ConfigProvider 内部如何合并配置。

### 17.19 SSR 设计

SSR 场景需要避免直接访问浏览器 API。

规则：

```txt
1. createTheme 是纯函数，可在服务端运行
2. applyTheme 只能在客户端执行
3. ConfigProvider SSR 时输出 cssText 或 inline style
4. useZIndex 不依赖 window
5. locale / namespace / size 都是纯上下文能力
```

SSR 首屏主题：

```html
<style id="ui-theme-vars">
  :root {
    --ui-color-primary: #1677ff;
    --ui-color-bg-page: #ffffff;
  }
</style>
```

客户端接管：

```ts
createTheme(themeConfig).apply()
```

设计动机：

> 企业组件库可能用于 Nuxt 或其他 SSR 场景。运行时平台必须把纯计算和 DOM 注入分开，否则 SSR 会出现 hydration 错误或首屏闪烁。

### 17.20 与 Pro Components 的关系

`@company/ui-pro-components` 可以消费 Vue Adapter 上下文：

```txt
ProTable 读取 locale
ProForm 读取 size
PageContainer 读取 namespace
QueryFilter 读取 theme variables
```

但 `@company/ui-vue` 不能依赖 `@company/ui-pro-components`。

依赖方向：

```txt
@company/ui-pro-components
  ↓
@company/ui-vue
  ↓
@company/ui-components
  ↓
@company/ui-core / @company/ui-theme
```

设计动机：

> Pro Components 是业务增强层，它可以复用运行时平台能力；但运行时平台必须保持基础稳定，不能被业务组件反向污染。

### 17.21 第一阶段落地顺序

建议顺序：

```txt
Step 1: 定义 UiVueConfig 和 defaultConfig
Step 2: 实现 ConfigProvider context / useConfig
Step 3: 实现 namespace / useNamespace
Step 4: 实现 withInstall
Step 5: 实现 install 和 components 注册
Step 6: 实现 size 上下文读取
Step 7: 实现 zIndex / useZIndex
Step 8: 实现 locale 类型、zh-cn、en-us、useLocale
Step 9: 接入 theme / useTheme / applyTheme
Step 10: 生成 resolver meta 和 CompanyUiResolver
Step 11: 生成 global.d.ts
Step 12: 用 Button 验证全量注册、局部注册、按需引入、主题、locale、namespace、size
```

为什么这个顺序：

> 先做 ConfigProvider 和 namespace，可以让 Button 从第一天就遵守运行时平台规则；再做 install 和 resolver，验证使用方式；最后接入 theme、locale、zIndex，逐步扩大闭环。

### 17.22 第一阶段验收标准

完成后应满足：

```txt
app.use(Ui) 可以全量注册组件
app.use(Ui, config) 可以注入全局配置
UiConfigProvider 可以局部覆盖 namespace / size / locale / theme / zIndex
useNamespace 输出正确 BEM class
useLocale 可以读取默认语言和自定义语言
useZIndex 可以为浮层分配递增层级
Button 可以读取全局 size
Button 可以读取 namespace 并生成正确类名
主题变量可以通过 ConfigProvider 注入
@company/ui-vue/button 可以手动按需引入
resolver 可以自动导入 Button 和 button.css
global.d.ts 可以提供模板组件类型提示
SSR 下不会因访问 document / window 报错
```

架构验收标准：

```txt
@company/ui-vue 不依赖 @company/ui-pro-components
@company/ui-core 不依赖 Vue
withInstall 不进入 @company/ui-utils
install 不自动导入全量 CSS
resolver 不运行时扫描文件系统
ConfigProvider 不承载组件业务逻辑
组件只通过 hooks 消费运行时上下文
```

### 17.23 常见设计陷阱

#### 陷阱一：把 ConfigProvider 做成万能配置中心

问题：

```ts
export interface UiVueConfig {
  buttonLoadingText?: string
  tableRequestUrl?: string
  formSubmitApi?: string
}
```

风险：

> 全局配置会被业务需求污染，最终变成不可维护的巨型对象。

修复：

```txt
ConfigProvider 只承载跨组件、系统级、稳定配置。
业务配置放到 Pro Components 或业务应用中。
```

#### 陷阱二：install 自动导入全量样式

问题：

```ts
import '@company/ui-theme/index.css'
```

风险：

> 用户只使用 Button，也会加载全部组件样式，破坏样式 Tree-shaking。

修复：

```txt
全量样式由用户显式 import；按需样式由 resolver 自动导入。
```

#### 陷阱三：组件直接访问全局变量

问题：

```ts
import { globalConfig } from '@company/ui-vue/config'
```

风险：

> 无法支持嵌套 ConfigProvider 和局部覆盖。

修复：

```txt
组件通过 useConfig / useNamespace / useLocale / useZIndex 读取上下文。
```

#### 陷阱四：z-index 写死在组件样式中

问题：

```scss
.ui-dialog {
  z-index: 2000;
}
```

风险：

> 多个浮层组件之间会互相遮挡，业务系统也难以统一层级。

修复：

```txt
浮层打开时通过 useZIndex 分配层级。
```

#### 陷阱五：Vue 专属工具下沉到 Core

问题：

```ts
// packages/core/src/with-install.ts
import type { App } from 'vue'
```

风险：

> Core 失去框架无关性，未来 React / Web Components 适配受阻。

修复：

```txt
Vue 专属能力只能放在 @company/ui-vue。
```

### 17.24 7 个维度总结

#### 架构分层

```txt
Core：定义协议和纯函数
Theme：输出 token、CSS variables、主题包
Components：实现基础组件
Vue Adapter：接入 Vue 运行时
Pro Components：消费基础能力，封装业务模式
```

#### 模块划分

```txt
install
ConfigProvider
config
namespace
theme
locale
z-index
resolver
global types
utils
```

#### 依赖关系

```txt
@company/ui-vue
  → @company/ui-components
  → @company/ui-core
  → @company/ui-theme

@company/ui-vue 不依赖 pro-components
@company/ui-core 不依赖 vue
```

#### 设计模式

```txt
Plugin Pattern：app.use(Ui)
Provider Pattern：ConfigProvider
Composition API Hooks：useConfig / useLocale / useZIndex
Adapter Pattern：Vue Adapter 接入 Core 能力
Strategy Pattern：theme algorithm / importStyle
Factory Pattern：createTheme
```

#### 潜在坑点

```txt
ConfigProvider 过度膨胀
install 引入全量样式
Core 依赖 Vue
组件直接读全局变量
resolver 扫描文件系统
z-index 分散维护
SSR 访问 document/window
```

#### 最佳实践

```txt
配置通过 provide/inject 下发
组件通过 hooks 消费上下文
样式由用户显式全量导入或 resolver 按需导入
Vue 专属工具留在 @company/ui-vue
运行时 DOM 操作与纯函数分离
resolver meta 由构建生成
全局类型声明自动生成
```

#### 学习与思考点

```txt
Adapter 的价值不是多包转发，而是运行时治理
ConfigProvider 的价值不是传 props，而是建立上下文边界
Tree-shaking 不只靠 JS exports，还依赖样式导入策略
主题系统要区分 Token 计算和 Vue 注入
多框架扩展的前提是 Core 不被 Vue 污染
企业组件库要同时服务运行时体验和开发时类型体验
```

### 17.25 架构能力表达点

在架构评审中，这一节可以这样表达：

> 我会把 Vue Adapter 设计成组件库在 Vue 环境下的运行时平台层，而不是简单的导出入口。它通过 install 接入应用，通过 ConfigProvider 下发 namespace、size、locale、theme 和 zIndex，通过 useConfig、useNamespace、useLocale、useZIndex 等 hooks 为组件提供稳定上下文，通过 resolver 和 global.d.ts 提升按需引入和类型体验。同时它保持清晰边界：Core 负责框架无关协议，Theme 负责 Token 和 CSS Variables，Components 负责组件实现，Vue Adapter 只负责 Vue 运行时接入。这样既能快速落地 Vue 组件库，也能为未来 Pro Components、多主题、SSR 和多框架适配保留空间。

---

## 18. Button 最小闭环样板设计

本节目标是用 `Button` 组件验证组件库第一阶段的完整工程闭环。

Button 不是为了做一个复杂组件，而是作为最小样板验证：

```txt
组件目录规范
Props / Emits / Slots 类型规范
namespace / size / disabled / loading 运行时上下文
主题 Token 和 CSS Variables
样式按需加载
组件入口导出
install / withInstall
resolver 自动按需引入
全局类型声明
单元测试 / 类型测试 / 文档示例
构建产物 ESM / CJS / DTS / CSS
Tree-shaking 验证
```

设计原则：

> Button 是组件库的第一块试金石。它的价值不在于交互复杂，而在于它能验证组件库从源码、样式、类型、运行时、构建、文档到使用体验的全链路是否成立。

### 18.1 为什么第一个样板选择 Button

Button 的复杂度适中。

它足够简单：

```txt
不依赖复杂数据结构
不涉及 Teleport
不涉及异步浮层
不涉及表单校验
不涉及虚拟滚动
```

它又足够典型：

```txt
有 props
有 emits
有 slots
有 disabled 状态
有 loading 状态
有 size
有 type
有 native button 行为
有主题颜色
有样式变量
有按需引入需求
```

因此 Button 可以验证组件库基础工程能力：

```txt
如果 Button 都无法稳定支持类型、样式、构建、文档和按需引入，后续 Input、Form、Table 一定会更混乱。
```

设计动机：

> 第一个组件不要追求炫技，而要追求标准化。Button 的目标是定义后续所有组件都能复用的工程模板。

### 18.2 Button 能力边界

第一阶段 Button 支持：

```txt
type: default / primary / success / warning / danger
size: small / medium / large
disabled
loading
nativeType: button / submit / reset
autofocus
plain
round
circle
icon slot
loading slot
default slot
click emit
```

第一阶段暂不支持：

```txt
权限控制
埋点配置
请求状态自动绑定
防重复提交业务策略
按钮组复杂联动
异步 loading 自动管理
```

原因：

> 基础 Button 只负责按钮的 UI 状态和原生交互，不承载业务流程。权限、埋点、防重复提交应该由指令、业务组件或应用层处理。

边界示例：

```vue
<!-- 推荐：基础 Button 只表达 UI 状态 -->
<UiButton type="primary" :loading="submitting" @click="submit">
  Submit
</UiButton>

<!-- 不推荐：基础 Button 内置业务请求 -->
<UiButton request-url="/api/order/submit" permission-code="order.submit">
  Submit
</UiButton>
```

设计动机：

> 基础组件越通用，生命周期越长；业务能力越具体，变化越快。Button 不能被业务字段污染。

### 18.3 目录结构

推荐结构：

```txt
packages/components/button/
├─ src/
│  ├─ button.vue
│  ├─ button.ts
│  ├─ types.ts
│  ├─ constants.ts
│  └─ use-button.ts
├─ style/
│  ├─ index.ts
│  ├─ css.ts
│  └─ button.scss
├─ __tests__/
│  ├─ button.test.ts
│  └─ button.type.test-d.ts
├─ docs/
│  ├─ basic.vue
│  ├─ type.vue
│  ├─ size.vue
│  ├─ disabled.vue
│  ├─ loading.vue
│  └─ index.md
├─ meta.ts
└─ index.ts
```

文件职责：

| 文件 | 职责 |
|---|---|
| `src/button.vue` | Button 渲染结构和事件绑定 |
| `src/button.ts` | props、emits、运行时声明 |
| `src/types.ts` | 对外导出的类型 |
| `src/constants.ts` | type、nativeType 等常量 |
| `src/use-button.ts` | class、size、disabled、loading 等组合逻辑 |
| `style/button.scss` | Button 结构样式和状态样式 |
| `style/index.ts` | 源码 SCSS 样式入口 |
| `style/css.ts` | 构建后 CSS 样式入口 |
| `__tests__/button.test.ts` | 运行时行为测试 |
| `__tests__/button.type.test-d.ts` | 类型契约测试 |
| `docs/*.vue` | 文档示例 |
| `meta.ts` | resolver、文档、全局类型生成元数据 |
| `index.ts` | 组件公开入口 |

设计动机：

> Button 目录不是只服务 Button 本身，而是后续组件生成器的模板来源。

### 18.4 API 设计

Props：

```ts
export const buttonTypes = [
  'default',
  'primary',
  'success',
  'warning',
  'danger'
] as const

export type ButtonType = typeof buttonTypes[number]

export const buttonNativeTypes = ['button', 'submit', 'reset'] as const
export type ButtonNativeType = typeof buttonNativeTypes[number]

export const buttonProps = {
  type: {
    type: String as PropType<ButtonType>,
    default: 'default'
  },
  size: String as PropType<ComponentSize>,
  disabled: Boolean,
  loading: Boolean,
  plain: Boolean,
  round: Boolean,
  circle: Boolean,
  autofocus: Boolean,
  nativeType: {
    type: String as PropType<ButtonNativeType>,
    default: 'button'
  }
} as const

export type ButtonProps = ExtractPropTypes<typeof buttonProps>
```

Emits：

```ts
export const buttonEmits = {
  click: (event: MouseEvent) => event instanceof MouseEvent
}

export type ButtonEmits = typeof buttonEmits
```

Slots：

```ts
export interface ButtonSlots {
  default?: () => unknown
  icon?: () => unknown
  loading?: () => unknown
}
```

设计说明：

```txt
1. type 使用字面量数组，运行时和类型同源
2. size 不设置默认值，由 ConfigProvider 提供默认 size
3. nativeType 默认 button，避免表单中默认 submit 造成意外提交
4. disabled 和 loading 都会阻止 click emit
5. slots 类型显式导出，方便文档和业务封装复用
```

设计动机：

> 组件 API 必须同时服务运行时校验、TypeScript 推导、文档生成和业务二次封装。

### 18.5 运行时上下文接入

Button 需要读取：

```txt
namespace
size
```

不需要读取：

```txt
locale
zIndex
theme object
```

原因：

> Button 样式通过 CSS Variables 感知 theme，不应该在组件逻辑里直接读取 theme。Button 不产生文案，也不产生浮层，因此不需要 locale 和 zIndex。

组合逻辑：

```ts
export function useButton(props: ButtonProps) {
  const ns = useNamespace('button')
  const config = useConfig()

  const buttonSize = computed(() => props.size ?? config.size.value)
  const buttonDisabled = computed(() => props.disabled || props.loading)

  const classes = computed(() => [
    ns.b(),
    ns.m(props.type),
    ns.m(buttonSize.value),
    ns.is('plain', props.plain),
    ns.is('round', props.round),
    ns.is('circle', props.circle),
    ns.is('disabled', buttonDisabled.value),
    ns.is('loading', props.loading)
  ])

  return {
    ns,
    classes,
    buttonSize,
    buttonDisabled
  }
}
```

点击行为：

```ts
function handleClick(event: MouseEvent) {
  if (buttonDisabled.value) return
  emit('click', event)
}
```

设计动机：

> Button 通过 hooks 消费运行时平台，而不是直接读取全局配置。这样它天然支持 ConfigProvider 嵌套和局部 size / namespace 覆盖。

### 18.6 Vue 模板结构

`button.vue` 示例：

```vue
<script setup lang="ts">
import { buttonEmits, buttonProps } from './button'
import { useButton } from './use-button'

const props = defineProps(buttonProps)
const emit = defineEmits(buttonEmits)

const { ns, classes, buttonDisabled } = useButton(props)

function handleClick(event: MouseEvent) {
  if (buttonDisabled.value) return
  emit('click', event)
}
</script>

<template>
  <button
    :class="classes"
    :type="nativeType"
    :disabled="buttonDisabled"
    :autofocus="autofocus"
    @click="handleClick"
  >
    <span v-if="loading" :class="ns.e('loading')">
      <slot name="loading" />
    </span>
    <span v-else-if="$slots.icon" :class="ns.e('icon')">
      <slot name="icon" />
    </span>
    <span v-if="$slots.default" :class="ns.e('content')">
      <slot />
    </span>
  </button>
</template>
```

模板规则：

```txt
1. button 使用原生 button 元素
2. nativeType 透传到 type
3. disabled 属性使用合并后的 buttonDisabled
4. loading 时优先展示 loading slot
5. icon 和 content 用 element class 包裹
6. 不在模板中写复杂表达式
```

可访问性补充：

```txt
disabled 使用原生 disabled 属性
loading 时仍保持 disabled，避免重复点击
circle 按钮如果没有文本，应由用户提供 aria-label
icon-only 场景在文档中提示可访问性要求
```

设计动机：

> Button 要优先复用浏览器原生语义，而不是用 div 模拟按钮。原生 button 在键盘、表单、可访问性上都有默认优势。

### 18.7 样式与 Token 设计

Button Component Token：

```ts
export interface ButtonToken {
  buttonHeightSm: number
  buttonHeightMd: number
  buttonHeightLg: number
  buttonPaddingInlineSm: number
  buttonPaddingInlineMd: number
  buttonPaddingInlineLg: number
  buttonBorderRadius: number
  buttonFontWeight: number
  buttonPrimaryBg: string
  buttonPrimaryHoverBg: string
  buttonPrimaryActiveBg: string
  buttonPrimaryTextColor: string
  buttonDisabledOpacity: number
}
```

CSS Variables：

```css
:root {
  --ui-button-height-sm: 24px;
  --ui-button-height-md: 32px;
  --ui-button-height-lg: 40px;
  --ui-button-padding-inline-sm: 8px;
  --ui-button-padding-inline-md: 12px;
  --ui-button-padding-inline-lg: 16px;
  --ui-button-border-radius: 6px;
  --ui-button-font-weight: 400;
  --ui-button-primary-bg: var(--ui-color-primary);
  --ui-button-primary-hover-bg: var(--ui-color-primary-hover);
  --ui-button-primary-active-bg: var(--ui-color-primary-active);
  --ui-button-primary-text-color: var(--ui-color-white);
  --ui-button-disabled-opacity: 0.6;
}
```

SCSS：

```scss
@include b(button) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--ui-spacing-xs);
  height: var(--ui-button-height-md);
  padding-inline: var(--ui-button-padding-inline-md);
  font-weight: var(--ui-button-font-weight);
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-button-border-radius);
  color: var(--ui-color-text);
  background: var(--ui-color-bg-container);
  cursor: pointer;
  user-select: none;

  @include m(primary) {
    color: var(--ui-button-primary-text-color);
    background: var(--ui-button-primary-bg);
    border-color: var(--ui-button-primary-bg);
  }

  @include m(small) {
    height: var(--ui-button-height-sm);
    padding-inline: var(--ui-button-padding-inline-sm);
  }

  @include m(large) {
    height: var(--ui-button-height-lg);
    padding-inline: var(--ui-button-padding-inline-lg);
  }

  @include when(disabled) {
    cursor: not-allowed;
    opacity: var(--ui-button-disabled-opacity);
  }
}
```

设计规则：

```txt
1. 不写死品牌色
2. 尺寸来自 Button Component Token
3. 文本、边框、背景优先使用 Alias Token
4. type 状态使用 Component Token
5. loading / disabled 通过 state class 控制
```

设计动机：

> Button 样式必须验证主题系统是否真正可用。如果 Button 仍然写死颜色和尺寸，前面的 Token 设计就是空架构。

### 18.8 组件入口导出

`index.ts`：

```ts
import Button from './src/button.vue'
import { withInstall } from '@company/ui-vue/utils'

export const UiButton = withInstall(Button)
export default UiButton

export * from './src/button'
export type * from './src/types'
export * from './meta'
```

注意：

```txt
withInstall 位于 @company/ui-vue，但 Button 位于 @company/ui-components。
```

这里有一个架构边界问题。

如果 `packages/components/button/index.ts` 直接依赖 `@company/ui-vue/utils`，会导致：

```txt
@company/ui-components → @company/ui-vue
```

这违反了依赖方向。

更推荐的拆法：

```txt
packages/components/button/index.ts
  只导出原始 Button、props、types、meta

packages/vue/src/entries/button.ts
  使用 withInstall 包装 Button
  导出 UiButton
```

推荐结构：

```txt
packages/components/button/index.ts
packages/vue/src/button.ts
```

`packages/components/button/index.ts`：

```ts
export { default as Button } from './src/button.vue'
export * from './src/button'
export type * from './src/types'
export * from './meta'
```

`packages/vue/src/button.ts`：

```ts
import { Button } from '@company/ui-components/button'
import { withInstall } from './utils/with-install'

export const UiButton = withInstall(Button)
export default UiButton
export * from '@company/ui-components/button'
```

设计动机：

> 基础组件包不能依赖 Vue Adapter。组件实现可以是 Vue SFC，但安装能力属于 Adapter 层。这个拆分可以保持依赖方向清晰。

### 18.9 install 与全量注册验证

`packages/vue/src/components.ts`：

```ts
import { UiButton } from './button'

export const components = [
  UiButton
]
```

`install.ts`：

```ts
export function install(app: App, options: UiPluginOptions = {}) {
  provideGlobalConfig(app, options)

  components.forEach((component) => {
    app.use(component)
  })
}
```

使用：

```ts
import Ui from '@company/ui-vue'
import '@company/ui-theme/index.css'

app.use(Ui)
```

验收：

```vue
<UiButton type="primary">Submit</UiButton>
```

设计动机：

> Button 必须同时验证单组件入口和全量注册入口，否则组件库使用方式是不完整的。

### 18.10 手动按需引入验证

使用方式：

```ts
import { UiButton } from '@company/ui-vue/button'
import '@company/ui-theme/button.css'
```

模板：

```vue
<UiButton type="primary">Submit</UiButton>
```

要求：

```txt
1. 只引入 Button JS
2. 只引入 Button CSS
3. 不引入 Input / Select / Table
4. 类型可以正确推导 ButtonProps
```

`package.json exports`：

```json
{
  "exports": {
    "./button": {
      "types": "./dist/es/button/index.d.ts",
      "import": "./dist/es/button/index.js",
      "require": "./dist/lib/button/index.cjs"
    }
  }
}
```

设计动机：

> 手动按需引入是自动 resolver 的基础。如果手动入口都不清晰，自动按需引入也无法可靠生成。

### 18.11 resolver 自动按需引入验证

Button 元数据：

```ts
export const buttonMeta = {
  name: 'UiButton',
  kebabName: 'ui-button',
  title: '按钮',
  category: 'basic',
  from: '@company/ui-vue/button',
  styleName: 'button',
  props: ['type', 'size', 'disabled', 'loading', 'plain', 'round', 'circle', 'nativeType'],
  events: ['click'],
  slots: ['default', 'icon', 'loading']
}
```

resolver 输出：

```ts
resolve('UiButton')
```

结果：

```ts
{
  name: 'UiButton',
  from: '@company/ui-vue/button',
  sideEffects: '@company/ui-theme/button.css'
}
```

用户代码：

```vue
<template>
  <UiButton type="primary">Submit</UiButton>
</template>
```

构建插件自动生成：

```ts
import { UiButton } from '@company/ui-vue/button'
import '@company/ui-theme/button.css'
```

设计动机：

> resolver 是企业组件库推广体验的关键。Button 需要作为第一条 resolver 元数据验证样板。

### 18.12 全局类型声明验证

生成：

```ts
declare module 'vue' {
  export interface GlobalComponents {
    UiButton: typeof import('@company/ui-vue/button')['UiButton']
  }
}

export {}
```

验证点：

```txt
1. 模板中 <UiButton /> 有类型提示
2. props type / size 有枚举提示
3. click 事件有 MouseEvent 类型
4. 全局注册后无需局部 import 也能识别模板组件
```

设计动机：

> 企业组件库的 DX 不只是能运行，还包括模板提示、类型推导和错误提示。

### 18.13 测试设计

单元测试：

```ts
describe('Button', () => {
  it('renders default slot', () => {})
  it('emits click event', () => {})
  it('does not emit click when disabled', () => {})
  it('does not emit click when loading', () => {})
  it('applies type class', () => {})
  it('applies size from props', () => {})
  it('applies native type', () => {})
})
```

ConfigProvider 集成测试：

```ts
describe('Button with ConfigProvider', () => {
  it('uses global size from provider', () => {})
  it('uses namespace from provider', () => {})
  it('props size has higher priority than provider size', () => {})
})
```

类型测试：

```ts
expectTypeOf<ButtonType>().toEqualTypeOf<
  'default' | 'primary' | 'success' | 'warning' | 'danger'
>()

expectTypeOf<ButtonProps['nativeType']>().toEqualTypeOf<
  'button' | 'submit' | 'reset' | undefined
>()
```

样式 / 构建验证：

```txt
button.css 存在
button.css 包含 .ui-button
button.css 不包含 .ui-input
Button JS 不引入 Input / Select / Table
```

设计动机：

> Button 测试不只测交互，还要测运行时上下文、类型契约和构建产物。否则无法验证组件库工程闭环。

### 18.14 文档设计

Button 文档至少包含：

```txt
何时使用
基础用法
按钮类型
按钮尺寸
禁用状态
加载状态
图标按钮
圆角 / 圆形按钮
原生 type
API
Props
Emits
Slots
CSS Variables
Accessibility
```

示例：

```vue
<UiButton>Default</UiButton>
<UiButton type="primary">Primary</UiButton>
<UiButton type="success">Success</UiButton>
<UiButton type="warning">Warning</UiButton>
<UiButton type="danger">Danger</UiButton>
```

文档说明重点：

```txt
1. nativeType 默认 button
2. disabled / loading 下不会触发 click
3. icon-only button 应提供 aria-label
4. 样式变量可通过 ConfigProvider theme 或 CSS Variables 覆盖
```

设计动机：

> Button 文档是用户理解组件库 API 风格的第一入口。它要展示组件能力，也要传达组件库的设计规范。

### 18.15 Playground 验证

Playground 页面：

```txt
apps/playground/src/pages/button.vue
```

验证场景：

```txt
1. 全量注册使用 Button
2. 手动按需引入 Button
3. ConfigProvider 修改 namespace
4. ConfigProvider 修改 size
5. ConfigProvider 修改 theme primary color
6. disabled / loading 交互
7. 表单中 nativeType=submit / button 行为
```

示例：

```vue
<UiConfigProvider size="large" :theme="theme">
  <UiButton type="primary">Primary</UiButton>
</UiConfigProvider>
```

设计动机：

> Playground 是组件真实运行环境。单元测试能验证逻辑，但无法替代真实浏览器中的样式、主题和交互验证。

### 18.16 构建产物验收

构建后应有：

```txt
packages/vue/dist/es/button/index.js
packages/vue/dist/es/button/index.d.ts
packages/vue/dist/lib/button/index.cjs
packages/theme/dist/button.css
packages/vue/dist/resolver/index.js
packages/vue/dist/global.d.ts
```

包入口：

```json
{
  "exports": {
    "./button": {
      "types": "./dist/es/button/index.d.ts",
      "import": "./dist/es/button/index.js",
      "require": "./dist/lib/button/index.cjs"
    },
    "./theme/button.css": "./dist/theme/button.css"
  }
}
```

注意：

> 如果主题包独立发布为 `@company/ui-theme`，则 Button CSS 更推荐通过 `@company/ui-theme/button.css` 暴露，而不是从 `@company/ui-vue/theme/button.css` 暴露。两种方式可以保留一种主路径，避免用户困惑。

推荐主路径：

```txt
@company/ui-theme/button.css
```

设计动机：

> 构建产物是组件库能否发布的最终证据。源码结构正确不代表 npm 包可用，必须验收 dist 结果。

### 18.17 Tree-shaking 验证

建立示例：

```txt
examples/tree-shaking-button/
├─ package.json
├─ vite.config.ts
└─ src/App.vue
```

只使用：

```vue
<UiButton type="primary">Button</UiButton>
```

构建后检查：

```txt
bundle 中不包含 UiInput
bundle 中不包含 UiSelect
bundle 中不包含 UiTable
CSS 中不包含 .ui-input
CSS 中不包含 .ui-select
CSS 中不包含 .ui-table
```

自动检查脚本：

```ts
const forbidden = [
  'UiInput',
  'UiSelect',
  'UiTable',
  '.ui-input',
  '.ui-select',
  '.ui-table'
]
```

设计动机：

> Tree-shaking 必须用实际构建产物验证，而不是相信 exports、sideEffects 或 resolver 配置。

### 18.18 第一阶段落地步骤

建议顺序：

```txt
Step 1: 建立 Button 目录结构
Step 2: 定义 constants / props / emits / slots 类型
Step 3: 实现 button.vue 基础渲染
Step 4: 实现 useButton，接入 namespace 和 size
Step 5: 实现 Button Token 和 CSS Variables
Step 6: 实现 button.scss 和 style 入口
Step 7: 在 Vue Adapter 中包装 UiButton
Step 8: 加入 components.ts 和 install
Step 9: 生成 button meta
Step 10: 接入 resolver
Step 11: 生成 global.d.ts
Step 12: 编写单元测试和类型测试
Step 13: 编写 docs 示例
Step 14: 在 playground 验证
Step 15: 构建并检查 ESM / CJS / DTS / CSS
Step 16: 运行 tree-shaking 示例
```

为什么这个顺序：

> 先完成组件本体和运行时上下文，再接入 Adapter；先保证手动入口可用，再接入 resolver；最后用构建产物和 tree-shaking 验证发布质量。

### 18.19 第一阶段验收标准

功能验收：

```txt
Button 可以渲染默认 slot
Button 支持 type / size / disabled / loading / nativeType
Button disabled 时不触发 click
Button loading 时不触发 click
Button nativeType 默认是 button
Button 可以使用 icon slot 和 loading slot
Button 可以通过 ConfigProvider 读取 size
Button 可以通过 ConfigProvider 读取 namespace
Button props.size 优先级高于 ConfigProvider size
```

工程验收：

```txt
@company/ui-vue/button 可以手动按需引入
@company/ui-theme/button.css 可以单独引入
resolver 可以自动导入 UiButton 和 button.css
global.d.ts 可以识别 UiButton
Button 类型可以被业务项目复用
Button 单元测试通过
Button 类型测试通过
Button 文档示例可运行
Button playground 可交互验证
Button 构建产物包含 ESM / CJS / DTS / CSS
Tree-shaking 示例只包含 Button
```

架构验收：

```txt
packages/components/button 不依赖 @company/ui-vue
withInstall 只存在于 @company/ui-vue
Button 不包含业务字段
Button 样式不写死品牌色
Button 通过 useNamespace / useConfig 消费运行时上下文
Button meta 可用于 resolver / docs / global types 生成
```

### 18.20 常见设计陷阱

#### 陷阱一：Button 组件包直接使用 withInstall

问题：

```ts
// packages/components/button/index.ts
import { withInstall } from '@company/ui-vue'
```

风险：

> components 反向依赖 vue adapter，破坏分层。

修复：

```txt
components/button 只导出原始组件；@company/ui-vue/button 负责 withInstall 包装。
```

#### 陷阱二：Button 内置业务语义

问题：

```ts
permissionCode: String
trackingId: String
requestUrl: String
```

风险：

> 基础组件被业务污染，后续难以复用和维护。

修复：

```txt
权限放到 v-permission；埋点放到指令或业务封装；请求状态由业务层控制 loading。
```

#### 陷阱三：Button 样式写死颜色

问题：

```scss
background: #1677ff;
```

风险：

> 主题系统无法生效，多品牌和暗色模式都需要重写样式。

修复：

```scss
background: var(--ui-button-primary-bg);
```

#### 陷阱四：nativeType 默认 submit

问题：

```ts
nativeType: {
  default: 'submit'
}
```

风险：

> Button 放在 form 内可能意外提交表单。

修复：

```txt
nativeType 默认 button，需要提交时用户显式设置 submit。
```

#### 陷阱五：loading 状态仍触发 click

问题：

```ts
function handleClick(event) {
  emit('click', event)
}
```

风险：

> 用户可能重复提交表单或重复触发异步操作。

修复：

```txt
disabled 或 loading 时不触发 click。
```

### 18.21 7 个维度总结

#### 架构分层

```txt
Button 原始组件：packages/components/button
Button Vue 安装入口：packages/vue/src/button.ts
Button 样式变量：packages/theme
Button 运行时上下文：packages/vue/config-provider
Button 文档示例：apps/docs
Button 使用验证：apps/playground / examples/tree-shaking-button
```

#### 模块划分

```txt
props / emits / slots
useButton
button.vue
button.scss
style entry
meta
vue adapter entry
tests
docs
playground
```

#### 依赖关系

```txt
components/button
  → ui-core types
  → ui-hooks or vue runtime hooks only if hooks package定位允许
  → ui-theme css variables through style

vue/button
  → components/button
  → withInstall
```

注意：

> 如果 `useNamespace` 和 `useConfig` 放在 `@company/ui-vue`，那么 Button SFC 直接调用它们会让 `components/button` 依赖 `ui-vue`。更严格的架构是：Vue 组件实现本身放在 `ui-vue`，或者把 Vue runtime hooks 下沉到一个允许被 components 依赖的 `ui-hooks` 包。第一阶段需要明确这个边界。

推荐第一阶段选择：

```txt
Vue SFC 基础组件放在 packages/components
Vue 运行时 hooks 放在 packages/hooks
@company/ui-vue 负责 install / ConfigProvider / resolver / global types
```

这样依赖方向变为：

```txt
components/button → hooks → core/utils
vue adapter → components/button
```

#### 设计模式

```txt
Adapter Pattern：vue/button 包装原始 Button
Composition API：useButton / useNamespace / useConfig
Provider Pattern：ConfigProvider 提供 size / namespace
Metadata Pattern：buttonMeta 驱动 resolver / docs / global types
Token Pattern：Button Token 驱动样式变量
```

#### 潜在坑点

```txt
components 反向依赖 vue adapter
Button 混入业务 props
样式写死颜色
nativeType 默认值错误
loading 不阻止 click
resolver meta 手写后长期漂移
文档示例和真实 API 不一致
```

#### 最佳实践

```txt
Button 只做基础交互和 UI 状态
props / emits / slots 显式导出
样式全部基于 CSS Variables
组件安装逻辑放在 Vue Adapter
meta 由生成器维护
测试覆盖行为、类型、上下文和构建产物
playground 做真实运行验证
```

#### 学习与思考点

```txt
最简单的组件也能暴露架构边界问题
组件库的难点不在 Button 本身，而在它背后的工程闭环
按需引入要同时验证 JS 和 CSS
类型体验需要专门测试，不是写了 TypeScript 就自动成立
组件目录规范应该从第一个组件开始建立
```

### 18.22 架构能力表达点

在架构评审中，这一节可以这样表达：

> 我会用 Button 作为组件库的第一个最小闭环样板，而不是直接从复杂组件开始。Button 虽然简单，但可以验证组件目录、Props/Emits/Slots 类型、namespace、size、主题 Token、CSS Variables、样式按需加载、Vue Adapter 包装、resolver、global.d.ts、测试、文档、playground 和构建产物。通过 Button 先跑通从源码到发布包的完整链路，再把这套标准沉淀为组件生成器模板，后续 Input、Select、Form、Table 才能在统一规范下扩展。

---

## 19. 国际化 i18n 体系设计

本节目标是设计组件库自己的国际化体系，包括 Locale 协议、语言包组织、ConfigProvider 注入、`useLocale`、类型安全、fallback、动态切换、SSR、与 `vue-i18n` 的集成边界，以及第一阶段落地和验收标准。

推荐定位：

```txt
组件库内置轻量 Locale 协议 + Vue Adapter 注入 + 可选业务 i18n bridge
```

设计原则：

> 组件库需要自己的语言包协议，但不应该强制业务项目使用某个 i18n 框架。组件库负责内部文案的稳定类型和读取方式，业务应用负责自己的业务文案体系。

### 19.1 为什么组件库需要独立 i18n 体系

很多基础组件内部都有固定文案：

```txt
Pagination: total / page / pageSize / jumpTo
DatePicker: today / now / clear / confirm
Select: noData / loading / clear
Table: empty / filter / reset / confirm
Upload: retry / remove / preview
Popconfirm: confirm / cancel
MessageBox: confirm / cancel
```

如果每个组件自己写文案，会出现问题：

```txt
1. 文案不统一
2. 语言切换困难
3. 用户无法全局覆盖
4. 类型无法约束语言包完整性
5. 文档难以生成语言包说明
6. SSR 首屏语言可能和客户端不一致
7. 业务项目接入 vue-i18n 时无法复用组件库语言包
```

错误示例：

```ts
const text = props.clearText ?? '清空'
```

问题：

> 文案散落在组件内部，后期支持英文、日文、多租户定制时会非常痛苦。

设计动机：

> 国际化不是简单替换字符串，而是把组件库内部文案变成稳定协议，并通过运行时上下文统一下发。

### 19.2 与业务 i18n 的边界

组件库 i18n 只负责组件库内部文案：

```txt
确认
取消
清空
暂无数据
每页条数
上传失败
选择日期
```

业务 i18n 负责业务领域文案：

```txt
订单提交成功
客户名称
审批状态
库存不足
营销活动标题
```

边界规则：

```txt
1. 组件库不接管业务文案
2. 业务项目不需要为了使用组件库而强制安装 vue-i18n
3. 组件库语言包可以被业务 i18n 系统复用
4. Pro Components 可以扩展自己的语言包命名空间
5. 基础组件不得出现业务领域 key
```

错误示例：

```ts
locale.order.submitSuccess
locale.customer.name
```

修复：

```txt
这些属于业务应用或 Pro Components，不属于基础组件库 locale。
```

设计动机：

> 组件库 i18n 是基础设施协议，不是业务翻译中心。边界越清楚，语言包越稳定。

### 19.3 Locale 包分层归属

推荐分工：

```txt
@company/ui-core
  定义 LocaleMessages 类型和基础协议

@company/ui-vue
  提供 ConfigProvider 注入、useLocale、Vue 默认语言包导出

@company/ui-pro-components
  扩展 ProLocaleMessages

业务应用
  可选择接入 vue-i18n 或其他 i18n 框架
```

目录建议：

```txt
packages/core/src/locale/
├─ types.ts
└─ index.ts

packages/vue/src/locale/
├─ zh-cn.ts
├─ en-us.ts
├─ use-locale.ts
├─ path.ts
└─ index.ts

packages/pro-components/src/locale/
├─ types.ts
├─ zh-cn.ts
├─ en-us.ts
└─ index.ts
```

设计动机：

> LocaleMessages 类型是跨框架协议，应放在 Core；Vue 的 provide/inject 和 hooks 是 Vue Adapter 能力，应放在 `@company/ui-vue`。

### 19.4 LocaleMessages 类型设计

基础类型：

```ts
export interface LocaleMessages {
  name: string
  common: {
    confirm: string
    cancel: string
    clear: string
    reset: string
    close: string
    loading: string
    noData: string
  }
  pagination: {
    total: string
    page: string
    pageSize: string
    jumpTo: string
    prevPage: string
    nextPage: string
  }
  datePicker: {
    today: string
    now: string
    clear: string
    confirm: string
    selectDate: string
    selectTime: string
    startDate: string
    endDate: string
  }
  select: {
    placeholder: string
    noData: string
    loading: string
    clear: string
  }
  table: {
    empty: string
    filter: string
    reset: string
    confirm: string
    sortAscending: string
    sortDescending: string
  }
  upload: {
    upload: string
    retry: string
    remove: string
    preview: string
    uploadError: string
  }
  popconfirm: {
    confirm: string
    cancel: string
  }
}
```

命名原则：

```txt
1. 按组件或通用领域分组
2. common 放跨组件共享文案
3. key 使用稳定语义，不使用具体中文拼音
4. 不把业务字段放入基础 LocaleMessages
5. 复杂文案优先支持函数或插值参数
```

带参数文案：

```ts
export interface PaginationLocale {
  total: string | ((total: number) => string)
}
```

示例：

```ts
pagination: {
  total: (total) => `共 ${total} 条`
}
```

设计动机：

> 语言包类型要先稳定，否则组件越多，文案 key 越容易混乱。按组件分组能让维护者快速定位文案来源。

### 19.5 默认语言包设计

`zh-cn.ts`：

```ts
import type { LocaleMessages } from '@company/ui-core'

const zhCN: LocaleMessages = {
  name: 'zh-cn',
  common: {
    confirm: '确认',
    cancel: '取消',
    clear: '清空',
    reset: '重置',
    close: '关闭',
    loading: '加载中',
    noData: '暂无数据'
  },
  pagination: {
    total: (total) => `共 ${total} 条`,
    page: '页',
    pageSize: '条/页',
    jumpTo: '跳至',
    prevPage: '上一页',
    nextPage: '下一页'
  }
}

export default zhCN
```

`en-us.ts`：

```ts
const enUS: LocaleMessages = {
  name: 'en-us',
  common: {
    confirm: 'OK',
    cancel: 'Cancel',
    clear: 'Clear',
    reset: 'Reset',
    close: 'Close',
    loading: 'Loading',
    noData: 'No Data'
  },
  pagination: {
    total: (total) => `${total} items`,
    page: 'Page',
    pageSize: '/ page',
    jumpTo: 'Go to',
    prevPage: 'Previous Page',
    nextPage: 'Next Page'
  }
}

export default enUS
```

第一阶段推荐内置：

```txt
zh-cn
en-us
```

后续再扩展：

```txt
zh-tw
ja-jp
ko-kr
fr-fr
de-de
```

设计动机：

> 第一阶段不要为了语言数量牺牲质量。先把中文和英文的协议、类型、切换和覆盖跑通，再扩展更多语言。

### 19.6 ConfigProvider 注入设计

全局配置：

```ts
import Ui from '@company/ui-vue'
import enUS from '@company/ui-vue/locale/en-us'

app.use(Ui, {
  locale: enUS
})
```

局部配置：

```vue
<UiConfigProvider :locale="enUS">
  <App />
</UiConfigProvider>
```

嵌套覆盖：

```vue
<UiConfigProvider :locale="zhCN">
  <AdminPage />

  <UiConfigProvider :locale="enUS">
    <InternationalPanel />
  </UiConfigProvider>
</UiConfigProvider>
```

优先级：

```txt
当前 ConfigProvider locale
  > 父级 ConfigProvider locale
  > app.use locale
  > 默认 zh-cn
```

设计动机：

> 语言是运行时上下文能力，必须支持全局设置和局部覆盖。例如同一个后台中嵌入国际业务模块时，局部英文区域应该可独立切换。

### 19.7 useLocale 设计

组件内部使用：

```ts
const { locale, t } = useLocale()

const clearText = computed(() => t('common.clear'))
const totalText = computed(() => t('pagination.total', 100))
```

API：

```ts
export interface UseLocaleReturn {
  locale: ComputedRef<LocaleMessages>
  t: (path: LocalePath, ...args: unknown[]) => string
}

export function useLocale(): UseLocaleReturn {
  const config = useConfig()

  const locale = computed(() => config.locale.value ?? zhCN)

  function t(path: LocalePath, ...args: unknown[]) {
    const value = getByPath(locale.value, path) ?? getByPath(zhCN, path)

    if (typeof value === 'function') {
      return value(...args)
    }

    return value ?? path
  }

  return {
    locale,
    t
  }
}
```

设计规则：

```txt
1. 组件只通过 useLocale 读取文案
2. 不在组件内直接 import zhCN
3. 缺失 key fallback 到默认语言
4. 默认语言也缺失时返回 key，便于暴露问题
5. 支持函数文案处理参数
```

设计动机：

> `useLocale` 是组件和语言包之间的稳定接口。组件不应该关心语言包来自 ConfigProvider、app.use 还是业务 i18n bridge。

### 19.8 类型安全的 path 设计

基础做法：

```ts
export type LocalePath = string
```

优点：简单。

缺点：无法检查 key 是否存在。

更推荐：生成路径联合类型。

```ts
export type LocalePath =
  | 'common.confirm'
  | 'common.cancel'
  | 'common.clear'
  | 'pagination.total'
  | 'pagination.page'
  | 'datePicker.today'
  | 'select.noData'
```

可由脚本生成：

```txt
LocaleMessages 类型 / 默认语言包
  ↓
generate-locale-paths.ts
  ↓
locale-paths.d.ts
```

第一阶段推荐：

```txt
先使用 string path，保留 LocalePath 类型别名；
第二阶段由生成器生成严格联合类型。
```

原因：

> 严格 LocalePath 类型体验更好，但实现成本较高。第一阶段先把协议和运行时跑通，再增强类型安全。

### 19.9 语言包合并与覆盖

用户可能只想覆盖部分文案：

```ts
app.use(Ui, {
  locale: {
    ...zhCN,
    common: {
      ...zhCN.common,
      confirm: '确定'
    }
  }
})
```

可以提供工具：

```ts
export function mergeLocale(
  base: LocaleMessages,
  override: DeepPartial<LocaleMessages>
): LocaleMessages
```

使用：

```ts
const customLocale = mergeLocale(zhCN, {
  common: {
    confirm: '确定'
  }
})
```

合并规则：

```txt
1. 对象深合并
2. 函数文案整体替换
3. undefined 不覆盖已有值
4. name 可以覆盖
5. 缺失字段 fallback 默认语言
```

设计动机：

> 企业内部经常需要微调文案，比如“确认”改成“确定”。如果必须复制完整语言包，维护成本会很高。

### 19.10 动态切换语言

响应式配置：

```vue
<script setup lang="ts">
import { ref } from 'vue'
import zhCN from '@company/ui-vue/locale/zh-cn'
import enUS from '@company/ui-vue/locale/en-us'

const locale = ref(zhCN)
</script>

<template>
  <UiConfigProvider :locale="locale">
    <UiButton @click="locale = enUS">English</UiButton>
    <App />
  </UiConfigProvider>
</template>
```

组件内部：

```ts
const { t } = useLocale()

const emptyText = computed(() => t('common.noData'))
```

要求：

```txt
1. locale 切换后组件文案响应式更新
2. 不需要重新挂载整个应用
3. 局部 ConfigProvider 可以独立切换
4. SSR 初始 locale 与客户端一致
```

设计动机：

> 国际化必须是运行时能力，而不是构建时替换。企业应用常常需要用户手动切换语言。

### 19.11 与 vue-i18n 的集成边界

第一阶段不强依赖 `vue-i18n`。

原因：

```txt
1. 组件库应该可被不使用 vue-i18n 的项目使用
2. 业务项目可能使用自研 i18n
3. 强依赖会增加 bundle 和 peer dependency 复杂度
4. 基础组件内部文案结构比业务 i18n 简单
```

第二阶段提供 bridge：

```ts
export function createVueI18nLocaleBridge(i18n: Composer, namespace = 'ui') {
  return computed(() => i18n.getLocaleMessage(i18n.locale.value)[namespace])
}
```

使用：

```ts
const uiLocale = createVueI18nLocaleBridge(i18n, 'ui')

<UiConfigProvider :locale="uiLocale">
  <App />
</UiConfigProvider>
```

业务 messages：

```ts
const messages = {
  zhCN: {
    ui: zhCN,
    order: {
      submit: '提交订单'
    }
  }
}
```

设计动机：

> 组件库要和主流业务 i18n 框架兼容，但不能被它绑定。bridge 是适配层，而不是核心依赖。

### 19.12 Pro Components 语言包扩展

Pro 组件需要更多业务中后台文案：

```txt
ProTable: query / reset / columnSetting / density / export
ProForm: submit / reset / validateFailed
QueryFilter: expand / collapse
PageContainer: back / refresh
```

扩展类型：

```ts
export interface ProLocaleMessages {
  proTable: {
    query: string
    reset: string
    columnSetting: string
    density: string
    export: string
  }
  proForm: {
    submit: string
    reset: string
    validateFailed: string
  }
}
```

组合方式：

```ts
export interface FullLocaleMessages extends LocaleMessages {
  pro?: ProLocaleMessages
}
```

依赖规则：

```txt
基础 LocaleMessages 不依赖 ProLocaleMessages
ProLocaleMessages 扩展基础 LocaleMessages
@company/ui-vue 不依赖 @company/ui-pro-components
```

设计动机：

> Pro Components 可以扩展语言包，但不能反向要求基础组件库认识所有业务增强文案。

### 19.13 SSR 设计

SSR 需要保证服务端和客户端语言一致。

服务端：

```ts
const locale = resolveLocaleFromRequest(request)

renderToString(app, {
  locale
})
```

模板注入：

```html
<script>
  window.__UI_LOCALE__ = 'en-us'
</script>
```

客户端：

```ts
const locale = window.__UI_LOCALE__ === 'en-us' ? enUS : zhCN

app.use(Ui, {
  locale
})
```

规则：

```txt
1. 服务端渲染用的 locale 必须和客户端 hydration locale 一致
2. useLocale 不访问 window / document
3. 语言包是纯对象，可服务端加载
4. 动态 import 语言包时要处理首屏 fallback
```

设计动机：

> 如果 SSR 首屏语言是中文，客户端 hydration 后变英文，会造成文案闪烁甚至 hydration mismatch。

### 19.14 语言包加载策略

小型语言包：

```ts
import zhCN from '@company/ui-vue/locale/zh-cn'
import enUS from '@company/ui-vue/locale/en-us'
```

大量语言包时：

```ts
const locale = await import(`@company/ui-vue/locale/${localeName}`)
```

推荐第一阶段：

```txt
zh-cn / en-us 直接静态导出
其他语言未来通过子路径导出支持手动懒加载
```

package exports：

```json
{
  "exports": {
    "./locale/zh-cn": {
      "types": "./dist/locale/zh-cn.d.ts",
      "import": "./dist/locale/zh-cn.js"
    },
    "./locale/en-us": {
      "types": "./dist/locale/en-us.d.ts",
      "import": "./dist/locale/en-us.js"
    }
  }
}
```

设计动机：

> 语言包应该支持按需加载。用户只用中文时，不应该被迫打入所有语言。

### 19.15 测试设计

单元测试：

```ts
describe('useLocale', () => {
  it('uses default zh-cn locale', () => {})
  it('uses locale from ConfigProvider', () => {})
  it('falls back to default locale when key is missing', () => {})
  it('supports function messages', () => {})
  it('updates when locale changes', () => {})
})
```

组件集成测试：

```ts
describe('Pagination locale', () => {
  it('renders total text in zh-cn', () => {})
  it('renders total text in en-us', () => {})
})
```

类型测试：

```ts
expectTypeOf(zhCN).toMatchTypeOf<LocaleMessages>()
expectTypeOf(enUS).toMatchTypeOf<LocaleMessages>()
```

构建测试：

```txt
@company/ui-vue/locale/zh-cn 可单独 import
@company/ui-vue/locale/en-us 可单独 import
只引入 zh-cn 不应打入 en-us
```

设计动机：

> i18n 的测试不仅是字符串是否正确，还要验证响应式切换、fallback、类型完整性和语言包按需加载。

### 19.16 文档设计

文档需要包含：

```txt
基础用法
全局配置语言
局部 ConfigProvider 覆盖语言
动态切换语言
自定义语言包
局部覆盖文案
与 vue-i18n 集成
SSR 注意事项
语言包 API
```

示例：

```ts
import { createApp } from 'vue'
import Ui from '@company/ui-vue'
import enUS from '@company/ui-vue/locale/en-us'

createApp(App).use(Ui, {
  locale: enUS
})
```

自定义语言包：

```ts
import { mergeLocale } from '@company/ui-vue/locale'
import zhCN from '@company/ui-vue/locale/zh-cn'

const customZhCN = mergeLocale(zhCN, {
  common: {
    confirm: '确定'
  }
})
```

设计动机：

> 国际化使用成本主要取决于文档。用户需要知道如何全局切换、如何局部覆盖、如何和现有业务 i18n 共存。

### 19.17 第一阶段落地步骤

建议顺序：

```txt
Step 1: 在 core 定义 LocaleMessages 类型
Step 2: 在 vue/locale 创建 zh-cn 和 en-us
Step 3: 在 UiVueConfig 中加入 locale
Step 4: ConfigProvider 支持 locale provide/inject
Step 5: 实现 useLocale
Step 6: 实现 getByPath 和函数文案调用
Step 7: 实现 fallback 到 zh-cn
Step 8: 实现 mergeLocale
Step 9: 为 Pagination / Select / DatePicker 等组件预留 locale key
Step 10: 编写 useLocale 单元测试
Step 11: 编写语言包类型测试
Step 12: 配置 locale 子路径 exports
Step 13: 编写文档和 playground 示例
Step 14: 验证动态切换语言
Step 15: 验证只引入 zh-cn 不打入 en-us
```

为什么这个顺序：

> 先定义协议，再提供默认语言包；先让 ConfigProvider 和 useLocale 跑通，再接入具体组件；最后验证构建和 Tree-shaking。

### 19.18 第一阶段验收标准

功能验收：

```txt
app.use(Ui, { locale }) 可以设置全局语言
UiConfigProvider 可以局部覆盖 locale
嵌套 ConfigProvider locale 继承和覆盖正确
useLocale 可以读取 common 文案
useLocale 支持函数文案参数
缺失 key 可以 fallback 到 zh-cn
locale 响应式变化后组件文案更新
```

工程验收：

```txt
LocaleMessages 类型在 core 中定义
zh-cn / en-us 满足 LocaleMessages 类型
@company/ui-vue/locale/zh-cn 可以单独导入
@company/ui-vue/locale/en-us 可以单独导入
mergeLocale 可以局部覆盖语言包
useLocale 单元测试通过
语言包类型测试通过
文档示例可运行
只导入 zh-cn 不会打入 en-us
```

架构验收：

```txt
基础 LocaleMessages 不包含业务字段
@company/ui-core 不依赖 vue-i18n
@company/ui-vue 不强依赖 vue-i18n
@company/ui-vue 不依赖 pro-components locale
ProLocaleMessages 只能扩展基础语言包
组件内部不写死文案
组件内部不直接 import zhCN
```

### 19.19 常见设计陷阱

#### 陷阱一：强依赖 vue-i18n

问题：

```ts
import { useI18n } from 'vue-i18n'
```

风险：

> 所有用户都被迫安装 vue-i18n，组件库和业务 i18n 框架强绑定。

修复：

```txt
组件库内置轻量 Locale 协议；vue-i18n 通过 bridge 可选集成。
```

#### 陷阱二：组件内部写死文案

问题：

```ts
const emptyText = '暂无数据'
```

风险：

> 无法统一切换语言，也无法被用户覆盖。

修复：

```ts
const emptyText = computed(() => t('common.noData'))
```

#### 陷阱三：语言包混入业务字段

问题：

```ts
locale.order.submitSuccess
```

风险：

> 基础语言包变成业务字典，后续难以维护。

修复：

```txt
业务字段放业务 i18n；Pro 组件字段放 ProLocaleMessages。
```

#### 陷阱四：所有语言包被根入口打包

问题：

```ts
export * from './locale/zh-cn'
export * from './locale/en-us'
export * from './locale/ja-jp'
```

风险：

> 用户只使用中文，也可能打入所有语言。

修复：

```txt
语言包通过独立子路径导出，由用户按需 import。
```

#### 陷阱五：动态切换语言不响应

问题：

```ts
const currentLocale = config.locale.value
```

风险：

> setup 时只读取一次，后续切换语言组件不更新。

修复：

```ts
const locale = computed(() => config.locale.value ?? zhCN)
```

### 19.20 7 个维度总结

#### 架构分层

```txt
Core：定义 LocaleMessages 协议
Vue Adapter：提供语言包、ConfigProvider 注入、useLocale
Components：通过 useLocale 消费文案
Pro Components：扩展 ProLocaleMessages
业务应用：负责业务 i18n 和可选 vue-i18n 集成
```

#### 模块划分

```txt
locale types
zh-cn / en-us
useLocale
mergeLocale
getByPath
ConfigProvider locale
locale exports
vue-i18n bridge
ProLocaleMessages
```

#### 依赖关系

```txt
core/locale 不依赖任何框架
vue/locale 依赖 core locale 类型和 Vue runtime context
components 通过 hooks 读取 locale
pro-components 扩展 locale，不反向污染基础包
业务 i18n 通过 bridge 适配
```

#### 设计模式

```txt
Provider Pattern：ConfigProvider 下发 locale
Adapter Pattern：vue-i18n bridge
Strategy Pattern：不同 locale messages
Fallback Pattern：缺失 key 回退默认语言
Type Contract：LocaleMessages 约束语言包完整性
```

#### 潜在坑点

```txt
强绑定 vue-i18n
组件写死中文文案
语言包包含业务字段
所有语言包被根入口打入
locale path 无类型约束
SSR 服务端和客户端语言不一致
Pro locale 反向污染基础 locale
```

#### 最佳实践

```txt
组件内部只通过 useLocale 读文案
基础语言包只包含组件库文案
语言包独立子路径导出
默认内置 zh-cn / en-us
支持 mergeLocale 局部覆盖
支持 ConfigProvider 嵌套覆盖
vue-i18n 作为可选 bridge
SSR 保证初始语言一致
```

#### 学习与思考点

```txt
i18n 是组件库协议，不只是翻译文件
语言包设计要先定义边界，再定义 key
业务 i18n 和组件库 i18n 应该解耦
类型安全可以逐步增强，不必第一天过度复杂
SSR 下语言一致性和主题一致性一样重要
```

### 19.21 架构能力表达点

在架构评审中，这一节可以这样表达：

> 我会把组件库国际化设计成独立的 Locale 协议，而不是直接绑定业务项目的 vue-i18n。Core 层定义 LocaleMessages 类型，Vue Adapter 提供 zh-cn、en-us、ConfigProvider 注入和 useLocale，组件内部只通过 useLocale 读取文案，Pro Components 通过 ProLocaleMessages 扩展自己的中后台文案。语言包支持局部覆盖、fallback、动态切换和独立子路径导出，后续再通过 bridge 与 vue-i18n 集成。这样既能保证基础组件文案一致，又不会强迫业务项目采用特定 i18n 框架。

---

## 20. Form 表单体系设计

本节目标是设计企业级组件库中的表单体系，包括 `Form`、`FormItem`、输入类组件的协作关系、上下文传递、校验模型、类型设计、布局、可访问性、依赖边界、异步校验、动态表单和第一阶段落地标准。

推荐定位：

```txt
Form = 表单状态、布局和校验协调器
FormItem = 字段级上下文、校验和反馈容器
Input / Select / Checkbox = 受控输入组件，不直接依赖具体 Form 实现
```

设计原则：

> Form 体系最容易形成循环依赖和业务污染。正确做法不是让 Input、Form、FormItem 互相 import，而是通过稳定的 form context 和 hooks 建立低耦合协作。

### 20.1 为什么 Form 是组件库核心复杂模块

Form 不是单个组件，而是一组协作协议。

它涉及：

```txt
数据模型 model
字段路径 prop / name
校验规则 rules
校验触发时机 trigger
错误状态 error
布局 label / wrapper / inline
必填标识 required
输入组件状态 disabled / size / status
异步校验
动态字段注册与注销
滚动到错误字段
可访问性 aria-describedby / aria-invalid
TypeScript 字段路径推导
```

如果设计不好，会出现问题：

```txt
1. Input 直接 import FormItem，形成循环依赖
2. FormItem 直接操控子组件内部状态
3. rules 类型和 model 类型脱节
4. 动态表单字段注销后仍残留校验状态
5. disabled / size / status 优先级混乱
6. 异步校验竞态导致旧结果覆盖新结果
7. 业务 schema 逻辑进入基础 Form
```

设计动机：

> Form 是最能检验组件库架构边界的模块。它既需要基础组件协作，又不能让基础组件被业务表单逻辑绑死。

### 20.2 Form 体系组件边界

推荐划分：

```txt
UiForm
  管理整体 model、rules、layout、disabled、size、validate API

UiFormItem
  管理单字段 label、prop、required、error、validateState、feedback

Input / Select / Checkbox / Radio / DatePicker
  只负责自身输入值、交互、展示状态

useFormItem
  输入组件读取可选字段上下文
```

依赖方向：

```txt
Form provide form context
FormItem inject form context + provide form item context
Input inject optional form item context
```

禁止：

```txt
Input import Form
Input import FormItem
Form import Input
FormItem 直接读取 Input 实例内部状态
```

允许：

```txt
Input 使用 useFormItem()
FormItem 使用 provide/inject 管理字段上下文
Form 使用字段注册表管理 FormItem
```

设计动机：

> 表单协作应该通过上下文协议完成，而不是组件实现互相引用。这样 Input 可以独立使用，也可以在 FormItem 中增强。

### 20.3 包归属与依赖边界

推荐第一阶段结构：

```txt
packages/components/form/
├─ src/
│  ├─ form.vue
│  ├─ form-item.vue
│  ├─ form.ts
│  ├─ form-item.ts
│  ├─ context.ts
│  ├─ types.ts
│  ├─ use-form.ts
│  ├─ use-form-item.ts
│  └─ utils.ts
├─ style/
├─ __tests__/
├─ docs/
├─ meta.ts
└─ index.ts
```

但要注意：

```txt
如果 Input 需要 useFormItem，而 useFormItem 放在 components/form 内，Input 就会依赖 Form 包。
```

更稳妥的分层：

```txt
packages/hooks/use-form-item
  定义 FormItemContextKey 和 useFormItem

packages/components/form
  实现 Form / FormItem，并 provide context

packages/components/input
  通过 @company/ui-hooks/use-form-item 可选消费 context
```

推荐第一阶段选择：

```txt
Form 上下文协议放到 @company/ui-hooks/use-form-item
Form / FormItem 实现放在 @company/ui-components/form
Input / Select 等输入组件依赖 @company/ui-hooks/use-form-item
```

依赖图：

```txt
components/input
  ↓
hooks/use-form-item
  ↑
components/form
```

注意：

> hooks 包需要允许依赖 Vue peer，但不能依赖具体组件实现。

设计动机：

> 把 form context 抽到 hooks，是为了防止 Input 和 Form 直接互相依赖。这是表单体系避免循环依赖的关键。

### 20.4 Form 数据模型设计

基础用法：

```vue
<UiForm :model="form" :rules="rules">
  <UiFormItem label="用户名" prop="username">
    <UiInput v-model="form.username" />
  </UiFormItem>
</UiForm>
```

类型：

```ts
export type FormModel = Record<string, unknown>

export interface FormProps<T extends FormModel = FormModel> {
  model?: T
  rules?: FormRules<T>
  disabled?: boolean
  size?: ComponentSize
  labelWidth?: string | number
  labelPosition?: 'left' | 'right' | 'top'
  inline?: boolean
  validateOnRuleChange?: boolean
  scrollToError?: boolean
}
```

字段路径：

```ts
export type FormPath<T> = string
```

第一阶段建议：

```txt
FormPath<T> 先使用 string，保证落地简单；
第二阶段再增强为深层路径联合类型，例如 'user.name' | 'items.0.name'。
```

原因：

> 深层路径类型推导很有价值，但实现复杂度高。第一阶段重点是上下文、校验和组件协作闭环。

### 20.5 Rules 类型设计

规则类型：

```ts
export interface FormRule<T = unknown> {
  required?: boolean
  message?: string
  trigger?: FormValidateTrigger | FormValidateTrigger[]
  validator?: FormValidator<T>
  min?: number
  max?: number
  len?: number
  pattern?: RegExp
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'email' | 'url'
}

export type FormValidateTrigger = 'change' | 'blur' | 'submit'

export type FormValidator<T = unknown> = (
  rule: FormRule<T>,
  value: T,
  callback?: (error?: string | Error) => void
) => boolean | string | Error | Promise<boolean | string | Error | void> | void

export type FormRules<T extends FormModel = FormModel> = Partial<{
  [K in keyof T]: FormRule<T[K]> | FormRule<T[K]>[]
}> & Record<string, FormRule | FormRule[]>
```

设计说明：

```txt
1. required / min / max / pattern 覆盖常见规则
2. validator 支持同步和异步
3. trigger 支持 change / blur / submit
4. rules 支持按 model key 类型推导
5. Record<string, ...> 保留深层路径扩展空间
```

设计动机：

> Form rules 要在易用性和类型严谨之间平衡。第一阶段不要追求完全类型推导，但要保留未来增强空间。

### 20.6 FormContext 设计

Form provide：

```ts
export interface FormContext<T extends FormModel = FormModel> {
  model: ComputedRef<T | undefined>
  rules: ComputedRef<FormRules<T> | undefined>
  disabled: ComputedRef<boolean>
  size: ComputedRef<ComponentSize>
  labelWidth: ComputedRef<string | number | undefined>
  labelPosition: ComputedRef<FormLabelPosition>
  inline: ComputedRef<boolean>
  addField: (field: FormItemContext) => void
  removeField: (field: FormItemContext) => void
  validate: (props?: FormPath<T>[]) => Promise<FormValidateResult>
  validateField: (prop: FormPath<T>) => Promise<FormFieldValidateResult>
  clearValidate: (props?: FormPath<T>[]) => void
  resetFields: (props?: FormPath<T>[]) => void
  scrollToField: (prop: FormPath<T>) => void
}
```

字段注册：

```ts
const fields = new Set<FormItemContext>()

function addField(field: FormItemContext) {
  if (field.prop) fields.add(field)
}

function removeField(field: FormItemContext) {
  fields.delete(field)
}
```

设计动机：

> Form 不应该通过 DOM 查找字段，也不应该知道具体输入组件。字段注册表让 Form 只管理 FormItem 上下文。

### 20.7 FormItemContext 设计

FormItem provide：

```ts
export interface FormItemContext {
  prop?: string
  id: string
  label?: string
  required: ComputedRef<boolean>
  validateState: Ref<FormValidateState>
  validateMessage: Ref<string>
  inputIds: Ref<string[]>
  addInputId: (id: string) => void
  removeInputId: (id: string) => void
  validate: (trigger?: FormValidateTrigger) => Promise<FormFieldValidateResult>
  clearValidate: () => void
  resetField: () => void
}

export type FormValidateState = '' | 'success' | 'error' | 'validating'
```

Input 通过 `useFormItem` 读取：

```ts
const formItem = useFormItem()

const inputStatus = computed(() => props.status ?? formItem?.validateState.value)
```

设计动机：

> FormItem 是字段级协议中心。输入组件只需要知道自己是否处于 error / validating 状态，不需要知道整张表单如何校验。

### 20.8 useFormItem 设计

放置位置：

```txt
packages/hooks/use-form-item
```

API：

```ts
export function useFormItem() {
  const form = inject(formContextKey, undefined)
  const formItem = inject(formItemContextKey, undefined)

  return {
    form,
    formItem,
    size: computed(() => formItem?.size?.value ?? form?.size.value),
    disabled: computed(() => form?.disabled.value ?? false),
    validateState: computed(() => formItem?.validateState.value ?? ''),
    validateMessage: computed(() => formItem?.validateMessage.value ?? '')
  }
}
```

输入组件触发校验：

```ts
function handleChange(value: unknown) {
  emit('update:modelValue', value)
  emit('change', value)
  formItem?.validate('change')
}

function handleBlur(event: FocusEvent) {
  emit('blur', event)
  formItem?.validate('blur')
}
```

设计规则：

```txt
1. FormItem 缺失时输入组件仍可独立工作
2. useFormItem 返回可选上下文
3. 输入组件不 import Form / FormItem
4. 输入组件只在 change / blur 时通知 FormItem 校验
5. props.status 优先级高于 FormItem validateState
```

设计动机：

> `useFormItem` 是避免表单循环依赖的关键抽象。它把输入组件和表单容器之间的关系变成可选协作，而不是强依赖。

### 20.9 校验流程设计

字段校验流程：

```txt
触发 change / blur / submit
  ↓
FormItem.validate(trigger)
  ↓
根据 prop 从 Form.rules 中取规则
  ↓
按 trigger 过滤规则
  ↓
从 Form.model 中取字段值
  ↓
执行规则
  ↓
更新 validateState / validateMessage
  ↓
返回校验结果
```

结果类型：

```ts
export interface FormFieldValidateResult {
  valid: boolean
  prop: string
  message?: string
  errors?: Error[]
}

export interface FormValidateResult {
  valid: boolean
  fields: Record<string, FormFieldValidateResult>
}
```

Form.validate：

```ts
async function validate(props?: string[]) {
  const targetFields = getTargetFields(fields, props)
  const results = await Promise.all(targetFields.map((field) => field.validate('submit')))

  return {
    valid: results.every((result) => result.valid),
    fields: Object.fromEntries(results.map((result) => [result.prop, result]))
  }
}
```

设计动机：

> Form 负责协调多个字段校验，FormItem 负责单字段校验。职责拆开后，校验流程更清晰，也更容易测试。

### 20.10 异步校验竞态处理

问题场景：

```txt
用户输入 a，触发异步校验请求 1
用户很快输入 ab，触发异步校验请求 2
请求 2 先返回成功
请求 1 后返回失败
如果不处理，旧失败会覆盖新成功
```

解决方案：校验序号。

```ts
let validateId = 0

async function validate(trigger?: FormValidateTrigger) {
  const currentValidateId = ++validateId
  validateState.value = 'validating'

  const result = await runRules(trigger)

  if (currentValidateId !== validateId) {
    return {
      valid: true,
      outdated: true
    }
  }

  applyValidateResult(result)
  return result
}
```

规则：

```txt
1. 每次校验递增 validateId
2. 只有最后一次校验可以更新状态
3. 旧校验结果直接丢弃
4. clearValidate 应递增 validateId，使旧结果失效
```

设计动机：

> 异步校验竞态是 Form 最常见的隐性 bug。必须在第一阶段就设计，而不是等用户遇到再补。

### 20.11 resetFields 与 initialValue

FormItem 注册时记录初始值：

```ts
const initialValue = cloneDeep(get(model.value, prop))
```

resetField：

```ts
function resetField() {
  set(model.value, prop, cloneDeep(initialValue))
  clearValidate()
}
```

注意动态表单：

```txt
1. FormItem mounted 时记录 initialValue
2. prop 变化时需要重新记录
3. removeField 时清理字段引用
4. resetFields 只重置已注册字段
```

设计动机：

> resetFields 不是把 model 清空，而是恢复到字段注册时的初始值。这符合主流组件库用户预期。

### 20.12 布局设计

Form 布局 props：

```ts
export type FormLabelPosition = 'left' | 'right' | 'top'

export const formProps = {
  labelPosition: {
    type: String as PropType<FormLabelPosition>,
    default: 'right'
  },
  labelWidth: [String, Number],
  inline: Boolean,
  size: String as PropType<ComponentSize>,
  disabled: Boolean
} as const
```

布局规则：

```txt
labelPosition=right：label 右对齐
labelPosition=left：label 左对齐
labelPosition=top：label 在控件上方
inline=true：FormItem 横向排列
labelWidth 支持数字和字符串
FormItem 可覆盖 labelWidth
```

样式变量：

```css
--ui-form-label-width
--ui-form-item-margin-bottom
--ui-form-label-color
--ui-form-error-color
--ui-form-required-mark-color
```

设计动机：

> Form 布局要服务中后台密集表单和普通页面表单。布局能力属于基础 Form，但复杂 schema 布局属于 ProForm。

### 20.13 状态优先级

size 优先级：

```txt
组件 props.size
  > FormItem size
  > Form size
  > ConfigProvider size
  > default size
```

disabled 优先级：

```txt
组件 props.disabled === true
  > Form disabled
  > ConfigProvider disabled（如果未来支持）
  > false
```

status 优先级：

```txt
组件 props.status
  > FormItem validateState
  > undefined
```

required 优先级：

```txt
FormItem props.required
  > rules 中 required 推导
  > false
```

设计动机：

> 状态优先级必须明确，否则 Form、FormItem 和输入组件之间会出现难以解释的行为差异。

### 20.14 可访问性设计

FormItem 需要生成：

```txt
label id
input id
error message id
aria-describedby
aria-invalid
required mark
```

Input 接入：

```ts
const inputId = useId()

onMounted(() => formItem?.addInputId(inputId))
onBeforeUnmount(() => formItem?.removeInputId(inputId))
```

渲染：

```vue
<input
  :id="inputId"
  :aria-invalid="validateState === 'error'"
  :aria-describedby="errorId"
/>
```

FormItem：

```vue
<label :for="firstInputId">{{ label }}</label>
<div :id="errorId" role="alert">
  {{ validateMessage }}
</div>
```

设计动机：

> 表单可访问性不能后补。错误信息、label 关联和 invalid 状态必须在 FormItem 协议中预留。

### 20.15 动态表单设计

动态字段：

```vue
<UiFormItem
  v-for="(item, index) in items"
  :key="item.id"
  :prop="`items.${index}.name`"
>
  <UiInput v-model="item.name" />
</UiFormItem>
```

规则：

```txt
1. FormItem mount 时注册字段
2. FormItem unmount 时注销字段
3. prop 改变时更新注册信息
4. validate 只校验当前已注册字段
5. clearValidate 不应该影响已卸载字段
```

设计动机：

> 企业后台大量存在动态表单、数组字段和条件字段。字段注册/注销机制必须从一开始设计正确。

### 20.16 Schema Form 边界

基础 Form 不做 schema-driven 表单。

不推荐放入基础 Form：

```ts
fields: [
  { type: 'input', label: '用户名', prop: 'username' },
  { type: 'select', label: '角色', prop: 'role', request: '/api/roles' }
]
```

这些属于：

```txt
@company/ui-pro-components/pro-form
```

基础 Form 只提供：

```txt
model
rules
layout
validate
reset
scrollToField
context
```

设计动机：

> Schema Form 是业务效率组件，变化快、需求复杂。基础 Form 必须保持稳定通用，ProForm 再组合基础 Form 提供 schema 能力。

### 20.17 与校验库的关系

可选方案：

| 方案 | 优点 | 缺点 |
|---|---|---|
| 自研轻量校验 | 依赖少、控制强 | 规则能力有限 |
| async-validator | 成熟、Element Plus 使用类似路线 | 额外依赖、类型适配成本 |
| zod / valibot | 类型能力强、适合 schema | 与传统 Form rules 风格不同 |

第一阶段推荐：

```txt
内部定义 FormRule 协议；实现轻量 required / pattern / min / max / validator；
预留 adapter 接入 async-validator 或 zod。
```

原因：

> 第一阶段重点是表单协作协议，不是实现最完整的校验引擎。先保留规则协议稳定，再扩展校验适配器。

### 20.18 Form 暴露方法

通过 ref 使用：

```vue
<UiForm ref="formRef" :model="form" :rules="rules">
  ...
</UiForm>
```

方法：

```ts
export interface FormInstance {
  validate: (props?: string[]) => Promise<FormValidateResult>
  validateField: (prop: string) => Promise<FormFieldValidateResult>
  clearValidate: (props?: string[]) => void
  resetFields: (props?: string[]) => void
  scrollToField: (prop: string) => void
}
```

使用：

```ts
const result = await formRef.value?.validate()

if (result?.valid) {
  submit()
}
```

设计动机：

> Form 必须提供命令式 API，因为提交、重置、滚动错误字段等操作通常由业务按钮触发。

### 20.19 测试设计

单元测试：

```ts
describe('Form', () => {
  it('validates required field', () => {})
  it('validates on change', () => {})
  it('validates on blur', () => {})
  it('clears validate state', () => {})
  it('resets fields to initial value', () => {})
  it('supports async validator', () => {})
  it('ignores outdated async validator result', () => {})
  it('registers and removes dynamic fields', () => {})
})
```

集成测试：

```ts
describe('Form + Input', () => {
  it('Input reads disabled from Form', () => {})
  it('Input reads size from Form', () => {})
  it('Input displays error state from FormItem', () => {})
  it('Input still works outside FormItem', () => {})
})
```

类型测试：

```ts
interface LoginForm {
  username: string
  password: string
}

const rules: FormRules<LoginForm> = {
  username: [{ required: true }],
  password: [{ min: 6 }]
}
```

可访问性测试：

```txt
label for 关联 input id
error message 通过 aria-describedby 关联
error 状态设置 aria-invalid
```

设计动机：

> Form 测试必须覆盖组件协作，而不仅是 Form 单组件。最重要的是验证 Input 在 Form 内外都能正确工作。

### 20.20 文档设计

Form 文档至少包含：

```txt
基础表单
行内表单
对齐方式
表单校验
自定义校验
异步校验
动态字段
禁用状态
尺寸控制
错误状态
重置表单
滚动到错误字段
API
Form Props / Methods
FormItem Props
Rules 类型
Accessibility
```

示例：

```vue
<UiForm ref="formRef" :model="form" :rules="rules">
  <UiFormItem label="用户名" prop="username">
    <UiInput v-model="form.username" />
  </UiFormItem>
  <UiFormItem>
    <UiButton type="primary" @click="submit">提交</UiButton>
  </UiFormItem>
</UiForm>
```

设计动机：

> Form 是用户学习成本最高的基础组件之一。文档必须解释数据模型、校验规则、触发时机和方法调用。

### 20.21 第一阶段落地步骤

建议顺序：

```txt
Step 1: 定义 FormProps / FormItemProps / FormRules / FormInstance 类型
Step 2: 抽出 formContextKey / formItemContextKey 到 hooks/use-form-item
Step 3: 实现 Form provide 和字段注册表
Step 4: 实现 FormItem inject Form、provide FormItem
Step 5: 实现 useFormItem 给输入组件消费
Step 6: Input 接入 size / disabled / validateState / change / blur 校验触发
Step 7: 实现 required / pattern / min / max / custom validator
Step 8: 实现异步校验 validateId 防竞态
Step 9: 实现 validate / validateField / clearValidate / resetFields
Step 10: 实现 labelPosition / labelWidth / inline 布局
Step 11: 实现 aria 关联
Step 12: 编写 Form + Input 集成测试
Step 13: 编写类型测试
Step 14: 编写 docs 和 playground 示例
Step 15: 验证动态字段注册和注销
```

为什么这个顺序：

> 先做上下文和字段注册，再做校验；先保证 Form + Input 协作，再补布局、可访问性和动态表单。否则很容易先写出一个看似能用但边界混乱的 Form。

### 20.22 第一阶段验收标准

功能验收：

```txt
Form 可以接收 model 和 rules
FormItem 可以根据 prop 读取字段值和规则
Input 在 FormItem 中可以触发 change / blur 校验
Input 在 Form 外仍可独立工作
required 校验可用
pattern / min / max 校验可用
自定义同步 validator 可用
自定义异步 validator 可用
过期异步校验结果不会覆盖新结果
validate / validateField 返回结构化结果
clearValidate 可以清除错误状态
resetFields 可以恢复初始值
动态字段卸载后不会继续参与校验
```

工程验收：

```txt
components/input 不依赖 components/form
components/form 不依赖 components/input
form context 位于 hooks 或稳定协议层
Form / FormItem 类型可导出
FormInstance 类型可被业务 ref 使用
FormRules<T> 能对 model key 提供基础类型约束
Form 单元测试通过
Form + Input 集成测试通过
Form 文档示例可运行
```

架构验收：

```txt
基础 Form 不包含 schema-driven 业务配置
基础 Form 不包含请求逻辑
基础 Form 不包含权限逻辑
ProForm 通过组合 Form 实现 schema 能力
校验库可以替换或适配，不绑定具体实现到公共 API
输入组件只通过 useFormItem 可选消费表单上下文
```

### 20.23 常见设计陷阱

#### 陷阱一：Input 直接依赖 FormItem

问题：

```ts
import { formItemContextKey } from '@company/ui-components/form'
```

风险：

> Input 和 Form 形成强耦合，后续容易循环依赖。

修复：

```txt
formItemContextKey 和 useFormItem 放到 @company/ui-hooks/use-form-item。
```

#### 陷阱二：基础 Form 做 Schema Form

问题：

```ts
<UiForm :fields="schema" />
```

风险：

> 基础组件被业务效率场景污染，API 快速膨胀。

修复：

```txt
基础 Form 只做 model/rules/layout/validate；schema-driven 放到 ProForm。
```

#### 陷阱三：异步校验没有防竞态

问题：

```ts
const result = await validator(value)
validateMessage.value = result.message
```

风险：

> 旧请求结果可能覆盖新输入状态。

修复：

```txt
使用 validateId，只允许最后一次校验更新状态。
```

#### 陷阱四：resetFields 清空而不是恢复初始值

问题：

```ts
set(model, prop, undefined)
```

风险：

> 用户期望回到初始值，而不是全部清空。

修复：

```txt
FormItem 注册时记录 initialValue，resetField 恢复 initialValue。
```

#### 陷阱五：FormItem 卸载后仍参与校验

问题：

```ts
fields.push(field)
// unmount 没有 remove
```

风险：

> 动态表单隐藏字段仍报错。

修复：

```txt
FormItem unmount 时 removeField。
```

### 20.24 7 个维度总结

#### 架构分层

```txt
Core：Form 类型基础协议可选下沉
Hooks：form context / useFormItem
Components：Form / FormItem / Input 实现
Vue Adapter：只负责 install 和全局配置，不介入字段校验
Pro Components：ProForm / QueryFilter schema-driven 能力
```

#### 模块划分

```txt
Form
FormItem
FormContext
FormItemContext
useFormItem
rules validator
field registry
layout
accessibility
FormInstance methods
```

#### 依赖关系

```txt
components/form → hooks/use-form-item
components/input → hooks/use-form-item
components/form 不依赖 components/input
components/input 不依赖 components/form
pro-form → components/form + components/input/select
```

#### 设计模式

```txt
Provider Pattern：Form / FormItem 上下文
Registry Pattern：字段注册表
Composition API：useFormItem / useForm
Strategy Pattern：validator rules
Adapter Pattern：未来适配 async-validator / zod
Command Pattern：validate / resetFields / scrollToField
```

#### 潜在坑点

```txt
循环依赖
schema 逻辑污染基础 Form
异步校验竞态
动态字段残留
状态优先级混乱
resetFields 行为不符合预期
可访问性缺失
```

#### 最佳实践

```txt
Form 只协调字段，不控制具体输入组件
FormItem 只管理单字段上下文
Input 通过 useFormItem 可选增强
校验结果结构化返回
异步校验使用 validateId 防竞态
动态字段 mount/unmount 注册注销
Schema Form 放到 Pro Components
```

#### 学习与思考点

```txt
Form 的难点不是校验规则，而是组件协作边界
输入组件必须既能独立使用，也能在 Form 中增强
复杂类型推导可以渐进增强，不应阻塞第一阶段
动态表单和异步校验是企业场景必须提前考虑的边界
基础组件和 Pro 组件的分界在 Form 体系里最明显
```

### 20.25 架构能力表达点

在架构评审中，这一节可以这样表达：

> 我会把 Form 体系设计成上下文驱动的协作协议，而不是让 Form、FormItem、Input 互相依赖。Form 负责整体 model、rules、布局和校验方法，FormItem 负责单字段注册、校验状态和错误反馈，Input / Select 等输入组件通过 useFormItem 可选读取 size、disabled 和 validateState，并在 change / blur 时触发字段校验。form context 放在 hooks 层，避免基础组件之间循环依赖；schema-driven、请求、权限等业务表单能力放到 ProForm。这样既能保证基础 Form 稳定通用，又能支撑企业中后台复杂表单扩展。

---

## 21. Table 数据表格体系设计

本节目标是设计企业级组件库中的基础 Table 体系，包括列模型、渲染协议、选择、排序、筛选、展开、固定列、滚动、空状态、加载态、类型设计、性能边界、可访问性、测试策略，以及基础 Table 与 ProTable 的职责边界。

推荐定位：

```txt
Table = 数据展示与表格交互基础组件
ProTable = 查询、请求、分页、工具栏、列配置等业务增强组件
```

设计原则：

> 基础 Table 应该稳定地解决“如何展示和交互表格数据”，但不应该内置请求、查询表单、权限、导出、列偏好持久化等业务能力。这些属于 ProTable。

### 21.1 为什么 Table 是组件库最高复杂度模块

Table 涉及的能力远多于普通展示组件：

```txt
列定义 columns
行数据 data
行 key rowKey
单元格渲染 cell render
表头渲染 header render
选择 selection
排序 sorter
筛选 filter
展开 expandable
固定列 fixed column
横向滚动 scrollX
纵向滚动 scrollY
表头固定 sticky header
空状态 empty
加载态 loading
合计行 summary
树形数据 tree data
虚拟滚动 virtual scroll
可访问性 table semantics
泛型类型推导
```

如果设计不好，会出现问题：

```txt
1. Table 内置请求逻辑，基础组件被业务污染
2. columns 类型无法推导 row 字段
3. cell slot scope 类型丢失
4. selection / sorter / filter 状态不可控
5. 固定列和滚动布局互相影响
6. 大数据渲染性能差
7. 树表、展开行、虚拟滚动耦合在一起
8. ProTable 和基础 Table 边界模糊
```

设计动机：

> Table 的难点不是渲染 `<table>`，而是如何把数据模型、列模型、渲染扩展点、交互状态和性能策略拆成稳定边界。

### 21.2 基础 Table 与 ProTable 边界

基础 Table 负责：

```txt
数据展示
列渲染
表头渲染
单元格渲染
行选择
排序事件
筛选事件
展开行
固定表头 / 固定列
空状态
加载态
基础滚动
类型化 slot scope
```

ProTable 负责：

```txt
接口请求
查询表单
分页请求参数
工具栏
列显示隐藏配置
列顺序拖拽
列宽持久化
导出
刷新
密度切换
权限控制
业务操作列 schema
```

错误示例：

```ts
<UiTable request="/api/users" searchSchema="..." exportable />
```

推荐：

```vue
<UiProTable
  :request="fetchUsers"
  :search-schema="searchSchema"
  :columns="columns"
/>
```

ProTable 内部组合：

```txt
QueryFilter + Toolbar + UiTable + Pagination
```

设计动机：

> 基础 Table 的生命周期应该比业务中后台模式更长。请求、查询、导出和列偏好属于业务效率层，不应该进入基础 Table。

### 21.3 包结构设计

推荐结构：

```txt
packages/components/table/
├─ src/
│  ├─ table.vue
│  ├─ table.ts
│  ├─ types.ts
│  ├─ context.ts
│  ├─ constants.ts
│  ├─ use-columns.ts
│  ├─ use-data.ts
│  ├─ use-selection.ts
│  ├─ use-sorter.ts
│  ├─ use-filter.ts
│  ├─ use-expand.ts
│  ├─ use-scroll.ts
│  ├─ use-fixed.ts
│  └─ utils.ts
├─ style/
│  ├─ index.ts
│  ├─ css.ts
│  └─ table.scss
├─ __tests__/
├─ docs/
├─ meta.ts
└─ index.ts
```

模块职责：

| 模块 | 职责 |
|---|---|
| `table.vue` | 组合表格结构和渲染区域 |
| `table.ts` | props、emits、基础运行时声明 |
| `types.ts` | TableColumn、row、slot scope 类型 |
| `use-columns.ts` | 列标准化、列分组、固定列计算 |
| `use-data.ts` | rowKey、扁平化、树数据预处理 |
| `use-selection.ts` | 选择状态 |
| `use-sorter.ts` | 排序状态和事件 |
| `use-filter.ts` | 筛选状态和事件 |
| `use-expand.ts` | 展开行状态 |
| `use-scroll.ts` | 横纵滚动和 sticky header |
| `use-fixed.ts` | 固定列偏移计算 |
| `utils.ts` | getRowKey、getCellValue 等纯函数 |

设计动机：

> Table 文件必须拆分。单文件承载所有 selection、sorter、filter、scroll、fixed 逻辑，会快速变成不可维护的巨型组件。

### 21.4 Table 基础 API

基础 Props：

```ts
export interface TableProps<T extends TableRow = TableRow> {
  data?: T[]
  columns?: TableColumn<T>[]
  rowKey?: TableRowKey<T>
  loading?: boolean
  bordered?: boolean
  stripe?: boolean
  size?: ComponentSize
  emptyText?: string
  height?: string | number
  maxHeight?: string | number
  scrollX?: string | number
  scrollY?: string | number
}
```

Row 类型：

```ts
export type TableRow = Record<string, unknown>

export type TableRowKey<T> = keyof T | ((row: T) => string | number)
```

使用：

```vue
<UiTable
  row-key="id"
  :data="users"
  :columns="columns"
/>
```

设计规则：

```txt
1. data 是纯数组，不包含请求状态
2. columns 定义展示协议
3. rowKey 必须支持 string key 和函数
4. loading 只控制展示，不负责请求
5. emptyText 可覆盖，也可走 locale fallback
```

设计动机：

> 基础 Table 应该是可控的纯展示组件。外部把 data 给它，它负责稳定展示和触发交互事件。

### 21.5 Column 模型设计

列定义：

```ts
export interface TableColumn<T extends TableRow = TableRow> {
  key?: string
  title?: string
  dataIndex?: keyof T | string
  width?: number | string
  minWidth?: number | string
  align?: 'left' | 'center' | 'right'
  fixed?: 'left' | 'right'
  ellipsis?: boolean
  tooltip?: boolean
  sortable?: boolean | TableSorter<T>
  filters?: TableFilterOption[]
  filterMultiple?: boolean
  children?: TableColumn<T>[]
  render?: TableCellRender<T>
  headerRender?: TableHeaderRender<T>
}

export interface TableFilterOption {
  label: string
  value: string | number | boolean
}
```

渲染函数：

```ts
export type TableCellRender<T> = (scope: TableCellScope<T>) => unknown

export interface TableCellScope<T> {
  row: T
  column: TableColumn<T>
  rowIndex: number
  columnIndex: number
  value: unknown
}
```

设计规则：

```txt
1. key 用于列唯一标识
2. dataIndex 用于从 row 中取值
3. children 支持分组表头
4. render 支持自定义单元格
5. headerRender 支持自定义表头
6. sortable / filters 只定义交互能力，不内置远程请求
```

设计动机：

> Column 是 Table 的核心协议。它既要支持简单字段展示，也要支持复杂单元格渲染、表头分组和类型化扩展。

### 21.6 泛型类型设计

用户数据：

```ts
interface User {
  id: number
  name: string
  age: number
  status: 'active' | 'disabled'
}
```

列定义：

```ts
const columns: TableColumn<User>[] = [
  {
    title: 'Name',
    dataIndex: 'name'
  },
  {
    title: 'Age',
    dataIndex: 'age',
    sortable: true
  },
  {
    title: 'Action',
    key: 'action',
    render: ({ row }) => row.name
  }
]
```

目标：

```txt
dataIndex 能提示 User 字段
render scope.row 是 User
selection selectedRows 是 User[]
sorter column 是 TableColumn<User>
```

第一阶段策略：

```txt
TableColumn<T> 支持基础泛型
slot scope 导出类型
深层 dataIndex 暂用 string
第二阶段再支持 Path<T> 深层路径类型
```

设计动机：

> Table 是组件库类型体验的核心场景。即使第一阶段不做极致类型体操，也必须保证 row 泛型贯穿 columns、slots 和事件。

### 21.7 渲染协议设计

支持三种自定义方式：

```txt
1. columns.render
2. scoped slot: cell
3. named slot: cell-{columnKey}
```

优先级：

```txt
named slot > columns.render > default value render
```

示例：

```vue
<UiTable :data="users" :columns="columns">
  <template #cell-status="{ row }">
    <UiTag>{{ row.status }}</UiTag>
  </template>
</UiTable>
```

通用 cell slot：

```vue
<template #cell="{ row, column, value }">
  {{ value }}
</template>
```

设计规则：

```txt
1. 简单场景用 dataIndex
2. 中等自定义用 columns.render
3. 模板复杂 UI 用 slot
4. named slot 适合按列覆盖
5. slot scope 必须导出类型
```

设计动机：

> 表格自定义渲染必须兼顾配置式和模板式。只支持 render 函数会损失 Vue 模板体验，只支持 slot 又会让 columns 配置能力不足。

### 21.8 Selection 选择设计

Selection 配置：

```ts
export interface TableRowSelection<T extends TableRow = TableRow> {
  type?: 'checkbox' | 'radio'
  selectedRowKeys?: Array<string | number>
  defaultSelectedRowKeys?: Array<string | number>
  disabled?: (row: T) => boolean
  preserveSelectedRowKeys?: boolean
}
```

事件：

```ts
export interface TableSelectionChangeEvent<T> {
  selectedRowKeys: Array<string | number>
  selectedRows: T[]
}
```

Emits：

```ts
selectionChange: (event: TableSelectionChangeEvent<T>) => true
update:selectedRowKeys: (keys: Array<string | number>) => true
```

设计规则：

```txt
1. 支持受控 selectedRowKeys
2. 支持非受控 defaultSelectedRowKeys
3. checkbox 支持多选
4. radio 支持单选
5. disabled row 不可选
6. preserveSelectedRowKeys 支持跨页保留
```

注意：

> preserveSelectedRowKeys 对基础 Table 是状态保留能力，但跨页请求和分页逻辑仍属于 ProTable。

### 21.9 Sorter 排序设计

Sorter 配置：

```ts
export interface TableSorter<T extends TableRow = TableRow> {
  compare?: (a: T, b: T) => number
  multiple?: number
  sortDirections?: TableSortOrder[]
}

export type TableSortOrder = 'ascend' | 'descend' | null
```

事件：

```ts
export interface TableSortChangeEvent<T> {
  column: TableColumn<T>
  field?: string
  order: TableSortOrder
}
```

设计策略：

```txt
本地排序：提供 compare 时 Table 可本地排序
远程排序：未提供 compare 时只触发 sortChange
```

使用：

```ts
{
  title: 'Age',
  dataIndex: 'age',
  sortable: {
    compare: (a, b) => a.age - b.age
  }
}
```

远程排序：

```ts
{
  title: 'Age',
  dataIndex: 'age',
  sortable: true
}
```

设计动机：

> 基础 Table 可以支持本地排序，但不能内置远程请求。远程排序只通过事件把状态交给外部。

### 21.10 Filter 筛选设计

Filter 配置：

```ts
export interface TableFilterState {
  columnKey: string
  filteredValues: Array<string | number | boolean>
}
```

Column：

```ts
{
  title: 'Status',
  dataIndex: 'status',
  filters: [
    { label: 'Active', value: 'active' },
    { label: 'Disabled', value: 'disabled' }
  ],
  filterMultiple: true
}
```

事件：

```ts
filterChange: (filters: Record<string, Array<string | number | boolean>>) => true
```

设计策略：

```txt
第一阶段：Table 管理 filter UI 状态，触发 filterChange
可选本地过滤：提供 onFilter 时本地过滤
远程过滤：业务根据 filterChange 请求数据
```

设计动机：

> 筛选 UI 可以属于基础 Table，但筛选数据来源、请求和查询条件拼接属于外部或 ProTable。

### 21.11 Expand 展开行设计

Expandable 配置：

```ts
export interface TableExpandable<T extends TableRow = TableRow> {
  expandedRowKeys?: Array<string | number>
  defaultExpandedRowKeys?: Array<string | number>
  rowExpandable?: (row: T) => boolean
  expandedRowRender?: (scope: TableRowScope<T>) => unknown
}
```

事件：

```ts
expandChange: (expandedRowKeys: Array<string | number>, row: T) => true
update:expandedRowKeys: (keys: Array<string | number>) => true
```

Slot：

```vue
<template #expanded-row="{ row }">
  <UserDetail :user="row" />
</template>
```

设计动机：

> 展开行是基础表格交互能力，但展开内容本身应该完全由用户控制。

### 21.12 固定列与滚动设计

基础滚动：

```ts
scrollX?: string | number
scrollY?: string | number
```

固定列：

```ts
{
  title: 'Name',
  dataIndex: 'name',
  fixed: 'left',
  width: 160
}
```

设计规则：

```txt
1. 固定列必须有明确 width
2. scrollX 开启横向滚动
3. fixed=left 计算 left offset
4. fixed=right 计算 right offset
5. 固定列通过 sticky 实现优先
6. 复杂兼容问题后续再考虑降级
```

第一阶段不做：

```txt
列宽拖拽
复杂表头拖动
列顺序拖拽
```

这些属于 ProTable 或后续增强。

设计动机：

> 固定列是基础 Table 必备能力，但列配置持久化和拖拽属于业务增强，不应混入第一阶段基础 Table。

### 21.13 Tree Data 与 Virtual Scroll 边界

Tree Data：

```ts
childrenColumnName?: string
expandedRowKeys?: Array<string | number>
```

Virtual Scroll：

```ts
virtual?: boolean
itemHeight?: number
```

推荐策略：

```txt
第一阶段：不实现 tree data 和 virtual scroll，只预留类型和架构边界
第二阶段：先实现 tree data
第三阶段：再实现 virtual scroll
```

原因：

```txt
tree data 会影响数据扁平化、缩进、展开状态
virtual scroll 会影响 DOM 结构、滚动同步、动态高度
fixed column + virtual scroll 组合复杂度很高
```

设计动机：

> Table 不能第一阶段就追求全能力，否则会拖垮基础架构。先把列模型、渲染、选择、排序、筛选、展开和基础滚动做稳定。

### 21.14 状态受控与非受控设计

受控：

```vue
<UiTable
  :selected-row-keys="selectedKeys"
  @update:selected-row-keys="selectedKeys = $event"
/>
```

非受控：

```vue
<UiTable :default-selected-row-keys="[1, 2]" />
```

规则：

```txt
1. selectedRowKeys 存在时由外部控制
2. defaultSelectedRowKeys 只初始化内部状态
3. sorter / filter / expandedRowKeys 同理
4. 受控和非受控不能同时语义冲突
5. 事件始终触发，方便外部同步
```

设计动机：

> 企业表格经常需要把 selection、sorter、filter 与 URL、缓存、请求参数同步，因此状态必须支持受控模式。

### 21.15 Empty / Loading / Locale 设计

Empty：

```vue
<template #empty>
  <UiEmpty description="暂无数据" />
</template>
```

默认文案：

```ts
const { t } = useLocale()
const emptyText = computed(() => props.emptyText ?? t('table.empty'))
```

Loading：

```vue
<UiTable :loading="loading" />
```

设计规则：

```txt
1. loading 只控制遮罩或 loading 状态
2. loading 不发请求
3. emptyText 支持 props 覆盖
4. empty slot 优先级高于 emptyText
5. locale 提供默认空状态文案
```

设计动机：

> Table 可以展示 loading 和 empty，但数据获取属于外部。这样基础 Table 可以在任何数据来源下复用。

### 21.16 可访问性设计

基础语义：

```txt
使用 table / thead / tbody / tr / th / td
排序列设置 aria-sort
选择列 checkbox 设置 aria-label
loading 状态可设置 aria-busy
空状态保持可读文本
```

排序：

```vue
<th :aria-sort="ariaSortValue">
  {{ column.title }}
</th>
```

选择：

```vue
<input
  type="checkbox"
  :aria-label="`Select row ${rowIndex + 1}`"
/>
```

设计动机：

> Table 是信息密度最高的组件之一，可访问性语义应该尽量复用原生 table，而不是全部 div 化。

### 21.17 性能策略

第一阶段性能策略：

```txt
1. columns 标准化使用 computed 缓存
2. rowKey 计算函数缓存
3. selection 使用 Set 存储 selectedRowKeys
4. fixed offset 只在 columns 变化时重算
5. 不在每个 cell 中创建大量新函数
6. 大数据提示用户启用分页或未来 virtual scroll
```

不建议第一阶段直接做：

```txt
动态行高虚拟滚动
固定列 + 虚拟滚动组合
列宽拖拽持久化
单元格级 memo 系统
```

设计动机：

> 性能优化要服务真实瓶颈。第一阶段先保证数据结构和计算缓存合理，不要过早引入高复杂度虚拟滚动。

### 21.18 Table Context 设计

Table 内部上下文：

```ts
export interface TableContext<T extends TableRow = TableRow> {
  props: TableProps<T>
  columns: ComputedRef<NormalizedTableColumn<T>[]>
  data: ComputedRef<T[]>
  getRowKey: (row: T, index: number) => string | number
  selection: TableSelectionContext<T>
  sorter: TableSorterContext<T>
  filter: TableFilterContext<T>
  expand: TableExpandContext<T>
}
```

使用范围：

```txt
TableHeader
TableBody
TableRow
TableCell
```

注意：

> TableContext 是 Table 内部模块协作协议，不作为公共 API 暴露。公共 API 是 props、emits、slots 和 instance methods。

设计动机：

> Table 内部复杂度高，需要 context 组织子模块，但不能把内部 context 变成外部用户依赖的 API。

### 21.19 测试设计

单元测试：

```ts
describe('Table', () => {
  it('renders rows and columns', () => {})
  it('renders empty state', () => {})
  it('renders loading state', () => {})
  it('supports cell render', () => {})
  it('supports cell slot', () => {})
  it('emits selection change', () => {})
  it('supports controlled selectedRowKeys', () => {})
  it('emits sort change', () => {})
  it('emits filter change', () => {})
  it('renders expanded row', () => {})
})
```

类型测试：

```ts
interface User {
  id: number
  name: string
  age: number
}

const columns: TableColumn<User>[] = [
  { dataIndex: 'name' },
  { render: ({ row }) => row.age }
]
```

构建测试：

```txt
@company/ui-vue/table 可单独 import
@company/ui-theme/table.css 可单独 import
只引入 Table 不打入 ProTable
```

交互测试：

```txt
选择行
切换排序
打开筛选
展开行
横向滚动固定列
```

设计动机：

> Table 的测试必须覆盖渲染扩展点、受控状态和交互事件，否则很难保证企业场景稳定。

### 21.20 文档设计

文档至少包含：

```txt
基础表格
自定义列
自定义单元格
表头分组
选择行
排序
筛选
展开行
固定表头
固定列
加载状态
空状态
受控状态
API
Column API
Slots
Events
TypeScript 泛型
Accessibility
```

示例：

```vue
<UiTable :data="users" :columns="columns" row-key="id">
  <template #cell-status="{ row }">
    <UiTag>{{ row.status }}</UiTag>
  </template>
</UiTable>
```

设计动机：

> Table 文档要重点解释 columns 协议、slot scope 和受控状态。否则用户会把业务请求和查询逻辑错误地塞进基础 Table。

### 21.21 第一阶段落地步骤

建议顺序：

```txt
Step 1: 定义 TableRow / TableColumn / TableProps / Emits 类型
Step 2: 实现 columns 标准化 useColumns
Step 3: 实现基础 table / thead / tbody 渲染
Step 4: 实现 dataIndex 取值和默认 cell render
Step 5: 实现 cell slot / named cell slot
Step 6: 实现 rowKey
Step 7: 实现 empty / loading
Step 8: 实现 selection
Step 9: 实现 sorter 事件和可选本地排序
Step 10: 实现 filter 事件和基础筛选 UI
Step 11: 实现 expanded row
Step 12: 实现 scrollX / scrollY
Step 13: 实现 fixed column offset
Step 14: 接入 locale empty 文案
Step 15: 编写单元测试和类型测试
Step 16: 编写 docs 和 playground 示例
Step 17: 验证 table 按需引入和 CSS 按需加载
```

为什么这个顺序：

> 先跑通列模型和渲染协议，再加交互状态；先实现稳定 Table，再考虑 tree data 和 virtual scroll。否则 Table 很容易在第一阶段失控。

### 21.22 第一阶段验收标准

功能验收：

```txt
Table 可以渲染 data 和 columns
Table 支持 rowKey
Table 支持默认单元格渲染
Table 支持 columns.render
Table 支持 cell slot 和 named cell slot
Table 支持 empty 和 loading
Table 支持 checkbox selection
Table 支持受控 selectedRowKeys
Table 支持 sorter 事件
Table 支持 filter 事件
Table 支持 expanded row
Table 支持基础 scrollX / scrollY
Table 支持 fixed left / right column
```

工程验收：

```txt
TableColumn<T> 可以推导 row 类型
cell slot scope 类型可导出
@company/ui-vue/table 可以手动按需引入
@company/ui-theme/table.css 可以单独引入
resolver 可以自动导入 UiTable 和 table.css
Table 单元测试通过
Table 类型测试通过
Table 文档示例可运行
Table playground 可交互验证
只引入 Table 不打入 ProTable
```

架构验收：

```txt
基础 Table 不包含请求逻辑
基础 Table 不包含查询表单
基础 Table 不包含导出逻辑
基础 Table 不包含列偏好持久化
ProTable 通过组合 Table 实现业务增强
Table 内部 context 不作为公共 API 暴露
virtual scroll 不阻塞第一阶段落地
```

### 21.23 常见设计陷阱

#### 陷阱一：基础 Table 内置请求

问题：

```ts
<UiTable request="/api/users" />
```

风险：

> 基础组件被业务数据层污染，难以适配不同请求库和缓存策略。

修复：

```txt
基础 Table 接收 data；ProTable 负责 request。
```

#### 陷阱二：columns 类型丢失 row 泛型

问题：

```ts
render: (scope: any) => scope.row.name
```

风险：

> 用户无法获得类型提示，复杂表格封装容易出错。

修复：

```ts
TableColumn<T>
TableCellScope<T>
```

#### 陷阱三：所有状态都内部不可控

问题：

```txt
selection / sorter / filter 只能内部维护
```

风险：

> 业务无法同步 URL、缓存、请求参数。

修复：

```txt
关键状态同时支持受控和非受控。
```

#### 陷阱四：第一阶段就做虚拟滚动全能力

问题：

```txt
Table v1 同时支持 fixed column + tree data + dynamic virtual scroll
```

风险：

> 实现复杂度指数上升，基础 API 还没稳定就陷入布局细节。

修复：

```txt
第一阶段先做基础列模型、渲染、选择、排序、筛选、展开、固定列；virtual scroll 后续迭代。
```

#### 陷阱五：ProTable 能力反向进入基础 Table

问题：

```ts
columnSetting
request
searchSchema
exportable
```

风险：

> Table API 膨胀，基础组件变成中后台业务组件。

修复：

```txt
这些能力放到 @company/ui-pro-components/pro-table。
```

### 21.24 7 个维度总结

#### 架构分层

```txt
Components：基础 UiTable
Hooks：表格内部 composables
Theme：Table CSS Variables
Vue Adapter：Table install / resolver / global types
Pro Components：ProTable 请求、查询、工具栏、列配置
```

#### 模块划分

```txt
columns
data
selection
sorter
filter
expand
scroll
fixed
render slots
empty / loading
table context
```

#### 依赖关系

```txt
components/table 不依赖 pro-components/pro-table
pro-components/pro-table 依赖 components/table
components/table 可依赖 locale / config / theme hooks
Table 内部模块通过 TableContext 协作
```

#### 设计模式

```txt
Configuration Pattern：columns 描述列
Render Props / Slots：cell render 和 scoped slots
Controlled / Uncontrolled Pattern：selection / sorter / filter
Registry / Context Pattern：Table 内部上下文
Strategy Pattern：本地排序 vs 远程排序
Adapter Pattern：ProTable 组合 Table
```

#### 潜在坑点

```txt
基础 Table 业务化
类型泛型丢失
受控状态缺失
固定列和滚动耦合复杂
过早引入虚拟滚动
TableContext 暴露成公共 API
文档没有解释 ProTable 边界
```

#### 最佳实践

```txt
基础 Table 只接收 data 和 columns
复杂业务能力放 ProTable
Column<T> 泛型贯穿 render / slots / events
关键状态支持受控和非受控
虚拟滚动后置
固定列要求明确 width
Tree-shaking 验证 Table 不打入 ProTable
```

#### 学习与思考点

```txt
Table 的核心是列模型和渲染协议
ProTable 是业务效率组件，不是基础组件
受控状态是企业表格接入请求和 URL 状态的基础
性能优化要分阶段，不要第一阶段陷入虚拟滚动复杂度
类型体验是 Table 组件成熟度的重要标志
```

### 21.25 架构能力表达点

在架构评审中，这一节可以这样表达：

> 我会把 Table 设计成稳定的基础数据展示组件，而不是内置请求和查询的业务组件。基础 Table 负责 columns、data、rowKey、cell render、slot scope、selection、sorter、filter、expand、fixed column、empty 和 loading 等展示与交互能力；ProTable 再组合 QueryFilter、Toolbar、Pagination 和 Table 实现请求、查询、列配置、导出和权限等业务增强。这样既保证基础 Table 的通用性和可维护性，也能支撑企业中后台高频复杂表格场景。

---

## 22. ProTable 业务增强体系设计

本节目标是设计 `ProTable` 作为企业中后台高频表格场景的业务增强组件，包括请求管线、查询表单、分页、排序筛选联动、工具栏、列配置、刷新、导出扩展、权限边界、类型设计、缓存策略、与基础 Table 的组合关系，以及第一阶段落地标准。

推荐定位：

```txt
ProTable = QueryFilter + Toolbar + UiTable + Pagination + Request Pipeline
```

设计原则：

> ProTable 不是更复杂的 Table，而是围绕基础 Table 组织中后台列表页模式。它可以承载业务效率能力，但不能反向污染基础 Table。

### 22.1 为什么需要 ProTable

企业后台最常见页面是列表页：

```txt
顶部查询表单
中间工具栏
主体数据表格
底部分页
列显示隐藏
刷新
导出
批量操作
远程排序
远程筛选
请求 loading
错误处理
```

如果每个业务页面都手写这些逻辑，会出现问题：

```txt
1. 查询参数拼接重复
2. 分页和排序状态重复维护
3. loading / error 行为不一致
4. 列配置和工具栏风格不统一
5. URL 同步、缓存、刷新逻辑分散
6. Table 被迫内置请求逻辑
```

ProTable 解决的是：

```txt
把中后台列表页的通用模式收敛为业务增强组件，基础 Table 保持纯展示。
```

设计动机：

> 基础组件追求稳定通用，Pro 组件追求业务效率。ProTable 是两者分层最典型的例子。

### 22.2 ProTable 与 Table 的边界

ProTable 负责：

```txt
request 请求
查询表单 search
分页 pagination
远程排序 sorter
远程筛选 filter
工具栏 toolbar
刷新 reload
重置 reset
列显示隐藏 columnsState
列密度 density
批量操作 batch actions
错误状态 error
数据转换 transform
```

基础 Table 仍负责：

```txt
columns 渲染
data 展示
selection 交互
sorter/filter 事件
expanded row
fixed column
empty/loading 展示
cell slots
```

依赖方向：

```txt
@company/ui-pro-components/pro-table
  ↓
@company/ui-components/table
  ↓
@company/ui-core / ui-theme / ui-hooks
```

禁止：

```txt
@company/ui-components/table → @company/ui-pro-components/pro-table
```

设计动机：

> ProTable 可以强依赖 Table，但 Table 不能知道 ProTable 存在。这样基础 Table 可用于任何数据源和任何业务模式。

### 22.3 推荐目录结构

```txt
packages/pro-components/pro-table/
├─ src/
│  ├─ pro-table.vue
│  ├─ pro-table.ts
│  ├─ types.ts
│  ├─ context.ts
│  ├─ use-request.ts
│  ├─ use-query.ts
│  ├─ use-pagination.ts
│  ├─ use-columns-state.ts
│  ├─ use-toolbar.ts
│  ├─ use-selection.ts
│  └─ utils.ts
├─ style/
│  ├─ index.ts
│  ├─ css.ts
│  └─ pro-table.scss
├─ __tests__/
├─ docs/
├─ meta.ts
└─ index.ts
```

模块职责：

| 模块 | 职责 |
|---|---|
| `pro-table.vue` | 组合 QueryFilter、Toolbar、UiTable、Pagination |
| `use-request.ts` | 请求状态、竞态、reload、error |
| `use-query.ts` | 查询参数、重置、提交 |
| `use-pagination.ts` | page、pageSize、total |
| `use-columns-state.ts` | 列显示隐藏、顺序、密度 |
| `use-toolbar.ts` | 刷新、密度、列设置、扩展按钮 |
| `use-selection.ts` | 批量选择和批量操作状态 |

设计动机：

> ProTable 的复杂度来自多个业务状态的组合，必须按领域拆成 composables，避免单文件巨型组件。

### 22.4 ProTable 基础 API

Props：

```ts
export interface ProTableProps<T extends TableRow = TableRow, P extends Record<string, unknown> = Record<string, unknown>> {
  columns?: ProTableColumn<T>[]
  request?: ProTableRequest<T, P>
  params?: P
  dataSource?: T[]
  rowKey?: TableRowKey<T>
  search?: ProTableSearchConfig | false
  pagination?: ProTablePaginationConfig | false
  toolbar?: ProTableToolbarConfig | false
  columnsState?: ProTableColumnsStateConfig | false
  manualRequest?: boolean
  beforeRequest?: (params: ProTableRequestParams<P>) => ProTableRequestParams<P>
  transformResponse?: (response: unknown) => ProTableRequestResult<T>
}
```

Request：

```ts
export type ProTableRequest<T, P> = (
  params: ProTableRequestParams<P>
) => Promise<ProTableRequestResult<T>>

export interface ProTableRequestResult<T> {
  data: T[]
  total?: number
  success?: boolean
  error?: unknown
}
```

请求参数：

```ts
export interface ProTableRequestParams<P> {
  current: number
  pageSize: number
  sorter?: Record<string, 'ascend' | 'descend'>
  filters?: Record<string, unknown[]>
  query?: Record<string, unknown>
  params?: P
}
```

设计动机：

> ProTable 的 API 应围绕“列表页请求协议”设计，而不是把 Table 的所有 props 平铺复制一遍。

### 22.5 请求管线设计

请求流程：

```txt
触发 reload / search / pagination / sorter / filter
  ↓
收集 query、pagination、sorter、filters、params
  ↓
beforeRequest(params)
  ↓
request(params)
  ↓
transformResponse(response)
  ↓
更新 data、total、loading、error
  ↓
传递给 UiTable 和 Pagination
```

实现：

```ts
async function fetchData(reason: ProTableRequestReason) {
  const requestId = ++latestRequestId
  loading.value = true
  error.value = undefined

  try {
    const params = buildRequestParams()
    const finalParams = props.beforeRequest?.(params) ?? params
    const response = await props.request?.(finalParams)
    const result = props.transformResponse?.(response) ?? response

    if (requestId !== latestRequestId) return

    data.value = result.data
    total.value = result.total ?? result.data.length
  } catch (err) {
    if (requestId !== latestRequestId) return
    error.value = err
  } finally {
    if (requestId === latestRequestId) {
      loading.value = false
    }
  }
}
```

设计规则：

```txt
1. 每次请求有 requestId 防竞态
2. loading 只由最新请求控制
3. error 不覆盖旧数据，除非配置 clearDataOnError
4. manualRequest=true 时不自动请求
5. params 变化默认触发 reload
```

设计动机：

> ProTable 的请求管线必须处理竞态。列表页中分页、搜索、排序连续触发很常见，旧请求不能覆盖新结果。

### 22.6 QueryFilter 搜索区设计

Search 配置：

```ts
export interface ProTableSearchConfig {
  collapsed?: boolean
  defaultCollapsed?: boolean
  span?: number
  labelWidth?: string | number
  submitText?: string
  resetText?: string
}
```

Column 扩展搜索字段：

```ts
export interface ProTableColumn<T extends TableRow = TableRow> extends TableColumn<T> {
  search?: false | ProTableSearchField
}

export interface ProTableSearchField {
  label?: string
  component?: 'input' | 'select' | 'date-picker' | string
  props?: Record<string, unknown>
  transform?: (value: unknown) => Record<string, unknown>
}
```

查询流程：

```txt
用户填写 QueryFilter
  ↓
点击查询
  ↓
current 重置为 1
  ↓
query 合并进 request params
  ↓
触发 fetchData('search')
```

设计动机：

> 查询表单是 ProTable 的核心业务效率能力，但它不属于基础 Table。通过 columns.search 可以减少重复配置，但复杂查询仍允许自定义 search slot。

### 22.7 Pagination 设计

Pagination 配置：

```ts
export interface ProTablePaginationConfig {
  current?: number
  pageSize?: number
  defaultCurrent?: number
  defaultPageSize?: number
  total?: number
  pageSizeOptions?: number[]
  showSizeChanger?: boolean
}
```

规则：

```txt
1. pagination=false 时不展示分页
2. current/pageSize 支持受控
3. defaultCurrent/defaultPageSize 支持非受控
4. search/reset 后 current 回到 1
5. pageSize 改变后 current 回到 1
6. sorter/filter 改变后 current 回到 1
```

设计动机：

> 分页状态是请求参数的一部分。ProTable 必须统一管理分页与查询、排序、筛选之间的联动。

### 22.8 Sorter / Filter 联动

基础 Table 触发：

```ts
@sort-change="handleSortChange"
@filter-change="handleFilterChange"
```

ProTable 处理：

```ts
function handleSortChange(sorter) {
  sorterState.value = normalizeSorter(sorter)
  pagination.current = 1
  fetchData('sort')
}

function handleFilterChange(filters) {
  filterState.value = filters
  pagination.current = 1
  fetchData('filter')
}
```

设计规则：

```txt
1. ProTable 默认远程排序/筛选
2. 基础 Table 只发事件
3. ProTable 把 sorter/filter 转成 request params
4. 用户可通过 beforeRequest 自定义参数格式
```

设计动机：

> 远程排序和筛选是中后台列表页默认场景。ProTable 要接管状态联动，但不能要求基础 Table 知道请求协议。

### 22.9 Toolbar 设计

Toolbar 能力：

```txt
标题 title
刷新 reload
密度 density
列设置 columns setting
全屏 fullscreen 可选
自定义 actions
批量操作 batch actions
```

配置：

```ts
export interface ProTableToolbarConfig {
  title?: string
  reload?: boolean
  density?: boolean
  columnSetting?: boolean
  actions?: ProTableToolbarAction[]
}
```

Slot：

```vue
<template #toolbar-actions>
  <UiButton type="primary">新增</UiButton>
</template>
```

设计动机：

> Toolbar 是列表页操作入口。基础 Table 不应该有 toolbar；ProTable 组合它来表达业务页面模式。

### 22.10 Columns State 设计

列状态：

```ts
export interface ProTableColumnState {
  key: string
  visible?: boolean
  order?: number
  fixed?: 'left' | 'right'
  width?: number
}

export type ProTableColumnsState = Record<string, ProTableColumnState>
```

配置：

```ts
export interface ProTableColumnsStateConfig {
  value?: ProTableColumnsState
  defaultValue?: ProTableColumnsState
  persistenceKey?: string
  persistenceType?: 'localStorage' | 'sessionStorage' | false
}
```

规则：

```txt
1. columnsState=false 关闭列配置
2. value 支持受控
3. defaultValue 支持非受控
4. persistenceKey 存在时可持久化
5. 持久化只在 ProTable，不进入基础 Table
```

设计动机：

> 列偏好是典型业务增强能力。它依赖用户、页面、租户等上下文，不应该进入基础 Table。

### 22.11 DataSource 与 Request 双模式

ProTable 支持两种数据模式：

```txt
request 模式：ProTable 负责请求和分页状态
dataSource 模式：外部完全控制数据
```

规则：

```txt
1. request 存在时优先使用 request 模式
2. dataSource 适合本地数据或外部请求管理
3. dataSource 模式下 ProTable 不自动请求
4. loading 可由外部传入，也可由 request 管线产生
```

设计动机：

> ProTable 不能只服务一种请求模式。企业项目可能使用 TanStack Query、自研请求层、GraphQL 或本地缓存。

### 22.12 暴露方法设计

Instance：

```ts
export interface ProTableInstance {
  reload: () => Promise<void>
  reloadAndRest: () => Promise<void>
  reset: () => Promise<void>
  clearSelected: () => void
  getSelectedRows: () => TableRow[]
  getQuery: () => Record<string, unknown>
}
```

使用：

```vue
<UiProTable ref="tableRef" :request="request" />
```

```ts
await tableRef.value?.reload()
```

设计动机：

> 列表页经常需要在新增、删除、批量操作后主动刷新。ProTable 必须提供命令式 API。

### 22.13 错误处理设计

状态：

```ts
const error = ref<unknown>()
```

展示方式：

```txt
默认：保留旧数据，toolbar 或 table 区域展示错误提示
可配置：clearDataOnError 清空数据
可 slot：error slot 自定义错误状态
```

Slot：

```vue
<template #error="{ error, reload }">
  <UiResult status="error" title="加载失败">
    <UiButton @click="reload">重试</UiButton>
  </UiResult>
</template>
```

设计动机：

> 请求失败不一定要清空旧数据。很多企业后台更希望保留旧列表并提示刷新失败。

### 22.14 权限与业务动作边界

ProTable 可以提供扩展点，但不内置权限系统。

推荐：

```vue
<template #toolbar-actions>
  <UiButton v-permission="'user.create'">新增</UiButton>
</template>
```

Column action：

```ts
{
  key: 'action',
  title: '操作',
  render: ({ row }) => h(UserActions, { user: row })
}
```

不推荐：

```ts
{
  permissionCode: 'user.delete'
}
```

设计动机：

> 权限体系高度依赖企业组织和业务系统。ProTable 提供插槽和渲染扩展点即可，不应该内置权限模型。

### 22.15 类型设计

泛型贯穿：

```ts
interface User {
  id: number
  name: string
}

interface UserQuery {
  keyword?: string
  status?: string
}

const request: ProTableRequest<User, UserQuery> = async (params) => {
  return {
    data: [],
    total: 0
  }
}
```

目标：

```txt
columns render scope.row 推导为 User
request params.params 推导为 UserQuery
selectedRows 推导为 User[]
transformResponse 返回 User[]
```

设计动机：

> ProTable 的类型体验比 Table 更重要，因为它连接数据请求、查询参数、列渲染和选择结果。

### 22.16 测试设计

单元测试：

```ts
describe('ProTable', () => {
  it('requests data on mounted', () => {})
  it('does not request when manualRequest is true', () => {})
  it('reloads data', () => {})
  it('resets query and reloads', () => {})
  it('changes page and requests data', () => {})
  it('sort change resets current page and requests data', () => {})
  it('ignores outdated request result', () => {})
  it('keeps old data when request fails', () => {})
})
```

集成测试：

```txt
QueryFilter + ProTable 请求
Toolbar reload
Column setting 显示隐藏
Table selection 批量操作
Pagination 联动
```

类型测试：

```ts
expectTypeOf<ProTableRequest<User, UserQuery>>().toBeFunction()
```

设计动机：

> ProTable 测试重点不是表格单元格，而是请求管线和状态联动。

### 22.17 文档设计

文档至少包含：

```txt
基础请求表格
手动请求
查询表单
分页
远程排序
远程筛选
工具栏
列设置
批量操作
错误重试
自定义 request 参数
dataSource 受控模式
API
Request 类型
Column 扩展
Instance 方法
```

设计动机：

> ProTable 文档要解释“什么时候用 ProTable，什么时候只用 Table”。否则用户会把所有列表页都错误抽象成复杂 ProTable 配置。

### 22.18 第一阶段落地步骤

建议顺序：

```txt
Step 1: 定义 ProTableProps / ProTableRequest / ProTableColumn 类型
Step 2: 组合 UiTable 和 Pagination，跑通 dataSource 模式
Step 3: 实现 request 管线和 loading / error
Step 4: 实现 requestId 防竞态
Step 5: 实现 pagination 状态联动
Step 6: 接入 Table sortChange / filterChange
Step 7: 实现 QueryFilter 基础查询
Step 8: 实现 toolbar reload
Step 9: 实现 exposed methods
Step 10: 实现 columnsState 显示隐藏
Step 11: 编写请求管线单元测试
Step 12: 编写集成测试和类型测试
Step 13: 编写 docs 和 playground 示例
```

为什么这个顺序：

> 先跑通 dataSource 和 request 两种数据模式，再增加查询、分页、排序筛选、工具栏和列设置。这样每一步都能验证一个独立业务能力。

### 22.19 第一阶段验收标准

功能验收：

```txt
ProTable 可以通过 dataSource 展示数据
ProTable 可以通过 request 自动请求数据
manualRequest=true 时不自动请求
reload 可以重新请求
pagination 改变会触发请求
search 提交会重置 current 并请求
sort/filter 改变会重置 current 并请求
旧请求结果不会覆盖新请求结果
请求失败可以展示 error slot
columnsState 可以控制列显示隐藏
```

工程验收：

```txt
ProTable 位于 @company/ui-pro-components
基础 Table 不依赖 ProTable
ProTable 可以按需引入
ProTable 类型泛型贯穿 row 和 query
ProTable 单元测试通过
ProTable 集成测试通过
ProTable 文档示例可运行
只使用 Table 不会打入 ProTable
```

架构验收：

```txt
ProTable 不内置具体 HTTP client
ProTable 不内置权限系统
ProTable 不强绑定路由或 URL 同步
ProTable 不把 schema 能力反向塞入基础 Table
请求参数转换通过 beforeRequest / transformResponse 扩展
```

### 22.20 常见设计陷阱

#### 陷阱一：ProTable 绑定具体请求库

问题：

```ts
import axios from 'axios'
```

风险：

> 用户项目可能使用 fetch、GraphQL、TanStack Query 或自研请求层。

修复：

```txt
ProTable 只接收 request 函数，不内置 HTTP client。
```

#### 陷阱二：列权限内置进 columns

问题：

```ts
permission: 'user.delete'
```

风险：

> 权限模型因企业而异，内置后很难通用。

修复：

```txt
通过 render / slot / v-permission 由业务层处理。
```

#### 陷阱三：请求竞态未处理

问题：

```txt
搜索 A 慢返回，搜索 B 快返回，A 覆盖 B
```

修复：

```txt
使用 requestId，只允许最后一次请求更新状态。
```

#### 陷阱四：ProTable 配置吞掉 Table 扩展点

问题：

```txt
ProTable 只支持 columns schema，不支持 Table slots
```

风险：

> 用户复杂单元格无法自定义。

修复：

```txt
ProTable 透传 Table slots 和关键 props。
```

### 22.21 7 个维度总结

#### 架构分层

```txt
Components：UiTable / Pagination / Form 基础能力
Pro Components：ProTable / QueryFilter / Toolbar
业务应用：具体请求函数、权限、页面动作
```

#### 模块划分

```txt
request pipeline
query state
pagination state
sorter/filter bridge
toolbar
columns state
selection bridge
error slot
instance methods
```

#### 依赖关系

```txt
pro-table → table / form / pagination / button
基础组件不依赖 pro-table
pro-table 不依赖具体 HTTP client
pro-table 不依赖业务权限系统
```

#### 设计模式

```txt
Composition Pattern：组合 QueryFilter + Toolbar + Table + Pagination
Pipeline Pattern：beforeRequest / request / transformResponse
Controlled Pattern：pagination / columnsState
Adapter Pattern：适配不同后端参数格式
Command Pattern：reload / reset / clearSelected
```

#### 潜在坑点

```txt
绑定请求库
权限模型内置
请求竞态
配置过度膨胀
Table slots 透传不足
ProTable 和 Table 边界不清
```

#### 最佳实践

```txt
request 由用户传入
请求参数通过 beforeRequest 转换
响应通过 transformResponse 适配
旧请求不覆盖新请求
ProTable 透传 Table 扩展点
列偏好只在 ProTable 层维护
只使用 Table 时不打入 ProTable
```

#### 学习与思考点

```txt
Pro 组件的价值是沉淀业务模式，不是污染基础组件
请求管线要处理竞态、错误和状态联动
越靠近业务的能力越应该通过扩展点接入
ProTable 是组合式架构，不是巨型 Table
```

### 22.22 架构能力表达点

在架构评审中，这一节可以这样表达：

> 我会把 ProTable 设计成中后台列表页模式的组合组件，而不是把基础 Table 做重。ProTable 组合 QueryFilter、Toolbar、UiTable 和 Pagination，负责 request 管线、分页、远程排序筛选、刷新、列设置和批量状态；基础 Table 仍只负责 columns、data 和表格交互。ProTable 不绑定具体 HTTP client、不内置权限系统、不强依赖路由，而是通过 request、beforeRequest、transformResponse、slots 和 exposed methods 提供扩展。这样既提升业务开发效率，又保持基础 Table 的稳定和可复用。

---

## 23. Overlay 浮层体系设计

本节目标是设计组件库中的浮层体系，包括 `Dialog`、`Drawer`、`Popover`、`Tooltip`、`Dropdown`、`Message`、`Notification` 等组件共享的 z-index、Teleport、焦点管理、滚动锁定、点击外部关闭、键盘交互、可访问性、动画、嵌套浮层和第一阶段落地标准。

推荐定位：

```txt
Overlay = 浮层基础协议和运行时能力
Dialog / Drawer = 模态型浮层
Popover / Tooltip / Dropdown = 锚点型浮层
Message / Notification = 全局反馈型浮层
```

设计原则：

> 浮层组件不能各自为政。z-index、Teleport、focus trap、scroll lock、outside click 和 Escape 关闭都应该由统一的 overlay 体系治理，否则组件越多，遮挡、穿透、滚动和可访问性问题越严重。

### 23.1 为什么需要统一 Overlay 体系

浮层组件看起来类型不同，但共享很多底层问题：

```txt
层级如何分配
是否 Teleport 到 body
是否锁定 body 滚动
是否点击遮罩关闭
是否点击外部关闭
是否按 Escape 关闭
焦点是否限制在浮层内
关闭后焦点是否回到触发元素
多个浮层嵌套时谁响应 Escape
动画期间状态如何管理
SSR 中如何避免访问 document
```

如果每个组件独立实现，会出现：

```txt
1. Dialog 被 Tooltip 覆盖
2. Drawer 打开后 body 仍可滚动
3. 多个弹窗同时打开时 z-index 混乱
4. Escape 关闭了错误的浮层
5. Popover 点击内部被误判为 outside
6. Dialog 关闭后焦点丢失
7. Message / Notification 容器重复创建
```

设计动机：

> 浮层体系的复杂度不在单个 Dialog，而在多个浮层组件共同存在时的运行时治理。

### 23.2 浮层组件分类

推荐分三类：

```txt
Modal Overlay
  Dialog
  Drawer

Anchor Overlay
  Tooltip
  Popover
  Dropdown
  Select Dropdown
  DatePicker Panel

Global Feedback Overlay
  Message
  Notification
  Loading Service
```

分类差异：

| 类型 | 是否模态 | 是否有触发元素 | 是否锁滚动 | 是否 focus trap | 示例 |
|---|---|---|---|---|---|
| Modal | 是 | 可选 | 是 | 是 | Dialog / Drawer |
| Anchor | 否 | 是 | 否 | 通常否 | Tooltip / Popover / Dropdown |
| Feedback | 否 | 否 | 否 | 否 | Message / Notification |

设计动机：

> 先分类，才能避免用 Dialog 的规则套 Tooltip，或用 Tooltip 的规则套 Message。

### 23.3 包结构设计

推荐结构：

```txt
packages/components/_internal/overlay/
├─ src/
│  ├─ overlay-manager.ts
│  ├─ overlay-stack.ts
│  ├─ use-overlay.ts
│  ├─ use-teleport.ts
│  ├─ use-focus-trap.ts
│  ├─ use-scroll-lock.ts
│  ├─ use-click-outside.ts
│  ├─ use-escape-key.ts
│  ├─ use-position.ts
│  └─ types.ts
└─ index.ts

packages/components/dialog/
packages/components/drawer/
packages/components/popover/
packages/components/tooltip/
packages/components/dropdown/
packages/components/message/
packages/components/notification/
```

也可以拆到 hooks：

```txt
packages/hooks/use-overlay
packages/hooks/use-focus-trap
packages/hooks/use-scroll-lock
packages/hooks/use-click-outside
```

推荐第一阶段：

```txt
通用浮层 hooks 放到 @company/ui-hooks
复杂内部协议放到 components/_internal/overlay
```

设计动机：

> Tooltip、Dialog、Dropdown 都需要复用基础浮层能力，但这些能力不一定都是公开 API。hooks 负责可复用协议，_internal 负责组件内部实现细节。

### 23.4 OverlayManager 设计

OverlayManager 负责全局浮层栈：

```ts
export interface OverlayEntry {
  id: string
  type: 'modal' | 'anchor' | 'feedback'
  zIndex: number
  closeOnEsc?: boolean
  close: () => void
}

export interface OverlayManager {
  register: (entry: OverlayEntry) => void
  unregister: (id: string) => void
  getTopOverlay: () => OverlayEntry | undefined
  closeTopByEsc: () => void
}
```

行为：

```txt
1. 浮层打开时 register
2. 浮层关闭或卸载时 unregister
3. Escape 只关闭栈顶且 closeOnEsc=true 的浮层
4. zIndex 由 useZIndex 分配
5. modal 类型可触发 scroll lock
```

设计动机：

> 浮层栈是处理嵌套浮层和 Escape 行为的关键。没有栈管理，就无法判断当前应该关闭哪个浮层。

### 23.5 z-index 层级策略

通过 Vue Adapter 的 `useZIndex` 统一分配：

```ts
const { nextZIndex } = useZIndex()
const zIndex = ref(nextZIndex())
```

默认起始：

```txt
ConfigProvider zIndex 默认 2000
Dialog / Drawer: nextZIndex()
Popover / Dropdown: nextZIndex()
Message / Notification: nextZIndex()
```

规则：

```txt
1. 不在 CSS 中写死最终 z-index
2. 每个浮层实例打开时分配 zIndex
3. 嵌套浮层后打开者层级更高
4. ConfigProvider 可覆盖起始 zIndex
5. SSR 下 zIndex 生成不依赖 window
```

设计动机：

> 层级必须由运行时统一分配，而不是各组件写固定数字。固定数字在复杂业务页面里一定会冲突。

### 23.6 Teleport 策略

通用 props：

```ts
export interface TeleportProps {
  teleported?: boolean
  appendTo?: string | HTMLElement
}
```

默认策略：

```txt
Dialog / Drawer 默认 teleported=true, appendTo=body
Popover / Tooltip / Dropdown 默认 teleported=true
Message / Notification 使用全局 container
```

规则：

```txt
1. teleported=false 时保留在当前位置
2. appendTo 支持 selector 和 HTMLElement
3. SSR 下不直接访问 document.body
4. appendTo 不存在时 fallback 到 body，并在 dev warning
```

设计动机：

> Teleport 可以避免父级 overflow、transform、z-index context 影响浮层。但也要允许用户关闭 Teleport，以适配局部容器或测试场景。

### 23.7 Modal Overlay：Dialog / Drawer

Dialog 核心能力：

```txt
modelValue 控制显隐
title / default / footer slots
modal 遮罩
closeOnClickModal
closeOnPressEscape
lockScroll
focusTrap
destroyOnClose
beforeClose
```

Props：

```ts
export interface DialogProps {
  modelValue?: boolean
  title?: string
  width?: string | number
  modal?: boolean
  closeOnClickModal?: boolean
  closeOnPressEscape?: boolean
  lockScroll?: boolean
  destroyOnClose?: boolean
  beforeClose?: (done: () => void) => void
}
```

Drawer 与 Dialog 共享：

```txt
modal
lockScroll
focusTrap
beforeClose
closeOnPressEscape
```

Drawer 特有：

```txt
direction: left / right / top / bottom
size
```

设计动机：

> Dialog 和 Drawer 都是模态浮层，应共享大部分 overlay 协议，只在展示方向和布局上差异化。

### 23.8 Anchor Overlay：Popover / Tooltip / Dropdown

锚点型浮层核心能力：

```txt
reference 触发元素
placement
trigger: hover / click / focus / contextmenu
showDelay / hideDelay
offset
arrow
clickOutside
autoUpdate position
```

Props：

```ts
export interface AnchorOverlayProps {
  modelValue?: boolean
  trigger?: 'hover' | 'click' | 'focus' | 'contextmenu'
  placement?: Placement
  offset?: number
  showDelay?: number
  hideDelay?: number
  teleported?: boolean
  disabled?: boolean
}
```

定位策略：

```txt
第一阶段：使用 @floating-ui/dom 或自研轻量 position
推荐：@floating-ui/dom
```

原因：

> 锚点定位涉及滚动容器、视口边界、flip、shift、arrow 等问题，自研容易踩坑。floating-ui 是更成熟的底层定位方案。

设计动机：

> Tooltip、Popover、Dropdown 的差异主要是内容和交互语义，底层定位和显隐机制应该复用。

### 23.9 Global Feedback：Message / Notification

Message 使用方式：

```ts
UiMessage.success('保存成功')
UiMessage.error('保存失败')
```

Notification：

```ts
UiNotification.open({
  title: '提示',
  message: '任务已完成'
})
```

容器策略：

```txt
1. 全局单例 container
2. 按 placement 分组
3. 每条消息有 id
4. 支持 duration 自动关闭
5. 支持手动 close
6. app context 可继承 ConfigProvider
```

注意：

> Message / Notification 是 service 型组件，需要考虑 app context、主题、locale、namespace 和 zIndex 的继承。

设计动机：

> 全局反馈组件不是普通组件实例，它们通常通过函数调用创建，因此必须设计 service container 和上下文继承机制。

### 23.10 Scroll Lock 设计

Modal 打开时默认锁定 body 滚动：

```ts
const unlock = lockScroll(document.body)
```

规则：

```txt
1. 多个 modal 同时打开时使用计数器
2. 最后一个 modal 关闭后才恢复滚动
3. 锁定时补偿 scrollbar 宽度，避免页面抖动
4. SSR 下不访问 document
5. lockScroll=false 时不锁定
```

计数器：

```ts
let lockCount = 0

function lockScroll(target: HTMLElement) {
  lockCount += 1
  applyLock(target)

  return () => {
    lockCount -= 1
    if (lockCount === 0) restore(target)
  }
}
```

设计动机：

> 滚动锁定必须支持多弹窗嵌套。简单地打开时 hidden、关闭时恢复，会导致第二个弹窗仍打开时页面恢复滚动。

### 23.11 Focus Trap 与焦点恢复

Dialog 打开时：

```txt
1. 记录当前 activeElement
2. 将焦点移动到 Dialog 容器或第一个可聚焦元素
3. Tab / Shift+Tab 限制在 Dialog 内
4. Dialog 关闭后焦点回到原触发元素
```

API：

```ts
export interface FocusTrapOptions {
  enabled?: boolean
  initialFocus?: string | HTMLElement
  restoreFocus?: boolean
}
```

规则：

```txt
1. Modal 默认启用 focus trap
2. Tooltip 不启用 focus trap
3. Dropdown 可根据交互模式启用 roving focus
4. 嵌套 modal 时只有栈顶 trap 生效
```

设计动机：

> 焦点管理是浮层可访问性的核心。没有 focus trap，键盘用户可能在 Dialog 打开时 tab 到背景页面。

### 23.12 Click Outside 设计

Popover / Dropdown 常用点击外部关闭：

```ts
useClickOutside({
  targets: [contentRef, triggerRef],
  handler: close
})
```

规则：

```txt
1. trigger 和 content 都属于 inside
2. Teleport 后仍能正确判断 inside
3. 嵌套浮层内部点击不关闭父级，除非配置
4. mousedown / pointerdown 优先于 click 判断
5. disabled 时移除监听
```

设计动机：

> 点击外部关闭在 Teleport 和嵌套浮层场景很容易误判，必须由统一 hook 处理。

### 23.13 Keyboard 交互设计

通用：

```txt
Escape：关闭栈顶浮层
Tab：Modal 内 focus trap
Enter / Space：触发 Dropdown item
ArrowUp / ArrowDown：Dropdown 菜单导航
Home / End：菜单首尾跳转
```

规则：

```txt
1. Escape 由 OverlayManager 分发给栈顶
2. Dropdown 菜单使用 roving focus
3. Tooltip 不应抢占 Escape
4. Dialog 关闭前执行 beforeClose
```

设计动机：

> 键盘交互必须按组件语义区分。不是所有浮层都应该响应同样的键盘行为。

### 23.14 动画与生命周期

状态：

```txt
closed
opening
opened
closing
```

事件：

```ts
open
opened
close
closed
update:modelValue
```

规则：

```txt
1. modelValue=true 进入 opening
2. enter 动画结束触发 opened
3. modelValue=false 进入 closing
4. leave 动画结束触发 closed
5. destroyOnClose 在 closed 后销毁内容
```

设计动机：

> 浮层不能只用 boolean 表示状态。动画期间需要区分 opening / closing，否则会出现闪烁、提前销毁和事件顺序错误。

### 23.15 可访问性设计

Dialog：

```txt
role=dialog
aria-modal=true
aria-labelledby 指向 title
aria-describedby 指向 body 可选
Escape 可关闭
焦点限制在 Dialog 内
```

Tooltip：

```txt
role=tooltip
reference aria-describedby tooltip id
hover/focus 显示
不包含可交互复杂内容
```

Popover：

```txt
适合可交互内容
需要明确触发和关闭方式
```

Dropdown：

```txt
role=menu
menuitem
键盘上下导航
```

设计动机：

> 不同浮层语义不同。Tooltip 不是小 Dialog，Popover 也不是 Tooltip。可访问性角色必须匹配组件用途。

### 23.16 SSR 设计

规则：

```txt
1. hooks 初始化不访问 document/window
2. Teleport target 在 mounted 后解析
3. Message service 在客户端创建 container
4. scroll lock 只在客户端执行
5. focus trap 只在客户端执行
```

示例：

```ts
const isClient = typeof window !== 'undefined'

onMounted(() => {
  if (!isClient) return
  resolveTeleportTarget()
})
```

设计动机：

> Overlay 大量依赖 DOM。必须把 DOM 操作延迟到客户端生命周期，避免 SSR 报错。

### 23.17 第一阶段落地顺序

建议顺序：

```txt
Step 1: 实现 useZIndex 并接入 ConfigProvider
Step 2: 实现 OverlayManager / overlay stack
Step 3: 实现 useTeleport
Step 4: 实现 useScrollLock
Step 5: 实现 useEscapeKey
Step 6: 实现 Dialog 作为第一个 modal overlay
Step 7: 实现 Drawer 复用 modal overlay
Step 8: 引入 floating-ui，实现 Popover 定位
Step 9: Tooltip 复用 anchor overlay
Step 10: Dropdown 复用 anchor overlay + keyboard navigation
Step 11: 实现 Message service container
Step 12: 实现 Notification service container
Step 13: 编写焦点、滚动锁、z-index、Escape 测试
Step 14: 编写 docs 和 playground 示例
```

为什么这个顺序：

> 先做 Dialog，因为它能验证 z-index、Teleport、scroll lock、focus trap、Escape 和动画生命周期；再扩展到 Drawer、Popover、Tooltip、Dropdown 和全局反馈。

### 23.18 第一阶段验收标准

功能验收：

```txt
Dialog 可以通过 v-model 控制显隐
Dialog 打开时分配 zIndex
Dialog 默认 Teleport 到 body
Dialog 打开时锁定 body 滚动
多个 Dialog 打开时滚动锁计数正确
Escape 只关闭栈顶 Dialog
Dialog 关闭后恢复焦点
Drawer 复用 modal overlay 能力
Popover 可以根据 reference 定位
Dropdown 点击外部可以关闭
Message / Notification 使用全局 container
```

工程验收：

```txt
z-index 不写死在组件 CSS 中
scroll lock 有单元测试
focus trap 有交互测试
OverlayManager 有栈管理测试
Dialog / Drawer / Popover / Tooltip 不重复实现 zIndex 逻辑
Message / Notification 可以按需引入
SSR 下导入 overlay hooks 不报错
```

架构验收：

```txt
Overlay 基础能力可被多个浮层复用
Dialog 不依赖 Tooltip / Popover
Tooltip 不复用 Dialog 的 modal 逻辑
Message service 不污染基础组件入口
全局反馈组件能继承 namespace / zIndex / theme
```

### 23.19 常见设计陷阱

#### 陷阱一：每个浮层写死 z-index

问题：

```scss
.ui-dialog { z-index: 2000; }
.ui-tooltip { z-index: 3000; }
```

风险：

> 嵌套和动态打开顺序无法保证正确层级。

修复：

```txt
通过 useZIndex 在打开时分配层级。
```

#### 陷阱二：滚动锁没有计数

问题：

```txt
打开 A 锁滚动，打开 B，关闭 B 后恢复滚动，但 A 仍打开
```

修复：

```txt
scroll lock 使用 lockCount，最后一个 modal 关闭后再恢复。
```

#### 陷阱三：Escape 所有浮层都响应

问题：

> 按一次 Escape 关闭多个浮层。

修复：

```txt
OverlayManager 只让栈顶浮层响应 Escape。
```

#### 陷阱四：Tooltip 承载复杂交互内容

问题：

```txt
Tooltip 内放表单、按钮、复杂菜单
```

修复：

```txt
Tooltip 只用于提示文本；复杂交互内容使用 Popover。
```

#### 陷阱五：Message 无法继承应用上下文

问题：

> Message 通过 createApp 单独挂载，丢失 ConfigProvider、theme、locale。

修复：

```txt
Message service 需要继承 app context 或提供全局配置注入能力。
```

### 23.20 7 个维度总结

#### 架构分层

```txt
Hooks：useZIndex / useTeleport / useScrollLock / useFocusTrap / useClickOutside
Internal Overlay：OverlayManager / overlay stack
Components：Dialog / Drawer / Popover / Tooltip / Dropdown
Feedback Service：Message / Notification
Vue Adapter：ConfigProvider 提供 zIndex / namespace / theme
```

#### 模块划分

```txt
overlay manager
z-index
teleport
scroll lock
focus trap
click outside
escape key
position
animation lifecycle
service container
```

#### 依赖关系

```txt
Dialog / Drawer → overlay modal hooks
Popover / Tooltip / Dropdown → anchor overlay hooks
Message / Notification → service container + zIndex
Overlay hooks → Vue runtime + DOM utilities
Overlay hooks 不依赖具体业务组件
```

#### 设计模式

```txt
Manager Pattern：OverlayManager 管理浮层栈
Stack Pattern：Escape 和嵌套浮层
Composable Pattern：useScrollLock / useFocusTrap
Portal Pattern：Teleport
Service Pattern：Message / Notification
Strategy Pattern：不同 trigger / placement / close 策略
```

#### 潜在坑点

```txt
z-index 冲突
滚动锁提前释放
Escape 多重关闭
Teleport 后 outside click 误判
焦点丢失
SSR 访问 document
Message 丢失 app context
```

#### 最佳实践

```txt
浮层打开时分配 zIndex
Modal 使用 focus trap 和 scroll lock
Escape 只作用于栈顶浮层
Anchor overlay 使用 floating-ui
Tooltip 只做轻提示
Message / Notification 使用统一 container
DOM 操作延迟到 mounted
```

#### 学习与思考点

```txt
浮层体系是运行时治理问题，不是单组件样式问题
Dialog、Tooltip、Message 属于不同浮层类别
焦点管理和滚动锁是 modal 的核心质量指标
Teleport 解决层级问题，也引入 outside click 和 SSR 复杂度
统一 OverlayManager 能显著降低浮层组件之间的冲突
```

### 23.21 架构能力表达点

在架构评审中，这一节可以这样表达：

> 我会把 Dialog、Drawer、Popover、Tooltip、Dropdown、Message 和 Notification 抽象到统一的 Overlay 体系中，而不是每个组件各自实现浮层逻辑。OverlayManager 管理浮层栈和 Escape 行为，useZIndex 统一分配层级，useTeleport 处理挂载位置，useScrollLock 管理模态滚动锁，useFocusTrap 保证 Dialog 可访问性，useClickOutside 处理锚点浮层关闭。这样可以避免 z-index 冲突、滚动穿透、焦点丢失和嵌套浮层误关闭，让浮层组件在复杂企业后台中保持一致行为。

---

## 24. Icon 图标体系设计

本节目标是设计组件库的图标体系，包括 SVG 源码管理、图标元数据、Vue 图标组件、`UiIcon` 通用组件、按需引入、构建生成、主题颜色、可访问性、业务图标扩展、resolver 集成和第一阶段落地标准。

推荐定位：

```txt
@company/ui-icons = 图标资产与图标组件包
UiIcon = 图标渲染适配组件
Icon Metadata = 连接构建、文档、resolver 和搜索的图标索引
```

设计原则：

> 图标体系不能只是把 SVG 文件放进项目。企业组件库需要图标可按需引入、可搜索、可文档化、可扩展、可主题化，并且不能让全量图标污染用户 bundle。

### 24.1 为什么图标体系要独立设计

图标在组件库中出现频率极高：

```txt
Button icon
Input prefix / suffix icon
Select arrow
DatePicker calendar
Dialog close
Table sorter / filter
Tree expand
Upload status
Message status
```

如果图标没有体系，会出现问题：

```txt
1. 每个组件内联 SVG，重复且难维护
2. 全量图标被打入 bundle
3. 图标命名不统一
4. 图标颜色无法跟随主题
5. 业务图标和基础图标混在一起
6. 文档站无法搜索图标
7. resolver 无法自动按需导入图标
```

设计动机：

> 图标是组件库的基础资产。它既是视觉资源，也是构建资源、文档资源和按需引入资源。

### 24.2 图标体系分层

推荐分层：

```txt
Raw SVG Layer
  原始 svg 文件

Metadata Layer
  name / category / tags / keywords / source

Build Layer
  svgo 优化、Vue component 生成、entry 生成

Runtime Layer
  UiIcon / 具体图标组件

Ecosystem Layer
  docs search / resolver / icon preview / business icon extension
```

职责：

| 层 | 职责 |
|---|---|
| Raw SVG | 存放设计侧导出的原始图标 |
| Metadata | 管理图标名称、分类、标签、搜索关键词 |
| Build | 生成 Vue 图标组件和入口 |
| Runtime | 在组件中渲染图标 |
| Ecosystem | 文档、搜索、按需引入和业务扩展 |

设计动机：

> 图标不是只有运行时组件，还需要构建和文档生态支撑。

### 24.3 包结构设计

推荐结构：

```txt
packages/icons/
├─ src/
│  ├─ svg/
│  │  ├─ add.svg
│  │  ├─ close.svg
│  │  ├─ search.svg
│  │  └─ calendar.svg
│  ├─ components/
│  │  ├─ add.ts
│  │  ├─ close.ts
│  │  ├─ search.ts
│  │  └─ calendar.ts
│  ├─ meta/
│  │  ├─ icons.ts
│  │  └─ categories.ts
│  ├─ runtime/
│  │  ├─ icon.vue
│  │  ├─ icon.ts
│  │  └─ types.ts
│  ├─ resolver.ts
│  └─ index.ts
├─ scripts/
│  ├─ generate-icons.ts
│  ├─ optimize-svg.ts
│  └─ generate-meta.ts
├─ package.json
└─ tsconfig.json
```

对外入口：

```txt
@company/ui-icons
@company/ui-icons/add
@company/ui-icons/close
@company/ui-icons/search
@company/ui-icons/meta
@company/ui-icons/resolver
```

设计动机：

> 图标包应该独立发布、独立构建、独立按需引入。组件包可以依赖图标包，但图标包不应该依赖组件包。

### 24.4 Raw SVG 规范

SVG 源码要求：

```txt
1. 统一 viewBox，推荐 0 0 1024 1024 或 0 0 24 24
2. 不保留固定 width / height
3. 不写死 fill 颜色，优先使用 currentColor
4. 不包含 style 标签
5. 不包含 script / foreignObject
6. 文件名使用 kebab-case
7. 通过 svgo 统一优化
```

示例：

```svg
<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <path d="..." />
</svg>
```

禁止：

```svg
<svg width="16" height="16" style="color:red">
```

设计动机：

> 图标必须能继承文字颜色和尺寸，否则无法自然融入 Button、Input、Message 等组件。

### 24.5 图标命名规范

文件名：

```txt
add.svg
close.svg
search.svg
calendar.svg
arrow-down.svg
chevron-right.svg
```

组件名：

```txt
AddIcon
CloseIcon
SearchIcon
CalendarIcon
ArrowDownIcon
ChevronRightIcon
```

CSS / 文档名：

```txt
add
close
search
calendar
arrow-down
chevron-right
```

命名规则：

```txt
1. 文件名 kebab-case
2. 组件名 PascalCase + Icon
3. 不使用含糊缩写
4. 方向类图标统一 arrow / chevron / caret 语义
5. 状态类图标统一 success / warning / error / info
```

设计动机：

> 图标命名一旦混乱，文档搜索、按需导入和业务协作都会变差。

### 24.6 图标元数据设计

元数据：

```ts
export interface IconMeta {
  name: string
  componentName: string
  title: string
  category: IconCategory
  tags: string[]
  keywords: string[]
  source?: string
}

export type IconCategory =
  | 'direction'
  | 'action'
  | 'status'
  | 'data'
  | 'media'
  | 'system'
```

示例：

```ts
export const iconsMeta: IconMeta[] = [
  {
    name: 'search',
    componentName: 'SearchIcon',
    title: '搜索',
    category: 'action',
    tags: ['search', 'find'],
    keywords: ['搜索', '查找', 'search']
  }
]
```

用途：

```txt
1. 文档站图标搜索
2. 图标分类展示
3. resolver 元数据
4. 生成图标列表
5. 业务图标治理
```

设计动机：

> 元数据让图标从文件资产变成可治理资产。

### 24.7 Vue 图标组件生成

生成组件：

```ts
import { defineComponent, h } from 'vue'

export default defineComponent({
  name: 'SearchIcon',
  setup(_, { attrs }) {
    return () => h(
      'svg',
      {
        viewBox: '0 0 24 24',
        fill: 'currentColor',
        'aria-hidden': attrs['aria-label'] ? undefined : 'true',
        ...attrs
      },
      [h('path', { d: '...' })]
    )
  }
})
```

每个图标独立入口：

```ts
import SearchIcon from '@company/ui-icons/search'
```

设计规则：

```txt
1. 每个图标生成独立组件文件
2. 每个图标生成独立 subpath export
3. 默认 fill=currentColor
4. 不生成全量副作用
5. 保留 attrs 透传
```

设计动机：

> 图标按需引入的关键是每个图标都有独立入口，而不是从根入口导入全量图标集合。

### 24.8 UiIcon 通用组件设计

`UiIcon` 负责统一尺寸、颜色、语义和插槽渲染。

使用方式一：包裹图标组件

```vue
<UiIcon size="16" color="var(--ui-color-text-secondary)">
  <SearchIcon />
</UiIcon>
```

使用方式二：name 渲染，适合已注册图标

```vue
<UiIcon name="search" />
```

Props：

```ts
export interface IconProps {
  name?: string
  size?: string | number
  color?: string
  spin?: boolean
  rotate?: number
  label?: string
}
```

渲染规则：

```txt
1. size 控制 width / height / font-size
2. color 默认 currentColor
3. label 存在时作为 aria-label
4. label 不存在时 aria-hidden=true
5. spin 添加旋转动画 class
6. name 模式依赖 icon registry，不作为第一阶段主路径
```

设计动机：

> 具体图标组件解决按需引入，UiIcon 解决统一渲染语义和样式控制。

### 24.9 name 模式与 registry 边界

name 模式：

```vue
<UiIcon name="search" />
```

需要图标注册表：

```ts
const iconRegistry = new Map<string, Component>()

export function registerIcon(name: string, component: Component) {
  iconRegistry.set(name, component)
}
```

风险：

```txt
1. 如果自动注册所有图标，会打入全量图标
2. name 字符串缺少类型提示
3. 动态查找不利于 tree-shaking
```

推荐策略：

```txt
第一阶段主推组件导入模式：<UiIcon><SearchIcon /></UiIcon>
name 模式只支持用户手动 registerIcon 后使用
不要默认注册所有图标
```

设计动机：

> name 模式使用方便，但容易破坏 Tree-shaking。第一阶段应优先保证按需引入可靠。

### 24.10 组件内图标使用规范

基础组件内部使用图标：

```ts
import CloseIcon from '@company/ui-icons/close'
```

示例：

```vue
<UiIcon>
  <CloseIcon />
</UiIcon>
```

规则：

```txt
1. 组件只 import 自己需要的图标
2. 不从 @company/ui-icons 根入口导入多个图标
3. 不在组件内使用字符串 name 依赖全局注册
4. 图标颜色跟随 currentColor
5. 图标尺寸由组件样式控制
```

设计动机：

> 组件内部使用图标必须保持 Tree-shaking。Dialog 只应该打入 CloseIcon，不应该打入全量 icons。

### 24.11 图标构建管线

构建流程：

```txt
读取 src/svg/*.svg
  ↓
svgo 优化
  ↓
校验 viewBox / fill / 命名
  ↓
生成 Vue icon component
  ↓
生成 meta
  ↓
生成 index.ts
  ↓
生成 package exports
  ↓
生成 docs icon data
```

脚本：

```txt
pnpm icons:generate
pnpm icons:check
```

校验内容：

```txt
1. 文件名 kebab-case
2. svg 不包含 width / height
3. svg 不包含 script / foreignObject
4. svg 使用 currentColor
5. meta 中存在对应记录
6. 生成的组件名不冲突
```

设计动机：

> 图标体系不能靠手工维护。新增图标时，组件、入口、元数据和文档都应该自动生成。

### 24.12 package exports 设计

`@company/ui-icons`：

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./search": {
      "types": "./dist/search.d.ts",
      "import": "./dist/search.js"
    },
    "./close": {
      "types": "./dist/close.d.ts",
      "import": "./dist/close.js"
    },
    "./meta": {
      "types": "./dist/meta.d.ts",
      "import": "./dist/meta.js"
    },
    "./resolver": {
      "types": "./dist/resolver.d.ts",
      "import": "./dist/resolver.js"
    }
  },
  "sideEffects": false
}
```

注意：

> 根入口可以导出类型和少量工具，但不建议鼓励用户从根入口导入所有图标。文档应主推 subpath import。

设计动机：

> exports 是图标按需引入的边界。没有 subpath exports，用户很容易全量导入。

### 24.13 图标 resolver 设计

自动导入图标：

```ts
import { CompanyIconResolver } from '@company/ui-icons/resolver'
```

规则：

```txt
SearchIcon → @company/ui-icons/search
CloseIcon → @company/ui-icons/close
```

Resolver：

```ts
export function CompanyIconResolver() {
  return {
    type: 'component' as const,
    resolve(name: string) {
      const meta = iconsMeta.find((item) => item.componentName === name)
      if (!meta) return

      return {
        name: 'default',
        from: `@company/ui-icons/${meta.name}`
      }
    }
  }
}
```

设计动机：

> 图标 resolver 可以让用户直接在模板里写 `<SearchIcon />`，同时仍然保持单图标按需引入。

### 24.14 主题与颜色设计

图标默认：

```css
.ui-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: inherit;
  line-height: 1;
}

.ui-icon svg {
  width: 1em;
  height: 1em;
  fill: currentColor;
}
```

使用：

```vue
<UiButton type="primary">
  <UiIcon>
    <SearchIcon />
  </UiIcon>
  Search
</UiButton>
```

规则：

```txt
1. 图标默认继承文本 color
2. size 用 font-size 或 width/height 控制
3. 状态色通过父组件 color 控制
4. 不在 SVG 内写死颜色
5. 多色图标作为特殊类型处理，不作为默认规范
```

设计动机：

> currentColor 是图标融入主题系统的关键。这样 Button、Message、Tag 等组件可以自然控制图标颜色。

### 24.15 可访问性设计

装饰性图标：

```vue
<UiIcon>
  <SearchIcon />
</UiIcon>
```

输出：

```html
<span aria-hidden="true">...</span>
```

语义图标：

```vue
<UiIcon label="搜索">
  <SearchIcon />
</UiIcon>
```

输出：

```html
<span role="img" aria-label="搜索">...</span>
```

规则：

```txt
1. 默认图标视为装饰性，aria-hidden=true
2. 提供 label 时 role=img + aria-label
3. icon-only button 必须提供 aria-label
4. 文档中明确可访问性用法
```

设计动机：

> 图标大多是装饰性，但 icon-only 交互控件必须有可读名称。组件库需要提供正确默认值和文档提示。

### 24.16 业务图标扩展

业务项目可以注册自己的图标：

```ts
import UserLevelIcon from './icons/user-level.vue'
import { registerIcon } from '@company/ui-icons'

registerIcon('user-level', UserLevelIcon)
```

使用：

```vue
<UiIcon name="user-level" />
```

也可以直接组件导入：

```vue
<UiIcon>
  <UserLevelIcon />
</UiIcon>
```

推荐：

```txt
业务图标优先使用组件导入
需要动态配置场景再使用 registerIcon + name
```

设计动机：

> 企业项目常有业务专属图标。组件库要提供扩展点，但不能把业务图标打入基础图标包。

### 24.17 多色图标与图片图标边界

单色图标：

```txt
默认主路径，使用 currentColor
```

多色图标：

```txt
允许作为特殊图标，但不能强制 currentColor
需要在 meta 中标记 multicolor=true
```

图片图标：

```txt
不建议放入 ui-icons
应由业务 assets 或 Image 组件处理
```

设计动机：

> 基础图标体系应该以单色可主题化 SVG 为主。多色品牌图标和图片图标有不同资产管理方式。

### 24.18 测试设计

单元测试：

```ts
describe('UiIcon', () => {
  it('renders default slot', () => {})
  it('applies size', () => {})
  it('applies color', () => {})
  it('sets aria-hidden by default', () => {})
  it('sets aria-label when label exists', () => {})
})
```

构建测试：

```txt
@company/ui-icons/search 可单独 import
@company/ui-icons/close 可单独 import
只引入 search 不打入 close
iconsMeta 包含 search
resolver 能解析 SearchIcon
```

SVG 校验测试：

```txt
不包含 script
不包含 width / height
使用 currentColor
文件名 kebab-case
```

设计动机：

> 图标测试的重点是构建和 Tree-shaking，而不只是 Vue 组件是否能渲染。

### 24.19 文档设计

图标文档需要包含：

```txt
图标搜索
图标分类
点击复制组件名
点击复制 import 路径
基础使用
UiIcon 包裹使用
size / color / spin
可访问性
业务图标注册
新增图标规范
```

示例：

```ts
import SearchIcon from '@company/ui-icons/search'
```

```vue
<UiIcon label="搜索">
  <SearchIcon />
</UiIcon>
```

设计动机：

> 图标文档的核心体验是搜索和复制。用户应该能快速找到图标并复制正确按需引入代码。

### 24.20 第一阶段落地步骤

建议顺序：

```txt
Step 1: 建立 packages/icons 包
Step 2: 定义 IconMeta / IconCategory 类型
Step 3: 放入第一批基础 SVG，如 close/search/arrow-down/check/warning
Step 4: 配置 svgo 优化规则
Step 5: 实现 generate-icons.ts
Step 6: 生成 Vue 图标组件
Step 7: 生成 subpath exports
Step 8: 实现 UiIcon
Step 9: 实现 iconsMeta
Step 10: 实现 CompanyIconResolver
Step 11: Dialog/Button/Input 接入按需图标
Step 12: 编写 UiIcon 单元测试
Step 13: 编写 SVG 校验脚本
Step 14: 编写图标文档和搜索页
Step 15: 验证只引入 SearchIcon 不打入其他图标
```

为什么这个顺序：

> 先保证图标资产可生成、可按需引入，再让组件使用图标。否则组件内部会先写死图标，后续迁移成本更高。

### 24.21 第一阶段验收标准

功能验收：

```txt
UiIcon 可以渲染 slot 图标
UiIcon 支持 size / color / spin
UiIcon 默认 aria-hidden=true
UiIcon 设置 label 后输出 aria-label
SearchIcon 可以单独导入
CloseIcon 可以被 Dialog 使用
Button 可以通过 icon slot 使用图标
```

工程验收：

```txt
SVG 通过 svgo 优化
SVG 不包含 width / height / script
每个图标有独立 Vue 组件
每个图标有独立 subpath export
iconsMeta 包含图标名称、分类、关键词
CompanyIconResolver 可以解析 SearchIcon
只引入 search 不打入 close
@company/ui-icons sideEffects=false
图标文档可搜索和复制 import
```

架构验收：

```txt
icons 包不依赖 components 包
components 可以依赖 icons 单图标入口
业务图标不进入基础 icons 包
name 模式不默认注册全量图标
根入口不鼓励全量导入所有图标
```

### 24.22 常见设计陷阱

#### 陷阱一：根入口导出并鼓励全量图标使用

问题：

```ts
import { SearchIcon, CloseIcon } from '@company/ui-icons'
```

风险：

> 如果根入口处理不好，容易打入全量图标。

修复：

```txt
文档主推 @company/ui-icons/search 这种 subpath import。
```

#### 陷阱二：SVG 写死颜色

问题：

```svg
<path fill="#1677ff" />
```

风险：

> 图标无法跟随 Button、Message、主题色变化。

修复：

```svg
<path fill="currentColor" />
```

#### 陷阱三：name 模式自动注册所有图标

问题：

```ts
icons.forEach(registerIcon)
```

风险：

> `<UiIcon name="search" />` 方便，但全量图标进入 bundle。

修复：

```txt
name 模式只注册用户显式导入的图标。
```

#### 陷阱四：业务图标混入基础图标包

问题：

```txt
order-status-paid.svg
vip-customer-level.svg
```

风险：

> 基础图标包被业务资产污染。

修复：

```txt
业务图标放业务项目或业务图标扩展包。
```

### 24.23 7 个维度总结

#### 架构分层

```txt
Icons：SVG 资产、图标组件、图标元数据
Components：UiIcon 和使用图标的基础组件
Build：图标生成、svgo、exports 生成
Docs：图标搜索和复制
Business：业务图标扩展
```

#### 模块划分

```txt
raw svg
icon meta
generate-icons
vue icon components
UiIcon
icon registry
icon resolver
docs search
```

#### 依赖关系

```txt
icons 不依赖 components
components 可依赖 icons 单图标入口
vue adapter 可导出 UiIcon
业务图标通过 registerIcon 或组件导入扩展
```

#### 设计模式

```txt
Asset Pipeline：SVG → Vue component
Metadata Pattern：IconMeta 驱动文档和 resolver
Registry Pattern：registerIcon 支持业务扩展
Wrapper Component：UiIcon 统一尺寸、颜色和 aria
Resolver Pattern：SearchIcon 自动导入 search
```

#### 潜在坑点

```txt
全量图标打包
SVG 写死颜色
图标命名混乱
业务图标污染基础包
name 模式破坏 Tree-shaking
图标文档不可搜索
```

#### 最佳实践

```txt
主推 subpath import
SVG 使用 currentColor
每个图标独立入口
图标元数据自动生成
UiIcon 处理尺寸和可访问性
业务图标显式注册
构建测试验证按需引入
```

#### 学习与思考点

```txt
图标是资产系统，不只是组件
Tree-shaking 对图标尤其重要
currentColor 是主题适配的核心
name 模式和按需引入天然有张力
图标元数据连接构建、文档和使用体验
```

### 24.24 架构能力表达点

在架构评审中，这一节可以这样表达：

> 我会把图标体系设计成独立的资产与组件包，而不是在各组件中散落 SVG。`@company/ui-icons` 管理 raw svg、IconMeta、Vue 图标组件、subpath exports 和 icon resolver；`UiIcon` 统一尺寸、颜色、旋转和可访问性；基础组件只按需 import 自己需要的单个图标；业务图标通过显式组件导入或 registerIcon 扩展。这样既能保证图标主题化和文档搜索体验，也能避免全量图标进入用户 bundle。

---

## 25. Directives 指令体系设计

本节目标是设计组件库的 Vue 指令体系，包括指令定位、包结构、内置指令选择、生命周期治理、SSR 安全、依赖边界、按需注册、测试和第一阶段落地标准。

推荐定位：

```txt
Directives = DOM 行为增强层
Components = UI 状态与交互抽象
Hooks = 可复用逻辑基础
Vue Adapter = 指令注册与运行时集成入口
```

核心原则：

> 指令不是组件的替代品。指令适合处理“贴近 DOM、横切多个组件、无需额外 UI 结构”的行为增强，例如 click-outside、resize、loading、permission、lazy。复杂状态、复杂结构和业务流程仍应放在组件或 hooks 中。

### 25.1 为什么需要独立的指令体系

Vue 指令常被随手写在业务项目中：

```txt
v-click-outside
v-permission
v-loading
v-lazy
v-resize
v-focus
v-infinite-scroll
```

如果没有统一体系，会出现问题：

```txt
1. 每个业务项目重复实现
2. mounted / unmounted 清理不完整，导致内存泄漏
3. SSR 下访问 window / document 报错
4. 指令命名和参数不统一
5. 权限、埋点、加载等行为混入基础组件
6. 指令全量注册，影响 Tree-shaking
7. 测试覆盖薄弱，边界行为不可控
```

设计动机：

> 指令是组件库的运行时增强能力。它们应该像组件一样有目录规范、类型规范、生命周期规范、测试规范和按需引入规范。

### 25.2 指令适用边界

适合用指令：

```txt
1. 需要直接操作 DOM 或监听 DOM 事件
2. 行为可附加到任意元素
3. 不需要新增复杂 UI 结构
4. 与组件状态耦合较低
5. 属于横切能力
```

不适合用指令：

```txt
1. 需要复杂渲染结构
2. 需要维护大量内部状态
3. 需要多个子组件协作
4. 需要强类型 props / emits / slots
5. 属于业务流程编排
```

示例判断：

| 能力 | 推荐形态 | 原因 |
|---|---|---|
| 点击外部关闭 | directive / hook | DOM 事件横切能力 |
| Loading 遮罩 | component + directive | 既有 UI 又有便捷绑定 |
| 权限隐藏 | directive | DOM 行为增强 |
| 表单校验 | component / hook | 状态复杂，不适合 directive |
| Tooltip | component | 有浮层结构和定位状态 |
| 图片懒加载 | directive | 直接作用于 img DOM |

设计动机：

> 指令的价值是“轻量附加行为”，不是绕开组件抽象。边界不清会让指令变成难维护的黑盒。

### 25.3 包结构设计

推荐结构：

```txt
packages/directives/
├─ src/
│  ├─ index.ts
│  ├─ install.ts
│  ├─ types.ts
│  ├─ click-outside/
│  │  ├─ index.ts
│  │  ├─ directive.ts
│  │  ├─ types.ts
│  │  └─ __tests__/
│  ├─ resize/
│  │  ├─ index.ts
│  │  ├─ directive.ts
│  │  └─ types.ts
│  ├─ focus/
│  ├─ loading/
│  ├─ lazy/
│  ├─ permission/
│  ├─ infinite-scroll/
│  └─ utils/
│     ├─ dom.ts
│     ├─ event.ts
│     └─ ssr.ts
├─ package.json
└─ tsconfig.json
```

对外入口：

```txt
@company/ui-directives
@company/ui-directives/click-outside
@company/ui-directives/resize
@company/ui-directives/focus
@company/ui-directives/loading
@company/ui-directives/lazy
@company/ui-directives/permission
```

设计动机：

> 指令包独立后，业务项目可以只引入需要的指令；Vue Adapter 可以选择性集成，但不能强制用户加载全部指令。

### 25.4 指令类型规范

基础类型：

```ts
import type { App, Directive } from 'vue'

export interface UiDirective<T = unknown> {
  name: string
  directive: Directive<HTMLElement, T>
  install: (app: App) => void
}

export type DirectiveBindingValue<T> = T | undefined | null
```

创建工具：

```ts
export function createDirective<T>(
  name: string,
  directive: Directive<HTMLElement, T>
): UiDirective<T> {
  return {
    name,
    directive,
    install(app) {
      app.directive(name, directive)
    }
  }
}
```

使用：

```ts
export const ClickOutside = createDirective<ClickOutsideBinding>(
  'click-outside',
  clickOutsideDirective
)
```

设计动机：

> 指令也需要和组件一样具备统一 install 协议。这样既支持 `app.use(ClickOutside)`，也支持 Vue Adapter 批量注册。

### 25.5 install 与按需注册设计

全量注册：

```ts
import { createApp } from 'vue'
import { directives } from '@company/ui-directives'

const app = createApp(App)

directives.forEach((directive) => {
  app.use(directive)
})
```

按需注册：

```ts
import { ClickOutside } from '@company/ui-directives/click-outside'

app.use(ClickOutside)
```

Vue Adapter 集成：

```ts
import { installDirectives } from '@company/ui-directives'

export function install(app: App, options: UiPluginOptions = {}) {
  provideGlobalConfig(app, options)
  installComponents(app, options.components)

  if (options.directives !== false) {
    installDirectives(app, options.directives)
  }
}
```

配置建议：

```ts
export interface UiPluginOptions {
  directives?: boolean | UiDirective[]
}
```

设计决策：

```txt
1. 指令支持独立 app.use
2. Vue Adapter 可以集成指令注册
3. 不默认强制全量导入所有重型指令
4. 文档主推按需注册
5. resolver 可选支持指令自动导入
```

设计动机：

> 指令体系同样要服务 Tree-shaking。便捷全量注册可以有，但架构主路径应保留按需能力。

### 25.6 click-outside 指令设计

使用：

```vue
<div v-click-outside="handleClose">
  ...
</div>
```

增强用法：

```vue
<div
  v-click-outside="{
    handler: handleClose,
    exclude: [triggerRef],
    capture: true
  }"
>
  ...
</div>
```

类型：

```ts
export interface ClickOutsideOptions {
  handler: (event: PointerEvent) => void
  exclude?: Array<HTMLElement | Ref<HTMLElement | undefined>>
  capture?: boolean
  disabled?: boolean
}

export type ClickOutsideBinding =
  | ((event: PointerEvent) => void)
  | ClickOutsideOptions
```

实现原则：

```txt
1. 监听 pointerdown，而不是只监听 click
2. 支持 exclude 排除触发元素
3. Teleport 场景要判断 composedPath
4. unmounted 时必须移除监听
5. disabled=true 时不触发 handler
```

设计动机：

> click-outside 是 Overlay 体系的重要基础能力。它必须正确处理 Teleport、事件冒泡、触发按钮排除和销毁清理。

### 25.7 resize 指令设计

使用：

```vue
<div v-resize="handleResize" />
```

类型：

```ts
export interface ResizeDirectiveEntry {
  width: number
  height: number
  contentRect: DOMRectReadOnly
}

export type ResizeDirectiveBinding = (entry: ResizeDirectiveEntry) => void
```

实现原则：

```txt
1. 优先使用 ResizeObserver
2. 每个元素保存自己的 observer 引用
3. unmounted 时 disconnect
4. SSR 下不创建 observer
5. 回调可通过 requestAnimationFrame 合并
```

适用场景：

```txt
Table 容器尺寸变化
VirtualList 容器测量
Textarea autosize
Popover 触发元素尺寸变化
```

设计动机：

> resize 指令是布局感知能力。它应封装 ResizeObserver 的生命周期，而不是让业务组件重复管理 observer。

### 25.8 focus 指令设计

使用：

```vue
<input v-focus />
```

带条件：

```vue
<input v-focus="visible" />
```

类型：

```ts
export type FocusDirectiveBinding = boolean | {
  enabled?: boolean
  delay?: number
  preventScroll?: boolean
}
```

实现原则：

```txt
1. mounted 后 focus
2. 条件从 false 变 true 时 focus
3. 支持 preventScroll
4. 支持 delay，适配 Dialog transition 后聚焦
5. 元素不可聚焦时不抛错
```

设计动机：

> focus 指令看似简单，但 Dialog、Drawer、表单错误定位都依赖可靠聚焦。它必须考虑 transition 和滚动副作用。

### 25.9 loading 指令设计

使用：

```vue
<div v-loading="loading">
  content
</div>
```

配置：

```vue
<div
  v-loading="{
    loading,
    text: '加载中',
    fullscreen: false,
    lock: false
  }"
/>
```

类型：

```ts
export interface LoadingDirectiveOptions {
  loading: boolean
  text?: string
  fullscreen?: boolean
  lock?: boolean
  background?: string
}

export type LoadingDirectiveBinding = boolean | LoadingDirectiveOptions
```

设计边界：

```txt
Loading 组件负责 UI 渲染
v-loading 负责把 Loading 挂载到目标元素
Loading service 负责命令式调用
```

注意：

> `v-loading` 是 directive + component 的组合，不应在指令内部手写复杂 DOM 结构。指令只负责挂载、更新和销毁 Loading 组件实例。

设计动机：

> loading 既是 UI 又是行为。将 UI 交给组件、挂载交给指令，可以避免指令膨胀成不可测试的 DOM 拼接逻辑。

### 25.10 lazy 图片懒加载指令设计

使用：

```vue
<img v-lazy="imageUrl" />
```

配置：

```vue
<img
  v-lazy="{
    src: imageUrl,
    loading: placeholderUrl,
    error: errorUrl,
    rootMargin: '100px'
  }"
/>
```

类型：

```ts
export interface LazyDirectiveOptions {
  src: string
  loading?: string
  error?: string
  rootMargin?: string
  threshold?: number
}

export type LazyDirectiveBinding = string | LazyDirectiveOptions
```

实现原则：

```txt
1. 优先使用 IntersectionObserver
2. 进入可视区后设置真实 src
3. 加载失败后设置 error 图
4. unmounted 时取消 observe
5. SSR 下不访问 IntersectionObserver
```

设计动机：

> 图片懒加载是典型 DOM 行为增强，适合指令。但它属于可选能力，不应进入核心组件包。

### 25.11 permission 权限指令设计

使用：

```vue
<button v-permission="'user:create'">Create</button>
```

多权限：

```vue
<button v-permission="['user:create', 'user:update']">Save</button>
```

配置：

```ts
export interface PermissionDirectiveOptions {
  value: string | string[]
  mode?: 'some' | 'every'
  fallback?: 'hide' | 'disable'
}
```

权限提供：

```ts
export interface PermissionChecker {
  hasPermission: (permission: string) => boolean
}

export function providePermissionChecker(checker: PermissionChecker) {
  permissionChecker = checker
}
```

设计边界：

```txt
基础组件库只提供权限指令协议
不内置具体权限模型
不读取路由 meta
不请求用户权限接口
不绑定某个业务 RBAC 系统
```

推荐行为：

```txt
默认 fallback=hide
需要保留布局时使用 fallback=disable
无 checker 时开发环境警告，生产环境不抛错
```

设计动机：

> 权限是企业后台高频需求，但权限模型属于业务系统。组件库可以提供 DOM 行为协议，不能内置具体权限体系。

### 25.12 infinite-scroll 指令设计

使用：

```vue
<div v-infinite-scroll="loadMore" />
```

配置：

```vue
<div
  v-infinite-scroll="{
    handler: loadMore,
    distance: 100,
    disabled: loading || finished,
    immediate: true
  }"
/>
```

类型：

```ts
export interface InfiniteScrollOptions {
  handler: () => void | Promise<void>
  distance?: number
  disabled?: boolean
  immediate?: boolean
  throttle?: number
}
```

实现原则：

```txt
1. 找到最近可滚动容器
2. 监听 scroll
3. 使用 throttle 控制触发频率
4. disabled 时不触发
5. unmounted 时移除监听
6. 不内置分页状态
```

设计边界：

> infinite-scroll 只负责“快到底部时触发回调”，不负责 page、total、finished、requestId 等数据请求状态。这些应由业务或 ProList 管理。

### 25.13 SSR 与运行时安全

SSR 风险：

```txt
window is not defined
document is not defined
ResizeObserver is not defined
IntersectionObserver is not defined
HTMLElement is not defined
```

工具函数：

```ts
export const isClient = typeof window !== 'undefined'

export function tryOnMounted(fn: () => void) {
  if (!isClient) return
  fn()
}
```

规则：

```txt
1. 指令定义阶段不访问 DOM
2. mounted 前不访问 window / document
3. SSR 环境直接 no-op
4. observer 类 API 必须特性检测
5. unmounted 清理函数必须幂等
```

设计动机：

> 指令最容易踩 SSR 坑，因为它天然靠近 DOM。所有 DOM 操作必须延迟到客户端生命周期。

### 25.14 生命周期与内存治理

每个指令都要回答：

```txt
mounted 时创建了什么资源？
updated 时如何同步 binding？
unmounted 时如何释放资源？
多次 updated 是否会重复注册？
元素被 v-if 移除后是否泄漏？
```

推荐模式：

```ts
const stateMap = new WeakMap<HTMLElement, DirectiveState>()

export const directive: Directive<HTMLElement, Binding> = {
  mounted(el, binding) {
    const state = createState(el, binding)
    stateMap.set(el, state)
  },
  updated(el, binding) {
    stateMap.get(el)?.update(binding)
  },
  unmounted(el) {
    stateMap.get(el)?.destroy()
    stateMap.delete(el)
  }
}
```

设计动机：

> WeakMap 是指令管理元素状态的常见模式。它能避免在 DOM 元素上挂私有字段，也更利于清理和测试。

### 25.15 与 hooks 的关系

推荐关系：

```txt
hooks 提供可组合逻辑
指令提供模板级便捷使用
组件复用 hooks，而不是反向依赖 directive
```

示例：

```txt
useClickOutside → v-click-outside
useResizeObserver → v-resize
useFocus → v-focus
usePermission → v-permission
```

依赖方向：

```txt
@company/ui-hooks → Vue runtime + DOM utils
@company/ui-directives → @company/ui-hooks
@company/ui-components → @company/ui-hooks
```

禁止：

```txt
hooks 依赖 directives
components 强依赖 directives
directives 反向依赖 components 全量入口
```

设计动机：

> hooks 是逻辑基础，directives 是使用形态。这样同一能力既能在组件内部复用，也能给业务模板直接使用。

### 25.16 与 Vue Adapter 的关系

Vue Adapter 职责：

```txt
1. 暴露 installDirectives 入口
2. 接收插件级 directives 配置
3. 与 ConfigProvider 共享 namespace / locale / zIndex 等上下文
4. 不在 Adapter 内实现具体指令逻辑
```

导出建议：

```ts
export { ClickOutside } from '@company/ui-directives/click-outside'
export { Resize } from '@company/ui-directives/resize'
export { Focus } from '@company/ui-directives/focus'
```

设计边界：

> Vue Adapter 可以聚合导出指令，但具体实现仍应放在 directives 包。这样 Adapter 是运行时平台，不是所有代码的垃圾桶。

### 25.17 指令命名规范

模板命名：

```txt
v-click-outside
v-resize
v-focus
v-loading
v-lazy
v-permission
v-infinite-scroll
```

源码命名：

```txt
ClickOutside
Resize
Focus
Loading
Lazy
Permission
InfiniteScroll
```

目录命名：

```txt
click-outside/
infinite-scroll/
```

规则：

```txt
1. 模板使用 kebab-case
2. 导出对象使用 PascalCase
3. 目录使用 kebab-case
4. 不使用业务缩写
5. 指令名不加 Ui 前缀，组件才使用 Ui 前缀
```

设计动机：

> 指令最终出现在模板里，命名要自然、可读，并符合 Vue 社区习惯。

### 25.18 package exports 设计

`@company/ui-directives`：

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./click-outside": {
      "types": "./dist/click-outside.d.ts",
      "import": "./dist/click-outside.js"
    },
    "./resize": {
      "types": "./dist/resize.d.ts",
      "import": "./dist/resize.js"
    },
    "./focus": {
      "types": "./dist/focus.d.ts",
      "import": "./dist/focus.js"
    },
    "./loading": {
      "types": "./dist/loading.d.ts",
      "import": "./dist/loading.js"
    },
    "./lazy": {
      "types": "./dist/lazy.d.ts",
      "import": "./dist/lazy.js"
    },
    "./permission": {
      "types": "./dist/permission.d.ts",
      "import": "./dist/permission.js"
    }
  },
  "sideEffects": false
}
```

注意：

> 如果某些指令引入样式或自动挂载 DOM，需要谨慎标记 sideEffects。第一阶段建议指令本身无全局副作用，样式由组件或显式 CSS 入口管理。

设计动机：

> 指令也需要明确的 subpath exports。否则业务一旦从根入口导入，很容易把所有指令和相关依赖一起打入 bundle。

### 25.19 测试设计

单元测试：

```ts
describe('v-click-outside', () => {
  it('calls handler when clicking outside', () => {})
  it('does not call handler when clicking inside', () => {})
  it('respects exclude elements', () => {})
  it('removes listener on unmounted', () => {})
})
```

生命周期测试：

```txt
mounted 创建资源
updated 更新 binding
unmounted 清理资源
重复 updated 不重复注册
v-if 切换不泄漏监听
```

SSR 测试：

```txt
服务端导入 directive 不访问 window
服务端导入 directive 不访问 document
缺少 ResizeObserver 时 no-op
缺少 IntersectionObserver 时 no-op
```

构建测试：

```txt
@company/ui-directives/click-outside 可单独 import
只导入 focus 不打入 lazy
sideEffects 配置不破坏按需引入
类型声明能正确导出 binding 类型
```

设计动机：

> 指令测试重点不是快照，而是事件、生命周期、资源清理和构建边界。

### 25.20 文档设计

每个指令文档需要包含：

```txt
基础用法
binding 类型
参数说明
生命周期说明
SSR 行为
与对应 hook 的关系
常见场景
边界限制
按需注册方式
```

示例结构：

```txt
Directives
├─ click-outside
├─ resize
├─ focus
├─ loading
├─ lazy
├─ permission
└─ infinite-scroll
```

设计动机：

> 指令很容易被误用。文档必须明确“适合什么、不适合什么”，否则业务会把复杂逻辑塞进 directive。

### 25.21 第一阶段落地步骤

建议顺序：

```txt
Step 1: 建立 packages/directives 包
Step 2: 定义 UiDirective / createDirective / installDirectives
Step 3: 建立 DOM utils 和 SSR utils
Step 4: 实现 v-click-outside
Step 5: 实现 v-focus
Step 6: 实现 v-resize
Step 7: 实现 v-loading 与 Loading 组件挂载协议
Step 8: 实现 v-permission 协议，不内置业务权限模型
Step 9: 实现 subpath exports
Step 10: Vue Adapter 接入 directives 配置
Step 11: 编写生命周期和 SSR 测试
Step 12: 编写按需引入构建测试
Step 13: 编写指令文档
```

为什么这个顺序：

> 先建立统一协议和生命周期规范，再实现具体指令。否则每个指令都会有自己的状态管理方式，后期难以统一治理。

### 25.22 第一阶段验收标准

功能验收：

```txt
v-click-outside 能正确识别内外点击
v-focus 能在 mounted 后聚焦
v-resize 能监听元素尺寸变化
v-loading 能基于 binding 显示和隐藏 Loading
v-permission 能通过外部 checker 控制显示或禁用
每个指令都能独立 app.use 注册
```

工程验收：

```txt
每个指令有独立 subpath export
指令包 sideEffects 配置合理
SSR 导入不访问 DOM
unmounted 后事件和 observer 被释放
WeakMap 状态被清理
只导入 click-outside 不打入 lazy
类型声明导出完整
```

架构验收：

```txt
directives 依赖 hooks，不反向
components 不强依赖 directives
Vue Adapter 只负责注册，不实现指令逻辑
permission 不绑定具体业务权限模型
loading UI 由组件负责，directive 只负责挂载
```

### 25.23 常见设计陷阱

#### 陷阱一：把复杂组件逻辑做成指令

问题：

```txt
v-table
v-form
v-modal
```

风险：

> 指令缺少 props / emits / slots 的表达能力，复杂 UI 会变成不可维护的 DOM 操作。

修复：

```txt
复杂 UI 用组件；指令只做轻量 DOM 行为增强。
```

#### 陷阱二：unmounted 不清理监听

问题：

```ts
document.addEventListener('click', handler)
```

但没有 remove。

风险：

> 路由切换、v-if 切换后仍触发旧 handler，造成内存泄漏和错误关闭。

修复：

```txt
每个指令必须维护 destroy，并在 unmounted 中幂等执行。
```

#### 陷阱三：SSR 阶段访问 DOM

问题：

```ts
const root = document.body
```

风险：

> SSR 构建或服务端渲染直接报错。

修复：

```txt
模块顶层不访问 DOM；mounted 后再访问；非客户端 no-op。
```

#### 陷阱四：权限指令内置业务模型

问题：

```ts
router.currentRoute.value.meta.permissions
store.user.permissions
```

风险：

> 组件库被具体项目的路由和 store 绑定，无法复用。

修复：

```txt
组件库只定义 PermissionChecker 协议，由业务注入 checker。
```

#### 陷阱五：全量注册所有指令

问题：

```ts
app.use(Directives)
```

并且内部注册所有指令和依赖。

风险：

> 用户只用 v-focus，也可能打入 lazy、loading、permission 等不需要的代码。

修复：

```txt
提供全量注册便利，但文档主推 subpath 按需注册。
```

### 25.24 7 个维度总结

#### 架构分层

```txt
Hooks：useClickOutside / useResizeObserver / useFocus / usePermission
Directives：v-click-outside / v-resize / v-focus / v-loading / v-lazy / v-permission
Components：Loading 等需要 UI 渲染的基础组件
Vue Adapter：指令注册和插件配置
Business：权限 checker、业务图标、业务行为注入
```

#### 模块划分

```txt
createDirective
installDirectives
DOM utils
SSR utils
click-outside
resize
focus
loading
lazy
permission
infinite-scroll
```

#### 依赖关系

```txt
directives → hooks / dom utils
components → hooks
directives 不依赖 components 全量入口
Vue Adapter → directives install 协议
业务 → permission checker 注入
```

#### 设计模式

```txt
Plugin Pattern：指令支持 app.use
Composable Pattern：指令复用 hooks
WeakMap State Pattern：元素状态管理
Adapter Pattern：permission checker 注入业务能力
Observer Pattern：ResizeObserver / IntersectionObserver
```

#### 潜在坑点

```txt
生命周期清理遗漏
SSR 访问 DOM
全量注册破坏 Tree-shaking
权限模型业务耦合
loading 指令手写复杂 DOM
click-outside 不兼容 Teleport
```

#### 最佳实践

```txt
模块顶层不访问 DOM
mounted 创建资源，unmounted 清理资源
使用 WeakMap 管理元素状态
指令复用 hooks，不复制逻辑
每个指令提供独立入口
权限能力通过 checker 注入
复杂 UI 仍用组件实现
```

#### 学习与思考点

```txt
指令是 DOM 行为增强层，不是组件替代品
hooks 是逻辑基础，directives 是模板使用形态
Tree-shaking 同样适用于指令体系
SSR 安全是所有 DOM 指令的底线
企业组件库要治理横切能力，而不是让业务重复散落实现
```

### 25.25 架构能力表达点

在架构评审中，这一节可以这样表达：

> 我会把指令体系作为组件库的 DOM 行为增强层独立设计，而不是把 v-click-outside、v-loading、v-permission 这类能力散落在业务项目里。`@company/ui-directives` 提供统一的 createDirective、installDirectives、生命周期清理、SSR 安全和 subpath exports；具体指令复用 hooks，Vue Adapter 只负责注册集成；权限指令只定义 PermissionChecker 协议，不绑定业务 RBAC。这样既能沉淀企业后台常见横切能力，又能避免内存泄漏、SSR 报错、业务耦合和全量打包问题。

