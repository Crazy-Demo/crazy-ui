# Crazy UI 第一阶段架构落地步骤

日期：2026-05-18  
方向：框架无关核心 + Vue 3 组件实现  
目标：先打通一个企业级 UI 组件库的最小闭环，而不是一次性堆很多组件。

---

## 1. 当前阶段定位

`crazy-ui` 当前已经具备基础 Monorepo 雏形：

- `pnpm workspace`
- `turbo`
- `typescript`
- `vitest`
- `packages/core`

但它还没有形成完整组件库闭环：

- 包职责边界还不清晰
- token / theme 体系还未建立
- components 层还未拆出
- 构建与导出规范还未打通
- 测试与文档演示还未形成标准

因此第一阶段不要追求组件数量，而要追求：

> 一个组件从 API 设计、token 设计、Vue 实现、样式、导出、构建、测试到演示的完整闭环。

---

## 2. 第一阶段推荐总路线

选择方案：**框架无关核心 + Vue 3 实现**。

含义：

- `core` 和 `theme` 尽量保持框架无关
- `components` 第一阶段先使用 Vue 3 实现
- 暂时不做 React / Web Components，但保留未来扩展边界

推荐阶段目标：

```text
packages/core
packages/theme
packages/components
Button 组件
构建闭环
测试闭环
导出闭环
最小演示闭环
```

---

## 3. 阶段一：重新明确包边界

第一阶段建议形成三个核心包：

```text
packages/
  core/
  theme/
  components/
```

### 3.1 core 包职责

`core` 是协议层，不是组件实现层。

负责：

- 公共类型
- 公共常量
- 上下文 key
- 与具体 UI 框架无关的协议定义

适合放在 `core` 的内容：

```text
ComponentSize
ComponentStatus
ComponentNamespace
CommonComponentProps
ConfigProviderContext 类型
```

不建议放在 `core` 的内容：

```text
ButtonProps
InputProps
具体组件实现
具体组件样式
Vue 组件代码
```

原因：

> `core` 应该是最稳定的底层协议。如果把具体组件 props 都塞进 core，core 会逐渐变成大杂烩。

---

### 3.2 theme 包职责

`theme` 负责设计系统的 token 与主题能力。

负责：

- primitive token
- semantic token
- component token
- CSS variables
- 主题扩展结构

第一阶段只需要优先覆盖：

```text
color
size
radius
```

不要一开始就铺满：

```text
motion
shadow
z-index
typography
breakpoint
```

这些可以后续补。

---

### 3.3 components 包职责

`components` 负责 Vue 3 组件实现。

负责：

- 组件 props
- 组件 emits
- 组件 slots
- 组件 Vue 实现
- 组件样式
- 组件测试
- 组件导出

第一阶段只做一个组件：

```text
Button
```

---

## 4. 阶段二：建立 token 分层模型

不要直接写死 CSS 值。先建立 token 分层。

推荐三层模型：

```text
Primitive Tokens
  ↓
Semantic Tokens
  ↓
Component Tokens
```

---

### 4.1 Primitive Tokens

原始设计值。

例如：

```text
blue-500
gray-100
red-500
spacing-4
radius-md
```

特点：

- 不直接表达业务语义
- 更接近设计系统底层色板和尺寸表
- 通常不直接在组件里使用

---

### 4.2 Semantic Tokens

语义化 token。

例如：

```text
color-primary
color-success
color-warning
color-danger
text-color
border-color
bg-color
```

特点：

- 表达 UI 语义
- 是主题切换和品牌定制的关键层
- 组件应优先依赖 semantic token，而不是 primitive token

---

### 4.3 Component Tokens

组件级 token。

例如：

```text
button-primary-bg
button-primary-text
button-border-radius
button-height-medium
input-border-color
```

特点：

- 直接服务具体组件
- 可以覆盖组件样式
- 适合做精细化主题定制

---

## 5. 阶段三：第一个组件选择 Button

虽然当前已有一些 Input 类型雏形，但第一阶段建议先做 Button。

原因：

- Button 复杂度低
- 但足以验证组件库完整工程链路
- 不会过早引入 Form、Validation、IME、Focus 等复杂问题

推荐组件推进顺序：

```text
Button → Input → Form → Select
```

不建议：

```text
Input → Form → Select → Button
```

因为 Input 会过早牵出复杂状态管理和表单上下文。

---

## 6. 阶段四：先设计 Button API 契约

在写 Vue 代码之前，先确定 Button 的 API。

推荐第一阶段 Button 能力：

```text
size
variant
color
disabled
loading
nativeType
```

建议概念区分：

```text
variant：视觉风格
color：语义色彩
size：尺寸
nativeType：原生 button type
```

推荐语义：

```text
variant:
  solid
  outline
  ghost
  text

color:
  primary
  success
  warning
  danger

size:
  small
  medium
  large

nativeType:
  button
  submit
  reset
```

设计动机：

- `variant` 不应该和 `color` 混在一起
- `danger` 更适合作为语义色彩，而不是组件状态
- `status` 更适合用于表单组件，例如 Input / Select / FormItem

---

## 7. 阶段五：设计组件目录规范

每个组件都应该有统一结构。

建议 Button 目录结构：

```text
packages/components/button/
  src/
    button.vue
    props.ts
    types.ts
  style/
    index.css
    token.ts
  tests/
    button.test.ts
  index.ts
```

职责说明：

```text
src/button.vue
  Vue 组件实现

src/props.ts
  props 契约定义

src/types.ts
  Button 相关类型

style/token.ts
  Button 组件级 token

style/index.css
  Button 样式实现

tests/button.test.ts
  Button 单元测试

index.ts
  Button 对外导出入口
```

