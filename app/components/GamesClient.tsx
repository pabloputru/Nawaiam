'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { useEffect, useMemo, useState } from 'react';

type DecisionProfile = 'proactivo' | 'analitico' | 'reactivo';

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
    id: 'conducta-base',
    title: 'Evaluacion 1: Conducta Base (Hogan)',
    description: 'Analiza patrones de comportamiento estables frente a presion, cambio y toma de decisiones.',
    questions: [
      {
        scene: 'Un cliente clave cambia alcance 72 horas antes del cierre trimestral y se desordena el plan operativo.',
        prompt: 'Tu primera accion para sostener resultados es:',
        options: [
          {
            action: 'Redisenar el plan con dos rutas de entrega y responsables claros',
            consequence: 'El equipo se reacomoda rapido sin frenar la operacion.',
            points: 2,
          },
          {
            action: 'Esperar aprobacion total de direccion antes de actuar',
            consequence: 'Ganas certeza, pero pierdes una ventana de ejecucion.',
            points: 1,
          },
          {
            action: 'Mantener el plan original aunque ya no responda al contexto',
            consequence: 'Sube el riesgo de incumplir con el cliente.',
            points: 0,
          },
        ],
      },
      {
        scene: 'Llega un tablero de analitica predictiva para detectar desvio de costos y productividad.',
        prompt: 'Como incorporas esta herramienta al trabajo diario?',
        options: [
          {
            action: 'Pilotear en un equipo chico y escalar con evidencia',
            consequence: 'Aprendes rapido y ajustas decisiones con datos reales.',
            points: 2,
          },
          {
            action: 'Posponer su uso y continuar con reportes manuales',
            consequence: 'Evitas friccion inicial, pero pierdes precision de gestion.',
            points: 0,
          },
          {
            action: 'Asignar un referente de adopcion y revisar impacto semanal',
            consequence: 'Integras la herramienta con avance gradual y controlado.',
            points: 1,
          },
        ],
      },
      {
        scene: 'El forecast comercial cambia tres veces en una semana y hay presion de cumplimiento.',
        prompt: 'Con incertidumbre alta, como organizas la ejecucion?',
        options: [
          {
            action: 'Trabajar en sprints cortos con chequeos de riesgo frecuentes',
            consequence: 'El equipo mantiene foco y responde rapido al cambio.',
            points: 2,
          },
          {
            action: 'Sostener la modalidad actual para no generar ansiedad',
            consequence: 'Hay calma inicial, pero menor capacidad de reaccion.',
            points: 1,
          },
          {
            action: 'Pausar cambios hasta tener certidumbre completa',
            consequence: 'La operacion pierde tiempo critico y competitividad.',
            points: 0,
          },
        ],
      },
    ],
  },
  {
    id: 'motivacion',
    title: 'Evaluacion 2: Motivacion (Gallup)',
    description: 'Evalua energia, compromiso y foco en fortalezas al gestionar objetivos desafiantes.',
    questions: [
      {
        scene: 'Nadie define prioridad entre onboarding de un nuevo cliente enterprise o recuperacion de una cuenta en riesgo.',
        prompt: 'Como lideras la decision inicial?',
        options: [
          {
            action: 'Definir criterios de priorizacion y asignar ownership por frente',
            consequence: 'El equipo ejecuta con direccion clara y foco comun.',
            points: 2,
          },
          {
            action: 'Dejar que cada area decida sin una prioridad unificada',
            consequence: 'Hay autonomia, pero se pierde coordinacion global.',
            points: 0,
          },
          {
            action: 'Tomar una decision temporal y revisarla con datos a corto plazo',
            consequence: 'Mantienes ritmo y habilitas correccion rapida.',
            points: 1,
          },
        ],
      },
      {
        scene: 'Dos lideres de area discuten por presupuesto justo cuando entra una urgencia del cliente.',
        prompt: 'Que accion tomas para resolver el conflicto?',
        options: [
          {
            action: 'Facilitar dialogo breve, acordar criterio y cerrar compromiso operativo',
            consequence: 'Se reduce friccion y vuelve la ejecucion coordinada.',
            points: 2,
          },
          {
            action: 'Ignorar el conflicto y priorizar solo la urgencia del momento',
            consequence: 'El problema se agrava y reaparece en el peor momento.',
            points: 0,
          },
          {
            action: 'Imponer una orden sin explicar criterio ni contexto',
            consequence: 'Resuelves rapido, pero cae el compromiso del equipo.',
            points: 1,
          },
        ],
      },
      {
        scene: 'Debes cumplir un lanzamiento de producto y estabilizar soporte premium al mismo tiempo.',
        prompt: 'Como delegas para sostener dos frentes criticos?',
        options: [
          {
            action: 'Delegar por fortalezas y definir cadencia de reporte',
            consequence: 'Aumenta la efectividad sin perder gobernanza.',
            points: 2,
          },
          {
            action: 'Centralizar todo en tu aprobacion personal',
            consequence: 'Se convierte en cuello de botella operativo.',
            points: 0,
          },
          {
            action: 'Repartir tareas por disponibilidad y no por capacidad',
            consequence: 'Hay velocidad inicial, pero suben errores de ejecucion.',
            points: 1,
          },
        ],
      },
    ],
  },
  {
    id: 'cognicion',
    title: 'Evaluacion 3: Cognicion (Pymetrics)',
    description: 'Mide razonamiento, aprendizaje adaptativo y calidad de decision en escenarios con incertidumbre.',
    questions: [
      {
        scene: 'El equipo de implementacion se atrasa y compromete una fecha acordada con cliente.',
        prompt: 'Como colaboras para recuperar ritmo?',
        options: [
          {
            action: 'Alinear al equipo, detectar bloqueos y redistribuir capacidad',
            consequence: 'Se recupera el flujo de entrega entre areas.',
            points: 2,
          },
          {
            action: 'Esperar a que el equipo lo resuelva sin intervencion',
            consequence: 'El retraso impacta al cliente y a la reputacion.',
            points: 0,
          },
          {
            action: 'Escalar directamente sin conversar primero con el equipo',
            consequence: 'Hay visibilidad, pero no solucion inmediata.',
            points: 1,
          },
        ],
      },
      {
        scene: 'En comite participan Ventas, Producto y Customer Success con prioridades distintas.',
        prompt: 'Que comportamiento aporta mas al trabajo conjunto?',
        options: [
          {
            action: 'Escuchar prioridades, sintetizar y proponer secuencia comun',
            consequence: 'Los equipos se alinean en un mismo plan de accion.',
            points: 2,
          },
          {
            action: 'Interrumpir para imponer una solucion rapida',
            consequence: 'La reunion termina antes, pero sube la resistencia.',
            points: 1,
          },
          {
            action: 'Mantenerte al margen para evitar conflicto',
            consequence: 'Se pierde informacion clave para la decision final.',
            points: 0,
          },
        ],
      },
      {
        scene: 'Tras un trimestre exigente, el equipo logra estabilizar cuentas criticas.',
        prompt: 'Como defines exito del equipo?',
        options: [
          {
            action: 'Medir impacto global, NPS interno y aprendizajes compartidos',
            consequence: 'Se fortalece la colaboracion futura y la mejora continua.',
            points: 2,
          },
          {
            action: 'Reconocer solo al mejor rendimiento individual',
            consequence: 'Motiva a pocos y debilita cohesion de equipo.',
            points: 0,
          },
          {
            action: 'Cerrar el ciclo sin retroalimentacion por falta de tiempo',
            consequence: 'Se pierde informacion valiosa para evolucionar.',
            points: 1,
          },
        ],
      },
    ],
  },
  {
    id: 'skills',
    title: 'Evaluacion 4: Skills (SHL)',
    description: 'Valida habilidades aplicadas para ejecucion, priorizacion, comunicacion y resolucion en contexto real.',
    questions: [
      {
        scene: 'La plataforma principal sufre caidas intermitentes durante horario pico de clientes.',
        prompt: 'Cual es tu primer movimiento para resolver?',
        options: [
          {
            action: 'Revisar metricas, aislar causa raiz y activar plan de contingencia',
            consequence: 'La falla se controla sin frenar la operacion.',
            points: 2,
          },
          {
            action: 'Reiniciar servicios repetidamente sin diagnostico',
            consequence: 'Puede aliviar momentaneamente, pero el riesgo persiste.',
            points: 0,
          },
          {
            action: 'Atribuir la falla al contexto externo y esperar mejora',
            consequence: 'No se corrige el problema estructural.',
            points: 0,
          },
        ],
      },
      {
        scene: 'Solo hay presupuesto para una iniciativa estrategica y dos unidades solicitan prioridad.',
        prompt: 'Como decides la asignacion?',
        options: [
          {
            action: 'Definir criterios de impacto, riesgo y time-to-value para priorizar',
            consequence: 'La decision es transparente, defendible y efectiva.',
            points: 2,
          },
          {
            action: 'Elegir segun intuicion del momento',
            consequence: 'Puede funcionar, pero no es un criterio escalable.',
            points: 1,
          },
          {
            action: 'Posponer hasta lograr unanimidad completa',
            consequence: 'La demora reduce velocidad de respuesta al negocio.',
            points: 0,
          },
        ],
      },
      {
        scene: 'Surgen tres soluciones para mitigar un riesgo tecnologico con impacto comercial.',
        prompt: 'Como eliges la solucion final?',
        options: [
          {
            action: 'Comparar impacto, costo, riesgo y dependencia tecnica',
            consequence: 'Reduces probabilidad de falla critica y deuda futura.',
            points: 2,
          },
          {
            action: 'Implementar la mas rapida sin validar efectos secundarios',
            consequence: 'Ganas tiempo, pero aumentas riesgo estructural.',
            points: 1,
          },
          {
            action: 'No decidir y mantener el estado actual',
            consequence: 'El problema se agrava con cada nuevo incidente.',
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
  profile: DecisionProfile;
};

type MissionEnding = {
  title: string;
  summary: string;
  recommendation: string;
  profile: DecisionProfile;
  executiveProfile: string;
  executiveFit: string;
};

const CHAPTERS = ['Fase I: Alerta Temprana', 'Fase II: Ruptura del Iceberg', 'Fase III: Coordinacion de Evacuacion'];

function profileFromOptionIndex(optionIndex: number): DecisionProfile {
  if (optionIndex === 0) return 'proactivo';
  if (optionIndex === 1) return 'analitico';
  return 'reactivo';
}

function profileLabel(profile: DecisionProfile) {
  if (profile === 'proactivo') return 'Proactivo';
  if (profile === 'analitico') return 'Analitico';
  return 'Reactivo';
}

function resolveMissionEnding(decisions: Decision[], score: number, maxScore: number): MissionEnding {
  const ratio = maxScore === 0 ? 0 : score / maxScore;
  const counters: Record<DecisionProfile, number> = {
    proactivo: 0,
    analitico: 0,
    reactivo: 0,
  };

  for (const decision of decisions) {
    counters[decision.profile] += 1;
  }

  const dominantProfile =
    counters.proactivo >= counters.analitico && counters.proactivo >= counters.reactivo
      ? 'proactivo'
      : counters.analitico >= counters.reactivo
        ? 'analitico'
        : 'reactivo';

  if (dominantProfile === 'proactivo') {
    if (ratio >= 0.8) {
      return {
        profile: dominantProfile,
        title: 'Resultado: Liderazgo de Respuesta de Alto Impacto',
        summary: 'Tomaste iniciativa con criterio y convertiste presion en ejecucion efectiva.',
        recommendation: 'Perfil recomendado para liderar operaciones de cambio acelerado.',
        executiveProfile: 'Ejecutor Adaptativo',
        executiveFit: 'Ideal para liderar implementaciones, transformacion y contextos de cambio rapido.',
      };
    }

    return {
      profile: dominantProfile,
      title: 'Resultado: Impulso de Respuesta Rapida',
      summary: 'Movilizaste la operacion con iniciativa, aunque con margen para mejorar consistencia.',
      recommendation: 'Potenciar chequeos de calidad en decisiones de alta velocidad.',
      executiveProfile: 'Ejecutor Adaptativo',
      executiveFit: 'Recomendado para roles con foco en accion y cumplimiento con alta dinamica.',
    };
  }

  if (dominantProfile === 'analitico') {
    if (ratio >= 0.8) {
      return {
        profile: dominantProfile,
        title: 'Resultado: Estratega de Crisis Sistemica',
        summary: 'Priorizaste evidencia y coordinacion, sosteniendo estabilidad en un entorno extremo.',
        recommendation: 'Perfil ideal para disenar protocolos y conducir decisiones complejas.',
        executiveProfile: 'Resolutor Analitico',
        executiveFit: 'Fuerte ajuste para operaciones, estrategia y mejora continua basada en datos.',
      };
    }

    return {
      profile: dominantProfile,
      title: 'Resultado: Coordinador de Contingencias',
      summary: 'Tomaste decisiones cuidadosas y redujiste incertidumbre en momentos clave.',
      recommendation: 'Ganar mas ritmo operativo sin perder la calidad analitica.',
      executiveProfile: 'Resolutor Analitico',
      executiveFit: 'Buen encaje para roles de coordinacion y gestion de riesgos.',
    };
  }

  if (ratio >= 0.8) {
    return {
      profile: dominantProfile,
      title: 'Resultado: Respuesta Instintiva Efectiva',
      summary: 'Actuaste bajo tension con reflejos utiles y capacidad de recuperacion.',
      recommendation: 'Con estructura de planificacion, este perfil puede escalar fuerte.',
      executiveProfile: 'Lider Colaborativo',
      executiveFit: 'Aporta bien en roles de coordinacion transversal con fuerte relacion interpersonal.',
    };
  }

  return {
    profile: dominantProfile,
    title: 'Resultado: Zona de Riesgo Operativo',
    summary: 'Las decisiones tendieron a reaccion tardia y aumentaron la exposicion del operativo.',
    recommendation: 'Trabajar anticipacion, comunicacion y priorizacion bajo presion.',
    executiveProfile: 'Coordinador Estrategico',
    executiveFit: 'Con plan de desarrollo puede evolucionar a roles de gestion y liderazgo de equipos.',
  };
}

function executiveProfileByAssessment(gameId: string | null, ending: MissionEnding) {
  if (gameId === 'conducta-base') {
    return {
      name: 'Ejecutor Adaptativo',
      fit: 'Apto para contextos de cambio acelerado, adopcion de nuevas herramientas y foco en resultados.',
    };
  }

  if (gameId === 'motivacion') {
    return {
      name: 'Coordinador Estrategico',
      fit: 'Apto para priorizacion de iniciativas, asignacion de recursos y alineacion de equipos.',
    };
  }

  if (gameId === 'cognicion') {
    return {
      name: 'Lider Colaborativo',
      fit: 'Apto para trabajo interareas, comunicacion efectiva y construccion de acuerdos sostenibles.',
    };
  }

  if (gameId === 'skills') {
    return {
      name: 'Resolutor Analitico',
      fit: 'Apto para diagnostico de problemas complejos, analisis de riesgo y decisiones basadas en evidencia.',
    };
  }

  return {
    name: ending.executiveProfile,
    fit: ending.executiveFit,
  };
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
        profile: profileFromOptionIndex(optionIndex),
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
  const chapterIndex = Math.min(currentQuestionIndex, CHAPTERS.length - 1);
  const ending = resolveMissionEnding(decisions, score, maxScore);
  const executiveResult = executiveProfileByAssessment(activeGame?.id ?? null, ending);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-widest text-sky-300">Assessment Center Nawaiam</p>
              <h1 className="text-3xl font-bold">Hola, {userName}</h1>
              <p className="mt-2 text-slate-300">
                Evaluacion conductual por escenarios: cada accion elegida impacta tu perfil de competencias.
              </p>
              <p className="mt-2 text-xs text-slate-400">
                Framework: Conducta base (Hogan), Motivacion (Gallup), Cognicion (Pymetrics), Skills (SHL). Cultura (DISC) se usa como capa transversal.
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
                  <p className="mb-2 text-xs uppercase tracking-widest text-sky-300">Evaluacion por escenarios</p>
                  <h2 className="text-2xl font-semibold">{game.title}</h2>
                  <p className="mt-3 text-slate-300">{game.description}</p>
                  <button
                    onClick={() => onStartGame(game.id)}
                    className="mt-6 rounded-lg bg-sky-500 px-4 py-2 font-semibold text-slate-900 transition hover:bg-sky-400"
                  >
                    Iniciar evaluacion
                  </button>
                </article>
              ))}
            </section>

            <aside className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <h3 className="text-lg font-semibold">Ultimos resultados</h3>
              <p className="mt-1 text-sm text-slate-400">Tus 12 evaluaciones mas recientes</p>

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
                Salir de la evaluacion
              </button>
            </div>

            <div className="mb-6 overflow-hidden rounded-xl border border-sky-900/60 bg-slate-950 p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-slate-300">Escenario: Puerto metropolitano en inundacion</p>
                <p className={`text-sm font-semibold ${state.toneClass}`}>{state.tone}</p>
              </div>
              {!finished ? (
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs uppercase tracking-wider text-sky-300">
                    <span>{CHAPTERS[chapterIndex]}</span>
                    <span>
                      Avance: {currentQuestionIndex + 1}/{activeGame.questions.length}
                    </span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-800">
                    <div
                      className="h-2 rounded-full bg-sky-400 transition-all"
                      style={{ width: `${((currentQuestionIndex + 1) / activeGame.questions.length) * 100}%` }}
                    />
                  </div>
                </div>
              ) : null}
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
                  Escenario {currentQuestionIndex + 1} de {activeGame.questions.length}
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
                <p className="text-sm uppercase tracking-widest text-emerald-300">Reporte Conductual</p>
                <h3 className="mt-2 text-2xl font-bold">
                  {score}/{activeGame.questions.length * 2} indice de efectividad en decisiones
                </h3>
                <p className="mt-3 text-emerald-200">{scoreLabel(score, activeGame.questions.length * 2)}</p>
                <div className="mt-3 rounded-lg border border-emerald-700/60 bg-emerald-950/30 p-3">
                  <p className="text-sm font-semibold text-emerald-100">{ending.title}</p>
                  <p className="text-sm text-emerald-200">{ending.summary}</p>
                  <p className="mt-1 text-xs text-emerald-300">
                    Perfil dominante: {profileLabel(ending.profile)} · {ending.recommendation}
                  </p>
                </div>
                <div className="mt-3 rounded-lg border border-sky-700/60 bg-sky-950/30 p-3">
                  <p className="text-sm font-semibold text-sky-100">Perfil ejecutivo sugerido: {executiveResult.name}</p>
                  <p className="text-sm text-sky-200">{executiveResult.fit}</p>
                  <p className="mt-1 text-xs text-sky-300">Cultura (DISC): lectura transversal del estilo de interaccion y colaboracion.</p>
                </div>
                {isSaving ? <p className="mt-3 text-sm text-emerald-200">Guardando resultado...</p> : null}
                <div className="mt-4 space-y-2">
                  {decisions.map((decision) => (
                    <div key={`${decision.step}-${decision.action}`} className="rounded-lg border border-emerald-700/60 bg-emerald-950/40 p-3">
                      <p className="text-sm font-semibold text-emerald-100">Escenario {decision.step}: {decision.action}</p>
                      <p className="text-sm text-emerald-200/90">{decision.consequence}</p>
                      <p className="text-xs text-emerald-300">
                        Impacto: +{decision.points} punto(s) · Estilo conductual: {profileLabel(decision.profile)}
                      </p>
                    </div>
                  ))}
                </div>
                <button
                  onClick={onCloseGame}
                  className="mt-6 rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-slate-950 hover:bg-emerald-400"
                >
                  Elegir otra evaluacion
                </button>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
