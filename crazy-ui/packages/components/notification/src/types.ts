import type { PropType } from 'vue';

export type NotificationType = 'success' | 'warning' | 'info' | 'error';
export type NotificationPosition =
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left';

export const notificationProps = {
  title: { type: String, default: '' },
  message: { type: String, default: '' },
  type: {
    type: String as PropType<NotificationType>,
    default: 'info',
  },
  duration: { type: Number, default: 4500 },
  position: {
    type: String as PropType<NotificationPosition>,
    default: 'top-right',
  },
  showClose: { type: Boolean, default: true },
  offset: { type: Number, default: 16 },
  onClose: { type: Function as PropType<() => void>, default: undefined },
  onClick: { type: Function as PropType<() => void>, default: undefined },
  dangerouslyUseHTMLString: { type: Boolean, default: false },
} as const;

export const notificationEmits = {
  close: () => true,
};

export interface NotificationOptions {
  title: string;
  message: string;
  type?: NotificationType;
  duration?: number;
  position?: NotificationPosition;
  showClose?: boolean;
  offset?: number;
  onClose?: () => void;
  onClick?: () => void;
  dangerouslyUseHTMLString?: boolean;
}

export type NotificationProps = NotificationOptions;
