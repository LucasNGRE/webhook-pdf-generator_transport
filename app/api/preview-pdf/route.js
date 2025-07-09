import { getRecordById } from '@/lib/airtable';
import { normalizeData } from '@/lib/utils';
import { generatePDF } from '@/lib/pdf';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const recordId = searchParams.get('recordId');

  if (!recordId) {
    return new Response('❌ Paramètre recordId manquant', { status: 400 });
  }

  try {
    console.log('📥 Récupération du record Airtable...');
    const rawData = await getRecordById(recordId);
    const data = normalizeData(rawData);

    console.log('🧠 Données normalisées :', data);

    const pdfBuffer = await generatePDF(data);

    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="preview.pdf"',
      },
    });
  } catch (error) {
    console.error('❌ Erreur dans /api/preview-pdf :', error);
    return new Response('Erreur lors de la génération du PDF', { status: 500 });
  }
}
