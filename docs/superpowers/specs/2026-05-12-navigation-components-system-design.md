# 导航组件体系设计（Menu + Tabs）

## 1. 为什么需要独立设计导航组件

主架构（Section 3.3）将导航组件列为独立类别：Tabs / Menu / Breadcrumb / Pagination。Form 体系（Section 20）和输入组件体系已设计完毕，但导航组件作为企业后台的核心交互骨架，从未有过独立设计。这导致：

1. **公共导航协议缺失**——Menu 和 Tabs 都需要"选中态管理"和"路由集成"，但没有统一抽象
2. **键盘导航模式未抽象**——Menu 和 Tabs 都遵循 WAI-ARIA Roving Focus 模式，但无公共 hook
3. **SubMenu 的三种渲染模式未规划**——vertical 内嵌、collapse 弹出、horizontal 弹出，交互和 DOM 结构完全不同
4. **Tabs 的标签栏-内容区架构难题未解决**——标签栏的内容来自 TabPane 的 props，但 DOM 上是兄弟关系

第一阶段聚焦 Menu + Tabs 两个核心组件。Breadcrumb / Pagination / Steps 相对简单，作为后续设计。

---

## 2. 公共导航协议

Menu 和 Tabs 共享三个核心模式：选中态管理、路由集成、键盘导航。

### 2.1 选中态管理

```ts
// @company/ui-core/src/types/navigation-common.ts

/** 导航组件共享的基础选中态 Props */
export interface NavigationActiveProps {
  /** 当前激活项的标识符（受控模式） */
  active?: string | number
  /** 默认激活项（非受控模式） */
  defaultActive?: string | number
}

/** 导航组件共享的 Emits */
export interface NavigationActiveEmits {
  (e: 'update:active', value: string | number): void
  (e: 'change', value: string | number): void
}
```

设计动机：

> 不用 `modelValue` 而用 `active`——Menu/Tabs 的语义是"哪个被选中"，不是"表单值"。`v-model:active` 比 `v-model:modelValue` 更语义化，Element Plus 和 Arco Design 在这两个组件上也用 `active` / `current` 而非 `modelValue`。

### 2.2 路由集成模式

组件不知道 router 的存在，通过 hook 可选消费：

```ts
// @company/ui-hooks/src/context/use-router-link/use-router-link.ts

import { inject, computed, type Ref } from 'vue'
import { routerLinkInjectionKey } from '@company/ui-core'

export interface UseRouterLinkOptions {
  to?: Ref<string | object | undefined>
  replace?: Ref<boolean>
}

export function useRouterLink(options: UseRouterLinkOptions) {
  const router = inject(routerLinkInjectionKey, undefined)

  const isActive = computed(() => {
    if (!router || !options.to?.value) return false
    const currentRoute = router.currentRoute.value
    const to = options.to.value
    if (typeof to === 'string') {
      return currentRoute.path === to
    }
    return currentRoute.name === to.name
  })

  const navigate = () => {
    if (!router || !options.to?.value) return
    if (options.replace?.value) {
      router.replace(options.to.value)
    } else {
      router.push(options.to.value)
    }
  }

  return { isActive, navigate, router: router ?? null }
}
```

设计决策：

| 决策点 | 选择 | 理由 |
|--------|------|------|
| 路由集成通过 inject 而非直接 import vue-router | 解耦 | 组件不 import vue-router，不在 vue-router 项目中报错 |
| useRouterLink 放 hooks 而非 core | 依赖 Vue 的 provide/inject | core 不能依赖 Vue；hooks 已有 peerDep vue |
| router 对象由 ConfigProvider 或 UiMenu 注入 | 灵活 | Menu 自己 inject router 后 provide 给子组件，不需要 ConfigProvider 强制配置 |
| 不自动同步 active 和 route | 手动绑定 | 自动同步的坑太多（route params 匹配、嵌套路由、query 变化），交给业务代码控制更安全 |

### 2.3 键盘导航模式（Roving Focus）

Menu 和 Tabs 都需要键盘导航，但模式不同：

| 模式 | 适用 | 键位 |
|------|------|------|
| 水平导航 | Tabs（top/bottom）、Menu（horizontal） | ← → 切换 Tab/MenuItem，Enter 激活 |
| 垂直导航 | Tabs（left/right）、Menu（vertical） | ↑ ↓ 切换，Enter 激活，→ 展开子菜单 |
| 菜单导航 | Menu 子菜单 | ↑ ↓ 选项间移动，→ 进入子菜单，← 返回父菜单，Escape 关闭 |

抽取公共 hook：

```ts
// @company/ui-hooks/src/state/use-roving-focus/use-roving-focus.ts

import { ref, type Ref } from 'vue'

export interface UseRovingFocusOptions {
  /** 可聚焦项目列表 */
  items: Ref<Array<{ id: string | number; disabled?: boolean }>>
  /** 当前聚焦项索引 */
  currentIndex: Ref<number>
  /** 方向：horizontal 或 vertical */
  orientation?: Ref<'horizontal' | 'vertical'>
  /** 循环导航 */
  loop?: Ref<boolean>
  /** 聚焦方向（RTL 布局下 horizontal 需反转） */
  dir?: Ref<'ltr' | 'rtl'>
}

export function useRovingFocus(options: UseRovingFocusOptions) {
  const {
    items,
    orientation = ref('horizontal'),
    loop = ref(true),
    dir = ref('ltr'),
  } = options

  function handleKeydown(event: KeyboardEvent) {
    const isHorizontal = orientation.value === 'horizontal'
    const nextKey = isHorizontal ? 'ArrowRight' : 'ArrowDown'
    const prevKey = isHorizontal ? 'ArrowLeft' : 'ArrowUp'

    // RTL: 水平方向反转
    const effectiveNextKey = dir.value === 'rtl' && isHorizontal ? prevKey : nextKey
    const effectivePrevKey = dir.value === 'rtl' && isHorizontal ? nextKey : prevKey

    const enabledItems = items.value.filter(item => !item.disabled)
    if (!enabledItems.length) return

    let newIndex: number | undefined

    switch (event.key) {
      case effectiveNextKey:
        event.preventDefault()
        newIndex = findNextEnabled(options.currentIndex.value, enabledItems, loop.value)
        break
      case effectivePrevKey:
        event.preventDefault()
        newIndex = findPrevEnabled(options.currentIndex.value, enabledItems, loop.value)
        break
      case 'Home':
        event.preventDefault()
        newIndex = enabledItems[0] ? items.value.indexOf(enabledItems[0]) : 0
        break
      case 'End':
        event.preventDefault()
        newIndex = enabledItems[enabledItems.length - 1]
          ? items.value.indexOf(enabledItems[enabledItems.length - 1])
          : items.value.length - 1
        break
    }

    if (newIndex !== undefined) {
      options.currentIndex.value = newIndex
    }
  }

  return { handleKeydown }
}

function findNextEnabled(
  currentIndex: number,
  enabledItems: Array<{ id: string | number; disabled?: boolean }>,
  loop: boolean,
): number | undefined {
  const currentEnabledIndex = enabledItems.findIndex(item => {
    // 简化匹配逻辑
    return true
  })
  // 实现循环/非循环的下一个可用项查找
  return undefined // 实际实现中完整逻辑
}

function findPrevEnabled(
  currentIndex: number,
  enabledItems: Array<{ id: string | number; disabled?: boolean }>,
  loop: boolean,
): number | undefined {
  return undefined // 实际实现中完整逻辑
}
```

设计动机：

> "Roving Focus"（漫游焦点）是 WAI-ARIA 推荐的键盘导航模式——焦点在项目间移动，而非 Tab 键逐个遍历。Menu 和 Tabs 都遵循此模式，但方向和子菜单进入逻辑不同。公共 hook 处理方向和循环，各组件自行扩展子菜单等特殊逻辑。

