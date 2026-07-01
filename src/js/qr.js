const urlInput = document.getElementById('menuUrl');
const downloadBtn = document.getElementById('downloadQR');
let qrInstance = null;

function generateQR(url) {
  const container = document.getElementById('qrCode');
  container.innerHTML = '';
  qrInstance = new QRCode(container, {
    text: url,
    width: 220,
    height: 220,
    colorDark: '#073646',
    colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.H
  });
}

urlInput.addEventListener('change', () => generateQR(urlInput.value));
urlInput.addEventListener('keyup', () => generateQR(urlInput.value));

downloadBtn.addEventListener('click', () => {
  const canvas = document.querySelector('#qrCode canvas');
  if (!canvas) return;
  const link = document.createElement('a');
  link.download = 'laguna-cafe-qr.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});

generateQR(urlInput.value);
