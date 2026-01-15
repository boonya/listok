import {getAPIClient} from '@/providers/api/api-client';
import {getDBInstance} from '@/providers/storage/data-db';

type Session = {
  token_type?: string;
  access_token: string;
};

export default async (session: Session) => {
  const api = getAPIClient(session);
  const db = getDBInstance();

  const local = await db.lists.toArray();
  const remote = await api.lists.sync(local);

  const localMap = new Map(local.filter(({id}) => !!id).map((i) => [i.id!, i]));
  const remoteMap = new Map(remote.map((i) => [i.id, i]));
  const localIds = new Set(localMap.keys());
  const remoteIds = new Set(remoteMap.keys());

  const missingIds = localIds.difference(remoteIds);
  const existentIds = localIds.intersection(remoteIds);

  const toBeRemoved = local
    .filter(({id}) => (id ? missingIds.has(id) : true))
    .map(({key}) => key);
  const toBeUpdated = local
    .filter(({id}) => !!id && existentIds.has(id))
    .map(({key, id}) => [remoteMap.get(id!)!, key] as const);

  console.debug('[sync]', {toBeRemoved, toBeUpdated});

  // db.transaction('rw', db.lists, async () => {
  //   await db.lists.bulkDelete(toBeRemoved);
  //   await db.lists.bulkPut(
  //     toBeUpdated.map(([values]) => values),
  //     toBeUpdated.map(([, key]) => key),
  //   );
  //   await db.lists.bulkAdd(remote);
  // });
};
