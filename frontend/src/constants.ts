/** Application constants for Signal Console. */

export const APP_NAME = 'Signal Console';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'Hindsight: Agent Memory That Learns';

export const API_PREFIX = '/api/v1';
export const HEALTH_ENDPOINT = '/health';

export const BANK_NAME_PATTERN = /^[a-zA-Z0-9_-]+$/;
export const BANK_NAME_MAX_LENGTH = 100;
export const BANK_DESCRIPTION_MAX_LENGTH = 500;

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export const CONFIG_DEFAULTS = {
  retain_chunk_size: 1000,
  enable_auto_consolidation: false,
  consolidation_threshold: 100,
} as const;

export const CHUNK_SIZE_MIN = 100;
export const CHUNK_SIZE_MAX = 10000;
export const CONSOLIDATION_THRESHOLD_MIN = 10;
export const CONSOLIDATION_THRESHOLD_MAX = 1000;

export const ROUTES = {
  DASHBOARD: '/',
  BANKS: '/banks',
  BANK_NEW: '/banks/new',
  BANK_DETAIL: (id: number) => `/banks/${id}`,
  BANK_EDIT: (id: number) => `/banks/${id}/edit`,
  MEMORIES: '/memories',
  RECALL: '/recall',
  CONSOLIDATION: '/consolidation',
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'sc_auth_token',
  USER_PREFERENCES: 'sc_user_preferences',
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;