### 2.4 协议归属

| 协议 | 来源 | Menu 接入 | Tabs 接入 |
|------|------|----------|----------|
| active / defaultActive / change | `@company/ui-core` NavigationActiveProps | `v-model:active` | `v-model:active` |
| useRouterLink | `@company/ui-hooks` context 类 | MenuItem 可选消费 | TabPane 可选消费 |
| useRovingFocus | `@company/ui-hooks` state 类 | Menu 键盘导航 | Tabs 键盘导航 |
| ARIA | 各组件自行实现 | menubar/menu/menuitem | tablist/tab/tabpanel |

---

## 3. Menu 详细设计

### 3.1 为什么 Menu 是导航体系中最复杂的组件

1. **三种布局模式**——horizontal（顶栏菜单）、vertical（侧边栏菜单）、vertical + collapse（折叠侧边栏），三种模式下的子菜单弹出方式完全不同
2. **递归嵌套**——SubMenu 内可以再嵌套 SubMenu，无限层级
3. **折叠态**——侧边栏收起时 MenuItem 只显示图标，SubMenu 变成 Popover 弹出
4. **路由集成**——MenuItem 点击需要可选地触发路由跳转
5. **Group 分组**——MenuItemGroup 纯视觉分组，不影响数据结构
6. **菜单组横向溢出**——horizontal 模式下 MenuItem 过多时的滚动或"更多"收纳

### 3.2 组件清单与分级

| 组件 | 第一阶段 | 核心复杂度 |
|------|---------|-----------|
| Menu | ✅ | 三种布局、active 管理、键盘导航 |
| MenuItem | ✅ | 路由集成、选中态、hover 态 |
| SubMenu | ✅ | 递归嵌套、折叠态弹出、hover/click 触发 |
| MenuItemGroup | ✅ | 纯视觉分组 |
| Menu（横向溢出） | ⬜ 第二阶段 | 溢出检测、"更多"收纳 |

### 3.3 Props

```ts
// packages/components/menu/src/types.ts

import type { PropType } from 'vue'
import type { Router, RouteLocationRaw } from 'vue-router'
import type { ComponentSize } from '@company/ui-core'

export type MenuMode = 'horizontal' | 'vertical'
export type SubMenuTrigger = 'hover' | 'click'

export const menuProps = {
  /** 当前激活菜单项（受控） */
  active: { type: [String, Number] as PropType<string | number> },
  /** 默认激活菜单项（非受控） */
  defaultActive: { type: [String, Number] as PropType<string | number> },
  /** 布局模式 */
  mode: { type: String as PropType<MenuMode>, default: 'vertical' },
  /** 是否折叠（仅 vertical 模式） */
  collapse: { type: Boolean, default: false },
  /** 背景色 */
  backgroundColor: { type: String },
  /** 文字色 */
  textColor: { type: String },
  /** 激活项文字色 */
  activeTextColor: { type: String },
  /** 是否只保持一个子菜单展开 */
  uniqueOpened: { type: Boolean, default: false },
  /** 子菜单触发方式 */
  subMenuTrigger: { type: String as PropType<SubMenuTrigger>, default: 'hover' },
  /** 折叠宽度 */
  collapseWidth: { type: Number, default: 64 },
  /** 展开宽度 */
  expandWidth: { type: Number, default: 220 },
  /** 路由对象（可选，由 UiMenu 自动注入） */
  router: { type: Object as PropType<Router> },
  /** 是否启用 vue-router 集成 */
  routerIntegration: { type: Boolean, default: false },
} as const

export const menuItemProps = {
  /** 唯一标识，对应 Menu 的 active */
  index: { type: [String, Number] as PropType<string | number>, required: true },
  /** 路由跳转目标 */
  to: { type: [String, Object] as PropType<string | RouteLocationRaw> },
  /** 路由跳转是否替换 */
  replace: { type: Boolean, default: false },
  /** 是否禁用 */
  disabled: { type: Boolean, default: false },
} as const

export const subMenuProps = {
  /** 唯一标识 */
  index: { type: [String, Number] as PropType<string | number>, required: true },
  /** 弹出层自定义类名 */
  popperClass: { type: String },
  /** 子菜单弹出偏移 */
  showTimeout: { type: Number, default: 300 },
  hideTimeout: { type: Number, default: 300 },
  /** 是否禁用 */
  disabled: { type: Boolean, default: false },
} as const

export const menuItemGroupProps = {
  /** 分组标题 */
  title: { type: String },
} as const
```

设计决策：

| 决策点 | 选择 | 理由 |
|--------|------|------|
| `active` 而非 `modelValue` | 语义精确 | Menu 是导航选择器，不是表单控件；与公共导航协议一致 |
| `index` 而非 `value` 或 `key` | 与 Element Plus 对齐 | `index` 在菜单语境下比 `value` 更语义化——"菜单项的索引标识" |
| `collapse` 只在 vertical 生效 | 水平菜单无折叠场景 | 顶栏菜单不存在折叠需求 |
| `uniqueOpened` | 手风琴模式 | 企业后台侧边栏高频需求——点击一个子菜单自动收起其他 |
| `router` 作为 prop 而非全局依赖 | 可选消费 | 不安装 vue-router 的项目也能用 Menu；router prop 由 UiMenu 从 inject 获取后 provide 给子组件 |
| `subMenuTrigger` | 默认 hover | vertical 模式下 hover 展开更流畅；click 模式适合移动端 |
| 颜色 props | backgroundColor/textColor/activeTextColor | 侧边栏深色主题场景极高频，直接 props 控制 CSS 变量比强制走 Token 体系更灵活 |

### 3.4 上下文注入机制

Menu 通过 provide/inject 建立树形上下文，SubMenu 嵌套时自动感知层级：

```ts
// packages/components/menu/src/context.ts

import type { Ref } from 'vue'
import type { MenuMode, SubMenuTrigger } from './types'

export interface MenuContext {
  /** 当前激活项 */
  active: Ref<string | number>
  /** 布局模式 */
  mode: Ref<MenuMode>
  /** 是否折叠 */
  collapse: Ref<boolean>
  /** 手风琴模式 */
  uniqueOpened: Ref<boolean>
  /** 子菜单触发方式 */
  subMenuTrigger: Ref<SubMenuTrigger>
  /** 路由实例 */
  router: Ref<any | undefined>
  /** 注册 MenuItem */
  registerItem: (index: string | number) => void
  /** 注销 MenuItem */
  unregisterItem: (index: string | number) => void
  /** 选中菜单项 */
  selectItem: (index: string | number) => void
  /** 打开子菜单 */
  openSubMenu: (index: string | number) => void
  /** 关闭子菜单 */
  closeSubMenu: (index: string | number) => void
  /** 已打开的子菜单列表 */
  openedSubMenus: Ref<Set<string | number>>
}

export const menuInjectionKey: unique symbol = Symbol('menu')

export interface SubMenuContext {
  /** 父级 SubMenu 的 index */
  parentIndex: string | number
  /** 当前层级深度 */
  level: number
  /** 添加嵌套子菜单 */
  addSubSubMenu: (index: string | number) => void
  /** 移除嵌套子菜单 */
  removeSubSubMenu: (index: string | number) => void
}

export const subMenuInjectionKey: unique symbol = Symbol('subMenu')
```

设计动机：

> 与 Select 的选项注册表模式类似——Menu 不遍历 DOM/children 查找子组件，而是子组件主动注册。但 Menu 的上下文比 Select 更复杂：SubMenu 既是 Menu 的子组件，又是更深层 MenuItem/SubMenu 的父上下文。两级注入（menuInjectionKey + subMenuInjectionKey）解决了嵌套感知问题。

