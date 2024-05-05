class Ghost {
  static directions = [
    { dx: -1, dy: 0 }, // Left
    { dx: 1, dy: 0 }, // Right
    { dx: 0, dy: -1 }, // Up
    { dx: 0, dy: 1 }, // Down
  ];

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
    this.position = {
      x: position.x * this.cellSize,
      y: position.y * this.cellSize,
    }; // Convert grid coordinates to pixel coordinates
    this.lastDirection = Ghost.directions[2];

    this.mode = mode;
    this.velocity = velocity;
  }

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

  move() {
    switch (this.mode) {
      case "random":
        this.chooseRandomDirection();
        break;
      default:
        break;
    }
  }

  chooseRandomDirection() {
    let gameWidth = this.mazeManager.getMazeWidth() * this.cellSize;

    let validMoves = Ghost.directions
      .map((dir) => ({
        dx: dir.dx * this.velocity,
        dy: dir.dy * this.velocity,
        newX:
          (this.position.x + dir.dx * this.velocity + gameWidth) % gameWidth,
        newY: this.position.y + dir.dy * this.velocity,
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
  constructor(ghosts) {
    this.ghosts = ghosts;
  }

  update() {
    this.ghosts.forEach((ghost) => ghost.move());
    this.ghosts.forEach((ghost) => ghost.draw());
  }

  draw() {
    this.ghosts.forEach((ghost) => ghost.draw());
  }
}

export { Ghost, GhostManager };
