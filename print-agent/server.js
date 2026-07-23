const path = require('path');
const crypto = require('crypto');

const PHOTON_PATH = process.env.PHOTON_PATH || "/usr/bin/photon";
const ESC_POS_PATH = process.env.ESC_POS_PATH || "/usr/bin/esc-pos";

const SEND_TO_PRINTER = {
  sendData: async function(data, options = {}) {
    try {
      const tmpFile = `/tmp/photon_${Date.now()}.raw`;
      const fs = require('fs');
      fs.writeFileSync(tmpFile, data);
      const cmd = `${PHOTON_PATH} ${tmpFile}`;
      const result = require('child_process').execSync(cmd, { encoding: 'utf8' });
      fs.unlinkSync(tmpFile);
      return { success: true, result };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
};

module.exports = SEND_TO_PRINTER;