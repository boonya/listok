import {ORPCError, os} from '@orpc/server';
import {z} from 'zod';
import createSupabaseClient, {supabaseMiddleware} from './supabase-client';
import {type ORPCContext} from './types';

const UserSchema = z.object({
  id: z.uuid(),
  email: z.email().optional(),
  phone: z.string().optional(),
  role: z.string().optional(),
  created_at: z.string(),
  confirmed_at: z.string(),
  email_confirmed_at: z.string(),
  last_sign_in_at: z.string(),
  updated_at: z.string().optional(),
  is_anonymous: z.boolean(),
  user_metadata: z.object({}).loose(),
});

/**
 * node_modules/@supabase/auth-js/src/lib/types.ts
 */
const SessionSchema = z
  .object({
    token_type: z.literal('bearer'),
    /**
     * The access token jwt. It is recommended to set the JWT_EXPIRY to a shorter expiry value.
     */
    access_token: z.string(),
    /**
     * A timestamp of when the token will expire. Returned when a login is confirmed.
     */
    expires_at: z.number(),
    expires_in: z.number(),
    /**
     * A one-time used refresh token that never expires.
     */
    refresh_token: z.string(),
    user: UserSchema,
  })
  .transform(({expires_at, expires_in, ...session}) => ({
    ...session,
    issued_at: expires_at && expires_in ? expires_at - expires_in : Date.now(),
    expires_at,
    ttl: expires_in,
  }));

const signIn = os
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
      // return {...data, session: SessionSchema.parse(data.session)};
    } catch (cause) {
      if (cause instanceof ORPCError) throw cause;
      const error =
        cause instanceof Error ? cause : new Error('Unknown error.', {cause});
      throw new ORPCError('INTERNAL_SERVER_ERROR', error);
    }
  });

const signOut = os
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

const me = os
  .$context<ORPCContext>()
  // .use(supabaseMiddleware)
  .route({method: 'GET'})
  .handler(async ({context}) => {
    try {
      const supabase = createSupabaseClient();
      // const {data, error} = await context.supabase.auth.getUser();
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

const refreshSession = os
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

export default {
  sign_in: signIn,
  sign_out: signOut,
  me,
  refresh_session: refreshSession,
};
