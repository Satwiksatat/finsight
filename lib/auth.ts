export const AUTH_COOKIE_NAME = 'finsight_auth';
export const USER_COOKIE_NAME = 'finsight_user';
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 12; // 12 hours

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  title: string;
  org: string;
  avatarUrl?: string;
  timezone?: string;
};

export const demoUsers: AuthUser[] = [
  {
    id: 'cfo-john',
    name: 'John Chen',
    email: 'john.chen@agilitas.com',
    title: 'Chief Financial Officer',
    org: 'Agilitas Performance Retail',
    avatarUrl: '',
    timezone: 'America/New_York',
  },
  {
    id: 'vp-lucia',
    name: 'Lucia Martinez',
    email: 'lucia.martinez@agilitas.com',
    title: 'VP, FP&A and Strategy',
    org: 'Agilitas Performance Retail',
    avatarUrl: '',
    timezone: 'America/Chicago',
  },
  {
    id: 'controller-ian',
    name: 'Ian Patel',
    email: 'ian.patel@agilitas.com',
    title: 'Corporate Controller',
    org: 'Agilitas Performance Retail',
    avatarUrl: '',
    timezone: 'America/Los_Angeles',
  },
];

export const defaultAuthUser = demoUsers[0];

export function encodeUser(user: AuthUser): string {
  return encodeURIComponent(JSON.stringify(user));
}

export function decodeUser(value?: string | null): AuthUser | null {
  if (!value) return null;
  try {
    return JSON.parse(decodeURIComponent(value)) as AuthUser;
  } catch (error) {
    console.warn('Failed to decode auth user cookie', error);
    return null;
  }
}

export function createMockToken(email: string): string {
  const random = Math.random().toString(36).slice(2);
  return `${email}-${random}-${Date.now()}`;
}
