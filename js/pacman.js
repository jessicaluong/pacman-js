export class Pacman {
  /**
   * Constructs a new instance of the Pacman class.
   * @param {CanvasRenderingContext2D} ctx - The canvas rendering context to draw Pac-Man.
   * @param {MazeManager} mazeManager - The maze manager that handles maze logic like wall positions.
   * @param {number} cellSize - The size of each cell in the maze, which dictates the scale of the game elements.
   * @param {{position: {x: number, y: number}}} initialPosition - The initial grid position of Pac-Man, provided as an object.
   * @param {function} onEatPellet - Callback function that is triggered when Pac-Man eats a pellet.
   * @param {HTMLImageElement[]} images - An array of images used for animating Pac-Man's mouth movement.
   * @param {number} [velocity=2.0] - The movement speed of Pac-Man, defaulting to 2.0.
   */
  constructor(
    ctx,
    mazeManager,
    cellSize,
    { position },
    onEatPellet,
    images,
    velocity = 2.0
  ) {
    this.ctx = ctx;
    this.mazeManager = mazeManager;
    this.cellSize = cellSize;
    this.radius = this.cellSize / 2;
    this.onEatPellet = onEatPellet;
    this.velocity = velocity;
    this.images = images;

    this.initialPosition = {
      x: position.x * this.cellSize,
      y: position.y * this.cellSize,
    }; // Convert grid coordinates to pixel coordinates
    this.position = { ...this.initialPosition };

    this.direction = "RIGHT";
    this.nextDirection = "RIGHT";
    this.directionMap = {
      LEFT: { x: -1, y: 0 },
      RIGHT: { x: 1, y: 0 },
      UP: { x: 0, y: -1 },
      DOWN: { x: 0, y: 1 },
    };

    this.animationFrame = 0;
    this.currentImageIndex = 0;
    this.currentImage = this.images[0];
  }

  /**
   * Resets Pac-Man's state to its initial configuration.
   * This method is invoked when the game restarts or when Pac-Man loses a life.
   */
  reset() {
    this.position = { ...this.initialPosition };
    this.direction = "RIGHT";
    this.nextDirection = "RIGHT";
    this.animationFrame = 0;
    this.currentImageIndex = 0;
    this.currentImage = this.images[0];
  }

  /**
   * Draws Pac-Man on the canvas at its current position.
   * The image is transformed to face towards the direction Pac-Man is moving.
   */
  draw() {
    this.ctx.save();

    this.ctx.translate(
      this.position.x + this.radius,
      this.position.y + this.radius
    );

    switch (this.direction) {
      case "LEFT":
        this.ctx.rotate(Math.PI); // 180 degrees
        break;
      case "UP":
        this.ctx.rotate(-Math.PI / 2); // -90 degrees
        break;
      case "DOWN":
        this.ctx.rotate(Math.PI / 2); // 90 degrees
        break;
      // RIGHT is the default direction, no rotation needed
    }

    let img = this.currentImage;
    this.ctx.drawImage(
      img,
      -this.cellSize / 2,
      -this.cellSize / 2,
      this.cellSize,
      this.cellSize
    );

    this.ctx.restore();
  }

  /**
   * Animates Pac-Man's mouth by cycling through a sequence of images.
   * The animation frame counter increments each call, and the image is updated every eight frames.
   */
  animateMouth() {
    let numFramesChangeMouth = 8;
    this.animationFrame++;
    if (this.animationFrame % numFramesChangeMouth === 0) {
      this.currentImageIndex =
        (this.currentImageIndex + 1) % this.images.length;
      this.currentImage = this.images[this.currentImageIndex];
    }
  }

  /**
   * Updates Pac-Man's state by executing various actions:
   * - Attempts to change direction if a new valid direction is set.
   * - Moves Pac-Man forward.
   * - Handles collisions by moving backwards if a wall is hit.
   * - Checks and handles pellet consumption.
   * - Animates Pac-Man's mouth.
   * - Redraws Pac-Man on the canvas.
   */
  update() {
    this.changeDirectionIfPossible();
    this.moveForwards();
    if (this.isCollideWithWall()) {
      this.moveBackwards();
    }
    this.checkEatPellet();
    this.animateMouth();
    this.draw();
  }

  /**
   * Attempts to change Pac-Man's direction to the next indicated direction.
   * If the new direction results in a collision with a wall, it reverts to the original direction and position.
   * @returns void
   */
  changeDirectionIfPossible() {
    if (this.direction === this.nextDirection) {
      return;
    }
    let originalDirection = this.direction;
    let originalPosition = { ...this.position };
    this.direction = this.nextDirection;

    this.moveForwards();
    if (this.isCollideWithWall()) {
      this.position = originalPosition;
      this.direction = originalDirection;
    }
  }

  /**
   * Moves Pac-Man forward based on his current direction and velocity.
   * Updates his position on the canvas, and wraps around horizontally if he exceeds the game area's width.
   */
  moveForwards() {
    let change = this.directionMap[this.direction];
    let gameWidth = this.mazeManager.getMazeWidth() * this.cellSize;
    this.position.x =
      (this.position.x + change.x * this.velocity + gameWidth) % gameWidth;
    this.position.y += change.y * this.velocity;
  }

  /**
   * Moves Pac-Man backwards when a collision occurs.
   * This method reverses the movement made by `moveForwards` and also handles horizontal wrapping.
   */
  moveBackwards() {
    let change = this.directionMap[this.direction];
    let gameWidth = this.mazeManager.getMazeWidth() * this.cellSize;
    this.position.x =
      (this.position.x - change.x * this.velocity + gameWidth) % gameWidth;
    this.position.y -= change.y * this.velocity;
  }

  /**
   * Determines if Pac-Man's current position results in a collision with a wall.
   * It checks all four corners of Pac-Man's bounding box against the maze to see if they lie in a non-walkable cell.
   * @returns {boolean} True if there is a collision; otherwise, false.
   */
  isCollideWithWall() {
    let positionsToCheck = [
      { x: this.position.x, y: this.position.y }, // Top-left corner
      { x: this.position.x + this.cellSize - 1, y: this.position.y }, // Top-right corner
      { x: this.position.x, y: this.position.y + this.cellSize - 1 }, // Bottom-left corner
      {
        x: this.position.x + this.cellSize - 1,
        y: this.position.y + this.cellSize - 1,
      }, // Bottom-right corner
    ];

    return positionsToCheck.some((pos) => {
      let col = Math.floor(pos.x / this.cellSize);
      let row = Math.floor(pos.y / this.cellSize);
      return !this.mazeManager.isWalkable(col, row);
    });
  }

  /**
   * Checks if Pac-Man is positioned to eat a pellet based on his center coordinates.
   * Triggers the pellet consumption process if he is on a pellet.
   */
  checkEatPellet() {
    let gridX = Math.floor((this.position.x + this.radius) / this.cellSize);
    let gridY = Math.floor((this.position.y + this.radius) / this.cellSize);
    this.onEatPellet({ x: gridX, y: gridY });
  }
}
