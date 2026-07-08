import { mountInstance } from '../../_shared/create-instance';
import NotificationComponent from './notification.vue';

import type { NotificationOptions, NotificationType } from './types';

let seed = 0;
const instances: Array<{ id: string; close: () => void }> = [];

function createNotification(
  options: NotificationOptions,
  type: NotificationType = 'info',
) {
  const opts = { ...options, type: options.type ?? type };
  const id = `notification_${++seed}`;

  const { close } = mountInstance({
    component: NotificationComponent,
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

export const Notification = {
  success(options: NotificationOptions) {
    return createNotification(options, 'success');
  },
  warning(options: NotificationOptions) {
    return createNotification(options, 'warning');
  },
  info(options: NotificationOptions) {
    return createNotification(options, 'info');
  },
  error(options: NotificationOptions) {
    return createNotification(options, 'error');
  },
  open(options: NotificationOptions) {
    return createNotification(options, options.type ?? 'info');
  },
  closeAll() {
    for (const inst of [...instances]) {
      inst.close();
    }
    instances.length = 0;
  },
};

export type { NotificationOptions, NotificationType };
