import { createHash } from 'crypto';
import { NextResponse } from 'next/server';

import {
  addMemoryUser,
  findValidMemoryResetToken,
  invalidateMemoryResetTokensByEmail,
  markMemoryResetTokenUsed,
  updateMemoryUserPassword,
} from '@/lib/auth-store';
import { hashPassword } from '@/lib/password';
import { prisma } from '@/lib/prisma';

type ResetPasswordBody = {
  token?: string;
  password?: string;
};

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

function profileFromEmail(email: string) {
  const localPart = email.split('@')[0] || 'usuario';
  const cleaned = localPart.replace(/[^a-zA-Z0-9._-]/g, ' ').trim();
  const [firstName, ...rest] = cleaned.split(/[._\-\s]+/).filter(Boolean);

  return {
    firstName: firstName || 'Usuario',
    lastName: rest.join(' '),
  };
}

export async function POST(request: Request) {
  const body = (await request.json()) as ResetPasswordBody;
  const token = String(body.token || '').trim();
  const password = String(body.password || '');

  if (!token) {
    return NextResponse.json({ error: 'Token requerido' }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'La contrasena debe tener al menos 8 caracteres' }, { status: 400 });
  }

  try {
    const tokenHash = hashToken(token);

    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!resetToken) {
      return NextResponse.json({ error: 'El link de recupero no es valido o expiro' }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { email: resetToken.email },
        data: { passwordHash: hashPassword(password) },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
      prisma.passwordResetToken.updateMany({
        where: { email: resetToken.email, usedAt: null },
        data: { usedAt: new Date() },
      }),
    ]);

    return NextResponse.json({ ok: true, message: 'Contrasena actualizada con exito' });
  } catch (error) {
    console.error('Reset password API error', error);

    const tokenHash = hashToken(token);
    const memoryResetToken = findValidMemoryResetToken(tokenHash);

    if (!memoryResetToken) {
      return NextResponse.json({ error: 'El link de recupero no es valido o expiro' }, { status: 400 });
    }

    let updatedUser = updateMemoryUserPassword(memoryResetToken.email, hashPassword(password));

    if (!updatedUser) {
      const profile = profileFromEmail(memoryResetToken.email);

      try {
        addMemoryUser({
          email: memoryResetToken.email,
          passwordHash: hashPassword(password),
          firstName: profile.firstName,
          lastName: profile.lastName,
          birthDate: null,
          position: null,
          company: null,
        });
      } catch {
        // If user was created concurrently, update should succeed on retry.
      }

      updatedUser = updateMemoryUserPassword(memoryResetToken.email, hashPassword(password));
    }

    if (!updatedUser) {
      return NextResponse.json({ error: 'No se pudo actualizar el usuario del recupero en contingencia' }, { status: 500 });
    }

    markMemoryResetTokenUsed(tokenHash);
    invalidateMemoryResetTokensByEmail(memoryResetToken.email);

    return NextResponse.json({
      ok: true,
      message: 'Contrasena actualizada con exito (modo contingencia)',
      dbUnavailable: true,
      storage: 'memory',
    });
  }
}
