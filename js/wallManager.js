export class WallManager {
  static borderThickness = 3;
  static borderColor = "teal";

  constructor(ctx, mazeManager, cellSize) {
    this.ctx = ctx;
    this.mazeManager = mazeManager;
    this.width = cellSize;
    this.height = cellSize;
  }

  drawTopBorder(x, y) {
    this.ctx.beginPath();
    this.ctx.moveTo(x * this.width, y * this.height);
    this.ctx.lineTo((x + 1) * this.width, y * this.height);
    this.ctx.stroke();
  }

  drawBottomBorder(x, y) {
    this.ctx.beginPath();
    this.ctx.moveTo(x * this.width, (y + 1) * this.height);
    this.ctx.lineTo((x + 1) * this.width, (y + 1) * this.height);
    this.ctx.stroke();
  }

  drawLeftBorder(x, y) {
    this.ctx.beginPath();
    this.ctx.moveTo(x * this.width, y * this.height);
    this.ctx.lineTo(x * this.width, (y + 1) * this.height);
    this.ctx.stroke();
  }

  drawRightBorder(x, y) {
    this.ctx.beginPath();
    this.ctx.moveTo((x + 1) * this.width, y * this.height);
    this.ctx.lineTo((x + 1) * this.width, (y + 1) * this.height);
    this.ctx.stroke();
  }

  drawGhostLairDoor(x, y) {
    this.ctx.fillStyle = "white";
    this.ctx.fillRect(
      x * this.width,
      y * this.height + this.height / 3,
      this.width,
      this.height / 3
    );
  }

  draw() {
    this.ctx.lineWidth = WallManager.borderThickness;
    this.ctx.strokeStyle = WallManager.borderColor;

    for (let row = 0; row < this.mazeManager.getMazeHeight(); row++) {
      for (let col = 0; col < this.mazeManager.getMazeWidth(); col++) {
        if (this.mazeManager.hasWall(col, row)) {
          const hasWallAbove =
            row > 0 && this.mazeManager.hasWall(col, row - 1);
          const hasWallBelow =
            row < this.mazeManager.getMazeHeight() - 1 &&
            this.mazeManager.hasWall(col, row + 1);
          const hasWallLeft = col > 0 && this.mazeManager.hasWall(col - 1, row);
          const hasWallRight =
            col < this.mazeManager.getMazeWidth() - 1 &&
            this.mazeManager.hasWall(col + 1, row);

          if (!hasWallAbove) this.drawTopBorder(col, row);
          if (!hasWallBelow) this.drawBottomBorder(col, row);
          if (!hasWallLeft) this.drawLeftBorder(col, row);
          if (!hasWallRight) this.drawRightBorder(col, row);
        } else if (this.mazeManager.hasGhostLairDoor(col, row)) {
          this.drawGhostLairDoor(col, row);
        }
      }
    }
  }
}
