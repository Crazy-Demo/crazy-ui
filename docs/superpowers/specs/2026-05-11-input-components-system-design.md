# 输入复合组件体系设计

## 1. 为什么需要统一设计

Form 体系（Section 20）定义了 Form/FormItem 的协作协议，但 Input/Select/DatePicker 等输入组件**作为 Form 的核心消费者**，从未有过独立设计。这导致：

1. **公共协议缺失**——modelValue、size、disabled、validateState 的接入方式每个组件自己猜
2. **共享模式未抽象**——Input/Select/DatePicker 都需要 prefix/suffix icon、clearable、readonly，但没有统一抽象
3. **Select 复杂度未规划**——虚拟列表、远程搜索、多选、TreeSelect 是整个组件库最复杂的部分
4. **日期时间体系空白**——DatePicker/TimePicker/TimeSelect 的共享日历引擎从未设计

---

## 2. 组件清单与分级

参考 Element Plus 的 30 个输入型组件，按复杂度和依赖关系分级：

| 分类 | 组件 | 第一阶段 | 核心复杂度 |
|------|------|---------|-----------|
| **基础输入** | Input | ✅ | textarea、password、prefix/suffix、clearable |
| | Textarea | ✅（Input 变体） | 自适应高度、字数统计 |
| | InputNumber | ✅ | 步进器、精度控制、min/max |
| | InputTag | ⬜ 第二阶段 | 标签输入、去重 |
| **选择输入** | Select | ✅ | 多选、可搜索、远程搜索、虚拟列表、分组 |
| | SelectV2 | ⬜ 第二阶段 | 高性能虚拟列表版本 |
| | TreeSelect | ⬜ 第二阶段 | 树形数据 + 选择器 |
| | Cascader | ⬜ 第二阶段 | 级联面板、异步加载 |
| | Autocomplete | ⬜ 第二阶段 | 输入建议、远程搜索 |
| | Transfer | ⬜ 第二阶段 | 穿梭框 |
| **日期时间** | DatePicker | ⬜ 第二阶段 | 日历引擎、范围选择、快捷键 |
| | TimePicker | ⬜ 第二阶段 | 滚轮选择器 |
| | TimeSelect | ⬜ 第二阶段 | 固定时间选项 |
| **勾选** | Checkbox | ✅ | indeterminate、group |
| | Radio | ✅ | group、button 变体 |
| | Switch | ✅ | active/inactive 文字和图标 |
| **度量** | Slider | ⬜ 第二阶段 | 范围、标记点 |
| | Rate | ⬜ 第二阶段 | 半选、自定义图标 |
| | ColorPicker | ⬜ 第二阶段 | 色板、alpha 通道 |
| **文件** | Upload | ⬜ 第二阶段 | 拖拽、分片、预览 |

第一阶段聚焦 6 个组件：Input、InputNumber、Select、Checkbox、Radio、Switch。这些是 Form 体系闭环的最小集合。

---

## 3. 公共输入协议

### 3.1 InputCommonProps

所有输入组件必须遵守的统一接口——在 Core 层定义协议，所有输入组件实现同一套接口：

```ts
// @company/ui-core/src/types/input-common.ts

/** 所有输入组件共享的基础 Props（值绑定 + 表单语义） */
export interface InputBaseProps<T = unknown> {
  /** v-model 绑定值 */
  modelValue?: T
  /** 尺寸 */
  size?: ComponentSize
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readonly?: boolean
  /** 表单 name 属性 */
  name?: string
}

/** 带交互字段扩展的 Props（清空、状态、占位、图标） */
export interface InputFieldProps<T = unknown> extends InputBaseProps<T> {
  /** 是否可清除 */
  clearable?: boolean
  /** 输入状态 */
  status?: '' | 'success' | 'error' | 'warning'
  /** 占位文本 */
  placeholder?: string
  /** 前缀图标 */
  prefixIcon?: string | Component
  /** 后缀图标 */
  suffixIcon?: string | Component
}

/** 向后兼容别名 */
export type InputCommonProps<T = unknown> = InputFieldProps<T>

/** 所有输入组件共享的 Emits 协议 */
export interface InputCommonEmits<T = unknown> {
  (e: 'update:modelValue', value: T): void
  (e: 'change', value: T): void
  (e: 'blur', event: FocusEvent): void
  (e: 'focus', event: FocusEvent): void
  (e: 'clear'): void
}
```

设计动机：

> 拆分 InputBaseProps / InputFieldProps 的原因：Checkbox、Radio、Switch 不需要 clearable / placeholder / prefixIcon / suffixIcon 等字段属性，它们只需值绑定 + 表单语义。InputBaseProps 提供最小公约数，InputFieldProps 扩展字段交互能力。泛型 `<T>` 让各组件传入具体类型，如 `InputBaseProps<string>` 或 `InputFieldProps<string | number>`。

设计动机：

> 不是让每个组件重新定义 modelValue/size/disabled/clearable，而是在 Core 层定义协议，所有输入组件实现同一套接口。Form、FormItem、useFormItem 通过这个协议与输入组件交互，不需要知道具体是 Input 还是 Select。

### 3.2 useFormItem 接入协议

所有输入组件通过 `useFormItem` 可选消费 Form 上下文。统一接入模式：

```ts
const { size, disabled, validateState } = useFormItem({
  size: toRef(props, 'size'),
  disabled: toRef(props, 'disabled'),
})

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

核心原则：输入组件不知道 Form 的存在。它只调用 `useFormItem` 返回的 API，由 hook 决定是否触发校验。

### 3.3 状态样式映射

`status` / `validateState` 到 CSS 的映射是统一的：

```ts
const statusClass = computed(() => {
  const state = validateState.value
  if (state === 'error' || props.status === 'error') return 'is-error'
  if (state === 'success' || props.status === 'success') return 'is-success'
  if (state === 'warning' || props.status === 'warning') return 'is-warning'
  if (state === 'validating') return 'is-validating'
  return ''
})
```

CSS 变量映射：

```css
.ui-input.is-error,
.ui-select.is-error,
.ui-date-picker.is-error {
  --ui-input-border-color: var(--ui-color-danger);
  --ui-input-box-shadow: 0 0 0 1px var(--ui-color-danger) inset;
}
```

### 3.4 可清除模式 (clearable)

```ts
// packages/components/_shared/use-clearable.ts

import { computed, type Ref } from 'vue'
import { useNamespace } from '@company/ui-hooks'

export interface UseClearableOptions {
  modelValue: Ref<unknown>
  clearable: Ref<boolean>
  readonly: Ref<boolean>
  disabled: Ref<boolean>
  focused: Ref<boolean>
  hovering: Ref<boolean>
}

export function useClearable(options: UseClearableOptions) {
  const showClear = computed(() => {
    return options.clearable.value
      && !options.disabled.value
      && !options.readonly.value
      && options.modelValue.value !== undefined
      && options.modelValue.value !== null
      && options.modelValue.value !== ''
      && (options.focused.value || options.hovering.value)
  })

  return { showClear }
}
```

设计决策：

| 决策点 | 选择 | 理由 |
|--------|------|------|
| 放在 components/_shared | 不放 hooks | clearable 是组件渲染逻辑（DOM、class、事件），不是纯 composable；hooks 不应包含 UI 渲染决策 |
| 显示时机 | 聚焦或悬停 | 与 Element Plus / Arco 一致；避免输入框始终显示 X 图标干扰视觉 |
| 值判断 | `!== undefined && !== null && !== ''` | 多选 Select 的值是 `[]`，需要额外判断——由各组件自行扩展 |
| 清除方式 | 回调模式（不提供 handleClear） | 不直接修改 modelValue，由各组件自行 `emit('update:modelValue', '')` + `emit('clear')`，保持单向数据流 |

### 3.5 前后缀图标模式

统一插槽结构：

```vue
<span :class="ns.e('prefix')">
  <slot name="prefix">
    <UiIcon v-if="prefixIcon" :icon="prefixIcon" />
  </slot>
