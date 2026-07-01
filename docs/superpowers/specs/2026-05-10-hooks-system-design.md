# Hooks 体系设计

## 1. 为什么需要独立的 Hooks 体系设计

`@company/ui-hooks` 是整个组件库的 Composition API 可复用逻辑沉淀层。在已有架构中：

- Button 样板（Section 18）使用了 `useNamespace`
- Form 体系（Section 20）依赖 `useFormItem`，且 `formContextKey` 被抽到 `hooks/use-form-item`
- Overlay 体系（Section 23）设计了 7 个 overlay hooks（useOverlay、useTeleport、useFocusTrap、useScrollLock、useClickOutside、useEscapeKey、usePosition）
- Directives 体系（Section 25）明确"指令复用 hooks"
- Vue Adapter（Section 17）中已有 `useNamespace`、`useZIndex`、`useLocale`、`useConfig`

但这些 hooks **散落在两个包中**（vue-adapter 和 hooks），**没有统一的分类规范**，**没有公开/内部边界**，**没有 SSR 安全策略**，**没有测试规范**。本节将 hooks 作为独立体系完整设计。

---

## 2. 主流 UI 库 Hooks 组织方式调研

### 2.1 Element Plus — 独立 hooks 包，全量导出

```
packages/
├─ hooks/          ← @element-plus/hooks（独立包）
│  ├─ use-namespace/
│  ├─ use-z-index/
│  ├─ use-locale/
│  ├─ use-modal/          (Dialog/Drawer 模态)
│  ├─ use-model-toggle/   (v-model 控制)
│  ├─ use-popper/         (定位引擎)
│  ├─ use-floating/       (Floating UI)
│  ├─ use-focus-controller/
│  ├─ use-teleport/
│  ├─ use-lockscreen/
│  ├─ use-escape-keydown/
│  ├─ use-id/
│  ├─ use-size/           (全局 size 注入)
│  └─ ...共 28 个 hooks
├─ components/     ← 组件实现，依赖 @element-plus/hooks
├─ element-plus/   ← Vue Adapter（全量注册 + resolver）
├─ utils/          ← 纯工具函数，无 Vue 依赖
├─ theme-chalk/    ← 样式包
├─ locale/         ← 国际化语言包
├─ directives/     ← 指令包
└─ constants/      ← 常量
```

关键决策：

- hooks 包是 Vue Composition API 可复用逻辑的独立包
- `peerDependencies: { "vue": "^3.2.0" }`——依赖 Vue 但不绑定具体组件
- 全量 export——不区分 public / internal
- `useNamespace`、`useZIndex`、`useLocale` 等"上下文读取"hook 和 `useModal`、`usePopper`、`useFocusTrap` 等"行为逻辑"hook 混在一起
- Vue Adapter（`@element-plus`）中没有独立 hooks，所有 composable 都在 hooks 包

### 2.2 Arco Design Vue — 单包内 _hooks 目录，不独立

```
packages/web-vue/       ← @arco-design/web-vue（单体包）
├─ components/
│  ├─ _hooks/           ← 共享 composables（组件内部）
│  │  ├─ use-form-item.ts
│  │  ├─ use-popup-manager.ts
│  │  ├─ use-resize-observer.ts
│  │  └─ ...共 22 个 hooks
│  ├─ _utils/
│  ├─ button/
│  └─ ...
└─ icon/
```

关键决策：

- 没有独立 hooks 包，composables 放在 `components/_hooks/` 下
- `_hooks` 命名前缀 `_` 表示内部使用，不承诺稳定性
- 所有组件在同一个 `web-vue` 包里，composable 只是组件间的共享层

### 2.3 Vant — 独立 vant-use 包，定位"通用 composable"

```
packages/
├─ vant-use/        ← @vant/use（独立包）
│  ├─ useClickAway/
│  ├─ useCountDown/
│  ├─ useEventListener/
│  ├─ useRect/
│  └─ ...共 13 个 hooks
├─ vant/
└─ vant-icons/
```

关键决策：

- hooks 包更偏向通用 composable（类似 VueUse 的定位）
- hook 命名和设计与移动端场景紧密相关
- 所有 hooks 全量导出，面向业务开发者使用

### 2.4 TDesign Vue Next — shared 包内 hooks 目录

```
packages/
├─ shared/              ← @tdesign/shared（共享包）
│  ├─ hooks/            ← composables
│  │  ├─ useConfig
│  │  ├─ useVModel
│  │  ├─ usePopupManager
│  │  ├─ useVirtualScroll
│  │  └─ ...共 25+ 个 hooks
│  └─ utils/
├─ components/
├─ tdesign-vue-next/
└─ pro-components/
```

关键决策：

- hooks 不独立，放在 `shared` 包内与 `utils` 并列
- shared 包同时承载框架无关工具和 Vue composable
- `useConfig`（读取全局配置）、`useVModel`（v-model 封装）等 Adapter 级 hook 也在 shared 里

### 2.5 对比总结

| 维度 | Element Plus | Arco Design | Vant | TDesign |
|------|-------------|-------------|------|---------|
| hooks 是否独立包 | 是 | 否 (`_hooks` 目录) | 是 | 否 (`shared/hooks` 目录) |
| Vue peer 依赖 | 是 | 隐式（同包） | 是 | 隐式（同包） |
| 公开 vs 内部 | 全量公开 | `_` 前缀表示内部 | 全量公开 | 混合 |
| Adapter 专属 hook 归属 | hooks 包（不区分） | 同包 | vant-use（不区分） | shared（不区分） |
| hooks 数量 | 28 | 22 | 13 | 25+ |
| Monorepo 粒度 | 细粒度拆包 | 单体包 | 中等 | 中等 |

核心发现：

1. 独立 hooks 包是 Monorepo 细粒度架构的标配——Element Plus 和 Vant 都选择了独立包
2. 没有一家区分 "public hooks" vs "internal hooks"——全部全量导出，靠文档或 `_` 前缀提示
3. 没有一家区分 "上下文读取 hook" vs "行为逻辑 hook"——useNamespace 和 useModal 混在同一层级
4. Adapter 专属 hook（useConfig、useTheme）在 Element Plus 中也放 hooks 包

---

## 3. 方案选型：双包分层

### 3.1 三种方案对比

| 方案 | 描述 | 优点 | 风险 |
|------|------|------|------|
| A：双包分层 | hooks 包放所有可复用 composable，vue 包只放 Adapter 专属上下文 | 复用逻辑集中，依赖边界清晰，改动最小 | hooks 包体积可能膨胀；某些 hook 归属可能模糊 |
| B：三包分层 | hooks(公开) + vue-internal(内部) + vue(Adapter) | 公开/内部边界更细 | 三包治理成本高，internal 包 subpath exports 维护复杂 |
| C：单包分区 | 所有 hooks 收归 hooks 包，subpath 区分公开/内部 | 单一来源 | hooks 包职责偏大，需强治理 |

### 3.2 选择方案 A：双包分层

`@company/ui-hooks` — Vue Composition API 可复用逻辑（可依赖 Vue peer）

`@company/ui-vue` — Adapter 专属上下文（ConfigProvider、install）

选择理由：

1. 双包是现有架构已经暗示的分层，改动最小
2. 区分标准清晰——"可复用逻辑" vs "Adapter 专属上下文"有明确判断依据
3. 三包过度设计，单包分区让 hooks 包职责过重
4. 归属模糊问题可以通过明确的判断规则解决

### 3.3 边界判断规则

| 判断条件 | 归属 | 示例 |
|---------|------|------|
| 组件内部需要调用的共享 composable | `ui-hooks` | useNamespace、useFormItem、useZIndex |
| 读取 ConfigProvider 特定字段的 composable | `ui-hooks` | useLocale、useSize |
| ConfigProvider 自身的定义与 provide 逻辑 | `ui-vue` | ConfigProvider.vue、useConfig |
| install 全量注册、resolver 生成 | `ui-vue` | install.ts、resolver.ts |
| withInstall 等组件注册工具 | `ui-vue` | utils/with-install.ts |

> 注：`useDisabled` 的能力已包含在 `useFormItem` 的 `disabled` computed 中，不再独立设计。

### 3.4 依赖方向

```
@company/ui-vue  →  @company/ui-hooks  →  @company/ui-core + @company/ui-utils
                           ↑
                  @company/ui-components
                  @company/ui-directives
```

