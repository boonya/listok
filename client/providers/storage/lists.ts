import {getDBInstance} from '@/providers/storage/data-db';

export function getListsStorage() {
  const db = getDBInstance();

  const getAll = () => {
    return db.lists.toArray();
  };

  const listing = async () => {
    const list = await db.lists.filter(({deleted_at}) => !deleted_at).toArray();

    const sorted_by_created_at = list.toSorted((a, b) => {
      const left = a.created_at.getTime();
      const right = b.created_at.getTime();

      if (left > right) {
        return -1;
      }
      if (left < right) {
        return 1;
      }
      return 0;
    });

    const sorted_by_order = sorted_by_created_at.toSorted((a, b) => {
      const left = a.order ?? 0;
      const right = b.order ?? 0;

      if (left > right) {
        return 1;
      }
      if (left < right) {
        return -1;
      }
      return 0;
    });

    return sorted_by_order;
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
