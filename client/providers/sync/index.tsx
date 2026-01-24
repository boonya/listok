import * as Comlink from 'comlink';
import {useCallback, useDeferredValue, useEffect, useMemo} from 'react';
import {
  getSession,
  isSessionExpired,
  useSession,
} from '@/providers/auth/session';
import type {SyncManager} from '@/providers/sync/worker';
import SyncWorker from '@/providers/sync/worker?worker';
import {notifyError} from '@/utils/notify';
import {useOnlineStatus} from '@/utils/online-status';

export const syncManagerWorker = new SyncWorker();

export default function SyncProvider() {
  const isOnline = useOnlineStatus();
  const [session] = useSession();

  const isSyncAllowed = useDeferredValue(
    isOnline && !isSessionExpired(session),
  );

  const syncManager = useMemo(() => {
    return Comlink.wrap<SyncManager>(syncManagerWorker);
  }, []);

  const run = useCallback(async () => {
    try {
      const session = getSession();
      if (!session) throw new Error('No session.');
      await syncManager.run(session);
    } catch (error) {
      notifyError(['worker', 'sync'], error, 'Помилка воркера синхронізації.');
    }
  }, [syncManager]);

  const suppress = useCallback(async () => {
    try {
      await syncManager.suppress();
    } catch (error) {
      notifyError(['worker', 'sync'], error, 'Помилка воркера синхронізації.');
    }
  }, [syncManager]);

  useEffect(() => {
    if (isSyncAllowed) {
      void run();
    } else {
      void suppress();
    }
  }, [isSyncAllowed, run, suppress]);

  return null;
}
