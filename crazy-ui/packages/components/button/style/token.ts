/**
 * Button Component Tokens
 *
 * 这些 token 从 theme 包继承，可以在这里做组件级覆盖
 */

import { buttonTokens } from '@crazy-ui/theme';

export const buttonComponentTokens = {
  ...buttonTokens,
  // 可以在这里覆盖特定的 token
} as const;
