/** biome-ignore-all lint/style/noNonNullAssertion: It's okay */
interface Input {
  id: string | null;
  title: string;
  // items: z.object({}).loose().array().nullish(),
  created_at: Date;
  updated_at: Date | null;
  deleted_at: Date | null;
}

interface Remove {
  id: string;
  deleted_at: Date;
}

interface Create {
  title: string;
  created_at: Date;
  updated_at: Date | null;
}

interface Update {
  id: string;
  title: string;
  created_at: Date;
  updated_at: Date | null;
}

interface Db {
  remove: (input: Remove[]) => Promise<void>;
  create: (input: Create[]) => Promise<void>;
  update: (input: Update[]) => Promise<void>;
  select: () => Promise<
    {id: string; title: string; created_at: Date; updated_at: Date | null}[]
  >;
}

export default async function sync(db: Db, input: Input[]) {
  const remove = input
    .filter(({id, deleted_at}) => id && deleted_at)
    .map(({id, deleted_at}) => ({
      id: id!,
      deleted_at: deleted_at!,
    }));

  const create = input
    .filter(({id, deleted_at}) => !id && !deleted_at)
    .map(({id, deleted_at, ...rest}) => rest);

  const update = input
    .filter(({id, deleted_at}) => id && !deleted_at)
    .map(({id, deleted_at, ...rest}) => ({
      id: id!,
      ...rest,
    }));

  await Promise.all([db.remove(remove), db.update(update), db.create(create)]);
  return db.select();
}
