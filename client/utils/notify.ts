import {toast} from 'sonner';
import {logger, type Scope} from '@/utils/logger';

export function notifyError(scope: Scope, error: unknown, message?: string) {
  const msg =
    message || (error instanceof Error ? error.message : 'Щось пішло не так.');
  logger.error(scope, msg, error);
  toast.error(msg);
}
