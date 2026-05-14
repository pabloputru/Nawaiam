import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';
import { addMemoryResult, listMemoryResultsByEmail } from '@/lib/result-store';

type CreateResultBody = {
  gameId?: string;
  gameTitle?: string;
  score?: number;
  total?: number;
  label?: string;
};

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const results = await prisma.gameResult.findMany({
      where: { email: session.user.email },
      orderBy: { createdAt: 'desc' },
      take: 12,
    });

    return NextResponse.json({ results });
  } catch {
    const fallbackResults = listMemoryResultsByEmail(session.user.email, 12);
    return NextResponse.json({ results: fallbackResults, dbUnavailable: true, storage: 'memory' }, { status: 200 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const body = (await request.json()) as CreateResultBody;

  if (!body.gameId || !body.gameTitle || typeof body.score !== 'number' || typeof body.total !== 'number' || !body.label) {
    return NextResponse.json({ error: 'Payload invalido' }, { status: 400 });
  }

  const userName = session.user.name || session.user.email.split('@')[0] || 'usuario';

  try {
    const created = await prisma.gameResult.create({
      data: {
        email: session.user.email,
        userName,
        gameId: body.gameId,
        gameTitle: body.gameTitle,
        score: body.score,
        total: body.total,
        label: body.label,
      },
    });

    return NextResponse.json({ result: created }, { status: 201 });
  } catch {
    const fallbackResult = addMemoryResult({
      email: session.user.email,
      userName,
      gameId: body.gameId,
      gameTitle: body.gameTitle,
      score: body.score,
      total: body.total,
      label: body.label,
    });

    return NextResponse.json({ result: fallbackResult, dbUnavailable: true, storage: 'memory' }, { status: 201 });
  }
}
