export * from './color';
export * from './size';

/**
 * 通用 Token 字典 — 用于 Component 层（混合颜色+尺寸的 Token 集合）
 *
 * 与 ColorTokenMap / SizeTokenMap 结构相同，语义上表示
 * "这是一个 Token 字典，不区分颜色还是尺寸"。
 * 适合组件级 Token，因为组件 Token 通常是颜色和尺寸的并集。
 */
export type TokenMap = Readonly<Record<string, string>>;
