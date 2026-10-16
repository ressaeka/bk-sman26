import type { NextResponse } from 'next/server';
import { AUTH_CONSTANTS } from '@/constants/auth.constant';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

export function setSessionCookie(response: NextResponse, token: string, expiresAt: Date) {
  response.cookies.set({
    name: AUTH_CONSTANTS.SESSION_COOKIE_NAME,
    value: token,
    expires: expiresAt,
    ...COOKIE_OPTIONS,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: AUTH_CONSTANTS.SESSION_COOKIE_NAME,
    value: '',
    expires: new Date(0),
    ...COOKIE_OPTIONS,
  });
}