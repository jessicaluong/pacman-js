import { cellSize, loadImages, setupGameEnvironment } from "./setup.js";
import { Pacman } from "./pacman.js";
import { Ghost, GhostManager } from "./ghosts.js";

export class Game {
  /**
   * Constructs the Game class instance, initializes the game environment, and loads necessary images.
   * Sets up the game context, canvas, and game managers for pellets, mazes, and game state.
   */
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
    this.collisionCooldown = 0;
    this.lastUpdateTime = null;

    this.restartGameBound = this.restartGame.bind(this);

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

  /**
   * Initializes the game components including Pacman, ghosts, and managers for ghosts and pellets.
   * Resets all game state managers and draws the initial game state, then sets a delay before starting the game.
   */
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

  /**
   * Clears the game canvas and redraws the initial state of the game, including pellets, Pacman, and ghosts.
   * This method is typically called at the beginning of the game or after a game reset.
   */
  drawInitialGameState() {
    this.gameCtx.clearRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
    this.pelletManager.draw();
    this.pacman.draw();
    this.ghostManager.draw();
  }

  /**
   * Starts the game loop by cancelling any previous animation frames and resetting the last update time.
   * This prepares the game for running by initiating the animation cycle.
   */
  startGame() {
    cancelAnimationFrame(this.requestId);
    this.lastUpdateTime = null;
    this.gameLoop();
  }

  /**
   * Continuously updates the game state by calling the update method at the refresh rate of the browser.
   * This is the core game loop that drives updates to the game logic and rendering.
   */
  gameLoop() {
    this.requestId = requestAnimationFrame(this.update.bind(this));
  }

  /**
   * The primary update loop for the game, called by requestAnimationFrame.
   * Handles all dynamic game elements, including drawing the game state, updating game components,
   * checking collisions, and transitioning to the game over state if necessary.
   * @param {number} timestamp - The timestamp of the current frame provided by requestAnimationFrame.
   */
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

    if (
      this.pelletManager.pelletCount === 0 ||
      this.gameStateDisplay.lives < 0
    ) {
      cancelAnimationFrame(this.requestId);
      this.gameStateDisplay.displayGameOver();
      this.gameCanvas.addEventListener("restartGame", this.restartGameBound);
    } else {
      this.requestId = requestAnimationFrame(this.update.bind(this));
    }
  }

  /**
   * Resets the game state to its initial configuration, including all game entities and settings.
   * This method is called after a game over.
   */
  restartGame() {
    cancelAnimationFrame(this.requestId);
    this.gameCanvas.removeEventListener("restartGame", this.restartGameBound);

    this.pacman.reset();
    this.ghosts.forEach((ghost) => ghost.reset());

    this.mazeManager.resetMaze();
    this.pelletManager.reset();
    this.gameStateDisplay.reset();

    this.drawInitialGameState();

    setTimeout(() => this.startGame(), 2000);
  }

  /**
   * Updates the stored position of Pacman within the game.
   * This method helps in tracking and providing a centralized point of reference for Pacman's position,
   * and is used by ghosts to determine path to Pacman.
   * @param {number} x - The x-coordinate of Pacman's position.
   * @param {number} y - The y-coordinate of Pacman's position.
   */
  updatePacmanPosition(x, y) {
    this.pacmanPosition = { x, y };
  }

  /**
   * Handles the logic for when Pacman eats a pellet or power pellet, updating the score,
   * decreasing the pellet count, and potentially triggering frighten mode for the ghosts.
   * @param {Object} position - The grid position where Pacman eats a pellet, containing x and y coordinates.
   */
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
  }

  /**
   * Creates and returns an array of Ghost instances for the game.
   * Each ghost is initialized with its unique characteristics and images for different modes.
   * @returns {Ghost[]} Array of initialized Ghost objects.
   */
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

  /**
   * Checks for collisions between Pacman and any ghost.
   * If a collision is detected and not in cooldown, handles the collision based on the ghost's current mode.
   */
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

  /**
   * Handles the collision between Pacman and a ghost based on the ghost's mode.
   * If the ghost is in frighten mode, it resets; otherwise, it decrements Pacman's lives.
   * @param {Ghost} ghost - The ghost with which Pacman has collided.
   */
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

  /**
   * Sets up key bindings for moving Pacman.
   */
  bindEvents() {
    window.addEventListener("keydown", this.handleKeyDown.bind(this));
  }

  /**
   * Handles key down events to control Pacman's movement.
   * Prevents default behavior for arrow keys to avoid scrolling the page.
   * @param {KeyboardEvent} event - The keydown event object.
   */
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
      default:
        break;
    }
  }
}

new Game();
