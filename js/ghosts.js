class Ghost {
  /**
   * Constructs a new instance of the Ghost class.
   * @param {string} name - The name of the ghost.
   * @param {CanvasRenderingContext2D} ctx - The canvas rendering context to draw the ghost.
   * @param {MazeManager} mazeManager - The maze manager that handles maze logic like wall positions.
   * @param {number} cellSize - The size of each cell in the maze, which dictates the scale of the game elements.
   * @param {HTMLImageElement} image - The image representing the ghost.
   * @param {{position: {x: number, y: number}}} initialPosition - The initial grid position of the ghost, provided as an object.
   * @param {string} [mode='random'] - The behavior mode of the ghost, defaults to 'random'.
   * @param {number} [velocity=2.0] - The movement speed of the ghost, defaulting to 2.0.
   */
  constructor(
    name,
    ctx,
    mazeManager,
    cellSize,
    images,
    { position },
    velocity = 2.0
  ) {
    this.name = name;
    this.ctx = ctx;
    this.mazeManager = mazeManager;
    this.cellSize = cellSize;
    this.images = images;
    this.currentImage = this.images[0];

    this.initialPosition = {
      x: position.x * this.cellSize,
      y: position.y * this.cellSize,
    }; // Convert grid coordinates to pixel coordinates
    this.position = { ...this.initialPosition };

    this.mode = "random";
    this.velocity = velocity;
    this.directions = [
      { dx: -1 * this.velocity, dy: 0 }, // Left
      { dx: 1 * this.velocity, dy: 0 }, // Right
      { dx: 0, dy: -1 * this.velocity }, // Up
      { dx: 0, dy: 1 * this.velocity }, // Down
    ];
    this.lastDirection = {};

    this.frightenedTimer = null;
    this.blinkTimer = null;
    this.frightenedDuration = 10000; // 10 seconds
    this.blinkDuration = 2000; //  2 seconds
    this.blinkInterval = 300; // Blink every 300 ms

    this.setupPathfindingGrid();
  }

  /**
   * Activates the frighten mode, changing the ghost's appearance and behavior.
   * Starts a timer that will initiate blinking near the end of the frighten duration.
   */
  frighten() {
    this.mode = "frighten";
    this.currentImage = this.images[1];

    if (this.frightenedTimer) {
      clearTimeout(this.frightenedTimer);
    }

    if (this.blinkTimer) {
      clearInterval(this.blinkTimer);
      this.blinkTimer = null;
    }

    this.frightenedTimer = setTimeout(() => {
      this.startBlinking();
    }, this.frightenedDuration - this.blinkDuration);
  }

  /**
   * Starts the blinking effect during frighten mode by toggling between two images.
   * Sets a timer to end frighten mode after the specified blink duration.
   */
  startBlinking() {
    if (this.blinkTimer) {
      clearInterval(this.blinkTimer);
    }

    this.blinkTimer = setInterval(() => {
      this.currentImage =
        this.currentImage === this.images[1] ? this.images[2] : this.images[1];
    }, this.blinkInterval);

    setTimeout(() => {
      this.endFrighten();
    }, this.blinkDuration);
  }

  /**
   * Ends the frighten mode by stopping the blinking effect and resetting the ghost's mode to random.
   * Resets the ghost's image to the default state and clears any related timers.
   */
  endFrighten() {
    if (this.blinkTimer) {
      clearInterval(this.blinkTimer);
      this.blinkTimer = null;
    }
    if (this.frightenedTimer) {
      clearTimeout(this.frightenedTimer);
      this.frightenedTimer = null;
    }

    this.mode = "random";
    this.currentImage = this.images[0];
    this.frightenedTimer = null;
    this.lastDirection = { dx: 0, dy: 0 };
  }

  /**
   * Resets ghost's state to its initial configuration.
   * This method is invoked when the game restarts or when Pac-Man loses a life.
   */
  reset() {
    if (this.blinkTimer) {
      clearInterval(this.blinkTimer);
      this.blinkTimer = null;
    }
    if (this.frightenedTimer) {
      clearTimeout(this.frightenedTimer);
      this.frightenedTimer = null;
    }
    this.position = { ...this.initialPosition };
    this.mode = "random";
    this.currentImage = this.images[0];
    this.lastDirection = { dx: 0, dy: 0 };
  }

  /**
   * Draws the ghost on the canvas at its current position.
   * The image is flipped horizontally when the ghost moves to the left to maintain correct orientation.
   */
  draw() {
    this.ctx.save();

    // Transform image if ghost is moving left
    if (this.lastDirection.dx === -1 * this.velocity) {
      this.ctx.scale(-1, 1);
      this.ctx.translate(-2 * (this.position.x + this.cellSize / 2), 0);
    }

    this.ctx.drawImage(
      this.currentImage,
      this.position.x,
      this.position.y,
      this.cellSize,
      this.cellSize
    );

    this.ctx.restore();
  }

  /**
   * Determines if moving the ghost to a new position results in a collision with a wall.
   * @param {number} newX - The new x-coordinate after moving.
   * @param {number} newY - The new y-coordinate after moving.
   * @returns {boolean} - Returns true if the new position would collide with a wall, otherwise false.
   */
  isCollideWithWall(newX, newY) {
    let positionsToCheck = [
      { x: newX, y: newY }, // Top-left corner
      { x: newX + this.cellSize - 1, y: newY }, // Top-right corner
      { x: newX, y: newY + this.cellSize - 1 }, // Bottom-left corner
      { x: newX + this.cellSize - 1, y: newY + this.cellSize - 1 }, // Bottom-right corner
    ];

    return positionsToCheck.some((pos) => {
      let col = Math.floor(pos.x / this.cellSize);
      let row = Math.floor(pos.y / this.cellSize);
      return (
        this.mazeManager.hasWall(col, row) ||
        this.mazeManager.hasInvisibleWall(col, row)
      );
    });
  }

  /**
   * Updates the ghost's position based on its mode.
   * In 'random' mode, the ghost chooses a new direction randomly from the available valid moves.
   */
  move(pacmanPosition) {
    switch (this.mode) {
      case "random":
      case "frighten":
        this.chooseRandomDirection();
        break;
      case "chase":
        this.chooseDirectionUsingAStar(pacmanPosition.x, pacmanPosition.y);
        break;
      default:
        break;
    }
  }

  /**
   * Chooses a random direction for the ghost to move, ensuring it doesn't immediately reverse direction or hit walls.
   */
  chooseRandomDirection() {
    let gameWidth = this.mazeManager.getMazeWidth() * this.cellSize;

    let validMoves = this.directions
      .map((dir) => ({
        dx: dir.dx,
        dy: dir.dy,
        newX: (this.position.x + dir.dx + gameWidth) % gameWidth,
        newY: this.position.y + dir.dy,
      }))
      .filter((dir) => !this.isCollideWithWall(dir.newX, dir.newY));

    if (validMoves.length > 1) {
      validMoves = validMoves.filter(
        (dir) =>
          !(
            dir.dx === -this.lastDirection.dx &&
            dir.dy === -this.lastDirection.dy
          )
      );
    }

    if (validMoves.length > 0) {
      const move = validMoves[Math.floor(Math.random() * validMoves.length)];
      this.position.x = move.newX;
      this.position.y = move.newY;
      this.lastDirection = { dx: move.dx, dy: move.dy };
    }
  }

  /**
   * Sets up the pathfinding grid based on the current maze configuration.
   * Converts the maze structure into a grid for the A* pathfinding algorithm.
   */
  setupPathfindingGrid() {
    this.grid = new window.PF.Grid(
      this.mazeManager
        .getMaze()
        .map((row) => row.map((cell) => (cell === 1 ? 1 : 0)))
    );
    this.finder = new window.PF.AStarFinder();
  }

  /**
   * Converts the ghost's continuous position to a grid index, adjusting based on the direction of movement.
   * @param {number} pos - The position to be converted.
   * @param {number} cellSize - The size of each cell in the grid.
   * @param {Object} direction - The current direction of movement.
   * @returns {number} The converted grid position.
   */
  toGridPosition(pos, cellSize, direction) {
    if (
      (direction.dx === 1 * this.velocity && direction.dy === 0) ||
      (direction.dx === 0 && direction.dy === 1 * this.velocity)
    ) {
      return Math.floor(pos / cellSize);
    } else {
      return Math.ceil(pos / cellSize);
    }
  }

  /**
   * Determines the direction to move using the A* pathfinding algorithm based on the target position.
   * @param {number} targetX - The x-coordinate of the target.
   * @param {number} targetY - The y-coordinate of the target.
   */
  chooseDirectionUsingAStar(targetX, targetY) {
    const directionX =
      targetX > this.position.x
        ? { dx: 1 * this.velocity, dy: 0 }
        : { dx: -1 * this.velocity, dy: 0 };
    const directionY =
      targetY > this.position.y
        ? { dx: 0, dy: 1 * this.velocity }
        : { dx: 0, dy: -1 * this.velocity };

    const startCol = this.toGridPosition(
      this.position.x,
      this.cellSize,
      directionX
    );
    const startRow = this.toGridPosition(
      this.position.y,
      this.cellSize,
      directionY
    );
    const endCol = this.toGridPosition(targetX, this.cellSize, directionX);
    const endRow = this.toGridPosition(targetY, this.cellSize, directionY);

    const gridClone = this.grid.clone();
    const path = this.finder.findPath(
      startCol,
      startRow,
      endCol,
      endRow,
      gridClone
    );

    if (path.length > 1) {
      const nextStep = path[1];
      this.updatePositionBasedOnPath(nextStep);
    }
  }

  /**
   * Updates the ghost's position based on the next step in the calculated path.
   * Adjusts the position smoothly and updates the direction of movement.
   * @param {Array} nextStep - The next step coordinates from the pathfinding result.
   */
  updatePositionBasedOnPath(nextStep) {
    let newX = nextStep[0] * this.cellSize;
    let newY = nextStep[1] * this.cellSize;

    if (newX < this.position.x) {
      this.position.x = Math.max(this.position.x - this.velocity, newX);
      this.lastDirection.dx = -1 * this.velocity;
    } else if (newX > this.position.x) {
      this.position.x = Math.min(this.position.x + this.velocity, newX);
      this.lastDirection.dx = 1 * this.velocity;
    }

    if (newY < this.position.y) {
      this.position.y = Math.max(this.position.y - this.velocity, newY);
      this.lastDirection.dy = -1 * this.velocity;
    } else if (newY > this.position.y) {
      this.position.y = Math.min(this.position.y + this.velocity, newY);
      this.lastDirection.dy = 1 * this.velocity;
    }
  }
}

