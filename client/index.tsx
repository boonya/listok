import {createRoot} from 'react-dom/client';
import App from '@/react-app';
import {logger} from '@/utils/logger';

try {
  const mountPoint = document.querySelector('#root');
  if (!mountPoint) throw new Error('No mountpoint found.');
  createRoot(mountPoint).render(<App />);
} catch (error) {
  logger.error(['init'], 'Failed to render an app.', error);
  const message =
    (error instanceof Error && error.message) || 'Щось пішло не так';
  // biome-ignore lint/style/noNonNullAssertion: Even if it's not true we have no other option at this stage.
  document.querySelector('body')!.innerHTML =
    `<h1 role="alert">${message}</h1>`;
}
