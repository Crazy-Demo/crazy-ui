/**
 * Size Token Type System
 *
 * 三层架构的类型层（Layer 1）— 定义尺寸/间距的类型契约。
 * 与 color token 设计理念一致：flat key、as const 推断、按需引用。
 */

/** CSS 尺寸值 — px、rem、em、% 等 */
export type SizeToken = string;

/** 不可变的 Token 字典：名称 → 尺寸值 */
export type SizeTokenMap = Readonly<Record<string, SizeToken>>;

/**
 * 组件尺寸预设 — 对应 ComponentSize 类型的三个档位
 *
 * 每个组件都有 small/medium/large 三个尺寸变体，
 * 此类型用于约束组件 Token 中尺寸相关部分的结构。
 *
 * 映射关系：
 *   ComponentSize = 'small' | 'medium' | 'large'  ← 类型
 *   SizePreset = { small: T, medium: T, large: T }  ← 值
 */
export type SizePreset<T = SizeToken> = Readonly<{
  small: T;
  medium: T;
  large: T;
}>;
