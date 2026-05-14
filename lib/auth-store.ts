import { randomUUID } from 'crypto';

type MemoryUser = {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  birthDate: Date | null;
  position: string | null;
  company: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type MemoryResetToken = {
  tokenHash: string;
  email: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
};

const memoryUsersByEmail = new Map<string, MemoryUser>();
const memoryResetTokensByHash = new Map<string, MemoryResetToken>();

function cloneUser(user: MemoryUser) {
  return {
    ...user,
    birthDate: user.birthDate ? new Date(user.birthDate) : null,
    createdAt: new Date(user.createdAt),
    updatedAt: new Date(user.updatedAt),
  };
}

function cloneResetToken(token: MemoryResetToken) {
  return {
    ...token,
    expiresAt: new Date(token.expiresAt),
    usedAt: token.usedAt ? new Date(token.usedAt) : null,
    createdAt: new Date(token.createdAt),
  };
}

export function findMemoryUserByEmail(email: string) {
  const key = email.trim().toLowerCase();
  const user = memoryUsersByEmail.get(key);
  return user ? cloneUser(user) : null;
}

export function addMemoryUser(user: Omit<MemoryUser, 'id' | 'createdAt' | 'updatedAt'>) {
  const key = user.email.trim().toLowerCase();

  if (memoryUsersByEmail.has(key)) {
    throw new Error('MEMORY_USER_EXISTS');
  }

  const now = new Date();
  const created: MemoryUser = {
    ...user,
    email: key,
    id: randomUUID(),
    createdAt: now,
    updatedAt: now,
  };

  memoryUsersByEmail.set(key, created);

  return cloneUser(created);
}

export function updateMemoryUserPassword(email: string, passwordHash: string) {
  const key = email.trim().toLowerCase();
  const current = memoryUsersByEmail.get(key);

  if (!current) {
    return null;
  }

  const updated: MemoryUser = {
    ...current,
    passwordHash,
    updatedAt: new Date(),
  };

  memoryUsersByEmail.set(key, updated);

  return cloneUser(updated);
}

export function addMemoryResetToken(input: { tokenHash: string; email: string; expiresAt: Date }) {
  const created: MemoryResetToken = {
    tokenHash: input.tokenHash,
    email: input.email.trim().toLowerCase(),
    expiresAt: input.expiresAt,
    usedAt: null,
    createdAt: new Date(),
  };

  memoryResetTokensByHash.set(input.tokenHash, created);

  return cloneResetToken(created);
}

export function findValidMemoryResetToken(tokenHash: string) {
  const token = memoryResetTokensByHash.get(tokenHash);

  if (!token) {
    return null;
  }

  const now = new Date();

  if (token.usedAt || token.expiresAt <= now) {
    return null;
  }

  return cloneResetToken(token);
}

export function markMemoryResetTokenUsed(tokenHash: string) {
  const token = memoryResetTokensByHash.get(tokenHash);

  if (!token) {
    return;
  }

  memoryResetTokensByHash.set(tokenHash, {
    ...token,
    usedAt: new Date(),
  });
}

export function invalidateMemoryResetTokensByEmail(email: string) {
  const key = email.trim().toLowerCase();

  for (const [tokenHash, token] of memoryResetTokensByHash.entries()) {
    if (token.email !== key || token.usedAt) {
      continue;
    }

    memoryResetTokensByHash.set(tokenHash, {
      ...token,
      usedAt: new Date(),
    });
  }
}
