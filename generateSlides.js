const puppeteer = require('puppeteer');
const path      = require('path');
const fs        = require('fs');

const outputDir = path.join(__dirname, 'slides');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  // define viewport 1080×1080
  await page.setViewport({ width: 1080, height: 1080 });
  // carrega o HTML gerado
  const filePath = `file://${path.join(__dirname, 'carrossel.html')}`;
  await page.goto(filePath, { waitUntil: 'networkidle0' });

  for (let i = 1; i <= 5; i++) {
    const selector = `#slide${i}`;
    const elementHandle = await page.$(selector);
    if (!elementHandle) {
      console.warn(`⚠️ Slide ${i} não encontrado no DOM.`);
      continue;
    }
    // screenshot diretamente do elemento
    await elementHandle.screenshot({
      path: path.join(outputDir, `slide${i}.png`),
      omitBackground: true  // remove fundo padrão do navegador
    });
    console.log(`✅ Slide ${i} gerado com sucesso.`);
  }

  await browser.close();
})();
