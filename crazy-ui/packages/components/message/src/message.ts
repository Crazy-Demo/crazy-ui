import { mountInstance } from '../../_shared/create-instance';
import MessageComponent from './message.vue';

import type {
  MessageOptions,
  MessageType,
} from './types';

let seed = 0;
const instances: Array<{ id: string; close: () => void }> = [];

function createMessage(options: MessageOptions | string, type: MessageType = 'info') {
  const opts: MessageOptions =
    typeof options === 'string' ? { message: options, type } : { ...options, type: options.type ?? type };

  const id = `message_${++seed}`;

  const { close } = mountInstance({
    component: MessageComponent,
    props: {
      ...opts,
      onClose: () => {
        opts.onClose?.();
        const idx = instances.findIndex((i) => i.id === id);
        if (idx > -1) instances.splice(idx, 1);
      },
    },
  });

  instances.push({ id, close });

  return { close };
}

export const Message = {
  success(msg: string | MessageOptions) {
    return createMessage(msg, 'success');
  },
  warning(msg: string | MessageOptions) {
    return createMessage(msg, 'warning');
  },
  info(msg: string | MessageOptions) {
    return createMessage(msg, 'info');
  },
  error(msg: string | MessageOptions) {
    return createMessage(msg, 'error');
  },
  closeAll() {
    for (const inst of [...instances]) {
      inst.close();
    }
    instances.length = 0;
  },
};

export type { MessageOptions, MessageType };
