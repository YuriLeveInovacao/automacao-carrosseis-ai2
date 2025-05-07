require('dotenv').config();
const express    = require('express');
const bodyParser = require('body-parser');
const { exec }   = require('child_process');
const fs         = require('fs');
const path       = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

// 1) Body parser para JSON
app.use(bodyParser.json());

// 2) Servir HTML e assets estáticos
//    - tudo dentro de /public ficará disponível em /
//    - tudo dentro de /slides ficará disponível em /slides
app.use( express.static(path.join(__dirname, 'public')) );
app.use('/slides', express.static(path.join(__dirname, 'slides')));

// 3) Rota POST /generate
app.post('/generate', (req, res) => {
  const data = req.body;

  // 3.1) Lê o template HTML
  const tpl = fs.readFileSync(path.join(__dirname, 'template.html'), 'utf8');

  // 3.2) Injeta as URLs no template
  const html = tpl
    .replace(/{{LOGO_PATH}}/g, data.logoPath || '')
    .replace(/{{SLIDE1}}/g, data.slide1   || '')
    .replace(/{{SLIDE2}}/g, data.slide2   || '')
    .replace(/{{SLIDE3}}/g, data.slide3   || '')
    .replace(/{{SLIDE4}}/g, data.slide4   || '')
    .replace(/{{SLIDE5}}/g, data.slide5   || '');

  // 3.3) Escreve o HTML final que o Puppeteer vai ler
  fs.writeFileSync(path.join(__dirname, 'carrossel.html'), html, 'utf8');

  // 3.4) Chama o script Puppeteer para gerar os PNGs
  exec('node generateSlides.js', (err, stdout, stderr) => {
    if (err) {
      console.error('🔥 Erro ao gerar os slides:', stderr || err.message);
      return res
        .status(500)
        .send(`Erro ao gerar slides:\n${stderr || err.message}`);
    }

    console.log('✅ Slides gerados com sucesso');
    console.log('📄 Puppeteer output:', stdout);

    // 3.5) Monta a base URL pública
    const baseUrl = process.env.PUBLIC_URL
      || 'https://automacao-carrosseis-ai2-production.up.railway.app';

    // 3.6) Retorna JSON com todas as URLs
    return res.json({
      slide1Url: `${baseUrl}/slides/slide1.png`,
      slide2Url: `${baseUrl}/slides/slide2.png`,
      slide3Url: `${baseUrl}/slides/slide3.png`,
      slide4Url: `${baseUrl}/slides/slide4.png`,
      slide5Url: `${baseUrl}/slides/slide5.png`,
      logoPath:  `${baseUrl}/logo.png`
    });
  });
});

// 4) Inicia o servidor em 0.0.0.0 e porta dinâmica
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando em http://0.0.0.0:${PORT}`);
});