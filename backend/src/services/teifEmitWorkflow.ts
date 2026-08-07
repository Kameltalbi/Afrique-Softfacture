import { prisma } from '../lib/db.js';
import { embedTeifSignature } from '../lib/einvoice/teif/buildTeifXml.js';
import { computeTeifContentHash } from '../lib/einvoice/teif/canonicalHash.js';
import { logger } from '../lib/logger.js';
import { signTeifContentHash, getDigigoMode } from './digigoSign.js';
import { generateTeifXml, TeifGenerateError } from './teifGenerate.js';
import { submitSignedTeifToTtn } from './ttnProxyClient.js';

export class TeifEmitError extends Error {
  constructor(
    message: string,
    readonly statusCode = 400
  ) {
    super(message);
    this.name = 'TeifEmitError';
  }
}

/**
 * Chaîne complète SoftFacture TEIF :
 * XML 1.8.8 → SHA-256 → signature Digigo (sim/prod) → transmission TTN → traçabilité.
 */
export async function emitTeifEInvoice(invoiceId: string, organizationId: string) {
  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, organizationId },
    select: {
      id: true,
      number: true,
      status: true,
      teifEInvoiceStatus: true,
      digigoCredentialId: true,
      organization: { select: { billingEmail: true, name: true } },
    },
  });

  if (!invoice) throw new TeifEmitError('Facture introuvable', 404);
  if (!invoice.number) {
    throw new TeifEmitError(
      'Validez la facture (numéro définitif) avant d’émettre la e-facture',
      400
    );
  }
  if (invoice.status === 'DRAFT') {
    throw new TeifEmitError('Émission TEIF réservée aux factures validées', 400);
  }
  if (invoice.status === 'CANCELLED') {
    throw new TeifEmitError('Facture annulée — émission TEIF indisponible', 400);
  }
  if (invoice.teifEInvoiceStatus === 'TRANSMITTED') {
    throw new TeifEmitError('Cette facture a déjà été émise et transmise (TTN)', 409);
  }

  const mode = getDigigoMode();

  try {
    // 1. Génération XML TEIF
    let generated;
    try {
      generated = await generateTeifXml(invoiceId, organizationId);
    } catch (e) {
      if (e instanceof TeifGenerateError) {
        throw new TeifEmitError(e.message, e.statusCode);
      }
      throw e;
    }

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        teifXml: generated.xml,
        teifEInvoiceStatus: 'GENERATED',
        teifLastError: null,
      },
    });

    // 2. Hash SHA-256 canonique
    const contentHash = computeTeifContentHash(generated.xml);
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        teifContentHash: contentHash,
        teifEInvoiceStatus: 'HASHED',
      },
    });

    // 3. Signature Digigo
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { teifEInvoiceStatus: 'SIGNING' },
    });

    const signed = await signTeifContentHash(contentHash, {
      credentialId: invoice.digigoCredentialId,
      signerEmail: invoice.organization.billingEmail,
    });

    const signedXml = embedTeifSignature(generated.xml, {
      contentHashHex: contentHash,
      signatureValue: signed.signatureValue,
      mode: signed.mode,
    });

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        teifXml: signedXml,
        teifSignature: signed.signatureValue,
        teifSignedAt: signed.signedAt,
        digigoSessionId: signed.sessionId,
        digigoCredentialId: signed.credentialId,
        teifEInvoiceStatus: 'SIGNED',
      },
    });

    // 4. Transmission TTN
    const ttn = await submitSignedTeifToTtn({
      signedXml,
      invoiceNumber: invoice.number,
    });

    if (!ttn.ok) {
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          teifEInvoiceStatus: 'REJECTED',
          teifLastError: ttn.errorMessage ?? 'Transmission TTN échouée',
        },
      });
      throw new TeifEmitError(ttn.errorMessage ?? 'Transmission TTN échouée', 502);
    }

    const now = new Date();
    const [updated, transmission] = await prisma.$transaction([
      prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          teifEInvoiceStatus: 'TRANSMITTED',
          ttnReference: ttn.reference,
          ttnSubmittedAt: now,
          teifLastError: null,
        },
      }),
      prisma.eInvoiceTransmission.create({
        data: {
          organizationId,
          invoiceId,
          paProvider: ttn.channel === 'proxy' ? 'TTN' : 'MOCK',
          status: 'DEPOSITED',
          paExternalId: ttn.reference,
          lastError: null,
          depositedAt: now,
        },
      }),
    ]);

    logger.info(
      {
        invoiceId,
        number: invoice.number,
        mode,
        channel: ttn.channel,
        reference: ttn.reference,
      },
      'TEIF: e-facture émise'
    );

    return {
      invoice: {
        id: updated.id,
        number: updated.number,
        teifEInvoiceStatus: updated.teifEInvoiceStatus,
        teifContentHash: updated.teifContentHash,
        teifSignature: updated.teifSignature,
        teifSignedAt: updated.teifSignedAt,
        digigoSessionId: updated.digigoSessionId,
        digigoCredentialId: updated.digigoCredentialId,
        ttnReference: updated.ttnReference,
        ttnSubmittedAt: updated.ttnSubmittedAt,
      },
      transmission,
      signMode: mode,
      ttnChannel: ttn.channel,
      note:
        mode === 'simulation'
          ? 'Émission en mode simulation (signature Digigo simulée). Configurez DIGIGO_* pour la signature réelle.'
          : ttn.channel === 'mock'
            ? 'Signature Digigo réelle — dépôt TTN en mock (proxy non configuré).'
            : 'E-facture TEIF signée et transmise via proxy TTN.',
    };
  } catch (e) {
    if (e instanceof TeifEmitError) throw e;
    const message = e instanceof Error ? e.message : 'Échec émission TEIF';
    await prisma.invoice
      .update({
        where: { id: invoiceId },
        data: { teifEInvoiceStatus: 'REJECTED', teifLastError: message },
      })
      .catch(() => undefined);
    throw new TeifEmitError(message, 500);
  }
}
