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
} as const;

// ============ Checkbox Component Tokens ============
export const checkboxTokens: TokenMap = {
  checkboxSize: '14px',
  checkboxBorderRadius: semanticSizes.radiusSmall,
  checkboxBorderColor: semanticColors.colorBorder,
  checkboxBgColor: semanticColors.colorBg,
  checkboxCheckedBgColor: semanticColors.colorPrimary,
  checkboxCheckedBorderColor: semanticColors.colorPrimary,
  checkboxDisabledBgColor: semanticColors.colorBgDisabled,
  checkboxDisabledBorderColor: semanticColors.colorBorder,
  checkboxDisabledTextColor: semanticColors.colorTextDisabled,
  checkboxCheckIconColor: '#ffffff',
  checkboxFontSize: '14px',
  checkboxFontSizeSmall: '12px',
  checkboxFontSizeMedium: '14px',
  checkboxFontSizeLarge: '16px',
  checkboxGap: '8px',
  checkboxGapSmall: '6px',
  checkboxGapMedium: '8px',
  checkboxGapLarge: '10px',
  checkboxBorderPadding: '5px 12px',
  checkboxGroupGap: '16px',
} as const;

// ============ Input Component Tokens ============
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

// ============ InputNumber Component Tokens ============
export const inputNumberTokens: TokenMap = {
  inputNumberHeightSmall: semanticSizes.heightSmall,
  inputNumberHeightMedium: semanticSizes.heightMedium,
  inputNumberHeightLarge: semanticSizes.heightLarge,
  inputNumberBorderColor: semanticColors.colorBorder,
  inputNumberFocusBorderColor: semanticColors.colorPrimary,
  inputNumberBorderRadius: semanticSizes.radiusMedium,
  inputNumberBgColor: semanticColors.colorBg,
  inputNumberDisabledBgColor: semanticColors.colorBgDisabled,
  inputNumberTextColor: semanticColors.colorText,
  inputNumberPlaceholderColor: semanticColors.colorTextDisabled,
  inputNumberDisabledTextColor: semanticColors.colorTextDisabled,
  inputNumberFontSizeSmall: '12px',
  inputNumberFontSizeMedium: '14px',
  inputNumberFontSizeLarge: '16px',
} as const;

// ============ Dialog Component Tokens ============
export const dialogTokens: TokenMap = {
  dialogOverlayBg: 'rgba(0, 0, 0, 0.5)',
  dialogBg: semanticColors.colorBg,
  dialogBorderColor: semanticColors.colorBorder,
  dialogBorderRadius: '8px',
  dialogBoxShadow: '0 4px 24px rgba(0, 0, 0, 0.15)',
  dialogTitleFontSize: '16px',
  dialogTitleFontWeight: '600',
  dialogPaddingHeader: '16px 24px',
  dialogPaddingBody: '24px',
  dialogPaddingFooter: '12px 24px',
} as const;

// ============ Tooltip Component Tokens ============
export const tooltipTokens: TokenMap = {
  tooltipBg: '#333333',
  tooltipText: '#ffffff',
  tooltipFontSize: '12px',
  tooltipBorderRadius: '4px',
  tooltipPadding: '6px 12px',
  tooltipArrowSize: '5px',
} as const;

// ============ Popover Component Tokens ============
export const popoverTokens: TokenMap = {
  popoverBg: semanticColors.colorBg,
  popoverBorderRadius: '8px',
  popoverBoxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
  popoverPadding: '12px',
  popoverBorderColor: semanticColors.colorBorder,
  popoverArrowSize: '8px',
  popoverMinWidth: '150px',
} as const;

// ============ Tag Component Tokens ============
export const tagTokens: TokenMap = {
  tagHeightSmall: '20px',
  tagHeightMedium: '24px',
  tagHeightLarge: '28px',
  tagPaddingSmall: '0 6px',
  tagPaddingMedium: '0 8px',
  tagPaddingLarge: '0 12px',
  tagFontSizeSmall: '11px',
  tagFontSizeMedium: '12px',
  tagFontSizeLarge: '14px',
  tagBorderRadius: '4px',
  tagCloseFontSize: '10px',
  tagCloseMargin: '4px',
} as const;

// ============ Badge Component Tokens ============
export const badgeTokens: TokenMap = {
  badgeFontSize: '12px',
  badgeMinWidth: '18px',
  badgeHeight: '18px',
  badgePadding: '0 6px',
  badgeBorderRadius: '9px',
  badgeDotSize: '8px',
  badgeTextColor: '#ffffff',
} as const;
