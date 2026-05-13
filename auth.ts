import type { NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

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
