// server.js
const express   = require('express');
const bodyParser = require('body-parser');
const { exec }  = require('child_process');
const fs        = require('fs');
const path      = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Resolve a URL pública (Railway ou variável CUSTOM)
const PUBLIC_URL = process.env.PUBLIC_URL
  || (process.env.RAILWAY_PUBLIC_DOMAIN
      ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
      : 'https://automacao-carrosseis-ai2-production.up.railway.app');

// 1) Body parser para JSON
app.use(bodyParser.json());

// 2) Serve a pasta "slides" e o logo como conteúdo estático
app.use('/slides', express.static(path.join(__dirname, 'slides')));

// 3) Rota POST /generate
app.post('/generate', (req, res) => {
  const data = req.body;
  // espera: { slide1, slide2, slide3, slide4, slide5 }

  // 3.1) Injeta placeholders no template
  const templatePath = path.join(__dirname, 'template.html');
  let html = fs.readFileSync(templatePath, 'utf-8');

  html = html
    .replace(/{{LOGO_PATH}}/g, data.logoPath || `${PUBLIC_URL}/slides/logo.png`)
    .replace(/{{SLIDE1}}/g, data.slide1 || '')
    .replace(/{{SLIDE2}}/g, data.slide2 || '')
    .replace(/{{SLIDE3}}/g, data.slide3 || '')
    .replace(/{{SLIDE4}}/g, data.slide4 || '')
    .replace(/{{SLIDE5}}/g, data.slide5 || '');

  // 3.2) Grava o HTML que o Puppeteer vai ler
  fs.writeFileSync(path.join(__dirname, 'carrossel.html'), html, 'utf-8');

  // 3.3) Executa o Puppeteer para gerar os PNGs
  exec('node generateSlides.js', (err, stdout, stderr) => {
    if (err) {
      console.error('🔥 Erro ao gerar os slides:', stderr || err.message);
      return res
        .status(500)
        .send(`Erro ao gerar slides:\n${stderr || err.message}`);
    }

    console.log('✅ Slides gerados com sucesso');
    console.log('📟 Puppeteer output:', stdout);

    // 3.4) Retorna as URLs públicas dos slides
    return res.json({
      slide1Url: `${PUBLIC_URL}/slides/slide1.png`,
      slide2Url: `${PUBLIC_URL}/slides/slide2.png`,
      slide3Url: `${PUBLIC_URL}/slides/slide3.png`,
      slide4Url: `${PUBLIC_URL}/slides/slide4.png`,
      slide5Url: `${PUBLIC_URL}/slides/slide5.png`,
    });
  });
});

// 4) Inicia o servidor em 0.0.0.0 e exibe porta dinâmica
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando em http://0.0.0.0:${PORT}`);
});