import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';
import { listMemoryResultsByEmail } from '@/lib/result-store';

type SummaryByGame = {
  gameId: string;
  gameTitle: string;
  attempts: number;
  avgScore: number;
  bestScore: number;
  avgPercent: number;
  latestAt: Date;
  latestLabel: string;
};

type CandidateProfile = {
  firstName: string;
  lastName: string;
  birthDate: Date | null;
  position: string | null;
  company: string | null;
};

function getErrorSummary(error: unknown) {
  if (!error || typeof error !== 'object') {
    return { message: 'Unknown error' };
  }

  const maybeError = error as { message?: string; code?: string; name?: string };

  return {
    name: maybeError.name || 'Error',
    code: maybeError.code,
    message: maybeError.message || 'No message',
  };
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect('/login');
  }

  const userEmail = session.user.email;
  const fallbackName = session.user.name || userEmail.split('@')[0] || 'usuario';
  let candidateProfile: CandidateProfile = {
    firstName: fallbackName,
    lastName: '',
    birthDate: null,
    position: null,
    company: null,
  };

  let results: Awaited<ReturnType<typeof prisma.gameResult.findMany>> = [];
  let dbUnavailable = false;

  try {
    const [dbUser, dbResults] = await prisma.$transaction([
      prisma.user.findUnique({
        where: { email: userEmail },
        select: {
          firstName: true,
          lastName: true,
          birthDate: true,
          position: true,
          company: true,
        },
      }),
      prisma.gameResult.findMany({
        where: { email: userEmail },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    results = dbResults;

    if (dbUser) {
      candidateProfile = {
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        birthDate: dbUser.birthDate,
        position: dbUser.position,
        company: dbUser.company,
      };
    }
  } catch (error) {
    dbUnavailable = true;
    console.error('Profile database error', getErrorSummary(error));
    results = listMemoryResultsByEmail(userEmail);
  }

  const fullName = `${candidateProfile.firstName} ${candidateProfile.lastName}`.trim() || fallbackName;

  const attempts = results.length;
  const totalScore = results.reduce((acc, result) => acc + result.score, 0);
  const totalPossible = results.reduce((acc, result) => acc + result.total, 0);
  const globalPercent = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;

  const bestPercent = results.reduce((acc, result) => {
    const percent = result.total > 0 ? Math.round((result.score / result.total) * 100) : 0;
    return Math.max(acc, percent);
  }, 0);

  const latest = results[0] || null;

  const byGameMap = new Map<string, SummaryByGame>();

  for (const result of results) {
    const current = byGameMap.get(result.gameId);
    const percent = result.total > 0 ? (result.score / result.total) * 100 : 0;

    if (!current) {
      byGameMap.set(result.gameId, {
        gameId: result.gameId,
        gameTitle: result.gameTitle,
        attempts: 1,
        avgScore: result.score,
        bestScore: result.score,
        avgPercent: percent,
        latestAt: result.createdAt,
        latestLabel: result.label,
      });
      continue;
    }

    const nextAttempts = current.attempts + 1;

    byGameMap.set(result.gameId, {
      gameId: result.gameId,
      gameTitle: current.gameTitle,
      attempts: nextAttempts,
      avgScore: (current.avgScore * current.attempts + result.score) / nextAttempts,
      bestScore: Math.max(current.bestScore, result.score),
      avgPercent: (current.avgPercent * current.attempts + percent) / nextAttempts,
      latestAt: current.latestAt,
      latestLabel: current.latestLabel,
    });
  }

  const summaryByGame = Array.from(byGameMap.values()).sort((a, b) => b.latestAt.getTime() - a.latestAt.getTime());

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-widest text-sky-300">Perfil del candidato</p>
              <h1 className="text-3xl font-bold">{fullName}</h1>
              <p className="mt-2 text-slate-300">Resumen personal de evaluaciones y resultados acumulados.</p>
            </div>
            <div className="flex gap-3">
              <Link href="/games" className="rounded-lg border border-slate-700 px-4 py-2 hover:bg-slate-800">
                Ir a evaluaciones
              </Link>
              <Link href="/" className="rounded-lg border border-slate-700 px-4 py-2 hover:bg-slate-800">
                Volver al Home
              </Link>
            </div>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-xs uppercase tracking-widest text-slate-400">Tests realizados</p>
            <p className="mt-2 text-3xl font-bold">{attempts}</p>
          </article>
          <article className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-xs uppercase tracking-widest text-slate-400">Promedio global</p>
            <p className="mt-2 text-3xl font-bold">{globalPercent}%</p>
          </article>
          <article className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-xs uppercase tracking-widest text-slate-400">Mejor porcentaje</p>
            <p className="mt-2 text-3xl font-bold">{bestPercent}%</p>
          </article>
          <article className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-xs uppercase tracking-widest text-slate-400">Ultimo resultado</p>
            <p className="mt-2 text-lg font-semibold text-sky-300">{latest ? latest.label : 'Sin datos'}</p>
            <p className="mt-1 text-xs text-slate-400">
              {latest ? new Date(latest.createdAt).toLocaleString('es-AR') : 'Todavia no hay evaluaciones'}
            </p>
          </article>
        </section>

        {dbUnavailable ? (
          <section className="rounded-xl border border-amber-700 bg-amber-900/20 p-4 text-sm text-amber-200">
            No pudimos conectar con la base de datos en este momento. Tu perfil se muestra en modo contingencia usando almacenamiento temporal.
          </section>
        ) : null}

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-xl font-semibold">Ficha de la persona</h2>
          <p className="mt-1 text-sm text-slate-400">Datos personales y laborales del candidato.</p>

          <dl className="mt-4 grid gap-3 text-sm text-slate-200 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-700 bg-slate-800 p-3">
              <dt className="text-xs uppercase tracking-widest text-slate-400">Nombre y apellido</dt>
              <dd className="mt-1 font-semibold">{fullName}</dd>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-800 p-3">
              <dt className="text-xs uppercase tracking-widest text-slate-400">Email</dt>
              <dd className="mt-1 font-semibold">{userEmail}</dd>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-800 p-3">
              <dt className="text-xs uppercase tracking-widest text-slate-400">Fecha de nacimiento</dt>
              <dd className="mt-1 font-semibold">
                {candidateProfile.birthDate ? new Date(candidateProfile.birthDate).toLocaleDateString('es-AR') : 'Sin datos'}
              </dd>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-800 p-3">
              <dt className="text-xs uppercase tracking-widest text-slate-400">Puesto</dt>
              <dd className="mt-1 font-semibold">{candidateProfile.position || 'Sin datos'}</dd>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-800 p-3 sm:col-span-2">
              <dt className="text-xs uppercase tracking-widest text-slate-400">Empresa</dt>
              <dd className="mt-1 font-semibold">{candidateProfile.company || 'Sin datos'}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-xl font-semibold">Desglose por evaluacion</h2>
          <p className="mt-1 text-sm text-slate-400">Resumen del rendimiento por cada tipo de test.</p>

          {summaryByGame.length === 0 ? (
            <p className="mt-4 rounded-lg border border-slate-700 bg-slate-800 p-4 text-sm text-slate-300">
              Todavia no hay resultados para mostrar. Completa una evaluacion para ver tu perfil.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-slate-400">
                  <tr className="border-b border-slate-700">
                    <th className="px-3 py-2 font-medium">Evaluacion</th>
                    <th className="px-3 py-2 font-medium">Intentos</th>
                    <th className="px-3 py-2 font-medium">Promedio score</th>
                    <th className="px-3 py-2 font-medium">Promedio %</th>
                    <th className="px-3 py-2 font-medium">Mejor score</th>
                    <th className="px-3 py-2 font-medium">Ultimo label</th>
                  </tr>
                </thead>
                <tbody>
                  {summaryByGame.map((item) => (
                    <tr key={item.gameId} className="border-b border-slate-800 text-slate-200">
                      <td className="px-3 py-3 font-semibold">{item.gameTitle}</td>
                      <td className="px-3 py-3">{item.attempts}</td>
                      <td className="px-3 py-3">{item.avgScore.toFixed(1)}</td>
                      <td className="px-3 py-3">{Math.round(item.avgPercent)}%</td>
                      <td className="px-3 py-3">{item.bestScore}</td>
                      <td className="px-3 py-3">{item.latestLabel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-xl font-semibold">Ultimos resultados</h2>
          <p className="mt-1 text-sm text-slate-400">Historial reciente ordenado por fecha.</p>

          {results.length === 0 ? (
            <p className="mt-4 rounded-lg border border-slate-700 bg-slate-800 p-4 text-sm text-slate-300">
              Sin resultados recientes.
            </p>
          ) : (
            <ul className="mt-4 grid gap-3 md:grid-cols-2">
              {results.slice(0, 12).map((result) => (
                <li key={result.id} className="rounded-lg border border-slate-700 bg-slate-800 p-4">
                  <p className="font-semibold">{result.gameTitle}</p>
                  <p className="text-slate-300">
                    {result.score}/{result.total} - {result.label}
                  </p>
                  <p className="text-xs text-slate-400">{new Date(result.createdAt).toLocaleString('es-AR')}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
