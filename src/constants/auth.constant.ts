export const AUTH_CONSTANTS = {
  SESSION_COOKIE_NAME: "bk_session_token",
  SESSION_DURATION_DAYS: 7,
  SESSION_DURATION_MS: 7 * 24 * 60 * 60 * 1000,
  ROLES: {
    SISWA: "SISWA",
    BK: "BK",
  },
  DUMMY_ARGON2_HASH : "$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHQ$RdescudvJCsgqlfreOJRomJTuBpApnvJNKvFsUMv40U"

} as const;

export type UserRole = (typeof AUTH_CONSTANTS.ROLES)[keyof typeof AUTH_CONSTANTS.ROLES];