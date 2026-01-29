import {throttle} from '@tanstack/react-pacer';
import {useEffect, useState} from 'react';

// import {syncManagerWorker} from '@/providers/sync';

type OnChange = (isSyncing: boolean) => unknown;

export function useSyncStatusEvents(onChange: OnChange) {
  useEffect(() => {
    const controller = new AbortController();

    // const throttledHandler = throttle(onChange, {
    //   wait: 500,
    //   leading: false,
    //   trailing: true,
    // });

    // // TODO: Make truly type-safe messages
    // syncManagerWorker.addEventListener(
    //   'message',
    //   (event) => {
    //     if (event.data.scope !== 'sync') return;
    //     throttledHandler(event.data.isRunning);
    //   },
    //   {signal: controller.signal},
    // );

    return () => {
      controller.abort();
    };
  }, [onChange]);
}

export function useSyncStatus(onChange?: OnChange) {
  const [isSyncing, setSyncing] = useState(false);

  useSyncStatusEvents((value) => {
    setSyncing(value);
    onChange?.(value);
  });

  return isSyncing;
}
