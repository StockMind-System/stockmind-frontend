export type UserRole = 'ADMIN' | 'ANALYST' | 'USER';
export interface User { id: string; name: string; email: string; roles: UserRole[]; }
