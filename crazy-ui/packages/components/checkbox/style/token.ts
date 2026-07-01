import { semanticColors, semanticSizes } from '@crazy-ui/theme';

export const checkboxTokens = {
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
} as const;
