import fs from 'fs';
import path from 'path';
import { chromium as playwrightChromium } from 'playwright-core';
import chromium from '@sparticuz/chromium';
import Handlebars from 'handlebars';

async function launchBrowser() {
  return playwrightChromium.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: true,
  });
}

export async function generatePDF(data) {
  console.time("⏱ Génération PDF");

  const templatePath = path.resolve('./templates/bilanVO.html');
  const templateHtml = fs.readFileSync(templatePath, 'utf8');
  const template = Handlebars.compile(templateHtml);

  const finalHtml = template(data);

  const browser = await launchBrowser();
  const page = await browser.newPage();

  await page.setContent(finalHtml, { waitUntil: 'networkidle' });

  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: {
      top: '150px',
      bottom: '40px',
      left: '20px',
      right: '20px',
    },
  });

  await browser.close();

  console.timeEnd("⏱ Génération PDF");

  return pdfBuffer;
}