### 3.5 核心 composable：useMenu

```ts
// packages/components/menu/src/use-menu.ts

import { ref, reactive, provide, toRef, nextTick } from 'vue'
import { useNamespace, useControllable } from '@company/ui-hooks'
import type { MenuProps } from './types'
import { menuInjectionKey } from './context'

export function useMenu(props: MenuProps, emit: any) {
  const ns = useNamespace('menu')

  // 受控/非受控 active
  const active = useControllable(
    toRef(props, 'active'),
    toRef(props, 'defaultActive'),
    value => emit('update:active', value),
    '',
  )

  const openedSubMenus = ref<Set<string | number>>(new Set())

  const registeredItems = reactive(new Set<string | number>())

  function registerItem(index: string | number) {
    registeredItems.add(index)
  }

  function unregisterItem(index: string | number) {
    registeredItems.delete(index)
  }

  function selectItem(index: string | number) {
    active.value = index
    emit('change', index)

    // 路由集成
    if (props.routerIntegration && props.router) {
      // 路由跳转逻辑由 MenuItem 通过 useRouterLink 处理
    }
  }

  function openSubMenu(index: string | number) {
    if (props.uniqueOpened) {
      openedSubMenus.value.clear()
    }
    openedSubMenus.value.add(index)
  }

  function closeSubMenu(index: string | number) {
    openedSubMenus.value.delete(index)
  }

  // 提供上下文给子组件
  provide(menuInjectionKey, {
    active,
    mode: toRef(props, 'mode'),
    collapse: toRef(props, 'collapse'),
    uniqueOpened: toRef(props, 'uniqueOpened'),
    subMenuTrigger: toRef(props, 'subMenuTrigger'),
    router: toRef(props, 'router'),
    registerItem,
    unregisterItem,
    selectItem,
    openSubMenu,
    closeSubMenu,
    openedSubMenus,
  })

  return {
    active,
    openedSubMenus,
    ns,
  }
}
```

设计决策：

| 决策点 | 选择 | 理由 |
|--------|------|------|
| `useControllable` 封装受控/非受控 | 复用逻辑 | active 的受控/非受控模式与 Tabs 完全相同，抽为公共 hook |
| openedSubMenus 用 Set | 去重 + O(1) 查找 | 多个 SubMenu 同时打开时 Set 性能优于 Array |
| uniqueOpened 时 clear 再 add | 关闭其他再打开 | 手风琴模式只保留当前打开的子菜单 |
| 路由跳转在 selectItem 中 | 而非 MenuItem 自行跳转 | Menu 控制路由行为，MenuItem 不知道路由的存在 |

### 3.6 SubMenu 的三种渲染模式

SubMenu 根据父 Menu 的 mode 和 collapse 状态，呈现三种完全不同的形态：

```
vertical + !collapse → 内嵌展开（子菜单直接在下方展开，高度动画）
vertical + collapse  → Popover 弹出（侧边栏收起时子菜单以浮层形式弹出）
horizontal           → Dropdown 弹出（顶部菜单的子菜单向下弹出）
```

```vue
<!-- packages/components/sub-menu/src/sub-menu.vue -->
<template>
  <!-- 内嵌展开模式 -->
  <li v-if="isInline" :class="[ns.b(), ns.is('active', isActive), ns.is('opened', isOpened)]">
    <div :class="ns.e('title')" @click="handleClick" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
      <slot name="title" />
      <UiIcon :class="[ns.e('arrow'), ns.is('open', isOpened)]" icon="arrow-down" />
    </div>
    <Transition :name="ns.ns + '-menu-collapse'" @after-enter="afterEnter" @after-leave="afterLeave">
      <ul v-show="isOpened" :class="ns.e('children')">
        <slot />
      </ul>
    </Transition>
  </li>

  <!-- 浮层弹出模式（collapse 或 horizontal） -->
  <li v-else :class="[ns.b(), ns.is('active', isActive)]">
    <div
      :class="ns.e('title')"
      ref="triggerRef"
      @click="handleClick"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
      <slot name="title" />
      <UiIcon :class="ns.e('arrow')" icon="arrow-right" />
    </div>
    <Transition name="fade">
      <div
        v-show="isOpened"
        ref="popperRef"
        :class="[ns.e('popper'), popperClass]"
        :style="popperStyle"
      >
        <ul :class="[ns.ns + '-menu', ns.is('sub', true)]">
          <slot />
        </ul>
      </div>
    </Transition>
  </li>
</template>
```

折叠态弹出使用 overlay hooks：

```ts
// SubMenu 弹出模式的核心逻辑
import { usePosition, useClickOutside } from '@company/ui-hooks'

const { position, update: updatePosition } = usePosition({
  anchor: triggerRef,
  floating: popperRef,
  placement: computed(() =>
    menuContext.mode.value === 'horizontal' ? 'bottom-start' : 'right-start'
  ),
})

useClickOutside({
  target: popperRef,
  exclude: triggerRef,
  handler: () => closeSubMenu(props.index),
})
```

设计决策：

| 决策点 | 选择 | 理由 |
|--------|------|------|
| 三种模式同一个组件 | `v-if/v-else` 切换 | SubMenu 的选中态、注册逻辑三种模式共享，拆成三个组件会大量重复 |
| 内嵌模式用 v-show | 需要高度动画 | v-if 会导致 Transition 的 leave 动画无法执行；v-show 隐藏后 DOM 仍在，可以做展开/收起动画 |
| 弹出模式用 usePosition | 复用 overlay hooks | 不为 SubMenu 单独实现定位逻辑；与 Dropdown/Popover 共享同一套定位能力 |
| collapse 弹出方向 right-start | 侧边栏在左侧 | 折叠侧边栏在页面左侧，子菜单向右弹出；如果侧边栏在右侧，placement 可配置 |

### 3.7 内嵌展开动画

内嵌模式的展开/收起需要高度动画，CSS `height: auto` 不能做 Transition：

```ts
// packages/components/menu/src/use-collapse-transition.ts

export function useCollapseTransition() {
  function beforeEnter(el: HTMLElement) {
    el.style.height = '0'
    el.style.overflow = 'hidden'
  }

  function enter(el: HTMLElement) {
    el.style.height = `${el.scrollHeight}px`
  }

  function afterEnter(el: HTMLElement) {
    el.style.height = ''
    el.style.overflow = ''
  }

  function beforeLeave(el: HTMLElement) {
    el.style.height = `${el.scrollHeight}px`
    el.style.overflow = 'hidden'
  }

  function leave(el: HTMLElement) {
    requestAnimationFrame(() => {
      el.style.height = '0'
    })
  }

  function afterLeave(el: HTMLElement) {
    el.style.height = ''
    el.style.overflow = ''
  }

  return { beforeEnter, enter, afterEnter, beforeLeave, leave, afterLeave }
}
```

### 3.8 组件结构

```txt
packages/components/menu/
├─ src/
│  ├─ menu.vue
│  ├─ menu.ts
│  ├─ menu-item.vue
│  ├─ sub-menu.vue
│  ├─ menu-item-group.vue
│  ├─ types.ts
│  ├─ context.ts
│  ├─ use-menu.ts
│  ├─ use-menu-item.ts
│  ├─ use-sub-menu.ts
│  ├─ use-collapse-transition.ts
│  └─ index.ts
├─ style/
├─ __tests__/
├─ docs/
└─ index.ts
```

---

## 4. Tabs 详细设计

### 4.1 Tabs 的核心复杂度

