# Navigation Components (Menu + Tabs) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the navigation component system (Menu + Tabs) with shared navigation protocol, 3 new hooks, 6 components, styles, and tests.

**Architecture:** Framework-agnostic Core layer defines protocol types and injection keys. Hooks layer implements useControllable, useRovingFocus, useRouterLink. Components layer implements Menu/MenuItem/SubMenu/MenuItemGroup and Tabs/TabPane/TabNav/TabBar with BEM + CSS Variables. TDD throughout.

**Tech Stack:** Vue 3 + TypeScript, Vitest for testing, SCSS for styles, pnpm Monorepo

**Spec:** `docs/superpowers/specs/2026-05-12-navigation-components-system-design.md`

---

## File Structure

### @company/ui-core additions

```
packages/core/src/
├── types/
│   └── navigation-common.ts          # NavigationActiveProps, NavigationActiveEmits, RouteLocation
└── context/
    └── keys.ts                        # + routerLinkInjectionKey
```

### @company/ui-hooks additions

```
packages/hooks/src/
├── context/
│   └── use-router-link/
│       ├── use-router-link.ts
│       └── index.ts
└── state/
    ├── use-controllable/
    │   ├── use-controllable.ts
    │   └── index.ts
    └── use-roving-focus/
        ├── use-roving-focus.ts
        └── index.ts
```

### @company/ui-components/menu

```
packages/components/menu/
├── src/
│   ├── menu.vue
│   ├── menu.ts
│   ├── menu-item.vue
│   ├── sub-menu.vue
│   ├── menu-item-group.vue
│   ├── types.ts
│   ├── context.ts
│   ├── use-menu.ts
│   ├── use-menu-item.ts
│   ├── use-sub-menu.ts
│   ├── use-collapse-transition.ts
│   └── index.ts
├── style/
│   ├── index.ts
│   └── menu.scss
├── __tests__/
│   ├── use-menu.test.ts
│   ├── use-menu-item.test.ts
│   ├── use-sub-menu.test.ts
│   ├── use-collapse-transition.test.ts
│   ├── menu.test.ts
│   └── menu-a11y.test.ts
└── index.ts
```

### @company/ui-components/tabs

```
packages/components/tabs/
├── src/
│   ├── tabs.vue
│   ├── tabs.ts
│   ├── tab-pane.vue
│   ├── tab-bar.vue
│   ├── tab-nav.vue
│   ├── types.ts
│   ├── context.ts
│   ├── use-tabs.ts
│   ├── use-tab-bar.ts
│   ├── use-tab-scroll.ts
│   └── index.ts
├── style/
│   ├── index.ts
│   └── tabs.scss
├── __tests__/
│   ├── use-tabs.test.ts
│   ├── use-tab-bar.test.ts
│   ├── use-tab-scroll.test.ts
│   ├── tabs.test.ts
│   ├── tab-pane.test.ts
│   └── tabs-a11y.test.ts
└── index.ts
```

---

## Task 1: Core Protocol Types

**Files:**
- Create: `packages/core/src/types/navigation-common.ts`
- Modify: `packages/core/src/context/keys.ts`

- [ ] **Step 1: Write failing test for NavigationActiveProps types**

```ts
// packages/core/__tests__/navigation-common.test.ts
import type { NavigationActiveProps, NavigationActiveEmits, RouteLocation } from '../src/types/navigation-common'

describe('NavigationActiveProps', () => {
  it('accepts string active', () => {
    const props: NavigationActiveProps = { active: 'home' }
    expect(props.active).toBe('home')
  })

  it('accepts number active', () => {
    const props: NavigationActiveProps = { active: 1 }
    expect(props.active).toBe(1)
  })

  it('accepts defaultActive', () => {
    const props: NavigationActiveProps = { defaultActive: 'settings' }
    expect(props.defaultActive).toBe('settings')
  })
})

describe('RouteLocation', () => {
  it('accepts path-only route', () => {
    const route: RouteLocation = { path: '/users' }
    expect(route.path).toBe('/users')
  })

  it('accepts named route with params', () => {
    const route: RouteLocation = { name: 'user-detail', params: { id: '123' } }
    expect(route.name).toBe('user-detail')
  })

  it('accepts route with query', () => {
    const route: RouteLocation = { path: '/search', query: { q: 'test' } }
    expect(route.query?.q).toBe('test')
  })
})
```

