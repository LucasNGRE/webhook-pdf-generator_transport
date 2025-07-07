import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import Handlebars from 'handlebars';


const logoPath = path.resolve('./public/logo.png');
const logoData = fs.readFileSync(logoPath);
const logoBase64 = logoData.toString('base64');
const logoMimeType = 'image/png';

const headerTemplate = `
  <div style="width: 100%; padding: 10px 20px; font-size: 0; text-align: left; text-align: center;">
    <img src="data:${logoMimeType};base64,${logoBase64}" style="height: 60px;" />
  </div>
`;
// Function to generate PDF from HTML template
export async function generatePDF(data) {
    const templatePath = path.resolve('./templates/bilanVO.html');
    const templateHtml = fs.readFileSync(templatePath, 'utf8');
    const template = Handlebars.compile(templateHtml);
  
    // ici, on ne passe plus logoSrc au template car on a enlevé le logo du HTML
    const finalHtml = template(data);
  
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(finalHtml, { waitUntil: 'networkidle0' });
  
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate, // <-- ajoute le header avec le logo ici
      footerTemplate: `
        <div style="font-size:12px; width:100%; text-align:center; color: gray; padding: 0 10px;">
          Page <span class="pageNumber"></span> sur <span class="totalPages"></span>
        </div>`,
      margin: {
        top: '100px', // important pour laisser de la place au header
        bottom: '40px',
        left: '20px',
        right: '20px',
      },
    });
  
    await browser.close();
    const finalBuffer = Buffer.from(pdfBuffer);
    console.log('✔️ finalBuffer instanceof Buffer:', finalBuffer instanceof Buffer);
    return finalBuffer;
  }
  