class GhostManager {
  /**
   * Manages multiple ghost instances, updating and drawing each ghost.
   * @param {Ghost[]} ghosts - An array of Ghost instances to manage.
   */
  constructor(ghosts) {
    this.ghosts = ghosts;
    this.mode = "random";
    this.modeDuration = 0;
    this.chaseDuration = 3000; // 3 seconds
    this.randomDuration = 7000; // 7 seconds
  }

  /**
   * Calls the move and draw methods on each ghost in the list.
   * @param {Object} pacmanPosition - The current position of Pac-Man.
   * @param {number} deltaTime - Time elapsed since the last update call.
   */
  update(pacmanPosition, deltaTime) {
    const anyFrightened = this.ghosts.some(
      (ghost) => ghost.mode === "frighten"
    );

    this.modeDuration += deltaTime;
    if (!anyFrightened) {
      if (this.mode === "chase" && this.modeDuration >= this.chaseDuration) {
        this.setMode("random");
        this.modeDuration = 0;
      } else if (
        this.mode === "random" &&
        this.modeDuration >= this.randomDuration
      ) {
        this.setMode("chase");
        this.modeDuration = 0;
      }
    }

    this.ghosts.forEach((ghost) => {
      ghost.move(pacmanPosition);
      ghost.draw();
    });
  }

  /**
   * Draws each ghost on the canvas.
   * Used to to draw the initial game state.
   */
  draw() {
    this.ghosts.forEach((ghost) => ghost.draw());
  }

  /**
   * Sets the mode for all ghosts.
   * @param {string} mode - New mode for all ghosts.
   */
  setMode(mode) {
    this.mode = mode;
    this.ghosts.forEach((ghost) => (ghost.mode = mode));
  }

  /**
   * Activates frighten mode for all ghosts.
   */
  frighten() {
    this.ghosts.forEach((ghost) => ghost.frighten());
  }
}

export { Ghost, GhostManager };
