import {ORPCError, ORPCErrorCode} from '@orpc/client';
import {createAsyncStoragePersister} from '@tanstack/query-async-storage-persister';
import {MutationCache, QueryCache, QueryClient} from '@tanstack/react-query';
import {
  type AsyncStorage,
  PersistQueryClientProvider,
} from '@tanstack/react-query-persist-client';
import {PropsWithChildren} from 'react';
import {type ApiClient, getAPIClient} from '@/providers/api/api-client';

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

export const isFailedResponse = <TCode extends ORPCErrorCode, TData>(
  value: unknown,
): value is Response | ORPCError<TCode, TData> => {
  if (value instanceof Response) return true;
  if (value instanceof ORPCError) return true;
  return false;
};

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
    if (isFailedResponse(error.cause) && error.cause.status < 500) {
      return false;
    }
    return failureCount < retries;
  };

const queryCache = new QueryCache({
  onError: (error) => {
    console.error('queryCache:', error);
  },
});

const mutationCache = new MutationCache({
  onError: (error) => {
    console.error('mutationCache:', error);
  },
});

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
  queryCache,
  mutationCache,
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
