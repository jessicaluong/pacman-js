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
    image,
    { position },
    mode = "random",
    velocity = 2.0
  ) {
    this.name = name;
    this.ctx = ctx;
    this.mazeManager = mazeManager;
    this.cellSize = cellSize;
    this.image = image;

    this.initialPosition = {
      x: position.x * this.cellSize,
      y: position.y * this.cellSize,
    }; // Convert grid coordinates to pixel coordinates
    this.position = { ...this.initialPosition };

    this.mode = mode;
    this.velocity = velocity;
    this.directions = [
      { dx: -1 * this.velocity, dy: 0 }, // Left
      { dx: 1 * this.velocity, dy: 0 }, // Right
      { dx: 0, dy: -1 * this.velocity }, // Up
      { dx: 0, dy: 1 * this.velocity }, // Down
    ];
    this.lastDirection = {};
  }

  /**
   * Resets ghost's state to its initial configuration.
   * This method is invoked when the game restarts or when Pac-Man loses a life.
   */
  reset() {
    this.position = { ...this.initialPosition };
    this.mode = "random";
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
      this.image,
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
  move() {
    switch (this.mode) {
      case "random":
        this.chooseRandomDirection();
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
}

class GhostManager {
  /**
   * Manages multiple ghost instances, updating and drawing each ghost.
   * @param {Ghost[]} ghosts - An array of Ghost instances to manage.
   */
  constructor(ghosts) {
    this.ghosts = ghosts;
  }

  /**
   * Calls the move and draw methods on each ghost in the list.
   */
  update() {
    this.ghosts.forEach((ghost) => ghost.move());
    this.ghosts.forEach((ghost) => ghost.draw());
  }

  /**
   * Draws each ghost on the canvas.
   * Used to to draw the initial game state.
   */
  draw() {
    this.ghosts.forEach((ghost) => ghost.draw());
  }
}

export { Ghost, GhostManager };
