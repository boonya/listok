import {z} from 'zod';

export const UserSchema = z.object({
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

export const SessionSchema = z
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
