import {createRoot} from 'react-dom/client';
import App from '@/react-app';
import {logger} from '@/utils/logger';

try {
  const mountPoint = document.querySelector('#root')!;
  createRoot(mountPoint).render(<App />);
} catch (error) {
  logger.error(['init'], 'Failed to render an app.', error);
  const message =
    (error instanceof Error && error.message) || 'Щось пішло не так';
  document.querySelector('body')!.innerHTML =
    `<h1 role="alert">${message}</h1>`;
}
