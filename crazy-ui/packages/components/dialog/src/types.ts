import type { PropType } from 'vue';

export const dialogProps = {
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  width: { type: String, default: '520px' },
  fullscreen: { type: Boolean, default: false },
  modal: { type: Boolean, default: true },
  closable: { type: Boolean, default: true },
  closeOnClickModal: { type: Boolean, default: true },
  closeOnPressEscape: { type: Boolean, default: true },
  showHeader: { type: Boolean, default: true },
  showFooter: { type: Boolean, default: true },
  confirmText: { type: String, default: '确定' },
  cancelText: { type: String, default: '取消' },
  beforeClose: {
    type: Function as PropType<(done: () => void) => void>,
    default: undefined,
  },
} as const;

export type DialogProps = {
  modelValue?: boolean;
  title?: string;
  width?: string;
  fullscreen?: boolean;
  modal?: boolean;
  closable?: boolean;
  closeOnClickModal?: boolean;
  closeOnPressEscape?: boolean;
  showHeader?: boolean;
  showFooter?: boolean;
  confirmText?: string;
  cancelText?: string;
  beforeClose?: (done: () => void) => void;
};