- vue 依赖 hooks——ConfigProvider provide 的值，hooks 的 composable 来 inject 读取
- hooks 不依赖 vue-adapter——hooks 自己定义 injectionKey，vue-adapter 的 ConfigProvider 使用同一个 key 来 provide
- components 依赖 hooks——组件内部调用 useNamespace、useFormItem
- directives 依赖 hooks——v-click-outside 复用 useClickOutside

---

## 4. 包目录结构

```txt
packages/hooks/
├─ src/
│  │
│  ├─ context/                    # 上下文读取类 hooks
│  │  ├─ use-namespace/
│  │  │  ├─ use-namespace.ts
│  │  │  └─ index.ts
│  │  ├─ use-z-index/
│  │  │  ├─ use-z-index.ts
│  │  │  └─ index.ts
│  │  ├─ use-locale/
│  │  │  ├─ use-locale.ts
│  │  │  └─ index.ts
│  │  ├─ use-size/
│  │  │  ├─ use-size.ts
│  │  │  └─ index.ts
│  │  ├─ use-form-item/
│  │  │  ├─ use-form-item.ts
│  │  │  └─ index.ts
│  │  └─ index.ts
│  │
│  ├─ overlay/                    # 浮层行为类 hooks（来自 Section 23）
│  │  ├─ use-overlay/
│  │  ├─ use-overlay-manager/
│  │  ├─ use-model-toggle/
│  │  ├─ use-teleport/
│  │  ├─ use-focus-trap/
│  │  ├─ use-scroll-lock/
│  │  ├─ use-click-outside/
│  │  ├─ use-escape-key/
│  │  ├─ use-position/
│  │  └─ index.ts
│  │
│  ├─ dom/                        # DOM 行为类 hooks（与 Directives 共享）
│  │  ├─ use-resize-observer/
│  │  ├─ use-focus/
│  │  ├─ use-intersection-observer/
│  │  └─ index.ts
│  │
│  ├─ state/                      # 状态控制类 hooks
│  │  ├─ use-delayed-toggle/
│  │  ├─ use-id/
│  │  └─ index.ts
│  │
│  ├─ _internal/                  # 内部 hooks，不对外承诺稳定性
│  │  ├─ use-popper/
│  │  ├─ use-floating/
│  │  └─ index.ts
│  │
│  └─ index.ts                    # 公开入口，不导出 _internal
│
├─ __tests__/
├─ package.json
└─ tsconfig.json
```

### 四类 hooks 的设计动机

| 分类 | 职责 | 典型 hooks | 为什么分在一起 |
|------|------|-----------|--------------|
| **context** | 从 ConfigProvider inject 读取上下文 | useNamespace、useZIndex、useLocale、useSize、useFormItem | 都是"读取全局注入"的模式，结构相似：定义 key + inject + fallback |
| **overlay** | 浮层生命周期管理 | useOverlay、useOverlayManager、useModelToggle、useTeleport、useFocusTrap、useScrollLock、useClickOutside、useEscapeKey、usePosition | 共享浮层状态机（closed → opening → open → closing），互相协作 |
| **dom** | DOM 元素行为观察 | useResizeObserver、useFocus、useIntersectionObserver | 都是对 DOM API 的 Composition API 封装，自动 cleanup |
| **state** | 组件状态控制 | useDelayedToggle、useId | 都是纯逻辑 composable，不依赖 DOM |

### 与 Element Plus 对比的关键差异

| 维度 | Element Plus | 我们的设计 |
|------|-------------|-----------|
| hooks 分类 | 全平铺 28 个目录 | 四分类 + _internal，按职责组织 |
| public/internal | 不区分 | `_internal` 目录，index.ts 不导出 |
| 浮层 hooks | useModal + usePopper + useLockscreen 散放 | overlay 分类统一管理，共享状态机模型 |
| DOM hooks | 分散（useDraggable、useFocus 独立） | dom 分类统一管理，与 directives 共享 |

---

## 5. context 类 hooks 详细设计

所有 context hooks 遵循相同结构：

```
1. inject(key, fallback)          — 从 ConfigProvider 读取
2. computed 合并优先级链          — prop > 注入 > 默认值
3. 返回 ref/computed             — 响应式，组件可直接绑定
```

injectionKey 全部定义在 `@company/ui-core`，hooks 和 vue-adapter 共用同一组 key：

- `@company/ui-core` 定义 key：`export const namespaceInjectionKey: InjectionKey<string> = Symbol('namespace')`
- `@company/ui-hooks` inject 读取：`inject(namespaceInjectionKey, 'ui')`
- `@company/ui-vue` ConfigProvider provide：`provide(namespaceInjectionKey, namespace)`

这样 hooks 不依赖 vue-adapter，vue-adapter 也不依赖 hooks——它们通过 core 的 key 协议解耦。

### 5.1 useNamespace — BEM class 命名生成

```ts
// packages/hooks/src/context/use-namespace/use-namespace.ts

import { inject, computed, unref, type Ref } from 'vue'
import { namespaceInjectionKey } from '@company/ui-core'

export const defaultNamespace = 'ui'

const statePrefix = 'is-'

export function useNamespace(block: string) {
  const namespace = inject(namespaceInjectionKey, defaultNamespace)

  const b = () => `${namespace}-${block}`

  const e = (element: string) => `${b()}__${element}`

  const m = (modifier: string) => `${b()}--${modifier}`

  const em = (element: string, modifier: string) => `${e(element)}--${modifier}`

  const is = (name: string, ...args: [boolean | Ref<boolean>] | []) => {
    const state = args.length ? unref(args[0]) : true
    return state ? `${statePrefix}${name}` : ''
  }

  const cssVar = (object: Record<string, string>) => {
    const styles: Record<string, string> = {}
    for (const key in object) {
      styles[`--${namespace}-${block}-${key}`] = object[key]
    }
    return styles
  }

  const cssVarBlock = (object: Record<string, string>) => {
    const styles: Record<string, string> = {}
    for (const key in object) {
      styles[`--${b()}-${key}`] = object[key]
    }
    return styles
  }

  return {
    namespace,
    b,
    e,
    m,
    em,
    is,
    cssVar,
    cssVarBlock,
  }
}
```

设计决策：

| 决策点 | 选择 | 理由 |
|--------|------|------|
| BEM 分隔符 | `__`（element）、`--`（modifier） | 标准 BEM 规范，与父架构 Section 14.11 一致；SCSS 可读性好 |
| namespace 来源 | inject from ConfigProvider | 支持业务项目自定义前缀，避免样式冲突 |
| fallback 值 | `'ui'` | 不在 ConfigProvider 内也能工作 |
| `is()` 输出 | `is-loading` 而非 `ui-button--loading` | 状态 class 独立于 BEM，方便全局覆盖 |

### 5.2 useZIndex — 浮层层级分配

```ts
// packages/hooks/src/context/use-z-index/use-z-index.ts

import { inject, ref, provide, type Ref } from 'vue'
import { zIndexCounterInjectionKey } from '@company/ui-core'

const DEFAULT_INITIAL_Z_INDEX = 2000

export function useZIndex(initialZIndex?: number) {
  // 尝试从 ConfigProvider 注入的计数器中获取
  const injectedCounter = inject(zIndexCounterInjectionKey, undefined)

  if (injectedCounter) {
    // 使用 ConfigProvider 提供的计数器
    const nextZIndex = () => {
      injectedCounter.value++
      return injectedCounter.value
    }
    return {
      currentZIndex: injectedCounter,
      nextZIndex,
    }
  }

  // 独立使用场景（无 ConfigProvider）
  const localCounter = ref(initialZIndex ?? DEFAULT_INITIAL_Z_INDEX)
  const nextZIndex = () => {
    localCounter.value++
    return localCounter.value
  }

  // 提供给子组件共享同一个计数器
  provide(zIndexCounterInjectionKey, localCounter)

  return {
    currentZIndex: localCounter,
    nextZIndex,
  }
}
```

设计决策：

| 决策点 | 选择 | 理由 |
|--------|------|------|
| inject/provide 模式 | 替代模块级变量 | 模块级变量在 SSR 中跨请求共享，造成状态泄漏；inject/provide 跟随组件实例，SSR 每个请求隔离 |
| 起始值 | 2000，可由 ConfigProvider 覆盖 | 2000 足以覆盖业务项目常见 z-index |
| 计数器作用域 | 跟随 ConfigProvider 子树 | 嵌套 ConfigProvider 各自独立计数，互不干扰 |
| 独立使用 | 无 ConfigProvider 时自建计数器并 provide 给子组件 | 保证不在 ConfigProvider 内也能正常工作 |

