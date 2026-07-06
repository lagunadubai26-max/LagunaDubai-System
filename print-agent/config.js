module.exports = {
  serverPort: 4321,

  cashierPrinter: {
    type: "usb",
    vendorId: null,
    productId: null,
  },

  kitchenPrinter: {
    type: "network",
    ip: "192.168.1.50",
    port: 9100,
  },

  drawerKick: {
    pin: 0,
    onTime: 25,
    offTime: 25,
  },
};