1. **多类型标签页**——line（下划线）、card（卡片）、border-card（边框卡片），视觉和交互差异大
2. **可增删**——TabPane 可动态添加和关闭，关闭时需要确认、切换到相邻标签
3. **位置**——标签栏可上可下可左可右，左右布局时标签栏变为垂直排列
4. **懒加载**——TabPane 内容首次激活时才渲染，避免一次性渲染所有面板
5. **滚动**——标签过多时水平/垂直滚动，带前后箭头
6. **右键菜单**——关闭其他、关闭右侧、刷新当前（企业后台高频需求）

### 4.2 组件清单与分级

| 组件 | 第一阶段 | 核心复杂度 |
|------|---------|-----------|
| Tabs | ✅ | active 管理、标签栏渲染、滚动、键盘导航 |
| TabPane | ✅ | 懒加载、缓存、插槽 |
| TabBar（活动指示器） | ✅ | 下划线滑动动画、位置计算 |
| Tabs（可增删） | ✅ | 关闭按钮、新增按钮、关闭逻辑 |
| Tabs（右键菜单） | ⬜ 第二阶段 | ContextMenu 需要独立设计 |

### 4.3 Props

```ts
// packages/components/tabs/src/types.ts

import type { PropType } from 'vue'

export type TabsType = 'line' | 'card' | 'border-card'
export type TabPosition = 'top' | 'bottom' | 'left' | 'right'

export const tabsProps = {
  /** 当前激活标签（受控） */
  active: { type: [String, Number] as PropType<string | number> },
  /** 默认激活标签（非受控） */
  defaultActive: { type: [String, Number] as PropType<string | number> },
  /** 标签页类型 */
  type: { type: String as PropType<TabsType>, default: 'line' },
  /** 标签位置 */
  position: { type: String as PropType<TabPosition>, default: 'top' },
  /** 是否可关闭 */
  closable: { type: Boolean, default: false },
  /** 是否可新增 */
  addable: { type: Boolean, default: false },
  /** 是否启用编辑模式（= closable + addable） */
  editable: { type: Boolean, default: false },
  /** 切换标签前拦截 */
  beforeLeave: { type: Function as PropType<(newActive: string | number, oldActive: string | number) => boolean | Promise<boolean>> },
  /** 是否懒加载（首次激活才渲染） */
  lazy: { type: Boolean, default: false },
  /** 标签栏拉伸 */
  stretch: { type: Boolean, default: false },
} as const

export const tabPaneProps = {
  /** 唯一标识，对应 Tabs 的 active */
  name: { type: [String, Number] as PropType<string | number>, required: true },
  /** 标签标题 */
  title: { type: String },
  /** 是否禁用 */
  disabled: { type: Boolean, default: false },
  /** 是否可关闭（覆盖 Tabs 的 closable） */
  closable: { type: Boolean },
  /** 是否懒加载（覆盖 Tabs 的 lazy） */
  lazy: { type: Boolean },
  /** 是否缓存（切换后不销毁 DOM） */
  cache: { type: Boolean, default: true },
} as const
```

设计决策：

| 决策点 | 选择 | 理由 |
|--------|------|------|
| `active` 而非 `modelValue` | 与公共导航协议一致 | Tabs 是导航选择器，语义是"哪个标签被选中" |
| `name` 而非 `index` | TabPane 用 name | TabPane 可能动态增删，用 index 会因位置变化导致标识混乱；name 是稳定标识符 |
| `editable` 快捷属性 | = closable + addable | Element Plus 同设计；编辑模式是中后台高频场景 |
| `beforeLeave` 异步拦截 | 支持 Promise | 表单未保存时阻止切换标签，企业后台核心需求 |
| `lazy` + `cache` 分离 | 两个独立维度 | lazy 控制首次渲染时机，cache 控制切换后是否保留 DOM；4 种组合都有场景 |
| `stretch` 拉伸 | 标签等宽 | 顶部导航标签页等宽场景，类似浏览器标签 |
| TabPane 的 `closable` 可覆盖 | 细粒度控制 | 某些标签（如"首页"）不可关闭，其他标签可关闭 |

### 4.4 上下文注入机制

```ts
// packages/components/tabs/src/context.ts

import type { Ref } from 'vue'
import type { TabsType, TabPosition } from './types'

export interface TabPaneState {
  name: string | number
  title: string
  disabled: boolean
  closable: boolean | undefined
  lazy: boolean | undefined
  cache: boolean
  el?: HTMLElement
}

export interface TabsContext {
  /** 当前激活标签 */
  active: Ref<string | number>
  /** 标签页类型 */
  type: Ref<TabsType>
  /** 标签位置 */
  position: Ref<TabPosition>
  /** 是否可关闭 */
  closable: Ref<boolean>
  /** 懒加载全局设置 */
  lazy: Ref<boolean>
  /** 注册 TabPane */
  registerPane: (pane: TabPaneState) => void
  /** 注销 TabPane */
  unregisterPane: (name: string | number) => void
  /** 选中标签 */
  selectTab: (name: string | number) => void
  /** 关闭标签 */
  closeTab: (name: string | number) => void
  /** 已注册的 TabPane 列表 */
  panes: Ref<TabPaneState[]>
}

export const tabsInjectionKey: unique symbol = Symbol('tabs')
```

与 Menu 的注册表模式对比：

| 维度 | Menu | Tabs |
|------|------|------|
| 注册内容 | MenuItem 只注册 index | TabPane 注册完整状态（含 title/disabled/closable） |
| 原因 | MenuItem 的 title 在 slot 中，不需要注册 | Tabs 的标签栏需要从 TabPane 读取 title 渲染 |
| 数据结构 | Set（只关心存在性） | Array（需要有序渲染标签栏） |

设计动机：

> Tabs 面临一个其他组件没有的架构难题——**标签栏的内容来自 TabPane 的 props，但标签栏和 TabPane 内容在 DOM 上是兄弟关系，不是父子关系**。解决方案：TabPane 向上注册自身状态，Tabs 收集所有 pane 状态后渲染标签栏。

### 4.5 核心 composable：useTabs

```ts
// packages/components/tabs/src/use-tabs.ts

import { ref, provide, toRef, nextTick, watch } from 'vue'
import { useNamespace, useControllable } from '@company/ui-hooks'
import type { TabsProps, TabPaneState } from './types'
import { tabsInjectionKey } from './context'

export function useTabs(props: TabsProps, emit: any) {
  const ns = useNamespace('tabs')

  // 受控/非受控 active
  const active = useControllable(
    toRef(props, 'active'),
    toRef(props, 'defaultActive'),
    value => emit('update:active', value),
    '',
  )

  const panes = ref<TabPaneState[]>([])

  function registerPane(pane: TabPaneState) {
    panes.value.push(pane)
    // 按 DOM 顺序排序（TabPane 可能用 v-for 条件渲染）
    nextTick(() => {
      panes.value.sort((a, b) => {
        if (a.el && b.el) return a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
        return 0
      })
    })
  }

  function unregisterPane(name: string | number) {
    const index = panes.value.findIndex(p => p.name === name)
    if (index > -1) panes.value.splice(index, 1)
  }

  async function selectTab(name: string | number) {
    const targetPane = panes.value.find(p => p.name === name)
    if (!targetPane || targetPane.disabled) return
    if (name === active.value) return

    // beforeLeave 拦截
    if (props.beforeLeave) {
      const canLeave = await props.beforeLeave(name, active.value)
      if (canLeave === false) return
    }

    active.value = name
    emit('change', name)
  }

  function closeTab(name: string | number) {
    const index = panes.value.findIndex(p => p.name === name)
    if (index === -1) return

    // 如果关闭的是当前激活标签，自动切换到相邻标签
    if (name === active.value) {
      const nextPane = panes.value[index + 1] ?? panes.value[index - 1]
      if (nextPane) {
        active.value = nextPane.name
        emit('change', nextPane.name)
      }
    }

    emit('close', name)
    // 注意：不在此处 unregisterPane——由 TabPane 的 v-if 控制
    // 业务代码响应 close 事件后移除数据，v-if 变化触发 unregister
  }

  provide(tabsInjectionKey, {
    active,
    type: toRef(props, 'type'),
    position: toRef(props, 'position'),
    closable: toRef(props, 'closable'),
    lazy: toRef(props, 'lazy'),
    registerPane,
    unregisterPane,
    selectTab,
    closeTab,
    panes,
  })

  return { active, panes, ns }
}
```

