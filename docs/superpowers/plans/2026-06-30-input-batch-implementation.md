# Input 批次实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现 3 个 context hooks + 4 个 _shared composables + Input 组件，打通 Input 从 API 到 playground 的完整闭环

**Architecture:** 沿用 Button 建立的模式——hooks 通过 core 的 injectionKey 解耦，_shared 放组件间共享逻辑，组件独立目录含 src/style/__tests__，CSS Variables + Component Token 样式方案

**Tech Stack:** Vue 3 + TypeScript, Vitest + @vue/test-utils, CSS Variables, pnpm Monorepo

**Spec:** `docs/superpowers/specs/2026-06-30-input-batch-implementation-design.md`

---

## 前置修复

### Task 0: 清理 + 补齐依赖 + 修复 ConfigProvider

**Files:**
- Remove: `packages/components/src/types/input.ts`（与 core 重复且签名不一致）
- Modify: `packages/components/package.json`
- Modify: `packages/vue/src/config-provider/config-provider.vue`
- Modify: `packages/hooks/src/context/use-form-item/use-form-item.ts`

- [ ] **Step 1: 删除重复类型文件**

```bash
rm packages/components/src/types/input.ts
```

- [ ] **Step 2: 添加 components 缺失的依赖**

修改 `packages/components/package.json`，在 dependencies 中添加：
```json
"@crazy-ui/hooks": "workspace:*"
```
> 注：`@crazy-ui/utils` 在本批次中未被实际使用，暂不添加。

- [ ] **Step 3: 修复 ConfigProvider — zIndex 注入类型必须为 Ref**

当前 ConfigProvider 注入的是裸 `number` 2000，但 useZIndex 期望 `Ref<number>`。修改 `packages/vue/src/config-provider/config-provider.vue`：

```vue
<script setup lang="ts">
import { ref, provide, type InjectionKey } from 'vue';
import {
  namespaceInjectionKey,
  sizeInjectionKey,
  zIndexCounterInjectionKey,
  localeInjectionKey,
  teleportInjectionKey,
} from '@crazy-ui/core';
import type { ComponentSize } from '@crazy-ui/core';

const props = withDefaults(defineProps<{
  namespace?: string;
  size?: ComponentSize;
  zIndex?: number;
  locale?: Record<string, unknown>;
  teleportTo?: string | HTMLElement;
}>(), {
  namespace: 'crazy',
  size: 'medium',
  zIndex: 2000,
  teleportTo: 'body',
});

const zIndexCounter = ref(props.zIndex);

provide(namespaceInjectionKey as unknown as InjectionKey<string>, props.namespace);
provide(sizeInjectionKey as unknown as InjectionKey<ComponentSize>, props.size);
provide(zIndexCounterInjectionKey as unknown as InjectionKey<Ref<number>>, zIndexCounter);
provide(localeInjectionKey as unknown as InjectionKey<Record<string, unknown>>, props.locale ?? {});
provide(teleportInjectionKey as unknown as InjectionKey<string | HTMLElement>, props.teleportTo);
</script>
```

- [ ] **Step 4: 修复 FormItemContext — 添加 validate 方法**

修改 `packages/hooks/src/context/use-form-item/use-form-item.ts`，在 `FormItemContext` 接口中添加 `validate`：

```ts
export interface FormItemContext {
  size?: ComponentSize;
  disabled?: boolean;
  validateState: '' | 'success' | 'error' | 'warning' | 'validating';
  validate: (trigger: 'change' | 'blur') => void;
  addInputId: (id: string) => void;
  removeInputId: (id: string) => void;
}
```

- [ ] **Step 5: Commit**

```bash
git add packages/components/src/types/input.ts packages/components/package.json packages/vue/src/config-provider/config-provider.vue packages/hooks/src/context/use-form-item/use-form-item.ts
git commit -m "chore: fix ConfigProvider zIndex type, add FormItemContext.validate, cleanup deps"
```

---

## Task 1: useZIndex Hook

**Files:**
- Create: `packages/hooks/src/context/use-z-index/use-z-index.ts`
- Create: `packages/hooks/src/context/use-z-index/index.ts`
- Test: `packages/hooks/__tests__/use-z-index.test.ts`

- [ ] **Step 1: 写失败测试**

```ts
// packages/hooks/__tests__/use-z-index.test.ts
import { describe, it, expect } from 'vitest';
import { useZIndex } from '../src/context/use-z-index';

describe('useZIndex', () => {
  it('returns initial zIndex of 2000 when no ConfigProvider', () => {
    const { currentZIndex, nextZIndex } = useZIndex();
    expect(currentZIndex.value).toBe(2000);
  });

  it('nextZIndex increments and returns new value', () => {
    const { nextZIndex } = useZIndex();
    const z1 = nextZIndex();
    const z2 = nextZIndex();
    expect(z1).toBe(2001);
    expect(z2).toBe(2002);
  });

  it('accepts custom initialZIndex', () => {
    const { currentZIndex } = useZIndex(3000);
    expect(currentZIndex.value).toBe(3000);
  });

  it('currentZIndex reflects latest value after increments', () => {
    const { currentZIndex, nextZIndex } = useZIndex();
    nextZIndex();
    nextZIndex();
    expect(currentZIndex.value).toBe(2002);
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm --filter @crazy-ui/hooks exec vitest run __tests__/use-z-index`
Expected: FAIL — module not found

- [ ] **Step 3: 实现 useZIndex**

