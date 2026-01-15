import {QueryClient} from '@tanstack/react-query';
import {createRoute, redirect, useRouter} from '@tanstack/react-router';
import {useCallback} from 'react';
import z from 'zod';
import {useApiClient} from '@/providers/api/api-client';
import {queryMe} from '@/providers/api/me';
import {getSession, removeSession} from '@/providers/auth/session';
import {isFailedResponse} from '@/providers/query-client';
import rootRoute from '@/providers/router/root.route';
import SignIn from './sign-in';
import SignUp from './sign-up';

export const authOnlyRoute = async (
  queryClient: QueryClient,
  redirect_to: string,
) => {
  const redirectTo = (redirect_back: string) => {
    return redirect({
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
    throw redirectTo(redirect_to);
  }

  await queryClient
    .fetchQuery(queryMe(session))
    .then((me) => {
      if (!me?.id) {
        throw redirectTo(redirect_to);
      }
    })
    .catch((error) => {
      if (
        isFailedResponse(error) &&
        error.status >= 400 &&
        error.status < 500
      ) {
        removeSession();
        throw redirectTo(redirect_to);
      }
      throw error;
    });
};

export const nonAuthOnlyRoute = async (queryClient: QueryClient) => {
  const session = getSession();
  if (!session) {
    return;
  }

  const redirectTo = () => {
    return redirect({
      to: '/',
    });
  };

  await queryClient
    .fetchQuery(queryMe(session))
    .then((me) => {
      if (me.id) {
        throw redirectTo();
      }
    })
    .catch((error) => {
      if (isFailedResponse(error) && error.status !== 403) {
        throw redirectTo();
      } else {
        removeSession();
      }
      throw error;
    });
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