设计决策：

| 决策点 | 选择 | 理由 |
|--------|------|------|
| closeTab 不直接 unregister | 由 v-if 触发 | 关闭标签是业务行为（删除数据），不是组件行为；组件只 emit close，业务代码响应后移除数据源，v-if 变化自然触发 unregister |
| 自动切换相邻标签 | 关闭当前标签时切换 | Element Plus 同设计；用户体验上关闭当前标签后应自动聚焦到相邻标签，而非清空内容区 |
| DOM 顺序排序 | compareDocumentPosition | TabPane 可能用 v-for 动态渲染，注册顺序不一定等于 DOM 顺序；标签栏必须按 DOM 顺序显示 |
| beforeLeave 支持 Promise | 异步拦截 | "表单未保存"提示需要 await 用户确认 |

### 4.6 TabBar 活动指示器

line 类型的 Tabs 需要 TabBar——一条跟随激活标签滑动的下划线：

```ts
// packages/components/tabs/src/use-tab-bar.ts

import { ref, watch, nextTick, type Ref } from 'vue'
import { useResizeObserver } from '@company/ui-hooks'
import type { TabPaneState, TabPosition } from './types'

export function useTabBar(
  navRef: Ref<HTMLElement | undefined>,
  panes: Ref<TabPaneState[]>,
  active: Ref<string | number>,
  position: Ref<TabPosition>,
) {
  const barStyle = ref<Record<string, string>>({})

  function update() {
    const navEl = navRef.value
    if (!navEl) return

    const activePane = panes.value.find(p => p.name === active.value)
    if (!activePane?.el) return

    // 找到标签栏中对应的 tab DOM 元素
    const tabEl = navEl.querySelector(`[data-tab-name="${activePane.name}"]`) as HTMLElement
    if (!tabEl) return

    const isHorizontal = position.value === 'top' || position.value === 'bottom'

    if (isHorizontal) {
      barStyle.value = {
        width: `${tabEl.offsetWidth}px`,
        transform: `translateX(${tabEl.offsetLeft}px)`,
      }
    } else {
      barStyle.value = {
        height: `${tabEl.offsetHeight}px`,
        transform: `translateY(${tabEl.offsetTop}px)`,
      }
    }
  }

  // active 变化时更新位置
  watch(active, () => nextTick(update))
  // panes 变化时更新位置（增删标签）
  watch(panes, () => nextTick(update), { deep: true })

  // 使用 ResizeObserver 监听容器变化
  useResizeObserver({
    target: navRef,
    callback: () => update(),
  })

  return { barStyle, update }
}
```

TabBar 的 CSS：

```scss
@include b(tab-bar) {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  background-color: var(--ui-tabs-active-color, var(--ui-color-primary));
  transition: transform var(--ui-transition-duration) cubic-bezier(0.645, 0.045, 0.355, 1),
              width var(--ui-transition-duration) cubic-bezier(0.645, 0.045, 0.355, 1);

  // 左右位置时 TabBar 变为竖线
  @include when(vertical) {
    bottom: auto;
    right: 0;
    width: 2px;
    height: auto;
  }
}
```

设计决策：

| 决策点 | 选择 | 理由 |
|--------|------|------|
| transform 而非 left/top | GPU 加速 | `transform` 触发合成层动画，不触发重排；`left/top` 触发重排 |
| cubic-bezier 缓动 | Material Design 风格 | 标签滑动用 `0.645, 0.045, 0.355, 1` 缓动，比 linear 更自然 |
| ResizeObserver 监听 | 容器变化时自动更新 | 窗口 resize、侧边栏折叠等场景都会改变标签栏宽度 |
| 绝对定位 | 不占文档流 | TabBar 是视觉指示器，不应影响标签的布局计算 |

### 4.7 标签栏滚动

标签过多时需要滚动，带左右箭头：

```ts
// packages/components/tabs/src/use-tab-scroll.ts

import { ref, type Ref } from 'vue'
import { useResizeObserver } from '@company/ui-hooks'

export function useTabScroll(navScrollRef: Ref<HTMLElement | undefined>) {
  const scrollable = ref(false)
  const scrollOffset = ref(0)

  function updateScrollable() {
    const el = navScrollRef.value
    if (!el) return
    scrollable.value = el.offsetWidth < el.scrollWidth
  }

  function scrollPrev() {
    const el = navScrollRef.value
    if (!el) return
    scrollOffset.value = Math.max(0, scrollOffset.value - el.offsetWidth)
  }

  function scrollNext() {
    const el = navScrollRef.value
    if (!el) return
    const maxOffset = el.scrollWidth - el.offsetWidth
    scrollOffset.value = Math.min(maxOffset, scrollOffset.value + el.offsetWidth)
  }

  // 激活标签自动滚动到可视区域
  function scrollToActive(tabEl: HTMLElement) {
    const el = navScrollRef.value
    if (!el) return
    const tabLeft = tabEl.offsetLeft
    const tabRight = tabLeft + tabEl.offsetWidth
    const viewLeft = scrollOffset.value
    const viewRight = viewLeft + el.offsetWidth

    if (tabLeft < viewLeft) {
      scrollOffset.value = tabLeft
    } else if (tabRight > viewRight) {
      scrollOffset.value = tabRight - el.offsetWidth
    }
  }

  useResizeObserver({
    target: navScrollRef,
    callback: updateScrollable,
  })

  return { scrollable, scrollOffset, scrollPrev, scrollNext, scrollToActive }
}
```

### 4.8 TabPane 懒加载与缓存

```vue
<!-- packages/components/tabs/src/tab-pane.vue -->
<template>
  <div
    v-if="shouldRender"
    v-show="isActive"
    :class="[ns.b(), ns.is('active', isActive)]"
    role="tabpanel"
    :aria-labelledby="`tab-${name}`"
    :id="`panel-${name}`"
  >
    <slot />
  </div>
</template>
```

```ts
// tab-pane.vue setup
const tabsContext = inject(tabsInjectionKey)!

const isActive = computed(() => tabsContext.active.value === props.name)

// 懒加载：首次激活时才渲染
const hasBeenActive = ref(false)
watch(isActive, (val) => {
  if (val) hasBeenActive.value = true
}, { immediate: true })

const isLazy = computed(() => props.lazy ?? tabsContext.lazy?.value ?? false)

const shouldRender = computed(() => {
  if (!isLazy.value) return true
  if (isActive.value) return true
  if (hasBeenActive.value && props.cache) return true // 缓存：切走后保留 DOM
  return false
})
```

懒加载 × 缓存的 4 种组合：

| lazy | cache | 行为 |
|------|-------|------|
| false | true | 始终渲染，切走后保留 DOM（默认） |
| false | false | 始终渲染，切走后销毁 DOM |
| true | true | 首次激活才渲染，切走后保留 DOM |
| true | false | 首次激活才渲染，切走后销毁 DOM |

设计决策：

| 决策点 | 选择 | 理由 |
|--------|------|------|
| `v-if` + `v-show` 分离 | v-if 控制挂载，v-show 控制可见 | v-if 决定 DOM 存在（懒加载/销毁），v-show 决定显示隐藏（缓存但不可见）；两者职责不同 |
| hasBeenActive 标记 | 懒加载的面板一旦激活过就记住 | cache=true 时需要知道"这个面板曾经激活过"来决定是否保留 DOM |
| 默认 cache=true | 切换后保留 DOM | 企业后台表单页面切换标签后回来，表单数据不能丢失 |

