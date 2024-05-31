export class GameStateDisplay {
  /**
   * Constructs a new instance of the GameStateDisplay class.
   * Initializes the game state with default scores and lives,
   * and fetches the DOM element to display the score.
   */
  constructor(ctx, canvas) {
    this.score = 0;
    this.pelletScore = 1;
    this.powerPelletScore = 10;
    this.lives = 2;
    this.scoreElement = document.getElementById("score");

    this.ctx = ctx;
    this.canvas = canvas;
    this.mouseMoveListener = null;
    this.clickListener = null;
  }

  /**
   * Resets the game state to the initial values.
   * Sets the score to zero and the number of lives to two,
   * then updates the display to reflect these changes.
   */
  reset() {
    this.score = 0;
    this.scoreElement.textContent = this.score;
    this.lives = 2;
    this.updateLifeIcons();
  }

  /**
   * Increases the score by a specified amount and updates the display.
   * @param {number} scoreIncrease - The amount to increase the score by.
   */
  updateScore(scoreIncrease) {
    this.score += scoreIncrease;
    this.scoreElement.textContent = this.score;
  }

  /**
   * Decreases the number of lives by one and updates the display of life icons.
   */
  decrementLives() {
    this.lives--;
    this.updateLifeIcons();
  }

  /**
   * Updates the life icons in the display to match the current number of lives.
   * Clears the current icons and creates new ones for each life remaining.
   */
  updateLifeIcons() {
    const livesElement = document.getElementById("lives");
    livesElement.innerHTML = "";

    for (let i = 0; i < this.lives; i++) {
      const lifeIcon = document.createElement("div");
      lifeIcon.className = "pacman-life";
      livesElement.appendChild(lifeIcon);
    }
  }

  /**
   * Displays the game over screen, with a button to restart the game.
   * Sets up event listeners to handle clicks for restarting the game.
   */
  displayGameOver() {
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    const xPos = this.canvas.width / 2;
    const yPos = this.canvas.width / 2;
    this.ctx.fillStyle = "white";
    this.ctx.textAlign = "center";
    this.ctx.font = "24px 'Roboto Mono', monospace";
    this.ctx.fillText("Game Over", xPos, yPos);
    const buttonText = "Click to restart";
    this.ctx.font = "18px 'Roboto Mono', monospace";
    this.ctx.fillText(buttonText, xPos, yPos + 50);
    this.setupRestartButton(xPos, yPos, buttonText);
  }

  /**
   * Sets up the interactive button on the game over screen.
   * Adds mouse event listeners for click and mouse movement to interact with the button.
   * @param {number} xPos - Horizontal center of the canvas.
   * @param {number} yPos - Vertical center where the game over text is displayed.
   * @param {string} buttonText - The text displayed on the restart button.
   */
  setupRestartButton(xPos, yPos, buttonText) {
    const buttonX = xPos - this.ctx.measureText(buttonText).width / 2;
    const buttonY = yPos + 50 - 18; // Position based on text size
    const buttonWidth = this.ctx.measureText(buttonText).width;
    const buttonHeight = 24;

    this.clickListener = (event) => {
      const rect = this.canvas.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const clickY = event.clientY - rect.top;
      if (
        clickX >= buttonX &&
        clickX <= buttonX + buttonWidth &&
        clickY >= buttonY &&
        clickY <= buttonY + buttonHeight
      ) {
        this.resetCanvas();
        const restartEvent = new Event("restartGame");
        this.canvas.dispatchEvent(restartEvent);
      }
    };

    this.mouseMoveListener = (event) => {
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      this.canvas.style.cursor =
        mouseX >= buttonX &&
        mouseX <= buttonX + buttonWidth &&
        mouseY >= buttonY &&
        mouseY <= buttonY + buttonHeight
          ? "pointer"
          : "default";
    };

    this.canvas.addEventListener("click", this.clickListener);
    this.canvas.addEventListener("mousemove", this.mouseMoveListener);
  }

  /**
   * Resets the canvas to its default state by removing event listeners and resetting the cursor style.
   */
  resetCanvas() {
    this.canvas.removeEventListener("click", this.clickListener);
    this.canvas.removeEventListener("mousemove", this.mouseMoveListener);
    this.canvas.style.cursor = "default";
  }
}
