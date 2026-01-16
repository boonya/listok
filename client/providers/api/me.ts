import {keepPreviousData, queryOptions} from '@tanstack/react-query';
import {getAPIClient} from '@/providers/api/api-client';
import type {Session} from '@/providers/auth/session';

export const queryMe = (session: Session) =>
  queryOptions({
    queryKey: ['me'],
    queryFn: () => {
      const api = getAPIClient(session);
      return api.auth.me();
    },
    placeholderData: keepPreviousData,
    staleTime: session.ttl * 1000 - (Date.now() - session.issued_at * 1000),
  });