</span>
<!-- 输入区域 -->
<span :class="ns.e('suffix')">
  <slot name="suffix">
    <UiIcon v-if="suffixIcon" :icon="suffixIcon" />
  </slot>
  <UiIcon v-if="showClear" icon="circle-close" @click="onClear" />
  <UiIcon v-if="showPasswordToggle" icon="view" @click="togglePassword" />
  <UiIcon v-if="validateState === 'error'" icon="circle-exclamation" />
</span>
```

suffix 图标优先级（从右到左排列）：

```
校验状态图标 → 清除图标 → 密码切换图标 → 用户自定义 suffix 插槽 → suffixIcon prop
```

### 3.6 ID 注册与 ARIA 关联

```ts
const inputId = useId()

onMounted(() => {
  formItem?.addInputId(inputId.id.value)
})

onBeforeUnmount(() => {
  formItem?.removeInputId(inputId.id.value)
})

// 模板
<input :id="inputId.id.value" :aria-describedby="formItem?.errorId" />
```

### 3.7 公共协议总结

| 协议 | 来源 | 输入组件接入方式 |
|------|------|----------------|
| size / disabled / validateState | `useFormItem()` | 每个 setup 中调用 |
| status → CSS class | useFormItem.statusClass | 挂载到根元素 class |
| clearable | `components/_shared/useClearable` | 复用共享逻辑 |
| prefix/suffix icon | 统一插槽结构 | slot + icon prop |
| ID / ARIA | `useId()` + formItem.addInputId | onMounted 注册 |
| change → validate('change') | useFormItem.formItem | handleChange 中调用 |
| blur → validate('blur') | useFormItem.formItem | handleBlur 中调用 |

---

## 4. Input 详细设计

### 4.1 Props

```ts
// packages/components/input/src/types.ts

import type { InputFieldProps } from '@company/ui-core'

export type InputType = 'text' | 'password' | 'textarea' | 'url' | 'email' | 'number'
export type Autosize = boolean | { minRows?: number; maxRows?: number }

export const inputProps = {
  modelValue: { type: [String, Number] as PropType<string | number>, default: '' },
  type: { type: String as PropType<InputType>, default: 'text' },
  size: { type: String as PropType<ComponentSize>, default: undefined },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  clearable: { type: Boolean, default: false },
  status: { type: String as PropType<'' | 'success' | 'error' | 'warning'>, default: '' },
  placeholder: { type: String },
  prefixIcon: { type: [String, Object] as PropType<string | Component> },
  suffixIcon: { type: [String, Object] as PropType<string | Component> },

  // Input 专属
  maxlength: { type: [Number, String] as PropType<number | string> },
  minlength: { type: [Number, String] as PropType<number | string> },
  showWordLimit: { type: Boolean, default: false },
  showPassword: { type: Boolean, default: false },
  autosize: { type: [Boolean, Object] as PropType<Autosize>, default: false },
  rows: { type: Number, default: 2 },
} as const
```

设计决策：

| 决策点 | 选择 | 理由 |
|--------|------|------|
| textarea 不独立组件 | `type='textarea'` 变体 | Element Plus / Arco 同策略；textarea 与 input 共享 prefix/suffix/clearable/maxlength 逻辑，拆开反增重复 |
| maxlength/minlength | 与原生 HTML 对齐 | 不做自定义校验（那是 Form rules 的职责），只控制 DOM 属性 |
| showWordLimit | 依赖 maxlength | 无 maxlength 时 showWordLimit 无意义，组件内判断 |
| autosize | 支持 minRows/maxRows | 企业中后台表单高频需求；纯 CSS `field-sizing` 兼容性不够，需要 JS 计算 |

### 4.2 组件结构

```vue
<template>
  <div
    :class="[
      ns.b(),
      ns.m(_size),
      ns.is('disabled', _disabled),
      ns.is('exceed', isExceed),
      statusClass,
    ]"
    @mouseenter="hovering = true"
    @mouseleave="hovering = false"
  >
    <span v-if="prefixIcon || $slots.prefix" :class="ns.e('prefix')">
      <slot name="prefix">
        <UiIcon :icon="prefixIcon" />
      </slot>
    </span>

    <input
      v-if="type !== 'textarea'"
      ref="inputRef"
      :class="ns.e('inner')"
      :type="showPassword ? (passwordVisible ? 'text' : 'password') : type"
      :value="modelValue"
      :disabled="_disabled"
      :readonly="readonly"
      :placeholder="placeholder ?? t('ui.input.placeholder')"
      :maxlength="maxlength"
      :minlength="minlength"
      :id="inputId"
      :aria-invalid="validateState === 'error'"
      :aria-describedby="formItem?.errorId"
      @input="handleInput"
      @change="handleChange"
      @focus="handleFocus"
      @blur="handleBlur"
      @compositionstart="handleCompositionStart"
      @compositionend="handleCompositionEnd"
    />

    <textarea
      v-else
      ref="textareaRef"
      :class="ns.e('inner')"
      :value="modelValue"
      :disabled="_disabled"
      :readonly="readonly"
      :placeholder="placeholder ?? t('ui.input.placeholder')"
      :maxlength="maxlength"
      :rows="rows"
      :id="inputId"
      @input="handleInput"
      @change="handleChange"
      @focus="handleFocus"
      @blur="handleBlur"
      @compositionstart="handleCompositionStart"
      @compositionend="handleCompositionEnd"
    />

    <span v-if="hasSuffix" :class="ns.e('suffix')">
      <slot name="suffix">
        <UiIcon v-if="suffixIcon" :icon="suffixIcon" />
      </slot>
      <UiIcon v-if="showClear" icon="circle-close-filled" :class="ns.e('clear')" @click="onClear" />
      <UiIcon v-if="showPasswordToggle" :icon="passwordVisible ? 'view' : 'hide'" :class="ns.e('password')" @click="passwordVisible = !passwordVisible" />
    </span>

    <span v-if="showWordLimit && maxlength" :class="ns.e('count')">
      {{ currentLength }} / {{ maxlength }}
    </span>
  </div>
</template>
```

### 4.3 组合输入处理 (IME)

```ts
const isComposing = ref(false)

function handleCompositionStart() {
  isComposing.value = true
}

function handleCompositionEnd(event: CompositionEvent) {
  isComposing.value = false
  handleInput(event)
}

function handleInput(event: Event) {
  if (isComposing.value) return
  const value = (event.target as HTMLInputElement).value
  emit('update:modelValue', value)
  emit('input', value)
}
```

### 4.4 自适应高度 (textarea autosize)

```ts
// packages/components/input/src/use-autosize.ts

import { watch, nextTick, onMounted, type Ref } from 'vue'
import { useResizeObserver } from '@company/ui-hooks'
import type { Autosize } from './types'

