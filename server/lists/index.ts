import {ORPCError, os} from '@orpc/server';
import {z} from 'zod';
import {supabaseMiddleware} from '@/supabase-client';
import type {ORPCContext} from '@/types';
import {getDbApi} from './db-api';
import {sync as processSync} from './sync';

const listing = os
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

const sync = os
  .$context<ORPCContext>()
  .use(supabaseMiddleware)
  .input(
    z
      .object({
        id: z.uuid().nullish().default(null),
        title: z.string(),
        // items: z.object({}).loose().array().nullish(),
        created_at: z.date(),
        updated_at: z.date().nullish().default(null),
        deleted_at: z.date().nullish().default(null),
      })
      .array(),
  )
  .handler(async ({input, context}) => {
    try {
      const db = getDbApi(context.supabase);
      return processSync(db, input);
    } catch (cause) {
      if (cause instanceof ORPCError) throw cause;
      const error =
        cause instanceof Error ? cause : new Error('Unknown error.', {cause});
      throw new ORPCError('INTERNAL_SERVER_ERROR', error);
    }
  });

export default {listing, sync};
