'use client';

import Image from 'next/image';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { useEffect, useMemo, useState } from 'react';

type DecisionProfile = 'proactivo' | 'analitico' | 'reactivo';

type Question = {
  visual: string;
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
  visual: string;
  questions: Question[];
};

const QUESTIONS_PER_EVALUATION = 10;

const TESTS: TestGame[] = [
  {
    id: 'conducta-base',
    title: 'Evaluacion 1: Conducta Base (Hogan)',
    description: 'Mide estabilidad conductual bajo presion, control de derailers y consistencia de caracter frente a adversidad.',
    visual: '/imagenes-fijas/mapamundi-etapa1.jpg',
    questions: [
      {
        visual: '/imagenes-fijas/mapamundi-etapa1.jpg',
        scene: '[Hogan — Estabilidad emocional] El iceberg acaba de partirse. En 20 minutos una zona de datos del cliente queda sin cobertura y tu equipo espera direccion.',
        prompt: 'Bajo presion extrema, como reaccionas primero?',
        options: [
          {
            action: 'Mantener tono calmado, enunciar el riesgo con claridad y dar un paso inicial concreto',
            consequence: 'Estabilidad alta: el equipo lee confianza y ejecuta. Bajo derailer de volatilidad.',
            points: 2,
          },
          {
            action: 'Pedir tiempo para analizar antes de comunicar algo al equipo',
            consequence: 'Prudente, pero genera incertidumbre en el equipo en el momento critico.',
            points: 1,
          },
          {
            action: 'Escalar el problema a tu superior inmediatamente sin dar ninguna orientacion',
            consequence: 'Derailer de cauteloso activo: delegas hacia arriba en lugar de liderar.',
            points: 0,
          },
        ],
      },
      {
        visual: '/imagenes-fijas/mapamundi-etapa2.jpg',
        scene: '[Hogan — Confianza interpersonal] Un area externa descarto tu propuesta sin darte explicacion. El proyecto depende de su colaboracion.',
        prompt: 'Como gestionas la relacion para continuar?',
        options: [
          {
            action: 'Buscar feedback directo, reencuadrar el acuerdo y proponer un nuevo punto de partida',
            consequence: 'Ajuste interpersonal efectivo: sin resentimiento ni pasividad.',
            points: 2,
          },
          {
            action: 'Aceptar la decision y trabajar en paralelo sin coordinar',
            consequence: 'Evitas conflicto, pero aumentas riesgo de duplicacion y tension latente.',
            points: 1,
          },
          {
            action: 'Exigir explicacion formal antes de avanzar',
            consequence: 'Derailer de arrogancia: postura defensiva que bloquea la colaboracion.',
            points: 0,
          },
        ],
      },
      {
        visual: '/imagenes-fijas/mapamundi-etapa3.jpg',
        scene: '[Hogan — Consistencia de caracter] El equipo detecta que tomaste una decision diferente a lo que habias comprometido publicamente.',
        prompt: 'Como manejas la brecha entre lo dicho y lo hecho?',
        options: [
          {
            action: 'Reconocer el cambio, explicar el razonamiento y refirmar compromisos futuros',
            consequence: 'Alta integridad conductual: el equipo aprende del proceso, no del error.',
            points: 2,
          },
          {
            action: 'Minimizar la diferencia y seguir adelante sin comentarlo',
            consequence: 'Derailer de manipulacion pasiva: erosiona confianza a largo plazo.',
            points: 0,
          },
          {
            action: 'Justificar el cambio con factores externos sin asumir responsabilidad',
            consequence: 'Baja consistencia percibida: el equipo pierde referencia de comportamiento esperado.',
            points: 1,
          },
        ],
      },
    ],
  },
  {
    id: 'motivacion',
    title: 'Evaluacion 2: Motivacion (Gallup)',
    description: 'Evalua engagement, activacion de fortalezas personales y energia sostenida en contextos de alta demanda.',
    visual: '/imagenes-fijas/ciudad-1.jpg',
    questions: [
      {
        visual: '/imagenes-fijas/ciudad-1.jpg',
        scene: '[Gallup — Fortalezas] El nivel del agua subio y la mision cambia: ya no es evacuar, sino coordinar refugios. Tienes 3 personas con perfiles muy distintos.',
        prompt: 'Como distribuyes el trabajo para que el equipo funcione al maximo?',
        options: [
          {
            action: 'Identificar la fortaleza dominante de cada uno y asignar el rol que la activa',
            consequence: 'Engagement alto: cada persona trabaja desde su zona de energia optima.',
            points: 2,
          },
          {
            action: 'Asignar tareas por orden de jerarquia y disponibilidad inmediata',
            consequence: 'Cobertura rapida, pero sin activar el potencial real del equipo.',
            points: 1,
          },
          {
            action: 'Dejar que cada uno elija lo que quiera hacer',
            consequence: 'Autonomia alta, pero sin foco ni cobertura de areas criticas.',
            points: 0,
          },
        ],
      },
      {
        visual: '/imagenes-fijas/ciudad-2.jpg',
        scene: '[Gallup — Compromiso activo] Van 10 horas de crisis. El equipo empieza a desconectarse emocionalmente y la calidad de las decisiones baja.',
        prompt: 'Como reactivas el compromiso del equipo sin perder ritmo operativo?',
        options: [
          {
            action: 'Reconocer el esfuerzo de forma especifica y conectar el trabajo con proposito colectivo',
            consequence: 'El engagement se recupera: el equipo vuelve a dar lo mejor.',
            points: 2,
          },
          {
            action: 'Pedir un mayor esfuerzo sin reconocimiento ni contexto',
            consequence: 'Empuja a corto plazo, pero genera desgaste y distancia.',
            points: 0,
          },
          {
            action: 'Ofrecer un descanso sin abordar el estado emocional del equipo',
            consequence: 'Alivia el cansancio fisico, pero no la desconexion motivacional.',
            points: 1,
          },
        ],
      },
      {
        visual: '/imagenes-fijas/ciudad-3.jpg',
        scene: '[Gallup — Energia sostenida] La crisis termino pero el equipo esta agotado y hay un cierre de trimestre exigente por delante.',
        prompt: 'Como sostienes el alto rendimiento sin llegar al burnout?',
        options: [
          {
            action: 'Planificar ciclos de intensidad y recuperacion, con foco en fortalezas por etapa',
            consequence: 'Rendimiento sostenible: el equipo llega al cierre con energia y claridad.',
            points: 2,
          },
          {
            action: 'Mantener la misma demanda y confiar en la resiliencia del equipo',
            consequence: 'Riesgo de burnout alto: la performance cae en el momento clave.',
            points: 0,
          },
          {
            action: 'Reducir la carga pero sin comunicar criterios de prioridad',
            consequence: 'Alivia presion, pero genera confusion sobre lo que importa.',
            points: 1,
          },
        ],
      },
    ],
  },
  {
    id: 'cognicion',
    title: 'Evaluacion 3: Cognicion (Pymetrics)',
    description: 'Mide tolerancia al riesgo, aprendizaje adaptativo por ensayo-error y calidad de razonamiento bajo incertidumbre.',
    visual: '/imagenes-fijas/ciudad-2.jpg',
    questions: [
      {
        visual: '/imagenes-fijas/region-1-etapa1.jpg',
        scene: '[Pymetrics — Tolerancia al riesgo] Tienes dos rutas de evacuacion. La A es segura pero lenta. La B es rapida pero hay un 35% de probabilidad de bloqueo por hielo.',
        prompt: 'Que ruta eliges y como lo comunicas al equipo?',
        options: [
          {
            action: 'Elegir la ruta B con contingencia preparada y comunicar el riesgo de forma transparente',
            consequence: 'Tolerancia al riesgo calibrada: velocidad con gestion activa de la incertidumbre.',
            points: 2,
          },
          {
            action: 'Elegir la ruta A sin evaluar si el tiempo perdido tambien es un riesgo',
            consequence: 'Baja tolerancia al riesgo: evita la perdida inmediata pero ignora el costo de la lentitud.',
            points: 1,
          },
          {
            action: 'No decidir y esperar mas informacion antes de mover al equipo',
            consequence: 'Paralisis por analisis: el tiempo de inaccion genera un riesgo mayor.',
            points: 0,
          },
        ],
      },
      {
        visual: '/imagenes-fijas/region-2.jpg',
        scene: '[Pymetrics — Aprendizaje adaptativo] Intentaste una estrategia de contencion que fallo. El mismo escenario volvera en 2 horas.',
        prompt: 'Como ajustas tu enfoque con lo que acabas de aprender?',
        options: [
          {
            action: 'Identificar que supuesto fallo, corregirlo puntualmente y reprobarlo con ajuste minimo',
            consequence: 'Aprendizaje adaptativo rapido: mejora incremental sin sobreingenieria.',
            points: 2,
          },
          {
            action: 'Descartar la estrategia completa y empezar desde cero',
            consequence: 'Reseteo total: se pierde lo que funciono y se gasta tiempo critico.',
            points: 0,
          },
          {
            action: 'Repetir la misma estrategia esperando un resultado diferente por el contexto',
            consequence: 'Sin aprendizaje: ignora la evidencia del primer intento.',
            points: 0,
          },
        ],
      },
      {
        visual: '/imagenes-fijas/migrantes.jpg',
        scene: '[Pymetrics — Razonamiento bajo presion] Recibes tres senales contradictorias al mismo tiempo: el GPS dice avanzar, el sensor dice frenar y un tripulante dice esperar.',
        prompt: 'Como tomas la decision con informacion ambigua?',
        options: [
          {
            action: 'Ponderar fuentes segun confiabilidad historica y decidir con el criterio mas robusto',
            consequence: 'Razonamiento de alta calidad: usa evidencia diferenciada en lugar de promediar.',
            points: 2,
          },
          {
            action: 'Promediar las tres senales y buscar una accion intermedia',
            consequence: 'Decision conservadora: reduce riesgo extremo pero puede ignorar la senal correcta.',
            points: 1,
          },
          {
            action: 'Elegir la senal que confirma lo que ya planeabas hacer',
            consequence: 'Sesgo de confirmacion activo: decision influida por creencia previa, no por evidencia.',
            points: 0,
          },
        ],
      },
    ],
  },
  {
    id: 'skills',
    title: 'Evaluacion 4: Skills (SHL)',
    description: 'Valida competencias aplicadas: planificacion, comunicacion asertiva y resolucion de problemas con impacto medible.',
    visual: '/imagenes-fijas/region-2.jpg',
    questions: [
      {
        visual: '/imagenes-fijas/intro-barco-2a.png',
        scene: '[SHL — Planificacion y organizacion] Tienes 4 horas para coordinar el cierre de dos zonas de riesgo con recursos limitados y sin margen de error.',
        prompt: 'Como estructuras el plan de ejecucion?',
        options: [
          {
            action: 'Definir prioridades por impacto, asignar recursos con criterio y establecer hitos de control',
            consequence: 'Competencia de planificacion alta: ejecucion ordenada con visibilidad de avance.',
            points: 2,
          },
          {
            action: 'Empezar por la tarea mas urgente y resolver el resto sobre la marcha',
            consequence: 'Estilo reactivo: efectivo a corto plazo pero sin estructura para sostener el ritmo.',
            points: 1,
          },
          {
            action: 'Esperar que el equipo se autoorganice y solo intervenir si hay problemas',
            consequence: 'Delegacion sin estructura: el equipo pierde tiempo por falta de direccion.',
            points: 0,
          },
        ],
      },
      {
        visual: '/imagenes-fijas/zocalo-sobre-ciudad.jpg',
        scene: '[SHL — Comunicacion asertiva] Un stakeholder critico desestima tu evaluacion de riesgo en publico y propone una alternativa que consideras peligrosa.',
        prompt: 'Como respondes en ese momento?',
        options: [
          {
            action: 'Exponer los datos que respaldan tu evaluacion y proponer una instancia de validacion conjunta',
            consequence: 'Comunicacion asertiva: defiende la posicion con evidencia sin escalar el conflicto.',
            points: 2,
          },
          {
            action: 'Ceder para evitar tension y ajustar el plan en privado despues',
            consequence: 'Pasividad situacional: el riesgo persiste y se pierde credibilidad tecnica.',
            points: 0,
          },
          {
            action: 'Aceptar publicamente pero documentar el desacuerdo por escrito',
            consequence: 'Estrategia de proteccion: genera registro, pero no resuelve el problema de raiz.',
            points: 1,
          },
        ],
      },
      {
        visual: '/imagenes-fijas/intro-barco-1a.png',
        scene: '[SHL — Resolucion de problemas] La evaluacion post-crisis revela que el mismo punto fallo tres veces. No hay tiempo para una solucion estructural antes del proximo ciclo.',
        prompt: 'Como gestionas el problema con recursos limitados?',
        options: [
          {
            action: 'Implementar una mitigacion rapida documentada y escalar el problema estructural con evidencia',
            consequence: 'Solucion pragmatica de alta competencia: protege el corto plazo y habilita la mejora.',
            points: 2,
          },
          {
            action: 'Ignorar el patron porque no hay tiempo para resolverlo ahora',
            consequence: 'Baja resolucion estructural: el problema se repite y el impacto escala.',
            points: 0,
          },
          {
            action: 'Intentar resolver la causa raiz completa aunque implique retrasar otras entregas',
            consequence: 'Perfeccionismo funcional: resuelve el fondo pero compromete compromisos actuales.',
            points: 1,
          },
        ],
      },
    ],
  },
];

