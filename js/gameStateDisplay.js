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
    this.buttons = [];
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

  async handleEndGame() {
    const scores = await this.fetchScores();
    if (scores.length > 0 && this.score > 0) {
      const rank = this.determineRank(scores);
      if (rank <= 10) {
        this.displayAddScoreScreen();
      } else {
        this.displayGameOverScreen(scores);
      }
    } else {
      console.log("No scores to display or error fetching scores");
      this.displayGameOverScreen(scores);
    }
  }

  async fetchScores() {
    try {
      const res = await fetch("https://pacman-js.onrender.com/api/v1/scores");
      if (!res.ok) {
        throw new Error(`HTTP error, status = ${res.status}`);
      }
      const data = await res.json();
      return data.scores;
    } catch (err) {
      console.error("Error fetching scores:", err);
      return [];
    }
  }

  determineRank(scores) {
    const rank = scores.findIndex((score) => this.score > score.points) + 1;
    return rank === 0 ? scores.length + 1 : rank;
  }

  /**
   * Displays the game over screen, with a button to restart the game. FIXME:
   * Sets up event listeners to handle clicks for restarting the game.
   */
  displayGameOverScreen(scores) {
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    const xPos = this.canvas.width / 2;
    const yPos = this.canvas.width / 2;

    this.ctx.fillStyle = "white";
    this.ctx.textAlign = "center";
    this.ctx.font = "bold 30px 'Roboto Mono', monospace";
    this.ctx.fillText("Game Over", xPos, yPos - 10);

    this.buttons = [
      {
        text: "Play again!",
        xPos: xPos,
        yPos: yPos + 50,
        action: () => {
          this.resetCanvas();
          this.canvas.dispatchEvent(new Event("restartGame"));
        },
      },
    ];

    if (scores.length > 0) {
      this.buttons.push({
        text: "Display scores",
        xPos: xPos,
        yPos: yPos + 100,
        action: () => {
          this.displayHighScoresScreen(scores);
        },
      });
    }

    this.setupButtons();
    this.addEventListeners();
  }

  displayAddScoreScreen() {
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    const xPos = this.canvas.width / 2;
    const yPos = this.canvas.width / 2 + 30;

    this.ctx.fillStyle = "white";
    this.ctx.textAlign = "center";
    this.ctx.font = "bold 24px 'Roboto Mono', monospace";
    this.ctx.fillText("New high score!", xPos, yPos - 100);
    this.ctx.fillText("_ _ _", xPos - 8, yPos - 40);

    this.ctx.font = "bold 18px 'Roboto Mono', monospace";
    this.ctx.fillText("Enter your initials", xPos, yPos);

    const inputElement = document.getElementById("userInput");
    inputElement.style.display = "block";
    inputElement.focus();

    this.buttons = [
      {
        text: "Add score",
        xPos: xPos,
        yPos: yPos + 50,
        action: () => {
          if (/^[A-Za-z]{3}$/.test(inputElement.value)) {
            this.addScore(inputElement.value);
            inputElement.style.display = "none";
            inputElement.value = "";
          }
        },
      },
      {
        text: "Play again!",
        xPos: xPos,
        yPos: yPos + 100,
        action: () => {
          inputElement.style.display = "none";
          inputElement.value = "";
          this.resetCanvas();
          this.canvas.dispatchEvent(new Event("restartGame"));
        },
      },
    ];
    this.setupButtons();
    this.addEventListeners();
  }

  displayHighScoresScreen(scores) {
    this.resetCanvas();

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    const xPos = this.canvas.width / 2;
    const yPos = this.canvas.width / 6;

    this.ctx.fillStyle = "white";
    this.ctx.textAlign = "center";
    this.ctx.font = "bold 24px 'Roboto Mono', monospace";
    this.ctx.fillText("High Scores", xPos, yPos);

    this.ctx.font = "bold 18px 'Roboto Mono', monospace";
    this.ctx.fillText("Rank     Score    Name", xPos, yPos + 40);

    this.buttons = [
      {
        text: "Play again!",
        xPos: xPos,
        yPos: yPos + 360,
        action: () => {
          this.resetCanvas();
          const leaderboardDiv = document.getElementById("leaderboard");
          leaderboardDiv.style.display = "none";
          leaderboardDiv.querySelector("ul").innerHTML = "";
          this.canvas.dispatchEvent(new Event("restartGame"));
        },
      },
    ];
    this.setupButtons();
    this.addEventListeners();

    const topTenScores = scores.slice(0, 10);
    const leaderboardDiv = document.getElementById("leaderboard");
    const list = leaderboardDiv.querySelector("ul");
    list.innerHTML = "";

    topTenScores.forEach((score, index) => {
      const listItem = document.createElement("li");
      listItem.innerHTML = `<span>${index + 1}</span>
          <span>${score.points}</span>
          <span>${score.name.toUpperCase()}</span>`;
      list.appendChild(listItem);
    });

    leaderboardDiv.style.display = "block";
  }

  async postScore(scoreData) {
    try {
      const res = await fetch("https://pacman-js.onrender.com/api/v1/scores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(scoreData),
      });
      if (res.ok) {
        console.log("Score successfully posted.");
        return true;
      } else {
        throw new Error(`HTTP error, status = ${res.status}`);
      }
    } catch (err) {
      console.error("Error fetching scores:", err);
    }
  }

  async addScore(initials) {
    const scoreData = {
      name: initials,
      points: this.score,
    };

    try {
      const postSuccess = await this.postScore(scoreData);
      if (postSuccess) {
        const scores = await this.fetchScores();
        this.displayHighScoresScreen(scores);
      } else {
        console.error("Failed to post score.");
      }
    } catch (err) {
      console.error(
        "An error occurred while posting and fetching scores:",
        err
      );
    }
  }

  setupButtons() {
    const padding = 5;
    const textSize = 18;

    this.buttons.forEach((button) => {
      button.width = 150;
      button.height = 30;
      button.x = button.xPos - button.width / 2;
      button.y = button.yPos - textSize;

      this.ctx.strokeStyle = "white";
      this.ctx.beginPath();
      this.ctx.roundRect(
        button.x - padding / 2,
        button.y - padding / 2,
        button.width + padding,
        button.height + padding,
        3
      );
      this.ctx.stroke();
      this.ctx.fillStyle = "#54CBFE";
      this.ctx.fill();

      this.ctx.font = `${textSize}px 'Roboto Mono', monospace`;
      this.ctx.fillStyle = "#fff";
      this.ctx.fillText(button.text, button.xPos, button.yPos);
    });
  }

  handleClick(event) {
    const rect = this.canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    this.buttons.forEach((button) => {
      if (
        clickX >= button.x &&
        clickX <= button.x + button.width &&
        clickY >= button.y &&
        clickY <= button.y + button.height
      ) {
        button.action();
      }
    });
  }

  handleMouseMove(event) {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    let isOverButton = false;
    this.buttons.forEach((button) => {
      if (
        mouseX >= button.x &&
        mouseX <= button.x + button.width &&
        mouseY >= button.y &&
        mouseY <= button.y + button.height
      ) {
        isOverButton = true;
      }
    });
    this.canvas.style.cursor = isOverButton ? "pointer" : "default";
  }

  addEventListeners() {
    this.canvas.addEventListener("click", this.handleClick.bind(this));
    this.canvas.addEventListener("mousemove", this.handleMouseMove.bind(this));
  }

  removeEventListeners() {
    this.canvas.removeEventListener("click", this.handleClick.bind(this));
    this.canvas.removeEventListener(
      "mousemove",
      this.handleMouseMove.bind(this)
    );
  }

  /**
   * Resets the canvas to its default state by removing event listeners and resetting the cursor style.
   */
  resetCanvas() {
    this.removeEventListeners();
    this.canvas.style.cursor = "default";
    this.buttons = [];
  }
}
