const puppeteer = require('puppeteer');
const path      = require('path');
const fs        = require('fs');

const outputDir = path.join(__dirname, 'slides');
if (!fs.existsSync(outputDir)) {
  console.log('✅ Criando diretório "slides"');
  fs.mkdirSync(outputDir);
}

// Inicia o Puppeteer
(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  console.log('✅ Puppeteer iniciado com sucesso');
  const page = await browser.newPage();
  // Define o tamanho da tela (1080×1080)
  await page.setViewport({ width: 1080, height: 1080 });
  // Carrega o HTML gerado
  const filePath = `file://${path.join(__dirname, 'carrossel.html')}`;
  await page.goto(filePath, { waitUntil: 'networkidle0' });

  for (let i = 1; i <= 5; i++) {
    const selector = `#slide${i}`;
    const elementHandle = await page.$(selector);
    if (!elementHandle) {
      console.warn(`⚠️ Slide ${i} não encontrado no DOM.`);
      continue;
    }
    // Screenshot diretamente do elemento
    const slidePath = path.join(outputDir, `slide${i}.png`);
    console.log(`✅ Salvando slide: ${slidePath}`);
    await elementHandle.screenshot({
      path: slidePath,
      omitBackground: true  // Remove o fundo padrão do navegador
    });
    console.log(`✅ Slide ${i} gerado com sucesso.`);
  }

  await browser.close();
  console.log('✅ Puppeteer fechado com sucesso');
})();