import crypto from 'crypto';

import { isMongoConnected } from '../database.js';
import { memoryStore } from '../memoryStore.js';
import User from '../models/User.js';
import { HttpError } from '../utils/httpError.js';

const normalizeText = (value) => String(value ?? '').trim();
const usernameKey = (username) => normalizeText(username).toLowerCase();

const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
};

const verifyPassword = (password, passwordHash) => {
  const [salt, storedHash] = String(passwordHash || '').split(':');

  if (!salt || !storedHash) {
    return false;
  }

  const incomingHash = crypto.scryptSync(password, salt, 64);
  const storedBuffer = Buffer.from(storedHash, 'hex');

  return storedBuffer.length === incomingHash.length && crypto.timingSafeEqual(storedBuffer, incomingHash);
};

const toUser = (user) => {
  if (!user) {
    return null;
  }

  const plain = user.toObject ? user.toObject() : user;
  return {
    id: String(plain._id || plain.id),
    username: plain.username,
    fullName: plain.fullName,
  };
};

const validateRegistration = ({ confirmPassword, fullName, password, username }) => {
  if (normalizeText(fullName).length < 2) {
    throw new HttpError(400, 'Full name is required.');
  }

  if (normalizeText(username).length < 3) {
    throw new HttpError(400, 'Username must have at least 3 characters.');
  }

  if (normalizeText(password).length < 4) {
    throw new HttpError(400, 'Password must have at least 4 characters.');
  }

  if (password !== confirmPassword) {
    throw new HttpError(400, 'Passwords do not match.');
  }
};

export const registerUser = async (payload) => {
  const fullName = normalizeText(payload.fullName);
  const username = normalizeText(payload.username);
  const password = normalizeText(payload.password);
  const confirmPassword = normalizeText(payload.confirmPassword);
  const key = usernameKey(username);
  const adminKey = usernameKey(process.env.ADMIN_USERNAME || 'admin');

  validateRegistration({ confirmPassword, fullName, password, username });

  if (key === adminKey) {
    throw new HttpError(409, 'This username is already registered.');
  }

  if (isMongoConnected()) {
    const existingUser = await User.findOne({ usernameKey: key }).lean();
    if (existingUser) {
      throw new HttpError(409, 'This username is already registered.');
    }

    try {
      const user = await User.create({
        username,
        usernameKey: key,
        fullName,
        passwordHash: hashPassword(password),
      });
      return toUser(user);
    } catch (error) {
      if (error?.code === 11000) {
        throw new HttpError(409, 'This username is already registered.');
      }
      throw error;
    }
  }

  if (memoryStore.users.has(key)) {
    throw new HttpError(409, 'This username is already registered.');
  }

  const user = {
    id: crypto.randomUUID(),
    username,
    usernameKey: key,
    fullName,
    passwordHash: hashPassword(password),
  };
  memoryStore.users.set(key, user);
  return toUser(user);
};

export const loginUser = async (payload) => {
  const username = normalizeText(payload.username);
  const password = normalizeText(payload.password);
  const key = usernameKey(username);
  const adminUsername = normalizeText(process.env.ADMIN_USERNAME || 'admin');
  const adminPassword = normalizeText(process.env.ADMIN_PASSWORD || 'admin123');

  if (key === usernameKey(adminUsername) && password === adminPassword) {
    return {
      username: adminUsername,
      fullName: 'System Administrator',
    };
  }

  const user = isMongoConnected()
    ? await User.findOne({ usernameKey: key }).lean()
    : memoryStore.users.get(key);

  if (!user || !verifyPassword(password, user.passwordHash)) {
    throw new HttpError(401, 'Invalid username or password.');
  }

  return toUser(user);
};