function normalizeQuestions(questions: Question[]): Question[] {
  if (questions.length >= QUESTIONS_PER_EVALUATION) {
    return questions.slice(0, QUESTIONS_PER_EVALUATION);
  }

  const expanded = [...questions];
  let index = 0;

  while (expanded.length < QUESTIONS_PER_EVALUATION) {
    const base = questions[index % questions.length];
    expanded.push({
      ...base,
      prompt: `${base.prompt} (Variacion ${Math.floor(index / questions.length) + 1})`,
    });
    index += 1;
  }

  return expanded;
}

const TESTS_WITH_TEN_QUESTIONS: TestGame[] = TESTS.map((test) => ({
  ...test,
  questions: normalizeQuestions(test.questions),
}));

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
    () => TESTS_WITH_TEN_QUESTIONS.find((game) => game.id === activeGameId) || null,
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
  const activeQuestion = activeGame ? activeGame.questions[currentQuestionIndex] : null;
  const activeVisual = activeQuestion?.visual ?? activeGame?.visual ?? '/imagenes-fijas/mapamundi-etapa1.jpg';

  const [frontVisual, setFrontVisual] = useState(activeVisual);
  const [backVisual, setBackVisual] = useState<string | null>(null);
  const [isVisualTransitioning, setIsVisualTransitioning] = useState(false);

  useEffect(() => {
    if (activeVisual === frontVisual) return;

    setBackVisual(frontVisual);
    setFrontVisual(activeVisual);
    setIsVisualTransitioning(false);

    const frame = window.requestAnimationFrame(() => {
      setIsVisualTransitioning(true);
    });

    const timeout = window.setTimeout(() => {
      setBackVisual(null);
      setIsVisualTransitioning(false);
    }, 420);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
    };
  }, [activeVisual, frontVisual]);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <Image
                src="/logos-png/logo-ver-b.png"
                alt="Nawaiam"
                width={120}
                height={120}
                className="mb-3 h-10 w-auto md:hidden"
              />
              <Image
                src="/logos-png/logo-hor-b.png"
                alt="Nawaiam"
                width={200}
                height={56}
                className="mb-3 hidden h-9 w-auto md:block"
              />
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
              <Link href="/profile" className="rounded-lg border border-slate-700 px-4 py-2 hover:bg-slate-800">
                Mi perfil
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
              {TESTS_WITH_TEN_QUESTIONS.map((game) => (
                <article
                  key={game.id}
                  className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-800 p-6"
                >
                  <img
                    src={game.visual}
                    alt={`Visual de ${game.title}`}
                    className="mb-4 h-36 w-full rounded-lg object-cover"
                  />
                  <p className="mb-2 text-xs uppercase tracking-widest text-sky-300">Evaluacion por escenarios</p>
                  <h2 className="text-2xl font-semibold">{game.title}</h2>
                  <p className="mt-3 text-slate-300">{game.description}</p>
                  <p className="mt-2 text-xs text-slate-400">{game.questions.length} preguntas por evaluacion</p>
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
                <p className="text-sm text-slate-300">Escenario visual aplicado al test seleccionado</p>
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
              <div className="relative">
                {backVisual ? (
                  <img
                    src={backVisual}
                    alt={`Visual anterior del test ${activeGame.title}`}
                    className={`absolute inset-0 h-56 w-full rounded-lg object-cover transition-opacity duration-500 ${
                      isVisualTransitioning ? 'opacity-0' : 'opacity-100'
                    }`}
                  />
                ) : null}
                <img
                  src={frontVisual}
                  alt={`Visual del test ${activeGame.title}`}
                  className={`h-56 w-full rounded-lg object-cover transition-opacity duration-500 ${
                    isVisualTransitioning || !backVisual ? 'opacity-100' : 'opacity-0'
                  }`}
                />
                <div className="pointer-events-none absolute inset-0 rounded-lg bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/20" />
                <div className="absolute bottom-3 left-3 rounded-md bg-slate-950/70 px-3 py-2 text-xs text-slate-200">
                  Nivel de criticidad: {state.tone}
                </div>
              </div>
            </div>

            {!finished ? (
              <div>
                <p className="mb-2 text-sm text-sky-300">
                  Escenario {currentQuestionIndex + 1} de {activeGame.questions.length}
                </p>
                <p className="mb-2 rounded-lg border border-slate-700 bg-slate-800/60 p-3 text-sm text-slate-200">
                  {activeQuestion?.scene}
                </p>
                <h3 className="mb-5 text-xl">{activeQuestion?.prompt}</h3>
                <div className="grid gap-3">
                  {(activeQuestion?.options || []).map((option, index) => (
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
