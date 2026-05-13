'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { useEffect, useMemo, useState } from 'react';

type Question = {
  prompt: string;
  options: string[];
  answer: number;
};

type TestGame = {
  id: string;
  title: string;
  description: string;
  questions: Question[];
};

const TESTS: TestGame[] = [
  {
    id: 'adaptabilidad',
    title: 'Test 1: Adaptabilidad',
    description: 'Como reacciona la persona frente a cambios y escenarios nuevos.',
    questions: [
      {
        prompt: 'Si cambia el objetivo del equipo a ultimo momento, que haces primero?',
        options: ['Espero instrucciones', 'Propongo una nueva ruta rapida', 'Me frustro y freno tareas'],
        answer: 1,
      },
      {
        prompt: 'Frente a una herramienta nueva, normalmente...',
        options: ['La exploro por mi cuenta', 'La evito hasta que sea obligatoria', 'Solo la uso si me capacitan'],
        answer: 0,
      },
      {
        prompt: 'En un entorno incierto te sentis...',
        options: ['Con energia para probar', 'Neutral', 'Muy incomodo'],
        answer: 0,
      },
    ],
  },
  {
    id: 'liderazgo',
    title: 'Test 2: Liderazgo',
    description: 'Mide iniciativa, toma de decisiones y capacidad de guiar equipos.',
    questions: [
      {
        prompt: 'Cuando nadie define un plan, vos...',
        options: ['Espero al lider', 'Armo una propuesta y la comparto', 'Sigo haciendo lo minimo'],
        answer: 1,
      },
      {
        prompt: 'Un conflicto en el equipo se resuelve mejor...',
        options: ['Evitandolo', 'Con dialogo y acuerdos claros', 'Con imposicion directa'],
        answer: 1,
      },
      {
        prompt: 'Para delegar tareas, priorizas...',
        options: ['Control total', 'Fortalezas de cada persona', 'Velocidad sin contexto'],
        answer: 1,
      },
    ],
  },
  {
    id: 'colaboracion',
    title: 'Test 3: Colaboracion',
    description: 'Evalua trabajo en equipo, escucha y cooperacion.',
    questions: [
      {
        prompt: 'Cuando un companero se atrasa, vos...',
        options: ['Lo ignoras', 'Ofreces ayuda para destrabar', 'Reportas sin hablarle'],
        answer: 1,
      },
      {
        prompt: 'En reuniones, normalmente...',
        options: ['Interrumpis para ganar tiempo', 'Escuchas y aportas con orden', 'No participas'],
        answer: 1,
      },
      {
        prompt: 'Un buen resultado de equipo significa...',
        options: ['Lucirte individualmente', 'Cumplir objetivos en conjunto', 'Evitar responsabilidades'],
        answer: 1,
      },
    ],
  },
  {
    id: 'resolucion',
    title: 'Test 4: Resolucion de Problemas',
    description: 'Analiza pensamiento critico y enfoque para resolver desafios.',
    questions: [
      {
        prompt: 'Si un proceso falla repetidamente, primero...',
        options: ['Buscas causa raiz con datos', 'Repetis lo mismo', 'Culpas al contexto'],
        answer: 0,
      },
      {
        prompt: 'Una decision compleja se mejora con...',
        options: ['Suposiciones', 'Criterios claros y evidencia', 'Impulsividad'],
        answer: 1,
      },
      {
        prompt: 'Cuando hay varias soluciones posibles...',
        options: ['Elegis al azar', 'Comparas impacto y riesgo', 'No decidis'],
        answer: 1,
      },
    ],
  },
];

function scoreLabel(score: number, total: number) {
  const ratio = score / total;
  if (ratio >= 0.8) return 'Alto potencial';
  if (ratio >= 0.5) return 'Potencial medio';
  return 'Potencial a desarrollar';
}

type GamesClientProps = {
  userName: string;
};

type StoredResult = {
  id: string;
  gameTitle: string;
  score: number;
  total: number;
  label: string;
  createdAt: string;
};

