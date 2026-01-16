import {ORPCError, os} from '@orpc/server';
import {z} from 'zod';
import createSupabaseClient from '@/supabase-client';
import {SessionSchema} from './types';

export default os
  .input(
    z.object({
      refresh_token: z.string().min(6),
    }),
  )
  .handler(async ({input}) => {
    try {
      const supabase = createSupabaseClient();
      const {data, error} = await supabase.auth.refreshSession(input);
      if (error) {
        throw new ORPCError(error.name, error);
      }
      return SessionSchema.parse(data.session);
    } catch (cause) {
      if (cause instanceof ORPCError) throw cause;
      const error =
        cause instanceof Error ? cause : new Error('Unknown error.', {cause});
      throw new ORPCError('INTERNAL_SERVER_ERROR', error);
    }
  });
