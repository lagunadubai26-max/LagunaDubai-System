module.exports = {
  serverPort: 4321,

  apiKey: process.env.PRINT_AGENT_KEY || null,

  allowedOrigins: [
    'http://localhost:4321',
    'http://127.0.0.1:4321',
    'null',
    'file://'
  ],

  cashierPrinter: {
    type: "usb",
    vendorId: null,
    productId: null,
  },

  kitchenPrinter: {
    type: "network",
    ip: process.env.KITCHEN_PRINTER_IP || "192.168.1.50",
    port: parseInt(process.env.KITCHEN_PRINTER_PORT, 10) || 9100,
  },

  drawerKick: {
    pin: 0,
    onTime: 25,
    offTime: 25,
  },
};
