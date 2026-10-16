export const AUTH_CONSTANTS = {
  SESSION_COOKIE_NAME: "bk_session_token",
  SESSION_DURATION_DAYS: 7,
  SESSION_DURATION_MS: 7 * 24 * 60 * 60 * 1000,
  ROLES: {
    SISWA: "SISWA",
    BK: "BK",
  },
} as const;

export type UserRole = (typeof AUTH_CONSTANTS.ROLES)[keyof typeof AUTH_CONSTANTS.ROLES];