import { semanticColors, semanticSizes } from '@crazy-ui/theme';

export const selectTokens = {
  selectHeightSmall: semanticSizes.heightSmall,
  selectHeightMedium: semanticSizes.heightMedium,
  selectHeightLarge: semanticSizes.heightLarge,
  selectBorderColor: semanticColors.colorBorder,
  selectFocusBorderColor: semanticColors.colorPrimary,
  selectOptionHeight: '34px',
  selectOptionHoverBgColor: semanticColors.colorBgSecondary,
  selectOptionSelectedColor: semanticColors.colorPrimary,
  selectDropdownBgColor: semanticColors.colorBg,
  selectDropdownBorderColor: semanticColors.colorBorder,
} as const;
