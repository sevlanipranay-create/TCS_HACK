// src/api/client.js
// Client factory switching transparently between httpClient and mockClient

import { httpClient } from './httpClient.js';
import { mockClient } from './mockClient.js';

export function getClient() {
  const isMock = import.meta.env?.VITE_USE_MOCK === 'true';
  return isMock ? mockClient : httpClient;
}

export const client = getClient();
export default client;