与 Overlay 体系的协作：

```
Dialog 打开 → useZIndex().next() → 拿到 2001
  嵌套 Popover 打开 → useZIndex().next() → 拿到 2002
    嵌套 Tooltip 打开 → useZIndex().next() → 拿到 2003
```

### 5.3 useLocale — 国际化消息读取

```ts
// packages/hooks/src/context/use-locale/use-locale.ts

import { inject, type Ref } from 'vue'
import { localeInjectionKey, type LocaleMessages } from '@company/ui-core'

export function useLocale(defaultLocale?: LocaleMessages) {
  const locale = inject(localeInjectionKey, defaultLocale)

  const t = (path: string, ...args: unknown[]): string => {
    if (!locale) return path

    const value = resolvePath(locale, path)
    if (typeof value === 'function') {
      return value(...args)
    }
    return value ?? path
  }

  return {
    locale,
    t,
  }
}

function resolvePath(locale: LocaleMessages, path: string): string | Function | undefined {
  const segments = path.split('.')
  let current: any = locale
  for (const segment of segments) {
    if (current[segment] === undefined) return undefined
    current = current[segment]
  }
  return current
}
```

设计决策：

| 决策点 | 选择 | 理由 |
|--------|------|------|
| 默认语言包不硬编码 | 通过参数传入，由 ConfigProvider 层注入 | 避免 hooks 依赖 ui-vue 造成循环依赖；默认语言包定义在 ui-vue 中，由 ConfigProvider provide，hooks 不直接 import |
| t() 返回 key 本身 | path 找不到时返回 path 字符串 | 避免渲染空白，开发者能看到缺失的 key |
| 支持插值 | value 是 function 时传 args | 支持 `'{count} 项'` 这类模板 |

### 5.4 useSize — 全局尺寸注入

```ts
// packages/hooks/src/context/use-size/use-size.ts

import { inject, type Ref, computed, unref } from 'vue'
import { sizeInjectionKey, type ComponentSize } from '@company/ui-core'

export function useSize(fallback?: Ref<ComponentSize> | ComponentSize) {
  const injectedSize = inject(sizeInjectionKey, undefined)

  return computed(() => {
    return injectedSize ?? unref(fallback) ?? 'medium'
  })
}
```

优先级链：component prop > useFormItem().size > useSize() > 'medium'

### 5.5 useFormItem — 表单上下文读取

```ts
// packages/hooks/src/context/use-form-item/use-form-item.ts

import { inject, computed, type Ref } from 'vue'
import {
  formInjectionKey,
  formItemInjectionKey,
  type FormContext,
  type FormItemContext,
  type ComponentSize,
} from '@company/ui-core'

export interface UseFormItemReturn {
  form: FormContext | undefined
  formItem: FormItemContext | undefined
  size: Ref<ComponentSize>
  disabled: Ref<boolean>
  validateState: Ref<string | undefined>
}

export function useFormItem(props: {
  size?: Ref<ComponentSize | undefined>
  disabled?: Ref<boolean | undefined>
}): UseFormItemReturn {
  const form = inject(formInjectionKey, undefined)
  const formItem = inject(formItemInjectionKey, undefined)

  const size = computed(() => {
    return unref(props.size)
      ?? formItem?.size
      ?? form?.size
      ?? 'medium'
  })

  const disabled = computed(() => {
    return unref(props.disabled)
      ?? formItem?.disabled
      ?? form?.disabled
      ?? false
  })

  const validateState = computed(() => formItem?.validateState)

  return { form, formItem, size, disabled, validateState }
}
```

设计决策：

| 决策点 | 选择 | 理由 |
|--------|------|------|
| injectionKey 来源 | `@company/ui-core` | key 是协议，不是 Vue 实现细节；React 适配时也用同一个 key 定义 |
| 可选消费 | inject 第二参数 undefined | 不在 Form 内也能正常使用 Input |
| 优先级链 | prop > formItem > form > fallback | 组件自身 prop 最具体，全局最宽泛 |

---

## 6. overlay 类 hooks 详细设计

### 6.1 useOverlay — 浮层状态机

浮层不能只用 boolean 表示状态。动画期间需要区分 opening / closing，否则会出现闪烁、提前销毁和事件顺序错误。

```ts
// packages/hooks/src/overlay/use-overlay/use-overlay.ts

import { ref, computed, type Ref } from 'vue'

export type OverlayState = 'closed' | 'opening' | 'open' | 'closing'

export interface UseOverlayOptions {
  /** v-model 绑定值 */
  modelValue: Ref<boolean>
  /**
   * 请求关闭的回调（组件 emit update:modelValue）
   * useOverlay 不直接修改 modelValue ref，而是通过此回调请求关闭，
   * 避免直接修改 caller 的 ref（可能是 computed 或 read-only）
   */
  onClose: () => void
  /** 打开动画结束后调用 */
  onAfterEnter?: () => void
  /** 关闭动画结束后调用 */
  onAfterLeave?: () => void
  /** 关闭前的拦截，返回 false 可阻止关闭 */
  beforeClose?: () => boolean | Promise<boolean>
}

export function useOverlay(options: UseOverlayOptions) {
  const state = ref<OverlayState>('closed')

  // 标记：如果在 opening 状态下调用了 close，取消 afterEnter 的状态转换
  let closeRequestedDuringOpening = false

  const isOpen = computed(() => state.value === 'open' || state.value === 'opening')
  const isClosed = computed(() => state.value === 'closed' || state.value === 'closing')

  async function open() {
    closeRequestedDuringOpening = false
    state.value = 'opening'
  }

  function onAfterEnter() {
    // 如果在 opening 动画期间已经被请求关闭，不转换到 open
    if (closeRequestedDuringOpening) return
    state.value = 'open'
    options.onAfterEnter?.()
  }

  async function close() {
    if (state.value !== 'open' && state.value !== 'opening') return

    const canClose = await options.beforeClose?.()
    if (canClose === false) return

    // 标记正在关闭，防止 onAfterEnter 误将状态设为 open
    closeRequestedDuringOpening = true
    state.value = 'closing'

    // 通过回调请求关闭，而不是直接修改 modelValue ref
    options.onClose()
  }

  function onAfterLeave() {
    state.value = 'closed'
    closeRequestedDuringOpening = false
    options.onAfterLeave?.()
  }

  return {
    state,
    isOpen,
    isClosed,
    open,
    close,
    onAfterEnter,
    onAfterLeave,
  }
}
```

状态机转换图：

```
closed ──open()──▶ opening ──onAfterEnter()──▶ open
  ▲                    │                        │
  │                    │ close()                │ close()
  │                    ▼                        │
  │              closing ◀──────────────────────┘
  │                    │
  └──onAfterLeave()───┘

注意：opening 状态下调用 close() 时，onAfterEnter 不会将状态
错误地设为 open（通过 closeRequestedDuringOpening 标记保护）
```

设计决策：

| 决策点 | 选择 | 理由 |
|--------|------|------|
| 四态而非双态 | closed/opening/open/closing | 动画期间 DOM 存在但交互受限，close 请求需排队 |
| beforeClose 异步 | 支持 Promise | Dialog"确定前校验"场景需要异步拦截 |
| 不直接修改 modelValue ref | 通过 onClose 回调请求关闭 | caller 的 ref 可能是 computed 或 read-only，直接修改会报错；由组件 emit `update:modelValue` 更安全 |
| opening 期间 close 保护 | closeRequestedDuringOpening 标记 | 防止 opening→closing→open 的无效状态转换；onAfterEnter 检查标记后跳过 |
| 无动画组件 | afterEnter/afterLeave 同步调用 | Popover/Tooltip 可能无动画，需同步完成状态转换 |

### 6.2 useOverlayManager — 浮层栈管理

**设计动机**：父架构 Section 23.4 设计了 OverlayManager 管理浮层栈，协调 Escape 键关闭最内层浮层、z-index 递增和嵌套浮层感知。useOverlayManager 是 OverlayManager 的 Composition API 接口。

