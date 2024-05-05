export class GameStateDisplay {
  constructor() {
    this.score = 0;
    this.pelletScore = 1;
    this.powerPelletScore = 10;
    this.lives = 2;
    this.scoreElement = document.getElementById("score");
  }

  reset() {
    this.score = 0;
    this.scoreElement.textContent = this.score;
    this.lives = 2;
    this.updateLifeIcons();
  }

  updateScore(scoreIncrease) {
    this.score += scoreIncrease;
    this.scoreElement.textContent = this.score;
  }

  decrementLives() {
    this.lives--;
    this.updateLifeIcons();
  }

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
