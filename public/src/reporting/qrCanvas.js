// Renders text as a QR code PNG data URL using the `qrcode-generator` library
// (loaded globally from CDN, see index.html). Pure canvas drawing so it works
// both as an on-page <img> and as a jsPDF addImage() source.
export const renderQrDataUrl = (qrcodeLib, text, options = {}) => {
  const { cellSize = 6, margin = 2 } = options;

  const qr = qrcodeLib(0, 'M');
  qr.addData(text);
  qr.make();

  const moduleCount = qr.getModuleCount();
  const size = (moduleCount + margin * 2) * cellSize;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = '#000000';

  for (let row = 0; row < moduleCount; row += 1) {
    for (let col = 0; col < moduleCount; col += 1) {
      if (qr.isDark(row, col)) {
        ctx.fillRect((col + margin) * cellSize, (row + margin) * cellSize, cellSize, cellSize);
      }
    }
  }

  return canvas.toDataURL('image/png');
};