```ts
// packages/hooks/src/overlay/use-overlay-manager/use-overlay-manager.ts

import { inject, provide, reactive, onBeforeUnmount, type Ref } from 'vue'
import { overlayManagerInjectionKey } from '@company/ui-core'

export interface OverlayInstance {
  id: string
  type: 'modal' | 'anchor'  // modal: Dialog/Drawer; anchor: Popover/Tooltip/Dropdown
  close: () => void
  zIndex: number
}

export interface OverlayManagerContext {
  stack: OverlayInstance[]
  register: (instance: OverlayInstance) => void
  unregister: (id: string) => void
  closeTopByEsc: () => void
}

export function useOverlayManager() {
  const parentManager = inject(overlayManagerInjectionKey, undefined)

  const manager = reactive<OverlayManagerContext>({
    stack: [...(parentManager?.stack ?? [])],

    register(instance: OverlayInstance) {
      manager.stack.push(instance)
    },

    unregister(id: string) {
      const index = manager.stack.findIndex((item) => item.id === id)
      if (index > -1) {
        manager.stack.splice(index, 1)
      }
    },

    closeTopByEsc() {
      // 从栈顶找到最内层可被 Escape 关闭的浮层
      for (let i = manager.stack.length - 1; i >= 0; i--) {
        const top = manager.stack[i]
        top.close()
        return // 只关闭最内层一个
      }
    },
  })

  provide(overlayManagerInjectionKey, manager)

  return manager
}
```

**与 useEscapeKey 的关系**：

```
useEscapeKey 只负责监听键盘事件
useOverlayManager 负责决定关闭哪个浮层

组件使用方式:
const manager = useOverlayManager()
useEscapeKey({
  enabled: isOpen,
  onEscape: () => manager.closeTopByEsc()
})
```

设计决策：

| 决策点 | 选择 | 理由 |
|--------|------|------|
| 栈模式 | FILO（后进先出） | 最后打开的浮层在最上面，Escape 应先关闭最内层 |
| 区分 modal/anchor | 类型标记 | 未来可扩展：modal 打开时锁定背景滚动，anchor 不需要 |
| inject + provide 链 | 支持嵌套作用域 | 嵌套 ConfigProvider 各自管理子树浮层栈 |

### 6.3 useTeleport — 挂载位置管理

浮层默认挂载 body，支持 ConfigProvider 自定义容器。

```ts
// packages/hooks/src/overlay/use-teleport/use-teleport.ts

import { inject, computed, type Ref } from 'vue'
import { teleportInjectionKey } from '@company/ui-core'

export interface UseTeleportOptions {
  teleport?: Ref<string | boolean | HTMLElement | undefined>
}

export function useTeleport(options: UseTeleportOptions = {}) {
  const configTeleport = inject(teleportInjectionKey, undefined)

  const container = computed(() => {
    const propValue = options.teleport?.value
    if (propValue === false) return false
    if (propValue === true) return 'body'
    if (typeof propValue === 'string') return propValue
    if (propValue instanceof HTMLElement) return propValue

    if (configTeleport === false) return false
    return configTeleport ?? 'body'
  })

  const disabled = computed(() => container.value === false)

  return {
    container,
    disabled,
  }
}
```

### 6.4 useFocusTrap — 焦点锁定

Dialog/Drawer 模态浮层必须锁定焦点，保证 Tab 不会跳出浮层。

```ts
// packages/hooks/src/overlay/use-focus-trap/use-focus-trap.ts

import { ref, onBeforeUnmount, type Ref } from 'vue'
import { getFocusableElements } from '@company/ui-utils/dom'

export interface UseFocusTrapOptions {
  containerRef: Ref<HTMLElement | undefined>
  enabled: Ref<boolean>
  initialFocus?: Ref<HTMLElement | string | undefined>
}

export function useFocusTrap(options: UseFocusTrapOptions) {
  let previouslyFocusedElement: HTMLElement | null = null

  function activate() {
    previouslyFocusedElement = document.activeElement as HTMLElement

    const container = options.containerRef.value
    if (!container) return

    const initial = options.initialFocus?.value
    if (initial instanceof HTMLElement) {
      initial.focus()
    } else if (typeof initial === 'string') {
      container.querySelector<HTMLElement>(initial)?.focus()
    } else {
      const focusable = getFocusableElements(container)
      if (focusable.length) focusable[0].focus()
    }

    document.addEventListener('focusin', onFocusIn)
  }

  function deactivate() {
    document.removeEventListener('focusin', onFocusIn)

    if (previouslyFocusedElement) {
      previouslyFocusedElement.focus()
      previouslyFocusedElement = null
    }
  }

  function onFocusIn(e: FocusEvent) {
    const container = options.containerRef.value
    if (!container || !options.enabled.value) return

    if (!container.contains(e.target as HTMLElement)) {
      const focusable = getFocusableElements(container)
      if (focusable.length) focusable[0].focus()
    }
  }

  onBeforeUnmount(() => {
    deactivate()
  })

  return {
    activate,
    deactivate,
  }
}
```

设计决策：

| 决策点 | 选择 | 理由 |
|--------|------|------|
| 不引入 focus-trap 库 | 自行实现 | 减少依赖；企业组件库的焦点锁定场景可控 |
| 焦点恢复 | deactivate 时恢复 previouslyFocusedElement | Dialog 关闭后焦点恢复到触发按钮 |
| focusin 而非 keydown | 监听 focusin 事件 | 更可靠——不仅捕获 Tab，也捕获鼠标点击导致的焦点转移 |
| getFocusableElements 来自 utils | 复用 ui-utils/dom | 焦点元素查询是纯 DOM 工具，不属于 hooks |

### 6.5 useScrollLock — 滚动锁定

模态浮层打开时锁定背景滚动，并补偿 scrollbar 宽度避免页面抖动。支持嵌套模态场景的引用计数。

```ts
// packages/hooks/src/overlay/use-scroll-lock/use-scroll-lock.ts

import { ref, watch, onBeforeUnmount, type Ref } from 'vue'

// 引用计数，解决嵌套模态场景
let lockCount = 0

export interface UseScrollLockOptions {
  locked: Ref<boolean>
  container?: Ref<HTMLElement | undefined>
}

export function useScrollLock(options: UseScrollLockOptions) {
  const scrollbarWidth = ref(0)
  let originalOverflow = ''
  let originalPaddingRight = ''

  function getScrollbarWidth() {
    return window.innerWidth - document.documentElement.clientWidth
  }

  function lock() {
    const target = options.container?.value ?? document.body
    lockCount++

    // 首次锁定时保存原始样式
    if (lockCount === 1) {
      originalOverflow = target.style.overflow
      originalPaddingRight = target.style.paddingRight
      scrollbarWidth.value = getScrollbarWidth()

      target.style.overflow = 'hidden'
      if (scrollbarWidth.value > 0) {
        target.style.paddingRight = `${scrollbarWidth.value}px`
      }
    }
  }

  function unlock() {
    if (lockCount <= 0) return
    lockCount--

    // 最后一个锁释放时恢复原始样式
    if (lockCount === 0) {
      const target = options.container?.value ?? document.body
      target.style.overflow = originalOverflow
      target.style.paddingRight = originalPaddingRight
      originalOverflow = ''
      originalPaddingRight = ''
    }
  }

  watch(
    () => options.locked.value,
    (isLocked) => {
      isLocked ? lock() : unlock()
    }
  )

  onBeforeUnmount(() => {
    if (options.locked.value) {
      unlock()
    }
  })

  return {
    scrollbarWidth,
  }
}
```

设计决策：

| 决策点 | 选择 | 理由 |
|--------|------|------|
| 引用计数 | 模块级 lockCount | 嵌套 Dialog：第一个 Dialog 锁定，第二个 Dialog 锁定；关闭第二个时不解锁，关闭第一个才解锁（与父架构 Section 23.10 一致） |
| 保存原始样式 | 首次锁定时记录 | 避免解锁时丢失业务项目自定义的 overflow/paddingRight |

### 6.6 useClickOutside — 点击外部关闭

与 v-click-outside 指令共享核心逻辑。使用 `composedPath()` 正确处理 Teleport 场景。