### 4.9 组件结构

```txt
packages/components/tabs/
├─ src/
│  ├─ tabs.vue
│  ├─ tabs.ts
│  ├─ tab-pane.vue
│  ├─ tab-bar.vue
│  ├─ tab-nav.vue
│  ├─ types.ts
│  ├─ context.ts
│  ├─ use-tabs.ts
│  ├─ use-tab-bar.ts
│  ├─ use-tab-scroll.ts
│  └─ index.ts
├─ style/
├─ __tests__/
├─ docs/
└─ index.ts
```

`tab-nav.vue` 是标签栏的独立子组件，负责渲染标签项、滚动箭头、新增按钮，从 Tabs 接收 panes 数据。拆分出来是因为标签栏逻辑（滚动、TabBar 定位、箭头）足够复杂，与 Tabs 的 active 管理/TabPane 注册是不同关注点。

---

## 5. 样式设计与 Component Token

### 5.1 Menu 样式

```scss
@use '@company/ui-theme/src/mixins' as *;

@include b(menu) {
  display: flex;
  box-sizing: border-box;
  margin: 0;
  padding-left: 0;
  list-style: none;
  background-color: var(--ui-menu-bg-color, var(--ui-color-white));
  transition: width var(--ui-transition-duration);

  // vertical 模式：纵向排列
  @include when(vertical) {
    flex-direction: column;
    border-right: 1px solid var(--ui-menu-border-color, var(--ui-color-border-light));
    width: var(--ui-menu-expand-width, 220px);

    &.is-collapse {
      width: var(--ui-menu-collapse-width, 64px);
    }
  }

  // horizontal 模式：横向排列
  @include when(horizontal) {
    border-bottom: 1px solid var(--ui-menu-border-color, var(--ui-color-border-light));
  }

  @include e(item) {
    display: flex;
    align-items: center;
    height: var(--ui-menu-item-height, 56px);
    padding: 0 20px;
    cursor: pointer;
    transition: border-color var(--ui-transition-duration),
                background-color var(--ui-transition-duration),
                color var(--ui-transition-duration);
    color: var(--ui-menu-text-color, var(--ui-color-text-primary));
    white-space: nowrap;

    &:hover {
      background-color: var(--ui-menu-hover-bg-color, var(--ui-color-fill-light));
    }

    @include when(active) {
      color: var(--ui-menu-active-color, var(--ui-color-primary));
    }

    @include when(disabled) {
      opacity: 1;
      cursor: not-allowed;
      color: var(--ui-color-text-disabled);
    }
  }

  @include e(title) {
    display: flex;
    align-items: center;
    height: var(--ui-menu-item-height, 56px);
    padding: 0 20px;
    cursor: pointer;
    color: var(--ui-menu-text-color, var(--ui-color-text-primary));

    &:hover {
      background-color: var(--ui-menu-hover-bg-color, var(--ui-color-fill-light));
    }
  }

  @include e(icon) {
    margin-right: 8px;
    width: var(--ui-menu-icon-size, 18px);
    height: var(--ui-menu-icon-size, 18px);
    font-size: var(--ui-menu-icon-size, 18px);
  }

  @include e(arrow) {
    margin-left: auto;
    transition: transform var(--ui-transition-duration);

    &.is-open {
      transform: rotate(180deg);
    }
  }
}
```

深色侧边栏场景——通过颜色 props 注入 CSS 变量：

```ts
// menu.vue setup
const style = computed(() => {
  const styles: Record<string, string> = {}
  if (props.backgroundColor) styles['--ui-menu-bg-color'] = props.backgroundColor
  if (props.textColor) styles['--ui-menu-text-color'] = props.textColor
  if (props.activeTextColor) styles['--ui-menu-active-color'] = props.activeTextColor
  return styles
})
```

设计动机：

> 企业后台侧边栏深色主题是极其高频的场景。如果强制走 Token 体系，用户需要定义一套完整的 dark theme；而实际上只需要"这个 Menu 背景深色、文字白色"这种局部覆盖。`backgroundColor/textColor/activeTextColor` 三个 props 直接映射 CSS 变量，是最轻量的定制路径。

### 5.2 Menu Component Token

```ts
{
  'menu-bg-color': { value: '{color.white}' },
  'menu-text-color': { value: '{color.text.primary}' },
  'menu-active-color': { value: '{color.primary}' },
  'menu-hover-bg-color': { value: '{color.fill.light}' },
  'menu-item-height': { value: '56px' },
  'menu-icon-size': { value: '18px' },
  'menu-border-color': { value: '{color.border.light}' },
  'menu-collapse-width': { value: '64px' },
  'menu-expand-width': { value: '220px' },
  'menu-submenu-bg-color': { value: '{color.white}' },
  'menu-submenu-hover-bg-color': { value: '{color.fill.light}' },
  'menu-group-title-color': { value: '{color.text.secondary}' },
  'menu-group-title-font-size': { value: '12px' },
}
```

### 5.3 Tabs 样式

```scss
@include b(tabs) {
  display: flex;
  flex-direction: column;

  // left / right 位置时横向排列
  @include when(left)  { flex-direction: row; }
  @include when(right) { flex-direction: row-reverse; }

  @include e(header) {
    display: flex;
    align-items: center;
    position: relative;
  }

  @include e(nav-wrap) {
    overflow: hidden;
    flex: 1;
    position: relative;
  }

  @include e(nav-scroll) {
    overflow: hidden;
    transition: transform var(--ui-transition-duration);
  }

  @include e(nav) {
    display: flex;
    position: relative;
    white-space: nowrap;
    list-style: none;
    padding: 0;
    margin: 0;

    &.is-vertical {
      flex-direction: column;
    }
  }

  @include e(item) {
    display: flex;
    align-items: center;
    height: var(--ui-tabs-item-height, 40px);
    padding: 0 var(--ui-tabs-item-padding, 20px);
    font-size: var(--ui-tabs-item-font-size, 14px);
    font-weight: 500;
    color: var(--ui-tabs-text-color, var(--ui-color-text-regular));
    cursor: pointer;
    transition: color var(--ui-transition-duration);
    box-sizing: border-box;

    &:hover {
      color: var(--ui-tabs-hover-color, var(--ui-color-text-primary));
    }

    @include when(active) {
      color: var(--ui-tabs-active-color, var(--ui-color-primary));
    }

    @include when(disabled) {
      color: var(--ui-color-text-disabled);
      cursor: not-allowed;
    }

    // line 类型：底部 padding 为 TabBar 留空间
    .ui-tabs--line & {
      padding-bottom: calc(var(--ui-tabs-item-height, 40px) / 2 - 7px);
    }

    // card 类型
    .ui-tabs--card & {
      border: 1px solid var(--ui-color-border-light);
      border-bottom: none;
      border-radius: var(--ui-border-radius-base) var(--ui-border-radius-base) 0 0;
      background-color: var(--ui-tabs-card-bg-color, var(--ui-color-fill-lighter));

      &.is-active {
        background-color: var(--ui-color-white);
        border-bottom-color: var(--ui-color-white);
      }
    }

    // border-card 类型
    .ui-tabs--border-card & {
      border: 1px solid transparent;
      margin: -1px -1px 0;

      &.is-active {
        background-color: var(--ui-color-white);
        border-color: var(--ui-color-border-light);
        border-bottom-color: var(--ui-color-white);
      }
    }
  }

  // 关闭按钮
  @include e(close) {
    margin-left: 4px;
    width: 16px;
    height: 16px;
    font-size: 12px;
    border-radius: 50%;
    transition: all var(--ui-transition-duration);

    &:hover {
      background-color: var(--ui-color-text-placeholder);
      color: var(--ui-color-white);
    }
  }

  // 新增按钮
  @include e(new-tab) {
    margin-left: 10px;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border: 1px solid var(--ui-color-border);
    border-radius: 3px;
    transition: all var(--ui-transition-duration);

    &:hover {
      color: var(--ui-color-primary);
    }
  }

  @include e(content) {
    padding: var(--ui-tabs-content-padding, 16px 0);
  }
}
```

