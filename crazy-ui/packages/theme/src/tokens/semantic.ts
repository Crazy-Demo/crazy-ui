/**
 * Semantic Tokens - 语义化 Token（Layer 2: 值层）
 *
 * 将 Primitive Token 映射为 UI 语义角色，
 * 是主题切换和品牌定制的关键层。
 *
 * 组件应优先依赖 semantic token，不直接引用 primitive，
 * 这样换主题只需改这一层的映射关系。
 */

import type { ColorTokenMap, SizeTokenMap } from '@crazy-ui/core';
import { colorPrimitives, sizePrimitives } from './primitive';

// ============ Semantic Colors ============
export const semanticColors: ColorTokenMap = {
  // Primary - 主色
  colorPrimary: colorPrimitives.blue500,
  colorPrimaryHover: colorPrimitives.blue400,
  colorPrimaryActive: colorPrimitives.blue600,
  colorPrimaryBg: colorPrimitives.blue50,
  colorPrimaryBorder: colorPrimitives.blue300,

  // Success - 成功色
  colorSuccess: colorPrimitives.green500,
  colorSuccessHover: colorPrimitives.green400,
  colorSuccessActive: colorPrimitives.green600,
  colorSuccessBg: colorPrimitives.green50,
  colorSuccessBorder: colorPrimitives.green300,

  // Warning - 警告色
  colorWarning: colorPrimitives.orange500,
  colorWarningHover: colorPrimitives.orange400,
  colorWarningActive: colorPrimitives.orange600,
  colorWarningBg: colorPrimitives.orange50,
  colorWarningBorder: colorPrimitives.orange300,

  // Danger - 危险色
  colorDanger: colorPrimitives.red500,
  colorDangerHover: colorPrimitives.red400,
  colorDangerActive: colorPrimitives.red600,
  colorDangerBg: colorPrimitives.red50,
  colorDangerBorder: colorPrimitives.red300,

  // Text - 文本色
  colorText: colorPrimitives.gray900,
  colorTextSecondary: colorPrimitives.gray600,
  colorTextTertiary: colorPrimitives.gray500,
  colorTextDisabled: colorPrimitives.gray400,

  // Background - 背景色
  colorBg: '#ffffff',
  colorBgSecondary: colorPrimitives.gray50,
  colorBgTertiary: colorPrimitives.gray100,
  colorBgDisabled: colorPrimitives.gray200,

  // Border - 边框色
  colorBorder: colorPrimitives.gray300,
  colorBorderSecondary: colorPrimitives.gray200,
} as const;

// ============ Semantic Sizes ============
export const semanticSizes: SizeTokenMap = {
  // Component Heights
  heightSmall: '24px',
  heightMedium: '32px',
  heightLarge: '40px',

  // Border Radius
  radiusSmall: '2px',
  radiusMedium: '4px',
  radiusLarge: '8px',

  // Spacing
  spacingXs: sizePrimitives.spacing1,
  spacingSm: sizePrimitives.spacing2,
  spacingMd: sizePrimitives.spacing4,
  spacingLg: sizePrimitives.spacing6,
  spacingXl: sizePrimitives.spacing8,
} as const;
