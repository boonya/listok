import {Dexie, type EntityTable} from 'dexie';

export type List = {
  id: ID;
  title: string;
  created_at: Date;
  updated_at?: Date | null;
  deleted_at?: Date | null;
  order?: number | null;
};

function getDBInstance() {
  const db = new Dexie('data') as Dexie & {
    lists: EntityTable<List, 'id'>;
  };

  db.version(1).stores({
    lists: '++&id',
  });

  return db;
}

export {getDBInstance};