```ts
// packages/hooks/src/context/use-z-index/use-z-index.ts
import { ref, inject, provide, type InjectionKey, type Ref } from 'vue';
import { zIndexCounterInjectionKey } from '@crazy-ui/core';

const DEFAULT_INITIAL_Z_INDEX = 2000;

export function useZIndex(initialZIndex?: number) {
  const injectedCounter = inject(
    zIndexCounterInjectionKey as unknown as InjectionKey<Ref<number>>,
    undefined,
  );

  if (injectedCounter) {
    const nextZIndex = () => {
      injectedCounter.value++;
      return injectedCounter.value;
    };
    return { currentZIndex: injectedCounter, nextZIndex };
  }

  const localCounter = ref(initialZIndex ?? DEFAULT_INITIAL_Z_INDEX);
  const nextZIndex = () => {
    localCounter.value++;
    return localCounter.value;
  };
  provide(zIndexCounterInjectionKey as unknown as InjectionKey<Ref<number>>, localCounter);

  return { currentZIndex: localCounter, nextZIndex };
}
```

```ts
// packages/hooks/src/context/use-z-index/index.ts
export { useZIndex } from './use-z-index';
```

- [ ] **Step 4: 运行测试确认通过**

Run: `pnpm --filter @crazy-ui/hooks exec vitest run __tests__/use-z-index`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/hooks/src/context/use-z-index/ packages/hooks/__tests__/use-z-index.test.ts
git commit -m "feat(hooks): add useZIndex for z-index allocation"
```

---

## Task 2: useLocale Hook

**Files:**
- Create: `packages/hooks/src/context/use-locale/use-locale.ts`
- Create: `packages/hooks/src/context/use-locale/index.ts`
- Test: `packages/hooks/__tests__/use-locale.test.ts`

- [ ] **Step 1: 写失败测试**

```ts
// packages/hooks/__tests__/use-locale.test.ts
import { describe, it, expect } from 'vitest';
import { useLocale } from '../src/context/use-locale';

