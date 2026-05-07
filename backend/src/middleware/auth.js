import crypto from 'crypto';

import { HttpError } from '../utils/httpError.js';

const COOKIE_NAME = 'epms_sid';
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;
const sessions = new Map();

const parseCookies = (cookieHeader = '') =>
  cookieHeader
    .split(';')
    .map((cookie) => cookie.trim())
    .filter(Boolean)
    .reduce((cookies, cookie) => {
      const separatorIndex = cookie.indexOf('=');
      if (separatorIndex === -1) {
        return cookies;
      }

      const key = cookie.slice(0, separatorIndex);
      const value = cookie.slice(separatorIndex + 1);
      cookies[key] = decodeURIComponent(value);
      return cookies;
    }, {});

const getSession = (req) => {
  const cookies = parseCookies(req.headers.cookie);
  const sessionId = cookies[COOKIE_NAME];

  if (!sessionId) {
    return null;
  }

  const session = sessions.get(sessionId);
  if (!session) {
    return null;
  }

  if (session.expiresAt < Date.now()) {
    sessions.delete(sessionId);
    return null;
  }

  session.expiresAt = Date.now() + SESSION_DURATION_MS;
  return { id: sessionId, ...session };
};

export const createSession = (username) => {
  const sessionId = crypto.randomBytes(32).toString('hex');
  sessions.set(sessionId, {
    username,
    expiresAt: Date.now() + SESSION_DURATION_MS,
  });
  return sessionId;
};

export const destroySession = (req) => {
  const session = getSession(req);
  if (session) {
    sessions.delete(session.id);
  }
};

export const setSessionCookie = (res, sessionId) => {
  res.cookie(COOKIE_NAME, sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: SESSION_DURATION_MS,
    path: '/',
  });
};

export const clearSessionCookie = (res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
};

export const currentUser = (req) => {
  const session = getSession(req);
  return session ? { username: session.username } : null;
};

export const requireAuth = (req, res, next) => {
  const user = currentUser(req);

  if (!user) {
    next(new HttpError(401, 'Please login before using EPMS.'));
    return;
  }

  req.user = user;
  next();
};
