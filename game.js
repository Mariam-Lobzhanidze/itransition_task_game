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
class Game {
  constructor(moves) {
    this.moves = moves;
    this.keyGenerator = new KeyGenerator();
    this.hmacGenerator = null;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    this.userInput = new InputHandler(this, this.rl);
  }

  start() {
    const key = this.keyGenerator.generateKey();
    this.hmacGenerator = new HMACGenerator(key);

    const computerMoveIndex = Math.floor(Math.random() * this.moves.length);
    const computerMove = this.moves[computerMoveIndex];
    const hmac = this.hmacGenerator.generateHMAC(computerMove);
    console.log(`HMAC: ${hmac}\n`);

    this.displayAvailableMoves();

    this.rl.question("Enter your move: ", (userInput) => {
      this.userInput.handleUserInput(userInput, computerMoveIndex, key);
    });
  }

  displayAvailableMoves() {
    console.log(
      "Available moves:\n" + this.moves.map((m, i) => `${i + 1} - ${m}`).join("\n") + "\n0 - Exit\n? - Help"
    );
  }
}
class InputHandler {
  constructor(game, rl) {
    this.game = game;
    this.result = new GameResult(this.game.moves);
    this.rl = rl;
    this.help = new GameHelp(this.game.moves, this.result);
  }

  handleUserInput(userInput, computerIndex, key) {
    if (userInput.trim() === "?") {
      console.log(this.help.generateHelpTable());
      this.game.start();
      return;
    }

    const userIndex = +userInput.trim();
    if (userIndex === 0) {
      this.exit();
      return;
    }

    const isInvalidMove = this.isInvalidMove(userIndex, this.game.moves);

    if (!isInvalidMove) {
      console.log(
        `Your move: ${this.game.moves[userIndex - 1]}\nComputer move: ${this.game.moves[computerIndex]}`
      );

      const outcome = this.result.getGameResult(userIndex - 1, computerIndex);
      this.result.displayGameResult(outcome);

      console.log(`HMAC key: ${key}\n-----------------------------------------------------------------\n`);
    }

    this.game.start();
  }

  isInvalidMove(index, moves) {
    const isInvalid = isNaN(index) || index < 1 || index > this.game.moves.length;
    if (isInvalid) console.log("Invalid choice. Please select a valid move.");
    return isInvalid;
  }

  exit() {
    this.rl.close();
  }
}

class GameHelp {
  constructor(moves, result) {
    this.moves = moves;
    this.n = moves.length;
    this.gameResult = result;
    this.title = "v PC/USER >";
    this.columnWidths = this.getColWidths();
  }

  getColWidths() {
    let widths = [this.title.length, ...this.moves.map((m) => m.length)];

    for (let i = 0; i < this.n; i++) {
      for (let j = 0; j < this.n; j++) {
        widths[j + 1] = Math.max(widths[j + 1], this.gameResult.getGameResult(i, j).length);
      }
    }

    return widths;
  }

  addRowSeparator() {
    return "+" + this.columnWidths.map((w) => "-".repeat(w + 2)).join("+") + "+\n";
  }

  setCellPadding(content, i) {
    const width = this.columnWidths[i];
    return ` ${content.padEnd(width, " ")} `;
  }

  generateHelpTable() {
    let table = "\nHelp Table:\n";
    table += this.addRowSeparator();
    table += `|${this.setCellPadding(this.title, 0)}`;

    this.moves.forEach((m, i) => (table += `|${this.setCellPadding(m, i + 1)}`));
    table += "|\n" + this.addRowSeparator();

    this.moves.forEach((m, i) => {
      table += `|${this.setCellPadding(m, 0)}`;
      for (let j = 0; j < this.n; j++) {
        const result = this.gameResult.getGameResult(i, j);
        table += `|${this.setCellPadding(result, j + 1)}`;
      }
      table += "|\n" + this.addRowSeparator();
    });

    return table;
  }
}

function main() {
  const validatedMoves = new MovesValidator(process.argv.slice(2)).validate();
  if (!validatedMoves) return;

  new Game(validatedMoves).start();
}

main();
