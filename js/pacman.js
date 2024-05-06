export class Pacman {
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
   * Set the Pac-Man's properties to initial values. Used to restart game.
   */
  reset() {
    this.position = { ...this.initialPosition };
    this.direction = "RIGHT";
    this.nextDirection = "RIGHT";
    this.animationFrame = 0;
    this.currentImageIndex = 0;
    this.currentImage = this.images[0];
  }

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

  animateMouth() {
    let numFramesChangeMouth = 8;
    this.animationFrame++;
    if (this.animationFrame % numFramesChangeMouth === 0) {
      this.currentImageIndex =
        (this.currentImageIndex + 1) % this.images.length;
      this.currentImage = this.images[this.currentImageIndex];
    }
  }

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

  moveForwards() {
    let change = this.directionMap[this.direction];
    let gameWidth = this.mazeManager.getMazeWidth() * this.cellSize;
    this.position.x =
      (this.position.x + change.x * this.velocity + gameWidth) % gameWidth;
    this.position.y += change.y * this.velocity;
  }

  moveBackwards() {
    let change = this.directionMap[this.direction];
    let gameWidth = this.mazeManager.getMazeWidth() * this.cellSize;
    this.position.x =
      (this.position.x - change.x * this.velocity + gameWidth) % gameWidth;
    this.position.y -= change.y * this.velocity;
  }

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

  checkEatPellet() {
    let gridX = Math.floor((this.position.x + this.radius) / this.cellSize);
    let gridY = Math.floor((this.position.y + this.radius) / this.cellSize);
    this.onEatPellet({ x: gridX, y: gridY });
  }
}
