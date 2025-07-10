import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';
import Handlebars from 'handlebars';

const logoPath = path.resolve('./public/logo.png');
const logoData = fs.readFileSync(logoPath);
const logoBase64 = logoData.toString('base64');
const logoMimeType = 'image/png';

async function launchBrowser() {
  return chromium.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: true,
  });
}

export async function generatePDF(data) {
  const templatePath = path.resolve('./templates/bilanVO.html');
  const templateHtml = fs.readFileSync(templatePath, 'utf8');
  const template = Handlebars.compile(templateHtml);

  const initialHtml = template(data);

  // 1er lancement pour récupérer le sommaire
  const browser = await launchBrowser();
  const page = await browser.newPage();
  await page.setContent(initialHtml, { waitUntil: 'networkidle' });

  const pageHeightPx = await page.evaluate(() => 11.69 * 96);
  const pageOffset = 2;

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

  const dataWithTOC = { ...data, sommaire: tocItems };
  const finalHtml = template(dataWithTOC);

  // 2e lancement pour générer le PDF final
  const browser2 = await launchBrowser();
  const page2 = await browser2.newPage();
  await page2.setContent(finalHtml, { waitUntil: 'networkidle' });

  await page2.evaluate((tocItems) => {
    tocItems.forEach((item) => {
      const link = document.querySelector(`#sommaire a[href="#${item.id}"]`);
      const pageSpan = link?.nextElementSibling;
      if (pageSpan && pageSpan.classList.contains('page-number')) {
        pageSpan.textContent = item.page;
      }
    });
  }, tocItems);

  const pdfBuffer = await page2.pdf({
    format: 'A4',
    printBackground: true,
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
