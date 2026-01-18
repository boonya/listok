import {ORPCError, os} from '@orpc/server';
import {z} from 'zod';
import createSupabaseClient from '@/supabase-client';
import {SessionSchema, UserSchema} from './types';

export default os
  .input(
    z.object({
      email: z.email(),
      password: z.string().min(6),
    }),
  )
  .handler(async ({input}) => {
    try {
      const supabase = createSupabaseClient();
      const {data, error} = await supabase.auth.signInWithPassword(input);
      if (error) {
        throw new ORPCError(error.name, error);
      }
      return z.object({user: UserSchema, session: SessionSchema}).parse(data);
    } catch (cause) {
      if (cause instanceof ORPCError) throw cause;
      const error =
        cause instanceof Error ? cause : new Error('Unknown error.', {cause});
      throw new ORPCError('INTERNAL_SERVER_ERROR', error);
    }
  });
