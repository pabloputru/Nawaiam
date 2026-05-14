import { NextResponse } from 'next/server';

import { addMemoryUser, findMemoryUserByEmail } from '@/lib/auth-store';
import { hashPassword } from '@/lib/password';
import { prisma } from '@/lib/prisma';

type RegisterBody = {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  position?: string;
  company?: string;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  const body = (await request.json()) as RegisterBody;

  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  const firstName = String(body.firstName || '').trim();
  const lastName = String(body.lastName || '').trim();
  const position = String(body.position || '').trim();
  const company = String(body.company || '').trim();

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Email invalido' }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'La contrasena debe tener al menos 8 caracteres' }, { status: 400 });
  }

  if (!firstName || !lastName) {
    return NextResponse.json({ error: 'Nombre y apellido son obligatorios' }, { status: 400 });
  }

  let parsedBirthDate: Date | null = null;
  if (body.birthDate) {
    const birthDate = new Date(body.birthDate);

    if (Number.isNaN(birthDate.getTime())) {
      return NextResponse.json({ error: 'Fecha de nacimiento invalida' }, { status: 400 });
    }

    parsedBirthDate = birthDate;
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      return NextResponse.json({ error: 'Ya existe un usuario con ese email' }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashPassword(password),
        firstName,
        lastName,
        birthDate: parsedBirthDate,
        position: position || null,
        company: company || null,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error('Register API error', error);

    const existingMemory = findMemoryUserByEmail(email);

    if (existingMemory) {
      return NextResponse.json({ error: 'Ya existe un usuario con ese email' }, { status: 409 });
    }

    try {
      const memoryUser = addMemoryUser({
        email,
        passwordHash: hashPassword(password),
        firstName,
        lastName,
        birthDate: parsedBirthDate,
        position: position || null,
        company: company || null,
      });

      return NextResponse.json(
        {
          user: {
            id: memoryUser.id,
            email: memoryUser.email,
            firstName: memoryUser.firstName,
            lastName: memoryUser.lastName,
          },
          dbUnavailable: true,
          storage: 'memory',
        },
        { status: 201 }
      );
    } catch {
      return NextResponse.json({ error: 'No se pudo crear el usuario' }, { status: 500 });
    }
  }
}