```ts
// packages/hooks/src/overlay/use-click-outside/use-click-outside.ts

import { onMounted, onBeforeUnmount, type Ref } from 'vue'

export interface UseClickOutsideOptions {
  /** 监听的元素（浮层内容） */
  target: Ref<HTMLElement | undefined>
  /** 排除的元素（如触发按钮），点击这些元素不触发回调 */
  exclude?: Ref<HTMLElement | HTMLElement[] | undefined>
  /** 点击外部时的回调 */
  handler: (event: MouseEvent) => void
  /** 事件类型，默认 mousedown */
  event?: 'mousedown' | 'pointerdown' | 'click'
}

export function useClickOutside(options: UseClickOutsideOptions) {
  const eventType = options.event ?? 'mousedown'

  function listener(event: MouseEvent) {
    const target = options.target.value
    if (!target) return

    // 使用 composedPath 检测，兼容 Teleport 和 Shadow DOM 场景
    // composedPath 包含事件冒泡路径中的所有元素，
    // 即使浮层内容被 Teleport 到 body，也能正确判断"点击是否在浮层内"
    if (isInside(event, target)) return

    const excludeEl = options.exclude?.value
    if (excludeEl) {
      const excludes = Array.isArray(excludeEl) ? excludeEl : [excludeEl]
      if (excludes.some((el) => isInside(event, el))) return
    }

    options.handler(event)
  }

  function isInside(event: MouseEvent, element: HTMLElement): boolean {
    // 优先使用 composedPath（正确处理 Teleport 和 Shadow DOM）
    if (event.composedPath) {
      return event.composedPath().includes(element)
    }
    // fallback: 旧浏览器使用 contains
    return element.contains(event.target as Node)
  }

  onMounted(() => {
    document.addEventListener(eventType, listener)
  })

  onBeforeUnmount(() => {
    document.removeEventListener(eventType, listener)
  })
}
```

设计决策：

| 决策点 | 选择 | 理由 |
|--------|------|------|
| composedPath 优先 | 优先使用 event.composedPath() | Teleport 场景下浮层内容被移到 body，contains 无法检测；composedPath 包含完整事件路径（与父架构 Section 23.12 一致） |
| contains fallback | 旧浏览器不支持 composedPath 时回退 | 兼容性保障 |

### 6.7 useEscapeKey — Escape 键处理

Escape 键关闭最顶层浮层，嵌套浮层只关闭最内层。

```ts
// packages/hooks/src/overlay/use-escape-key/use-escape-key.ts

import { onMounted, onBeforeUnmount, type Ref } from 'vue'

export interface UseEscapeKeyOptions {
  enabled: Ref<boolean>
  onEscape: () => void
}

export function useEscapeKey(options: UseEscapeKeyOptions) {
  function listener(event: KeyboardEvent) {
    if (event.key === 'Escape' && options.enabled.value) {
      event.stopPropagation()
      options.onEscape()
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', listener)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('keydown', listener)
  })
}
```

设计决策：`stopPropagation()` 是关键——嵌套 Dialog 中按 Escape，只关闭最内层，不冒泡到外层 Dialog。

### 6.8 usePosition — 锚点定位

Popover/Tooltip/Dropdown 需要相对触发元素定位。

```ts
// packages/hooks/src/overlay/use-position/use-position.ts

import { ref, watch, onBeforeUnmount, type Ref } from 'vue'
import type { Placement, PositionStrategy } from '@company/ui-core'

export interface UsePositionOptions {
  anchor: Ref<HTMLElement | undefined>
  floating: Ref<HTMLElement | undefined>
  placement: Ref<Placement>
  strategy?: Ref<PositionStrategy>
  offset?: Ref<number>
}

export function usePosition(options: UsePositionOptions) {
  const position = ref({ x: 0, y: 0 })
  let rafId: number | null = null

  function update() {
    const anchorEl = options.anchor.value
    const floatingEl = options.floating.value
    if (!anchorEl || !floatingEl) return

    const anchorRect = anchorEl.getBoundingClientRect()
    const floatingRect = floatingEl.getBoundingClientRect()
    const offset = options.offset?.value ?? 8

    const { x, y } = computePosition(anchorRect, floatingRect, options.placement.value, offset)

    position.value = { x, y }
  }

  function computePosition(
    anchor: DOMRect,
    floating: DOMRect,
    placement: Placement,
    offset: number
  ): { x: number; y: number } {
    switch (placement) {
      case 'top':
        return {
          x: anchor.left + anchor.width / 2 - floating.width / 2,
          y: anchor.top - floating.height - offset,
        }
      case 'bottom':
        return {
          x: anchor.left + anchor.width / 2 - floating.width / 2,
          y: anchor.bottom + offset,
        }
      case 'left':
        return {
          x: anchor.left - floating.width - offset,
          y: anchor.top + anchor.height / 2 - floating.height / 2,
        }
      case 'right':
        return {
          x: anchor.right + offset,
          y: anchor.top + anchor.height / 2 - floating.height / 2,
        }
      case 'top-start':
        return { x: anchor.left, y: anchor.top - floating.height - offset }
      case 'top-end':
        return { x: anchor.right - floating.width, y: anchor.top - floating.height - offset }
      case 'bottom-start':
        return { x: anchor.left, y: anchor.bottom + offset }
      case 'bottom-end':
        return { x: anchor.right - floating.width, y: anchor.bottom + offset }
      default:
        return { x: anchor.left, y: anchor.bottom + offset }
    }
  }

  function scheduleUpdate() {
    if (rafId !== null) return
    rafId = requestAnimationFrame(() => {
      update()
      rafId = null
    })
  }

  watch([options.anchor, options.floating, options.placement], () => {
    scheduleUpdate()
  })

  onBeforeUnmount(() => {
    if (rafId !== null) cancelAnimationFrame(rafId)
  })

  return {
    position,
    update,
  }
}
```

设计决策：

| 决策点 | 选择 | 理由 |
|--------|------|------|
| 第一阶段不含 autoFlip | 只实现基础方向定位，不做视口翻转 | 翻转逻辑复杂度远超定位本身；Popover 第一阶段可接受固定方向；需要翻转时使用 `_internal/useFloating` |
| 不依赖 Floating UI | 第一阶段自行实现基础定位 | 减少外部依赖；基础 8 方向定位逻辑清晰可控 |
| rAF 调度 | 避免同一帧多次计算 | resize/scroll 高频触发时合并到一次 |
| Placement 类型来自 core | 框架无关协议 | `'top' \| 'bottom' \| 'left' \| 'right' \| 'top-start' \| ...` 在 core 中定义 |
| 第二阶段扩展 | `_internal/useFloating` 引入 @floating-ui/dom | autoFlip、autoShift、virtual element 等高级定位能力在第二阶段通过 Floating UI 封装实现 |

### overlay 类 hooks 协作关系

```
Dialog 使用 overlay hooks 的方式:

useOverlay(state machine)
  ├── useOverlayManager(注册浮层栈)
  ├── useModelToggle(v-model 控制)
  ├── useTeleport(挂载到 body)
  ├── useZIndex(分配层级)
  ├── useFocusTrap(模态锁定焦点)
  ├── useScrollLock(锁定背景滚动)
  └── useEscapeKey(Escape 关闭 → manager.closeTopByEsc)

Popover 使用 overlay hooks 的方式:

useOverlay(state machine)
  ├── useOverlayManager(注册浮层栈)
  ├── useModelToggle(v-model 控制)
  ├── usePosition(锚点定位)
  ├── useTeleport(挂载到 body)
  ├── useZIndex(分配层级)
  ├── useClickOutside(点击外部关闭)
  └── useEscapeKey(Escape 关闭 → manager.closeTopByEsc)
```

### 6.9 useModelToggle — v-model 可见性控制

Dialog/Drawer/Popover/Tooltip 都有 `v-model:visible` 的可见性控制，逻辑完全相同。归入 overlay 分类是因为它依赖 OverlayState 类型，是浮层控制链的一部分。

```ts
// packages/hooks/src/overlay/use-model-toggle/use-model-toggle.ts

import { watch, type Ref } from 'vue'
import type { OverlayState } from '../use-overlay/use-overlay'

export interface UseModelToggleOptions {
  modelValue: Ref<boolean>
  state: Ref<OverlayState>
  onOpen?: () => void
  onClose?: () => void
}

export function useModelToggle(options: UseModelToggleOptions) {
  watch(
    () => options.modelValue.value,
    (value) => {
      if (value && options.state.value === 'closed') {
        options.onOpen?.()
      } else if (!value && (options.state.value === 'open' || options.state.value === 'opening')) {
        options.onClose?.()
      }
    }
  )

  function open() {
    options.modelValue.value = true
  }

  function close() {
    options.modelValue.value = false
  }

  function toggle() {
    options.modelValue.value = !options.modelValue.value
  }

  return {
    open,
    close,
    toggle,
  }
}
```