原则：

> 每个组件都应该能被单独理解、单独测试、单独导出。

---

## 8. 阶段六：建立导出规范

企业级组件库必须提前考虑导出结构。

需要支持：

```ts
import { Button } from '@crazy-ui/components'
```

未来也应支持：

```ts
import Button from '@crazy-ui/components/button'
import '@crazy-ui/components/button/style'
```

因此需要设计：

```text
主入口导出
子路径导出
样式导出
类型导出
```

注意：

> 按需引入不是后期随便补的能力，组件目录结构和 package exports 一开始就要为它预留空间。

---

## 9. 阶段七：建立构建闭环

第一阶段构建目标不是复杂，而是可验证。

需要确保：

```text
源码可以编译
类型声明可以生成
ESM 产物可以生成
CJS 是否需要支持可以后续评估
样式文件可以输出
package exports 指向正确
```

建议第一阶段重点关注：

```text
ESM
类型声明
样式输出
子路径导出
```

CJS 可以暂时保留设计位置，但不一定优先投入。

原因：

> 现代 Vue 3 组件库主要消费场景通常是 Vite / ESM。CJS 兼容可以有，但不要让它拖慢第一阶段闭环。

---

## 10. 阶段八：建立测试闭环

Button 第一阶段至少测试：

```text
1. 能正常渲染
2. size class 正确
3. variant class 正确
4. color class 正确
5. disabled 生效
6. loading 生效
7. click 行为正确
```

测试目的不是追求覆盖率，而是建立组件库质量门槛。

测试关注点：

```text
组件 API 是否符合设计
DOM 输出是否符合预期
状态行为是否正确
事件行为是否正确
```

不建议第一阶段测试太多视觉细节。

---

## 11. 阶段九：建立最小演示闭环

不要一开始做完整文档站。

第一阶段只需要一个最小 playground 或 demo，用来验证：

```text
不同 size 的 Button
不同 variant 的 Button
不同 color 的 Button
disabled 状态
loading 状态
```

等 Button / Input 稳定后，再正式建设 docs。

推荐顺序：

```text
组件闭环先完成
再建设文档站
```

不要反过来。

---

## 12. 架构依赖关系

推荐依赖方向：

```text
core
  ↑
theme
  ↑
components
  ↑
docs / playground
```

更准确地说：

```text
components 可以依赖 core
components 可以依赖 theme
docs 可以依赖 components
theme 尽量不依赖 components
core 不依赖 components
a core 不依赖 theme
```

禁止方向：

```text
core → components
theme → components
components 之间随意互相依赖
```

学习重点：

> 包分层的核心不是目录好看，而是依赖方向稳定。

---

## 13. 第一阶段不要做的事情

暂时不要做：

```text
完整文档站
完整主题编辑器
React 版本
Web Components 版本
复杂 CLI
自动按需引入插件
大量组件并行开发
Form / Select / Table 等复杂组件
```

原因：

> 第一阶段目标是打通闭环，不是扩张版图。

---

## 14. 推荐执行顺序

建议严格按这个顺序推进：

```text
1. 明确 core / theme / components 包职责
2. 设计 token 三层模型
3. 设计 Button API 契约
4. 设计 Button 组件目录规范
5. 设计 components 包导出规范
6. 设计 theme 与 Button 的 token 映射关系
7. 补齐构建脚本和 package exports
8. 实现 Button 最小版本
9. 补 Button 单元测试
10. 建立最小 demo / playground
11. 总结 Button 组件开发规范
12. 再进入 Input 组件设计
```

---

## 15. 后续组件推进顺序

第一阶段完成 Button 后，推荐顺序：

```text
Button
Input
Icon
Form
Select
Checkbox
Radio
Switch
Dialog
Tooltip
Table
```

原因：

- Button 验证基础组件闭环
- Input 验证表单输入模型
- Icon 验证资源与按需加载
- Form 验证上下文与校验体系
- Select 验证复杂交互组件
- Dialog / Tooltip 验证浮层系统
- Table 验证大型复杂组件架构

---

## 16. 当前最重要的架构判断

第一阶段最重要的不是“写出 Button”，而是回答这些问题：

```text
1. core 的边界是否清晰？
2. theme 是否能支撑未来主题切换？
3. components 是否可以独立扩展？
4. Button 是否形成标准组件开发模板？
5. 构建产物是否适合组件库消费？
6. 导出结构是否支持未来按需引入？
7. 测试是否成为质量门槛？
```

如果这些问题没有回答清楚，即使写出很多组件，也只是 demo，不是组件库。

---

## 17. 第一阶段成功标准

当下面这些条件满足时，第一阶段可以认为成功：

```text
1. core / theme / components 三层职责清楚
2. Button API 契约稳定
3. Button 使用 theme token，而不是写死样式值
4. Button 可以被主入口导入
5. Button 可以被子路径导入
6. Button 类型声明可用
7. Button 样式可被正确引入
8. Button 有基础测试
9. Button 有最小演示
10. 后续组件可以复制 Button 的结构继续开发
```

---

## 18. 核心学习结论

组件库架构的第一步不是写组件，而是建立组件生产体系。

一个成熟组件库应该先有：

```text
稳定分层
清晰边界
统一 token
统一 API 设计语言
统一目录规范
统一导出规范
统一测试标准
```

然后才是组件数量增长。

当前 `crazy-ui` 下一步最推荐的主题是：

> 建立 `core + theme + components + Button` 的最小闭环。
