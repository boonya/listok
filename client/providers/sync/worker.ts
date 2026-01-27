import {asyncThrottle} from '@tanstack/react-pacer';
import * as Comlink from 'comlink';
import {liveQuery, type Subscription} from 'dexie';
import {type ApiClient, getAPIClient} from '@/providers/api/api-client';
import {getDBInstance, type List} from '@/providers/storage/data-db';
import {logger} from '@/utils/logger';

export class SyncManager {
  private db;
  private subscriptions?: Subscription[];

  public constructor() {
    logger.debug(['worker', 'init', 'sync'], 'Init sync manager.');

    this.db = getDBInstance();

    logger.debug(['worker', 'init', 'sync'], 'Sync manager has initialized.');
  }

  public async run(session: {access_token: string; token_type?: string}) {
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

  private is_running(value: boolean) {
    self.postMessage({scope: 'sync', isRunning: value});
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
      logger.debug(['worker', 'sync'], 'Sync lists started.', local, this);

      this.is_running(true);

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
      this.is_running(false);
    }
  }

  private diff_changes<
    L extends {id: ID; version: number},
    R extends {id: ID; version: number},
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
        ({id, version}) =>
          updatedIds.has(id) && version !== localMap.get(id)?.version,
      )
      .map(({id, ...changes}) => ({key: id, changes}));

    return {removed, created, updated};
  }
}

Comlink.expose(new SyncManager(), self);