设计决策：

| 决策点 | 选择 | 理由 |
|--------|------|------|
| 归入 overlay 而非 state | 依赖 OverlayState 类型 | 消除跨分类依赖；useModelToggle 是浮层控制链的一部分 |
| 不直接操作 state | 通过 modelValue 间接触发 overlay | v-model 是唯一真相源，状态机响应 v-model 变化 |
| watch 而非 watchEffect | 精确控制触发条件 | 避免 state 变化导致循环触发 |

---

## 7. dom 类 hooks 详细设计

统一模式：

```
1. 创建 Observer / 绑定事件
2. 返回 start / stop 控制生命周期
3. onBeforeUnmount 自动 stop
4. 组件在 onMounted 时调用 start()
```

核心价值是自动 cleanup——组件卸载时自动移除 observer/listener，业务开发者不用手动管理。

### 7.1 useResizeObserver — 元素尺寸监听

```ts
// packages/hooks/src/dom/use-resize-observer/use-resize-observer.ts

import { onBeforeUnmount, type Ref } from 'vue'

export interface UseResizeObserverOptions {
  target: Ref<HTMLElement | undefined>
  callback: (entry: ResizeObserverEntry) => void
  disabled?: Ref<boolean>
}

export function useResizeObserver(options: UseResizeObserverOptions) {
  let observer: ResizeObserver | null = null

  function start() {
    const el = options.target.value
    if (!el || options.disabled?.value) return

    observer = new ResizeObserver((entries) => {
      const entry = entries.find((e) => e.target === el)
      if (entry) options.callback(entry)
    })

    observer.observe(el)
  }

  function stop() {
    observer?.disconnect()
    observer = null
  }

  onBeforeUnmount(() => {
    stop()
  })

  return {
    start,
    stop,
  }
}
```

设计决策：

| 决策点 | 选择 | 理由 |
|--------|------|------|
| 不自动 start | 返回 start/stop 由调用方控制 | target 可能是条件渲染的元素，mounted 时不一定存在 |
| 过滤子元素 entry | `entries.find(e => e.target === el)` | ResizeObserver 默认监听子元素溢出，但组件通常只关心自身尺寸 |
| disabled 支持 | 可暂停观察 | 大数据 Table 滚动时暂停 resize 计算，提升性能 |

### 7.2 useFocus — 焦点控制

```ts
// packages/hooks/src/dom/use-focus/use-focus.ts

import { onMounted, type Ref } from 'vue'

export interface UseFocusOptions {
  target: Ref<HTMLElement | undefined>
  autoFocus?: Ref<boolean>
  delay?: Ref<number>
  onFocus?: () => void
}

export function useFocus(options: UseFocusOptions) {
  let timerId: ReturnType<typeof setTimeout> | null = null

  function focus() {
    const el = options.target.value
    if (!el) return

    const delay = options.delay?.value ?? 0

    if (delay > 0) {
      timerId = setTimeout(() => {
        el.focus()
        options.onFocus?.()
        timerId = null
      }, delay)
    } else {
      el.focus()
      options.onFocus?.()
    }
  }

  function blur() {
    options.target.value?.blur()
  }

  function clearTimer() {
    if (timerId !== null) {
      clearTimeout(timerId)
      timerId = null
    }
  }

  if (options.autoFocus?.value) {
    onMounted(() => {
      focus()
    })
  }

  onBeforeUnmount(() => {
    clearTimer()
  })

  return {
    focus,
    blur,
  }
}
```

设计决策：

| 决策点 | 选择 | 理由 |
|--------|------|------|
| delay 支持 | setTimeout 延迟聚焦 | Dialog 有打开动画，动画期间 focus 会跳帧，需要等动画结束 |
| onBeforeUnmount 清理 timer | clearTimeout 防止组件卸载后对已分离 DOM 聚焦 | 避免触发 Vue dev warning 和延迟 GC |
| 不抢焦点 | 只在 autoFocus 或手动调用时聚焦 | 不干预用户正在操作的元素 |

### 7.3 useIntersectionObserver — 可见性监听

```ts
// packages/hooks/src/dom/use-intersection-observer/use-intersection-observer.ts

import { onBeforeUnmount, type Ref } from 'vue'

export interface UseIntersectionObserverOptions {
  target: Ref<HTMLElement | undefined>
  callback: (isIntersecting: boolean, entry: IntersectionObserverEntry) => void
  options?: IntersectionObserverInit
  once?: boolean
}

export function useIntersectionObserver(options: UseIntersectionObserverOptions) {
  let observer: IntersectionObserver | null = null

  function start() {
    const el = options.target.value
    if (!el) return

    observer = new IntersectionObserver((entries) => {
      const entry = entries[0]
      if (!entry) return

      const isIntersecting = entry.isIntersecting
      options.callback(isIntersecting, entry)

      if (isIntersecting && options.once) {
        stop()
      }
    }, options.options)

    observer.observe(el)
  }

  function stop() {
    observer?.disconnect()
    observer = null
  }

  onBeforeUnmount(() => {
    stop()
  })

  return {
    start,
    stop,
  }
}
```

设计决策：

| 决策点 | 选择 | 理由 |
|--------|------|------|
| once 模式 | 支持，触发一次后自动停止 | 图片懒加载只需知道"进入视口"一次 |
| callback 签名 | `(isIntersecting, entry)` 而非 `(entries)` | 组件场景下通常只监听单个元素，简化使用 |

---

## 8. state 类 hooks 详细设计

纯逻辑 composable，不依赖 DOM，用于组件内部状态管理。

### 8.1 useDelayedToggle — 延迟显示/隐藏

Tooltip 需要延迟显示（鼠标悬停 200ms 后）、延迟隐藏（鼠标移开后 100ms 再隐藏，避免闪烁）。

```ts
// packages/hooks/src/state/use-delayed-toggle/use-delayed-toggle.ts

import { ref, onBeforeUnmount, type Ref } from 'vue'

export interface UseDelayedToggleOptions {
  openDelay?: Ref<number>
  closeDelay?: Ref<number>
  onOpen?: () => void
  onClose?: () => void
}

export function useDelayedToggle(options: UseDelayedToggleOptions = {}) {
  let openTimer: ReturnType<typeof setTimeout> | null = null
  let closeTimer: ReturnType<typeof setTimeout> | null = null

  const pendingState = ref<'idle' | 'opening' | 'closing'>('idle')

  function delayedOpen() {
    clearCloseTimer()
    if (options.openDelay?.value && options.openDelay.value > 0) {
      pendingState.value = 'opening'
      openTimer = setTimeout(() => {
        pendingState.value = 'idle'
        options.onOpen?.()
      }, options.openDelay.value)
    } else {
      options.onOpen?.()
    }
  }

  function delayedClose() {
    clearOpenTimer()
    if (options.closeDelay?.value && options.closeDelay.value > 0) {
      pendingState.value = 'closing'
      closeTimer = setTimeout(() => {
        pendingState.value = 'idle'
        options.onClose?.()
      }, options.closeDelay.value)
    } else {
      options.onClose?.()
    }
  }

  function clearOpenTimer() {
    if (openTimer) {
      clearTimeout(openTimer)
      openTimer = null
    }
  }

  function clearCloseTimer() {
    if (closeTimer) {
      clearTimeout(closeTimer)
      closeTimer = null
    }
  }

  onBeforeUnmount(() => {
    clearOpenTimer()
    clearCloseTimer()
  })

  return {
    pendingState,
    delayedOpen,
    delayedClose,
  }
}
```

设计决策：

| 决策点 | 选择 | 理由 |
|--------|------|------|
| 互斥清理 | delayedOpen 清除 closeTimer，反之亦然 | 鼠标快速移入移出时，旧 timer 必须取消 |
| pendingState | 暴露"即将打开/关闭"状态 | Tooltip 内容可能显示"即将出现"的过渡效果 |

### 8.2 useId — 唯一 ID 生成

多个组件需要唯一 ID 关联 ARIA 属性（`aria-describedby`、`aria-controls`）。

