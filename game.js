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
class GameResult {
  constructor(moves) {
    this.moves = moves;
    this.n = moves.length;
  }

  getGameResult(m1, m2) {
    const p = Math.floor(this.n / 2);

    if (m1 === m2) return "Draw";
    return Math.sign(((m2 - m1 + p + this.n) % this.n) - p) > 0 ? "Win" : "Lose";
  }

  displayGameResult(result) {
    console.log(
      {
        Draw: "It's a draw!",
        Win: "You win!",
        Lose: "You lose!",
      }[result] + "\n" || "Unknown result."
    );
  }
}
class MovesValidator {
  constructor(moves) {
    this.moves = moves;
  }

  validate() {
    return this.hasInvalidLength() | this.hasDuplicateMoves() ? false : this.moves;
  }

  hasInvalidLength() {
    const isInvalid = this.moves.length < 3 || this.moves.length % 2 === 0;
    if (isInvalid) {
      this.displayError(
        "\nError: You must provide an odd number of non-repeating strings (at least 3).",
        "Example: node game.js Rock Paper Scissors Lizard Spock\n"
      );
    }
    return isInvalid;
  }

  hasDuplicateMoves() {
    const isDuplicated = [...new Set(this.moves)].length !== this.moves.length;
    if (isDuplicated) this.displayError("Error: Moves must be non-repeating.");
    return isDuplicated;
  }

  displayError(...messages) {
    messages.forEach((m) => console.error(m));
  }
}