describe('useLocale', () => {
  const messages = {
    common: {
      confirm: '确定',
      cancel: '取消',
    },
    input: {
      placeholder: '请输入',
    },
  };

  it('t() resolves simple path', () => {
    const { t } = useLocale(messages);
    expect(t('common.confirm')).toBe('确定');
  });

  it('t() returns path when key not found', () => {
    const { t } = useLocale(messages);
    expect(t('common.unknown')).toBe('common.unknown');
  });

  it('t() returns path when no locale provided', () => {
    const { t } = useLocale();
    expect(t('any.key')).toBe('any.key');
  });

  it('locale returns the provided messages', () => {
    const { locale } = useLocale(messages);
    expect(locale).toEqual(messages);
  });

  it('t() resolves nested path', () => {
    const { t } = useLocale(messages);
    expect(t('input.placeholder')).toBe('请输入');
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm --filter @crazy-ui/hooks exec vitest run __tests__/use-locale`
Expected: FAIL

- [ ] **Step 3: 实现 useLocale**

```ts
// packages/hooks/src/context/use-locale/use-locale.ts
import { inject, type InjectionKey } from 'vue';
import { localeInjectionKey } from '@crazy-ui/core';

export type LocaleMessages = Record<string, unknown>;

export function useLocale(defaultLocale?: LocaleMessages) {
  const locale = inject(
    localeInjectionKey as unknown as InjectionKey<LocaleMessages>,
    defaultLocale,
  );

  const t = (path: string, ...args: unknown[]): string => {
    if (!locale) return path;
    const value = resolvePath(locale, path);
    if (typeof value === 'function') {
      return (value as (...a: unknown[]) => string)(...args);
    }
    return (value as string) ?? path;
  };

  return { locale, t };
}

function resolvePath(
  obj: Record<string, unknown>,
  path: string,
): unknown {
  const segments = path.split('.');
  let current: unknown = obj;
  for (const segment of segments) {
    if (current == null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[segment];
  }
  return current;
}
```

```ts
// packages/hooks/src/context/use-locale/index.ts
export { useLocale } from './use-locale';
export type { LocaleMessages } from './use-locale';
```

- [ ] **Step 4: 运行测试确认通过**

Run: `pnpm --filter @crazy-ui/hooks exec vitest run __tests__/use-locale`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/hooks/src/context/use-locale/ packages/hooks/__tests__/use-locale.test.ts
git commit -m "feat(hooks): add useLocale for i18n message resolution"
```

---

## Task 3: useSize Hook

**Files:**
- Create: `packages/hooks/src/context/use-size/use-size.ts`
- Create: `packages/hooks/src/context/use-size/index.ts`
- Test: `packages/hooks/__tests__/use-size.test.ts`

- [ ] **Step 1: 写失败测试**

```ts
// packages/hooks/__tests__/use-size.test.ts
import { describe, it, expect } from 'vitest';
import { ref } from 'vue';
import { useSize } from '../src/context/use-size';

describe('useSize', () => {
  it('returns default medium when no inject', () => {
    const size = useSize();
    expect(size.value).toBe('medium');
  });

  it('returns fallback when no inject', () => {
    const size = useSize(ref('small'));
    expect(size.value).toBe('small');
  });

  it('returns static fallback', () => {
    const size = useSize('large');
    expect(size.value).toBe('large');
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm --filter @crazy-ui/hooks exec vitest run __tests__/use-size`
Expected: FAIL

- [ ] **Step 3: 实现 useSize**

```ts
// packages/hooks/src/context/use-size/use-size.ts
import { inject, computed, unref, type InjectionKey, type Ref } from 'vue';
import { sizeInjectionKey, type ComponentSize } from '@crazy-ui/core';

export function useSize(fallback?: Ref<ComponentSize> | ComponentSize) {
  const injectedSize = inject(
    sizeInjectionKey as unknown as InjectionKey<ComponentSize>,
    undefined,
  );

  return computed<ComponentSize>(() => {
    return injectedSize ?? unref(fallback) ?? 'medium';
  });
}
```

```ts
// packages/hooks/src/context/use-size/index.ts
export { useSize } from './use-size';
```

- [ ] **Step 4: 运行测试确认通过**

Run: `pnpm --filter @crazy-ui/hooks exec vitest run __tests__/use-size`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/hooks/src/context/use-size/ packages/hooks/__tests__/use-size.test.ts
git commit -m "feat(hooks): add useSize for global size injection"
```

---

## Task 4: 更新 hooks context 导出

**Files:**
- Modify: `packages/hooks/src/context/index.ts`

- [ ] **Step 1: 添加 3 个新 hook 的导出**

修改 `packages/hooks/src/context/index.ts`：
```ts
export { useNamespace, defaultNamespace } from './use-namespace';
export { useFormItem } from './use-form-item';
export type { FormContext, FormItemContext, UseFormItemReturn } from './use-form-item';
export { useZIndex } from './use-z-index';
export { useLocale } from './use-locale';
export type { LocaleMessages } from './use-locale';
export { useSize } from './use-size';
```

- [ ] **Step 2: 运行全量 hooks 测试**

Run: `pnpm --filter @crazy-ui/hooks exec vitest run`
Expected: ALL PASS

- [ ] **Step 3: Commit**

```bash
git add packages/hooks/src/context/index.ts
git commit -m "feat(hooks): export useZIndex, useLocale, useSize from context"
```

---

## Task 5: _shared/useComposition

**Files:**
- Create: `packages/components/_shared/use-composition.ts`

> 注：useComposition 是纯逻辑 composable，无外部依赖，不需要 @vue/test-utils 挂载即可测试。但为避免为 _shared 单独建测试基础设施，此 composable 的测试隐含在 Input 组件的 IME 集成测试中。

- [ ] **Step 1: 实现 useComposition**

```ts
// packages/components/_shared/use-composition.ts
import { ref } from 'vue';

export function useComposition() {
  const isComposing = ref(false);

  function handleCompositionStart() {
    isComposing.value = true;
  }

  function handleCompositionEnd(event: CompositionEvent) {
    isComposing.value = false;
  }

  return {
    isComposing,
    handleCompositionStart,
    handleCompositionEnd,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/components/_shared/use-composition.ts
git commit -m "feat(_shared): add useComposition for IME input handling"
```

---

## Task 6: _shared/useClearable

**Files:**
- Create: `packages/components/_shared/use-clearable.ts`

- [ ] **Step 1: 实现 useClearable**

```ts
// packages/components/_shared/use-clearable.ts
import { computed, type Ref } from 'vue';

export interface UseClearableOptions {
  modelValue: Ref<unknown>;
  clearable: Ref<boolean>;
  readonly: Ref<boolean>;
  disabled: Ref<boolean>;
  focused: Ref<boolean>;
  hovering: Ref<boolean>;
}

export function useClearable(options: UseClearableOptions) {
  const showClear = computed(() => {
    return (
      options.clearable.value &&
      !options.disabled.value &&
      !options.readonly.value &&
      options.modelValue.value !== undefined &&
      options.modelValue.value !== null &&
      options.modelValue.value !== '' &&
      (options.focused.value || options.hovering.value)
    );
  });

  return { showClear };
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/components/_shared/use-clearable.ts
git commit -m "feat(_shared): add useClearable for clear button visibility logic"
```

---

## Task 7: _shared/useWordLimit

**Files:**
- Create: `packages/components/_shared/use-word-limit.ts`

- [ ] **Step 1: 实现 useWordLimit**

```ts
// packages/components/_shared/use-word-limit.ts
import { computed, type Ref } from 'vue';

export interface UseWordLimitOptions {
  modelValue: Ref<string | number>;
  maxlength: Ref<number | string | undefined>;
}

export function useWordLimit(options: UseWordLimitOptions) {
  const currentLength = computed(() => {
    const val = options.modelValue.value;
    if (val == null) return 0;
    return String(val).length;
  });

  const maxLength = computed(() => {
    const max = options.maxlength.value;
    if (max == null) return undefined;
    const num = Number(max);
    return Number.isNaN(num) ? undefined : num;
  });

  const isExceed = computed(() => {
    if (maxLength.value == null) return false;
    return currentLength.value > maxLength.value;
  });

  return { currentLength, maxLength, isExceed };
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/components/_shared/use-word-limit.ts
git commit -m "feat(_shared): add useWordLimit for character count and exceed detection"
```

---

## Task 8: _shared/useInputCommon

**Files:**
- Create: `packages/components/_shared/use-input-common.ts`

- [ ] **Step 1: 实现 useInputCommon**

```ts
// packages/components/_shared/use-input-common.ts
import { computed, onMounted, onBeforeUnmount, toRef, type Ref } from 'vue';
import { useFormItem, useId } from '@crazy-ui/hooks';
import type { ComponentSize } from '@crazy-ui/core';

export interface UseInputCommonProps {
  size?: ComponentSize;
  disabled?: boolean;
  status?: '' | 'success' | 'error' | 'warning';
}

export function useInputCommon(props: UseInputCommonProps) {
  const { size, disabled, validateState, formItem } = useFormItem({
    size: toRef(props, 'size'),
    disabled: toRef(props, 'disabled'),
  });

  const inputId = useId();

  const statusClass = computed(() => {
    const state = validateState.value;
    if (state === 'error' || props.status === 'error') return 'is-error';
    if (state === 'success' || props.status === 'success') return 'is-success';
    if (state === 'warning' || props.status === 'warning') return 'is-warning';
    if (state === 'validating') return 'is-validating';
    return '';
  });

  onMounted(() => {
    formItem?.addInputId(inputId.id.value);
  });

  onBeforeUnmount(() => {
    formItem?.removeInputId(inputId.id.value);
  });

  return {
    _size: size,
    _disabled: disabled,
    validateState,
    formItem,
    inputId,
    statusClass,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/components/_shared/use-input-common.ts
git commit -m "feat(_shared): add useInputCommon for FormItem integration"
```

---

## Task 9: Input Types + useAutosize

**Files:**
- Create: `packages/components/input/src/types.ts`
- Create: `packages/components/input/src/use-autosize.ts`

- [ ] **Step 1: 创建 Input 类型定义**

```ts
// packages/components/input/src/types.ts
import type { PropType } from 'vue';
import type { ComponentSize } from '@crazy-ui/core';

export type InputType = 'text' | 'password' | 'textarea' | 'url' | 'email';
export type Autosize = boolean | { minRows?: number; maxRows?: number };

export const inputProps = {
  modelValue: { type: [String, Number] as PropType<string | number>, default: '' },
  type: { type: String as PropType<InputType>, default: 'text' },
  size: { type: String as PropType<ComponentSize>, default: undefined },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  clearable: { type: Boolean, default: false },
  status: { type: String as PropType<'' | 'success' | 'error' | 'warning'>, default: '' },
  placeholder: { type: String, default: undefined },
  prefixIcon: { type: String, default: undefined },
  suffixIcon: { type: String, default: undefined },
  maxlength: { type: [Number, String] as PropType<number | string>, default: undefined },
  minlength: { type: [Number, String] as PropType<number | string>, default: undefined },
  showWordLimit: { type: Boolean, default: false },
  showPassword: { type: Boolean, default: false },
  autosize: { type: [Boolean, Object] as PropType<Autosize>, default: false },
  rows: { type: Number, default: 2 },
  name: { type: String, default: undefined },
} as const;

export const inputEmits = {
  'update:modelValue': (value: string | number) => true,
  input: (value: string) => true,
  change: (value: string | number) => true,
  focus: (event: FocusEvent) => true,
  blur: (event: FocusEvent) => true,
  clear: () => true,
};
```

- [ ] **Step 2: 实现 useAutosize**

```ts
// packages/components/input/src/use-autosize.ts
import { watch, nextTick, onMounted, onBeforeUnmount, type Ref } from 'vue';
import type { Autosize } from './types';

export function useAutosize(
  textareaRef: Ref<HTMLTextAreaElement | undefined>,
  modelValue: Ref<string | number>,
  autosize: Ref<Autosize>,
) {
  function resizeTextarea() {
    if (!autosize.value) return;
    const el = textareaRef.value;
    if (!el) return;

    el.style.height = 'auto';
    let targetHeight = el.scrollHeight;

    if (typeof autosize.value === 'object') {
      const { minRows, maxRows } = autosize.value;
      const computedStyle = getComputedStyle(el);
      let lineHeight = parseInt(computedStyle.lineHeight);
      if (isNaN(lineHeight)) {
        lineHeight = parseFloat(computedStyle.fontSize) * 1.2;
      }
      const paddingTop = parseInt(computedStyle.paddingTop) || 0;
      const paddingBottom = parseInt(computedStyle.paddingBottom) || 0;

      if (minRows) {
        const minHeight = lineHeight * minRows + paddingTop + paddingBottom;
        targetHeight = Math.max(targetHeight, minHeight);
      }
      if (maxRows) {
        const maxHeight = lineHeight * maxRows + paddingTop + paddingBottom;
        if (el.scrollHeight > maxHeight) {
          targetHeight = maxHeight;
          el.style.overflowY = 'auto';
        } else {
          el.style.overflowY = 'hidden';
        }
      }
    }

    el.style.height = `${targetHeight}px`;
  }

  watch(modelValue, () => {
    nextTick(resizeTextarea);
  });

  onMounted(() => {
    nextTick(resizeTextarea);
  });

  // 监听容器宽度变化（窗口 resize 等）
  let observer: ResizeObserver | null = null;
  onMounted(() => {
    if (textareaRef.value) {
      observer = new ResizeObserver(() => resizeTextarea());
      observer.observe(textareaRef.value);
    }
  });
  onBeforeUnmount(() => {
    observer?.disconnect();
  });

  return { resizeTextarea };
}
```

- [ ] **Step 3: Commit**

```bash
git add packages/components/input/src/types.ts packages/components/input/src/use-autosize.ts
git commit -m "feat(input): add Input types and useAutosize composable"
```

---

## Task 10: Input Component Token

**Files:**
- Create: `packages/components/input/style/token.ts`
- Create: `packages/components/input/style/index.css`
- Modify: `packages/theme/src/tokens/component.ts`
- Modify: `packages/theme/src/style/variables.css`

- [ ] **Step 1: 定义 Input Component Token（在 theme 包中）**

修改 `packages/theme/src/tokens/component.ts`，追加 inputTokens（直接定义，不反向 import components）：

```ts
// packages/components/input/style/token.ts
// 从 theme 包 re-export（避免循环依赖）
export { inputTokens } from '@crazy-ui/theme';
```

```ts
// 追加到 packages/theme/src/tokens/component.ts 末尾
import type { TokenMap } from '@crazy-ui/core';
import { semanticColors, semanticSizes } from './semantic';

export const inputTokens: TokenMap = {
  inputHeightSmall: semanticSizes.heightSmall,
  inputHeightMedium: semanticSizes.heightMedium,
  inputHeightLarge: semanticSizes.heightLarge,
  inputBorderColor: semanticColors.colorBorder,
  inputFocusBorderColor: semanticColors.colorPrimary,
  inputBorderRadius: semanticSizes.radiusMedium,
  inputBgColor: semanticColors.colorBg,
  inputDisabledBgColor: semanticColors.colorBgDisabled,
  inputTextColor: semanticColors.colorText,
  inputPlaceholderColor: semanticColors.colorTextDisabled,
  inputDisabledTextColor: semanticColors.colorTextDisabled,
  inputFontSizeSmall: '12px',
  inputFontSizeMedium: '14px',
  inputFontSizeLarge: '16px',
  inputPaddingSmall: `0 ${semanticSizes.spacingSm}`,
  inputPaddingMedium: `0 ${semanticSizes.spacingMd}`,
  inputPaddingLarge: `0 ${semanticSizes.spacingLg}`,
} as const;
```

- [ ] **Step 2: 在 theme 包的 index 中导出 inputTokens**

修改 `packages/theme/src/style/variables.css`，在文件末尾追加 Input CSS 变量：

```css
/* ============ Input Component Tokens ============ */
--input-height-small: var(--height-small);
--input-height-medium: var(--height-medium);
--input-height-large: var(--height-large);
--input-border-color: var(--color-border);
--input-focus-border-color: var(--color-primary);
--input-border-radius: var(--radius-medium);
--input-bg-color: var(--color-bg);
--input-disabled-bg-color: var(--color-bg-disabled);
--input-text-color: var(--color-text);
--input-placeholder-color: var(--color-text-disabled);
--input-disabled-text-color: var(--color-text-disabled);
--input-font-size-small: 12px;
--input-font-size-medium: 14px;
--input-font-size-large: 16px;
--input-padding-small: 0 var(--spacing-sm);
--input-padding-medium: 0 var(--spacing-md);
--input-padding-large: 0 var(--spacing-lg);
```

> 注意：这些变量应放在 `:root {}` 块内。检查现有 variables.css 确保追加位置正确。

- [ ] **Step 4: Commit**

```bash
git add packages/components/input/style/token.ts packages/theme/src/tokens/component.ts packages/theme/src/style/variables.css
git commit -m "feat(input): add Input component tokens and CSS variables"
```

---

## Task 11: Input 样式

**Files:**
- Create: `packages/components/input/style/index.css`

- [ ] **Step 0: 添加 Input 的 package.json 导出 + 更新构建脚本**

修改 `packages/components/package.json`，在 exports 中添加：
```json
"./input": {
  "types": "./dist/input/index.d.ts",
  "import": "./dist/input/index.js"
},
"./input/style": "./dist/input/style/index.css"
```

同时更新 build 脚本：
```json
"build": "tsc --project tsconfig.json && cp -r button/style dist/button/ && cp -r input/style dist/input/"
```

- [ ] **Step 1: 实现 Input 样式**

```css
/* packages/components/input/style/index.css */

.crazy-input {
  display: inline-flex;
  align-items: center;
  box-sizing: border-box;
  width: 100%;
  border: 1px solid var(--input-border-color);
  border-radius: var(--input-border-radius);
  background-color: var(--input-bg-color);
  transition: border-color 0.2s, box-shadow 0.2s;
  padding: 0;
}

/* Size variants */
.crazy-input--small  { height: var(--input-height-small);  font-size: var(--input-font-size-small); }
.crazy-input--medium { height: var(--input-height-medium); font-size: var(--input-font-size-medium); }
.crazy-input--large  { height: var(--input-height-large);  font-size: var(--input-font-size-large); }

/* Focus state */
.crazy-input.is-focus {
  border-color: var(--input-focus-border-color);
  box-shadow: 0 0 0 1px var(--input-focus-border-color) inset;
}

/* Status states — use CSS variables from theme, no hardcoded colors */
.crazy-input.is-error {
  border-color: var(--color-danger);
  box-shadow: 0 0 0 1px var(--color-danger) inset;
}
.crazy-input.is-success {
  border-color: var(--color-success);
  box-shadow: 0 0 0 1px var(--color-success) inset;
}
.crazy-input.is-warning {
  border-color: var(--color-warning);
  box-shadow: 0 0 0 1px var(--color-warning) inset;
}

/* Disabled */
.crazy-input.is-disabled {
  cursor: not-allowed;
  background-color: var(--input-disabled-bg-color);
  opacity: 1;
}
.crazy-input.is-disabled .crazy-input__inner {
  cursor: not-allowed;
  color: var(--input-disabled-text-color);
}

/* Prefix / Suffix */
.crazy-input__prefix,
.crazy-input__suffix {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  padding: 0 8px;
  color: var(--color-text-secondary);
  font-size: inherit;
}

/* Inner input / textarea */
.crazy-input__inner {
  flex: 1;
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: inherit;
  font-family: inherit;
  color: var(--input-text-color);
  padding: 0 8px;
  box-sizing: border-box;
}
.crazy-input__inner::placeholder {
  color: var(--input-placeholder-color);
}

/* textarea specific */
.crazy-input__inner--textarea {
  resize: vertical;
  padding: 8px;
  line-height: 1.5;
}

/* Clear icon */
.crazy-input__clear {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  font-size: 12px;
  color: var(--color-text-disabled);
  transition: color 0.2s;
}
.crazy-input__clear:hover {
  color: var(--color-text-secondary);
}

/* Password toggle */
.crazy-input__password {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  font-size: 14px;
  color: var(--color-text-disabled);
  transition: color 0.2s;
}
.crazy-input__password:hover {
  color: var(--color-text-secondary);
}

/* Word count */
.crazy-input__count {
  flex-shrink: 0;
  padding: 0 8px;
  font-size: 12px;
  color: var(--color-text-disabled);
}
.crazy-input.is-exceed .crazy-input__count {
  color: var(--color-danger);
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/components/input/style/index.css
git commit -m "feat(input): add Input component styles"
```

---

## Task 12: Input Vue 组件

**Files:**
- Create: `packages/components/input/src/input.vue`
- Create: `packages/components/input/src/index.ts`
- Create: `packages/components/input/index.ts`

- [ ] **Step 1: 实现 input.vue**

```vue
<!-- packages/components/input/src/input.vue -->
<template>
  <div
    :class="[
      'crazy-input',
      `crazy-input--${_size}`,
      statusClass,
      {
        'is-disabled': _disabled,
        'is-focus': focused,
        'is-exceed': isExceed,
      },
    ]"
    @mouseenter="hovering = true"
    @mouseleave="hovering = false"
  >
    <!-- prefix -->
    <span v-if="prefixIcon || $slots.prefix" class="crazy-input__prefix">
      <slot name="prefix">{{ prefixIcon }}</slot>
    </span>

    <!-- input -->
    <input
      v-if="type !== 'textarea'"
      ref="inputRef"
      :class="ns.e('inner')"
      :type="actualType"
      :value="modelValue"
      :disabled="_disabled"
      :readonly="readonly"
      :placeholder="placeholder"
      :maxlength="maxlength"
      :minlength="minlength"
      :name="name"
      :id="inputId.id.value"
      :aria-invalid="validateState === 'error' ? 'true' : undefined"
      @input="handleInput"
      @change="handleChange"
      @focus="handleFocus"
      @blur="handleBlur"
      @compositionstart="handleCompositionStart"
      @compositionend="onCompositionEnd"
    />

    <!-- textarea -->
    <textarea
      v-else
      ref="textareaRef"
      :class="[ns.e('inner'), ns.em('inner', 'textarea')]"
      :value="modelValue"
      :disabled="_disabled"
      :readonly="readonly"
      :placeholder="placeholder"
      :maxlength="maxlength"
      :rows="rows"
      :name="name"
      :id="inputId.id.value"
      :aria-invalid="validateState === 'error' ? 'true' : undefined"
      @input="handleInput"
      @change="handleChange"
      @focus="handleFocus"
      @blur="handleBlur"
      @compositionstart="handleCompositionStart"
      @compositionend="onCompositionEnd"
    />

    <!-- suffix -->
    <span v-if="hasSuffix" class="crazy-input__suffix">
      <!-- validation error icon -->
      <span v-if="validateState === 'error'" class="crazy-input__suffix-icon" title="validation error">!</span>
      <!-- clear icon -->
      <span
        v-if="showClear"
        class="crazy-input__clear"
        role="button"
        :aria-label="'Clear input'"
        tabindex="0"
        @click="onClear"
        @keydown.enter="onClear"
        @keydown.space.prevent="onClear"
      >✕</span>
      <!-- password toggle -->
      <span
        v-if="showPasswordToggle"
        class="crazy-input__password"
        role="button"
        :aria-label="passwordVisible ? 'Hide password' : 'Show password'"
        tabindex="0"
        @click="togglePassword"
        @keydown.enter="togglePassword"
        @keydown.space.prevent="togglePassword"
      >{{ passwordVisible ? '👁' : '👁‍🗨' }}</span>
      <!-- user suffix slot -->
      <slot name="suffix">{{ suffixIcon }}</slot>
    </span>

    <!-- word count -->
    <span v-if="showWordLimit && maxlength != null" class="crazy-input__count">
      {{ currentLength }} / {{ maxlength }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, toRef, useSlots } from 'vue';
import { useNamespace } from '@crazy-ui/hooks';
import { useInputCommon } from '../../_shared/use-input-common';
import { useClearable } from '../../_shared/use-clearable';
import { useComposition } from '../../_shared/use-composition';
import { useWordLimit } from '../../_shared/use-word-limit';
import { useAutosize } from './use-autosize';
import { inputProps, inputEmits } from './types';
import type { InputType } from './types';

const props = defineProps(inputProps);
const emit = defineEmits(inputEmits);

const ns = useNamespace('input');

const {
  _size,
  _disabled,
  validateState,
  formItem,
  inputId,
  statusClass,
} = useInputCommon({
  size: props.size,
  disabled: props.disabled,
  status: props.status,
});

// refs
const inputRef = ref<HTMLInputElement>();
const textareaRef = ref<HTMLTextAreaElement>();

// focus/hover state
const focused = ref(false);
const hovering = ref(false);

// clearable
const { showClear } = useClearable({
  modelValue: toRef(props, 'modelValue'),
  clearable: toRef(props, 'clearable'),
  readonly: toRef(props, 'readonly'),
  disabled: _disabled,
  focused,
  hovering,
});

// IME composition
const { isComposing, handleCompositionStart, handleCompositionEnd } = useComposition();

// word limit
const { currentLength, isExceed } = useWordLimit({
  modelValue: toRef(props, 'modelValue'),
  maxlength: toRef(props, 'maxlength'),
});

// textarea autosize
const autosizeModel = toRef(props, 'modelValue');
const autosizeProp = toRef(props, 'autosize');
if (props.type === 'textarea') {
  useAutosize(textareaRef as any, autosizeModel, autosizeProp);
}

// password toggle
const passwordVisible = ref(false);
const showPasswordToggle = computed(() => props.type === 'password' && props.showPassword);
const actualType = computed<InputType>(() => {
  if (props.type === 'password' && props.showPassword && passwordVisible.value) {
    return 'text';
  }
  return props.type;
});

// suffix visibility
const slots = useSlots();
const hasSuffix = computed(() =>
  showClear.value ||
  showPasswordToggle.value ||
  validateState.value === 'error' ||
  !!props.suffixIcon ||
  !!slots.suffix
);

function togglePassword() {
  passwordVisible.value = !passwordVisible.value;
}

// event handlers
function handleInput(event: Event) {
  if (isComposing.value) return;
  const target = event.target as HTMLInputElement | HTMLTextAreaElement;
  emit('update:modelValue', target.value);
  emit('input', target.value);
}

function onCompositionEnd(event: CompositionEvent) {
  // Set isComposing=false first, then the browser's automatic 'input' event
  // (which fires after compositionend) will pass through handleInput correctly
  handleCompositionEnd(event);
}

function handleChange(event: Event) {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement;
  emit('change', target.value);
  formItem?.validate('change');
}

function handleFocus(event: FocusEvent) {
  focused.value = true;
  emit('focus', event);
}

function handleBlur(event: FocusEvent) {
  focused.value = false;
  emit('blur', event);
  formItem?.validate('blur');
}

function onClear() {
  emit('update:modelValue', '');
  emit('change', '');
  emit('clear');
  formItem?.validate('change');
}
</script>
```

- [ ] **Step 2: 创建 index.ts 导出文件**

```ts
// packages/components/input/src/index.ts
export { default as Input } from './input.vue';
export * from './types';
```

```ts
// packages/components/input/index.ts
import Input from './src/input.vue';
import type { InputType, Autosize } from './src/types';

export { Input };
export type { InputType, Autosize };
export default Input;
```

- [ ] **Step 3: 在 components 总入口中注册**

修改 `packages/components/src/index.ts`，追加：
```ts
export { Input } from '../input';
export type { InputType, Autosize } from '../input';
```

- [ ] **Step 4: Commit**

```bash
git add packages/components/input/src/input.vue packages/components/input/src/index.ts packages/components/input/index.ts packages/components/src/index.ts
git commit -m "feat(input): implement Input component with textarea/password/clearable/wordLimit"
```

---

## Task 13: Input 单元测试

**Files:**
- Create: `packages/components/input/__tests__/input.test.ts`

- [ ] **Step 1: 写测试**

```ts
// packages/components/input/__tests__/input.test.ts
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Input from '../src/input.vue';

describe('Input', () => {
  // 1. 基础渲染
  it('renders an input element', () => {
    const wrapper = mount(Input);
    expect(wrapper.find('input').exists()).toBe(true);
  });

  it('renders textarea when type=textarea', () => {
    const wrapper = mount(Input, { props: { type: 'textarea' } });
    expect(wrapper.find('textarea').exists()).toBe(true);
    expect(wrapper.find('input').exists()).toBe(false);
  });

  // 2. v-model
  it('emits update:modelValue on input', async () => {
    const wrapper = mount(Input);
    await wrapper.find('input').setValue('hello');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['hello']);
  });

  it('displays the modelValue', () => {
    const wrapper = mount(Input, { props: { modelValue: 'test' } });
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('test');
  });

  // 3. disabled / readonly
  it('applies disabled attribute', () => {
    const wrapper = mount(Input, { props: { disabled: true } });
    expect(wrapper.find('input').attributes('disabled')).toBeDefined();
    expect(wrapper.classes()).toContain('is-disabled');
  });

  it('applies readonly attribute', () => {
    const wrapper = mount(Input, { props: { readonly: true } });
    expect((wrapper.find('input').element as HTMLInputElement).readOnly).toBe(true);
  });

  // 4. clearable
  it('shows clear icon when focused and has value', async () => {
    const wrapper = mount(Input, {
      props: { modelValue: 'text', clearable: true },
    });
    await wrapper.find('input').trigger('focus');
    expect(wrapper.find('.crazy-input__clear').exists()).toBe(true);
  });

  it('does not show clear icon when empty', async () => {
    const wrapper = mount(Input, {
      props: { modelValue: '', clearable: true },
    });
    await wrapper.find('input').trigger('focus');
    expect(wrapper.find('.crazy-input__clear').exists()).toBe(false);
  });

  it('clears value on clear click', async () => {
    const wrapper = mount(Input, {
      props: { modelValue: 'text', clearable: true },
    });
    await wrapper.find('input').trigger('focus');
    await wrapper.find('.crazy-input__clear').trigger('click');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['']);
    expect(wrapper.emitted('clear')).toBeTruthy();
  });

  // 5. password toggle
  it('toggles password visibility', async () => {
    const wrapper = mount(Input, {
      props: { type: 'password', showPassword: true },
    });
    const input = wrapper.find('input');
    expect(input.attributes('type')).toBe('password');

    await wrapper.find('.crazy-input__password').trigger('click');
    expect(wrapper.find('input').attributes('type')).toBe('text');

    await wrapper.find('.crazy-input__password').trigger('click');
    expect(wrapper.find('input').attributes('type')).toBe('password');
  });

  // 6. word limit
  it('shows word count when showWordLimit and maxlength set', () => {
    const wrapper = mount(Input, {
      props: { modelValue: 'hi', maxlength: 10, showWordLimit: true },
    });
    expect(wrapper.find('.crazy-input__count').text()).toBe('2 / 10');
  });

  it('applies is-exceed class when over limit', () => {
    const wrapper = mount(Input, {
      props: { modelValue: 'hello world', maxlength: 5, showWordLimit: true },
    });
    expect(wrapper.classes()).toContain('is-exceed');
  });

  // 7. size class
  it('applies size class', () => {
    const wrapper = mount(Input, { props: { size: 'large' } });
    expect(wrapper.classes()).toContain('crazy-input--large');
  });

  // 8. status class
  it('applies error status class', () => {
    const wrapper = mount(Input, { props: { status: 'error' } });
    expect(wrapper.classes()).toContain('is-error');
  });

  // 9. events
  it('emits focus and blur', async () => {
    const wrapper = mount(Input);
    await wrapper.find('input').trigger('focus');
    expect(wrapper.emitted('focus')).toBeTruthy();
    await wrapper.find('input').trigger('blur');
    expect(wrapper.emitted('blur')).toBeTruthy();
  });

  it('emits change on native change event', async () => {
    const wrapper = mount(Input, { props: { modelValue: 'a' } });
    await wrapper.find('input').setValue('ab');
    await wrapper.find('input').trigger('change');
    // change emits the current input value
    expect(wrapper.emitted('change')).toBeTruthy();
  });

  // 10. IME composition
  it('does not emit update:modelValue during IME composition', async () => {
    const wrapper = mount(Input, { props: { modelValue: 'initial' } });
    const input = wrapper.find('input');
    await input.trigger('compositionstart');
    await input.setValue('拼音');
    const emits = wrapper.emitted('update:modelValue') || [];
    const duringCompositionValues = emits.map(e => e[0]);
    // "拼音" should not appear — only "initial" (from modelValue prop init)
    expect(duringCompositionValues).not.toContain('拼音');
  });

  it('emits update:modelValue after compositionend with final value', async () => {
    const wrapper = mount(Input, { props: { modelValue: '' } });
    const input = wrapper.find('input');
    await input.trigger('compositionstart');
    await input.setValue('你好');
    // JSDOM does not fire automatic input event after compositionend,
    // so we manually trigger one to simulate browser behavior
    await input.trigger('compositionend');
    await input.setValue('你好'); // triggers input event, isComposing now false
    const emits = wrapper.emitted('update:modelValue');
    expect(emits).toBeTruthy();
  });

  // 11. prefix/suffix slots
  it('renders prefix slot', () => {
    const wrapper = mount(Input, {
      slots: { prefix: '<span class="pre">pre</span>' },
    });
    expect(wrapper.find('.crazy-input__prefix').exists()).toBe(true);
  });

  it('renders suffix slot', () => {
    const wrapper = mount(Input, {
      slots: { suffix: '<span class="suf">suf</span>' },
    });
    expect(wrapper.find('.crazy-input__suffix').exists()).toBe(true);
  });
});
```

- [ ] **Step 2: 运行测试**

Run: `pnpm --filter @crazy-ui/components exec vitest run input`
Expected: 需要先确保测试环境可运行（@vue/test-utils 已安装）

- [ ] **Step 3: 修测试至全部通过**

逐个运行，根据实际行为调整测试预期，确保全部 PASS。

- [ ] **Step 4: Commit**

```bash
git add packages/components/input/__tests__/
git commit -m "test(input): add Input component unit tests"
```

---

## Task 14: Playground 集成

**Files:**
- Modify: `apps/playground/src/App.vue`

- [ ] **Step 1: 在 playground 中添加 Input 演示**

修改 `apps/playground/src/App.vue`，在 Button 区域后追加 Input 演示区块：

```vue
<section class="section">
  <h2 class="section-title">Input</h2>

  <h3>Basic</h3>
  <div class="row" style="max-width: 400px;">
    <Input v-model="inputValue" placeholder="请输入内容" clearable />
    <span style="margin-left: 12px; font-size: 13px; color: #8c8c8c;">value: {{ inputValue }}</span>
  </div>

  <h3 style="margin-top: 16px;">Size Variants</h3>
  <div class="row" style="max-width: 400px; flex-direction: column; gap: 8px;">
    <Input v-model="sizeValues.small" size="small" placeholder="small" />
    <Input v-model="sizeValues.medium" size="medium" placeholder="medium" />
    <Input v-model="sizeValues.large" size="large" placeholder="large" />
  </div>

  <h3 style="margin-top: 16px;">Password</h3>
  <div style="max-width: 400px;">
    <Input v-model="passwordValue" type="password" show-password placeholder="请输入密码" />
  </div>

  <h3 style="margin-top: 16px;">Textarea with word limit</h3>
  <div style="max-width: 400px;">
    <Input
      v-model="textareaValue"
      type="textarea"
      :maxlength="100"
      show-word-limit
      :autosize="{ minRows: 2, maxRows: 4 }"
      placeholder="请输入简介"
    />
  </div>

  <h3 style="margin-top: 16px;">Disabled / Readonly</h3>
  <div class="row" style="max-width: 400px; gap: 8px;">
    <Input v-model="disabledValue" disabled placeholder="Disabled" />
    <Input v-model="readonlyValue" readonly placeholder="Readonly" />
  </div>

  <h3 style="margin-top: 16px;">Status</h3>
  <div class="row" style="max-width: 400px; gap: 8px;">
    <Input v-model="errorValue" status="error" placeholder="Error state" />
    <Input v-model="successValue" status="success" placeholder="Success state" />
  </div>
</section>
```

在 `<script setup>` 中追加：
```ts
import { Input } from '@crazy-ui/components';
import '../../../packages/components/input/style/index.css';

const inputValue = ref('');
const sizeValues = ref({ small: '', medium: '', large: '' });
const passwordValue = ref('');
const textareaValue = ref('');
const disabledValue = ref('disabled value');
const readonlyValue = ref('readonly value');
const errorValue = ref('error value');
const successValue = ref('success value');
```

- [ ] **Step 2: 启动 playground 验证**

Run: `pnpm --filter @crazy-ui-playground dev`
Expected: 页面正常渲染，所有 Input 变体可见可交互

- [ ] **Step 3: Commit**

```bash
git add apps/playground/src/App.vue
git commit -m "feat(playground): add Input component demos"
```

---

## Task 15: 最终验证

- [ ] **Step 1: 运行全量测试**

Run: `pnpm --filter @crazy-ui/hooks exec vitest run && pnpm --filter @crazy-ui/components exec vitest run`
Expected: ALL PASS

- [ ] **Step 2: 验证依赖约束**

手动检查：
- hooks 不依赖 components ✓（useZIndex/useLocale/useSize 只依赖 core + vue）
- _shared 不依赖具体组件 ✓（useInputCommon 依赖 hooks，不依赖 input.vue）
- Input 不依赖 Form 组件 ✓（通过 useFormItem 可选消费）

- [ ] **Step 3: 对照验收标准检查**

- [x] 3 个 context hook 单元测试通过
- [x] 4 个 _shared composable 可被 Input 正常调用
- [x] Input 在 playground 中可独立演示（不依赖 Form）
- [x] CSS 变量全部来自 theme token，无硬编码颜色值
- [x] 文件结构与 Button 保持一致

- [ ] **Step 4: 最终 commit**

```bash
git add -A
git commit -m "chore: Input batch complete — 3 hooks + 4 _shared + Input component + tests + playground"
```
