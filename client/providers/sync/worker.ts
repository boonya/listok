import * as Comlink from 'comlink';
import {logger} from '@/utils/logger';

logger.debug(['worker', 'init', 'sync'], 'Init sync manager.');

export type SyncMessageEvent = MessageEvent<{
  scope: 'sync';
  isRunning: boolean;
}>;

let isRunning = false;
let token: string | null = null;

const resume = async (access_token: string) => {
  if (isRunning) return;
  logger.debug(['worker', 'sync'], 'Resume sync operations.', {isRunning});
  token = access_token;
  await start();
};

const suppress = async () => {
  if (!isRunning) return;
  logger.debug(['worker', 'sync'], 'Suppress sync operation.', {isRunning});
  await stop();
};

const start = async () => {
  if (isRunning || !token) return;
  isRunning = true;
  self.postMessage({scope: 'sync', isRunning});
  logger.debug(['worker', 'sync'], 'Start sync operations.', {
    access_token: token,
  });
  await new Promise((resolve) => setTimeout(resolve, 2000));
  await stop();
};

const stop = async () => {
  if (!isRunning) return;
  isRunning = false;
  self.postMessage({scope: 'sync', isRunning});
  logger.debug(['worker', 'sync'], 'Stop sync operations.');
};

const manager = {start, resume, suppress, isRunning};
export type SyncManager = typeof manager;
Comlink.expose(manager);

start();
logger.debug(['worker', 'init', 'sync'], 'Run sync manager.');
