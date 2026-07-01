/**
 * Overlay Types
 *
 * 浮层系统（Dialog、Popover、Tooltip、SelectDropdown 等）的公共类型。
 * 在 core 中定义以保持框架无关，供 hooks 包和组件包共用。
 */

/** 浮层类型 — 决定浮层的行为模式 */
export type OverlayType = 'modal' | 'anchor' | 'feedback';

/** 浮层定位方向 */
export type Placement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end';

/** 定位策略 */
export type PositionStrategy = 'absolute' | 'fixed';
