const BASE = window.location.origin + '/LagunaDubai-System/menu.html';
const container = document.getElementById('qrContent');

async function render() {
  container.innerHTML = '<div class="qr-loading"><i class="fa-solid fa-spinner fa-spin"></i> جاري التحميل...</div>';
  const tables = await DB.tables.all() || [];
  container.innerHTML = '';

  tables.forEach(t => {
    const card = document.createElement('div');
    card.className = 'qr-card' + (t.hasService ? ' qr-service' : '');
    const num = t.name.replace(/\D/g, '');
    const url = BASE + '?table=' + num + (t.hasService ? '&service=1' : '');
    card.innerHTML = `
      <h2>${t.name}${t.hasService ? ' <span style="color:#d97706;font-size:14px">🌟 ضيافة</span>' : ''}</h2>
      <p>امسح الكود لفتح القائمة</p>
      <div class="qr-code" id="qr-${t.id}"></div>
      <button class="qr-download" data-url="${url}" data-name="${t.name}"><i class="fa-solid fa-download"></i> تحميل</button>
      <div class="qr-link">
        <input type="text" value="${url}" readonly>
      </div>`;
    container.appendChild(card);
  });

  document.querySelectorAll('.qr-card').forEach(card => {
    const id = card.querySelector('.qr-code').id;
    const input = card.querySelector('.qr-link input');
    new QRCode(document.getElementById(id), {
      text: input.value,
      width: 180,
      height: 180,
      colorDark: '#1c1917',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    });
  });

  document.querySelectorAll('.qr-download').forEach(btn => {
    btn.onclick = () => {
      const canvas = btn.closest('.qr-card').querySelector('canvas');
      if (!canvas) return;
      const link = document.createElement('a');
      link.download = 'QR-' + btn.dataset.name + '.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
  });
}

render();
