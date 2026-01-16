import {ORPCError, os} from '@orpc/server';
import {getDbApi} from '@/router/lists/db-api';
import {supabaseMiddleware} from '@/supabase-client';
import type {ORPCContext} from '@/types/orpc';

export default os
  .$context<ORPCContext>()
  .use(supabaseMiddleware)
  .handler(async ({context}) => {
    try {
      const db = getDbApi(context.supabase);
      return db.select();
      //   ...rest,
      //   created_at: new Date(created_at),
      // }));
    } catch (cause) {
      if (cause instanceof ORPCError) throw cause;
      const error =
        cause instanceof Error ? cause : new Error('Unknown error.', {cause});
      throw new ORPCError('INTERNAL_SERVER_ERROR', error);
    }
  });
