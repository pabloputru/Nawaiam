import { createHash, randomBytes, randomUUID } from 'crypto';
import { NextResponse } from 'next/server';

import { addMemoryResetToken, findMemoryUserByEmail } from '@/lib/auth-store';
import { prisma } from '@/lib/prisma';

type ForgotPasswordBody = {
  email?: string;
};

type DeliveryStatus = 'sent' | 'not_configured' | 'failed' | 'in_app_link';

type DeliveryInfo = {
  status: DeliveryStatus;
  provider: 'smtp' | 'none';
  reason: string;
  requestId: string;
};

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

function getBaseUrl() {
  return process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || process.env.MAIL_FROM || 'no-reply@nawaiam.com';

  const configured = Boolean(host && port && user && pass);

  return {
    configured,
    host,
    port,
    user,
    pass,
    from,
    secure: process.env.SMTP_SECURE === 'true' || port === 465,
  };
}

async function sendResetEmail(email: string, resetUrl: string, requestId: string): Promise<DeliveryInfo> {
  const smtp = getSmtpConfig();

  if (!smtp.configured || !smtp.host || !smtp.user || !smtp.pass) {
    return {
      status: 'not_configured',
      provider: 'none',
      reason: 'SMTP configuration missing (SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS)',
      requestId,
    };
  }

  try {
    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth: {
        user: smtp.user,
        pass: smtp.pass,
      },
    });

    await transporter.sendMail({
      from: smtp.from,
      to: email,
      subject: 'Recuperacion de contrasena - Nawaiam',
      text: `Recibimos una solicitud para restablecer tu contrasena.\n\nUsa este enlace (valido por 30 minutos):\n${resetUrl}\n\nSi no solicitaste este cambio, ignora este correo.`,
      html: `
        <p>Recibimos una solicitud para restablecer tu contrasena.</p>
        <p>Usa este enlace (valido por 30 minutos):</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>Si no solicitaste este cambio, ignora este correo.</p>
      `,
    });

    return {
      status: 'sent',
      provider: 'smtp',
      reason: 'Message accepted by SMTP transport',
      requestId,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown SMTP send error';

    console.error('Forgot password SMTP send error', {
      requestId,
      message,
      name: error instanceof Error ? error.name : 'Error',
    });

    return {
      status: 'failed',
      provider: 'smtp',
      reason: message,
      requestId,
    };
  }
}

export async function POST(request: Request) {
  const requestId = randomUUID();
  const body = (await request.json()) as ForgotPasswordBody;
  const email = String(body.email || '').trim().toLowerCase();

  if (!email) {
    return NextResponse.json({ error: 'Email requerido', requestId }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({
        ok: true,
        message: 'Si el email existe, enviamos instrucciones para recuperar la contrasena.',
        delivery: {
          status: 'in_app_link',
          provider: 'none',
          reason: 'Email not found or masked response',
          requestId,
        } satisfies DeliveryInfo,
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

    const delivery = await sendResetEmail(email, resetUrl, requestId);

    const shouldExposeLink = delivery.status !== 'sent';

    return NextResponse.json({
      ok: true,
      message:
        delivery.status === 'sent'
          ? 'Te enviamos un email con instrucciones para recuperar la contrasena.'
          : 'No se pudo enviar el email automaticamente. Usa el link de recupero y revisa el diagnostico.',
      resetUrl: shouldExposeLink ? resetUrl : undefined,
      delivery,
    });
  } catch (error) {
    console.error('Forgot password API error', {
      requestId,
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'Error',
    });

    const memoryUser = findMemoryUserByEmail(email);

    if (!memoryUser) {
      return NextResponse.json({
        ok: true,
        message: 'Si el email existe, enviamos instrucciones para recuperar la contrasena.',
        delivery: {
          status: 'in_app_link',
          provider: 'none',
          reason: 'Email not found or masked response',
          requestId,
        } satisfies DeliveryInfo,
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

    const delivery = await sendResetEmail(email, resetUrl, requestId);

    return NextResponse.json({
      ok: true,
      message:
        delivery.status === 'sent'
          ? 'Te enviamos un email con instrucciones para recuperar la contrasena (modo contingencia de datos).'
          : 'Modo contingencia activo: email no enviado automaticamente. Usa el link de recupero y revisa el diagnostico.',
      resetUrl,
      delivery,
      dbUnavailable: true,
      storage: 'memory',
    });
  }
}
