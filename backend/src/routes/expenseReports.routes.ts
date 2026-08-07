import { Router } from 'express';
import { z } from 'zod';
import { Prisma } from '../generated/prisma/index.js';
import type { ExpenseCategory, ExpenseStatus } from '../generated/prisma/index.js';
import { prisma } from '../lib/db.js';

const router = Router();

const orgId = (req: Express.Request) => req.user!.organizationId!;
const userId = (req: Express.Request) => req.user!.sub;

const CATEGORIES = [
  'MEALS',
  'TRANSPORT',
  'ACCOMMODATION',
  'SUPPLIES',
  'TELECOM',
  'OTHER',
] as const satisfies readonly ExpenseCategory[];

const STATUSES = [
  'DRAFT',
  'SUBMITTED',
  'APPROVED',
  'REJECTED',
  'REIMBURSED',
] as const satisfies readonly ExpenseStatus[];

const lineSchema = z.object({
  expenseDate: z.string().min(1),
  category: z.enum(CATEGORIES).optional(),
  description: z.string().min(1),
  vendor: z.string().optional().nullable(),
  amountHt: z.number().nonnegative(),
  taxRate: z.number().min(0).max(100).optional(),
});

const reportBody = z.object({
  title: z.string().min(1),
  expenseDate: z.string().min(1),
  currency: z.string().min(3).max(3).optional(),
  notes: z.string().optional().nullable(),
  lines: z.array(lineSchema).min(1),
});

function parseDateOnly(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return Number.isNaN(d.getTime()) ? null : d;
}

function computeLine(line: z.infer<typeof lineSchema>) {
  const amountHt = new Prisma.Decimal(line.amountHt);
  const taxRate = new Prisma.Decimal(line.taxRate ?? 0);
  const vatAmount = amountHt.mul(taxRate).div(100);
  const amountTtc = amountHt.add(vatAmount);
  const expenseDate = parseDateOnly(line.expenseDate);
  if (!expenseDate) {
    return { error: `Date de ligne invalide: ${line.expenseDate}` } as const;
  }
  return {
    expenseDate,
    category: (line.category ?? 'OTHER') as ExpenseCategory,
    description: line.description.trim(),
    vendor: line.vendor?.trim() || null,
    amountHt,
    taxRate,
    vatAmount,
    amountTtc,
  };
}

function sumTotals(lines: ReturnType<typeof computeLine>[]) {
  let subtotalHt = new Prisma.Decimal(0);
  let vatTotal = new Prisma.Decimal(0);
  let totalTtc = new Prisma.Decimal(0);
  for (const line of lines) {
    if ('error' in line) continue;
    subtotalHt = subtotalHt.add(line.amountHt);
    vatTotal = vatTotal.add(line.vatAmount);
    totalTtc = totalTtc.add(line.amountTtc);
  }
  return { subtotalHt, vatTotal, totalTtc };
}

async function nextExpenseNumber(organizationId: string): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `NF-${year}-`;
  const last = await prisma.expenseReport.findFirst({
    where: {
      organizationId,
      number: { startsWith: prefix },
    },
    orderBy: { number: 'desc' },
    select: { number: true },
  });
  const lastSeq = last?.number ? Number(last.number.slice(prefix.length)) : 0;
  const next = Number.isFinite(lastSeq) ? lastSeq + 1 : 1;
  return `${prefix}${String(next).padStart(4, '0')}`;
}

const reportInclude = {
  lines: { orderBy: { sortOrder: 'asc' as const } },
  createdBy: { select: { id: true, name: true, email: true } },
} as const;

router.get('/', async (req, res) => {
  const status =
    typeof req.query.status === 'string' && STATUSES.includes(req.query.status as ExpenseStatus)
      ? (req.query.status as ExpenseStatus)
      : undefined;
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';

  const reports = await prisma.expenseReport.findMany({
    where: {
      organizationId: orgId(req),
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { number: { contains: q, mode: 'insensitive' } },
              { notes: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    include: {
      createdBy: { select: { id: true, name: true, email: true } },
      _count: { select: { lines: true } },
    },
    orderBy: [{ expenseDate: 'desc' }, { createdAt: 'desc' }],
  });
  return res.json(reports);
});

router.get('/:id', async (req, res) => {
  const report = await prisma.expenseReport.findFirst({
    where: { id: req.params.id, organizationId: orgId(req) },
    include: reportInclude,
  });
  if (!report) return res.status(404).json({ error: 'Note de frais introuvable' });
  return res.json(report);
});

router.post('/', async (req, res) => {
  const parsed = reportBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Données invalides', details: parsed.error.flatten() });
  }

  const expenseDate = parseDateOnly(parsed.data.expenseDate);
  if (!expenseDate) {
    return res.status(400).json({ error: 'Date de note invalide (YYYY-MM-DD)' });
  }

  const computedLines = parsed.data.lines.map(computeLine);
  const bad = computedLines.find((l) => 'error' in l);
  if (bad && 'error' in bad) {
    return res.status(400).json({ error: bad.error });
  }
  const lines = computedLines as Exclude<(typeof computedLines)[number], { error: string }>[];
  const totals = sumTotals(lines);

  const org = await prisma.organization.findUnique({
    where: { id: orgId(req) },
    select: { defaultCurrency: true },
  });

  const report = await prisma.expenseReport.create({
    data: {
      organizationId: orgId(req),
      createdById: userId(req),
      title: parsed.data.title.trim(),
      expenseDate,
      currency: (parsed.data.currency ?? org?.defaultCurrency ?? 'TND').toUpperCase(),
      notes: parsed.data.notes?.trim() || null,
      ...totals,
      lines: {
        create: lines.map((line, index) => ({
          ...line,
          sortOrder: index,
        })),
      },
    },
    include: reportInclude,
  });

  return res.status(201).json(report);
});

router.put('/:id', async (req, res) => {
  const parsed = reportBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Données invalides', details: parsed.error.flatten() });
  }

  const existing = await prisma.expenseReport.findFirst({
    where: { id: req.params.id, organizationId: orgId(req) },
  });
  if (!existing) return res.status(404).json({ error: 'Note de frais introuvable' });
  if (existing.status !== 'DRAFT' && existing.status !== 'REJECTED') {
    return res
      .status(400)
      .json({ error: 'Seuls les brouillons (ou notes refusées) sont modifiables' });
  }

  const expenseDate = parseDateOnly(parsed.data.expenseDate);
  if (!expenseDate) {
    return res.status(400).json({ error: 'Date de note invalide (YYYY-MM-DD)' });
  }

  const computedLines = parsed.data.lines.map(computeLine);
  const bad = computedLines.find((l) => 'error' in l);
  if (bad && 'error' in bad) {
    return res.status(400).json({ error: bad.error });
  }
  const lines = computedLines as Exclude<(typeof computedLines)[number], { error: string }>[];
  const totals = sumTotals(lines);

  const report = await prisma.$transaction(async (tx) => {
    await tx.expenseLine.deleteMany({ where: { reportId: existing.id } });
    return tx.expenseReport.update({
      where: { id: existing.id },
      data: {
        title: parsed.data.title.trim(),
        expenseDate,
        currency: (parsed.data.currency ?? existing.currency).toUpperCase(),
        notes: parsed.data.notes?.trim() || null,
        status: 'DRAFT',
        rejectionReason: null,
        rejectedAt: null,
        submittedAt: null,
        approvedAt: null,
        reimbursedAt: null,
        ...totals,
        lines: {
          create: lines.map((line, index) => ({
            ...line,
            sortOrder: index,
          })),
        },
      },
      include: reportInclude,
    });
  });

  return res.json(report);
});

