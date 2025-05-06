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

// 2) Expor a pasta 'slides' em /slides
app.use('/slides', express.static(path.join(__dirname, 'slides')));

// 3) Rota de geração de carrossel
app.post('/generate', (req, res) => {
  const data = req.body; // { imagePath, logoPath, slide1, slide2, … slide5 }

  // 3.1) Carrega e injeta placeholders no template
  const template = fs.readFileSync(path.join(__dirname, 'template.html'), 'utf-8');
  let html = template
    // caminhos de imagem
    .replace(/{{IMAGE_PATH}}/g, data.imagePath  || '')
    .replace(/{{LOGO_PATH}}/g,  data.logoPath   || '')
    // textos dos slides
    .replace(/{{SLIDE1}}/g,      data.slide1     || '')
    .replace(/{{SLIDE2}}/g,      data.slide2     || '')
    .replace(/{{SLIDE3}}/g,      data.slide3     || '')
    .replace(/{{SLIDE4}}/g,      data.slide4     || '')
    .replace(/{{SLIDE5}}/g,      data.slide5     || '');

  // 3.2) Grava HTML final para o Puppeteer processar
  fs.writeFileSync(path.join(__dirname, 'carrossel.html'), html, 'utf-8');

  // 4) Chama o script de Puppeteer para gerar os PNGs
  exec('node generateSlides.js', (err, stdout, stderr) => {
    if (err) {
      console.error('❌ Erro ao gerar os slides:', stderr || err);
      return res.status(500).send(`Erro ao gerar slides:\n${stderr || err.message}`);
    }
    console.log('✅ Slides gerados com sucesso!');
    
    // 5) Retorna URLs públicas dos slides
    const baseUrl = process.env.PUBLIC_URL
      || 'https://automacao-carrosseis-ai2-production.up.railway.app';

    res.json({
      slide1Url: `${baseUrl}/slides/slide1.png`,
      slide2Url: `${baseUrl}/slides/slide2.png`,
      slide3Url: `${baseUrl}/slides/slide3.png`,
      slide4Url: `${baseUrl}/slides/slide4.png`,
      slide5Url: `${baseUrl}/slides/slide5.png`
    });
  });
});

// 6) Inicialização do servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
