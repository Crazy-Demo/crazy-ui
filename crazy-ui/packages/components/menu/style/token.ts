/**
 * Menu Component Tokens
 *
 * These tokens inherit from the theme package,
 * with component-level overrides if needed.
 */

import { semanticColors } from '@crazy-ui/theme';

export const menuTokens = {
  // Item height
  menuItemHeight: '56px',

  // Item padding
  menuItemPaddingHorizontal: '20px',

  // Item colors
  menuItemHoverBgColor: semanticColors.colorBgSecondary,
  menuItemActiveColor: semanticColors.colorPrimary,
  menuItemDisabledTextColor: semanticColors.colorTextDisabled,
  menuItemDisabledBgColor: semanticColors.colorBgDisabled,

  // Sub menu
  subMenuTitlePaddingLeft: '20px',
  subMenuChildrenPaddingLeft: '20px',

  // Group
  menuItemGroupTitleColor: semanticColors.colorTextTertiary,
  menuItemGroupTitleFontSize: '12px',

  // Colors
  menuTextColor: semanticColors.colorText,
  menuBgColor: '#ffffff',
  menuBorderColor: semanticColors.colorBorder,

  // Horizontal mode
  menuHorizontalItemPadding: '0 20px',

  // Collapse
  menuCollapseWidth: '64px',
  menuExpandWidth: '220px',

  // Misc
  menuBorderRadius: '0px',
  menuArrowTransition: 'transform 0.2s',
} as const;