router.post('/:id/submit', async (req, res) => {
  const existing = await prisma.expenseReport.findFirst({
    where: { id: req.params.id, organizationId: orgId(req) },
    include: { _count: { select: { lines: true } } },
  });
  if (!existing) return res.status(404).json({ error: 'Note de frais introuvable' });
  if (existing.status !== 'DRAFT' && existing.status !== 'REJECTED') {
    return res.status(400).json({ error: 'Cette note ne peut pas être soumise' });
  }
  if (existing._count.lines < 1) {
    return res.status(400).json({ error: 'Ajoutez au moins une ligne avant de soumettre' });
  }

  const number = existing.number ?? (await nextExpenseNumber(orgId(req)));
  const report = await prisma.expenseReport.update({
    where: { id: existing.id },
    data: {
      status: 'SUBMITTED',
      number,
      submittedAt: new Date(),
      rejectedAt: null,
      rejectionReason: null,
      approvedAt: null,
      reimbursedAt: null,
    },
    include: reportInclude,
  });
  return res.json(report);
});

router.post('/:id/approve', async (req, res) => {
  const existing = await prisma.expenseReport.findFirst({
    where: { id: req.params.id, organizationId: orgId(req) },
  });
  if (!existing) return res.status(404).json({ error: 'Note de frais introuvable' });
  if (existing.status !== 'SUBMITTED') {
    return res.status(400).json({ error: 'Seules les notes soumises peuvent être approuvées' });
  }

  const report = await prisma.expenseReport.update({
    where: { id: existing.id },
    data: {
      status: 'APPROVED',
      approvedAt: new Date(),
      rejectedAt: null,
      rejectionReason: null,
    },
    include: reportInclude,
  });
  return res.json(report);
});

const rejectBody = z.object({
  reason: z.string().min(1).max(500),
});

router.post('/:id/reject', async (req, res) => {
  const parsed = rejectBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Motif de refus requis' });
  }

  const existing = await prisma.expenseReport.findFirst({
    where: { id: req.params.id, organizationId: orgId(req) },
  });
  if (!existing) return res.status(404).json({ error: 'Note de frais introuvable' });
  if (existing.status !== 'SUBMITTED') {
    return res.status(400).json({ error: 'Seules les notes soumises peuvent être refusées' });
  }

  const report = await prisma.expenseReport.update({
    where: { id: existing.id },
    data: {
      status: 'REJECTED',
      rejectedAt: new Date(),
      rejectionReason: parsed.data.reason.trim(),
      approvedAt: null,
      reimbursedAt: null,
    },
    include: reportInclude,
  });
  return res.json(report);
});

router.post('/:id/reimburse', async (req, res) => {
  const existing = await prisma.expenseReport.findFirst({
    where: { id: req.params.id, organizationId: orgId(req) },
  });
  if (!existing) return res.status(404).json({ error: 'Note de frais introuvable' });
  if (existing.status !== 'APPROVED') {
    return res
      .status(400)
      .json({ error: 'Seules les notes approuvées peuvent être marquées remboursées' });
  }

  const report = await prisma.expenseReport.update({
    where: { id: existing.id },
    data: {
      status: 'REIMBURSED',
      reimbursedAt: new Date(),
    },
    include: reportInclude,
  });
  return res.json(report);
});

router.delete('/:id', async (req, res) => {
  const existing = await prisma.expenseReport.findFirst({
    where: { id: req.params.id, organizationId: orgId(req) },
  });
  if (!existing) return res.status(404).json({ error: 'Note de frais introuvable' });
  if (existing.status !== 'DRAFT' && existing.status !== 'REJECTED') {
    return res
      .status(400)
      .json({ error: 'Seuls les brouillons (ou notes refusées) peuvent être supprimés' });
  }

  await prisma.expenseReport.delete({ where: { id: existing.id } });
  return res.status(204).send();
});

export default router;
