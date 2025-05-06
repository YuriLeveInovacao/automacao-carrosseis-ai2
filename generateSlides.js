// generateSlides.js
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

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

  // 2.1) Define viewport 1:1 para feed do Instagram com alta resolução
  await page.setViewport({
    width: 1080,
    height: 1080,
    deviceScaleFactor: 2
  });

  // 3) Carrega o HTML gerado pelo servidor
  const filePath = `file://${path.join(__dirname, 'carrossel.html')}`;
  await page.goto(filePath, { waitUntil: 'networkidle0' });

  // 4) Gera um screenshot para cada slide
  const totalSlides = 5;
  for (let i = 1; i <= totalSlides; i++) {
    // 4.1) Exibe só o slide i, escondendo os demais
    await page.evaluate((current) => {
      document.querySelectorAll('.slide').forEach((el, idx) => {
        el.style.display = (idx + 1 === current) ? 'flex' : 'none';
      });
    }, i);

    // 4.2) Dá um tempinho para repintura e assets carregarem
    await page.waitForTimeout(500);

    // 4.3) Captura toda a área do viewport
    await page.screenshot({
      path: path.join(outputDir, `slide${i}.png`),
      clip: { x: 0, y: 0, width: 1080, height: 1080 }
    });

    console.log(`✅ Slide ${i} gerado com sucesso.`);
  }

  // 5) Fecha o browser
  await browser.close();
})();