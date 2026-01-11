/** biome-ignore-all lint/suspicious/noConsole: It's okay so far util we decide hot to log it properly */

// TODO: Decide on logging strategy
// import pino from 'pino';
// const logger = pino();

export type ScopeValue =
  | 'common'
  | 'init'
  | 'sync'
  | 'worker'
  | 'auth'
  | 'storage'
  | 'network';

export type Scope = ScopeValue | ScopeValue[] | null | undefined;

const formatScope = (scope: Scope) => {
  if (Array.isArray(scope)) {
    return scope.map((v) => `[${v}]`).join('');
  }
  return `[${scope || 'common'}]`;
};

export const logger = {
  info: (scope: Scope, ...args: unknown[]) =>
    console.info(`[info]${formatScope(scope)}`, ...args),

  debug: (scope: Scope, ...args: unknown[]) =>
    console.debug(`[debug]${formatScope(scope)}`, ...args),

  error: (scope: Scope, ...args: unknown[]) =>
    console.error(`[error]${formatScope(scope)}`, ...args),

  warn: (scope: Scope, ...args: unknown[]) =>
    console.warn(`[warn]${formatScope(scope)}`, ...args),
};