### 5.4 Tabs Component Token

```ts
{
  'tabs-item-height': { value: '40px' },
  'tabs-item-padding': { value: '20px' },
  'tabs-item-font-size': { value: '14px' },
  'tabs-text-color': { value: '{color.text.regular}' },
  'tabs-hover-color': { value: '{color.text.primary}' },
  'tabs-active-color': { value: '{color.primary}' },
  'tabs-bar-height': { value: '2px' },
  'tabs-bar-color': { value: '{color.primary}' },
  'tabs-content-padding': { value: '16px 0' },
  'tabs-card-bg-color': { value: '{color.fill.lighter}' },
  'tabs-border-card-bg-color': { value: '{color.fill.lighter}' },
  'tabs-close-hover-bg': { value: '{color.text.placeholder}' },
}
```

---

## 6. ARIA 无障碍属性规格

| 组件 | 角色 | aria-* 属性 | 说明 |
|------|------|-------------|------|
| Menu（horizontal） | `menubar` | — | 顶栏菜单是菜单栏 |
| Menu（vertical） | `menu` | — | 侧边栏菜单是独立菜单 |
| SubMenu | `menu`（子菜单部分） | `aria-expanded`（展开状态） | 子菜单自身是嵌套 menu |
| MenuItem | `menuitem` | `aria-disabled`（禁用时） | 标准菜单项角色 |
| MenuItemGroup | `group` | `aria-labelledby`（指向 group title） | 分组容器 |
| Tabs nav | `tablist` | `aria-orientation`（horizontal/vertical） | 标签列表 |
| Tab item | `tab` | `aria-selected`、`aria-controls`（指向 panel）、`aria-disabled` | 标签项 |
| TabPane | `tabpanel` | `aria-labelledby`（指向 tab） | 内容面板 |

关键关联：

```html
<!-- Tabs 的 ARIA 关联 -->
<div role="tablist" aria-orientation="horizontal">
  <div role="tab" id="tab-home" aria-selected="true" aria-controls="panel-home" tabindex="0">首页</div>
  <div role="tab" id="tab-settings" aria-selected="false" aria-controls="panel-settings" tabindex="-1">设置</div>
</div>
<div role="tabpanel" id="panel-home" aria-labelledby="tab-home">首页内容</div>
<div role="tabpanel" id="panel-settings" aria-labelledby="tab-settings" hidden>设置内容</div>
```

```html
<!-- Menu 的 ARIA 关联 -->
<ul role="menubar">
  <li role="none">
    <div role="menuitem" aria-expanded="false" aria-haspopup="true">文件</div>
    <ul role="menu">
      <li role="none"><div role="menuitem">新建</div></li>
      <li role="none"><div role="menuitem" aria-disabled="true">保存</div></li>
    </ul>
  </li>
</ul>
```

键盘交互规格：

| 组件 | 键位 | 行为 |
|------|------|------|
| Tabs | ← → | 水平切换 Tab |
| Tabs | ↑ ↓ | 垂直位置时切换 Tab |
| Tabs | Home / End | 跳到首个/末个 Tab |
| Tabs | Tab | 焦点从 Tab 移入 TabPanel |
| Menu | ↑ ↓ | vertical 模式在 MenuItem 间移动 |
| Menu | ← → | horizontal 模式在顶级 MenuItem 间移动 |
| Menu | → / Enter | 打开 SubMenu |
| Menu | ← / Escape | 关闭 SubMenu，焦点回到父 MenuItem |
| Menu | Home / End | 跳到首个/末个 MenuItem |

---

## 7. 依赖约束

### 7.1 导航组件的依赖关系

```
Menu / Tabs
  ├── @company/ui-core          (NavigationActiveProps、Placement、ComponentSize)
  ├── @company/ui-hooks         (useNamespace、useRovingFocus、useRouterLink、useControllable、usePosition、useClickOutside、useResizeObserver)
  ├── @company/ui-icons         (图标：箭头、关闭）
  ├── @company/ui-theme         (CSS Variables、Component Token)
  └── @company/ui-utils         (DOM 工具)

Menu 额外依赖:
  └── overlay hooks             (usePosition、useClickOutside——SubMenu 弹出模式)
```

### 7.2 禁止的依赖

| 规则 | 违规示例 | 正确做法 |
|------|---------|---------|
| 导航组件不依赖 Form | `import { UiForm } from '@company/ui-components/form'` | 导航组件与表单协议无关 |
| 导航组件不依赖 Input/Select | `import UiSelect from '../select'` | 无关联 |
| Menu 不依赖 Tabs | `import { UiTabs } from '../tabs'` | 共享逻辑抽到 hooks 或 core |
| Tabs 不依赖 Menu | `import { UiMenu } from '../menu'` | 共享逻辑抽到 hooks 或 core |
| 导航组件不直接 import vue-router | `import { useRouter } from 'vue-router'` | 通过 useRouterLink hook 可选消费 |
| 导航组件不依赖 Overlay 组件 | `import UiPopover from '../popover'` | 复用 overlay hooks，不依赖具体组件实现 |

### 7.3 injectionKey 归属

| Key | 定义位置 | 使用者 |
|-----|---------|--------|
| `menuInjectionKey` | 组件内部（menu/context.ts） | Menu ↔ MenuItem / SubMenu |
| `subMenuInjectionKey` | 组件内部（menu/context.ts） | SubMenu ↔ 嵌套 SubMenu |
| `tabsInjectionKey` | 组件内部（tabs/context.ts） | Tabs ↔ TabPane |
| `routerLinkInjectionKey` | `@company/ui-core` | useRouterLink hook + ConfigProvider |

设计动机：

> Menu 和 Tabs 的 injectionKey 留在组件内部——它们只在组件树内部使用，不像 formInjectionKey 需要 hooks 层跨包访问。routerLinkInjectionKey 放 core 是因为它需要 hooks 和 vue-adapter 共享。

---

## 8. 新增 hooks 归属

公共导航协议引入了 3 个新 hook：

| Hook | 分类 | 理由 |
|------|------|------|
| `useControllable` | state | 纯逻辑 composable，不依赖 DOM；管理受控/非受控值，Menu 和 Tabs 都用 |
| `useRovingFocus` | state | 纯逻辑 composable，不依赖 DOM；漫游焦点键盘导航 |
| `useRouterLink` | context | 从 ConfigProvider inject 读取 router 实例；与 useLocale/useSize 同模式 |

hooks 包目录变更：

```txt
packages/hooks/src/
├─ context/
│  ├─ ...（已有）
│  ├─ use-router-link/        ← 新增
│  │  ├─ use-router-link.ts
│  │  └─ index.ts
│  └─ index.ts
├─ state/
│  ├─ ...（已有）
│  ├─ use-controllable/       ← 新增
│  │  ├─ use-controllable.ts
│  │  └─ index.ts
│  ├─ use-roving-focus/       ← 新增
│  │  ├─ use-roving-focus.ts
│  │  └─ index.ts
│  └─ index.ts
```

hooks 数量变化：18 → 21（context 6 + overlay 8 + dom 3 + state 4）

同时在 `@company/ui-core` 中新增：

```ts
// @company/ui-core/src/types/navigation-common.ts  ← 新文件
// NavigationActiveProps / NavigationActiveEmits

// @company/ui-core/src/context/keys.ts  ← 新增 key
export const routerLinkInjectionKey: unique symbol = Symbol('routerLink')
```

