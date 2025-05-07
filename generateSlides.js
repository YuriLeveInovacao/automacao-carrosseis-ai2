// generateSlides.js
const puppeteer = require('puppeteer');
const path      = require('path');
const fs        = require('fs');

// 1) Cria a pasta de saída ./slides se não existir
const outputDir = path.join(__dirname, 'slides');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

(async () => {
  // 2) Inicializa o Chromium headless com flags para container
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  // 3) Carrega o HTML gerado pelo servidor
  const filePath = `file://${path.join(__dirname, 'carrossel.html')}`;
  await page.goto(filePath, { waitUntil: 'networkidle0' });

  // 4) Para cada slide, faz screenshot do seu container
  for (let i = 1; i <= 5; i++) {
    const selector      = `#slide${i}`;
    const elementHandle = await page.$(selector);
    if (elementHandle) {
      const box = await elementHandle.boundingBox();
      await page.screenshot({
        path: path.join(outputDir, `slide${i}.png`),
        clip: {
          x:      box.x,
          y:      box.y,
          width:  box.width,
          height: box.height
        }
      });
      console.log(`✅ Slide ${i} gerado com sucesso.`);
    } else {
      console.warn(`⚠️ Slide ${i} não encontrado no DOM.`);
    }
  }

  // 5) Fecha o browser
  await browser.close();
})();