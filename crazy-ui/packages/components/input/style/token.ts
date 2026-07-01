import { semanticColors, semanticSizes } from '@crazy-ui/theme';

export const inputTokens = {
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
