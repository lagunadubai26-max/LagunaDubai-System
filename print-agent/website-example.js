// الملف ده للتوثيق - الكود الفعلي متكامل في printer.js + menu.js
// لو عايز تستخدمه في موقع تاني، استخدم الدالة دي:

async function printInvoice(invoice) {
  const agentUrl = localStorage.getItem('laguna_print_agent_url') || 'http://localhost:4321';
  try {
    const response = await fetch(agentUrl.replace(/\/+$/, '') + '/print-invoice', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invoice),
    });
    const data = await response.json();
    console.log(data.ok ? "طباعة ناجحة" : "خطأ في الطباعة:", data);
    return data;
  } catch (err) {
    console.error("لا يمكن الوصول لـ Print Agent:", err);
  }
}

// شكل الفاتورة المتوقع:
// {
//   storeName: "Laguna Cafe",
//   id: "abc123",
//   customer: "أحمد",
//   table: "طاولة 5",
//   date: "2025-01-15T10:30:00Z",
//   items: [
//     { name: "قهوة تركي", qty: 2, price: 30, note: "سكر زيادة", hasMilk: true },
//     { name: "كرواسون", qty: 1, price: 40 }
//   ],
//   total: 100,
//   paid: 100,
//   change: 0,
//   remaining: 0,
//   serviceAmount: 10,
//   taxAmount: 14,
//   paymentMethod: "كاش"
// }
