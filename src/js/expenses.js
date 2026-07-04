let expenses = [];
const expList = document.getElementById('expList');

async function render() {
  expenses = await DB.expenses.all() || [];
  expList.innerHTML = '';
  const total = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const todayTotal = expenses.filter(e => e.date && new Date(e.date).toDateString() === new Date().toDateString()).reduce((s, e) => s + Number(e.amount || 0), 0);

  document.getElementById('expTotal').textContent = total.toLocaleString() + ' ج.م';
  document.getElementById('expToday').textContent = todayTotal.toLocaleString() + ' ج.م';
  document.getElementById('expCount').textContent = expenses.length;

  expenses.forEach(e => {
    const row = document.createElement('div');
    row.className = 'table-row';
    row.innerHTML = `
      <span>${escapeHtml(e.description)}</span><span>${escapeHtml(e.category)}</span>
      <span>${Number(e.amount).toLocaleString()} ج.م</span>
      <span>${new Date(e.date).toLocaleDateString('ar-EG')}</span>
      <div class="actions"><button class="delete-btn" data-id="${e.id}"><i class="fa-solid fa-trash"></i></button></div>`;
    expList.appendChild(row);
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.onclick = async () => {
      if (!confirm('هل تريد حذف هذا المصروف؟')) return;
      await DB.expenses.remove(btn.dataset.id);
      render();
    };
  });
}

document.getElementById('addExpBtn').onclick = async () => {
  const description = document.getElementById('expDesc').value.trim();
  const amount = Number(document.getElementById('expAmount').value);
  const category = document.getElementById('expCategory').value;
  if (!description || !amount) return alert('يرجى إدخال الوصف والمبلغ');
  await DB.expenses.add({ description, amount, category, date: new Date().toISOString() });
  document.getElementById('expDesc').value = '';
  document.getElementById('expAmount').value = '';
  render();
};

render();
