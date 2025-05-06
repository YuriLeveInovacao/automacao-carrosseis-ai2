// server.js
const express    = require('express');
const bodyParser = require('body-parser');
const { exec }   = require('child_process');
const fs         = require('fs');
const path       = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Monta PUBLIC_URL dinamicamente
const PUBLIC_URL = process.env.PUBLIC_URL
  || (process.env.RAILWAY_PUBLIC_DOMAIN
      ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
      : 'https://automacao-carrosseis-ai2-production.up.railway.app');

// 1) Body parser para JSON
app.use(bodyParser.json());

// 2) Serve a pasta slides (incluindo logo.png e slides gerados)
app.use('/slides', express.static(path.join(__dirname, 'slides')));

// 3) POST /generate
app.post('/generate', (req, res) => {
  const data = req.body;
  // Espera agora:
  // {
  //   slide1_title, slide1_subtitle,
  //   slide2_text, slide3_text, slide4_text, slide5_text
  // }

  // 3.1) Lê e substitui placeholders
  const tplPath = path.join(__dirname, 'template.html');
  let html = fs.readFileSync(tplPath, 'utf-8');

  html = html
    .replace(/{{LOGO_PATH}}/g, `${PUBLIC_URL}/slides/logo.png`)
    .replace(/{{slide1_title}}/g,     data.slide1_title    || '')
    .replace(/{{slide1_subtitle}}/g,  data.slide1_subtitle || '')
    .replace(/{{slide2_text}}/g,      data.slide2_text     || '')
    .replace(/{{slide3_text}}/g,      data.slide3_text     || '')
    .replace(/{{slide4_text}}/g,      data.slide4_text     || '')
    .replace(/{{slide5_text}}/g,      data.slide5_text     || '');

  // 3.2) Grava o HTML pro Puppeteer
  fs.writeFileSync(path.join(__dirname, 'carrossel.html'), html, 'utf-8');

  // 3.3) Chama o script que gera os PNGs
  exec('node generateSlides.js', (err, stdout, stderr) => {
    if (err) {
      console.error('🔥 Erro ao gerar slides:', stderr || err.message);
      return res.status(500).send(`Erro ao gerar slides:\n${stderr||err.message}`);
    }
    console.log('✅ Slides gerados:', stdout);

    // 3.4) Retorna as URLs públicas
    return res.json({
      slide1Url: `${PUBLIC_URL}/slides/slide1.png`,
      slide2Url: `${PUBLIC_URL}/slides/slide2.png`,
      slide3Url: `${PUBLIC_URL}/slides/slide3.png`,
      slide4Url: `${PUBLIC_URL}/slides/slide4.png`,
      slide5Url: `${PUBLIC_URL}/slides/slide5.png`,
    });
  });
});

// 4) Sobe o servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando em http://0.0.0.0:${PORT}`);
});