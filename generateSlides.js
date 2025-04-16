const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Pasta de saída para os slides
const outputDir = path.join(__dirname, 'slides');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const filePath = `file:${path.join(__dirname, 'carrossel.html')}`;
  await page.goto(filePath, { waitUntil: 'networkidle0' });

  for (let i = 1; i <= 5; i++) {
    const elementHandle = await page.$(`#slide${i}`);
    if (elementHandle) {
      const boundingBox = await elementHandle.boundingBox();
      await page.screenshot({
        path: path.join(outputDir, `slide${i}.png`),
        clip: {
          x: boundingBox.x,
          y: boundingBox.y,
          width: boundingBox.width,
          height: boundingBox.height
        }
      });
      console.log(`✅ Slide ${i} gerado com sucesso.`);
    } else {
      console.warn(`⚠️ Slide ${i} não encontrado.`);
    }
  }

  await browser.close();
})();
