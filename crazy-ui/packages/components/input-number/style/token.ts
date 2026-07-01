import { semanticColors, semanticSizes } from '@crazy-ui/theme';

export const inputNumberTokens = {
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
