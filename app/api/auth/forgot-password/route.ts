import { createHash, randomBytes } from 'crypto';
import { NextResponse } from 'next/server';

import { addMemoryResetToken, findMemoryUserByEmail } from '@/lib/auth-store';
import { prisma } from '@/lib/prisma';

type ForgotPasswordBody = {
  email?: string;
};

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

function getBaseUrl() {
  return process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

export async function POST(request: Request) {
  const body = (await request.json()) as ForgotPasswordBody;
  const email = String(body.email || '').trim().toLowerCase();

  if (!email) {
    return NextResponse.json({ error: 'Email requerido' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({
        ok: true,
        message: 'Si el email existe, enviamos instrucciones para recuperar la contrasena.',
      });
    }

    const token = randomBytes(32).toString('hex');
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30);

    await prisma.passwordResetToken.create({
      data: {
        email,
        tokenHash,
        expiresAt,
      },
    });

    const resetUrl = `${getBaseUrl()}/reset-password?token=${token}`;

    // Temporary in-app delivery until email provider is configured.
    return NextResponse.json({
      ok: true,
      message: 'Se genero un link de recupero.',
      resetUrl,
    });
  } catch (error) {
    console.error('Forgot password API error', error);

    const memoryUser = findMemoryUserByEmail(email);

    if (!memoryUser) {
      return NextResponse.json({
        ok: true,
        message: 'Si el email existe, enviamos instrucciones para recuperar la contrasena.',
      });
    }

    const token = randomBytes(32).toString('hex');
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30);

    addMemoryResetToken({
      email,
      tokenHash,
      expiresAt,
    });

    const resetUrl = `${getBaseUrl()}/reset-password?token=${token}`;

    return NextResponse.json({
      ok: true,
      message: 'Se genero un link de recupero en modo contingencia.',
      resetUrl,
      dbUnavailable: true,
      storage: 'memory',
    });
  }
}
