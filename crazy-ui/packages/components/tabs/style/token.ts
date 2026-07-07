/**
 * Tabs Component Tokens
 *
 * These tokens inherit from the theme package,
 * with component-level overrides if needed.
 */

import { semanticColors } from '@crazy-ui/theme';

export const tabsTokens = {
  // Tab nav
  tabNavBorderColor: semanticColors.colorBorder,
  tabNavBgColor: '#ffffff',
  tabNavBorderRadius: '0px',

  // Tab item
  tabItemHeight: '40px',
  tabItemPaddingHorizontal: '20px',
  tabItemFontSize: '14px',

  // Tab item colors
  tabItemTextColor: semanticColors.colorTextSecondary,
  tabItemHoverTextColor: semanticColors.colorPrimary,
  tabItemActiveTextColor: semanticColors.colorPrimary,
  tabItemDisabledTextColor: semanticColors.colorTextDisabled,

  // Tab bar (active indicator)
  tabBarColor: semanticColors.colorPrimary,
  tabBarHeight: '2px',
  tabBarTransition: 'transform 0.3s cubic-bezier(0.645, 0.045, 0.355, 1), width 0.3s cubic-bezier(0.645, 0.045, 0.355, 1)',

  // Card type
  tabCardBorderColor: semanticColors.colorBorder,
  tabCardBgColor: semanticColors.colorBgSecondary,
  tabCardActiveBgColor: semanticColors.colorBg,

  // Border-card type
  tabBorderCardBgColor: semanticColors.colorBg,
  tabBorderCardBorderColor: semanticColors.colorBorder,

  // Content
  tabsContentPadding: '16px 0',

  // Close button
  tabCloseSize: '12px',
  tabCloseHoverBg: semanticColors.colorTextDisabled,

  // Add button
  tabAddSize: '14px',
} as const;
