const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.use(bodyParser.json());

// POST /generate
app.post('/generate', (req, res) => {
  const data = req.body;

  // Gera o HTML substituindo os placeholders
  const template = fs.readFileSync('template.html', 'utf-8');
  let html = template
    .replace('{{SLIDE1}}', data.slide1 || '')
    .replace('{{SLIDE2}}', data.slide2 || '')
    .replace('{{SLIDE3}}', data.slide3 || '')
    .replace('{{SLIDE4}}', data.slide4 || '')
    .replace('{{SLIDE5}}', data.slide5 || '');

  fs.writeFileSync('carrossel.html', html);

  // Executa o Puppeteer
  exec('node generateSlides.js', (err, stdout, stderr) => {
    if (err) {
      console.error('Erro ao gerar os slides:', err);
      return res.status(500).send('Erro ao gerar slides');
    }
    console.log('Slides gerados com sucesso!');
    res.send('Slides gerados com sucesso!');
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