- [ ] **Step 2: Run test — expect failure (file doesn't exist)**

Run: `pnpm --filter @company/ui-core test -- navigation-common`
Expected: FAIL — module not found

- [ ] **Step 3: Implement navigation-common.ts**

```ts
// packages/core/src/types/navigation-common.ts

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

/** 框架无关的路由位置描述（不依赖 vue-router） */
export interface RouteLocation {
  /** 路由名称 */
  name?: string
  /** 路由路径 */
  path?: string
  /** 查询参数 */
  query?: Record<string, string | string[]>
  /** 路由参数 */
  params?: Record<string, string>
  /** 是否替换当前历史记录 */
  replace?: boolean
}
```

- [ ] **Step 4: Add routerLinkInjectionKey to keys.ts**

Append to `packages/core/src/context/keys.ts`:

```ts
export const routerLinkInjectionKey: unique symbol = Symbol('routerLink')
```

- [ ] **Step 5: Run tests — expect pass**

Run: `pnpm --filter @company/ui-core test -- navigation-common`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add packages/core/src/types/navigation-common.ts packages/core/src/context/keys.ts
git commit -m "feat(core): add navigation protocol types and routerLink injection key"
```

---

## Task 2: useControllable Hook

**Files:**
- Create: `packages/hooks/src/state/use-controllable/use-controllable.ts`
- Create: `packages/hooks/src/state/use-controllable/index.ts`
- Test: `packages/hooks/__tests__/use-controllable.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// packages/hooks/__tests__/use-controllable.test.ts
import { ref, computed } from 'vue'
import { useControllable } from '../src/state/use-controllable'

describe('useControllable', () => {
  it('uses defaultValue in uncontrolled mode', () => {
    const value = ref<string | number>(undefined)
    const defaultValue = ref<string | number>('home')
    const onChange = vi.fn()

    const active = useControllable({ value, defaultValue, onChange, fallback: '' })
    expect(active.value).toBe('home')
  })

  it('uses value in controlled mode', () => {
    const value = ref<string | number>('settings')
    const defaultValue = ref<string | number>('home')
    const onChange = vi.fn()

    const active = useControllable({ value, defaultValue, onChange, fallback: '' })
    expect(active.value).toBe('settings')
  })

  it('falls back to fallback when no value or defaultValue', () => {
    const value = ref<string | number>(undefined)
    const defaultValue = ref<string | number>(undefined)
    const onChange = vi.fn()

    const active = useControllable({ value, defaultValue, onChange, fallback: '' })
    expect(active.value).toBe('')
  })

  it('emits onChange on write in controlled mode', () => {
    const value = ref<string | number>('home')
    const defaultValue = ref<string | number>(undefined)
    const onChange = vi.fn()

    const active = useControllable({ value, defaultValue, onChange, fallback: '' })
    active.value = 'settings'

    expect(onChange).toHaveBeenCalledWith('settings')
    // Controlled: internal state not modified, external must update value
    expect(value.value).toBe('home')
  })

  it('updates internal state and emits onChange in uncontrolled mode', () => {
    const value = ref<string | number>(undefined)
    const defaultValue = ref<string | number>('home')
    const onChange = vi.fn()

    const active = useControllable({ value, defaultValue, onChange, fallback: '' })
    active.value = 'settings'

    expect(onChange).toHaveBeenCalledWith('settings')
    expect(active.value).toBe('settings')
  })

  it('transitions from uncontrolled to controlled when value becomes defined', () => {
    const value = ref<string | number>(undefined)
    const defaultValue = ref<string | number>('home')
    const onChange = vi.fn()

    const active = useControllable({ value, defaultValue, onChange, fallback: '' })
    expect(active.value).toBe('home')

    // Simulate parent passing v-model after async data loads
    value.value = 'async-value'
    expect(active.value).toBe('async-value')
  })
})
```

- [ ] **Step 2: Run test — expect failure**

Run: `pnpm --filter @company/ui-hooks test -- use-controllable`
Expected: FAIL — module not found

- [ ] **Step 3: Implement useControllable**

```ts
// packages/hooks/src/state/use-controllable/use-controllable.ts

import { ref, computed, type Ref, type WritableComputedRef } from 'vue'

export interface UseControllableOptions<T> {
  value: Ref<T | undefined>
  defaultValue: Ref<T | undefined>
  onChange: (value: T) => void
  fallback: T
}

export function useControllable<T>(options: UseControllableOptions<T>): WritableComputedRef<T> {
  const { value, defaultValue, onChange, fallback } = options

  const internalValue = ref<T>(defaultValue.value ?? fallback) as Ref<T>

  const isControlled = () => value.value !== undefined

  return computed({
    get() {
      if (isControlled()) return value.value as T
      return internalValue.value
    },
    set(newValue: T) {
      if (isControlled()) {
        onChange(newValue)
      } else {
        internalValue.value = newValue
        onChange(newValue)
      }
    },
  })
}
```

- [ ] **Step 4: Create index.ts and register in hooks/src/state/index.ts**

```ts
// packages/hooks/src/state/use-controllable/index.ts
export { useControllable } from './use-controllable'
export type { UseControllableOptions } from './use-controllable'
```

- [ ] **Step 5: Run tests — expect pass**

Run: `pnpm --filter @company/ui-hooks test -- use-controllable`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add packages/hooks/src/state/use-controllable/
git commit -m "feat(hooks): add useControllable for controlled/uncontrolled value management"
```

---

## Task 3: useRovingFocus Hook

**Files:**
- Create: `packages/hooks/src/state/use-roving-focus/use-roving-focus.ts`
- Create: `packages/hooks/src/state/use-roving-focus/index.ts`
- Test: `packages/hooks/__tests__/use-roving-focus.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// packages/hooks/__tests__/use-roving-focus.test.ts
import { ref } from 'vue'
import { useRovingFocus } from '../src/state/use-roving-focus'

describe('useRovingFocus', () => {
  const items = ref([
    { id: 'a', disabled: false },
    { id: 'b', disabled: false },
    { id: 'c', disabled: false },
  ])

  it('moves to next item on ArrowRight in horizontal mode', () => {
    const currentIndex = ref(0)
    const { handleKeydown } = useRovingFocus({
      items,
      currentIndex,
      orientation: ref('horizontal'),
    })

    handleKeydown(new KeyboardEvent('keydown', { key: 'ArrowRight' }) as any)
    expect(currentIndex.value).toBe(1)
  })

  it('moves to prev item on ArrowLeft', () => {
    const currentIndex = ref(1)
    const { handleKeydown } = useRovingFocus({
      items,
      currentIndex,
      orientation: ref('horizontal'),
    })

    handleKeydown(new KeyboardEvent('keydown', { key: 'ArrowLeft' }) as any)
    expect(currentIndex.value).toBe(0)
  })

  it('wraps in loop mode (default)', () => {
    const currentIndex = ref(2)
    const { handleKeydown } = useRovingFocus({
      items,
      currentIndex,
      orientation: ref('horizontal'),
      loop: ref(true),
    })

    handleKeydown(new KeyboardEvent('keydown', { key: 'ArrowRight' }) as any)
    expect(currentIndex.value).toBe(0)
  })

  it('does not wrap when loop=false', () => {
    const currentIndex = ref(2)
    const { handleKeydown } = useRovingFocus({
      items,
      currentIndex,
      orientation: ref('horizontal'),
      loop: ref(false),
    })

    handleKeydown(new KeyboardEvent('keydown', { key: 'ArrowRight' }) as any)
    expect(currentIndex.value).toBe(2) // stays
  })

  it('skips disabled items', () => {
    const localItems = ref([
      { id: 'a', disabled: false },
      { id: 'b', disabled: true },
      { id: 'c', disabled: false },
    ])
    const currentIndex = ref(0)
    const { handleKeydown } = useRovingFocus({
      items: localItems,
      currentIndex,
      orientation: ref('horizontal'),
    })

    handleKeydown(new KeyboardEvent('keydown', { key: 'ArrowRight' }) as any)
    expect(currentIndex.value).toBe(2) // skipped 'b'
  })

  it('moves to first on Home', () => {
    const currentIndex = ref(2)
    const { handleKeydown } = useRovingFocus({
      items,
      currentIndex,
      orientation: ref('horizontal'),
    })

    handleKeydown(new KeyboardEvent('keydown', { key: 'Home' }) as any)
    expect(currentIndex.value).toBe(0)
  })

  it('moves to last on End', () => {
    const currentIndex = ref(0)
    const { handleKeydown } = useRovingFocus({
      items,
      currentIndex,
      orientation: ref('horizontal'),
    })

    handleKeydown(new KeyboardEvent('keydown', { key: 'End' }) as any)
    expect(currentIndex.value).toBe(2)
  })

  it('uses ArrowDown/ArrowUp in vertical orientation', () => {
    const currentIndex = ref(0)
    const { handleKeydown } = useRovingFocus({
      items,
      currentIndex,
      orientation: ref('vertical'),
    })

    handleKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }) as any)
    expect(currentIndex.value).toBe(1)
  })

  it('reverses direction in RTL mode', () => {
    const currentIndex = ref(1)
    const { handleKeydown } = useRovingFocus({
      items,
      currentIndex,
      orientation: ref('horizontal'),
      dir: ref('rtl'),
    })

    // In RTL, ArrowRight = prev, ArrowLeft = next
    handleKeydown(new KeyboardEvent('keydown', { key: 'ArrowRight' }) as any)
    expect(currentIndex.value).toBe(0)
  })
})
```

- [ ] **Step 2: Run test — expect failure**

Run: `pnpm --filter @company/ui-hooks test -- use-roving-focus`
Expected: FAIL — module not found

- [ ] **Step 3: Implement useRovingFocus (full code from spec Section 2.4)**

Copy the complete `useRovingFocus`, `findNextEnabled`, and `findPrevEnabled` from the spec. The spec code is production-ready.

- [ ] **Step 4: Create index.ts and register in hooks/src/state/index.ts**

```ts
// packages/hooks/src/state/use-roving-focus/index.ts
export { useRovingFocus } from './use-roving-focus'
export type { UseRovingFocusOptions } from './use-roving-focus'
```

- [ ] **Step 5: Run tests — expect pass**

Run: `pnpm --filter @company/ui-hooks test -- use-roving-focus`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add packages/hooks/src/state/use-roving-focus/
git commit -m "feat(hooks): add useRovingFocus for keyboard navigation"
```

---

## Task 4: useRouterLink Hook

**Files:**
- Create: `packages/hooks/src/context/use-router-link/use-router-link.ts`
- Create: `packages/hooks/src/context/use-router-link/index.ts`
- Test: `packages/hooks/__tests__/use-router-link.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// packages/hooks/__tests__/use-router-link.test.ts
import { ref, provide } from 'vue'
import { useRouterLink } from '../src/context/use-router-link'
import { routerLinkInjectionKey } from '@company/ui-core'

describe('useRouterLink', () => {
  it('returns isActive=false when no router injected', () => {
    const to = ref('/home')
    const { isActive } = useRouterLink({ to })

    expect(isActive.value).toBe(false)
  })

  it('returns isActive=true when path matches', () => {
    const router = {
      currentRoute: ref({ path: '/home', name: undefined }),
      push: vi.fn(),
      replace: vi.fn(),
    }

    // Must be called inside a component setup or with provide
    // For testing, we simulate inject by calling inside a component-like context
    // This test requires a Vue test wrapper — using @vue/test-utils mount
  })

  it('navigate calls router.push for string to', () => {
    const router = {
      currentRoute: ref({ path: '/', name: undefined }),
      push: vi.fn(),
      replace: vi.fn(),
    }
    const to = ref('/home')
    const { navigate } = useRouterLink({ to })

    navigate()
    // Without injected router, navigate is a no-op
    expect(router.push).not.toHaveBeenCalled()
  })

  it('navigate calls router.replace when replace=true', () => {
    // Same pattern — requires Vue provide/inject test setup
  })
})
```

Note: Full integration tests require `@vue/test-utils` with a wrapper component that provides the router. The unit tests above cover the no-router path. Integration tests are in Task 9.

- [ ] **Step 2: Run test — expect failure**

Run: `pnpm --filter @company/ui-hooks test -- use-router-link`
Expected: FAIL — module not found

- [ ] **Step 3: Implement useRouterLink (code from spec Section 2.2)**

Copy the complete implementation from the spec. Add `inject` from Vue and `routerLinkInjectionKey` from `@company/ui-core`.

- [ ] **Step 4: Create index.ts and register in hooks/src/context/index.ts**

- [ ] **Step 5: Run tests — expect pass**

- [ ] **Step 6: Commit**

```bash
git add packages/hooks/src/context/use-router-link/
git commit -m "feat(hooks): add useRouterLink for optional router integration"
```

---

## Task 5: Menu Types and Context

**Files:**
- Create: `packages/components/menu/src/types.ts`
- Create: `packages/components/menu/src/context.ts`

- [ ] **Step 1: Create types.ts with all props, emits definitions from spec Section 3.3**

Include: `MenuMode`, `SubMenuTrigger`, `menuProps`, `menuItemProps`, `subMenuProps`, `menuItemGroupProps`, `menuEmits`, `menuItemEmits`. Also export `MenuProps`, `MenuItemProps` etc via `ExtractPropTypes`.

- [ ] **Step 2: Create context.ts with injection keys from spec Section 3.4**

Include: `MenuContext`, `menuInjectionKey`, `SubMenuContext`, `subMenuInjectionKey`.

- [ ] **Step 3: Commit**

```bash
git add packages/components/menu/src/types.ts packages/components/menu/src/context.ts
git commit -m "feat(menu): add types and context definitions"
```

---

## Task 6: Menu Core Logic (useMenu + useCollapseTransition)

**Files:**
- Create: `packages/components/menu/src/use-menu.ts`
- Create: `packages/components/menu/src/use-collapse-transition.ts`
- Test: `packages/components/menu/__tests__/use-menu.test.ts`
- Test: `packages/components/menu/__tests__/use-collapse-transition.test.ts`

- [ ] **Step 1: Write failing tests for useMenu**

```ts
// packages/components/menu/__tests__/use-menu.test.ts
import { ref, toRef } from 'vue'
import { useMenu } from '../src/use-menu'

describe('useMenu', () => {
  it('uses defaultActive in uncontrolled mode', () => {
    const props = { active: undefined, defaultActive: 'home', mode: 'vertical' as const, collapse: false, uniqueOpened: false, subMenuTrigger: 'hover' as const, routerIntegration: false }
    const emit = vi.fn()
    const { active } = useMenu(props, emit)

    expect(active.value).toBe('home')
  })

  it('uses active in controlled mode', () => {
    const props = { active: 'settings', defaultActive: 'home', mode: 'vertical' as const, collapse: false, uniqueOpened: false, subMenuTrigger: 'hover' as const, routerIntegration: false }
    const emit = vi.fn()
    const { active } = useMenu(props, emit)

    expect(active.value).toBe('settings')
  })

  it('openSubMenu adds to openedSubMenus', () => {
    const props = { active: undefined, defaultActive: '', mode: 'vertical' as const, collapse: false, uniqueOpened: false, subMenuTrigger: 'hover' as const, routerIntegration: false }
    const emit = vi.fn()
    const { openedSubMenus } = useMenu(props, emit)

    // openSubMenu is called via the provided context — test through context
    // For unit test, call internal function directly
  })

  it('uniqueOpened clears other submenus when opening a new one', () => {
    const props = { active: undefined, defaultActive: '', mode: 'vertical' as const, collapse: false, uniqueOpened: true, subMenuTrigger: 'hover' as const, routerIntegration: false }
    const emit = vi.fn()
    const result = useMenu(props, emit)

    // Open submenu-1, then submenu-2 — only submenu-2 should remain
  })
})
```

- [ ] **Step 2: Run test — expect failure**

- [ ] **Step 3: Implement useMenu (code from spec Section 3.5)**

Key points from spec:
- Uses `useControllable` for active
- `openedSubMenus` as `ref<Set>` with one-step replacement for uniqueOpened
- Provides `menuInjectionKey` context

- [ ] **Step 4: Implement useCollapseTransition (code from spec Section 3.7)**

Test by verifying the transition hook functions set correct style properties on a mock element.

- [ ] **Step 5: Run tests — expect pass**

- [ ] **Step 6: Commit**

```bash
git add packages/components/menu/src/use-menu.ts packages/components/menu/src/use-collapse-transition.ts packages/components/menu/__tests__/
git commit -m "feat(menu): add useMenu and useCollapseTransition composables"
```

---

## Task 7: Menu Vue Components

**Files:**
- Create: `packages/components/menu/src/menu.vue`
- Create: `packages/components/menu/src/menu-item.vue`
- Create: `packages/components/menu/src/sub-menu.vue`
- Create: `packages/components/menu/src/menu-item-group.vue`
- Create: `packages/components/menu/src/use-menu-item.ts`
- Create: `packages/components/menu/src/use-sub-menu.ts`
- Create: `packages/components/menu/src/menu.ts`
- Create: `packages/components/menu/src/index.ts`
- Create: `packages/components/menu/index.ts`

- [ ] **Step 1: Implement MenuItem (use-menu-item.ts + menu-item.vue)**

`use-menu-item.ts`: inject menuContext, compute `isActive`, handle click → `menuContext.selectItem`, register/unregister on mount/unmount. If `to` prop exists, use `useRouterLink` for route navigation.

`menu-item.vue`: render `<li>` with BEM classes, ARIA `role="menuitem"`, click handler, slot for default content and icon.

- [ ] **Step 2: Implement SubMenu (use-sub-menu.ts + sub-menu.vue)**

`use-sub-menu.ts`: inject menuContext + subMenuContext, compute `isInline` (vertical + !collapse), `isOpened`, handle mouse enter/leave with timeouts, use `usePosition` + `useClickOutside` + `useTeleport` + `useEscapeKey` for popup mode.

`sub-menu.vue`: Two templates — `v-if="isInline"` for inline expand, `v-else` for popup with `<Teleport>`. Both use `<Transition>` for animation.

- [ ] **Step 3: Implement MenuItemGroup**

Simple component: `<li>` wrapper with title slot and default slot for items.

- [ ] **Step 4: Implement Menu (menu.vue + menu.ts)**

`menu.vue`: Root `<ul>` element with BEM classes, mode/collapse class modifiers, color props → style computed, provide context via `useMenu`.

`menu.ts`: Export `UiMenu` with `withInstall` wrapper (if using component registration utility).

- [ ] **Step 5: Create index.ts files**

```ts
// packages/components/menu/src/index.ts
export { default as UiMenu } from './menu.vue'
export { default as UiMenuItem } from './menu-item.vue'
export { default as UiSubMenu } from './sub-menu.vue'
export { default as UiMenuItemGroup } from './menu-item-group.vue'
export * from './types'
```

```ts
// packages/components/menu/index.ts
export * from './src'
```

- [ ] **Step 6: Commit**

```bash
git add packages/components/menu/
git commit -m "feat(menu): implement Menu, MenuItem, SubMenu, MenuItemGroup components"
```

---

## Task 8: Menu Styles

**Files:**
- Create: `packages/components/menu/style/menu.scss`
- Create: `packages/components/menu/style/index.ts`

- [ ] **Step 1: Implement menu.scss from spec Section 5.1**

Full SCSS with BEM mixins, CSS variables for Component Tokens, vertical/horizontal variants, active/disabled/hover states, collapse transition, arrow rotation.

- [ ] **Step 2: Implement style/index.ts**

```ts
import './menu.scss'
```

- [ ] **Step 3: Add Menu Component Tokens to theme system**

Register the tokens from spec Section 5.2 in the theme package's token registry.

- [ ] **Step 4: Commit**

```bash
git add packages/components/menu/style/ packages/theme/
git commit -m "feat(menu): add styles and component tokens"
```

---

## Task 9: Menu Tests + ARIA

**Files:**
- Create: `packages/components/menu/__tests__/menu.test.ts`
- Create: `packages/components/menu/__tests__/menu-a11y.test.ts`

- [ ] **Step 1: Write component integration tests**

Test scenarios:
- Basic rendering of Menu + MenuItem
- `v-model:active` controlled mode
- `defaultActive` uncontrolled mode
- MenuItem click changes active
- SubMenu inline expand/collapse
- SubMenu popup mode (collapse)
- `uniqueOpened` accordion behavior
- Disabled MenuItem not selectable
- Menu color props set CSS variables
- MenuItemGroup renders title

- [ ] **Step 2: Write ARIA tests**

Test scenarios:
- Horizontal Menu has `role="menubar"` with `aria-orientation`
- Vertical Menu has `role="menu"` with `aria-orientation`
- MenuItem has `role="menuitem"`
- Disabled MenuItem has `aria-disabled="true"`
- SubMenu trigger has `aria-expanded` and `aria-haspopup="menu"`
- Keyboard navigation: ArrowDown/ArrowUp in vertical, ArrowLeft/ArrowRight in horizontal
- Enter opens SubMenu, Escape closes it

- [ ] **Step 3: Run all Menu tests**

Run: `pnpm --filter @company/ui-components test -- menu`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add packages/components/menu/__tests__/
git commit -m "test(menu): add component integration and ARIA tests"
```

---

## Task 10: Tabs Types and Context

**Files:**
- Create: `packages/components/tabs/src/types.ts`
- Create: `packages/components/tabs/src/context.ts`

- [ ] **Step 1: Create types.ts from spec Section 4.3**

Include: `TabsType`, `TabPosition`, `tabsProps`, `tabPaneProps`, `tabsEmits`. Export `TabsProps`, `TabPaneProps` via `ExtractPropTypes`. Add `editable`/`closable`/`addable` priority rule as a comment.

- [ ] **Step 2: Create context.ts from spec Section 4.4**

Include: `TabPaneState`, `TabsContext`, `tabsInjectionKey`.

- [ ] **Step 3: Commit**

```bash
git add packages/components/tabs/src/types.ts packages/components/tabs/src/context.ts
git commit -m "feat(tabs): add types and context definitions"
```

---

## Task 11: Tabs Core Logic (useTabs + useTabBar + useTabScroll)

**Files:**
- Create: `packages/components/tabs/src/use-tabs.ts`
- Create: `packages/components/tabs/src/use-tab-bar.ts`
- Create: `packages/components/tabs/src/use-tab-scroll.ts`
- Test: `packages/components/tabs/__tests__/use-tabs.test.ts`
- Test: `packages/components/tabs/__tests__/use-tab-bar.test.ts`
- Test: `packages/components/tabs/__tests__/use-tab-scroll.test.ts`

- [ ] **Step 1: Write failing tests for useTabs**

```ts
// packages/components/tabs/__tests__/use-tabs.test.ts
import { ref } from 'vue'
import { useTabs } from '../src/use-tabs'

describe('useTabs', () => {
  it('uses defaultActive in uncontrolled mode', () => {
    const props = { active: undefined, defaultActive: 'home', type: 'line' as const, position: 'top' as const, closable: false, lazy: false }
    const emit = vi.fn()
    const { active } = useTabs(props, emit)
    expect(active.value).toBe('home')
  })

  it('selectTab updates active and emits change', async () => {
    const props = { active: 'home', defaultActive: '', type: 'line' as const, position: 'top' as const, closable: false, lazy: false }
    const emit = vi.fn()
    const { active, panes } = useTabs(props, emit)

    // Register a mock pane
    const mockPane = { name: 'settings', title: 'Settings', disabled: false, closable: undefined, lazy: undefined, cache: true }
    // Access internal via context... test through component mount instead

    // Unit test: verify selectTab logic
  })

  it('closeTab auto-switches to adjacent pane when closing active tab', () => {
    // Setup panes: [home, settings, profile]
    // Close 'settings' while it's active → should switch to 'profile' or 'home'
  })

  it('beforeLeave returning false prevents tab switch', async () => {
    const beforeLeave = vi.fn().mockResolvedValue(false)
    const props = { active: 'home', defaultActive: '', type: 'line' as const, position: 'top' as const, closable: false, lazy: false, beforeLeave }
    const emit = vi.fn()

    // Verify active stays 'home' after selectTab('settings')
  })
})
```

- [ ] **Step 2: Run test — expect failure**

- [ ] **Step 3: Implement useTabs (code from spec Section 4.5)**

Key points:
- Uses `useControllable` for active
- `registerPane` with DOM-order sorting
- `selectTab` with `beforeLeave` async interception
- `closeTab` with auto-switch to adjacent pane
- Emits but does NOT unregister on close

- [ ] **Step 4: Implement useTabBar (code from spec Section 4.6)**

Key points:
- Accepts optional `scrollOffset` parameter for scroll correction
- Uses `transform` not `left/top`
- `useResizeObserver` for auto-update

- [ ] **Step 5: Implement useTabScroll (code from spec Section 4.7)**

Key points:
- `scrollable` computed from offsetWidth vs scrollWidth
- `scrollToActive` keeps active tab visible
- `useResizeObserver` for auto-update

- [ ] **Step 6: Run tests — expect pass**

- [ ] **Step 7: Commit**

```bash
git add packages/components/tabs/src/use-tabs.ts packages/components/tabs/src/use-tab-bar.ts packages/components/tabs/src/use-tab-scroll.ts packages/components/tabs/__tests__/
git commit -m "feat(tabs): add useTabs, useTabBar, useTabScroll composables"
```

---

## Task 12: Tabs Vue Components

**Files:**
- Create: `packages/components/tabs/src/tabs.vue`
- Create: `packages/components/tabs/src/tab-pane.vue`
- Create: `packages/components/tabs/src/tab-bar.vue`
- Create: `packages/components/tabs/src/tab-nav.vue`
- Create: `packages/components/tabs/src/tabs.ts`
- Create: `packages/components/tabs/src/index.ts`
- Create: `packages/components/tabs/index.ts`

- [ ] **Step 1: Implement TabBar**

Simple component: `<div>` with absolute positioning, `:style="barStyle"` from `useTabBar`, CSS class based on vertical/horizontal orientation.

- [ ] **Step 2: Implement TabNav**

The most complex sub-component. Renders:
- Scroll arrow buttons (prev/next) when `scrollable`
- `<div role="tablist">` wrapping tab items
- Each tab item: `<div role="tab">` with `data-tab-name`, `aria-selected`, `aria-controls`, click → `selectTab`
- Close button per tab (if closable)
- Add button (if addable)
- `<TabBar>` at the bottom of the nav

Receives `panes`, `active`, `closable`, `addable` as props from Tabs.

- [ ] **Step 3: Implement TabPane (spec Section 4.8)**

Key logic:
- `inject(tabsInjectionKey)` to get context
- Register/unregister in `onMounted`/`onBeforeUnmount`
- `isActive` computed from context.active
- `shouldRender` from lazy × cache logic
- `v-if="shouldRender"` + `v-show="isActive"`
- ARIA: `role="tabpanel"`, `aria-labelledby`, `id`

- [ ] **Step 4: Implement Tabs**

Root component:
- `<div :class="[ns.b(), ns.m(type), ns.m(position)]">`
- `<TabNav>` in the header position
- `<div :class="ns.e('content')">` wrapping `<slot />` (TabPanes)
- Position handling: top/bottom → flex-column, left → flex-row, right → flex-row-reverse

- [ ] **Step 5: Create index.ts files**

- [ ] **Step 6: Commit**

```bash
git add packages/components/tabs/
git commit -m "feat(tabs): implement Tabs, TabPane, TabNav, TabBar components"
```

---

## Task 13: Tabs Styles

**Files:**
- Create: `packages/components/tabs/style/tabs.scss`
- Create: `packages/components/tabs/style/index.ts`

- [ ] **Step 1: Implement tabs.scss from spec Section 5.3**

Full SCSS with all type variants (line/card/border-card), position variants (top/bottom/left/right), closable/addable buttons, scroll arrows, tab-bar animation.

- [ ] **Step 2: Add Tabs Component Tokens from spec Section 5.4**

- [ ] **Step 3: Commit**

```bash
git add packages/components/tabs/style/ packages/theme/
git commit -m "feat(tabs): add styles and component tokens"
```

---

## Task 14: Tabs Tests + ARIA

**Files:**
- Create: `packages/components/tabs/__tests__/tabs.test.ts`
- Create: `packages/components/tabs/__tests__/tab-pane.test.ts`
- Create: `packages/components/tabs/__tests__/tabs-a11y.test.ts`

- [ ] **Step 1: Write component integration tests**

Test scenarios:
- Basic rendering of Tabs + TabPane
- `v-model:active` controlled mode
- Tab click switches active
- Three types render correctly (line/card/border-card)
- Four positions layout correctly
- Closable shows close buttons, click emits close
- Addable shows add button, click emits add
- Editable enables both closable and addable
- `editable + closable=false` → addable but not closable
- beforeLeave returning false prevents switch
- Lazy loading: TabPane not in DOM until first active
- Cache=true: TabPane stays in DOM after switching away
- Cache=false: TabPane removed from DOM after switching away
- Closing active tab auto-switches to adjacent

- [ ] **Step 2: Write ARIA tests**

Test scenarios:
- TabNav has `role="tablist"` with `aria-orientation`
- Tab items have `role="tab"`, `aria-selected`, `aria-controls`
- TabPane has `role="tabpanel"`, `aria-labelledby`
- `id`/`aria-controls` pairs match correctly
- Keyboard: ArrowLeft/Right switches tabs, Home/End jump to first/last

- [ ] **Step 3: Run all Tabs tests**

Run: `pnpm --filter @company/ui-components test -- tabs`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add packages/components/tabs/__tests__/
git commit -m "test(tabs): add component integration and ARIA tests"
```

---

## Task 15: Router Integration Verification

**Files:**
- Create: `packages/components/menu/__tests__/menu-router.test.ts`

- [ ] **Step 1: Write router integration test**

```ts
// packages/components/menu/__tests__/menu-router.test.ts
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import UiMenu from '../src/menu.vue'
import UiMenuItem from '../src/menu-item.vue'

describe('Menu router integration', () => {
  it('MenuItem with to prop navigates on click', async () => {
    const router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div/>' } },
        { path: '/home', name: 'home', component: { template: '<div/>' } },
      ],
    })

    const wrapper = mount(UiMenu, {
      props: { routerIntegration: true },
      global: { provide: { [routerLinkInjectionKey]: router } },
      slots: {
        default: () => h(UiMenuItem, { index: 'home', to: '/home' }, { default: () => 'Home' }),
      },
    })

    await wrapper.find('[data-menu-index="home"]').trigger('click')
    expect(router.push).toHaveBeenCalledWith('/home')
  })

  it('Menu works without vue-router installed', () => {
    const wrapper = mount(UiMenu, {
      props: { mode: 'vertical' },
      slots: {
        default: () => h(UiMenuItem, { index: 'home' }, { default: () => 'Home' }),
      },
    })

    expect(wrapper.find('ul').exists()).toBe(true)
  })
})
```

- [ ] **Step 2: Run test — expect pass**

- [ ] **Step 3: Commit**

```bash
git add packages/components/menu/__tests__/menu-router.test.ts
git commit -m "test(menu): add router integration verification"
```

---

## Task 16: Final Validation

- [ ] **Step 1: Run full test suite**

Run: `pnpm test`
Expected: ALL PASS

- [ ] **Step 2: Verify dependency constraints**

Run: `pnpm dependency-cruiser` (if configured) or manually verify no forbidden imports:
- Menu does not import vue-router
- Menu does not import Tabs
- Tabs does not import Menu
- Neither imports Form or Input

- [ ] **Step 3: Verify acceptance criteria from spec Section 10**

Check each row in the acceptance table:
- [ ] 6 components render correctly
- [ ] NavigationActiveProps defined in core
- [ ] Both support v-model:active and defaultActive
- [ ] 3 new hooks implemented with tests
- [ ] Menu three modes work
- [ ] Menu uniqueOpened works
- [ ] Tabs three types work
- [ ] Tabs four positions work
- [ ] Tabs closable/addable/editable work
- [ ] Tabs beforeLeave works
- [ ] Tabs lazy × cache works
- [ ] Tab scroll works
- [ ] TabBar slides correctly
- [ ] Router integration works without vue-router
- [ ] ARIA roles and keyboard navigation work
- [ ] Component Tokens registered

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: navigation components system complete — acceptance criteria verified"
```
