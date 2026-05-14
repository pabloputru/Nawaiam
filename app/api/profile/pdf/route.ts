import { readFile } from 'fs/promises';
import path from 'path';

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/auth';
import { findMemoryUserByEmail } from '@/lib/auth-store';
import { prisma } from '@/lib/prisma';
import { listMemoryResultsByEmail } from '@/lib/result-store';

export const runtime = 'nodejs';

type CandidateProfile = {
  firstName: string;
  lastName: string;
  birthDate: Date | null;
  position: string | null;
  company: string | null;
};

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

const CAPACITIES_BY_GAME: Record<string, string[]> = {
  'conducta-base': [
    'Estabilidad emocional bajo presion',
    'Consistencia conductual y autocontrol',
    'Confianza interpersonal y accountability',
  ],
  motivacion: [
    'Engagement y activacion de fortalezas',
    'Energia sostenida y bienestar',
    'Sentido de proposito y reconocimiento efectivo',
  ],
  cognicion: [
    'Toma de decisiones bajo incertidumbre',
    'Aprendizaje adaptativo y deteccion de sesgos',
    'Razonamiento probabilistico y flexibilidad cognitiva',
  ],
  skills: [
    'Planificacion y priorizacion',
    'Comunicacion asertiva y colaboracion',
    'Resolucion de problemas con impacto',
  ],
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

function splitTextByWidth(text: string, maxWidth: number, font: Awaited<ReturnType<PDFDocument['embedFont']>>, size: number) {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;

    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      currentLine = candidate;
      continue;
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    currentLine = word;
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

function sanitizeFileName(input: string) {
  return input
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
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
    console.error('Profile PDF database error', getErrorSummary(error));

    results = listMemoryResultsByEmail(userEmail);

    const memoryUser = findMemoryUserByEmail(userEmail);

    if (memoryUser) {
      candidateProfile = {
        firstName: memoryUser.firstName,
        lastName: memoryUser.lastName,
        birthDate: memoryUser.birthDate,
        position: memoryUser.position,
        company: memoryUser.company,
      };
    }
  }

  const fullName = `${candidateProfile.firstName} ${candidateProfile.lastName}`.trim() || fallbackName;
  const totalScore = results.reduce((acc, result) => acc + result.score, 0);
  const totalPossible = results.reduce((acc, result) => acc + result.total, 0);
  const globalPercent = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;

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

  const pdf = await PDFDocument.create();
  const regularFont = await pdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);

  const pageSize: [number, number] = [595.28, 841.89];
  const marginX = 42;
  const topMargin = 46;
  const bottomMargin = 42;
  const contentWidth = pageSize[0] - marginX * 2;

  let page = pdf.addPage(pageSize);
  let y = pageSize[1] - topMargin;

  const ensureSpace = (heightNeeded: number) => {
    if (y - heightNeeded >= bottomMargin) {
      return;
    }

    page = pdf.addPage(pageSize);
    y = pageSize[1] - topMargin;
  };

  const drawSectionTitle = (title: string) => {
    ensureSpace(26);
    page.drawText(title, {
      x: marginX,
      y,
      size: 13,
      font: boldFont,
      color: rgb(0.07, 0.12, 0.2),
    });
    y -= 18;
  };

  const drawTextLine = (text: string, options?: { size?: number; bold?: boolean; color?: [number, number, number] }) => {
    const size = options?.size ?? 10;
    ensureSpace(size + 6);
    page.drawText(text, {
      x: marginX,
      y,
      size,
      font: options?.bold ? boldFont : regularFont,
      color: options?.color ? rgb(options.color[0], options.color[1], options.color[2]) : rgb(0.12, 0.16, 0.2),
    });
    y -= size + 4;
  };

  const drawWrappedParagraph = (text: string, size = 10) => {
    const lines = splitTextByWidth(text, contentWidth, regularFont, size);

    for (const line of lines) {
      drawTextLine(line, { size });
    }
  };

  try {
    const logoPath = path.join(process.cwd(), 'public', 'logos-png', 'logo-hor.png');
    const logoBytes = await readFile(logoPath);
    const logoImage = await pdf.embedPng(logoBytes);
    const targetWidth = 150;
    const scale = targetWidth / logoImage.width;
    const targetHeight = logoImage.height * scale;

    page.drawImage(logoImage, {
      x: marginX,
      y: y - targetHeight,
      width: targetWidth,
      height: targetHeight,
    });

    y -= targetHeight + 10;
  } catch {
    drawTextLine('Nawaiam', { size: 18, bold: true, color: [0.05, 0.12, 0.25] });
    y -= 2;
  }

  page.drawLine({
    start: { x: marginX, y },
    end: { x: marginX + contentWidth, y },
    thickness: 1,
    color: rgb(0.85, 0.88, 0.93),
  });
  y -= 16;

  drawTextLine('Reporte de Perfil y Resultados', { size: 16, bold: true, color: [0.05, 0.12, 0.25] });
  drawTextLine(`Generado: ${new Date().toLocaleString('es-AR')}`);
  if (dbUnavailable) {
    drawTextLine('Origen de datos: modo contingencia (almacenamiento temporal)', { color: [0.58, 0.34, 0.03] });
  }
  y -= 8;

  drawSectionTitle('Datos de la persona');
  drawTextLine(`Nombre y apellido: ${fullName}`);
  drawTextLine(`Email: ${userEmail}`);
  drawTextLine(`Fecha de nacimiento: ${candidateProfile.birthDate ? new Date(candidateProfile.birthDate).toLocaleDateString('es-AR') : 'Sin datos'}`);
  drawTextLine(`Puesto: ${candidateProfile.position || 'Sin datos'}`);
  drawTextLine(`Empresa: ${candidateProfile.company || 'Sin datos'}`);
  y -= 8;

  drawSectionTitle('Resumen general');
  drawTextLine(`Tests realizados: ${results.length}`);
  drawTextLine(`Promedio global: ${globalPercent}%`);
  drawTextLine(`Puntaje total acumulado: ${totalScore}/${totalPossible || 0}`);
  y -= 8;

  drawSectionTitle('Capacidades y rendimiento por evaluacion');

  if (summaryByGame.length === 0) {
    drawTextLine('No hay evaluaciones realizadas aun.');
  } else {
    for (const summary of summaryByGame) {
      ensureSpace(70);
      drawTextLine(summary.gameTitle, { bold: true, size: 11, color: [0.07, 0.12, 0.2] });
      drawTextLine(
        `Intentos: ${summary.attempts} | Promedio score: ${summary.avgScore.toFixed(1)} | Promedio %: ${Math.round(summary.avgPercent)}% | Mejor score: ${summary.bestScore}`
      );
      drawTextLine(`Ultimo resultado: ${summary.latestLabel}`);

      const capacities = CAPACITIES_BY_GAME[summary.gameId] || ['Capacidades conductuales generales'];
      drawWrappedParagraph(`Capacidades evaluadas: ${capacities.join(', ')}.`);
      y -= 4;
    }
  }

  drawSectionTitle('Detalle de resultados (ultimos 20)');

  if (results.length === 0) {
    drawTextLine('Sin resultados para mostrar.');
  } else {
    for (const result of results.slice(0, 20)) {
      const percent = result.total > 0 ? Math.round((result.score / result.total) * 100) : 0;
      drawWrappedParagraph(
        `${new Date(result.createdAt).toLocaleString('es-AR')} - ${result.gameTitle} - ${result.score}/${result.total} (${percent}%) - ${result.label}`,
        9
      );
    }
  }

  const pages = pdf.getPages();

  for (let i = 0; i < pages.length; i += 1) {
    const current = pages[i];
    current.drawText(`Pagina ${i + 1} de ${pages.length}`, {
      x: marginX,
      y: 20,
      size: 9,
      font: regularFont,
      color: rgb(0.4, 0.45, 0.5),
    });
  }

  const pdfBytes = await pdf.save();
  const safeName = sanitizeFileName(fullName) || 'perfil';
  const filename = `perfil-nawaiam-${safeName}.pdf`;

  return new NextResponse(Buffer.from(pdfBytes), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
