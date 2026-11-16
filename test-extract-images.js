async function main() {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const fs = require('fs');
  const path = require('path');
  const sharp = require('sharp');

  const filePath = 'c:/Users/abdul/Downloads/New web/assets/catalogues/CUSTOCORP-Mugs-Collection-Catalogue.pdf';
  const data = new Uint8Array(fs.readFileSync(filePath));
  const doc = await pdfjs.getDocument({ data }).promise;

  console.log(`Loaded document: ${doc.numPages} pages.`);

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const ops = await page.getOperatorList();
    console.log(`Page ${i}: ${ops.fnArray.length} operators.`);
    
    // Find image operators
    const imgOps = [];
    for (let j = 0; j < ops.fnArray.length; j++) {
      if (ops.fnArray[j] === pdfjs.OPS.paintImageXObject || ops.fnArray[j] === pdfjs.OPS.paintInlineImageXObject) {
        imgOps.push(ops.argsArray[j][0]);
      }
    }
    console.log(`Page ${i}: image operators:`, imgOps);
  }
}

main().catch(console.error);
