import {expect, test, vi} from 'vitest';
import {z} from 'zod';
import DATASET_001 from './__data__/001.json';
import DATASET_002 from './__data__/002.json';
import sync from './sync';

const result: never[] = [];

const db = {
  remove: vi.fn(async () => void 0),
  create: vi.fn(async () => void 0),
  update: vi.fn(async () => void 0),
  select: vi.fn(async () => result),
};

/**
 * Transform date strings to Date objects.
 */
const DatasetSchema = z
  .object({
    id: z.string().nullish().default(null),
    title: z.string(),
    created_at: z.string().transform((v) => new Date(v)),
    updated_at: z
      .string()
      .nullish()
      .transform((v) => (v ? new Date(v) : null)),
    deleted_at: z
      .string()
      .nullish()
      .transform((v) => (v ? new Date(v) : null)),
  })
  .array();

test.for([
  ['empty', []],
  ['001', DATASET_001], // 0 create, 1 update, 2 remove
  ['002', DATASET_002], // 1 create, 1 update, 2 remove
] as const)('%s', async ([, dataset]) => {
  const result = await sync(db, DatasetSchema.parse(dataset));

  expect(db.create).toBeCalledTimes(1);
  expect(db.update).toBeCalledTimes(1);
  expect(db.remove).toBeCalledTimes(1);
  expect(db.select).toBeCalledTimes(1);
  expect(result).toEqual(result);

  expect(db.create.mock.calls[0]).toMatchSnapshot('create');
  expect(db.update.mock.calls[0]).toMatchSnapshot('update');
  expect(db.remove.mock.calls[0]).toMatchSnapshot('remove');
  expect(db.select.mock.calls[0]).toMatchSnapshot('select');
});
