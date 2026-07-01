/**
 * Component Tokens - 组件级 Token（Layer 2: 值层）
 *
 * 直接服务具体组件，值通常派生自 semantic 层。
 * 适合做精细化主题定制 —— 覆盖某个组件的某个 token 不影响其他组件。
 *
 * 每新增一个组件，在此文件中追加对应的 Token 集合。
 */

import type { TokenMap } from '@crazy-ui/core';
import { semanticColors, semanticSizes } from './semantic';

// ============ Button Component Tokens ============
export const buttonTokens: TokenMap = {
  // Button Heights
  buttonHeightSmall: semanticSizes.heightSmall,
  buttonHeightMedium: semanticSizes.heightMedium,
  buttonHeightLarge: semanticSizes.heightLarge,

  // Button Padding
  buttonPaddingSmall: `0 ${semanticSizes.spacingSm}`,
  buttonPaddingMedium: `0 ${semanticSizes.spacingMd}`,
  buttonPaddingLarge: `0 ${semanticSizes.spacingLg}`,

  // Button Border Radius
  buttonBorderRadius: semanticSizes.radiusMedium,

  // Button Font Size
  buttonFontSizeSmall: '12px',
  buttonFontSizeMedium: '14px',
  buttonFontSizeLarge: '16px',

  // Primary Button
  buttonPrimaryBg: semanticColors.colorPrimary,
  buttonPrimaryBgHover: semanticColors.colorPrimaryHover,
  buttonPrimaryBgActive: semanticColors.colorPrimaryActive,
  buttonPrimaryText: '#ffffff',
  buttonPrimaryBorder: semanticColors.colorPrimary,

  // Success Button
  buttonSuccessBg: semanticColors.colorSuccess,
  buttonSuccessBgHover: semanticColors.colorSuccessHover,
  buttonSuccessBgActive: semanticColors.colorSuccessActive,
  buttonSuccessText: '#ffffff',
  buttonSuccessBorder: semanticColors.colorSuccess,

  // Warning Button
  buttonWarningBg: semanticColors.colorWarning,
  buttonWarningBgHover: semanticColors.colorWarningHover,
  buttonWarningBgActive: semanticColors.colorWarningActive,
  buttonWarningText: '#ffffff',
  buttonWarningBorder: semanticColors.colorWarning,

  // Danger Button
  buttonDangerBg: semanticColors.colorDanger,
  buttonDangerBgHover: semanticColors.colorDangerHover,
  buttonDangerBgActive: semanticColors.colorDangerActive,
  buttonDangerText: '#ffffff',
  buttonDangerBorder: semanticColors.colorDanger,

  // Disabled Button
  buttonDisabledBg: semanticColors.colorBgDisabled,
  buttonDisabledText: semanticColors.colorTextDisabled,
  buttonDisabledBorder: semanticColors.colorBorder,

  // ============ Input Component Tokens ============
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
