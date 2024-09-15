const crypto = require("crypto");
const readline = require("readline");

class HMACGenerator {
  constructor(key) {
    this.key = key;
  }

  generateHMAC(data) {
    const hmac = crypto.createHmac("sha256", this.key);
    hmac.update(data);
    return hmac.digest("hex");
  }
}

class KeyGenerator {
  generateKey() {
    return crypto.randomBytes(32).toString("hex");
  }
}
