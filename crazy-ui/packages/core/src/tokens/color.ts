/**
 * Color Token Type System
 *
 * 三层架构的类型层（Layer 1）— 定义颜色的类型契约。
 * Layer 2（theme 包）提供符合这些类型的值，
 * Layer 3（CSS 变量）将值注入浏览器运行时。
 *
 * 设计决策：用 flat key 而非 nested object
 *   - flat key（如 `blue500`）比 nested（如 `blue[500]`）
 *     在 CSS 变量映射和按需引用时更直接
 *   - 不需要运行时解构，Tree-shaking 粒度更细
 */

/** CSS 颜色值 — hex、rgb()、hsl()、var() 等 */
export type ColorToken = string;

/**
 * 不可变的 Token 字典：名称 → 颜色值
 *
 * 为什么是 Record 而非 Map：
 *   - TS 对 Record 的字面量推断更好，`as const` 可以保留精确值类型
 *   - JSON 序列化友好（主题可能需要 SSR/持久化）
 *   - Tree-shaking 可以直接消除未使用的 key
 */
export type ColorTokenMap = Readonly<Record<string, ColorToken>>;

/**
 * 语义色角色 — 描述一个功能性颜色所需的所有交互态
 *
 * 这是架构中重要的抽象模式：所有语义色（primary/success/warning/danger）
 * 共享同样的 5 态结构，保证设计一致性和组件消费的统一性。
 *
 * 5 态来源：Ant Design / Arco Design 的实践证明这是最小完备集合
 *   - base: 默认态
 *   - hover: 悬停态
 *   - active: 按下态
 *   - bg: 浅底色（用于选中背景、tag 背景等）
 *   - border: 边框色（用于 outline 变体、输入框聚焦边框等）
 */
export interface ColorRole {
  readonly base: ColorToken;
  readonly hover: ColorToken;
  readonly active: ColorToken;
  readonly bg: ColorToken;
  readonly border: ColorToken;
}
