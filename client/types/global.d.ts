import '@total-typescript/ts-reset';

declare global {
  type ID = number | string;
  const REVISION: string;
  const API_URL: string;
}