export default function GamesClient({ userName }: GamesClientProps) {
  const [activeGameId, setActiveGameId] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [history, setHistory] = useState<StoredResult[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const activeGame = useMemo(
    () => TESTS.find((game) => game.id === activeGameId) || null,
    [activeGameId]
  );

  useEffect(() => {
    const loadHistory = async () => {
      const response = await fetch('/api/results', { method: 'GET' });
      if (!response.ok) return;

      const data = (await response.json()) as { results?: StoredResult[] };
      setHistory(data.results || []);
    };

    void loadHistory();
  }, []);

  const persistResult = async (finalScore: number, total: number) => {
    if (!activeGame) return;

    setIsSaving(true);

    const payload = {
      gameId: activeGame.id,
      gameTitle: activeGame.title,
      score: finalScore,
      total,
      label: scoreLabel(finalScore, total),
    };

    const response = await fetch('/api/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    setIsSaving(false);

    if (!response.ok) return;

    const data = (await response.json()) as { result?: StoredResult };
    if (data.result) {
      setHistory((previous) => [data.result as StoredResult, ...previous].slice(0, 12));
    }
  };

  const onStartGame = (gameId: string) => {
    setActiveGameId(gameId);
    setCurrentQuestionIndex(0);
    setScore(0);
    setFinished(false);
  };

  const onSelectOption = (optionIndex: number) => {
    if (!activeGame) return;

    const currentQuestion = activeGame.questions[currentQuestionIndex];
    const isCorrect = optionIndex === currentQuestion.answer;
    const nextScore = score + (isCorrect ? 1 : 0);

    setScore(nextScore);

    const isLast = currentQuestionIndex === activeGame.questions.length - 1;
    if (isLast) {
      setFinished(true);
      void persistResult(nextScore, activeGame.questions.length);
      return;
    }

    setCurrentQuestionIndex((previous) => previous + 1);
  };

  const onCloseGame = () => {
    setActiveGameId(null);
    setCurrentQuestionIndex(0);
    setScore(0);
    setFinished(false);
  };

  const onLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-widest text-sky-300">Zona de Juegos Test</p>
              <h1 className="text-3xl font-bold">Hola, {userName}</h1>
              <p className="mt-2 text-slate-300">
                Esta es tu segunda pagina con 4 juegos web tipo test. Puedes reemplazar cada uno por tu juego final.
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/" className="rounded-lg border border-slate-700 px-4 py-2 hover:bg-slate-800">
                Volver al Home
              </Link>
              <button
                onClick={onLogout}
                className="rounded-lg bg-rose-600 px-4 py-2 font-semibold hover:bg-rose-700"
              >
                Cerrar sesion
              </button>
            </div>
          </div>
        </header>

        {!activeGame ? (
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <section className="grid gap-5 md:grid-cols-2">
              {TESTS.map((game) => (
                <article
                  key={game.id}
                  className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-800 p-6"
                >
                  <p className="mb-2 text-xs uppercase tracking-widest text-sky-300">Juego activo</p>
                  <h2 className="text-2xl font-semibold">{game.title}</h2>
                  <p className="mt-3 text-slate-300">{game.description}</p>
                  <button
                    onClick={() => onStartGame(game.id)}
                    className="mt-6 rounded-lg bg-sky-500 px-4 py-2 font-semibold text-slate-900 transition hover:bg-sky-400"
                  >
                    Comenzar test
                  </button>
                </article>
              ))}
            </section>

            <aside className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <h3 className="text-lg font-semibold">Ultimos resultados</h3>
              <p className="mt-1 text-sm text-slate-400">Tus 12 ejecuciones mas recientes</p>

              {history.length === 0 ? (
                <p className="mt-4 rounded-lg border border-slate-700 bg-slate-800 p-3 text-sm text-slate-300">
                  Aun no hay resultados guardados.
                </p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {history.map((result) => (
                    <li key={result.id} className="rounded-lg border border-slate-700 bg-slate-800 p-3 text-sm">
                      <p className="font-semibold">{result.gameTitle}</p>
                      <p className="text-slate-300">
                        {result.score}/{result.total} - {result.label}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(result.createdAt).toLocaleString('es-AR')}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </aside>
          </div>
        ) : (
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-semibold">{activeGame.title}</h2>
              <button onClick={onCloseGame} className="rounded-lg border border-slate-700 px-3 py-2 hover:bg-slate-800">
                Salir del test
              </button>
            </div>

            {!finished ? (
              <div>
                <p className="mb-2 text-sm text-sky-300">
                  Pregunta {currentQuestionIndex + 1} de {activeGame.questions.length}
                </p>
                <h3 className="mb-5 text-xl">{activeGame.questions[currentQuestionIndex].prompt}</h3>
                <div className="grid gap-3">
                  {activeGame.questions[currentQuestionIndex].options.map((option, index) => (
                    <button
                      key={option}
                      onClick={() => onSelectOption(index)}
                      className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-left transition hover:border-sky-400 hover:bg-slate-700"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-emerald-600 bg-emerald-900/30 p-6">
                <p className="text-sm uppercase tracking-widest text-emerald-300">Resultado</p>
                <h3 className="mt-2 text-2xl font-bold">
                  {score}/{activeGame.questions.length} respuestas correctas
                </h3>
                <p className="mt-3 text-emerald-200">{scoreLabel(score, activeGame.questions.length)}</p>
                {isSaving ? <p className="mt-3 text-sm text-emerald-200">Guardando resultado...</p> : null}
                <button
                  onClick={onCloseGame}
                  className="mt-6 rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-slate-950 hover:bg-emerald-400"
                >
                  Elegir otro juego
                </button>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
