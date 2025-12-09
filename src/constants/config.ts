// Application configuration

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3030';

export const API_VERSION = 'v1';

export const STORAGE_KEYS = {
  THREADS: 'agent-ui-threads',
  MESSAGES_PREFIX: 'agent-ui-messages-',
} as const;

export const STORAGE_VERSION = 1;
