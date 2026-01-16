import {beforeEach, expect, test, vi} from 'vitest';
import {getAPIClient} from '@/providers/api/api-client';
import {getDBInstance, type List} from '@/providers/storage/data-db';
import LOCAL_001 from './__data__/001.local';
import SERVER_001 from './__data__/001.server';
import LOCAL_002 from './__data__/002.local';
import SERVER_002 from './__data__/002.server';
import doSync from './do-sync';

vi.mock('@/providers/storage/data-db');
vi.mock('@/providers/api/api-client');

const api = getAPIClient();
type SyncToServer = typeof api.lists.sync;

const getLocal = vi.fn<() => Promise<List[]>>(async () => []);
const remove = vi.fn(async () => void 0);
const create = vi.fn(async () => void 0);
const transaction = vi.fn(async (_mode, _table, scope) => {
  await scope();
});
const syncToServer = vi.fn<SyncToServer>(async () => []);

beforeEach(() => {
  vi.mocked(getDBInstance).mockReturnValue({
    // @ts-expect-error -- mocking
    transaction,
    lists: {
      // @ts-expect-error -- mocking
      toArray: getLocal,
      // @ts-expect-error -- mocking
      bulkDelete: remove,
      // @ts-expect-error -- mocking
      bulkAdd: create,
    },
  });
  // @ts-expect-error -- mocking
  vi.mocked(getAPIClient).mockReturnValue({lists: {sync: syncToServer}});
});

const SESSION = {token_type: 'Bearer', access_token: Date.now().toString(36)};

test('should pass an access token to the API client instance.', async () => {
  await doSync(SESSION);

  expect(getAPIClient).toHaveBeenCalledWith(SESSION);
});

test.skip('should execute subsequent functions.', async () => {
  await doSync(SESSION);

  expect(getDBInstance).toBeCalledTimes(1);
  expect(getAPIClient).toBeCalledTimes(1);

  expect(getLocal).toBeCalledTimes(1);
  expect(syncToServer).toBeCalledTimes(1);

  expect(transaction).toBeCalledTimes(1);
  expect(remove).toBeCalledTimes(1);
  expect(create).toBeCalledTimes(1);
});

test.skip.for([
  [LOCAL_001, SERVER_001],
  [LOCAL_002, SERVER_002],
])('should sync linked lists to the client.', async ([
  LOCAL_DATASET,
  SERVER_DATASET,
]) => {
  // @ts-expect-error Mocking
  vi.mocked(getLocal).mockResolvedValue(LOCAL_DATASET);
  // @ts-expect-error Mocking
  vi.mocked(syncToServer).mockResolvedValue(SERVER_DATASET);

  await doSync(SESSION);

  expect(remove.mock.calls[0]).toMatchSnapshot('remove');
  expect(create.mock.calls[0]).toMatchSnapshot('create');
});
