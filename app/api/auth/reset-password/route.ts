import { createHash } from 'crypto';
import { NextResponse } from 'next/server';

import {
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

    const updatedUser = updateMemoryUserPassword(memoryResetToken.email, hashPassword(password));

    if (!updatedUser) {
      return NextResponse.json({ error: 'No se encontro el usuario del recupero' }, { status: 404 });
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
