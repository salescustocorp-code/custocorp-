const sharp = require('sharp');
const fs = require('fs');

async function testSharpPdf() {
  const pdfPath = 'c:/Users/abdul/Downloads/New web/assets/catalogues/CUSTOCORP-Diaries-Notebooks-Catalogue.pdf';
  try {
    const meta = await sharp(pdfPath, { page: 0 }).metadata();
    console.log('SHARP CAN READ PDF DIRECTLY! Metadata:', meta);
    
    // Save page 0 as test.jpg
    await sharp(pdfPath, { page: 0, density: 150 })
      .jpeg({ quality: 85 })
      .toFile('c:/Users/abdul/Downloads/New web/test-page-0.jpg');
    console.log('SUCCESS! Saved test-page-0.jpg');
  } catch (e) {
    console.log('Sharp cannot read PDF directly:', e.message);
  }
}

testSharpPdf();
