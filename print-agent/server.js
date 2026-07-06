const express = require("express");
const cors = require("cors");
const escpos = require("escpos");
escpos.USB = require("escpos-usb");
escpos.Network = require("escpos-network");

const config = require("./config");

const app = express();
app.use(cors());
app.use(express.json());

function printCashier(invoice) {
  return new Promise((resolve, reject) => {
    let device;
    try {
      device =
        config.cashierPrinter.vendorId && config.cashierPrinter.productId
          ? new escpos.USB(config.cashierPrinter.vendorId, config.cashierPrinter.productId)
          : new escpos.USB();
    } catch (err) {
      return reject(new Error("مافيش طابعة USB متوصلة: " + err.message));
    }

    const printer = new escpos.Printer(device);

    device.open((err) => {
      if (err) return reject(err);

      printer
        .font("a")
        .align("ct")
        .style("b")
        .size(1, 1)
        .text(invoice.storeName || "Laguna Cafe")
        .text("** فاتورة كاشير **")
        .text("--------------------------------")
        .align("lt")
        .style("normal");

      if (invoice.id) printer.text("#" + invoice.id);
      if (invoice.date) printer.text(new Date(invoice.date).toLocaleString("ar-EG"));
      if (invoice.customer) printer.text(invoice.customer);
      if (invoice.table) printer.text(invoice.table);
      printer.text("");

      (invoice.items || []).forEach((item) => {
        const milkTxt = item.hasMilk ? " +حليب" : "";
        const noteTxt = item.note ? " (" + item.note + ")" : "";
        printer.text(`${item.name}${milkTxt}${noteTxt}  x${item.qty}   ${item.qty * item.price} ج.م`);
      });

      printer.text("--------------------------------");
      if (invoice.serviceAmount > 0)
        printer.align("lt").style("normal").text("خدمة الضيافة: " + invoice.serviceAmount + " ج.م");
      if (invoice.taxAmount > 0)
        printer.align("lt").text("ضريبة: " + invoice.taxAmount + " ج.م");
      printer
        .align("rt")
        .style("b")
        .text("الإجمالي: " + (invoice.total || 0) + " ج.م")
        .style("normal")
        .align("lt")
        .text("المدفوع: " + (invoice.paid || invoice.total || 0) + " ج.م");
      if (invoice.change > 0) printer.text("الباقي: " + invoice.change + " ج.م");
      if (invoice.remaining > 0) printer.text("المتبقي: " + invoice.remaining + " ج.م");
      printer.text(invoice.paymentMethod || "كاش");
      printer.text("");

      printer
        .align("ct")
        .text("شكراً لزيارتكم")
        .feed(2)
        .cut()
        .cashdraw(config.drawerKick.pin)
        .close(() => resolve(true));
    });
  });
}

function printKitchen(invoice) {
  return new Promise((resolve, reject) => {
    const device = new escpos.Network(config.kitchenPrinter.ip, config.kitchenPrinter.port);
    const printer = new escpos.Printer(device);

    device.open((err) => {
      if (err) return reject(new Error("مافيش وصول لطابعة المطبخ (تأكد من IP): " + err.message));

      printer
        .font("a")
        .align("ct")
        .style("b")
        .size(1, 1)
        .text("** طلب مطبخ **")
        .text("--------------------------------")
        .align("lt")
        .style("normal");

      if (invoice.id) printer.text("#" + invoice.id);
      if (invoice.table) printer.text(invoice.table);
      printer.text("");

      (invoice.items || []).forEach((item) => {
        const milkTxt = item.hasMilk ? " +حليب" : "";
        const noteTxt = item.note ? " (" + item.note + ")" : "";
        printer.size(1, 1).text(`${item.name}${milkTxt}`);
        if (item.note) printer.text("  ملاحظة: " + item.note);
        printer.text("  الكمية: " + item.qty);
        printer.text("");
      });

      printer
        .text("--------------------------------")
        .align("ct")
        .text(new Date().toLocaleTimeString("ar-EG"))
        .feed(2)
        .cut()
        .close(() => resolve(true));
    });
  });
}

app.post("/print-invoice", async (req, res) => {
  const invoice = req.body;
  if (!invoice || !invoice.items) {
    return res.status(400).json({ ok: false, error: "بيانات الفاتورة ناقصة" });
  }

  const results = { cashier: false, kitchen: false, drawer: true, errors: [] };

  try {
    await printCashier(invoice);
    results.cashier = true;
  } catch (err) {
    results.errors.push("cashier: " + err.message);
  }

  try {
    await printKitchen(invoice);
    results.kitchen = true;
  } catch (err) {
    results.errors.push("kitchen: " + err.message);
  }

  res.json({ ok: results.errors.length === 0, results });
});

app.get("/health", (req, res) => {
  res.json({ ok: true, message: "Print Agent شغال تمام" });
});

app.listen(config.serverPort, () => {
  console.log(`Print Agent شغال على http://localhost:${config.serverPort}`);
  console.log(`رابط الصحة: http://localhost:${config.serverPort}/health`);
});
