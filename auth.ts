import type { NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

import { findMemoryUserByEmail } from '@/lib/auth-store';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/password';

const DEMO_EMAIL = process.env.DEMO_USER_EMAIL || 'demo@nawaiam.com';
const DEMO_PASSWORD = process.env.DEMO_USER_PASSWORD || 'demo1234';

export const authOptions: NextAuthOptions = {
  secret: process.env.AUTH_SECRET || 'dev-only-secret-change-in-production',
  session: {
    strategy: 'jwt',
  },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = String(credentials?.email || '').trim().toLowerCase();
        const password = String(credentials?.password || '');

        if (!email || !password) {
          return null;
        }

        try {
          const user = await prisma.user.findUnique({ where: { email } });

          if (user && verifyPassword(password, user.passwordHash)) {
            return {
              id: user.id,
              name: `${user.firstName} ${user.lastName}`.trim(),
              email: user.email,
            };
          }
        } catch (error) {
          console.error('Auth authorize DB error', error);
        }

        const memoryUser = findMemoryUserByEmail(email);

        if (memoryUser && verifyPassword(password, memoryUser.passwordHash)) {
          return {
            id: memoryUser.id,
            name: `${memoryUser.firstName} ${memoryUser.lastName}`.trim(),
            email: memoryUser.email,
          };
        }

        if (email !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
          return null;
        }

        const name = email.split('@')[0] || 'usuario';

        return {
          id: email,
          name,
          email,
        };
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
};
