import {asyncThrottle} from '@tanstack/react-pacer';
import * as Comlink from 'comlink';
import {liveQuery} from 'dexie';
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
  private api?: ApiClient;
  private isRunning = false;
  private session?: Session;

  public constructor() {
    logger.debug(['worker', 'init', 'sync'], 'Init sync manager.');

    this.db = getDBInstance();
    this.observeLists();

    logger.debug(['worker', 'init', 'sync'], 'Sync manager has initialized.');
  }

  private observeLists() {
    const syncLists = asyncThrottle(this.syncLists.bind(this), {
      wait: 5000,
      trailing: true,
      leading: true,
    });

    const observable = liveQuery(() => this.db.lists.toArray());

    return observable.subscribe({
      next: (lists) => syncLists(lists),
      error: (error) => {
        logger.error(['worker', 'sync'], 'Live query error', error);
      },
    });
  }

  public async resume(session: Session) {
    this.session = session;
    this.api = getAPIClient(this.session);

    if (this.isRunning) return;
    logger.debug(['worker', 'sync'], 'Resume sync operations.', this);
  }

  public async suppress() {
    if (!this.isRunning) return;
    logger.debug(['worker', 'sync'], 'Suppress sync operation.', this);
  }

  public async syncLists(lists: List[]) {
    logger.debug(['worker', 'sync'], 'Sync lists init.', {lists}, this);
    if (!this.session || !this.api) {
      logger.debug(['worker', 'sync'], 'API token missed. Sync skipped.', this);
      return;
    }

    if (this.isRunning) return;

    try {
      this.isRunning = true;

      self.postMessage({scope: 'sync', isRunning: this.isRunning});
      logger.debug(['worker', 'sync'], 'Start sync operations.', {lists}, this);

      // const to_sync = await this.api.lists.sync(lists);
      // await new Promise((resolve) => setTimeout(resolve, 5000));
    } catch (error) {
      // biome-ignore lint/complexity/noUselessCatch: I need it here. --- IGNORE ---
      throw error;
    } finally {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      this.isRunning = false;
      self.postMessage({scope: 'sync', isRunning: this.isRunning});
    }
  }
}

const manager = new SyncManager();
// @ts-expect-error Ok so far
export type SyncManager = typeof manager;
Comlink.expose(manager);