---

## 9. 第一阶段落地步骤

```
Step 1: 在 @company/ui-core 中定义公共协议
  - NavigationActiveProps / NavigationActiveEmits 类型
  - routerLinkInjectionKey

Step 2: 在 @company/ui-hooks 中实现新增 hooks
  - useControllable（state 类）
  - useRovingFocus（state 类）
  - useRouterLink（context 类）
  - 每个配单元测试

Step 3: 实现 Menu 核心
  - Menu + MenuItem + SubMenu + MenuItemGroup
  - context 注入机制
  - 受控/非受控 active（useControllable）
  - 三种渲染模式（vertical 内嵌 / collapse 弹出 / horizontal 弹出）
  - 手风琴模式（uniqueOpened）
  - SubMenu 展开/收起动画（useCollapseTransition）
  - 键盘导航（useRovingFocus）
  - 样式 + Component Token
  - 单元测试

Step 4: 实现 Tabs 核心
  - Tabs + TabPane + TabNav + TabBar
  - TabPane 注册表机制
  - TabBar 滑动指示器
  - 三种类型（line / card / border-card）
  - 四种位置（top / bottom / left / right）
  - 标签栏滚动
  - 可增删（closable / addable / editable）
  - beforeLeave 异步拦截
  - 懒加载 × 缓存
  - 键盘导航（useRovingFocus）
  - 样式 + Component Token
  - 单元测试

Step 5: 路由集成验证
  - useRouterLink 在 MenuItem 中工作
  - ConfigProvider 注入 router 实例
  - 非 vue-router 项目中 Menu 正常工作

Step 6: ARIA 与键盘交互验证
  - Menu 的 menubar/menu/menuitem 角色
  - Tabs 的 tablist/tab/tabpanel 关联
  - 键盘导航全流程
```

---

## 10. 第一阶段验收标准

| 维度 | 标准 |
|------|------|
| 组件完整性 | Menu + MenuItem + SubMenu + MenuItemGroup + Tabs + TabPane 共 6 个组件 |
| 公共协议 | NavigationActiveProps/Emits 在 core 中定义，Menu 和 Tabs 全部实现 |
| 受控/非受控 | 两个组件都支持 v-model:active 和 defaultActive |
| 新增 hooks | useControllable、useRovingFocus、useRouterLink 3 个 hook 实现 + 测试 |
| Menu 三种模式 | vertical 内嵌展开、collapse 弹出、horizontal 弹出均正确渲染和交互 |
| Menu 手风琴 | uniqueOpened 下同时只展开一个 SubMenu |
| Tabs 三种类型 | line / card / border-card 视觉和交互正确 |
| Tabs 四种位置 | top / bottom / left / right 布局正确 |
| Tabs 增删 | closable / addable / editable 正常工作，关闭当前标签自动切换相邻 |
| Tabs beforeLeave | 异步拦截生效，返回 false 阻止切换 |
| Tabs 懒加载 | lazy=true 的 TabPane 首次激活才渲染；cache=true 切走后保留 DOM |
| 标签栏滚动 | 标签过多时显示箭头，滚动流畅，激活标签自动滚动到可视区 |
| TabBar | line 类型活动指示器位置正确，切换时滑动动画流畅 |
| 路由集成 | MenuItem to prop 可选触发路由跳转；不安装 vue-router 不报错 |
| ARIA | Menu: menubar/menu/menuitem；Tabs: tablist/tab/tabpanel 关联正确 |
| 键盘 | Menu: 方向键导航 + 子菜单展开/收起；Tabs: 方向键切换 + Home/End |
| 样式 | 每个组件有 Component Token，深色侧边栏通过颜色 props 覆盖 |
| 测试 | 每个组件至少覆盖：基础渲染、active 受控/非受控、键盘导航、路由集成 |

---

## 11. 常见设计陷阱

| 陷阱 | 描述 | 规避 |
|------|------|------|
| **Menu 直接 import vue-router** | 组件内 `import { useRouter } from 'vue-router'` | 通过 useRouterLink hook + inject 可选消费 |
| **SubMenu 遍历 children 查找** | 动态/条件渲染的子菜单可能漏掉 | 上下文注入模式，子组件主动注册 |
| **Tabs 标签栏读不到 TabPane 的 title** | TabPane 是 slot 内容，Tabs 无法直接访问 | TabPane 向上注册状态，Tabs 收集 panes 后渲染标签栏 |
| **TabBar 用 left/top 定位** | 触发重排，动画卡顿 | 用 transform: translateX/Y，GPU 合成层动画 |
| **关闭 TabPane 直接操作 DOM** | 组件内 removeChild 或 v-if 强制移除 | 只 emit close，业务响应后改变数据源，v-if 自然触发 |
| **collapse 动画用 height: auto** | CSS 不能 Transition height: auto | 用 JS 计算 scrollHeight，beforeEnter/enter/leave 钩子设置精确值 |
| **Tabs 切换销毁表单** | 用户填了一半的表单因 Tab 切换被销毁 | 默认 cache=true，v-show 隐藏而非 v-if 销毁 |
| **Menu active 用 modelValue** | 语义不匹配——Menu 不是表单控件 | 用 active，与 NavigationActiveProps 协议一致 |
| **SubMenu 弹出不用 overlay hooks** | 自行实现定位和 clickOutside | 复用 usePosition + useClickOutside，与 Dropdown/Popover 共享逻辑 |
| **panes 不按 DOM 顺序排序** | 注册顺序 ≠ 渲染顺序，标签栏显示错乱 | compareDocumentPosition 排序确保标签栏顺序与 DOM 一致 |

---

## 12. 七维度总结

| 维度 | 要点 |
|------|------|
| **架构分层** | 导航组件位于 components 层，通过 hooks（useControllable/useRovingFocus/useRouterLink）与 Core 解耦；通过 context 注入与子组件通信；SubMenu 弹出模式复用 overlay hooks |
| **模块划分** | Menu 4 个子组件（Menu/MenuItem/SubMenu/MenuItemGroup）+ Tabs 4 个子组件（Tabs/TabPane/TabNav/TabBar）+ 3 个新增 hooks；公共导航协议在 Core 层 |
| **依赖关系** | 导航组件 → hooks + core + icons + theme + utils；Menu 额外依赖 overlay hooks；导航组件之间互不依赖；导航组件不依赖 Form/Input/Select；不直接依赖 vue-router |
| **设计模式** | 受控/非受控模式（useControllable）、上下文注入模式（menuInjectionKey/tabsInjectionKey）、注册表模式（TabPane 注册完整状态）、漫游焦点模式（useRovingFocus）、路由解耦模式（useRouterLink）、懒加载×缓存分离模式（v-if + v-show） |
| **潜在陷阱** | vue-router 强耦合、TabBar 重排、TabPane 标题获取、collapse 动画 height:auto、表单数据因标签切换丢失 |
| **最佳实践** | 公共协议在 core 定义；路由通过 hook 可选消费；TabBar 用 transform 不用 left/top；关闭标签只 emit 不操作 DOM；SubMenu 复用 overlay hooks 不自己实现定位 |
| **学习思考** | Element Plus 的 Menu 和 Tabs 各自独立设计，没有抽取公共导航协议 → 我们通过 NavigationActiveProps + useControllable + useRovingFocus 做了跨组件抽象；"TabPane 注册状态给 Tabs 渲染标签栏"是典型的"数据上行"模式——子组件不只是被渲染，还向上提供数据；Menu 的三种渲染模式证明：同一组件的不同视觉形态应该用条件渲染而非拆分组件，共享逻辑的复用价值远大于视觉差异的隔离价值 |