export function useAutosize(
  textareaRef: Ref<HTMLTextAreaElement | undefined>,
  modelValue: Ref<string | number>,
  autosize: Ref<Autosize>,
) {
  function resizeTextarea() {
    const el = textareaRef.value
    if (!el) return

    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`

    if (typeof autosize.value === 'object') {
      const { minRows, maxRows } = autosize.value
      const computedStyle = getComputedStyle(el)
      let lineHeight = parseInt(computedStyle.lineHeight)
      if (isNaN(lineHeight)) {
        lineHeight = parseFloat(computedStyle.fontSize) * 1.2
      }
      const paddingTop = parseInt(computedStyle.paddingTop)
      const paddingBottom = parseInt(computedStyle.paddingBottom)

      const minHeight = minRows ? lineHeight * minRows + paddingTop + paddingBottom : 0
      const maxHeight = maxRows ? lineHeight * maxRows + paddingTop + paddingBottom : Infinity

      el.style.height = `${Math.min(Math.max(el.scrollHeight, minHeight), maxHeight)}px`
      el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden'
    }
  }

  watch(modelValue, () => {
    nextTick(resizeTextarea)
  })

  onMounted(() => {
    nextTick(resizeTextarea)
  })

  useResizeObserver(textareaRef, () => {
    resizeTextarea()
  })

  return { resizeTextarea }
}
```

### 4.5 样式设计

```scss
@use '@company/ui-theme/src/mixins' as *;

@include b(input) {
  display: inline-flex;
  align-items: center;
  box-sizing: border-box;
  width: 100%;
  border: 1px solid var(--ui-input-border-color, var(--ui-color-border));
  border-radius: var(--ui-input-border-radius, var(--ui-border-radius-base));
  background-color: var(--ui-input-bg-color, var(--ui-color-white));
  transition: border-color var(--ui-transition-duration), box-shadow var(--ui-transition-duration);

  @include m(small) { height: var(--ui-input-height-sm, 24px); }
  @include m(medium) { height: var(--ui-input-height, 32px); }
  @include m(large) { height: var(--ui-input-height-lg, 40px); }

  @include e(inner) {
    flex: 1;
    width: 100%;
    height: 100%;
    border: none;
    outline: none;
    background: transparent;
    font-size: inherit;
    color: var(--ui-input-text-color, var(--ui-color-text-primary));
    &::placeholder { color: var(--ui-input-placeholder-color, var(--ui-color-text-placeholder)); }
  }

  @include when(focus) {
    border-color: var(--ui-input-focus-border-color, var(--ui-color-primary));
    box-shadow: 0 0 0 1px var(--ui-input-focus-border-color, var(--ui-color-primary)) inset;
  }

  @include when(disabled) {
    cursor: not-allowed;
    background-color: var(--ui-input-disabled-bg-color, var(--ui-color-fill-light));
    opacity: 1;
    @include e(inner) { cursor: not-allowed; color: var(--ui-color-text-disabled); }
  }

  @include when(exceed) {
    .#{$namespace}-input__count { color: var(--ui-color-danger); }
  }
}
```

Component Token：

```ts
{
  'input-height-sm': { value: '24px' },
  'input-height': { value: '32px' },
  'input-height-lg': { value: '40px' },
  'input-border-color': { value: '{color.border}' },
  'input-focus-border-color': { value: '{color.primary}' },
  'input-bg-color': { value: '{color.white}' },
  'input-text-color': { value: '{color.text.primary}' },
  'input-placeholder-color': { value: '{color.text.placeholder}' },
  'input-disabled-bg-color': { value: '{color.fill.light}' },
  'input-border-radius': { value: '{border-radius.base}' },
}
```

### 4.6 Input 与 Form 的完整协作示例

```vue
<UiForm :model="form" :rules="rules" ref="formRef">
  <UiFormItem label="用户名" prop="username">
    <UiInput v-model="form.username" placeholder="请输入用户名" clearable />
  </UiFormItem>
  <UiFormItem label="密码" prop="password">
    <UiInput v-model="form.password" type="password" show-password />
  </UiFormItem>
  <UiFormItem label="简介" prop="bio">
    <UiInput v-model="form.bio" type="textarea" :maxlength="200" show-word-limit :autosize="{ minRows: 3, maxRows: 6 }" />
  </UiFormItem>
</UiForm>
```

数据流：

```
用户输入 → Input handleInput → emit('update:modelValue') → Form model 更新
                                                      → emit('change') → formItem.validate('change')
用户失焦 → Input handleBlur → emit('blur') → formItem.validate('blur')
校验结果 → FormItem validateState 变化 → useFormItem.validateState → Input statusClass 更新
清除按钮 → onClear → emit('update:modelValue', '') → Form model 清空
                                           → emit('clear')
```

---

## 5. Select 详细设计

Select 是整个输入组件体系中复杂度最高的组件。

### 5.1 Props

```ts
// packages/components/select/src/types.ts

export type SelectValue = string | number | boolean | object | (string | number | boolean | object)[]
export type SelectOption = { value: string | number; label: string; disabled?: boolean }
export type SelectGroup = { label: string; options: SelectOption[] }
export type SelectFilterMethod = (query: string) => void | Promise<void>
export type SelectRemoteMethod = (query: string) => void | Promise<void>

export const selectProps = {
  modelValue: { type: [String, Number, Boolean, Object, Array] as PropType<SelectValue> },
  size: { type: String as PropType<ComponentSize> },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  clearable: { type: Boolean, default: false },
  status: { type: String as PropType<'' | 'success' | 'error' | 'warning'>, default: '' },
  placeholder: { type: String },

  // Select 专属
  multiple: { type: Boolean, default: false },
  collapseTags: { type: Boolean, default: false },
  collapseTagsTooltip: { type: Boolean, default: true },
  filterable: { type: Boolean, default: false },
  filterMethod: { type: Function as PropType<SelectFilterMethod> },
  remote: { type: Boolean, default: false },
  remoteMethod: { type: Function as PropType<SelectRemoteMethod> },
  allowCreate: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  loadingText: { type: String },
  noDataText: { type: String },
  noMatchText: { type: String },
  placement: { type: String as PropType<Placement>, default: 'bottom-start' },
  options: { type: Array as PropType<SelectOption[] | SelectGroup[]> },
  valueKey: { type: String, default: 'value' },
  maxCollapseTags: { type: Number, default: 0 },
  popperMaxHeight: { type: Number, default: 274 },
  autoClose: { type: Boolean, default: true },
} as const
```

设计决策：

| 决策点 | 选择 | 理由 |
|--------|------|------|
| 多选不独立组件 | `multiple` prop | 多选和单选共享 80% 逻辑，拆开导致大量重复 |
| options prop + 子组件双模式 | 两种都支持 | 简单场景用 `:options` 数组快捷声明；复杂场景用 `<UiOption>` 自定义渲染 |
| 虚拟列表 | 第一阶段不实现 | 虚拟列表改变 DOM 结构，与分组/远程搜索组合复杂度极高；第一阶段靠 `popperMaxHeight` + 滚动解决 |
| allowCreate | 支持 | 企业后台"标签选择器"场景高频需求 |
| placement | 来自 core Placement 类型 | 与 Popover/Tooltip 共用定位类型 |

### 5.2 组件拆分

```txt
packages/components/select/
├─ src/
│  ├─ select.vue
│  ├─ select.ts
│  ├─ types.ts
│  ├─ option.vue
│  ├─ option-group.vue
│  ├─ select-dropdown.vue
│  ├─ select-input.vue
│  ├─ select-tag.vue
│  ├─ use-select.ts
│  ├─ use-option-register.ts
│  └─ index.ts
├─ style/
├─ __tests__/
├─ docs/
└─ index.ts
```

### 5.3 选项注册机制

Select 不直接操作子组件 DOM，而是通过 provide/inject 建立选项注册表：

```ts
// packages/components/select/src/use-option-register.ts

import { reactive, provide, watch, type Ref } from 'vue'

export interface OptionState {
  value: string | number
  label: string
  disabled: boolean
  visible: boolean
  hitState: boolean
  group?: string
}

export function useOptionRegister(selectRef: Ref<any>) {
  const options = reactive(new Map<string | number, OptionState>())
  const groups = reactive(new Map<string, string>())

  function registerOption(option: OptionState) {
    options.set(option.value, option)
  }

  function unregisterOption(value: string | number) {
    options.delete(value)
  }

  function registerGroup(name: string, label: string) {
    groups.set(name, label)
  }

  function unregisterGroup(name: string) {
    groups.delete(name)
  }

  provide(selectInjectionKey, {
    select: selectRef,
    registerOption,
    unregisterOption,
    registerGroup,
    unregisterGroup,
  })

  return { options, groups }

  // options prop 变化时同步注册表
  watch(() => selectRef.props.options, (newOptions) => {
    if (!newOptions) return
    options.clear()
    for (const opt of newOptions) {
      registerOption({
        value: opt.value,
        label: opt.label ?? String(opt.value),
        disabled: opt.disabled ?? false,
        visible: true,
        hitState: false,
        group: opt.group,
      })
    }
  }, { deep: true })
}
```

UiOption 注册自身：

```ts
export default defineComponent({
  setup(props) {
    const selectContext = inject(selectInjectionKey)

    const optionState = reactive<OptionState>({
      value: props.value,
      label: props.label ?? String(props.value),
      disabled: props.disabled,
      visible: true,
      hitState: true,
    })

    onMounted(() => selectContext.registerOption(optionState))
    onBeforeUnmount(() => selectContext.unregisterOption(props.value))

    watch(() => [props.value, props.label, props.disabled], () => {
      Object.assign(optionState, {
        value: props.value,
        label: props.label ?? String(props.value),
        disabled: props.disabled,
      })
    })
  },
})
```

设计决策：

| 决策点 | 选择 | 理由 |
|--------|------|------|
| 注册表模式 | Map + provide/inject | Select 不遍历 DOM/children 查找选项；选项自行注册，支持条件渲染和动态增删 |
| 而非 v-for + options prop | 两种并存 | `:options` prop 内部也走注册表，统一数据源 |
| 响应式 | reactive Map | 选项 visible/hitState 随搜索实时变化，注册表必须响应式 |

### 5.4 核心 composable：useSelect

```ts
import type { OverlayType } from '@company/ui-core'

export function useSelect(props: SelectProps, emit: any) {
  const { size, disabled, validateState } = useFormItem({
    size: toRef(props, 'size'),
    disabled: toRef(props, 'disabled'),
  })

  const ns = useNamespace('select')
  const inputId = useId()
  const { nextZIndex } = useZIndex()
  const manager = useOverlayManager()

  const expanded = ref(false)
  const selectedLabel = computed(() => {
    if (props.multiple) {
      return (props.modelValue as any[]).map(val => findOption(val)?.label ?? val).join(', ')
    }
    return findOption(props.modelValue)?.label ?? props.modelValue
  })
  const query = ref('')
  const selectedValues = computed(() => {
    if (props.multiple) return (props.modelValue as any[]) ?? []
    return props.modelValue !== undefined ? [props.modelValue] : []
  })

  // 搜索逻辑
  const filteredOptions = computed(() => {
    if (!props.filterable || !query.value) return optionsArray
    if (props.remote) return optionsArray
    return optionsArray.filter(opt =>
      opt.label.toLowerCase().includes(query.value.toLowerCase())
    )
  })

  const hasMatchingOption = computed(() => filteredOptions.value.length > 0)

  // 远程搜索
  let remoteQueryTimer: ReturnType<typeof setTimeout> | null = null
  const remoteLoading = ref(false)

  function handleRemoteSearch(query: string) {
    if (!props.remote || !props.remoteMethod) return
    if (remoteQueryTimer) clearTimeout(remoteQueryTimer)
    remoteQueryTimer = setTimeout(async () => {
      remoteLoading.value = true
      try {
        await props.remoteMethod(query)
      } finally {
        remoteLoading.value = false
      }
    }, 300)
  }

  // 选择逻辑
  function handleOptionSelect(option: OptionState) {
    if (option.disabled) return

    if (props.multiple) {
      const values = [...(props.modelValue as any[] ?? [])]
      const index = values.findIndex(v => isEqual(v, option.value, props.valueKey))
      if (index > -1) {
        values.splice(index, 1)
      } else {
        values.push(option.value)
      }
      emit('update:modelValue', values)
      emit('change', values)
    } else {
      emit('update:modelValue', option.value)
      emit('change', option.value)
      if (props.autoClose) closeDropdown()
    }

    formItem?.validate('change')
  }

  function onClear() {
    const value = props.multiple ? [] : undefined
    emit('update:modelValue', value)
    emit('change', value)
    emit('clear')
    closeDropdown()
  }

  // 下拉面板
  function openDropdown() {
    if (props.disabled || props.readonly) return
    expanded.value = true
    manager.register({
      id: inputId.id.value,
      type: 'anchor' as OverlayType,
      close: closeDropdown,
      zIndex: nextZIndex(),
    })
  }

  function closeDropdown() {
    expanded.value = false
    query.value = ''
    manager.unregister(inputId.id.value)
  }

  // 键盘导航
  const hoverIndex = ref(-1)

  function handleKeydown(event: KeyboardEvent) {
    if (!expanded.value) {
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
        event.preventDefault()
        openDropdown()
      }
      return
    }

    const visibleOptions = filteredOptions.value.filter(o => !o.disabled)
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        hoverIndex.value = (hoverIndex.value + 1) % visibleOptions.length
        scrollToOption(hoverIndex.value)
        break
      case 'ArrowUp':
        event.preventDefault()
        hoverIndex.value = hoverIndex.value > 0 ? hoverIndex.value - 1 : visibleOptions.length - 1
        scrollToOption(hoverIndex.value)
        break
      case 'Enter':
        event.preventDefault()
        if (hoverIndex.value >= 0 && visibleOptions[hoverIndex.value]) {
          handleOptionSelect(visibleOptions[hoverIndex.value])
        }
        break
      case 'Escape':
        closeDropdown()
        break
    }
  }

  return {
    expanded, selectedLabel, query, selectedValues,
    filteredOptions, hasMatchingOption, remoteLoading, hoverIndex,
    handleOptionSelect, onClear, openDropdown, closeDropdown,
    handleKeydown, handleRemoteSearch,
  }
}
```

### 5.5 Select 与 Overlay 体系的协作

```ts
const { position, update: updatePosition } = usePosition({
  anchor: triggerRef,
  floating: dropdownRef,
  placement: toRef(props, 'placement'),
})

useClickOutside({
  target: dropdownRef,
  exclude: triggerRef,
  handler: closeDropdown,
})

useEscapeKey({
  enabled: expanded,
  onEscape: closeDropdown,
})
```

### 5.6 多选标签模式

```vue
<template>
  <div :class="[ns.e('input'), ns.is('multiple', multiple)]">
    <template v-if="multiple && selectedValues.length">
      <UiSelectTag
        v-for="value in visibleTags"
        :key="value"
        :value="value"
        :label="findOption(value)?.label"
        :disabled="disabled"
        @close="handleRemoveTag(value)"
      />
      <UiTooltip v-if="collapsedTags.length" :content="collapsedTags.map(v => findOption(v)?.label).join('、')">
        <UiTag>+{{ collapsedTags.length }}</UiTag>
      </UiTooltip>
    </template>
    <input
      v-if="filterable"
      ref="inputRef"
      v-model="query"
      :class="ns.e('search-input')"
      :disabled="disabled"
      :placeholder="selectedLabel || placeholder"
      @input="handleInput"
      @keydown.delete="handleDeleteBackward"
    />
  </div>
</template>
```

Delete/Backspace 删除最后一个标签：

```ts
function handleDeleteBackward(event: KeyboardEvent) {
  if (!props.multiple || query.value !== '') return
  const values = [...(props.modelValue as any[])]
  if (values.length > 0) {
    const removed = values.pop()!
    emit('update:modelValue', values)
    emit('remove-tag', removed)
  }
}
```

### 5.7 Select Component Token

```ts
{
  'select-height-sm': { value: '{input-height-sm}' },
  'select-height': { value: '{input-height}' },
  'select-height-lg': { value: '{input-height-lg}' },
  'select-border-color': { value: '{input-border-color}' },
  'select-focus-border-color': { value: '{input-focus-border-color}' },
  'select-bg-color': { value: '{input-bg-color}' },
  'select-option-height': { value: '34px' },
  'select-option-hover-bg-color': { value: '{color.fill.light}' },
  'select-option-selected-color': { value: '{color.primary}' },
  'select-option-selected-font-weight': { value: '600' },
  'select-option-disabled-color': { value: '{color.text.disabled}' },
  'select-dropdown-bg-color': { value: '{color.white}' },
  'select-dropdown-border-color': { value: '{color.border.light}' },
  'select-dropdown-shadow': { value: '{box-shadow.base}' },
  'select-tag-bg-color': { value: '{color.fill}' },
  'select-tag-max-width': { value: '160px' },
}
```

Select 的尺寸、边框、背景 Token 默认值引用 Input 的 Token——它们在同一表单行内必须视觉一致。

### 5.8 第一阶段不做的事

| 能力 | 原因 | 计划 |
|------|------|------|
| 虚拟列表 | 改变 DOM 结构，与分组/远程搜索组合复杂度高 | 第二阶段 SelectV2 |
| TreeSelect | 需要树形组件先实现 | 第二阶段 |
| Cascader | 级联面板是独立交互模型 | 第二阶段 |
| Autocomplete | 输入建议与 Select 的选项模型差异大 | 第二阶段 |
| Transfer | 穿梭框是独立交互模型 | 第二阶段 |
| 分组 + 远程搜索 | 分组在远程搜索结果中的呈现需要额外设计 | 第二阶段 |

---

## 6. Checkbox / Radio / Switch 详细设计

### 6.1 Checkbox Props

```ts
// packages/components/checkbox/src/types.ts

export const checkboxProps = {
  modelValue: { type: [Boolean, String, Number, Array] as PropType<boolean | string | number | (string | number)[]> },
  label: { type: [String, Number, Boolean] as PropType<string | number | boolean> },
  disabled: { type: Boolean, default: false },
  size: { type: String as PropType<ComponentSize> },
  border: { type: Boolean, default: false },
  indeterminate: { type: Boolean, default: false },
  trueValue: { type: [String, Number, Boolean], default: true },
  falseValue: { type: [String, Number, Boolean], default: false },
  name: { type: String },
} as const
```

设计决策：

| 决策点 | 选择 | 理由 |
|--------|------|------|
| trueValue/falseValue | 支持自定义选中值 | 企业后台常见 `"Y"/"N"`、`1/0` 这类非布尔值字段；Element Plus 同设计 |
| label 的双重含义 | 独立使用时是显示文本，Group 中是值标识 | 与 Element Plus 对齐；Group 模式下 label 作为 v-model 数组的元素值 |
| indeterminate | 仅视觉状态，不改变 modelValue | 全选/半选场景：值仍由子项计算得出 |
| border 变体 | 不独立组件 | 只是样式变体，逻辑完全相同 |

### 6.2 CheckboxGroup 上下文

```ts
export interface CheckboxGroupContext {
  modelValue: Ref<(string | number)[]>
  disabled: Ref<boolean>
  size: Ref<ComponentSize | undefined>
  min: Ref<number | undefined>
  max: Ref<number | undefined>
  changeEvent: (value: (string | number)[]) => void
}

// 留在组件内部，不放入 @company/ui-core（仅 Checkbox ↔ CheckboxGroup 使用）
export const checkboxGroupInjectionKey: unique symbol = Symbol('checkboxGroup')

export const checkboxGroupProps = {
  modelValue: { type: Array as PropType<(string | number)[]>, default: () => [] },
  disabled: { type: Boolean, default: false },
  size: { type: String as PropType<ComponentSize> },
  min: { type: Number },
  max: { type: Number },
} as const
```

Checkbox 接入 Group 的优先级：

```
checkbox.props.disabled > group.disabled > useFormItem.disabled
checkbox.props.size > group.size > useFormItem.size
```

```ts
const group = inject(checkboxGroupInjectionKey, undefined)

const _disabled = computed(() =>
  props.disabled || group?.disabled.value || formItemDisabled.value
    || (group?.max.value !== undefined && group.modelValue.value.length >= group.max.value && !isSelected.value)
)
```

### 6.3 Checkbox 全选/半选模式

```vue
<UiCheckbox v-model="checkAll" :indeterminate="isIndeterminate" @change="handleCheckAllChange">
  全选
</UiCheckbox>
<UiCheckboxGroup v-model="checkedCities" @change="handleCheckedCitiesChange">
  <UiCheckbox v-for="city in cities" :key="city" :label="city">{{ city }}</UiCheckbox>
</UiCheckboxGroup>
```

```ts
function handleCheckAllChange(val: boolean) {
  checkedCities.value = val ? cities : []
  isIndeterminate.value = false
}

function handleCheckedCitiesChange(value: string[]) {
  const checkedCount = value.length
  checkAll.value = checkedCount === cities.length
  isIndeterminate.value = checkedCount > 0 && checkedCount < cities.length
}
```

全选逻辑不在组件内，由业务代码计算。

### 6.4 Radio Props

```ts
export const radioProps = {
  modelValue: { type: [String, Number, Boolean] as PropType<string | number | boolean> },
  label: { type: [String, Number, Boolean] as PropType<string | number | boolean> },
  disabled: { type: Boolean, default: false },
  size: { type: String as PropType<ComponentSize> },
  border: { type: Boolean, default: false },
  name: { type: String },
} as const

// 留在组件内部，不放入 @company/ui-core（仅 Radio ↔ RadioGroup 使用）
export const radioGroupInjectionKey: unique symbol = Symbol('radioGroup')

export const radioGroupProps = {
  modelValue: { type: [String, Number, Boolean] as PropType<string | number | boolean> },
  disabled: { type: Boolean, default: false },
  size: { type: String as PropType<ComponentSize> },
} as const
```

RadioButton 变体是 RadioGroup 内的按钮样式变体，必须在 RadioGroup 内使用：

```ts
const group = inject(radioGroupInjectionKey)
if (!group) {
  throw new Error('[UiRadioButton] must be used inside <UiRadioGroup>')
}
```

### 6.5 Switch Props

```ts
export const switchProps = {
  modelValue: { type: [Boolean, String, Number] as PropType<boolean | string | number>, default: false },
  disabled: { type: Boolean, default: false },
  size: { type: String as PropType<ComponentSize> },
  loading: { type: Boolean, default: false },
  activeValue: { type: [Boolean, String, Number], default: true },
  inactiveValue: { type: [Boolean, String, Number], default: false },
  activeText: { type: String },
  inactiveText: { type: String },
  activeIcon: { type: [String, Object] as PropType<string | Component> },
  inactiveIcon: { type: [String, Object] as PropType<string | Component> },
  inlinePrompt: { type: Boolean, default: false },
  beforeChange: { type: Function as PropType<(newVal: boolean | string | number) => boolean | Promise<boolean>> },
} as const
```

### 6.6 Switch beforeChange 设计

```ts
async function handleChange() {
  if (props.disabled || props.loading) return

  const newVal = isChecked.value ? props.inactiveValue : props.activeValue

  if (props.beforeChange) {
    loading.value = true
    try {
      const canChange = await props.beforeChange(newVal)
      if (canChange === false) return
    } finally {
      loading.value = false
    }
  }

  emit('update:modelValue', newVal)
  emit('change', newVal)
  formItem?.validate('change')
}
```

### 6.7 样式设计

Checkbox / Radio 的原生 input 隐藏 + 自定义指示器：

```scss
@include b(checkbox) {
  display: inline-flex;
  align-items: center;
  cursor: pointer;

  @include e(original) {
    opacity: 0;
    outline: none;
    position: absolute;
    width: 0;
    height: 0;
    margin: 0;
    z-index: -1;
  }

  @include e(inner) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--ui-checkbox-size, 14px);
    height: var(--ui-checkbox-size, 14px);
    border: 1px solid var(--ui-checkbox-border-color, var(--ui-color-border));
    border-radius: var(--ui-checkbox-border-radius, 2px);
    background-color: var(--ui-checkbox-bg-color, var(--ui-color-white));
    transition: all var(--ui-transition-duration);

    @include when(checked) {
      background-color: var(--ui-checkbox-checked-bg-color, var(--ui-color-primary));
      border-color: var(--ui-checkbox-checked-border-color, var(--ui-color-primary));
    }

    @include when(indeterminate) {
      background-color: var(--ui-checkbox-checked-bg-color, var(--ui-color-primary));
      border-color: var(--ui-checkbox-checked-border-color, var(--ui-color-primary));
    }
  }
}
```

Switch 滑块动画：

```scss
@include b(switch) {
  display: inline-flex;
  align-items: center;
  height: var(--ui-switch-height, 20px);
  border-radius: var(--ui-switch-height, 20px);
  background-color: var(--ui-switch-off-color, var(--ui-color-text-placeholder));
  transition: background-color var(--ui-transition-duration);
  cursor: pointer;

  @include when(active) {
    background-color: var(--ui-switch-on-color, var(--ui-color-primary));
  }

  @include e(core) {
    width: var(--ui-switch-core-size, 16px);
    height: var(--ui-switch-core-size, 16px);
    border-radius: 50%;
    background-color: var(--ui-switch-core-bg-color, var(--ui-color-white));
    transition: transform var(--ui-transition-duration);
    transform: translateX(2px);

    .#{$namespace}-switch.is-active & {
      transform: translateX(calc(var(--ui-switch-width, 40px) - var(--ui-switch-core-size, 16px) - 2px));
    }
  }
}
```

### 6.8 共享 Component Token 模式

三个二态控件的选中态统一引用 primary 色：

```ts
{
  'checkbox-checked-bg-color': { value: '{color.primary}' },
  'radio-checked-bg-color': { value: '{color.primary}' },
  'switch-on-color': { value: '{color.primary}' },

  'checkbox-disabled-checked-bg-color': { value: '{color.primary.light-5}' },
  'radio-disabled-checked-bg-color': { value: '{color.primary.light-5}' },
  'switch-disabled-on-color': { value: '{color.primary.light-5}' },
}
```

---

## 7. InputNumber 详细设计

### 7.1 Props

```ts
export const inputNumberProps = {
  modelValue: { type: Number },
  size: { type: String as PropType<ComponentSize> },
  disabled: { type: Boolean, default: false },
  status: { type: String as PropType<'' | 'success' | 'error' | 'warning'>, default: '' },
  min: { type: Number, default: -Infinity },
  max: { type: Number, default: Infinity },
  step: { type: Number, default: 1 },
  stepStrictly: { type: Boolean, default: false },
  precision: { type: Number },
  controls: { type: Boolean, default: true },
  controlsPosition: { type: String as PropType<'around' | 'right'>, default: 'around' },
} as const
```

### 7.2 精度与边界控制

```ts
export function useInputNumber(props: InputNumberProps, emit: any) {
  const { disabled, validateState } = useFormItem({
    size: toRef(props, 'size'),
    disabled: toRef(props, 'disabled'),
  })

  const { isComposing, handleCompositionStart, handleCompositionEnd } = useComposition()

  const _precision = computed(() => {
    if (props.precision !== undefined) return props.precision
    const stepString = String(props.step)
    const dotIndex = stepString.indexOf('.')
    return dotIndex > -1 ? stepString.length - dotIndex - 1 : 0
  })

  function toPrecision(value: number): number {
    if (_precision.value === 0) return Math.round(value)
    return Number(Number(value).toFixed(_precision.value))
  }

  function enforceStepStrictly(value: number): number {
    const steps = Math.round(value / props.step)
    return toPrecision(steps * props.step)
  }

  function clamp(value: number): number {
    let clamped = Math.min(props.max, Math.max(props.min, value))
    if (props.stepStrictly) clamped = enforceStepStrictly(clamped)
    return toPrecision(clamped)
  }

  const isMinDisabled = computed(() =>
    props.disabled || (props.modelValue ?? 0) <= props.min
  )
  const isMaxDisabled = computed(() =>
    props.disabled || (props.modelValue ?? 0) >= props.max
  )

  function increase() {
    if (isMaxDisabled.value) return
    const newVal = clamp((props.modelValue ?? 0) + props.step)
    emit('update:modelValue', newVal)
    emit('change', newVal)
    formItem?.validate('change')
  }

  function decrease() {
    if (isMinDisabled.value) return
    const newVal = clamp((props.modelValue ?? 0) - props.step)
    emit('update:modelValue', newVal)
    emit('change', newVal)
    formItem?.validate('change')
  }

  // 手动输入处理
  const inputValue = ref(String(props.modelValue ?? ''))
  let userInput = false

  watch(() => props.modelValue, (val) => {
    if (!userInput) {
      inputValue.value = val !== undefined ? String(val) : ''
    }
  })

  function handleInput(event: Event) {
    if (isComposing.value) return
    userInput = true
    const raw = (event.target as HTMLInputElement).value
    inputValue.value = raw
    if (raw === '' || raw === '-' || raw === '.' || raw.endsWith('.')) return
    const parsed = Number(raw)
    if (!isNaN(parsed)) {
      const clamped = clamp(parsed)
      emit('update:modelValue', clamped)
    }
  }

  function handleBlur() {
    userInput = false
    const val = props.modelValue
    if (val !== undefined) {
      const formatted = clamp(val)
      inputValue.value = String(formatted)
      if (formatted !== val) {
        emit('update:modelValue', formatted)
        emit('change', formatted)
      }
    }
    formItem?.validate('blur')
  }

  // 长按加速
  let holdTimer: ReturnType<typeof setInterval> | null = null
  function handleButtonDown(type: 'increase' | 'decrease') {
    const action = type === 'increase' ? increase : decrease
    action()
    holdTimer = setInterval(action, 150)
  }
  function handleButtonUp() {
    if (holdTimer) {
      clearInterval(holdTimer)
      holdTimer = null
    }
  }

  return {
    _precision, inputValue, isMinDisabled, isMaxDisabled,
    increase, decrease, handleInput, handleBlur,
    handleButtonDown, handleButtonUp,
  }
}
```

设计决策：

| 决策点 | 选择 | 理由 |
|--------|------|------|
| 允许输入中间态 | `"-"`, `"1."` 不触发更新 | 用户输入小数过程中会经历 `1` → `1.` → `1.5`，如果 `1.` 时强制格式化会变成 `1` |
| 失焦时格式化 | blur 时 toPrecision + clamp | 输入过程中容错，离开时纠正 |
| 长按加速 | setInterval 150ms | 连续调整数值的企业场景，按住按钮应持续增减 |
| 不用原生 input type=number | 自行控制 | 原生 number input 的滚轮行为、精度处理在不同浏览器不一致 |

---

## 8. _shared 目录与跨组件复用

### 8.1 目录结构

```txt
packages/components/_shared/
├─ use-clearable.ts
├─ use-input-common.ts
├─ use-composition.ts
├─ use-cursor.ts
├─ use-word-limit.ts
├─ context.ts
└─ index.ts
```

### 8.2 useInputCommon

```ts
// packages/components/_shared/use-input-common.ts

import { computed, onMounted, onBeforeUnmount, type Ref } from 'vue'
import { useFormItem, useId } from '@company/ui-hooks'
import type { InputFieldProps } from '@company/ui-core'

export function useInputCommon(props: InputFieldProps) {
  const { size, disabled, validateState, formItem } = useFormItem({
    size: toRef(props, 'size'),
    disabled: toRef(props, 'disabled'),
  })

  const inputId = useId()

  const statusClass = computed(() => {
    const state = validateState.value
    if (state === 'error' || props.status === 'error') return 'is-error'
    if (state === 'success' || props.status === 'success') return 'is-success'
    if (state === 'warning' || props.status === 'warning') return 'is-warning'
    if (state === 'validating') return 'is-validating'
    return ''
  })

  onMounted(() => formItem?.addInputId(inputId.id.value))
  onBeforeUnmount(() => formItem?.removeInputId(inputId.id.value))

  return {
    _size: size,
    _disabled: disabled,
    validateState,
    formItem,
    inputId,
    statusClass,
  }
}
```

### 8.3 _shared 的依赖约束

```
@company/ui-components/_shared 允许依赖:
  ├── @company/ui-core        ✅ 类型、协议
  ├── @company/ui-hooks        ✅ useFormItem、useNamespace、useId
  ├── @company/ui-utils        ✅ DOM 工具
  ├── @company/ui-icons        ✅ 图标组件
  └── vue (通过组件包间接)

@company/ui-components/_shared 禁止依赖:
  ├── 具体组件实现             ❌ _shared 不能 import input.vue
  ├── @company/ui-vue         ❌ 不依赖 Adapter
  └── @company/ui-directives  ❌ 不依赖指令
```

---

## 9. ARIA 无障碍属性规格

每个输入组件必须满足 WCAG 2.1 AA 级要求：

| 组件 | role | aria-* 属性 | 说明 |
|------|------|-------------|------|
| Input | 无（原生 `<input>`） | `aria-label` / `aria-labelledby`、`aria-describedby`、`aria-invalid`（status=error 时）、`aria-required` | 原生 input 已具隐式角色 |
| Textarea | 无（原生 `<textarea>`） | 同 Input | |
| InputNumber | `spinbutton` | `aria-valuemin`、`aria-valuemax`、`aria-valuenow`、`aria-valuetext`（格式化显示值） | 步进按钮需 `aria-hidden` + 键盘可达 |
| Select | `combobox`（输入框）、`listbox`（下拉面板）、`option`（选项） | `aria-expanded`、`aria-activedescendant`、`aria-controls`、`aria-autocomplete` | filterable 时 `aria-autocomplete="list"` |
| Checkbox | `checkbox` | `aria-checked`（true/false/mixed）、`aria-disabled` | indeterminate 时 `aria-checked="mixed"` |
| CheckboxGroup | `group` | `aria-labelledby`（指向 Group label） | |
| Radio | `radio` | `aria-checked`、`aria-disabled` | |
| RadioGroup | `radiogroup` | `aria-labelledby`、`aria-activedescendant`（键盘导航时） | 方向键在组内切换 |
| Switch | `switch` | `aria-checked`、`aria-disabled` | 不使用 `role="checkbox"`，switch 语义更准确 |

通用规则：
- `aria-invalid="true"` 在 `status === 'error'` 或 `validateState === 'error'` 时自动设置
- `aria-describedby` 指向 FormItem 的错误消息 DOM
- `name` prop 传递给原生 `<input>` 的 `name` 属性，用于表单提交和无障碍标识

---

## 10. 依赖约束

### 10.1 输入组件的依赖关系

```
Input / InputNumber / Select / Checkbox / Radio / Switch
  ├── @company/ui-core          (公共类型、InputBaseProps/InputFieldProps)
  ├── @company/ui-hooks         (useFormItem、useNamespace、useId、useZIndex、useOverlay*、usePosition)
  ├── @company/ui-components/_shared  (useInputCommon、useClearable、useComposition)
  ├── @company/ui-icons         (图标)
  ├── @company/ui-theme         (CSS Variables、Component Token)
  └── @company/ui-utils         (DOM 工具)

Select 额外依赖:
  └── overlay hooks             (usePosition、useClickOutside、useEscapeKey、useOverlayManager)
```

### 10.2 禁止的依赖

| 规则 | 违规示例 | 正确做法 |
|------|---------|---------|
| 输入组件不依赖 Form | `import { UiForm } from '@company/ui-components/form'` | 输入组件通过 useFormItem 可选消费 |
| 输入组件不互相依赖 | `import UiInput from '../input'` | 共享逻辑抽到 _shared |
| Select 不依赖 Table | `import { UiTable } from '@company/ui-components/table'` | 无关联 |
| Checkbox 不依赖 Select | `import UiSelect from '../select'` | 无关联 |

---

## 11. 第一阶段落地步骤

```
Step 1: 在 @company/ui-core 中定义公共协议
  - InputBaseProps / InputFieldProps / InputCommonEmits 类型
  - OverlayType 类型

Step 2: 创建 _shared 目录
  - useInputCommon、useClearable、useComposition、useCursor、useWordLimit

Step 3: 实现 Input
  - 基础 input + textarea + password
  - prefix/suffix、clearable、showPassword、maxlength/wordLimit
  - autosize（textarea）
  - IME 组合输入处理
  - 样式 + Component Token
  - 单元测试 + 集成测试（与 Form 协作）

Step 4: 实现 Checkbox + CheckboxGroup
  - 独立模式 + Group 模式
  - indeterminate 半选
  - border 变体
  - 样式 + Component Token
  - 单元测试

Step 5: 实现 Radio + RadioGroup + RadioButton
  - Group 上下文
  - Button 变体
  - 样式 + Component Token
  - 单元测试

Step 6: 实现 Switch
  - activeValue/inactiveValue
  - activeText/inactiveText + inlinePrompt
  - beforeChange 异步拦截
  - loading 状态
  - 样式 + Component Token
  - 单元测试

Step 7: 实现 InputNumber
  - 精度控制、边界钳制、stepStrictly
  - 长按加速
  - controlsPosition 布局
  - 样式 + Component Token
  - 单元测试

Step 8: 实现 Select
  - 单选 + 多选
  - 选项注册机制 + UiOption / UiOptionGroup
  - filterable 可搜索
  - remote 远程搜索
  - allowCreate 创建选项
  - 键盘导航
  - 多选标签 + 折叠
  - Overlay hooks 集成
  - 样式 + Component Token
  - 单元测试 + 集成测试

Step 9: 验证与 Form 的完整闭环
  - Form + FormItem + Input/Select/Checkbox 全流程
  - 校验触发、状态联动、disabled/size 注入
  - ARIA 关联
```

---

## 12. 第一阶段验收标准

| 维度 | 标准 |
|------|------|
| 组件完整性 | Input + InputNumber + Select + Checkbox + Radio + Switch 共 6 个组件（含 Group 变体） |
| 公共协议 | InputBaseProps/InputFieldProps/Emits 在 core 中定义，6 个组件全部实现 |
| Form 闭环 | 每个输入组件都能在 Form/FormItem 中正确工作：校验触发、状态联动、disabled/size 继承 |
| _shared 复用 | useInputCommon、useClearable 至少被 2 个以上组件使用 |
| ARIA | 每个输入组件注册 inputId，aria-invalid / aria-describedby 正确关联 |
| IME | Input 正确处理中文/日文/韩文组合输入 |
| 键盘 | Select 支持上下箭头/Enter/Escape 键盘导航 |
| 样式 | 每个组件有 Component Token，换主题时视觉一致 |
| 测试 | 每个组件至少覆盖：基础渲染、v-model、Form 协作、disabled/size 继承 |

---

## 13. 常见设计陷阱

| 陷阱 | 描述 | 规避 |
|------|------|------|
| **Input 直接 import Form** | 导致循环依赖 | 通过 useFormItem hook 可选消费 |
| **Select 遍历 children 查找选项** | 动态/条件渲染的选项可能漏掉 | 选项注册表模式，选项自行注册 |
| **多选 Select 直接存 label** | `v-model` 应存 value 而非 label | modelValue 始终存 value，展示用 label |
| **CheckboxGroup min/max 不生效** | 超过 max 时仍可选中 | 在 _disabled computed 中判断 max 限制 |
| **InputNumber 原生 type=number** | 浏览器行为不一致 | 使用 type=text + 自行解析 |
| **InputNumber 输入中强制格式化** | 输入 `1.` 时被格式化为 `1` | 允许中间态，失焦时才格式化 |
| **Switch beforeChange 不等 Promise** | 异步操作未完成就切换状态 | await beforeChange，返回 false 不更新 |
| **IME 输入拼音字母直接显示** | 中文输入时每个按键都更新 modelValue | compositionstart/end 标记组合状态 |

---

## 14. 七维度总结

| 维度 | 要点 |
|------|------|
| **架构分层** | 输入组件位于 components 层，通过 _shared 抽取跨组件逻辑，通过 hooks（useFormItem）与 Form 解耦 |
| **模块划分** | 6 个第一阶段组件 + _shared 公共逻辑 + core 公共协议；Select 是最复杂模块，拆分 5 个子组件 |
| **依赖关系** | 输入组件 → _shared + hooks + core + icons + theme + utils；输入组件之间互不依赖；输入组件不依赖 Form |
| **设计模式** | 公共协议模式（InputBaseProps/InputFieldProps）、选项注册表模式（Select）、上下文注入模式（CheckboxGroup/RadioGroup）、异步拦截模式（Switch beforeChange）、IME 组合模式（Input） |
| **潜在陷阱** | 循环依赖、选项注册遗漏、多选 value/label 混淆、输入中间态格式化、IME 处理缺失 |
| **最佳实践** | 公共协议在 core 定义；共享逻辑在 _shared 复用；Select 用注册表不用 DOM 查找；InputNumber 用 text + 自行解析；所有输入组件统一接入 useFormItem |
| **学习思考** | Element Plus 将 Checkbox/Radio/Switch 各自独立包，我们通过 _shared + 公共协议减少重复；Select 的注册表模式比 DOM 遍历更可靠；公共协议让 Form 不需要知道具体输入组件类型——这是"协议驱动"而非"实现驱动"的核心思想 |

---

## 附录：Review 修复记录

### Critical 修复

**C1: ComponentSize 统一为 `'small' | 'medium' | 'large'`**

父架构定义 `ComponentSize = 'small' | 'medium' | 'large'`。本规范中 CSS 修饰符已统一为 `m(medium)`。与 Element Plus 的 `'default'` 不同，我们选择 `'medium'` 以与父架构保持一致。hooks 规范中 `useFormItem` / `useSize` 的 fallback 值需同步更新为 `'medium'`。

**C2: status 与 FormValidateState 语义对齐**

`InputCommonProps.status` 支持 `'warning'`，而 `FormValidateState` 只有 `'' | 'success' | 'error' | 'validating'`。`status` 是组件级命令式覆盖，`validateState` 是 Form 校验结果——两者来源不同、值域不同，这是设计意图而非缺陷。`status='warning'` 用于开发者手动标记输入异常（如"密码强度不足"），无需 Form 校验触发。

**C3: useFormItem 签名对齐**

hooks 规范中 `useFormItem` 的参数签名需更新为接受 `Ref` 类型，以支持响应式优先级链：

```ts
export function useFormItem(props: {
  size?: Ref<ComponentSize | undefined>
  disabled?: Ref<boolean | undefined>
}): UseFormItemReturn
```

内部 computed 使用 `unref()` 解包。本规范中所有 `toRef(props, 'size')` 调用与此签名一致。

### Major 修复 ✅ 已全部同步到正文

**M4: useClearable 不再直接修改 modelValue** ✅

`handleClear` 改为回调模式——不再提供 handleClear，由各组件自行实现 `emit('update:modelValue', '')` + `emit('clear')`，保持单向数据流。

**M5: useInputCommon 不硬编码 namespace** ✅

移除 `ns` 返回值。各组件自行 `const ns = useNamespace('select')` 并只从 useInputCommon 获取 size/disabled/validateState/formItem/inputId/statusClass。

**M6: OverlayEntry.type 统一定义在 core** ✅

在 `@company/ui-core` 中定义 `type OverlayType = 'modal' | 'anchor' | 'feedback'`，hooks 规范和本规范统一引用。

**M7: _shared 与 _internal 的边界**

- `_internal`：跨组件共享的**渲染原语**（如 OverlayManager、Popper 组件、Trigger 组件）
- `_shared`：输入组件间共享的 **composable 逻辑**（如 useClearable、useComposition），不是组件

**M8: handleDeleteBackward 修复** ✅

```ts
const removed = values.pop()
emit('remove-tag', removed)
```

### Minor 修复要点

- **m9** InputCommonProps 改为泛型 `InputCommonProps<T = unknown>`，各组件传入具体类型 ✅ 已同步
- **m10** autosize 添加 onMounted 触发 + useResizeObserver 监听容器宽度 ✅ 已同步
- **m11** parseInt NaN fallback：lineHeight 为 NaN 时用 `parseFloat(fontSize) * 1.2` ✅ 已同步
- **m12** InputCommonProps 拆为 InputBaseProps（modelValue/size/disabled/readonly/name）+ InputFieldProps（增加 clearable/status/placeholder/prefixIcon/suffixIcon）✅ 已同步
- **m13** Switch beforeChange 签名改为 `(newVal: boolean | string | number) => boolean | Promise<boolean>` ✅ 已同步
- **m14** InputNumber 复用 _shared/useComposition 处理 IME ✅ 已同步
- **m15** Select options prop 添加 watch 同步注册表 ✅ 已同步
- **m16** InputBaseProps 添加 `name?: string` ✅ 已同步
- **m18** collapseTagsTooltip 改为 `Boolean, default: true` ✅ 已同步
- **m19** checkboxGroupInjectionKey / radioGroupInjectionKey 留在组件内部，不放入 core ✅ 已同步
- **m20** 各组件补充 ARIA 属性规格 ✅ 已同步
