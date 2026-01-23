import {asyncThrottle} from '@tanstack/react-pacer';
import * as Comlink from 'comlink';
import {liveQuery, type Subscription} from 'dexie';
import {type ApiClient, getAPIClient} from '@/providers/api/api-client';
import {getDBInstance, type List} from '@/providers/storage/data-db';
import {logger} from '@/utils/logger';

// TODO: Implement truly type-safe message event
export type SyncMessageEvent = MessageEvent<{
  scope: 'sync';
  isRunning: boolean;
}>;

type Session = {
  token_type?: string;
  access_token: string;
};

// @ts-expect-error Ok so far
class SyncManager {
  private db;
  private subscriptions?: Subscription[];
  private isRunning = false;

  public constructor() {
    logger.debug(['worker', 'init', 'sync'], 'Init sync manager.');

    this.db = getDBInstance();

    logger.debug(['worker', 'init', 'sync'], 'Sync manager has initialized.');
  }

  public async run(session: Session) {
    logger.debug(['worker', 'sync'], 'Run sync.', this);

    const api = getAPIClient(session);

    this.subscriptions = [await this.observe_lists(api)];

    logger.debug(['worker', 'sync'], 'Sync started.', this);
  }

  public async suppress() {
    logger.debug(['worker', 'sync'], 'Suppress sync.', this);

    if (this.subscriptions) {
      await Promise.all(
        this.subscriptions.map((subscription) => subscription.unsubscribe()),
      );
    }

    logger.debug(['worker', 'sync'], 'Sync suppressed.', this);
  }

  private async observe_lists(api: ApiClient) {
    logger.debug(['worker', 'sync'], 'Lists observer started.', this);

    const sync = asyncThrottle(this.sync_lists.bind(this), {
      wait: 5000,
      trailing: true,
      leading: true,
    });

    const getData = () => this.db.lists.toArray();
    const data = await getData();
    await sync(api, data);

    return liveQuery(getData).subscribe({
      next: (data) => sync(api, data),
      error: (error) => {
        logger.error(['worker', 'sync'], 'Live query error', error);
      },
    });
  }

  private async sync_lists(api: ApiClient, local: List[]) {
    try {
      this.isRunning = true;
      self.postMessage({scope: 'sync', isRunning: this.isRunning});

      logger.debug(['worker', 'sync'], 'Sync lists started.', local, this);

      const remote = await api.lists.push(local);
      const {removed, created, updated} = this.diff_changes(local, remote);

      await this.db.transaction('rw', this.db.lists, async () => {
        return Promise.all([
          this.db.lists.bulkDelete(removed),
          this.db.lists.bulkAdd(created),
          this.db.lists.bulkUpdate(updated),
        ]);
      });

      logger.debug(['worker', 'sync'], 'Sync lists finished.', {
        remote,
        removed,
        created,
        updated,
      });
    } catch (error) {
      logger.error(['worker', 'sync'], 'Sync lists failed.', error);
      throw error;
    } finally {
      this.isRunning = false;
      self.postMessage({scope: 'sync', isRunning: this.isRunning});
    }
  }

  private diff_changes<
    L extends {id: ID; updated_at?: Date | null},
    R extends {id: ID; updated_at: Date | null},
  >(local: L[], remote: R[]) {
    const localMap = new Map(local.map((i) => [i.id, i]));

    const localIds = new Set(local.map(({id}) => id));
    const remoteIds = new Set(remote.map(({id}) => id));

    const createdIds = remoteIds.difference(localIds);
    const updatedIds = remoteIds.intersection(localIds);

    const removed = [...localIds.difference(remoteIds).values()];
    const created = remote.filter(({id}) => createdIds.has(id));
    const updated = remote
      .filter(
        ({id, updated_at}) =>
          updatedIds.has(id) &&
          updated_at?.getTime() !== localMap.get(id)?.updated_at?.getTime(),
      )
      .map(({id, ...changes}) => ({key: id, changes}));

    return {removed, created, updated};
  }
}

const manager = new SyncManager();
// @ts-expect-error Ok so far
export type SyncManager = typeof manager;
Comlink.expose(manager);
