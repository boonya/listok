/** biome-ignore-all lint/style/noNonNullAssertion: It's okay */
export default async function sync(db: Db, input: Input[]) {
  const remove = input
    .filter(({id, deleted_at}) => typeof id === 'string' && deleted_at)
    .map(({id, deleted_at}) => ({
      id: id as string,
      deleted_at: deleted_at!,
    }));

  const update = input
    .filter(({id, deleted_at}) => typeof id === 'string' && !deleted_at)
    .map(({id, deleted_at, ...rest}) => ({
      id: id as string,
      ...rest,
    }));

  const create = input
    .filter(({id, deleted_at}) => typeof id !== 'string' && !deleted_at)
    .map(({id, deleted_at, ...rest}) => rest);

  // TODO: Do it within a transaction
  await Promise.all([db.remove(remove), db.update(update), db.create(create)]);
  const synced = await db.select();

  const created = getCreated(input, synced);
  const updated = getUpdated(input, synced);
  const removed = getRemoved(input, synced);

  return {created, updated, removed};
}

type List = {
  id: string;
  title: string;
  created_at: Date;
  updated_at: Date | null;
  order: number | null;
};

function getCreated(input: Input[], synced: List[]) {
  const ids = new Set(input.map(({id}) => id));

  const created: List[] = [];

  for (const syncedItem of synced) {
    if (ids.has(syncedItem.id)) continue;
    created.push(syncedItem);
  }

  return created;
}

function getUpdated(input: Input[], synced: List[]) {
  const inputMap = new Map(input.map((i) => [i.id, i]));

  const updated: {key: string | number; changes: Partial<List>}[] = [];

  for (const syncedItem of synced) {
    const inputItem = inputMap.get(syncedItem.id);
    if (!inputItem) continue;

    if (
      syncedItem.title === inputItem.title &&
      syncedItem.created_at.getTime() === inputItem.created_at.getTime() &&
      syncedItem.updated_at?.getTime() === inputItem.updated_at?.getTime()
    ) {
      continue;
    }

    updated.push({key: syncedItem.id, changes: syncedItem});
  }

  return updated;
}

function getRemoved(input: Input[], synced: List[]) {
  const inputIds = new Set(input.map(({id}) => id));
  const syncedIds = new Set(synced.map(({id}) => id));

  return [...inputIds.difference(syncedIds).values()];
}

interface Input {
  id: string | number;
  title: string;
  created_at: Date;
  updated_at: Date | null;
  deleted_at: Date | null;
  order: number | null;
}

interface Remove {
  id: string;
  deleted_at: Date;
}

interface Create {
  title: string;
  created_at: Date;
  updated_at: Date | null;
  order: number | null;
}

interface Update {
  id: string;
  title: string;
  created_at: Date;
  updated_at: Date | null;
  order: number | null;
}

interface Db {
  remove: (input: Remove[]) => Promise<void>;
  create: (input: Create[]) => Promise<void>;
  update: (input: Update[]) => Promise<void>;
  select: () => Promise<List[]>;
}
