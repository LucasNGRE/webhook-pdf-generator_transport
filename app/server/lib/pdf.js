import fs from 'fs';
import path from 'path';
import chromium from 'chrome-aws-lambda';
import puppeteer from 'puppeteer-core';
import Handlebars from 'handlebars';

const logoPath = path.resolve('./public/logo.png');
const logoData = fs.readFileSync(logoPath);
const logoBase64 = logoData.toString('base64');
const logoMimeType = 'image/png';

const headerTemplate = `
  <style>
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
  </style>
  <table style="width: 100%; border-collapse: collapse; margin: 0; padding: 0;">
    <tr>
      <td style="background-color: #e62246; height: 10px; text-align: center; color: white; line-height: 5px;">
        Hello World
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 80px 10px 80px;">
        <img src="data:${logoMimeType};base64,${logoBase64}" style="height: 50px;" />
      </td>
    </tr>
  </table>
`;

async function launchBrowser() {
  const executablePath = await chromium.executablePath;

  return puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath,
    headless: chromium.headless,
  });
}

export async function generatePDF(data) {
  const templatePath = path.resolve('./templates/bilanVO.html');
  const templateHtml = fs.readFileSync(templatePath, 'utf8');
  const template = Handlebars.compile(templateHtml);

  const initialHtml = template(data);

  // 1er lancement du navigateur pour récupérer le sommaire
  const browser = await launchBrowser();
  const page = await browser.newPage();
  await page.setContent(initialHtml, { waitUntil: 'networkidle0' });

  // Calcul de la hauteur d'une page A4 en pixels
  const pageHeightPx = await page.evaluate(() => {
    const inchToPx = (inches) => inches * 96; // 96 DPI
    return inchToPx(11.69); // Hauteur A4
  });

  const pageOffset = 2; // Nombre de pages avant le contenu (couverture + sommaire)

  const tocItems = await page.evaluate((pageHeight, offset) => {
    const items = [];
    const headings = document.querySelectorAll('[data-sommaire]');
    headings.forEach((el) => {
      const topPx = el.offsetTop;
      const pageNumber = Math.floor(topPx / pageHeight) + 1 + offset;
      items.push({
        id: el.id,
        title: el.getAttribute('data-sommaire'),
        page: pageNumber,
      });
    });
    return items;
  }, pageHeightPx, pageOffset);

  await browser.close();

  // Injecte les items du sommaire dans les données
  const dataWithTOC = {
    ...data,
    sommaire: tocItems,
  };

  // Recompile le HTML avec les données du sommaire
  const finalHtml = template(dataWithTOC);

  // 2e lancement du navigateur pour générer le PDF final
  const browser2 = await launchBrowser();
  const page2 = await browser2.newPage();
  await page2.setContent(finalHtml, { waitUntil: 'networkidle0' });

  // Mise à jour des numéros de pages dans le DOM
  await page2.evaluate((tocItems) => {
    tocItems.forEach((item) => {
      const link = document.querySelector(`#sommaire a[href="#${item.id}"]`);
      const pageSpan = link?.nextElementSibling;
      if (pageSpan && pageSpan.classList.contains('page-number')) {
        pageSpan.textContent = item.page;
      }
    });
  }, tocItems);

  // Génération du PDF
  const pdfBuffer = await page2.pdf({
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate,
    footerTemplate: `
      <div style="width: 100%; font-size:12px; margin: 0; padding: 0;">
        <div style="color: gray; text-align: center; padding: 5px 10px;">
          Page <span class="pageNumber"></span> sur <span class="totalPages"></span>
        </div>
        <div style="background-color: #e62246; height: 40px; width: 100%;"></div>
      </div>
    `,
    margin: {
      top: '150px',
      bottom: '40px',
      left: '20px',
      right: '20px',
    },
  });

  await browser2.close();
  return pdfBuffer;
}
