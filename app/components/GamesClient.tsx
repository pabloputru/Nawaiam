'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { useEffect, useMemo, useState } from 'react';

type Question = {
  scene: string;
  prompt: string;
  options: {
    action: string;
    consequence: string;
    points: number;
  }[];
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
    title: 'Mision 1: Adaptabilidad en Crisis Climática',
    description: 'Diriges un barco de evacuacion cuando el iceberg central se fragmenta y sube el nivel del agua.',
    questions: [
      {
        scene: 'La ruta principal queda bloqueada por hielo desprendido y una avenida ya esta bajo agua.',
        prompt: 'Tu primera accion para mantener la evacuacion en marcha es:',
        options: [
          {
            action: 'Redibujar la ruta en tiempo real con dos alternativas',
            consequence: 'El equipo se reacomoda rapido y el barco no se detiene.',
            points: 2,
          },
          {
            action: 'Esperar confirmacion completa del centro de mando',
            consequence: 'Ganas certeza, pero pierdes una ventana de salida.',
            points: 1,
          },
          {
            action: 'Mantener la ruta original aunque ya no sea segura',
            consequence: 'Sube el riesgo de encallar en escombros.',
            points: 0,
          },
        ],
      },
      {
        scene: 'Recibes un mapa predictivo nuevo que marca zonas de corriente intensa.',
        prompt: 'Como integras esta herramienta al operativo?',
        options: [
          {
            action: 'La pruebas en un tramo corto y luego la aplicas al plan completo',
            consequence: 'Aprendes rapido y ajustas con evidencia.',
            points: 2,
          },
          {
            action: 'La dejas para mas tarde y sigues con el metodo anterior',
            consequence: 'Evitas el cambio, pero el plan queda menos preciso.',
            points: 0,
          },
          {
            action: 'Delegas su uso a una persona del equipo y revisas resultados',
            consequence: 'Incorporas el recurso con adopcion gradual.',
            points: 1,
          },
        ],
      },
      {
        scene: 'El pronostico cambia tres veces en quince minutos y la marea sigue subiendo.',
        prompt: 'Con incertidumbre alta, que decision tomas?',
        options: [
          {
            action: 'Fraccionar la mision en bloques cortos con chequeos cada 10 minutos',
            consequence: 'El equipo mantiene foco y responde rapido a cambios.',
            points: 2,
          },
          {
            action: 'Continuar igual para no generar ansiedad en el equipo',
            consequence: 'A corto plazo hay calma, pero baja la capacidad de reaccion.',
            points: 1,
          },
          {
            action: 'Pausar toda decision hasta tener certeza total',
            consequence: 'La operacion pierde tiempo critico.',
            points: 0,
          },
        ],
      },
    ],
  },
  {
    id: 'liderazgo',
    title: 'Mision 2: Liderazgo Bajo Presion',
    description: 'Coordinas tripulacion y brigadas de ciudad cuando el iceberg se parte en multiples placas.',
    questions: [
      {
        scene: 'Hay ruido en radio y nadie define prioridad entre puerto norte o barrio central.',
        prompt: 'Como lideras la decision inicial?',
        options: [
          {
            action: 'Definir criterio de prioridad y asignar responsables por frente',
            consequence: 'El equipo actua con direccion clara.',
            points: 2,
          },
          {
            action: 'Esperar a que cada area decida por su cuenta',
            consequence: 'Se gana autonomia, pero se pierde coordinacion.',
            points: 0,
          },
          {
            action: 'Tomar una decision temporal y revisarla en 15 minutos',
            consequence: 'Mantienes ritmo y permites correccion.',
            points: 1,
          },
        ],
      },
      {
        scene: 'Dos jefes de cubierta discuten por combustible justo cuando llega otro pedido de rescate.',
        prompt: 'Que accion tomas para resolver el conflicto?',
        options: [
          {
            action: 'Abrir un dialogo breve, definir regla y cerrar con acuerdo operativo',
            consequence: 'Se reduce friccion y vuelve la ejecucion.',
            points: 2,
          },
          {
            action: 'Ignorar el conflicto y seguir',
            consequence: 'El problema reaparece en el peor momento.',
            points: 0,
          },
          {
            action: 'Imponer una orden sin explicar contexto',
            consequence: 'Resuelves rapido pero cae el compromiso del equipo.',
            points: 1,
          },
        ],
      },
      {
        scene: 'Necesitas evacuar un hospital flotante y reforzar diques al mismo tiempo.',
        prompt: 'Como delegas para sostener dos frentes criticos?',
        options: [
          {
            action: 'Asignar tareas segun fortalezas y establecer puntos de reporte',
            consequence: 'Aumenta la efectividad sin perder control.',
            points: 2,
          },
          {
            action: 'Centralizar todo para revisar cada detalle personalmente',
            consequence: 'Se vuelve cuello de botella.',
            points: 0,
          },
          {
            action: 'Delegar al azar para ganar velocidad inmediata',
            consequence: 'Hay rapidez inicial, pero errores de ejecucion.',
            points: 1,
          },
        ],
      },
    ],
  },
  {
    id: 'colaboracion',
    title: 'Mision 3: Colaboracion en Evacuacion',
    description: 'El barco depende de coordinacion con voluntarios, hospitales y defensa civil en ciudades anegadas.',
    questions: [
      {
        scene: 'Una lancha de apoyo se atrasa y compromete el puente de traslado.',
        prompt: 'Como colaboras para recuperar ritmo?',
        options: [
          {
            action: 'Contactar al equipo, detectar bloqueo y redistribuir recursos',
            consequence: 'Se recupera la cadena de evacuacion.',
            points: 2,
          },
          {
            action: 'Esperar a que se resuelva solo',
            consequence: 'El retraso impacta a toda la operacion.',
            points: 0,
          },
          {
            action: 'Escalar el problema sin hablar con la lancha',
            consequence: 'Se gana visibilidad pero no solucion inmediata.',
            points: 1,
          },
        ],
      },
      {
        scene: 'En mesa de crisis participan bomberos, medicos y navegacion con urgencias distintas.',
        prompt: 'Que comportamiento aporta mas al trabajo conjunto?',
        options: [
          {
            action: 'Escuchar prioridades, sintetizar y proponer secuencia comun',
            consequence: 'Los equipos se alinean en una sola hoja de ruta.',
            points: 2,
          },
          {
            action: 'Interrumpir para imponer tu solucion rapidamente',
            consequence: 'Se acorta la reunion, pero sube la resistencia.',
            points: 1,
          },
          {
            action: 'Mantenerte al margen para evitar conflicto',
            consequence: 'Se pierde informacion clave de navegacion.',
            points: 0,
          },
        ],
      },
      {
        scene: 'Tras 6 horas, logran estabilizar tres zonas inundadas.',
        prompt: 'Como defines exito del equipo?',
        options: [
          {
            action: 'Medir impacto global y aprendizajes compartidos',
            consequence: 'Se fortalece la coordinacion futura.',
            points: 2,
          },
          {
            action: 'Destacar solo el rendimiento individual mas alto',
            consequence: 'Motiva a pocos y debilita la cohesion.',
            points: 0,
          },
          {
            action: 'Cerrar sin retroalimentacion por falta de tiempo',
            consequence: 'Se pierde mejora continua.',
            points: 1,
          },
        ],
      },
    ],
  },
  {
    id: 'resolucion',
    title: 'Mision 4: Resolucion de Problemas',
    description: 'Debes resolver fallas tecnicas mientras la ciudad sigue inundandose por desprendimiento del iceberg.',
    questions: [
      {
        scene: 'La bomba principal del barco pierde potencia en plena marea alta.',
        prompt: 'Cual es tu primer movimiento para resolver?',
        options: [
          {
            action: 'Revisar datos de presion, aislar causa raiz y aplicar contingencia',
            consequence: 'La falla se controla sin frenar la mision.',
            points: 2,
          },
          {
            action: 'Reiniciar el sistema varias veces sin diagnostico',
            consequence: 'Puede funcionar, pero el riesgo persiste.',
            points: 0,
          },
          {
            action: 'Atribuir la falla al clima y esperar mejora',
            consequence: 'No se corrige el problema tecnico.',
            points: 0,
          },
        ],
      },
      {
        scene: 'Tienes combustible para una sola maniobra grande y dos barrios por asistir.',
        prompt: 'Como decides el destino del barco?',
        options: [
          {
            action: 'Definir criterios de impacto, riesgo y tiempo para priorizar',
            consequence: 'La decision es defendible y efectiva.',
            points: 2,
          },
          {
            action: 'Elegir segun intuicion del momento',
            consequence: 'Puede salir bien, pero no es reproducible.',
            points: 1,
          },
          {
            action: 'Posponer la decision hasta recibir unanimidad',
            consequence: 'La demora reduce la capacidad de rescate.',
            points: 0,
          },
        ],
      },
      {
        scene: 'Aparecen tres soluciones para reforzar el casco frente a nuevos bloques de hielo.',
        prompt: 'Como eliges la solucion final?',
        options: [
          {
            action: 'Comparar impacto, costo y riesgo antes de ejecutar',
            consequence: 'Reduces probabilidad de falla critica.',
            points: 2,
          },
          {
            action: 'Aplicar la mas rapida sin validar efectos secundarios',
            consequence: 'Ganas tiempo, pero sumas riesgo estructural.',
            points: 1,
          },
          {
            action: 'No elegir y mantener configuracion actual',
            consequence: 'El problema se agrava con cada ola.',
            points: 0,
          },
        ],
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

function crisisState(score: number, maxScore: number) {
  const ratio = maxScore === 0 ? 0 : score / maxScore;

  if (ratio >= 0.8) {
    return {
      seaLevel: 38,
      cityDamage: 20,
      icebergCrack: 15,
      boatTilt: -2,
      tone: 'Control operativo alto',
      toneClass: 'text-emerald-300',
    };
  }

  if (ratio >= 0.5) {
    return {
      seaLevel: 50,
      cityDamage: 45,
      icebergCrack: 45,
      boatTilt: 2,
      tone: 'Crisis contenida con tension',
      toneClass: 'text-amber-300',
    };
  }

  return {
    seaLevel: 64,
    cityDamage: 72,
    icebergCrack: 75,
    boatTilt: 6,
    tone: 'Crisis alta, plan inestable',
    toneClass: 'text-rose-300',
  };
}

type Decision = {
  step: number;
  action: string;
  consequence: string;
  points: number;
};

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
  const [decisions, setDecisions] = useState<Decision[]>([]);

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
    setDecisions([]);
  };

  const onSelectOption = (optionIndex: number) => {
    if (!activeGame) return;

    const currentQuestion = activeGame.questions[currentQuestionIndex];
    const selectedOption = currentQuestion.options[optionIndex];
    const nextScore = score + selectedOption.points;

    setScore(nextScore);
    setDecisions((previous) => [
      ...previous,
      {
        step: currentQuestionIndex + 1,
        action: selectedOption.action,
        consequence: selectedOption.consequence,
        points: selectedOption.points,
      },
    ]);

    const isLast = currentQuestionIndex === activeGame.questions.length - 1;
    if (isLast) {
      setFinished(true);
      void persistResult(nextScore, activeGame.questions.length * 2);
      return;
    }

    setCurrentQuestionIndex((previous) => previous + 1);
  };

  const onCloseGame = () => {
    setActiveGameId(null);
    setCurrentQuestionIndex(0);
    setScore(0);
    setFinished(false);
    setDecisions([]);
  };

  const onLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  const maxScore = activeGame ? activeGame.questions.length * 2 : 0;
  const state = crisisState(score, maxScore);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-widest text-sky-300">Simulador Nawaiam</p>
              <h1 className="text-3xl font-bold">Hola, {userName}</h1>
              <p className="mt-2 text-slate-300">
                Evalua decisiones en una crisis de inundacion: cada accion elegida impacta el resultado del test.
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
                  <p className="mb-2 text-xs uppercase tracking-widest text-sky-300">Simulacion activa</p>
                  <h2 className="text-2xl font-semibold">{game.title}</h2>
                  <p className="mt-3 text-slate-300">{game.description}</p>
                  <button
                    onClick={() => onStartGame(game.id)}
                    className="mt-6 rounded-lg bg-sky-500 px-4 py-2 font-semibold text-slate-900 transition hover:bg-sky-400"
                  >
                    Iniciar mision
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
                Salir de la mision
              </button>
            </div>

            <div className="mb-6 overflow-hidden rounded-xl border border-sky-900/60 bg-slate-950 p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-slate-300">Escenario: Puerto metropolitano en inundacion</p>
                <p className={`text-sm font-semibold ${state.toneClass}`}>{state.tone}</p>
              </div>
              <svg viewBox="0 0 900 280" className="h-52 w-full">
                <defs>
                  <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#0f172a" />
                    <stop offset="100%" stopColor="#1e293b" />
                  </linearGradient>
                  <linearGradient id="water" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#0ea5e9" />
                    <stop offset="100%" stopColor="#075985" />
                  </linearGradient>
                </defs>

                <rect x="0" y="0" width="900" height="280" fill="url(#sky)" />

                <rect
                  x="0"
                  y={280 - state.seaLevel * 3}
                  width="900"
                  height={state.seaLevel * 3}
                  fill="url(#water)"
                  opacity="0.85"
                />

                <g opacity="0.85">
                  <rect x="620" y="110" width="22" height={90 + state.cityDamage} fill="#334155" />
                  <rect x="648" y="80" width="30" height={120 + state.cityDamage} fill="#475569" />
                  <rect x="684" y="96" width="24" height={104 + state.cityDamage} fill="#334155" />
                  <rect x="714" y="74" width="38" height={126 + state.cityDamage} fill="#1e293b" />
                </g>

                <g transform={`translate(180, 78) rotate(${state.boatTilt})`}>
                  <polygon points="0,70 180,70 148,102 24,102" fill="#7c2d12" />
                  <rect x="42" y="36" width="92" height="34" rx="4" fill="#cbd5e1" />
                  <rect x="74" y="10" width="8" height="60" fill="#94a3b8" />
                  <polygon points="82,12 132,35 82,35" fill="#e2e8f0" />
                </g>

                <g>
                  <polygon
                    points={`500,190 560,50 620,190`}
                    fill="#bfdbfe"
                    opacity="0.9"
                    stroke="#7dd3fc"
                    strokeWidth="2"
                  />
                  <line
                    x1="560"
                    y1="55"
                    x2={560 + state.icebergCrack}
                    y2="190"
                    stroke="#0f172a"
                    strokeWidth="3"
                    opacity="0.8"
                  />
                </g>
              </svg>
            </div>

            {!finished ? (
              <div>
                <p className="mb-2 text-sm text-sky-300">
                  Decision {currentQuestionIndex + 1} de {activeGame.questions.length}
                </p>
                <p className="mb-2 rounded-lg border border-slate-700 bg-slate-800/60 p-3 text-sm text-slate-200">
                  {activeGame.questions[currentQuestionIndex].scene}
                </p>
                <h3 className="mb-5 text-xl">{activeGame.questions[currentQuestionIndex].prompt}</h3>
                <div className="grid gap-3">
                  {activeGame.questions[currentQuestionIndex].options.map((option, index) => (
                    <button
                      key={option.action}
                      onClick={() => onSelectOption(index)}
                      className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-left transition hover:border-sky-400 hover:bg-slate-700"
                    >
                      <p className="font-semibold text-slate-100">{option.action}</p>
                      <p className="mt-1 text-sm text-slate-300">{option.consequence}</p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-emerald-600 bg-emerald-900/30 p-6">
                <p className="text-sm uppercase tracking-widest text-emerald-300">Resultado</p>
                <h3 className="mt-2 text-2xl font-bold">
                  {score}/{activeGame.questions.length * 2} efectividad de decisiones
                </h3>
                <p className="mt-3 text-emerald-200">{scoreLabel(score, activeGame.questions.length * 2)}</p>
                {isSaving ? <p className="mt-3 text-sm text-emerald-200">Guardando resultado...</p> : null}
                <div className="mt-4 space-y-2">
                  {decisions.map((decision) => (
                    <div key={`${decision.step}-${decision.action}`} className="rounded-lg border border-emerald-700/60 bg-emerald-950/40 p-3">
                      <p className="text-sm font-semibold text-emerald-100">Decision {decision.step}: {decision.action}</p>
                      <p className="text-sm text-emerald-200/90">{decision.consequence}</p>
                      <p className="text-xs text-emerald-300">Impacto: +{decision.points} punto(s)</p>
                    </div>
                  ))}
                </div>
                <button
                  onClick={onCloseGame}
                  className="mt-6 rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-slate-950 hover:bg-emerald-400"
                >
                  Elegir otra mision
                </button>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
