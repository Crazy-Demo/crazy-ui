/**
 * Primitive Tokens - 原始设计值（Layer 2: 值层）
 *
 * 设计系统最底层，定义原始色板和尺寸表。
 * 不表达业务语义，只提供基础值供 semantic 层引用。
 *
 * 类型约束来自 @crazy-ui/core（Layer 1: 类型层）
 * CSS 变量映射在 style/variables.css（Layer 3: 运行时层）
 */

import type { ColorTokenMap, SizeTokenMap } from '@crazy-ui/core';

// ============ Color Primitives ============
export const colorPrimitives: ColorTokenMap = {
  // Blue
  blue50: '#e6f4ff',
  blue100: '#bae0ff',
  blue200: '#91caff',
  blue300: '#69b1ff',
  blue400: '#4096ff',
  blue500: '#1677ff',
  blue600: '#0958d9',
  blue700: '#003eb3',
  blue800: '#002c8c',
  blue900: '#001d66',

  // Green
  green50: '#f6ffed',
  green100: '#d9f7be',
  green200: '#b7eb8f',
  green300: '#95de64',
  green400: '#73d13d',
  green500: '#52c41a',
  green600: '#389e0d',
  green700: '#237804',
  green800: '#135200',
  green900: '#092b00',

  // Red
  red50: '#fff1f0',
  red100: '#ffccc7',
  red200: '#ffa39e',
  red300: '#ff7875',
  red400: '#ff4d4f',
  red500: '#f5222d',
  red600: '#cf1322',
  red700: '#a8071a',
  red800: '#820014',
  red900: '#5c0011',

  // Orange
  orange50: '#fff7e6',
  orange100: '#ffe7ba',
  orange200: '#ffd591',
  orange300: '#ffc069',
  orange400: '#ffa940',
  orange500: '#fa8c16',
  orange600: '#d46b08',
  orange700: '#ad4e00',
  orange800: '#873800',
  orange900: '#612500',

  // Gray
  gray50: '#fafafa',
  gray100: '#f5f5f5',
  gray200: '#e8e8e8',
  gray300: '#d9d9d9',
  gray400: '#bfbfbf',
  gray500: '#8c8c8c',
  gray600: '#595959',
  gray700: '#434343',
  gray800: '#262626',
  gray900: '#1f1f1f',
  gray950: '#141414',
} as const;

// ============ Size Primitives ============
export const sizePrimitives: SizeTokenMap = {
  // Spacing
  spacing0: '0px',
  spacing1: '4px',
  spacing2: '8px',
  spacing3: '12px',
  spacing4: '16px',
  spacing5: '20px',
  spacing6: '24px',
  spacing8: '32px',
  spacing10: '40px',
  spacing12: '48px',
  spacing16: '64px',
  spacing20: '80px',
} as const;
