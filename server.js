// server.js
const express    = require('express');
const bodyParser = require('body-parser');
const { exec }   = require('child_process');
const fs         = require('fs');
const path       = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

// 1) Body parser para JSON
app.use(bodyParser.json());

// 2) Servir a pasta "slides" como conteúdo estático
app.use('/slides', express.static(path.join(__dirname, 'slides')));

// 3) Rota POST /generate
app.post('/generate', (req, res) => {
  const data = req.body;
  // espera: { imagePath, logoPath, slide1, slide2, slide3, slide4, slide5 }

  // 3.1) Injeta placeholders no template
  const template = fs.readFileSync(
    path.join(__dirname, 'template.html'),
    'utf-8'
  );
  const html = template
    .replace(/{{IMAGE_PATH}}/g, data.imagePath  || '')
    .replace(/{{LOGO_PATH}}/g,  data.logoPath   || '')
    .replace(/{{SLIDE1}}/g,     data.slide1     || '')
    .replace(/{{SLIDE2}}/g,     data.slide2     || '')
    .replace(/{{SLIDE3}}/g,     data.slide3     || '')
    .replace(/{{SLIDE4}}/g,     data.slide4     || '')
    .replace(/{{SLIDE5}}/g,     data.slide5     || '');

  // 3.2) Grava o HTML final para o Puppeteer processar
  fs.writeFileSync(
    path.join(__dirname, 'carrossel.html'),
    html,
    'utf-8'
  );

  console.log('▶️ Chamando o Puppeteer: node generateSlides.js');
- exec('node generateSlides.js', (err, stdout, stderr) => {
+ exec('node generateSlides.js', (err, stdout, stderr) => {
+   console.log('--- START PUPPETEER OUTPUT ---');
+   console.log('STDOUT:', stdout);
+   console.log('STDERR:', stderr);
+   console.log('---  END PUPPETEER OUTPUT  ---');

  // 3.3) Chama o Puppeteer para gerar os PNGs
  console.log('▶️ Chamando o Puppeteer: node generateSlides.js');
  exec('node generateSlides.js', (err, stdout, stderr) => {
    console.log('--- PUPPETEER STDOUT ---\n', stdout);
    console.log('--- PUPPETEER STDERR ---\n', stderr);

    if (err) {
      console.error('🔥 Erro ao gerar os slides:', err);
      return res
        .status(500)
        .send(`Erro ao gerar slides:\n${stderr || err.message}`);
    }

    console.log('✅ Slides gerados com sucesso');

    // 4) Retorna as URLs públicas dos slides
    const baseUrl = process.env.PUBLIC_URL
      || 'https://automacao-carrosseis-ai2-production.up.railway.app';

    return res.json({
      slide1Url: `${baseUrl}/slides/slide1.png`,
      slide2Url: `${baseUrl}/slides/slide2.png`,
      slide3Url: `${baseUrl}/slides/slide3.png`,
      slide4Url: `${baseUrl}/slides/slide4.png`,
      slide5Url: `${baseUrl}/slides/slide5.png`,
    });
  });
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