```ts
// packages/hooks/src/state/use-id/use-id.ts

import { ref, getCurrentInstance } from 'vue'

let idCounter = 0

export interface UseIdOptions {
  prefix?: string
}

export function useId(options: UseIdOptions = {}) {
  const prefix = options.prefix ?? 'ui'

  // 优先使用 Vue 3.5+ 内置 useId（SSR/client 一致性保证）
  const instance = getCurrentInstance()
  if (instance?.appContext?.config?.globalProperties?.$id) {
    return { id: ref((instance.appContext.config.globalProperties.$id as Function)()) }
  }

  // fallback: 使用组件 uid + 计数器确保 SSR/client 一致性
  const uid = instance?.uid ?? ++idCounter
  const id = ref(`${prefix}-${uid}`)

  return {
    id,
  }
}
```

设计决策：

| 决策点 | 选择 | 理由 |
|--------|------|------|
| 优先使用 Vue 3.5+ useId | 如果可用则委托 | Vue 3.5+ 内置 useId 保证 SSR/client ID 一致 |
| fallback 使用 uid | `getCurrentInstance()?.uid` | uid 在 SSR 和客户端同一组件上值相同，避免 hydration mismatch |
| 前缀可配置 | 默认 `ui-` | 避免与业务项目其他 ID 冲突 |
| ref 包裹 | 返回 Ref<string> | 方便模板绑定和动态前缀 |

---

## 9. _internal hooks 设计

### 9.1 usePopper — Popper.js 封装

第二阶段实现。如果组件需要高级定位（virtual element、复杂翻转），在此引入 Popper.js。

```ts
// packages/hooks/src/_internal/use-popper/use-popper.ts
// 第二阶段实现，第一阶段不落地
```

### 9.2 useFloating — Floating UI 封装

第二阶段实现。如果团队选择 Floating UI 而非 Popper.js，在此封装。

```ts
// packages/hooks/src/_internal/use-floating/use-floating.ts
// 第二阶段实现，第一阶段不落地
```

### _internal 的治理规则

1. **index.ts 不导出 _internal**——公开入口不可见
2. **package.json exports 不注册 _internal**——外部消费者无法通过 exports map 发现；组件库内部通过构建工具直接解析源码路径
3. **不承诺稳定性**——major 版本内 API 可能变
4. **所有 _internal 导出符号添加 `@internal` JSDoc 标记**——IDE 悬停时提示不稳定

```jsonc
// packages/hooks/package.json exports
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./context/*": {
      "types": "./dist/context/*/index.d.ts",
      "import": "./dist/context/*/index.js",
      "require": "./dist/context/*/index.cjs"
    },
    "./overlay/*": {
      "types": "./dist/overlay/*/index.d.ts",
      "import": "./dist/overlay/*/index.js",
      "require": "./dist/overlay/*/index.cjs"
    },
    "./dom/*": {
      "types": "./dist/dom/*/index.d.ts",
      "import": "./dist/dom/*/index.js",
      "require": "./dist/dom/*/index.cjs"
    },
    "./state/*": {
      "types": "./dist/state/*/index.d.ts",
      "import": "./dist/state/*/index.js",
      "require": "./dist/state/*/index.cjs"
    }
    // 注意：_internal 不在 exports 中注册
    // 组件库内部通过构建工具直接解析源码路径 import
    // 外部消费者无法通过包的 exports map 发现 _internal
  }
}
```

---

## 10. 依赖约束

### 10.1 hooks 包依赖约束矩阵

```
@company/ui-hooks 允许依赖:
  ├── @company/ui-core        ✅ 类型、injectionKey、协议
  ├── @company/ui-utils       ✅ DOM 工具函数（getFocusableElements 等）
  └── vue (peerDependency)    ✅ Composition API

@company/ui-hooks 禁止依赖:
  ├── @company/ui-components  ❌ 不依赖具体组件实现
  ├── @company/ui-directives  ❌ hooks 是逻辑基础，directives 消费 hooks
  ├── @company/ui-vue         ❌ 不依赖 Adapter 层
  ├── @company/ui-pro-components ❌ 不依赖业务层
  ├── @company/ui-theme       ❌ 不依赖样式包
  └── @company/ui-build       ❌ 不依赖构建工具
```

### 10.2 关键约束验证

| 规则 | 违规示例 | 正确做法 |
|------|---------|---------|
| hooks 不依赖 components | `import UiButton from '@company/ui-components/button'` | hooks 不 import 组件 |
| hooks 不依赖 vue-adapter | `import { useConfig } from '@company/ui-vue'` | useConfig 放在 hooks 中，vue-adapter 只做 provide |
| hooks 不反向依赖 directives | `import { vClickOutside } from '@company/ui-directives'` | directives 依赖 hooks，不是反过来 |
| injectionKey 定义在 core | hooks 内定义 `Symbol('namespace')` | 从 `@company/ui-core` import key |

### 10.3 injectionKey 归属表

所有 injectionKey 定义在 `@company/ui-core`，hooks 和 vue-adapter 通过 import 同一个 key 实现解耦。

Core 保持框架无关——injectionKey 使用 `unique symbol` 而非 Vue 的 `InjectionKey<T>`：

```ts
// @company/ui-core/src/context/keys.ts
// 不 import vue，保持框架无关

export const namespaceInjectionKey: unique symbol = Symbol('namespace')
export const zIndexCounterInjectionKey: unique symbol = Symbol('zIndexCounter')
export const localeInjectionKey: unique symbol = Symbol('locale')
export const sizeInjectionKey: unique symbol = Symbol('size')
export const teleportInjectionKey: unique symbol = Symbol('teleport')
export const overlayManagerInjectionKey: unique symbol = Symbol('overlayManager')

export const formInjectionKey: unique symbol = Symbol('form')
export const formItemInjectionKey: unique symbol = Symbol('formItem')
```

Hooks 层使用时 cast 为 Vue 的 `InjectionKey<T>`：

```ts
// @company/ui-hooks 中使用
import { inject, type InjectionKey } from 'vue'
import { namespaceInjectionKey } from '@company/ui-core'

const namespace = inject(namespaceInjectionKey as InjectionKey<string>, 'ui')
```

为什么 key 放 core 而不用 Vue 类型：

| 方案 | 问题 |
|------|------|
| key 放 hooks，用 InjectionKey | vue-adapter 需要 import key → adapter 依赖 hooks，方向正确但 key 是协议不是逻辑 |
| key 放 core，用 InjectionKey | core import vue 类型违反框架无关原则 |
| key 放 core，用 unique symbol | hooks 和 adapter 都从 core import key → 两者都不互相依赖；hooks 层 cast 为 InjectionKey 获得类型安全 |

---

## 11. 测试策略

### 11.1 单元测试（Vitest）

```ts
// packages/hooks/__tests__/use-namespace.test.ts

import { useNamespace } from '../src/context/use-namespace'

describe('useNamespace', () => {
  it('生成默认 BEM class', () => {
    const ns = useNamespace('button')
    expect(ns.b()).toBe('ui-button')
    expect(ns.e('icon')).toBe('ui-button_icon')
    expect(ns.m('primary')).toBe('ui-button-primary')
    expect(ns.is('loading', true)).toBe('is-loading')
    expect(ns.is('loading', false)).toBe('')
  })
})
```

### 11.2 inject/provide 集成测试

```ts
// packages/hooks/__tests__/use-namespace-inject.test.ts

import { provide } from 'vue'
import { namespaceInjectionKey } from '@company/ui-core'

describe('useNamespace with ConfigProvider', () => {
  it('读取注入的 namespace', () => {
    provide(namespaceInjectionKey, 'my-app')
    const ns = useNamespace('button')
    expect(ns.b()).toBe('my-app-button')
  })
})
```

### 11.3 SSR 安全测试

```ts
// packages/hooks/__tests__/ssr-safe.test.ts

describe('SSR safety', () => {
  const originalWindow = global.window

  beforeEach(() => {
    delete (global as any).window
    delete (global as any).document
  })

  afterEach(() => {
    global.window = originalWindow
  })

  it('useNamespace 不依赖 window', () => {
    expect(() => useNamespace('button')).not.toThrow()
  })

  it('useId 不依赖 window', () => {
    expect(() => useId()).not.toThrow()
  })
})
```

### 11.4 Overlay hooks 集成测试

Overlay hooks 是整个 hooks 系统中最复杂的集成点，需要验证多个 hook 的协作行为。

