import {createAsyncStoragePersister} from '@tanstack/query-async-storage-persister';
import {QueryClient} from '@tanstack/react-query';
import {
  type AsyncStorage,
  PersistQueryClientProvider,
} from '@tanstack/react-query-persist-client';
import type {PropsWithChildren} from 'react';
import {isResponseError} from '@/providers/api/api-client';

const storageKey = 'REACT_QUERY_OFFLINE_CACHE';
const storage: AsyncStorage = window.localStorage;
const serialize = JSON.stringify;
const deserialize = JSON.parse;

const persister = createAsyncStoragePersister({
  key: storageKey,
  storage,
  serialize,
  deserialize,
});

/**
 * Create query retry policy.
 *
 * There is not reason to retry if error is not a RestApiResponseError
 * or response status is less than 500.
 *
 * Otherwise it will retry up to 3 times before it fails.
 */
export const queryRetryPolicy =
  (retries = 3) =>
  (failureCount: number, error: Error) => {
    // if (!(error instanceof RestApiResponseError)) {
    //   return false;
    // }
    if (isResponseError(error) && error.status < 500) {
      return false;
    }
    return failureCount < retries;
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // networkMode: 'offlineFirst',
      retry: queryRetryPolicy(),
      refetchOnWindowFocus: false,
      refetchInterval: false,
      // meta: {
      //   // api: getAPIClient(),
      //   api: 'getAPIClient()',
      // },
    },
    mutations: {
      // networkMode: 'offlineFirst',
    },
  },
});

export function QueryClientProvider({
  client,
  children,
}: PropsWithChildren<{client: QueryClient}>) {
  return (
    <PersistQueryClientProvider client={client} persistOptions={{persister}}>
      {children}
    </PersistQueryClientProvider>
  );
}

// interface QueryClientMeta extends Record<string, unknown> {
//   api: ApiClient;
// }

type QueryKey = ['refresh-session' | 'me' | 'listing', ...(readonly unknown[])];

declare module '@tanstack/react-query' {
  interface Register {
    // queryMeta: QueryClientMeta;
    queryKey: QueryKey;
    // mutationMeta: QueryClientMeta;
    mutationKey: QueryKey;
  }
}
