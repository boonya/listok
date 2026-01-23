import {ORPCError, os} from '@orpc/server';
import {supabaseMiddleware} from '@/supabase-client';
import type {ORPCContext} from '@/types/orpc';

export default os
  .$context<ORPCContext>()
  .use(supabaseMiddleware)
  .handler(async ({context}) => {
    try {
      const {data} = await context.supabase
        .from('lists')
        .select('id, title, created_at, updated_at, order')
        .order('created_at', {ascending: false})
        // .order('order', {
        //   referencedTable: 'items',
        //   ascending: true,
        // })
        // .order('created_at', {referencedTable: 'items', ascending: false})
        // .order('is_completed', {referencedTable: 'items', ascending: true})
        .throwOnError();
      return data;
    } catch (cause) {
      if (cause instanceof ORPCError) throw cause;
      const error =
        cause instanceof Error ? cause : new Error('Unknown error.', {cause});
      throw new ORPCError('INTERNAL_SERVER_ERROR', error);
    }
  });
