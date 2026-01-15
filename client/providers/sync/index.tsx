import * as Comlink from 'comlink';
import {useEffect} from 'react';
import {isSessionExpired, useSession} from '@/providers/auth/session';
import {notifyError} from '@/utils/notify';
import {useOnlineStatus} from '@/utils/online-status';
import type {SyncManager} from './worker';
import SyncManagerWorker from './worker?worker';

export const syncManagerWorker = new SyncManagerWorker();
export const syncManager = Comlink.wrap<SyncManager>(syncManagerWorker);

export default function SyncProvider() {
  const [session] = useSession();
  const isOnline = useOnlineStatus();

  useEffect(() => {
    if (isOnline && session && !isSessionExpired(session)) {
      syncManager.resume(session);
    } else {
      syncManager.suppress();
    }
  }, [isOnline, session]);

  useEffect(() => {
    const controller = new AbortController();

    // TODO: Make truly type-safe messages
    syncManagerWorker.addEventListener(
      'error',
      (error) => {
        notifyError(
          ['worker', 'sync'],
          error,
          'Помилка обробника синхронізації.',
        );
      },
      {signal: controller.signal},
    );

    return () => {
      controller.abort();
    };
  }, []);

  return null;
}
