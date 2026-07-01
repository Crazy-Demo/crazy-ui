# Input 批次实施设计

日期：2026-06-30
范围：3 context hooks + 3 _shared composables + Input 组件
上级 Spec：[Hooks 体系设计](./2026-05-10-hooks-system-design.md) | [输入组件体系设计](./2026-05-11-input-components-system-design.md)

---

## 1. 目标

在 Button 闭环基础上，推进第二个组件批次——Input。本批次完成后，Input 可在 playground 中独立演示（含 textarea、密码切换、清除、字数统计）。

## 2. 范围边界

**包含：**
- 3 个 context hooks：`useZIndex`、`useLocale`、`useSize`
- 4 个 `_shared` composables：`useInputCommon`、`useClearable`、`useComposition`、`useWordLimit`
- 1 个组件：`Input`（含 textarea/password 变体、autosize、prefix/suffix/clearable/showWordLimit）
- Input Component Token + CSS 样式
- Input 单元测试

**不包含：**
- overlay hooks、dom hooks（后续批次）
- Form/FormItem 组件（Input 通过 useFormItem 可选消费，Form 未实现也不影响独立演示）
- InputNumber、Select、Checkbox 等其他输入组件
- SCSS mixins（继续用 CSS Variables + 手写类名，与 Button 风格一致）

## 3. 文件清单

```
packages/hooks/src/context/
  use-z-index/use-z-index.ts + index.ts
  use-locale/use-locale.ts + index.ts
  use-size/use-size.ts + index.ts
  index.ts               # 追加 3 个新 hook 的导出

packages/components/_shared/             # ← 新建目录
  use-input-common.ts    # FormItem 消费 + statusClass + inputId 注册
  use-clearable.ts       # 清除按钮显示逻辑
  use-composition.ts     # IME 组合输入处理
  use-word-limit.ts      # 字数统计 + isExceed

packages/components/input/
  src/input.vue
  src/use-autosize.ts
  src/types.ts
  src/index.ts
  style/index.css
  style/token.ts
  __tests__/input.test.ts
  index.ts
```

## 4. 依赖关系

```
Input 组件
  ├── useInputCommon (_shared) → useFormItem + useId (已有)
  ├── useClearable (_shared)
  ├── useComposition (_shared)
  ├── useNamespace (已有)
  └── useZIndex / useLocale / useSize (本批次新增)

hooks 不依赖 components
_shared 不依赖具体组件实现
Input 不依赖 Form 组件
```

## 5. 关键设计决策

沿用已有 spec（hooks 体系 + 输入组件体系）中的所有决策，无需重新讨论：

| 决策点 | 选择 |
|--------|------|
| textarea | 不独立组件，`type='textarea'` 变体 |
| useClearable | 回调模式（返回 showClear），不直接操作 modelValue |
| IME 处理 | compositionstart/end 标记，组合中不更新 modelValue |
| 样式方案 | CSS Variables + Component Token，与 Button 一致 |
| injectionKey | 全部从 @crazy-ui/core import |
| useFormItem | 可选消费，不在 Form 内也能正常工作 |
| useZIndex | inject/provide 模式，起始值 2000 |
| useLocale | t() 找不到 key 时返回 key 本身，不渲染空白 |
| useSize | computed 优先级：prop > formItem > inject > 'medium' |
| suffix icon 顺序 | 校验状态图标 → 清除图标 → 密码切换 → suffix slot（含 suffixIcon prop） |
| placeholder | 不使用 `t('ui.input.placeholder')`，直接以 props.placeholder 为准，无 prop 时为空 |
| type=number + maxlength | Input 的 `type='number'` 不支持原生 maxlength，此组合下 showWordLimit 不生效；纯数字输入请用 InputNumber |
| namespace 前缀 | 沿用代码库现有的 `'crazy'` 默认值（上游 spec 中的 `'ui'` 示例仅作参考） |

## 6. 与现有代码的关系

- 3 个新 hook 追加到 `hooks/src/context/`，在 `context/index.ts` 中导出
- `hooks/src/index.ts` 已导出 context 分类，无需改动
- `_shared` 是 components 内部目录，不对外导出。本批次需新建此目录及全部文件
- `_shared` 的 consumer 通过相对路径 import（如 `input/src/` → `../_shared/use-clearable`）
- Input 的 BEM class 使用 `useNamespace('input')` → `crazy-input` 前缀
- Input Component Token 追加到 `theme/src/tokens/component.ts`

## 7. 测试范围

Input 测试至少覆盖：
- 基础渲染（input/textarea 两种 type）
- v-model 双向绑定
- disabled/readonly 状态
- clearable 清除行为
- password 切换可见性
- showWordLimit 字数统计
- IME 组合输入（中文输入不触发中间态更新）
- prefix/suffix slot 渲染
- size 尺寸 class
- status/validateState 错误态
- wordLimit 超限态（isExceed class + 红色计数器）
- 密码切换按钮 ARIA（role="button" + aria-label）

## 8. 验收标准

- [ ] 3 个 context hook 单元测试通过
- [ ] 4 个 _shared composable 可被 Input 正常调用
- [ ] Input 在 playground 中可独立演示（不依赖 Form）
- [ ] CSS 变量全部来自 theme token，无硬编码颜色值
- [ ] 文件结构与 Button 保持一致
