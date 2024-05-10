import { cellSize, loadImages, setupGameEnvironment } from "./setup.js";
import { Pacman } from "./pacman.js";
import { Ghost, GhostManager } from "./ghosts.js";

class Game {
  constructor() {
    const {
      mazeManager,
      gameCtx,
      gameCanvas,
      gameStateDisplay,
      pelletManager,
    } = setupGameEnvironment();

    this.gameCanvas = gameCanvas;
    this.gameCtx = gameCtx;
    this.mazeManager = mazeManager;
    this.gameStateDisplay = gameStateDisplay;
    this.pelletManager = pelletManager;

    this.requestId = null;
    this.mouseMoveListener = null;
    this.clickListener = null;
    this.gameOver = false;
    this.collisionCooldown = 0;
    this.lastUpdateTime = null;

    this.pacmanPosition = { x: 10, y: 13 };

    loadImages()
      .then((images) => {
        this.images = images;
        this.initializeGame();
      })
      .catch((error) => {
        console.error("Error loading images:", error);
      });
  }

  initializeGame() {
    this.pacman = new Pacman(
      this.gameCtx,
      this.mazeManager,
      cellSize,
      { position: this.pacmanPosition },
      this.handleEatPellet.bind(this),
      [this.images["pacman_opened"], this.images["pacman_closed"]]
    );
    this.ghosts = this.createGhosts();
    this.ghostManager = new GhostManager(this.ghosts);
    this.pelletManager.reset();
    this.mazeManager.resetMaze();
    this.gameStateDisplay.reset();

    this.drawInitialGameState();
    this.bindEvents();
    setTimeout(() => this.startGame(), 2000); // 2 second delay before game starts
  }

  drawInitialGameState() {
    this.gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    this.pelletManager.draw();
    this.pacman.draw();
    this.ghostManager.draw();
  }

  startGame() {
    cancelAnimationFrame(this.requestId);
    this.lastUpdateTime = null;
    this.gameLoop();
  }

  gameLoop() {
    this.requestId = requestAnimationFrame(this.update.bind(this));
  }

  updatePacmanPosition(x, y) {
    this.pacmanPosition = { x, y };
  }

  getPacmanPosition() {
    return this.pacmanPosition;
  }

  update(timestamp) {
    if (this.lastUpdateTime === null) {
      this.lastUpdateTime = timestamp;
    }

    const deltaTime = timestamp - this.lastUpdateTime;
    this.lastUpdateTime = timestamp;

    this.gameCtx.clearRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
    this.pelletManager.draw();
    this.pacman.update();
    this.updatePacmanPosition(this.pacman.position.x, this.pacman.position.y);
    this.ghostManager.update(this.pacmanPosition, deltaTime);
    this.checkCollisionWithGhosts();

    if (this.gameOver) {
      cancelAnimationFrame(this.requestId);
      this.displayGameOver();
    } else {
      this.requestId = requestAnimationFrame(this.update.bind(this));
    }
  }

  restartGame() {
    cancelAnimationFrame(this.requestId);
    this.gameCanvas.removeEventListener("click", this.clickListener);
    this.gameCanvas.removeEventListener("mousemove", this.mouseMoveListener);
    this.gameCanvas.style.cursor = "default";
    this.gameOver = false;

    this.pacman.reset();
    this.ghosts.forEach((ghost) => ghost.reset());

    this.pelletManager.reset();
    this.mazeManager.resetMaze();
    this.gameStateDisplay.reset();

    this.drawInitialGameState();

    setTimeout(() => this.startGame(), 2000);
  }

  checkGameOver() {
    this.gameOver =
      this.pelletManager.pelletCount === 0 || this.gameStateDisplay.lives < 0;
  }

  handleEatPellet(position) {
    let scoreValue = 0;
    if (this.mazeManager.hasPellet(position.x, position.y)) {
      scoreValue = this.gameStateDisplay.pelletScore;
    } else if (this.mazeManager.hasPowerPellet(position.x, position.y)) {
      scoreValue = this.gameStateDisplay.powerPelletScore;
      this.ghostManager.frighten();
    }

    if (scoreValue > 0) {
      this.mazeManager.clearPellet(position.x, position.y);
      this.pelletManager.pelletCount--;
      this.gameStateDisplay.updateScore(scoreValue);
    }

    this.checkGameOver();
  }