```ts
// packages/hooks/__tests__/overlay-integration.test.ts

describe('Overlay hooks integration', () => {
  it('Modal 模式：Dialog 打开时锁定焦点和滚动', () => {
    // useOverlay + useTeleport + useZIndex + useFocusTrap + useScrollLock + useEscapeKey
  })

  it('Anchor 模式：Popover 点击外部关闭', () => {
    // useOverlay + usePosition + useClickOutside + useEscapeKey
  })

  it('嵌套浮层 Escape 键关闭最内层', () => {
    // Dialog 包含 Popover，按 Escape 只关闭 Popover
    // useOverlayManager.stack 正确管理层级
  })

  it('嵌套 Dialog 滚动锁计数正确', () => {
    // 打开两个 Dialog → lockCount = 2
    // 关闭内层 → lockCount = 1，scroll 仍锁定
    // 关闭外层 → lockCount = 0，scroll 恢复
  })
})
```

---

## 12. SSR 安全设计

| hook | SSR 行为 | 设计 |
|------|---------|------|
| useNamespace | 纯计算，安全 | 无需特殊处理 |
| useZIndex | 不访问 DOM，安全 | 模块级变量在 SSR 隔离实例中各自递增 |
| useLocale | 纯 inject，安全 | 无需特殊处理 |
| useSize | 纯 inject，安全 | 无需特殊处理 |
| useFormItem | 纯 inject，安全 | 无需特殊处理 |
| useModelToggle | 纯 watch，安全 | 无需特殊处理 |
| useDelayedToggle | setTimeout，安全 | SSR 不会触发 onMounted |
| useId | 纯计算，安全 | 需注意 SSR/CSR ID 一致性（Vue 3.5+ useId 解决） |
| useOverlay | 纯状态机，安全 | DOM 操作在 open() 中，SSR 不会调用 |
| **useOverlayManager** | 纯 reactive + provide，安全 | SSR 下栈为空，不依赖 DOM |
| **useModelToggle** | 纯 watch，安全 | SSR 不会触发 onMounted |
| **useTeleport** | 依赖 DOM | **SSR 下 disabled=true，不访问 document** |
| **useFocusTrap** | 依赖 DOM | **SSR 下 activate() 空操作** |
| **useScrollLock** | 依赖 DOM | **SSR 下 lock() 空操作** |
| **useClickOutside** | 依赖 DOM | **onMounted 不注册 listener，SSR 安全** |
| **useEscapeKey** | 依赖 DOM | **onMounted 不注册 listener，SSR 安全** |
| **usePosition** | 依赖 DOM | **update() 在 anchor/floating 为空时返回，SSR 安全** |
| **useResizeObserver** | 依赖 DOM | **start() 在 SSR 不调用，SSR 安全** |
| **useFocus** | 依赖 DOM | **focus() 在 target 为空时返回，SSR 安全** |
| **useIntersectionObserver** | 依赖 DOM | **start() 在 SSR 不调用，SSR 安全** |

统一原则：DOM 相关 hooks 的 DOM 操作全部在 `onMounted` 之后或显式 `start()`/`activate()` 中执行，setup 阶段不访问 `window`/`document`。

---

## 13. 第一阶段落地步骤

```
Step 1: 创建 hooks 包骨架
  - package.json + tsconfig.json + src/index.ts
  - 配置 subpath exports

Step 2: 实现 context 类 5 个 hooks
  - useNamespace → useZIndex → useLocale → useSize → useFormItem
  - 每个配单元测试

Step 3: 实现 state 类 2 个 hooks
  - useDelayedToggle → useId
  - 每个配单元测试

Step 4: 实现 dom 类 3 个 hooks
  - useResizeObserver → useFocus → useIntersectionObserver
  - 每个配单元测试 + SSR 安全测试

Step 5: 实现 overlay 类 8 个 hooks
  - useOverlay → useOverlayManager → useModelToggle → useTeleport → useFocusTrap
  → useScrollLock → useClickOutside → useEscapeKey → usePosition
  - 每个配单元测试 + 集成测试 + SSR 安全测试

Step 6: 创建 _internal 目录
  - 仅占位，第一阶段不实现 usePopper/useFloating

Step 7: 将 ui-core 中的 injectionKey 迁移到 core/src/context/keys.ts
  - 确保 hooks 和 vue-adapter 都从 core import

Step 8: 更新 vue-adapter
  - ConfigProvider 使用 core 的 key 来 provide
  - 删除 vue-adapter 中已有的 useNamespace/useZIndex/useLocale
  - 改为从 @company/ui-hooks import

Step 9: 更新已有组件依赖
  - Button 样板改为从 @company/ui-hooks import
  - Form 体系的 useFormItem 改为从 @company/ui-hooks import

Step 10: 配置 dependency-cruiser 规则
  - hooks 不依赖 components/directives/vue/pro
  - 验证通过
```

---

## 14. 第一阶段验收标准

| 维度 | 标准 |
|------|------|
| 功能完整性 | context 5 + overlay 8 (含 useOverlayManager/useModelToggle) + dom 3 + state 2 = 18 个 hooks 全部实现 |
| 测试覆盖 | 每个 hook 至少 1 个单元测试，DOM 类 hook 有 SSR 安全测试，overlay 类 hook 有集成测试 |
| 依赖约束 | dependency-cruiser 校验通过，无违规依赖 |
| Tree-shaking | subpath exports 配置正确，单独 import `@company/ui-hooks/use-namespace` 不打入其他 hook |
| 类型导出 | 每个 hook 的返回类型显式 export，组件使用时类型完整 |
| 公开/内部 | index.ts 不导出 _internal，_internal 可通过深路径 import |
| SSR 安全 | DOM 类 hook 在无 window 环境下不报错 |
| 与现有体系协作 | Button/Form/Overlay/Directives 体系已更新引用路径 |

---

## 15. 常见设计陷阱

| 陷阱 | 描述 | 规避 |
|------|------|------|
| **hooks 访问组件实例** | hook 内部 `getCurrentInstance()` 获取组件上下文 | 禁止。hooks 通过参数和 inject 获取数据，不依赖组件实例 |
| **hook 内直接操作 DOM** | `document.querySelector()` 在 setup 阶段执行 | 所有 DOM 操作在 onMounted 或显式调用中执行 |
| **hook 返回值不是 ref** | 返回普通值，丢失响应式 | 返回值统一用 `Ref<T>` 或 `ComputedRef<T>` |
| **cleanup 遗漏** | 组件卸载后 observer/listener 仍活跃 | 每个 DOM hook 都在 `onBeforeUnmount` 清理 |
| **injectionKey 散落定义** | 各 hook 自己 `Symbol('xxx')` | 所有 key 统一在 `@company/ui-core` 定义 |
| **overlay state 与 v-model 双向驱动** | state 变化改 v-model，v-model 变化改 state，循环触发 | v-model 是唯一真相源，state machine 响应 v-model 变化 |
| **_internal 滥用** | 所有不好分类的 hook 都塞进 _internal | _internal 只放"API 不稳定"的 hook，不放"不知道放哪"的 hook |

---

## 16. 七维度总结

| 维度 | 要点 |
|------|------|
| **架构分层** | hooks 位于 Core → **hooks** → components → directives 的中间层；vue-adapter 通过 core 的 injectionKey 与 hooks 解耦 |
| **模块划分** | 四分类（context/overlay/dom/state）+ _internal，按职责而非按组件划分 |
| **依赖关系** | hooks → core + utils + vue(peer)；components/directives/vue → hooks；hooks 不反向依赖任何上层包 |
| **设计模式** | context 类：inject + computed 优先级链；overlay 类：状态机 + 策略组合；dom 类：Observer 封装 + 自动 cleanup；state 类：纯逻辑 composable |
| **潜在陷阱** | setup 阶段访问 DOM、cleanup 遗漏、injectionKey 散落、overlay 状态与 v-model 循环驱动 |
| **最佳实践** | injectionKey 统一在 core 定义；DOM 操作延后到 onMounted；_internal 只放 API 不稳定的 hook；每个 hook 独立 subpath export |
| **学习思考** | Element Plus 全量导出不做区分 → 我们通过 _internal + subpath exports 做了精细化治理；Arco 放组件内部 → 我们独立包支持跨组件复用和 tree-shaking；"hooks 不依赖 vue-adapter"是关键约束——通过 core 的 key 协议实现解耦 |
