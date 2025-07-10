import { google } from 'googleapis';
import { Readable } from 'stream';
import mime from 'mime-types';

const SCOPES = ['https://www.googleapis.com/auth/drive'];

const auth = new google.auth.GoogleAuth({
  keyFile: './lib/credentials.json',
  scopes: SCOPES,
});

export async function uploadToDrive(buffer, fileName, folderId) {
  const drive = google.drive({ version: 'v3', auth: await auth.getClient() });

  const fileMetadata = {
    name: fileName,
    parents: [folderId],
  };

  const media = {
    mimeType: mime.lookup(fileName) || 'application/pdf',
    body: Readable.from(Buffer.from(buffer)),
  };

  const response = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: 'id, webViewLink, webContentLink',
    supportsAllDrives: true,
  });

  console.log('✅ Uploaded file:', {
    id: response.data.id,
    name: fileName,
    link: response.data.webViewLink,
  });
  

  const fileId = response.data.id;

  // Optionnel : gestion des permissions, peut être commentée pour test
  await drive.permissions.create({
    fileId,
    requestBody: {
      type: 'domain',
      role: 'reader',
      domain: 'bonnefis.com',
    },
    supportsAllDrives: true,
  });


  return response.data.webViewLink;
}