  createGhosts() {
    return [
      new Ghost(
        "blinky",
        this.gameCtx,
        this.mazeManager,
        cellSize,
        [
          this.images["blinky"],
          this.images["frightened_blue"],
          this.images["frightened_white"],
        ],
        {
          position: { x: 10, y: 8 },
        }
      ),
      new Ghost(
        "inky",
        this.gameCtx,
        this.mazeManager,
        cellSize,
        [
          this.images["inky"],
          this.images["frightened_blue"],
          this.images["frightened_white"],
        ],
        {
          position: { x: 9, y: 11 },
        }
      ),
      new Ghost(
        "pinky",
        this.gameCtx,
        this.mazeManager,
        cellSize,
        [
          this.images["pinky"],
          this.images["frightened_blue"],
          this.images["frightened_white"],
        ],
        {
          position: { x: 10, y: 11 },
        }
      ),
      new Ghost(
        "clyde",
        this.gameCtx,
        this.mazeManager,
        cellSize,
        [
          this.images["clyde"],
          this.images["frightened_blue"],
          this.images["frightened_white"],
        ],
        {
          position: { x: 11, y: 11 },
        }
      ),
    ];
  }

  checkCollisionWithGhosts() {
    if (this.collisionCooldown > 0) {
      this.collisionCooldown--;
      return;
    }
    const tolerance = cellSize / 2;
    this.ghosts.forEach((ghost) => {
      if (
        Math.abs(this.pacman.position.x - ghost.position.x) < tolerance &&
        Math.abs(this.pacman.position.y - ghost.position.y) < tolerance
      ) {
        this.handleCollisionWithGhost(ghost);
        this.collisionCooldown = 60;
      }
    });
  }

  handleCollisionWithGhost(ghost) {
    switch (ghost.mode) {
      case "random":
      case "chase":
        this.gameStateDisplay.decrementLives();
        this.pacman.reset();
        this.ghosts.forEach((ghost) => ghost.reset());
        break;
      case "frighten":
        ghost.reset();
        break;
    }
  }

  displayGameOver() {
    this.gameCtx.fillStyle = "rgba(0, 0, 0, 0.5)";
    this.gameCtx.fillRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);

    const xPos = this.gameCanvas.width / 2;
    const yPos = this.gameCanvas.width / 2;

    this.gameCtx.fillStyle = "white";
    this.gameCtx.textAlign = "center";
    this.gameCtx.font = "24px 'Roboto Mono', monospace";
    this.gameCtx.fillText("Game Over", xPos, yPos);

    const buttonText = "Click to restart";
    this.gameCtx.font = "18px 'Roboto Mono', monospace";
    this.gameCtx.fillText(buttonText, xPos, yPos + 50);
    const buttonX = xPos - this.gameCtx.measureText(buttonText).width / 2;
    const buttonY = yPos + 50 - 18;
    const buttonWidth = this.gameCtx.measureText(buttonText).width;
    const buttonHeight = 24;

    this.clickListener = (event) => {
      const rect = this.gameCanvas.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const clickY = event.clientY - rect.top;
      const isInsideButton =
        clickX >= buttonX &&
        clickX <= buttonX + buttonWidth &&
        clickY >= buttonY &&
        clickY <= buttonY + buttonHeight;

      if (isInsideButton) {
        this.restartGame();
      }
    };

    this.mouseMoveListener = (event) => {
      const rect = this.gameCanvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      const isInsideButton =
        mouseX >= buttonX &&
        mouseX <= buttonX + buttonWidth &&
        mouseY >= buttonY &&
        mouseY <= buttonY + buttonHeight;

      this.gameCanvas.style.cursor = isInsideButton ? "pointer" : "default";
    };

    this.gameCanvas.addEventListener("click", this.clickListener);
    this.gameCanvas.addEventListener("mousemove", this.mouseMoveListener);
  }

  bindEvents() {
    window.addEventListener("keydown", this.handleKeyDown.bind(this));
  }

  handleKeyDown(event) {
    switch (event.key) {
      case "ArrowLeft":
        this.pacman.nextDirection = "LEFT";
        event.preventDefault();
        break;
      case "ArrowRight":
        this.pacman.nextDirection = "RIGHT";
        event.preventDefault();
        break;
      case "ArrowUp":
        this.pacman.nextDirection = "UP";
        event.preventDefault();
        break;
      case "ArrowDown":
        this.pacman.nextDirection = "DOWN";
        event.preventDefault();
        break;
      case "r":
      case "R":
        this.restartGame();
        break;
      default:
        break;
    }
  }
}

new Game();
