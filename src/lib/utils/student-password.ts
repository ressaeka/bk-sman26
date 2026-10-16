
export function generateInitialStudentPassword(nisn: string): string {
  return `${nisn.trim()}#sman26`;
}

export function generateInitialCounselorPassword(nip: string): string {
  return `${nip.trim()}#sman26`;
}