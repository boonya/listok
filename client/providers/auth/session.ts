import type {Session as SupabaseSession} from '@supabase/supabase-js';
import {useMemo} from 'react';
import {useLocalStorage} from 'usehooks-ts';
import z from 'zod';
import {logger} from '@/utils/logger';

const UserSchema = z
  .object({
    id: z.uuid(),
    email: z.email().optional(),
    phone: z.string().optional(),
    role: z.string().optional(),
  })
  .loose();

/**
 * node_modules/@supabase/auth-js/src/lib/types.ts
 */
const SessionSchema = z.object({
  /**
   * The oauth provider token. If present, this can be used to make external API requests to the oauth provider used.
   */
  provider_token: z.string().nullish().optional(),
  /**
   * The oauth provider refresh token. If present, this can be used to refresh the provider_token via the oauth provider's API. Not all oauth providers return a provider refresh token. If the provider_refresh_token is missing, please refer to the oauth provider's documentation for information on how to obtain the provider refresh token.
   */
  provider_refresh_token: z.string().nullish().optional(),
  /**
   * The access token jwt. It is recommended to set the JWT_EXPIRY to a shorter expiry value.
   */
  access_token: z.string(),
  /**
   * A one-time used refresh token that never expires.
   */
  refresh_token: z.string(),
  /**
   * A timestamp of when the token will expire. Returned when a login is confirmed.
   */
  expires_at: z.number().optional(),
  token_type: z.literal('bearer'),
  user: UserSchema,
});

export type Session = z.infer<typeof SessionSchema>;

const STORAGE_KEY = 'session';

const deserializeSession = (value: string | null | undefined) => {
  try {
    const object = value && JSON.parse(value);
    if (!object) return null;
    return SessionSchema.parse(object);
  } catch (error) {
    logger.error(
      ['storage', 'auth'],
      'Failed to get session from storage.',
      error,
    );
    return null;
  }
};

const serializeSession = (session: Session | null | undefined) => {
  try {
    const value = SessionSchema.parse(session);
    return JSON.stringify(value);
  } catch (error) {
    logger.error(
      ['storage', 'auth'],
      'Failed to put session into a storage.',
      error,
    );
  }
  return '';
};

export function useSession() {
  const [session, set, remove] = useLocalStorage(STORAGE_KEY, null, {
    deserializer: deserializeSession,
    serializer: serializeSession,
  });

  return useMemo(
    () => [session, {set, remove}] as const,
    [session, set, remove],
  );
}

export const getSession = (): Session | null => {
  return deserializeSession(localStorage.getItem(STORAGE_KEY));
};

export const setSession = <S extends Session>(
  session: S | null | undefined,
) => {
  try {
    localStorage.setItem(STORAGE_KEY, serializeSession(session));
    /**
     * @link https://github.com/juliencrn/usehooks-ts/blob/61949134144d3690fe9f521260a16c779a6d3797/packages/usehooks-ts/src/useLocalStorage/useLocalStorage.ts#L141
     */
    window.dispatchEvent(new StorageEvent('local-storage', {key: STORAGE_KEY}));
  } catch (error) {
    logger.error(
      ['storage', 'auth'],
      'Failed to put session into a storage.',
      error,
    );
  }
};

export const removeSession = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    /**
     * @link https://github.com/juliencrn/usehooks-ts/blob/61949134144d3690fe9f521260a16c779a6d3797/packages/usehooks-ts/src/useLocalStorage/useLocalStorage.ts#L141
     */
    window.dispatchEvent(new StorageEvent('local-storage', {key: STORAGE_KEY}));
  } catch (error) {
    logger.error(
      ['storage', 'auth'],
      'Failed to remove session from storage.',
      error,
    );
  }
};

export const isSessionExpired = (session: Session | null) => {
  const expires_at = session?.expires_at;
  if (!expires_at) return true;
  return new Date(expires_at * 1000) < new Date();
};
