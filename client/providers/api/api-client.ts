import type {OrpcClient as ApiClient} from '@listok/server/router';
import {
  createORPCClient,
  ORPCError,
  type ORPCErrorCode,
  onError,
} from '@orpc/client';
import {RPCLink} from '@orpc/client/fetch';
import pkg from '@/package.json';
import {useSession} from '@/providers/auth/session';
import {logger} from '@/utils/logger';

export type {ApiClient};

export const getAPIClient = (
  url: string,
  session?: Session | null,
): ApiClient => {
  const link = new RPCLink({
    url,
    headers: {
      authorization: getAuthorizationHeader(session),
      'x-api-client-name': pkg.name,
      'x-api-client-version': pkg.version,
      'x-api-client-revision': REVISION,
    },
    interceptors: [
      onError((error) => {
        if (!isResponseError(error) || error.status >= 500) {
          logger.error(['network', 'api'], 'API request failed.', error);
        }
      }),
    ],
  });

  return createORPCClient(link);
};

export const isResponseError = <TCode extends ORPCErrorCode, TData>(
  value: unknown,
): value is Response | ORPCError<TCode, TData> => {
  if (value instanceof Response && value.status >= 400) {
    return true;
  }

  if (value instanceof ORPCError) {
    return true;
  }

  return false;
};

export function useApiClient(): ApiClient {
  const [session] = useSession();
  return getAPIClient(API_URL, session);
}

type Session = {
  token_type?: string;
  access_token: string;
};

const getAuthorizationHeader = (session?: Session | null) => {
  if (!session) return;
  const {token_type, access_token} = session;
  return [token_type, access_token].filter(Boolean).join(' ');
};
