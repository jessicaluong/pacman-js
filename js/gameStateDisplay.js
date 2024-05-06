export class GameStateDisplay {
  /**
   * Constructs a new instance of the GameStateDisplay class.
   * Initializes the game state with default scores and lives,
   * and fetches the DOM element to display the score.
   */
  constructor() {
    this.score = 0;
    this.pelletScore = 1;
    this.powerPelletScore = 10;
    this.lives = 2;
    this.scoreElement = document.getElementById("score");
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
}
