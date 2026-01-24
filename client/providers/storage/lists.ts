import {getDBInstance} from '@/providers/storage/data-db';

export function getListsStorage() {
  const db = getDBInstance();

  const getAll = () => {
    return db.lists.toArray();
  };

  const listing = async () => {
    const list = await db.lists.filter(({deleted_at}) => !deleted_at).toArray();

    // order by "order" asc nulls first, "created_at" desc
    return list.toSorted((a, b) => {
      const aHasOrder = a.order !== null && a.order !== undefined;
      const bHasOrder = b.order !== null && b.order !== undefined;

      if (!aHasOrder && !bHasOrder) {
        // both missing order -> newest first
        return b.created_at.getTime() - a.created_at.getTime();
      }
      if (!aHasOrder && bHasOrder) return -1;
      if (aHasOrder && !bHasOrder) return 1;

      // both have order -> sort by order asc
      const ao = a.order as number;
      const bo = b.order as number;
      if (ao !== bo) return ao - bo;

      // equal order -> newest created_at first
      return b.created_at.getTime() - a.created_at.getTime();
    });
  };

  const create = async (title = '') => {
    await db.lists.add({
      created_at: new Date(),
      // FIXME: Remove fallback once debugging is done
      title: title || new Date().toISOString().split('T')[1],
    });
  };

  const remove = async (ids: ID[]) => {
    const deleted_at = new Date();
    const updates = ids.map((key) => ({
      key,
      changes: {deleted_at},
    }));
    // FIXME: Figure out why it's needed after refactoring
    // Otherwise it throws "TypeError: Cannot read properties of undefined (reading 'getMany')"
    await db.lists.toArray();
    /** ** */
    await db.lists.bulkUpdate(updates);
  };

  return {getAll, listing, create, /** update, */ remove};
}
