// generateHTML.js
const fs   = require('fs');
const path = require('path');

// Exemplo de dados estáticos (substitua pela sua lógica)
const data = {
  imagePath: 'https://via.placeholder.com/600x400',
  logoPath:  'https://via.placeholder.com/100x100',
  slide1:    'Título do Slide 1',
  slide2:    'Texto do Slide 2',
  slide3:    'Texto do Slide 3',
  slide4:    'Texto do Slide 4',
  slide5:    'Texto do Slide 5'
};

// 1) Carrega o template
const template = fs.readFileSync(
  path.join(__dirname, 'template.html'),
  'utf-8'
);

// 2) Injeta dados
const html = template
  .replace(/{{IMAGE_PATH}}/g, data.imagePath)
  .replace(/{{LOGO_PATH}}/g,  data.logoPath)
  .replace(/{{SLIDE1}}/g,     data.slide1)
  .replace(/{{SLIDE2}}/g,     data.slide2)
  .replace(/{{SLIDE3}}/g,     data.slide3)
  .replace(/{{SLIDE4}}/g,     data.slide4)
  .replace(/{{SLIDE5}}/g,     data.slide5);

// 3) Grava o HTML final
fs.writeFileSync(
  path.join(__dirname, 'carrossel.html'),
  html,
  'utf-8'
);

console.log('HTML gerado em carrossel.html');
