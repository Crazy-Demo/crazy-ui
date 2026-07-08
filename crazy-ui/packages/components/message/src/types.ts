import type { PropType } from 'vue';

export type MessageType = 'success' | 'warning' | 'info' | 'error';

export const messageProps = {
  message: { type: String, default: '' },
  type: {
    type: String as PropType<MessageType>,
    default: 'info',
  },
  duration: { type: Number, default: 3000 },
  showClose: { type: Boolean, default: false },
  center: { type: Boolean, default: false },
  offset: { type: Number, default: 20 },
  onClose: { type: Function as PropType<() => void>, default: undefined },
  dangerouslyUseHTMLString: { type: Boolean, default: false },
} as const;

export const messageEmits = {
  close: () => true,
};

export interface MessageOptions {
  message: string;
  type?: MessageType;
  duration?: number;
  showClose?: boolean;
  center?: boolean;
  offset?: number;
  onClose?: () => void;
  dangerouslyUseHTMLString?: boolean;
}

export type MessageProps = MessageOptions;
