import { getRecordById, updateRecord } from '@/lib/airtable';
import { normalizeData } from '@/lib/utils';
import { generatePDF } from '@/lib/pdf';
import { uploadToDrive } from '@/lib/drive';
import { basicAuth } from '@/lib/auth';

export async function POST(request) {
    console.log('--- Début de la requête POST ---');

    // Vérification de l'authentification basique
    const authResponse = basicAuth(request);
    if (authResponse) {
        console.log('⚠️ Authentification échouée');
        return authResponse;
    }
    console.log('✅ Authentification réussie');

    const body = await request.json();
    const recordId = body.recordId;
    console.log('recordId reçu :', recordId);

    if (!recordId) {
        console.log('❌ recordId manquant dans la requête');
        return new Response('Missing recordId', { status: 400 });
    }

    try {
        console.log('⏳ Récupération des données Airtable...');
        const rawData = await getRecordById(recordId);
        console.log('✅ Données brutes récupérées:', rawData);

        const data = normalizeData(rawData);
        console.log('✅ Données normalisées:', data);

        console.log('⏳ Génération du PDF...');
        const pdfBuffer = await generatePDF(data);
        console.log('📄 Type de pdfBuffer :', typeof pdfBuffer);

        const folderId = process.env.DRIVE_FOLDER_ID;
        const titre = data.bilanVO || recordId;
        const safeTitle = titre.replace(/[\\/:*?"<>|]/g, '');
        const fileName = `${safeTitle}.pdf`;
        console.log(`Nom de fichier pour upload : ${fileName}`);

        console.log('⏳ Upload vers Google Drive...');
        const publicUrl = await uploadToDrive(pdfBuffer, fileName, folderId);
        console.log('✅ Fichier uploadé avec succès. URL publique :', publicUrl);

        console.log('⏳ Mise à jour du champ PDF dans Airtable...');
        await updateRecord(recordId, {
            PDF: publicUrl
        });
        console.log('✅ Airtable mis à jour');

        // Retourner un JSON avec l'URL
        return new Response(JSON.stringify({ url: publicUrl }), {
            headers: {
                'Content-Type': 'application/json'
            }
        });

    } catch (error) {
        console.error('❌ Error generating/uploading PDF:', error.message, error.stack);
        return new Response('Error generating/uploading PDF', { status: 500 });
    }
}
