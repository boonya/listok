import type {QueryClient} from '@tanstack/react-query';
import {createRoute, redirect, useRouter} from '@tanstack/react-router';
import {useCallback} from 'react';
import z from 'zod';
import {isResponseError, useApiClient} from '@/providers/api/api-client';
import {queryMe} from '@/providers/api/me';
import {
  getSession,
  isSessionExpired,
  queryRefreshSession,
  removeSession,
  type Session,
  setSession,
} from '@/providers/auth/session';
import rootRoute from '@/providers/router/root.route';
import SignIn from './sign-in';
import SignUp from './sign-up';

const getLatestSession = async (queryClient: QueryClient, session: Session) => {
  if (!navigator.onLine) return session;

  if (isSessionExpired(session)) {
    return queryClient.fetchQuery(queryRefreshSession(session));
  }

  try {
    const me = await queryClient.fetchQuery(queryMe(session));
    if (!me?.id) {
      throw new Error('No user found', {cause: me});
    }
    return session;
  } catch (cause) {
    if (isResponseError(cause) && [401, 403].includes(cause.status)) {
      return queryClient.fetchQuery(queryRefreshSession(session));
    }
    throw cause;
  }
};

export const authOnlyRoute = async (
  queryClient: QueryClient,
  redirect_back: string,
) => {
  const blockAction = () => {
    // return false;
    throw redirect({
      to: '/sign-in',
      search: {
        // Use the current location to power a redirect after login
        // (Do not use `router.state.resolvedLocation` as it can
        // potentially lag behind the actual current location)
        redirect_to: redirect_back,
      },
    });
  };

  const session = getSession();
  if (!session) {
    return blockAction();
  }

  try {
    const latest_session = await getLatestSession(queryClient, session);
    if (latest_session.access_token !== session.access_token) {
      setSession(latest_session);
      await queryClient.fetchQuery(queryMe(latest_session));
    }
    return true;
  } catch {
    removeSession();
    return blockAction();
  }
};

export const nonAuthOnlyRoute = async (queryClient: QueryClient) => {
  const session = getSession();
  if (!session) {
    return true;
  }

  const blockAction = () => {
    // return false;
    throw redirect({
      to: '/',
    });
  };

  const me = await queryClient.fetchQuery(queryMe(session));
  if (me.id) {
    return blockAction();
  }

  return true;
};

export function useSignOut(params?: {scope: 'local' | 'global' | 'others'}) {
  const router = useRouter();
  const api = useApiClient();

  return useCallback(async () => {
    await api.auth.sign_out(params);
    removeSession();
    router.invalidate();
  }, [api.auth.sign_out, router.invalidate, params]);
}

export const signInRoute = createRoute({
  path: '/sign-in',
  getParentRoute: () => rootRoute,
  component: SignIn,
  validateSearch: z.object({
    redirect_to: z.string().optional(),
  }),
  beforeLoad: async ({context}) => {
    await nonAuthOnlyRoute(context.queryClient);
  },
});

export const signUpRoute = createRoute({
  path: '/sign-up',
  getParentRoute: () => rootRoute,
  component: SignUp,
  validateSearch: z.object({
    redirect_to: z.string().optional(),
  }),
  beforeLoad: async ({context}) => {
    await nonAuthOnlyRoute(context.queryClient);
  },
});
