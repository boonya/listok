import {ORPCError, os} from '@orpc/server';
import {z} from 'zod';
import {getDbApi} from '@/router/lists/db-api';
import {supabaseMiddleware} from '@/supabase-client';
import type {ORPCContext} from '@/types/orpc';
import sync from './sync';

export default os
  .$context<ORPCContext>()
  .use(supabaseMiddleware)
  .input(
    z
      .object({
        id: z.uuid().or(z.number()),
        created_at: z.date(),
        updated_at: z.date().nullish().default(null),
        deleted_at: z.date().nullish().default(null),
        title: z.string(),
        order: z.number().nullish().default(null),
        // items: z.object({}).loose().array().nullish(),
      })
      .array(),
  )
  .handler(async ({input, context}) => {
    try {
      const db = getDbApi(context.supabase);
      return sync(db, input);
    } catch (cause) {
      if (cause instanceof ORPCError) throw cause;
      const error =
        cause instanceof Error ? cause : new Error('Unknown error.', {cause});
      throw new ORPCError('INTERNAL_SERVER_ERROR', error);
    }
  });
