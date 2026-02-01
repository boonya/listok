import type {Database} from '@listok/supabase/database.d.ts';
import {ORPCError, os} from '@orpc/server';
import {createClient, PostgrestError} from '@supabase/supabase-js';
import getEnvs from '@/env';
import {logger} from '@/logger';
import pkg from '@/package.json';
import type {ORPCContext} from '@/types/orpc';

type Options = Parameters<typeof createClient>[2];

export type SupabaseClient = ReturnType<typeof createSupabaseClient>;

const createSupabaseClient = (options?: Options) => {
  const {SUPABASE_URL, SUPABASE_ANON_KEY, REVISION} = getEnvs();
  const client = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    ...options,
    auth: {
      ...options?.auth,
      /**
       * // TODO: Redis storage?
       * @link https://redis.io/docs/latest/develop/clients/nodejs/
       * // storageKey: 'auth',
       * // storage: localStorage, <- Consider to use Redis or something
       * // node_modules/@supabase/auth-js/src/lib/types.ts:1379
       */
      persistSession: false,
      /**
       * @link https://supabase.com/docs/reference/javascript/initializing#initializing
       * @link https://www.reddit.com/r/Supabase/comments/1785mvc/comment/ntyo2dh/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button
       */
      autoRefreshToken: false,
    },
    global: {
      ...options?.global,
      headers: {
        ...options?.global?.headers,
        'x-api-server-name': pkg.name,
        'x-api-server-version': pkg.version,
        'x-api-server-revision': REVISION,
      },
    },
  });
  logger.debug('[supabase] Supabase client created.');
  return client;
};

export default createSupabaseClient;

export const supabaseMiddleware = os
  .$context<ORPCContext>()
  .middleware(async ({context, next}) => {
    try {
      const authorization = context.reqHeaders?.get('authorization');
      const headers = authorization ? {authorization} : undefined;
      // const headers = Object.fromEntries<string>(
      //   Object.entries({authorization}).filter(([, value]) => Boolean(value)),
      // );
      const supabase = createSupabaseClient({global: {headers}});

      const result = await next({
        context: {
          supabase,
        },
      });

      return result;
    } catch (cause) {
      if (cause instanceof PostgrestError && cause.code === 'PGRST303') {
        throw new ORPCError('UNAUTHORIZED', cause);
      }
      throw cause;
    }
  });
