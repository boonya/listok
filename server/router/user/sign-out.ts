import {ORPCError, os} from '@orpc/server';
import {z} from 'zod';
import {supabaseMiddleware} from '@/supabase-client';
import type {ORPCContext} from '@/types/orpc';

export default os
  .$context<ORPCContext>()
  .use(supabaseMiddleware)
  .input(
    z
      .object({
        scope: z.enum(['global', 'local', 'others']),
      })
      .optional()
      .default({scope: 'local'}),
  )
  .handler(async ({context, input}) => {
    try {
      const result = await context.supabase.auth.signOut(input);
      const {error} = result;
      if (error) {
        throw new ORPCError(error.name, error);
      }
    } catch (cause) {
      if (cause instanceof ORPCError) throw cause;
      const error =
        cause instanceof Error ? cause : new Error('Unknown error.', {cause});
      throw new ORPCError('INTERNAL_SERVER_ERROR', error);
    }
  });
