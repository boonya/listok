import {ORPCError, os} from '@orpc/server';
import createSupabaseClient from '@/supabase-client';
import type {ORPCContext} from '@/types/orpc';
import {UserSchema} from './types';

export default os
  .$context<ORPCContext>()
  .route({method: 'GET'})
  .handler(async ({context}) => {
    try {
      const supabase = createSupabaseClient();
      const {data, error} = await supabase.auth.getUser(context.jwt);
      if (error) {
        throw new ORPCError(error.name, error);
      }
      return UserSchema.parse(data.user);
    } catch (cause) {
      if (cause instanceof ORPCError) throw cause;
      const error =
        cause instanceof Error ? cause : new Error('Unknown error.', {cause});
      throw new ORPCError('INTERNAL_SERVER_ERROR', error);
    }
  });
