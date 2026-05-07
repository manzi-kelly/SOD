import express from 'express';

import {
  clearSessionCookie,
  createSession,
  currentUser,
  destroySession,
  setSessionCookie,
} from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errors.js';
import { loginUser, registerUser } from '../services/userService.js';

const router = express.Router();

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const user = await loginUser(req.body);

    const sessionId = createSession(user.username);
    setSessionCookie(res, sessionId);

    res.json({
      message: 'Login successful.',
      user,
    });
  }),
);

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const user = await registerUser(req.body);
    const sessionId = createSession(user.username);
    setSessionCookie(res, sessionId);

    res.status(201).json({
      message: 'Account created successfully.',
      user,
    });
  }),
);

router.get('/me', (req, res) => {
  const user = currentUser(req);
  res.json({ user });
});

router.post('/logout', (req, res) => {
  destroySession(req);
  clearSessionCookie(res);
  res.json({ message: 'Logged out successfully.' });
});

export default router;
