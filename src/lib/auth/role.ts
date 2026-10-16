export const ROLES = { BK: 'BK', SISWA: 'SISWA' } as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export function isRole(role: string, expectedRole: Role ): boolean {
  return role === expectedRole;
}